import { env } from "cloudflare:workers";

export type InquiryKind = "property" | "contact" | "valuation";

export type InquiryEmailPayload = {
  leadId: number;
  kind: InquiryKind;
  agencyName: string;
  recipients: string[];
  name: string;
  email: string;
  phone: string;
  message: string;
  context: Record<string, string>;
  sourceUrl: string;
};

type MailEnvironment = {
  LEADS_EMAIL_ENDPOINT?: string;
  LEADS_EMAIL_TOKEN?: string;
};

export async function deliverInquiryEmail(payload: InquiryEmailPayload) {
  const mailEnvironment = env as unknown as MailEnvironment;
  const endpoint = mailEnvironment.LEADS_EMAIL_ENDPOINT?.trim() || "https://ideamos.ar/api/inmobiliaria-consultas.php";
  const token = mailEnvironment.LEADS_EMAIL_TOKEN?.trim();
  if (!token) throw new Error("El servicio de correo no esta configurado.");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${token}`,
      "x-ideamos-token": token,
      "content-type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
  });

  const result = await response.json().catch(() => null) as { ok?: boolean; error?: string; message?: string } | null;
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || result?.message || `El servicio de correo respondio ${response.status}.`);
  }
}
