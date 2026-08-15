"use client";

import { ArrowUpRight, Check, ChevronDown, CircleCheck } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

const objectives = ["Comprar", "Vender", "Alquilar", "Invertir", "Tasar"];

type SubmitState = "idle" | "sending" | "sent" | "error";

export function ConnectedContactForm() {
  const [open, setOpen] = useState(false);
  const [objective, setObjective] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");
  const dropdown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdown.current && !dropdown.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!objective) {
      setSubmitState("error");
      setFeedback("Seleccion\u00e1 el objetivo de tu consulta.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const zone = String(data.get("zone") ?? "").trim();
    const comments = String(data.get("comments") ?? "").trim();

    setSubmitState("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          name: [firstName, lastName].filter(Boolean).join(" "),
          email,
          phone,
          message: comments || `Consulta por ${objective}${zone ? ` en ${zone}` : ""}.`,
          context: {
            objetivo: objective,
            zona: zone,
            nombre: firstName,
            apellido: lastName,
          },
          sourceUrl: window.location.href,
          website: String(data.get("website") ?? ""),
        }),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "No pudimos enviar la consulta.");

      form.reset();
      setObjective("");
      setSubmitState("sent");
      setFeedback("Tu mensaje se envi\u00f3 correctamente. Nos contactaremos con vos a la brevedad.");
    } catch (error) {
      setSubmitState("error");
      setFeedback(error instanceof Error ? error.message : "No pudimos enviar la consulta. Intent\u00e1 nuevamente.");
    }
  }

  return <form className="contact-vian-form" onSubmit={submit}>
    <label><span>NOMBRE</span><input name="firstName" placeholder="Tu nombre" autoComplete="given-name" required/></label>
    <label><span>APELLIDO</span><input name="lastName" placeholder="Tu apellido" autoComplete="family-name"/></label>
    <label><span>EMAIL</span><input name="email" type="email" placeholder="nombre@email.com" autoComplete="email" required/></label>
    <label><span>TEL\u00c9FONO</span><input name="phone" type="tel" placeholder="+54 9 11" autoComplete="tel"/></label>
    <div className={"contact-objective " + (open ? "open" : "")} ref={dropdown}>
      <span>OBJETIVO</span>
      <button className="contact-objective-trigger" type="button" onClick={() => setOpen(value => !value)} aria-haspopup="listbox" aria-expanded={open}>
        <b>{objective || "Seleccion\u00e1 una opci\u00f3n"}</b><ChevronDown aria-hidden="true"/>
      </button>
      {open && <div className="contact-objective-menu" role="listbox" aria-label="Objetivo de la consulta">
        {objectives.map(option => <button type="button" role="option" aria-selected={objective === option} className={objective === option ? "active" : ""} key={option} onClick={() => { setObjective(option); setOpen(false); }}>
          <span>{option}</span>{objective === option && <Check aria-hidden="true"/>}
        </button>)}
      </div>}
    </div>
    <label><span>ZONA</span><input name="zone" placeholder="Barrio o localidad"/></label>
    <label className="wide"><span>MENSAJE</span><textarea name="comments" rows={4} placeholder="Contanos brevemente qu\u00e9 est\u00e1s buscando"/></label>
    <input className="inquiry-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    {feedback && <p className={"inquiry-submit-notice " + submitState} role={submitState === "error" ? "alert" : "status"} aria-live="polite">
      {submitState === "sent" && <CircleCheck aria-hidden="true"/>}<span>{feedback}</span>
    </p>}
    <button className="contact-submit" type="submit" disabled={submitState === "sending"}>
      {submitState === "sending" ? "ENVIANDO..." : "ENVIAR CONSULTA"} <ArrowUpRight aria-hidden="true"/>
    </button>
  </form>;
}
