import { ArrowUpRight, BookOpen, Building2, CheckCircle2, CircleHelp, CloudCog, Eye, FileImage, Gauge, Lightbulb, Mail, Settings, Sparkles, type LucideIcon } from "lucide-react";

type Guide = {
  number: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  steps: string[];
  tip: string;
  link?: { href: string; label: string };
};

const guides: Guide[] = [
  {
    number: "01",
    title: "Propiedades",
    icon: Building2,
    summary: "Cre\u00e1, edit\u00e1 y public\u00e1 cada inmueble desde un flujo guiado.",
    steps: [
      "Ingres\u00e1 a Propiedades y eleg\u00ed Nueva propiedad.",
      "Complet\u00e1 nombre, operaci\u00f3n, ubicaci\u00f3n y precio. En tipo y zona pod\u00e9s elegir una opci\u00f3n existente o escribir una nueva; las opciones importadas desde Tokko se agregan autom\u00e1ticamente.",
      "Avanz\u00e1 a Ficha t\u00e9cnica para cargar ambientes, superficies, estado y comodidades.",
      "Sub\u00ed las im\u00e1genes, defin\u00ed la portada y guard\u00e1 como borrador o public\u00e1.",
    ],
    tip: "Una propiedad publicada aparece inmediatamente en el cat\u00e1logo y en su ficha p\u00fablica.",
  },
  {
    number: "02",
    title: "Emprendimientos",
    icon: Sparkles,
    summary: "Gestion\u00e1 proyectos, tipolog\u00edas, entrega, equipo e im\u00e1genes.",
    steps: [
      "Abr\u00ed Emprendimientos y seleccion\u00e1 Nuevo emprendimiento.",
      "Carg\u00e1 el estado de obra, fecha de entrega, unidades y esquema de precio.",
      "Complet\u00e1 la descripci\u00f3n, amenities, desarrollador y estudio de arquitectura.",
      "Orden\u00e1 la galer\u00eda, eleg\u00ed una portada clara y public\u00e1 cuando la ficha est\u00e9 lista.",
    ],
    tip: "Pod\u00e9s duplicar un proyecto para crear una variante sin volver a cargar toda la informaci\u00f3n.",
  },
  {
    number: "03",
    title: "Im\u00e1genes",
    icon: FileImage,
    summary: "Manten\u00e9 una galer\u00eda ordenada y consistente en todas las fichas.",
    steps: [
      "Us\u00e1 im\u00e1genes horizontales, luminosas y sin textos superpuestos.",
      "La primera imagen es la portada. Pod\u00e9s cambiarla desde el bot\u00f3n Portada.",
      "Revis\u00e1 la ficha p\u00fablica despu\u00e9s de guardar para comprobar encuadres y orden.",
      "Si una imagen ya no corresponde, elimin\u00e1la desde el editor y volv\u00e9 a guardar.",
    ],
    tip: "Para una carga m\u00e1s r\u00e1pida, prepar\u00e1 las fotos en JPG o WebP y evit\u00e1 archivos excesivamente pesados.",
  },
  {
    number: "04",
    title: "Consultas",
    icon: Mail,
    summary: "Centraliz\u00e1 contactos y registr\u00e1 el avance de cada oportunidad.",
    steps: [
      "Las consultas enviadas desde las propiedades llegan autom\u00e1ticamente a la bandeja.",
      "Abr\u00ed Consultas para ver nombre, mensaje, correo, tel\u00e9fono y propiedad de inter\u00e9s.",
      "Marc\u00e1 cada contacto como Nueva, Contactada o Cerrada para mantener el seguimiento.",
      "Us\u00e1 los accesos de correo o tel\u00e9fono para responder sin copiar datos manualmente.",
    ],
    tip: "Actualiz\u00e1 el estado despu\u00e9s de cada contacto para que el panel refleje la situaci\u00f3n real.",
  },
  {
    number: "05",
    title: "Ajustes y acceso",
    icon: Settings,
    summary: "Actualiz\u00e1 los datos p\u00fablicos y administr\u00e1 tu cuenta.",
    steps: [
      "En Ajustes del sitio pod\u00e9s modificar los datos comerciales visibles en la web.",
      "En Cuenta administradora pod\u00e9s cambiar el nombre, el email de ingreso o la contrase\u00f1a.",
      "Los cambios sensibles requieren confirmar la contrase\u00f1a actual.",
      "Si la olvidaste, us\u00e1 Recuperar contrase\u00f1a desde la pantalla de ingreso y verific\u00e1 tu identidad.",
      "Para salir de forma segura, us\u00e1 Cerrar sesi\u00f3n al pie del men\u00fa.",
    ],
    tip: "El correo administrador es independiente del correo comercial que ven los clientes.",
  },
  {
    number: "06",
    title: "Tokko Broker",
    icon: CloudCog,
    summary: "Conect\u00e1, sincroniz\u00e1 o desvincul\u00e1 Tokko sin perder la carga manual.",
    steps: [
      "En Tokko, complet\u00e1 la ficha, el precio, los detalles y la multimedia de la propiedad.",
      "Cambi\u00e1 el estado de la propiedad a Disponible. Tu usuario de Tokko necesita permiso para hacerlo.",
      "En la parte superior de la ficha activ\u00e1 el interruptor general Publicar y eleg\u00ed mostrarla en la web. Si Publicar est\u00e1 apagado, no aparecer\u00e1 en el sitio.",
      "En Ideamos, abr\u00ed Ajustes del sitio > Tokko Broker. Peg\u00e1 la API key obtenida en Mi Empresa > Permisos. El ID de empresa es opcional y se conserva como referencia de la cuenta. Cada sincronizaci\u00f3n incorpora tambi\u00e9n las tipolog\u00edas y localidades reales para usarlas en los filtros.",
      "Prob\u00e1 la conexi\u00f3n, guard\u00e1 la integraci\u00f3n como Activa y presion\u00e1 Sincronizar ahora. Esta acci\u00f3n hace una revisi\u00f3n completa de todas las propiedades habilitadas para web.",
      "Solo ingresan las propiedades disponibles y habilitadas para web. Si Tokko devuelve 0, revis\u00e1 el interruptor Publicar de cada ficha y volv\u00e9 a probar la conexi\u00f3n.",
      "Para pausar, dej\u00e1 la integraci\u00f3n Inactiva y guard\u00e1. Para eliminar la API key, los IDs y el historial, us\u00e1 Desvincular Tokko y confirm\u00e1. Las propiedades existentes se conservan.",
    ],
    tip: "Desvincular Tokko no borra las propiedades manuales ni las ya importadas; simplemente detiene el v\u00ednculo y elimina las credenciales guardadas.",
    link: { href: "https://dudas.tokkobroker.com/es/articles/432251-como-cargar-una-propiedad", label: "Ver gu\u00eda oficial de Tokko" },
  },
];

