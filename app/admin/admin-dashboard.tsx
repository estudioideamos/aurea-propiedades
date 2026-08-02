"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, Building2, Check, CircleDollarSign, Copy, Eye, FileText, Home, Image as ImageIcon, LayoutDashboard, MapPin, Menu, MessageSquareText, Pencil, Plus, Search, Settings, Sparkles, Star, Trash2, TrendingUp, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { formatPrice, type Property } from "../properties";
import { Brand } from "../site-chrome";

type AdminStatus = "published" | "draft" | "reserved";
type AdminProperty = Property & { status: AdminStatus; updatedAt?: string };
type PropertyDraft = Omit<AdminProperty, "id"> & { id?: number; amenitiesText: string };

type Props = { initialProperties: Property[]; userName: string; signOutPath: string };

const emptyDraft: PropertyDraft = {
  slug: "", title: "", location: "", zone: "CABA", operation: "Venta", type: "Casa", currency: "USD", price: 0,
  rooms: 3, bedrooms: 2, bathrooms: 1, area: 80, image: "", description: "", amenities: [], amenitiesText: "", featured: false, status: "draft",
};

const statusLabel: Record<AdminStatus, string> = { published: "Publicada", draft: "Borrador", reserved: "Reservada" };
const statusHint: Record<AdminStatus, string> = { published: "Visible en el sitio", draft: "Sólo en administración", reserved: "Operación en curso" };

