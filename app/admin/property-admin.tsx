"use client";

import Link from "next/link";
import { Activity, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Building2, Check, CircleDollarSign, Copy, Eye, FileText, Home, Image as ImageIcon, LayoutDashboard, LoaderCircle, Mail, MapPin, Menu, MessageSquareText, Pencil, Phone, Plus, RefreshCw, Search, Settings, Sparkles, Star, Trash2, TrendingUp, Upload, Users, X, LogOut } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { formatPrice, type Property } from "../properties";
import { DevelopmentManager } from "./development-manager";
import { SettingsManager } from "./settings-manager";
import { AdminManual } from "./admin-manual";
import { Brand } from "../site-chrome";

type AdminStatus = "published" | "draft" | "reserved";
type AdminProperty = Property & { status: AdminStatus; updatedAt?: string };
type AdminLead = { id: number; propertyId: number | null; name: string; email: string | null; phone: string | null; message: string; status: "new" | "contacted" | "closed"; createdAt: string };
type Draft = Omit<AdminProperty, "id"> & { id?: number; amenitiesText: string; gallery: string[] };
type View = "overview" | "properties" | "developments" | "leads" | "performance" | "settings" | "manual";
type Props = { initialProperties: Property[]; userName: string; signOutPath: string };

const emptyDraft: Draft = { slug: "", title: "", location: "", zone: "CABA", operation: "Venta", type: "Casa", currency: "USD", price: 0, pricePrefix: "", priceSuffix: "", rooms: 3, bedrooms: 2, bathrooms: 1, area: 80, coveredArea: 65, garages: 1, age: "A estrenar", condition: "Excelente", orientation: "Norte", image: "", gallery: [], description: "", amenities: [], amenitiesText: "", featured: false, status: "draft" };
const statusLabel: Record<AdminStatus, string> = { published: "Publicada", draft: "Borrador", reserved: "Reservada" };
const leadLabel: Record<AdminLead["status"], string> = { new: "Nueva", contacted: "Contactada", closed: "Cerrada" };
const viewCopy: Record<View, { eyebrow: string; title: string }> = {
  overview: { eyebrow: "PANEL GENERAL", title: "Tu operación, de un vistazo." },
  properties: { eyebrow: "INVENTARIO", title: "Toda la cartera." },
  developments: { eyebrow: "EMPRENDIMIENTOS", title: "Proyectos seleccionados." },
  leads: { eyebrow: "CONSULTAS", title: "Personas interesadas." },
  performance: { eyebrow: "RENDIMIENTO", title: "Datos para decidir." },
  manual: { eyebrow: "CENTRO DE AYUDA", title: "Manual de uso." },
  settings: { eyebrow: "CONFIGURACIÓN", title: "Identidad y accesos." },
};

const PUBLIC_SITE = "https://inmobiliaria.ideamos.ar";

const zones = ["CABA", "Zona Norte", "Zona Oeste", "Zona Sur", "Costa Atlántica", "Interior"];