export function AdminManual() {
  return <section className="admin-manual">
    <div className="manual-hero">
      <div className="manual-hero-copy"><p>CENTRO DE AYUDA</p><h2>Todo el panel, explicado paso a paso.</h2><span>Una gu&iacute;a clara para publicar, actualizar y controlar la plataforma sin depender de conocimientos t&eacute;cnicos.</span></div>
      <div className="manual-hero-symbol"><BookOpen/><span>GU&Iacute;A<br/>ONLINE</span></div>
    </div>

    <div className="manual-quick-grid">
      <article><Gauge/><b>6 recorridos</b><span>Los procesos principales del panel.</span></article>
      <article><CheckCircle2/><b>Flujo guiado</b><span>Cada alta se organiza en tres pasos.</span></article>
      <article><Eye/><b>Vista p&uacute;blica</b><span>Comprob&aacute; el resultado desde el mismo panel.</span></article>
    </div>

    <div className="manual-section-head"><div><p>MANUAL OPERATIVO</p><h2>Eleg&iacute; qu&eacute; necesit&aacute;s hacer.</h2></div><span>Despleg&aacute; cada tema para ver las instrucciones completas.</span></div>

    <div className="manual-guides">
      {guides.map((guide, index) => {
        const Icon = guide.icon;
        return <details key={guide.title} open={index === 0}>
          <summary><span className="manual-guide-number">{guide.number}</span><span className="manual-guide-icon"><Icon/></span><span className="manual-guide-copy"><b>{guide.title}</b><small>{guide.summary}</small></span><span className="manual-guide-toggle">+</span></summary>
          <div className="manual-guide-body"><ol>{guide.steps.map((step, stepIndex)=><li key={step}><span>{String(stepIndex+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol><aside><Lightbulb/><div><b>Consejo Ideamos</b><p>{guide.tip}</p>{guide.link && <a href={guide.link.href} target="_blank" rel="noreferrer">{guide.link.label}<ArrowUpRight/></a>}</div></aside></div>
        </details>;
      })}
    </div>

    <div className="manual-support">
      <div><CircleHelp/><span><p>AYUDA R&Aacute;PIDA</p><h3>Si algo no se refleja, actualiz&aacute; antes de volver a cargarlo.</h3></span></div>
      <ol><li><b>01</b>Guard&aacute; los cambios.</li><li><b>02</b>Us&aacute; el bot&oacute;n actualizar.</li><li><b>03</b>Abr&iacute; la vista p&uacute;blica.</li></ol>
      <a href="https://inmobiliaria.ideamos.ar" target="_blank" rel="noreferrer">Ver sitio p&uacute;blico <ArrowUpRight/></a>
    </div>
  </section>;
}
