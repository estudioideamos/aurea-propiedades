"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "../home-experience";
import type { Property } from "../properties";

export function CatalogExperience({ properties }: { properties: Property[] }) {
  const [operation, setOperation] = useState("Todas");
  const [type, setType] = useState("Todos");
  const [zone, setZone] = useState("Todas");
  const visible = useMemo(() => properties.filter(p => (operation === "Todas" || p.operation === operation) && (type === "Todos" || p.type === type) && (zone === "Todas" || p.zone === zone)), [operation,type,zone,properties]);
  return <><div className="catalog-controls"><label><span>OPERACION</span><select value={operation} onChange={e=>setOperation(e.target.value)}><option>Todas</option><option>Venta</option><option>Alquiler</option></select></label><label><span>TIPO</span><select value={type} onChange={e=>setType(e.target.value)}><option>Todos</option><option>Casa</option><option>Departamento</option><option>PH</option><option>Terreno</option></select></label><label><span>ZONA</span><select value={zone} onChange={e=>setZone(e.target.value)}><option>Todas</option><option>CABA</option><option>Zona Norte</option></select></label><div><strong>{String(visible.length).padStart(2,"0")}</strong><span>RESULTADOS</span></div></div><div className="property-grid">{visible.map((p,i)=><PropertyCard key={p.id} property={p} index={i}/>)}</div></>;
}
