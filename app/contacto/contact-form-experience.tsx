"use client";

import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const objectives = ["Comprar", "Vender", "Alquilar", "Invertir", "Tasar"];

export function ContactFormExperience(){
  const [open,setOpen]=useState(false);
  const [objective,setObjective]=useState("");
  const dropdown=useRef<HTMLDivElement>(null);
  useEffect(()=>{const close=(event:MouseEvent)=>{if(dropdown.current&&!dropdown.current.contains(event.target as Node))setOpen(false)}; const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)}; document.addEventListener("mousedown",close); document.addEventListener("keydown",escape); return()=>{document.removeEventListener("mousedown",close);document.removeEventListener("keydown",escape)}},[]);
  return <form className="contact-vian-form"><label><span>NOMBRE</span><input placeholder="Tu nombre" required/></label><label><span>APELLIDO</span><input placeholder="Tu apellido"/></label><label><span>EMAIL</span><input type="email" placeholder="nombre@email.com" required/></label><label><span>TELÉFONO</span><input type="tel" placeholder="+54 9 11"/></label><div className={"contact-objective "+(open?"open":"")} ref={dropdown}><span>OBJETIVO</span><button className="contact-objective-trigger" type="button" onClick={()=>setOpen(value=>!value)} aria-haspopup="listbox" aria-expanded={open}><b>{objective||"Seleccioná una opción"}</b><ChevronDown aria-hidden="true"/></button>{open&&<div className="contact-objective-menu" role="listbox" aria-label="Objetivo de la consulta">{objectives.map(option=><button type="button" role="option" aria-selected={objective===option} className={objective===option?"active":""} key={option} onClick={()=>{setObjective(option);setOpen(false)}}><span>{option}</span>{objective===option&&<Check aria-hidden="true"/>}</button>)}</div>}<input type="hidden" name="objetivo" value={objective}/></div><label><span>ZONA</span><input placeholder="Barrio o localidad"/></label><label className="wide"><span>MENSAJE</span><textarea rows={4} placeholder="Contanos brevemente qué estás buscando"/></label><button className="contact-submit" type="submit">ENVIAR CONSULTA <ArrowUpRight aria-hidden="true"/></button></form>;
}