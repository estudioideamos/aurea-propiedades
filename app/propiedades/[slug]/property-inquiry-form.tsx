"use client";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";

export function PropertyInquiryForm({ propertyId, propertyTitle }: { propertyId: number; propertyTitle: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending"); setError("");
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ propertyId, name: data.get("name"), phone: data.get("phone"), email: data.get("email"), message: data.get("message"), website: data.get("website") }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo enviar la consulta.");
      form.reset(); setState("sent");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo enviar la consulta."); setState("error"); }
  }

  if (state === "sent") return <div className="property-inquiry-success"><CheckCircle2/><h3>Consulta enviada.</h3><p>El equipo de Ideamos recibió tus datos y te contactará dentro de las próximas 24 horas hábiles.</p><button type="button" onClick={() => setState("idle")}>Enviar otra consulta</button></div>;

  return <form className="property-inquiry-form" onSubmit={submit}>
    <label><span>NOMBRE</span><input name="name" placeholder="Tu nombre" required/></label>
    <label><span>TELÉFONO</span><input name="phone" placeholder="+54 9 11"/></label>
    <label><span>EMAIL</span><input name="email" placeholder="nombre@email.com" type="email"/></label>
    <label><span>MENSAJE</span><textarea name="message" defaultValue={`Hola, me interesa ${propertyTitle}.`} required/></label>
    <input className="inquiry-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    {error && <p className="property-inquiry-error" role="alert">{error}</p>}
    <button type="submit" disabled={state === "sending"}>{state === "sending" ? "Enviando..." : <>Enviar consulta <ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></>}</button>
  </form>;
}