function toAdmin(property: Property): AdminProperty { return { ...property, gallery: property.gallery ?? [], status: "published", updatedAt: new Date().toISOString() }; }
function toDraft(property?: AdminProperty): Draft { return property ? { ...property, gallery: property.gallery ?? [], amenitiesText: property.amenities.join(", ") } : { ...emptyDraft, gallery: [] }; }
function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function dateLabel(value?: string) { if (!value) return "Sin fecha"; return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export function PropertyAdmin({ initialProperties, userName, signOutPath }: Props) {
  const [view, setView] = useState<View>("overview");
  const [items, setItems] = useState<AdminProperty[]>(initialProperties.map(toAdmin));
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | AdminStatus>("all");
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft, gallery: [] });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorStep, setEditorStep] = useState<1 | 2 | 3>(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [fatalError, setFatalError] = useState("");

  async function loadData() {
    setLoading(true); setFatalError("");
    const [propertyResult, leadResult] = await Promise.allSettled([
      fetch("/api/admin/properties", { cache: "no-store", credentials: "same-origin" }),
      fetch("/api/admin/leads", { cache: "no-store", credentials: "same-origin" }),
    ]);
    const issues: string[] = [];
    if (propertyResult.status === "fulfilled" && propertyResult.value.ok) {
      const propertyData = await propertyResult.value.json() as { properties: AdminProperty[] };
      setItems(propertyData.properties);
    } else {
      issues.push("propiedades");
    }
    if (leadResult.status === "fulfilled" && leadResult.value.ok) {
      const leadData = await leadResult.value.json() as { leads: AdminLead[] };
      setLeads(leadData.leads);
    } else {
      issues.push("consultas");
    }
    if (issues.length) setFatalError(`No pudimos sincronizar ${issues.join(" y ")}.`);
    setLoading(false);
  }

  useEffect(() => { const timer = window.setTimeout(() => { void loadData(); }, 0); return () => window.clearTimeout(timer); }, []);

  const visible = useMemo(() => items.filter(item => {
    const needle = query.trim().toLowerCase();
    return (filter === "all" || item.status === filter) && (!needle || `${item.title} ${item.location} ${item.type} ${item.operation}`.toLowerCase().includes(needle));
  }), [items, query, filter]);
  const published = items.filter(item => item.status === "published").length;
  const drafts = items.filter(item => item.status === "draft").length;
  const featured = items.filter(item => item.featured).length;
  const newLeads = leads.filter(item => item.status === "new").length;
  const portfolioValue = items.filter(item => item.currency === "USD" && item.operation === "Venta" && item.status === "published").reduce((sum, item) => sum + item.price, 0);

  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }));
  const openCreate = () => { setDraft(toDraft()); setEditorStep(1); setEditorOpen(true); };
  const openEdit = (property: AdminProperty) => { setDraft(toDraft(property)); setEditorStep(1); setEditorOpen(true); };
  const openDuplicate = (property: AdminProperty) => { setDraft({ ...toDraft(property), id: undefined, title: `${property.title} copia`, slug: "", status: "draft" }); setEditorStep(1); setEditorOpen(true); };
  const canContinueEditor = Boolean(draft.title.trim() && draft.location.trim());
  const changeEditorStep = (step: 1 | 2 | 3) => {
    if (step > 1 && !canContinueEditor) { setNotice("Completá el nombre y la ubicación para continuar."); return; }
    setEditorStep(step);
  };

  async function persistProperty(statusOverride?: AdminStatus) {
    const status = statusOverride ?? draft.status;
    if (!draft.title.trim() || !draft.location.trim()) { setNotice("Completá el nombre y la ubicación."); return; }
    if (status !== "draft" && !draft.image) { setNotice("Elegí una imagen principal antes de publicar."); return; }
    if ((draft.coveredArea ?? 0) > draft.area) { setNotice("La superficie cubierta no puede superar la superficie total."); return; }
    setSaving(true); setNotice("");
    const payload = { ...draft, status, slug: draft.slug || slugify(draft.title), amenities: draft.amenitiesText.split(",").map(item => item.trim()).filter(Boolean) };
    try {
      const response = await fetch("/api/admin/properties", { method: draft.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { property?: AdminProperty; error?: string };
      if (!response.ok || !data.property) throw new Error(data.error || "No se pudo guardar la propiedad.");
      setItems(current => draft.id ? current.map(item => item.id === draft.id ? data.property! : item) : [data.property!, ...current]);
      setEditorOpen(false); setNotice(status === "draft" ? "Borrador guardado." : draft.id ? "Cambios publicados." : "Propiedad publicada.");
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "No se pudo guardar."); }
    finally { setSaving(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void persistProperty(); }

  async function removeProperty(property: AdminProperty) {
    if (!window.confirm(`¿Eliminar ${property.title}? Esta acción no se puede deshacer.`)) return;
    const response = await fetch(`/api/admin/properties?id=${property.id}`, { method: "DELETE" });
    if (!response.ok) { setNotice("No se pudo eliminar la propiedad."); return; }
    setItems(current => current.filter(item => item.id !== property.id)); setNotice("Propiedad eliminada.");
  }

  async function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []); event.target.value = "";
    if (!files.length) return;
    if (files.length + draft.gallery.length + (draft.image ? 1 : 0) > 13) { setNotice("La galería admite hasta 13 imágenes."); return; }
    setUploading(true); setNotice("");
    const body = new FormData(); files.forEach(file => body.append("files", file));
    try {
      const response = await fetch("/api/admin/uploads", { method: "POST", body });
      const data = await response.json() as { urls?: string[]; error?: string };
      if (!response.ok || !data.urls?.length) throw new Error(data.error || "No se pudieron cargar las imágenes.");
      setDraft(current => { const primary = current.image || data.urls![0]; const gallery = [...current.gallery, ...data.urls!.filter(url => url !== primary)].filter((url, index, all) => all.indexOf(url) === index); return { ...current, image: primary, gallery }; });
      setNotice(`${data.urls.length} ${data.urls.length === 1 ? "imagen cargada" : "imágenes cargadas"}.`);
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "No se pudieron cargar las imágenes."); }
    finally { setUploading(false); }
  }

  function setPrimary(url: string) { setDraft(current => ({ ...current, image: url, gallery: [current.image, ...current.gallery.filter(item => item !== url)].filter(Boolean) })); }
  async function removeImage(url: string) {
    setDraft(current => { const remaining = current.gallery.filter(item => item !== url); return url === current.image ? { ...current, image: remaining[0] ?? "", gallery: remaining.slice(1) } : { ...current, gallery: remaining }; });
    if (url.startsWith("/api/media/")) void fetch(`/api/admin/uploads?url=${encodeURIComponent(url)}`, { method: "DELETE" });
  }

  async function updateLead(id: number, status: AdminLead["status"]) {
    const response = await fetch("/api/admin/leads", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { setNotice("No se pudo actualizar la consulta."); return; }
    setLeads(current => current.map(item => item.id === id ? { ...item, status } : item)); setNotice("Consulta actualizada.");
  }
  async function removeLead(id: number) {
    if (!window.confirm("¿Eliminar esta consulta?")) return;
    const response = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
    if (response.ok) setLeads(current => current.filter(item => item.id !== id)); else setNotice("No se pudo eliminar la consulta.");
  }

  const navigate = (target: View) => { setView(target); setSidebarOpen(false); };
  const propertyRows = view === "overview" ? items.slice(0, 5) : visible;

  return <main className="admin-app">
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="admin-sidebar-head"><Brand/><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X/></button></div>
      <div className="admin-workspace"><span>ESPACIO DE TRABAJO</span><b>Ideamos Propiedades</b><small>Administración conectada</small></div>
      <nav className="admin-navigation">
        <button className={view === "overview" ? "active" : ""} type="button" onClick={() => navigate("overview")}><LayoutDashboard/><span>Panel general</span></button>
        <button className={view === "properties" ? "active" : ""} type="button" onClick={() => navigate("properties")}><Building2/><span>Propiedades</span><b>{items.length}</b></button>
        <button className={view === "developments" ? "active" : ""} type="button" onClick={() => navigate("developments")}><Sparkles/><span>Emprendimientos</span><b>8</b></button>
        <button className={view === "leads" ? "active" : ""} type="button" onClick={() => navigate("leads")}><MessageSquareText/><span>Consultas</span>{newLeads > 0 && <i>{newLeads}</i>}</button>
        <button className={view === "performance" ? "active" : ""} type="button" onClick={() => navigate("performance")}><BarChart3/><span>Rendimiento</span></button>
      </nav>
      <nav className="admin-navigation secondary"><p>CONFIGURACIÓN</p><button className={view === "manual" ? "active" : ""} type="button" onClick={() => navigate("manual")}><BookOpen/><span>Manual de uso</span></button><button className={view === "settings" ? "active" : ""} type="button" onClick={() => navigate("settings")}><Settings/><span>Ajustes del sitio</span></button><a className="admin-nav-link" href={PUBLIC_SITE} target="_blank" rel="noreferrer"><Eye/><span>Ver sitio público</span><ArrowUpRight/></a></nav>
      <div className="admin-user"><span>{userName.slice(0,2).toUpperCase()}</span><div><b>{userName}</b><small>Administración</small></div><a className="admin-user-logout" href={signOutPath}><LogOut/><span>Cerrar sesión</span></a></div>
    </aside>

    <section className="admin-canvas">
      <header className="admin-header"><button className="admin-mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu/></button><div><p>{viewCopy[view].eyebrow}</p><h1>{view === "overview" ? `Buenos días, ${userName.split(" ")[0]}.` : viewCopy[view].title}</h1></div><div className="admin-header-actions"><button className="admin-refresh" type="button" onClick={() => void loadData()} aria-label="Actualizar"><RefreshCw/></button>{(view === "overview" || view === "properties") && <button type="button" onClick={openCreate}><Plus/> Nueva propiedad</button>}</div></header>

      {notice && <button className="admin-toast" type="button" onClick={() => setNotice("")}><Check/><span>{notice}</span><X/></button>}
      {fatalError && <div className="admin-fatal"><BarChart3/><div><b>No pudimos cargar la administración</b><span>{fatalError} Volvé a iniciar sesión o intentá nuevamente.</span></div><button type="button" onClick={() => void loadData()}><RefreshCw/> Reintentar</button></div>}

      {view === "overview" && <section className="admin-overview">
        <article className="admin-kpi primary"><div><span>PUBLICACIONES ACTIVAS</span><strong>{published}</strong><p><BarChart3/> Catálogo público</p></div><div className="admin-mini-chart">{[42,61,48,75,67,91,84].map((height,index)=><i key={index} style={{height:`${height}%`}}/>)}</div></article>
        <article className="admin-kpi"><span>BORRADORES</span><strong>{drafts}</strong><p><FileText/> Pendientes de publicación</p></article>
        <article className="admin-kpi"><span>DESTACADAS</span><strong>{featured}</strong><p><Star/> Prioridad en el catálogo</p></article>
        <article className="admin-kpi value"><span>VALOR DE CARTERA</span><strong>USD {(portfolioValue/1000000).toFixed(1)}M</strong><p><CircleDollarSign/> Publicadas en venta</p></article>
      </section>}

      {(view === "overview" || view === "properties") && <section className="admin-content-card">
        <div className="admin-list-head"><div><p>{view === "overview" ? "ACTIVIDAD RECIENTE" : "INVENTARIO"}</p><h2>{view === "overview" ? "Últimas propiedades" : "Propiedades"}</h2><span>{view === "overview" ? "Los movimientos más recientes de la cartera." : "Creá, editá y publicá todo desde un único lugar."}</span></div><button type="button" onClick={openCreate}><Plus/> Agregar propiedad</button></div>
        {view === "properties" && <div className="admin-toolbar"><label><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre, zona o tipo"/></label><div>{(["all","published","draft","reserved"] as const).map(option=><button type="button" key={option} className={filter===option?"active":""} onClick={()=>setFilter(option)}>{option==="all"?"Todas":statusLabel[option]}<b>{option==="all"?items.length:items.filter(item=>item.status===option).length}</b></button>)}</div></div>}
        <div className="admin-list-labels"><span>PROPIEDAD</span><span>OPERACIÓN</span><span>PRECIO</span><span>ESTADO</span><span>ACTUALIZACIÓN</span><span/></div>
        <div className={`admin-property-list ${loading?"loading":""}`}>
          {propertyRows.map(property=><article key={property.id}><div className="admin-property-main"><div className="admin-thumb">{property.image?<img src={property.image} alt=""/>:<ImageIcon/>}</div><div><b>{property.title}</b><span><MapPin/>{property.location}</span><small>REF. ID-{String(property.id).padStart(4,"0")}</small></div></div><span className="admin-operation"><Home/>{property.operation}<small>{property.type}</small></span><strong className="admin-price">{formatPrice(property)}<small>{property.area} m²</small></strong><span className={`admin-state ${property.status}`}><i/>{statusLabel[property.status]}<small>{property.status==="published"?"Visible en el sitio":property.status==="draft"?"Solo administración":"Operación en curso"}</small></span><span className="admin-updated">{dateLabel(property.updatedAt)}<small>{property.featured?"Destacada":"Publicación estándar"}</small></span><div className="admin-row-actions"><button type="button" onClick={()=>openEdit(property)} aria-label="Editar"><Pencil/></button><button type="button" onClick={()=>openDuplicate(property)} aria-label="Duplicar"><Copy/></button>{property.status==="published"&&<a href={`${PUBLIC_SITE}/propiedades/${property.slug}`} target="_blank" rel="noreferrer" aria-label="Ver"><Eye/></a>}<button className="danger" type="button" onClick={()=>void removeProperty(property)} aria-label="Eliminar"><Trash2/></button></div></article>)}
          {!loading && !propertyRows.length && <div className="admin-empty"><Search/><h3>No encontramos propiedades.</h3><p>Probá otro filtro o creá una publicación nueva.</p><button className="admin-empty-create" type="button" onClick={openCreate}><Plus/><span>Nueva propiedad</span></button></div>}
        </div>
        {view === "overview" && items.length > 5 && <button className="admin-see-all" type="button" onClick={()=>navigate("properties")}>Ver las {items.length} propiedades <ArrowUpRight/></button>}
      </section>}

      {view === "overview" && <section className="admin-lead-summary"><div><p>CONSULTAS</p><h2>{newLeads ? `${newLeads} nuevas oportunidades.` : "Consultas al día."}</h2><span>Todos los mensajes enviados desde las fichas llegan acá.</span></div><button type="button" onClick={()=>navigate("leads")}>Ver consultas <ArrowUpRight/></button></section>}

      {view === "developments" && <DevelopmentManager/>}

      {view === "performance" && <section className="admin-performance"><article className="admin-insight-hero"><div><p>LECTURA COMERCIAL</p><h2>{published} publicaciones activas.</h2><span>La cartera concentra {featured} propiedades destacadas y {newLeads} consultas nuevas.</span></div><TrendingUp/></article><div className="admin-insight-grid"><article><Activity/><span>CONVERSIÓN</span><strong>{leads.length ? Math.round((leads.filter(item=>item.status!=="new").length/leads.length)*100) : 0}%</strong><p>Consultas con seguimiento iniciado.</p></article><article><Users/><span>CONSULTAS</span><strong>{leads.length}</strong><p>Contactos registrados en el panel.</p></article><article><Building2/><span>INVENTARIO</span><strong>{items.length}</strong><p>Propiedades entre publicadas y borradores.</p></article><article><CircleDollarSign/><span>CARTERA</span><strong>USD {(portfolioValue/1000000).toFixed(1)}M</strong><p>Valor publicado de propiedades en venta.</p></article></div></section>}

      {view === "settings" && <SettingsManager signOutPath={signOutPath}/>}
      {view === "manual" && <AdminManual/>}
      {view === "leads" && <section className="admin-content-card admin-leads-card"><div className="admin-list-head"><div><p>BANDEJA DE ENTRADA</p><h2>Consultas recibidas</h2><span>Registrá el seguimiento sin perder conversaciones.</span></div><button type="button" onClick={()=>void loadData()}><RefreshCw/> Actualizar</button></div><div className="admin-lead-list">{leads.map(lead=>{const property=items.find(item=>item.id===lead.propertyId); return <article key={lead.id}><header><div className="lead-avatar">{lead.name.slice(0,2).toUpperCase()}</div><div><b>{lead.name}</b><span>{dateLabel(lead.createdAt)}</span></div><select value={lead.status} onChange={event=>void updateLead(lead.id,event.target.value as AdminLead["status"])} aria-label="Estado de consulta"><option value="new">Nueva</option><option value="contacted">Contactada</option><option value="closed">Cerrada</option></select></header><p>{lead.message}</p>{property&&<Link href={`/propiedades/${property.slug}`} target="_blank"><Building2/> {property.title}</Link>}<footer><div>{lead.email&&<a href={`mailto:${lead.email}`}><Mail/> {lead.email}</a>}{lead.phone&&<a href={`tel:${lead.phone}`}><Phone/> {lead.phone}</a>}</div><span className={`lead-state ${lead.status}`}>{leadLabel[lead.status]}</span><button type="button" onClick={()=>void removeLead(lead.id)} aria-label="Eliminar consulta"><Trash2/></button></footer></article>})}{!loading&&!leads.length&&<div className="admin-empty"><MessageSquareText/><h3>Todavía no hay consultas.</h3><p>Los mensajes enviados desde las propiedades aparecerán automáticamente.</p></div>}</div></section>}
    </section>

    {editorOpen && <div className="admin-editor-layer" role="dialog" aria-modal="true" aria-label={draft.id?"Editar propiedad":"Nueva propiedad"}><button className="admin-editor-backdrop" type="button" onClick={()=>setEditorOpen(false)} aria-label="Cerrar editor"/><form className="admin-editor" onSubmit={submit}><header><div><p>{draft.id?`REF. ID-${String(draft.id).padStart(4,"0")}`:"NUEVA PUBLICACIÓN"}</p><h2>{draft.id?"Editar propiedad":"Crear propiedad"}</h2></div><button type="button" onClick={()=>setEditorOpen(false)} aria-label="Cerrar"><X/></button></header><div className="admin-editor-progress"><button type="button" className={editorStep===1?"active":"complete"} onClick={()=>changeEditorStep(1)}><b>1</b>{"Informaci\u00f3n"}</button><i/><button type="button" className={editorStep===2?"active":editorStep>2?"complete":""} onClick={()=>changeEditorStep(2)} disabled={!canContinueEditor}><b>2</b>{"Ficha t\u00e9cnica"}</button><i/><button type="button" className={editorStep===3?"active":""} onClick={()=>changeEditorStep(3)} disabled={!canContinueEditor}><b>3</b>{"Im\u00e1genes"}</button></div><div className="admin-editor-body">
      {editorStep===1&&<section><div className="admin-form-title"><span>01</span><div><h3>Información principal</h3><p>Identidad, ubicación y condiciones comerciales.</p></div></div><div className="admin-form-grid"><label className="wide"><span>NOMBRE DE LA PROPIEDAD</span><input value={draft.title} onChange={event=>updateDraft("title",event.target.value)} required placeholder="Ej. Casa del Lago"/></label><label><span>OPERACIÓN</span><select value={draft.operation} onChange={event=>updateDraft("operation",event.target.value as Property["operation"])}><option>Venta</option><option>Alquiler</option><option>Alquiler temporario</option></select></label><label><span>TIPO</span><select value={draft.type} onChange={event=>updateDraft("type",event.target.value as Property["type"])}><option>Casa</option><option>Departamento</option><option>PH</option><option>Terreno</option></select></label><label><span>UBICACIÓN</span><input value={draft.location} onChange={event=>updateDraft("location",event.target.value)} required placeholder="Barrio, ciudad"/></label><label><span>ZONA</span><select value={draft.zone} onChange={event=>updateDraft("zone",event.target.value)}>{zones.map(zone=><option key={zone}>{zone}</option>)}</select></label><label><span>MONEDA</span><select value={draft.currency} onChange={event=>updateDraft("currency",event.target.value as Property["currency"])}><option>USD</option><option>ARS</option></select></label><div className="admin-price-composer wide"><label><span>TEXTO ANTES</span><input value={draft.pricePrefix??""} onChange={event=>updateDraft("pricePrefix",event.target.value)} placeholder="Ej. Desde"/></label><label><span>PRECIO</span><input type="number" min="0" value={draft.price} onChange={event=>updateDraft("price",Number(event.target.value))}/></label><label><span>TEXTO DESPUÉS</span><input value={draft.priceSuffix??""} onChange={event=>updateDraft("priceSuffix",event.target.value)} placeholder="Ej. x mes"/></label></div><label className="wide"><span>ENLACE / SLUG</span><input value={draft.slug} onChange={event=>updateDraft("slug",slugify(event.target.value))} placeholder="Se genera automáticamente"/></label></div></section>}
      {editorStep===2&&<section><div className="admin-form-title"><span>02</span><div><h3>Ficha técnica</h3><p>Todos los datos que se muestran en la ficha pública.</p></div></div><div className="admin-form-grid compact"><label><span>AMBIENTES</span><input type="number" min="1" value={draft.rooms} onChange={event=>updateDraft("rooms",Number(event.target.value))}/></label><label><span>DORMITORIOS</span><input type="number" min="0" value={draft.bedrooms} onChange={event=>updateDraft("bedrooms",Number(event.target.value))}/></label><label><span>BAÑOS</span><input type="number" min="0" value={draft.bathrooms} onChange={event=>updateDraft("bathrooms",Number(event.target.value))}/></label><label><span>COCHERAS</span><input type="number" min="0" value={draft.garages??0} onChange={event=>updateDraft("garages",Number(event.target.value))}/></label><label><span>SUPERFICIE TOTAL</span><input type="number" min="1" value={draft.area} onChange={event=>updateDraft("area",Number(event.target.value))}/></label><label><span>SUPERFICIE CUBIERTA</span><input type="number" min="0" value={draft.coveredArea??0} onChange={event=>updateDraft("coveredArea",Number(event.target.value))}/></label><label><span>ANTIGÜEDAD</span><input value={draft.age??""} onChange={event=>updateDraft("age",event.target.value)} placeholder="A estrenar"/></label><label><span>ORIENTACIÓN</span><input value={draft.orientation??""} onChange={event=>updateDraft("orientation",event.target.value)} placeholder="Norte"/></label><label className="wide"><span>ESTADO GENERAL</span><input value={draft.condition??""} onChange={event=>updateDraft("condition",event.target.value)} placeholder="Excelente"/></label><label className="wide"><span>COMODIDADES, SEPARADAS POR COMAS</span><input value={draft.amenitiesText} onChange={event=>updateDraft("amenitiesText",event.target.value)} placeholder="Piscina, jardín, parrilla, cochera"/></label><label className="wide"><span>DESCRIPCIÓN</span><textarea value={draft.description} onChange={event=>updateDraft("description",event.target.value)} placeholder="Describí la propiedad, sus diferenciales y su entorno."/></label></div></section>}
      {editorStep===3&&<section><div className="admin-form-title"><span>03</span><div><h3>Galería y publicación</h3><p>Subí fotos desde tu equipo, elegí la portada y publicá.</p></div></div><div className="admin-upload-zone"><label className={uploading?"uploading":""}><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={uploadImages} disabled={uploading}/>{uploading?<LoaderCircle className="spin"/>:<Upload/>}<b>{uploading?"Cargando imágenes...":"Seleccionar imágenes"}</b><span>JPG, PNG, WEBP o AVIF · máximo 10 MB por archivo</span></label><div className="admin-url-field"><span>O PEGÁ UNA URL EXTERNA</span><div><input value={draft.image.startsWith("http")?draft.image:""} onChange={event=>updateDraft("image",event.target.value)} placeholder="https://..."/><ImageIcon/></div></div></div><div className="admin-gallery-manager">{[draft.image,...draft.gallery].filter(Boolean).map((url,index)=><article key={`${url}-${index}`} className={index===0?"primary":""}><img src={url} alt=""/><span>{index===0?"PORTADA":String(index+1).padStart(2,"0")}</span>{index!==0&&<button type="button" onClick={()=>setPrimary(url)}><Star/> Portada</button>}<button className="remove" type="button" onClick={()=>void removeImage(url)} aria-label="Quitar imagen"><X/></button></article>)}{!draft.image&&!draft.gallery.length&&<div className="admin-gallery-empty"><ImageIcon/><b>La galería está vacía</b><span>La primera foto que cargues será la portada.</span></div>}</div><div className="admin-publication-settings"><label><span>ESTADO</span><select value={draft.status} onChange={event=>updateDraft("status",event.target.value as AdminStatus)}><option value="published">Publicada</option><option value="draft">Borrador</option><option value="reserved">Reservada</option></select></label><button className={`admin-feature-toggle ${draft.featured?"active":""}`} type="button" onClick={()=>updateDraft("featured",!draft.featured)}><Star fill={draft.featured?"currentColor":"none"}/><span><b>Destacar propiedad</b><small>Aparecerá primero en la home y el catálogo.</small></span><i>{draft.featured?"Sí":"No"}</i></button></div></section>}
    </div><footer><button type="button" onClick={()=>setEditorOpen(false)}>Cancelar</button><div>{editorStep>1&&<button type="button" onClick={()=>changeEditorStep((editorStep-1) as 1|2)}><ArrowLeft/> Anterior</button>}{editorStep<3?<button className="primary" type="button" onClick={()=>changeEditorStep((editorStep+1) as 2|3)} disabled={!canContinueEditor}>Siguiente <ArrowRight/></button>:<><button type="button" onClick={()=>void persistProperty("draft")} disabled={saving}><FileText/> Guardar borrador</button><button className="primary" type="submit" disabled={saving||uploading}>{saving?"Guardando...":<><Check/> Guardar propiedad</>}</button></>}</div></footer></form></div>}
  </main>;
}
