"use client";

import { ArrowUpRight, Check, ChevronDown, CircleCheck } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

type PremiumSelectProps = {
  label: string;
  name: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function PremiumSelect({ label, name, placeholder, options, value, onChange }: PremiumSelectProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
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

  return <div className={"valuation-select " + (open ? "open" : "")} ref={root}>
    <span>{label}</span>
    <button type="button" onClick={() => setOpen(state => !state)} aria-haspopup="listbox" aria-expanded={open}>
      <b>{value || placeholder}</b><ChevronDown aria-hidden="true"/>
    </button>
    {open && <div role="listbox">
      {options.map(option => <button type="button" role="option" aria-selected={value === option} className={value === option ? "active" : ""} key={option} onClick={() => { onChange(option); setOpen(false); }}>
        <span>{option}</span>{value === option && <Check aria-hidden="true"/>}
      </button>)}
    </div>}
    <input type="hidden" name={name} value={value}/>
  </div>;
}

type SubmitState = "idle" | "sending" | "sent" | "error";

export function ConnectedValuationForm() {
  const [operation, setOperation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [condition, setCondition] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const zone = String(data.get("zone") ?? "").trim();
    const surface = String(data.get("surface") ?? "").trim();
    const rooms = String(data.get("rooms") ?? "").trim();
    const age = String(data.get("age") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    const comments = String(data.get("comments") ?? "").trim();

    setSubmitState("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "valuation",
          name,
          email,
          phone,
          message: comments || `Solicitud de tasaci\u00f3n para ${propertyType || "propiedad"} en ${zone}.`,
          context: {
            operacion: operation,
            tipoDePropiedad: propertyType,
            zona: zone,
            superficieAproximada: surface,
            ambientes: rooms,
            antiguedad: age,
            estadoGeneral: condition,
            direccionAproximada: address,
          },
          sourceUrl: window.location.href,
          website: String(data.get("website") ?? ""),
        }),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "No pudimos enviar la solicitud.");

      form.reset();
      setOperation("");
      setPropertyType("");
      setCondition("");
      setSubmitState("sent");
      setFeedback("Recibimos tu solicitud de tasaci\u00f3n. Nos contactaremos con vos a la brevedad para coordinar el pr\u00f3ximo paso.");
    } catch (error) {
      setSubmitState("error");
      setFeedback(error instanceof Error ? error.message : "No pudimos enviar la solicitud. Intent\u00e1 nuevamente.");
    }
  }

  return <form className="valuation-premium-form" onSubmit={submit}>
    <header><span>05 / DATOS DE LA PROPIEDAD</span><h2>Recib\u00ed una primera lectura profesional.</h2><p>Complet\u00e1 lo que tengas. El resto lo relevamos juntos durante la entrevista.</p></header>
    <div className="valuation-form-grid">
      <label><span>NOMBRE Y APELLIDO</span><input name="name" placeholder="Tu nombre" autoComplete="name" required/></label>
      <label><span>TEL\u00c9FONO</span><input name="phone" type="tel" placeholder="+54 9 11" autoComplete="tel" required/></label>
      <label><span>EMAIL</span><input name="email" type="email" placeholder="nombre@email.com" autoComplete="email"/></label>
      <label><span>ZONA</span><input name="zone" placeholder="Barrio o localidad" required/></label>
      <PremiumSelect label="OPERACI\u00d3N" name="operation" placeholder="Seleccion\u00e1" options={["Venta", "Alquiler"]} value={operation} onChange={setOperation}/>
      <PremiumSelect label="TIPO DE PROPIEDAD" name="propertyType" placeholder="Seleccion\u00e1" options={["Casa", "Departamento", "PH", "Terreno", "Local", "Oficina"]} value={propertyType} onChange={setPropertyType}/>
      <label><span>SUPERFICIE APROX.</span><input name="surface" placeholder="Ej. 180 m\u00b2"/></label>
      <label><span>AMBIENTES</span><input name="rooms" placeholder="Ej. 4"/></label>
      <label><span>ANTIG\u00dcEDAD</span><input name="age" placeholder="Ej. 8 a\u00f1os"/></label>
      <PremiumSelect label="ESTADO GENERAL" name="condition" placeholder="Seleccion\u00e1" options={["A estrenar", "Excelente", "Muy bueno", "Bueno", "A refaccionar"]} value={condition} onChange={setCondition}/>
      <label><span>DIRECCI\u00d3N APROXIMADA</span><input name="address" placeholder="Calle y altura"/></label>
      <label className="wide"><span>COMENTARIOS</span><textarea name="comments" rows={4} placeholder="Contanos si tiene cochera, jard\u00edn, amenities, mejoras recientes u otra informaci\u00f3n relevante"/></label>
      <input className="inquiry-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
      {feedback && <p className={"inquiry-submit-notice " + submitState} role={submitState === "error" ? "alert" : "status"} aria-live="polite">
        {submitState === "sent" && <CircleCheck aria-hidden="true"/>}<span>{feedback}</span>
      </p>}
      <button type="submit" disabled={submitState === "sending"}>
        {submitState === "sending" ? "ENVIANDO..." : "SOLICITAR TASACI\u00d3N"} <ArrowUpRight aria-hidden="true"/>
      </button>
    </div>
  </form>;
}
