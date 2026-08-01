"use client";
import { Heart, Printer, Share2 } from "lucide-react";
import { useState } from "react";
export function PropertyActions({ title }: { title: string }) {
  const [saved,setSaved]=useState(false);
  const share=async()=>{ if(navigator.share){ await navigator.share({title,url:window.location.href}); } else { await navigator.clipboard.writeText(window.location.href); } };
  return <div className="detail-actions"><button className={saved?"active":""} onClick={()=>setSaved(!saved)} type="button" aria-label="Guardar propiedad"><Heart aria-hidden="true" fill={saved?"currentColor":"none"} strokeWidth={1.7}/><span>{saved?"Guardada":"Guardar"}</span></button><button onClick={share} type="button" aria-label="Compartir propiedad"><Share2 aria-hidden="true" strokeWidth={1.7}/><span>Compartir</span></button><button onClick={()=>window.print()} type="button" aria-label="Imprimir propiedad"><Printer aria-hidden="true" strokeWidth={1.7}/><span>Imprimir</span></button></div>;
}