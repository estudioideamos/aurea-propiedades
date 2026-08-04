"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PropertyCard } from "../home-experience";
import type { Property } from "../properties";

type CatalogDropdownProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function CatalogDropdown({ label, value, options, onChange }: CatalogDropdownProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  return <div className={`search-dropdown catalog-dropdown ${open ? "open" : ""}`} ref={root}>
    <button className="search-dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(current => !current)} onKeyDown={event => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); }
    }}>
      <span><small>{label}</small><b>{value}</b></span>
      <ChevronDown aria-hidden="true" strokeWidth={1.8}/>
    </button>
    {open && <div className="search-dropdown-menu" role="listbox" aria-label={label}>
      {options.map(option => <button type="button" role="option" aria-selected={option === value} className={option === value ? "selected" : ""} key={option} onClick={() => choose(option)}><span>{option}</span>{option === value && <Check aria-hidden="true" strokeWidth={2.2}/>}</button>)}
    </div>}
  </div>;
}

export function CatalogExperience({ properties }: { properties: Property[] }) {
  const [operation, setOperation] = useState("Todas");
  const [type, setType] = useState("Todos");
  const [zone, setZone] = useState("Todas");
  const typeOptions = useMemo(() => ["Todos", ...Array.from(new Set(properties.map(property => property.type.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"))], [properties]);
  const zoneOptions = useMemo(() => ["Todas", ...Array.from(new Set(properties.map(property => property.zone.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"))], [properties]);
  const visible = useMemo(() => properties.filter(p => (operation === "Todas" || p.operation === operation) && (type === "Todos" || p.type === type) && (zone === "Todas" || p.zone === zone)), [operation, type, zone, properties]);

  return <>
    <div className="catalog-controls">
      <CatalogDropdown label="OPERACI&Oacute;N" value={operation} options={["Todas", "Venta", "Alquiler", "Alquiler temporario"]} onChange={setOperation}/>
      <CatalogDropdown label="TIPO DE PROPIEDAD" value={type} options={typeOptions} onChange={setType}/>
      <CatalogDropdown label="ZONA" value={zone} options={zoneOptions} onChange={setZone}/>
      <div className="catalog-result"><strong>{String(visible.length).padStart(2, "0")}</strong><span>RESULTADOS</span></div>
    </div>
    <div className="property-grid" key={`${operation}-${type}-${zone}`}>{visible.map((p, i) => <PropertyCard key={p.id} property={p} index={i}/>)}</div>
  </>;
}