function toAdmin(property: Property): AdminProperty { return { ...property, status: "published", updatedAt: new Date().toISOString() }; }
function toDraft(property?: AdminProperty): PropertyDraft {
  if (!property) return { ...emptyDraft };
  return { ...property, amenitiesText: property.amenities.join(", ") };
}
function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export function AdminDashboard({ initialProperties, userName, signOutPath }: Props) {
  const [items, setItems] = useState<AdminProperty[]>(initialProperties.map(toAdmin));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | AdminStatus>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draft, setDraft] = useState<PropertyDraft>({ ...emptyDraft });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [apiReady, setApiReady] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/properties", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("api");
      const data = await response.json() as { properties: AdminProperty[] };
      if (active) setItems(data.properties);
    }).catch(() => { if (active) setApiReady(false); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => items.filter(item => {
    const matchesFilter = filter === "all" || item.status === filter;
    const needle = query.trim().toLowerCase();
    return matchesFilter && (!needle || `${item.title} ${item.location} ${item.type} ${item.operation}`.toLowerCase().includes(needle));
  }), [items, query, filter]);

  const published = items.filter(item => item.status === "published").length;
  const drafts = items.filter(item => item.status === "draft").length;
  const featured = items.filter(item => item.featured).length;
  const portfolioValue = items.filter(item => item.currency === "USD" && item.operation === "Venta").reduce((sum, item) => sum + item.price, 0);

  const openCreate = () => { setDraft({ ...emptyDraft }); setEditorOpen(true); };
  const openEdit = (property: AdminProperty) => { setDraft(toDraft(property)); setEditorOpen(true); };
  const updateDraft = <K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) => setDraft(current => ({ ...current, [key]: value }));

  async function saveProperty(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.location.trim() || !draft.image.trim()) { setNotice("Completá nombre, ubicación e imagen antes de guardar."); return; }
    setSaving(true); setNotice("");
    const payload = { ...draft, slug: draft.slug || slugify(draft.title), amenities: draft.amenitiesText.split(",").map(item => item.trim()).filter(Boolean) };
    try {
      const response = await fetch("/api/admin/properties", { method: draft.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { property?: AdminProperty; error?: string };
      if (!response.ok || !data.property) throw new Error(data.error || "No se pudo guardar");
      setItems(current => draft.id ? current.map(item => item.id === draft.id ? data.property! : item) : [data.property!, ...current]);
      setEditorOpen(false); setNotice(draft.id ? "Cambios guardados correctamente." : "Propiedad creada correctamente.");
    } catch (error) {
      if (!apiReady) {
        const local = { ...payload, id: draft.id ?? Math.max(0, ...items.map(item => item.id)) + 1, updatedAt: new Date().toISOString() } as AdminProperty;
        setItems(current => draft.id ? current.map(item => item.id === draft.id ? local : item) : [local, ...current]);
        setEditorOpen(false); setNotice("Cambio guardado en esta vista de demostración.");
      } else setNotice(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally { setSaving(false); }
  }

  async function removeProperty(property: AdminProperty) {
    if (!window.confirm(`¿Eliminar ${property.title}? Esta acción no se puede deshacer.`)) return;
    try {
      if (apiReady) {
        const response = await fetch(`/api/admin/properties?id=${property.id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("No se pudo eliminar");
      }
      setItems(current => current.filter(item => item.id !== property.id));
      setNotice("Propiedad eliminada.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo eliminar."); }
  }

  async function duplicateProperty(property: AdminProperty) {
    const copy = { ...toDraft(property), id: undefined, title: `${property.title} copia`, slug: `${property.slug}-copia`, status: "draft" as const };
    setDraft(copy); setEditorOpen(true);
  }

  return <main className="admin-app">
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="admin-sidebar-head"><Brand/><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X/></button></div>
      <div className="admin-workspace"><span>ESPACIO DE TRABAJO</span><b>Ideamos Propiedades</b><small>Cuenta administradora</small></div>
      <nav className="admin-navigation">
        <button className="active" type="button"><LayoutDashboard/><span>Panel general</span></button>
        <button type="button"><Building2/><span>Propiedades</span><b>{items.length}</b></button>
        <button type="button"><Sparkles/><span>Emprendimientos</span><b>8</b></button>
        <button type="button"><MessageSquareText/><span>Consultas</span><i>24</i></button>
        <button type="button"><BarChart3/><span>Rendimiento</span></button>
      </nav>
      <nav className="admin-navigation secondary"><p>CONFIGURACIÓN</p><button type="button"><Settings/><span>Ajustes del sitio</span></button></nav>
      <div className="admin-user"><span>{userName.slice(0, 2).toUpperCase()}</span><div><b>{userName}</b><small>Administración</small></div><a href={signOutPath} aria-label="Cerrar sesión"><ArrowUpRight/></a></div>
    </aside>

    <section className="admin-canvas">
      <header className="admin-header"><button className="admin-mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu/></button><div><p>PANEL GENERAL</p><h1>Buenos días, {userName.split(" ")[0]}.</h1></div><div className="admin-header-actions"><Link href="/" target="_blank">Ver sitio <ArrowUpRight/></Link><button type="button" onClick={openCreate}><Plus/> Nueva propiedad</button></div></header>

      {!apiReady && <div className="admin-mode-note"><Sparkles/><div><b>Vista de demostración activa</b><span>En el sitio privado, los cambios quedan guardados en la base de datos.</span></div></div>}
      {notice && <button className="admin-toast" type="button" onClick={() => setNotice("")}><Check/><span>{notice}</span><X/></button>}

      <section className="admin-overview">
        <article className="admin-kpi primary"><div><span>PUBLICACIONES ACTIVAS</span><strong>{published}</strong><p><TrendingUp/> +3 este mes</p></div><div className="admin-mini-chart">{[42,61,48,75,67,91,84].map((height,index)=><i key={index} style={{height:`${height}%`}}/>)}</div></article>
        <article className="admin-kpi"><span>BORRADORES</span><strong>{drafts}</strong><p><FileText/> Pendientes de revisión</p></article>
        <article className="admin-kpi"><span>DESTACADAS</span><strong>{featured}</strong><p><Star/> Visibilidad prioritaria</p></article>
        <article className="admin-kpi value"><span>VALOR DE CARTERA</span><strong>USD {(portfolioValue / 1000000).toFixed(1)}M</strong><p><CircleDollarSign/> Propiedades en venta</p></article>
      </section>

      <section className="admin-content-card">
        <div className="admin-list-head"><div><p>INVENTARIO</p><h2>Propiedades</h2><span>Gestioná todo el catálogo desde un único lugar.</span></div><button type="button" onClick={openCreate}><Plus/> Agregar propiedad</button></div>
        <div className="admin-toolbar"><label><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre, zona o tipo"/></label><div>{(["all","published","draft","reserved"] as const).map(option => <button type="button" key={option} className={filter === option ? "active" : ""} onClick={() => setFilter(option)}>{option === "all" ? "Todas" : statusLabel[option]}<b>{option === "all" ? items.length : items.filter(item => item.status === option).length}</b></button>)}</div></div>
        <div className="admin-list-labels"><span>PROPIEDAD</span><span>OPERACIÓN</span><span>PRECIO</span><span>ESTADO</span><span>ACTUALIZACIÓN</span><span/></div>
        <div className={`admin-property-list ${loading ? "loading" : ""}`}>
          {visible.map(property => <article key={property.id}>
            <div className="admin-property-main"><img src={property.image} alt=""/><div><b>{property.title}</b><span><MapPin/>{property.location}</span><small>REF. ID-{String(property.id).padStart(4,"0")}</small></div></div>
            <span className="admin-operation"><Home/>{property.operation}<small>{property.type}</small></span>
            <strong className="admin-price">{formatPrice(property)}<small>{property.area} m²</small></strong>
            <span className={`admin-state ${property.status}`}><i/>{statusLabel[property.status]}<small>{statusHint[property.status]}</small></span>
            <span className="admin-updated">Hoy<small>{property.featured ? "Destacada" : "Publicación estándar"}</small></span>
            <div className="admin-row-actions"><button type="button" onClick={() => openEdit(property)} aria-label={`Editar ${property.title}`}><Pencil/></button><button type="button" onClick={() => duplicateProperty(property)} aria-label={`Duplicar ${property.title}`}><Copy/></button><Link href={`/propiedades/${property.slug}`} target="_blank" aria-label={`Ver ${property.title}`}><Eye/></Link><button className="danger" type="button" onClick={() => removeProperty(property)} aria-label={`Eliminar ${property.title}`}><Trash2/></button></div>
          </article>)}
          {!loading && visible.length === 0 && <div className="admin-empty"><Search/><h3>No encontramos propiedades.</h3><p>Probá otro filtro o creá una publicación nueva.</p><button type="button" onClick={openCreate}><Plus/> Nueva propiedad</button></div>}
        </div>
      </section>
    </section>

    {editorOpen && <div className="admin-editor-layer" role="dialog" aria-modal="true" aria-label={draft.id ? "Editar propiedad" : "Nueva propiedad"}>
      <button className="admin-editor-backdrop" type="button" onClick={() => setEditorOpen(false)} aria-label="Cerrar editor"/>
      <form className="admin-editor" onSubmit={saveProperty}>
        <header><div><p>{draft.id ? `REF. ID-${String(draft.id).padStart(4,"0")}` : "NUEVA PUBLICACIÓN"}</p><h2>{draft.id ? "Editar propiedad" : "Crear propiedad"}</h2></div><button type="button" onClick={() => setEditorOpen(false)} aria-label="Cerrar"><X/></button></header>
        <div className="admin-editor-progress"><span className="active"><b>1</b>Información</span><i/><span><b>2</b>Multimedia</span><i/><span><b>3</b>Publicación</span></div>
        <div className="admin-editor-body">
          <section><div className="admin-form-title"><span>01</span><div><h3>Información principal</h3><p>Los datos que identifican y posicionan la propiedad.</p></div></div><div className="admin-form-grid"><label className="wide"><span>NOMBRE DE LA PROPIEDAD</span><input value={draft.title} onChange={event => updateDraft("title", event.target.value)} placeholder="Ej. Casa del Lago"/></label><label><span>OPERACIÓN</span><select value={draft.operation} onChange={event => updateDraft("operation", event.target.value as Property["operation"])}><option>Venta</option><option>Alquiler</option></select></label><label><span>TIPO</span><select value={draft.type} onChange={event => updateDraft("type", event.target.value as Property["type"])}><option>Casa</option><option>Departamento</option><option>PH</option><option>Terreno</option></select></label><label><span>UBICACIÓN</span><input value={draft.location} onChange={event => updateDraft("location", event.target.value)} placeholder="Barrio, ciudad"/></label><label><span>ZONA</span><select value={draft.zone} onChange={event => updateDraft("zone", event.target.value)}><option>CABA</option><option>Zona Norte</option><option>Zona Oeste</option><option>Zona Sur</option></select></label><label><span>MONEDA</span><select value={draft.currency} onChange={event => updateDraft("currency", event.target.value as Property["currency"])}><option>USD</option><option>ARS</option></select></label><label><span>PRECIO</span><input type="number" min="0" value={draft.price} onChange={event => updateDraft("price", Number(event.target.value))}/></label></div></section>
          <section><div className="admin-form-title"><span>02</span><div><h3>Ficha técnica</h3><p>Información esencial para filtros y detalle.</p></div></div><div className="admin-form-grid compact"><label><span>AMBIENTES</span><input type="number" min="1" value={draft.rooms} onChange={event => updateDraft("rooms", Number(event.target.value))}/></label><label><span>DORMITORIOS</span><input type="number" min="0" value={draft.bedrooms} onChange={event => updateDraft("bedrooms", Number(event.target.value))}/></label><label><span>BAÑOS</span><input type="number" min="0" value={draft.bathrooms} onChange={event => updateDraft("bathrooms", Number(event.target.value))}/></label><label><span>SUPERFICIE TOTAL</span><input type="number" min="1" value={draft.area} onChange={event => updateDraft("area", Number(event.target.value))}/></label><label className="wide"><span>COMODIDADES, SEPARADAS POR COMAS</span><input value={draft.amenitiesText} onChange={event => updateDraft("amenitiesText", event.target.value)} placeholder="Piscina, jardín, parrilla, cochera"/></label><label className="wide"><span>DESCRIPCIÓN</span><textarea value={draft.description} onChange={event => updateDraft("description", event.target.value)} placeholder="Describí la propiedad, sus diferenciales y su entorno."/></label></div></section>
          <section><div className="admin-form-title"><span>03</span><div><h3>Imagen y publicación</h3><p>Vista previa y estado visible en el catálogo.</p></div></div><div className="admin-media-editor"><div className="admin-image-preview">{draft.image ? <img src={draft.image} alt="Vista previa"/> : <div><ImageIcon/><b>Sin imagen principal</b><span>Ingresá una URL para previsualizarla.</span></div>}<span><Upload/> IMAGEN PRINCIPAL</span></div><div><label><span>URL DE LA IMAGEN</span><input value={draft.image} onChange={event => updateDraft("image", event.target.value)} placeholder="https://..."/></label><label><span>ESTADO</span><select value={draft.status} onChange={event => updateDraft("status", event.target.value as AdminStatus)}><option value="published">Publicada</option><option value="draft">Borrador</option><option value="reserved">Reservada</option></select></label><button className={`admin-feature-toggle ${draft.featured ? "active" : ""}`} type="button" onClick={() => updateDraft("featured", !draft.featured)}><Star fill={draft.featured ? "currentColor" : "none"}/><span><b>Destacar propiedad</b><small>Aparecerá primero en la home y el catálogo.</small></span><i>{draft.featured ? "Sí" : "No"}</i></button></div></div></section>
        </div>
        <footer><button type="button" onClick={() => setEditorOpen(false)}>Cancelar</button><div><button type="button" onClick={() => updateDraft("status", "draft")}><FileText/> Guardar borrador</button><button className="primary" type="submit" disabled={saving}>{saving ? "Guardando..." : <><Check/> Guardar propiedad</>}</button></div></footer>
      </form>
    </div>}
  </main>;
}