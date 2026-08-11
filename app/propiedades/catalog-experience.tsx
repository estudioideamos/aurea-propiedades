"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PropertyCard } from "../home-experience";
import type { Property } from "../properties";

const operationOptions = ["Todas", "Venta", "Alquiler", "Alquiler temporario"];
const roomOptions = ["Todos", "1 ambiente", "2 ambientes", "3 ambientes", "4 ambientes", "5+ ambientes"];

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
  const [rooms, setRooms] = useState("Todos");
  const [filtersReady, setFiltersReady] = useState(false);
  const typeOptions = useMemo(() => ["Todos", ...Array.from(new Set(properties.map(property => property.type.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"))], [properties]);
  const zoneOptions = useMemo(() => ["Todas", ...Array.from(new Set(properties.map(property => property.zone.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"))], [properties]);

  useEffect(() => {
    if (filtersReady) return;
    const params = new URLSearchParams(window.location.search);
    const selectMatching = (key: string, options: string[], setValue: (value: string) => void) => {
      const requested = params.get(key);
      if (!requested) return;
      const match = options.find(option => option.localeCompare(requested, "es", { sensitivity: "base" }) === 0);
      if (match) setValue(match);
    };
    selectMatching("operacion", operationOptions, setOperation);
    selectMatching("tipo", typeOptions, setType);
    selectMatching("zona", zoneOptions, setZone);
    selectMatching("ambientes", roomOptions, setRooms);
    const readyTimer = window.setTimeout(() => setFiltersReady(true), 0);
    return () => window.clearTimeout(readyTimer);
  }, [filtersReady, typeOptions, zoneOptions]);

  useEffect(() => {
    if (!filtersReady) return;
    const params = new URLSearchParams();
    if (operation !== "Todas") params.set("operacion", operation);
    if (type !== "Todos") params.set("tipo", type);
    if (zone !== "Todas") params.set("zona", zone);
    if (rooms !== "Todos") params.set("ambientes", rooms);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [filtersReady, operation, type, zone, rooms]);

  const visible = useMemo(() => properties.filter(p => {
    const roomMatch = rooms === "Todos" || (rooms === "5+ ambientes" ? p.rooms >= 5 : p.rooms === Number.parseInt(rooms, 10));
    return (operation === "Todas" || p.operation === operation) && (type === "Todos" || p.type === type) && (zone === "Todas" || p.zone === zone) && roomMatch;
  }), [operation, type, zone, rooms, properties]);

  return <>
    <div className="catalog-controls">
      <CatalogDropdown label="OPERACI&Oacute;N" value={operation} options={operationOptions} onChange={setOperation}/>
      <CatalogDropdown label="TIPO DE PROPIEDAD" value={type} options={typeOptions} onChange={setType}/>
      <CatalogDropdown label="ZONA" value={zone} options={zoneOptions} onChange={setZone}/>
      <CatalogDropdown label="AMBIENTES" value={rooms} options={roomOptions} onChange={setRooms}/>
      <div className="catalog-result"><strong>{String(visible.length).padStart(2, "0")}</strong><span>RESULTADOS</span></div>
    </div>
    <div className="property-grid" key={`${operation}-${type}-${zone}-${rooms}`}>{visible.map((p, i) => <PropertyCard key={p.id} property={p} index={i}/>)}</div>
  </>;
}
