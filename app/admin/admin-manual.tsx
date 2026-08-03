import { ArrowUpRight, BookOpen, Building2, CheckCircle2, CircleHelp, Eye, FileImage, Gauge, Lightbulb, Mail, Settings, Sparkles } from "lucide-react";

const guides = [
  {
    number: "01",
    title: "Propiedades",
    icon: Building2,
    summary: "Creá, editá y publicá cada inmueble desde un flujo guiado.",
    steps: [
      "Ingresá a Propiedades y elegí Nueva propiedad.",
      "Completá nombre, operación, ubicación y precio. Los textos antes y después del precio son opcionales.",
      "Avanzá a Ficha técnica para cargar ambientes, superficies, estado y comodidades.",
      "Subí las imágenes, definí la portada y guardá como borrador o publicá.",
    ],
    tip: "Una propiedad publicada aparece inmediatamente en el catálogo y en su ficha pública.",
  },
  {
    number: "02",
    title: "Emprendimientos",
    icon: Sparkles,
    summary: "Gestioná proyectos, tipologías, entrega, equipo e imágenes.",
    steps: [
      "Abrí Emprendimientos y seleccioná Nuevo emprendimiento.",
      "Cargá el estado de obra, fecha de entrega, unidades y esquema de precio.",
      "Completá la descripción, amenities, desarrollador y estudio de arquitectura.",
      "Ordená la galería, elegí una portada clara y publicá cuando la ficha esté lista.",
    ],
    tip: "Podés duplicar un proyecto para crear una variante sin volver a cargar toda la información.",
  },
  {
    number: "03",
    title: "Imágenes",
    icon: FileImage,
    summary: "Mantené una galería ordenada y consistente en todas las fichas.",
    steps: [
      "Usá imágenes horizontales, luminosas y sin textos superpuestos.",
      "La primera imagen es la portada. Podés cambiarla desde el botón Portada.",
      "Revisá la ficha pública después de guardar para comprobar encuadres y orden.",
      "Si una imagen ya no corresponde, eliminála desde el editor y volvé a guardar.",
    ],
    tip: "Para una carga más rápida, prepará las fotos en JPG o WebP y evitá archivos excesivamente pesados.",
  },
  {
    number: "04",
    title: "Consultas",
    icon: Mail,
    summary: "Centralizá contactos y registrá el avance de cada oportunidad.",
    steps: [
      "Las consultas enviadas desde las propiedades llegan automáticamente a la bandeja.",
      "Abrí Consultas para ver nombre, mensaje, correo, teléfono y propiedad de interés.",
      "Marcá cada contacto como Nueva, Contactada o Cerrada para mantener el seguimiento.",
      "Usá los accesos de correo o teléfono para responder sin copiar datos manualmente.",
    ],
    tip: "Actualizá el estado después de cada contacto para que el panel refleje la situación real.",
  },
  {
    number: "05",
    title: "Ajustes y acceso",
    icon: Settings,
    summary: "Actualizá los datos públicos y administrá tu sesión.",
    steps: [
      "En Ajustes del sitio podés modificar nombre, correo, teléfono, dirección y horarios.",
      "Guardá los cambios y revisá el sitio público desde el acceso del menú lateral.",
      "El correo administrador es independiente del correo comercial que se muestra a clientes.",
      "Para salir de forma segura, usá Cerrar sesión al pie del menú.",
    ],
    tip: "Antes de cerrar la sesión, confirmá que cualquier editor abierto haya sido guardado.",
  },
];

export function AdminManual() {
  return <section className="admin-manual">
    <div className="manual-hero">
      <div className="manual-hero-copy"><p>CENTRO DE AYUDA</p><h2>Todo el panel, explicado paso a paso.</h2><span>Una guía clara para publicar, actualizar y controlar la plataforma sin depender de conocimientos técnicos.</span></div>
      <div className="manual-hero-symbol"><BookOpen/><span>GUÍA<br/>ONLINE</span></div>
    </div>

    <div className="manual-quick-grid">
      <article><Gauge/><b>5 recorridos</b><span>Los procesos principales del panel.</span></article>
      <article><CheckCircle2/><b>Flujo guiado</b><span>Cada alta se organiza en tres pasos.</span></article>
      <article><Eye/><b>Vista pública</b><span>Comprobá el resultado desde el mismo panel.</span></article>
    </div>

    <div className="manual-section-head"><div><p>MANUAL OPERATIVO</p><h2>Elegí qué necesitás hacer.</h2></div><span>Desplegá cada tema para ver las instrucciones completas.</span></div>

    <div className="manual-guides">
      {guides.map((guide, index) => {
        const Icon = guide.icon;
        return <details key={guide.title} open={index === 0}>
          <summary><span className="manual-guide-number">{guide.number}</span><span className="manual-guide-icon"><Icon/></span><span className="manual-guide-copy"><b>{guide.title}</b><small>{guide.summary}</small></span><span className="manual-guide-toggle">+</span></summary>
          <div className="manual-guide-body"><ol>{guide.steps.map((step, stepIndex)=><li key={step}><span>{String(stepIndex+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol><aside><Lightbulb/><div><b>Consejo Ideamos</b><p>{guide.tip}</p></div></aside></div>
        </details>;
      })}
    </div>

    <div className="manual-support">
      <div><CircleHelp/><span><p>AYUDA RÁPIDA</p><h3>Si algo no se refleja, actualizá antes de volver a cargarlo.</h3></span></div>
      <ol><li><b>01</b>Guardá los cambios.</li><li><b>02</b>Usá el botón actualizar.</li><li><b>03</b>Abrí la vista pública.</li></ol>
      <a href="https://inmobiliaria.ideamos.ar" target="_blank" rel="noreferrer">Ver sitio público <ArrowUpRight/></a>
    </div>
  </section>;
}
