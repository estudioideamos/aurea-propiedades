import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { ensureDatabaseSchema } from "../db/ensure-schema";
import { leads, siteSettings } from "../db/schema";
import { deliverInquiryEmail, type InquiryKind } from "./email-delivery";

export type LeadPayload = {
  propertyId?: number;
  kind?: InquiryKind;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  context?: Record<string, unknown>;
  sourceUrl?: string;
  website?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedKinds = new Set<InquiryKind>(["property", "contact", "valuation"]);

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanContext(value: LeadPayload["context"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 24)
      .map(([key, entry]) => [clean(key, 60), clean(entry, 700)])
      .filter(([key, entry]) => key && entry),
  );
}

function contextSummary(context: Record<string, string>) {
  return Object.entries(context)
    .map(([key, value]) => `${key.replace(/([a-z])([A-Z])/g, "$1 $2")}: ${value}`)
    .join(" · ");
}

function parseRecipients(value: string, fallback: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [fallback];
    const recipients = parsed.map(item => clean(item, 254).toLowerCase()).filter(email => emailPattern.test(email));
    return recipients.length ? [...new Set(recipients)].slice(0, 5) : [fallback];
  } catch {
    return [fallback];
  }
}

export async function handleLeadPayload(request: Request, payload: LeadPayload) {
  try {
    await ensureDatabaseSchema();
    if (payload.website) return Response.json({ ok: true }, { status: 201 });

    const kind = allowedKinds.has(payload.kind ?? "property") ? (payload.kind ?? "property") : "property";
    const name = clean(payload.name, 120);
    const email = clean(payload.email, 254).toLowerCase();
    const phone = clean(payload.phone, 80);
    const message = clean(payload.message, 5000);
    const sourceUrl = clean(payload.sourceUrl, 500);
    const context = cleanContext(payload.context);
    const propertyId = Number.isFinite(Number(payload.propertyId)) && Number(payload.propertyId) > 0 ? Number(payload.propertyId) : null;
    const details = contextSummary(context);
    const storedMessage = details ? `${message}\n\n${details}` : message;

    if (!name || !message || (!email && !phone)) {
      return Response.json({ error: "Complet\u00e1 tu nombre, un medio de contacto y el mensaje." }, { status: 400 });
    }
    if (email && !emailPattern.test(email)) {
      return Response.json({ error: "Ingres\u00e1 un email v\u00e1lido." }, { status: 400 });
    }

    const [created] = await getDb().insert(leads).values({
      propertyId,
      kind,
      name,
      email: email || null,
      phone: phone || null,
      message: storedMessage,
      context: JSON.stringify(context),
      emailStatus: "pending",
    }).returning({ id: leads.id });

    const [settings] = await getDb().select({
      agencyName: siteSettings.agencyName,
      contactEmail: siteSettings.contactEmail,
      contactRecipients: siteSettings.contactRecipients,
      valuationRecipients: siteSettings.valuationRecipients,
    }).from(siteSettings).limit(1);

    const fallbackEmail = settings?.contactEmail || "hola@ideamos.com.ar";
    const storedRecipients = kind === "valuation" ? settings?.valuationRecipients : settings?.contactRecipients;
    const recipients = parseRecipients(storedRecipients || "[]", fallbackEmail);

    try {
      await deliverInquiryEmail({
        leadId: created.id,
        kind,
        agencyName: settings?.agencyName || "Ideamos Propiedades",
        recipients,
        name,
        email,
        phone,
        message,
        context,
        sourceUrl,
      });
      await getDb().update(leads).set({ emailStatus: "sent", emailError: "" }).where(eq(leads.id, created.id));
      return Response.json({ ok: true, id: created.id, emailDelivered: true }, { status: 201 });
    } catch (mailError) {
      const emailError = mailError instanceof Error ? mailError.message.slice(0, 500) : "No se pudo entregar el correo.";
      await getDb().update(leads).set({ emailStatus: "failed", emailError }).where(eq(leads.id, created.id));
      return Response.json({ ok: true, id: created.id, emailDelivered: false }, { status: 202 });
    }
  } catch {
    return Response.json({ error: "No se pudo guardar la consulta. Intent\u00e1 nuevamente." }, { status: 500 });
  }
}
