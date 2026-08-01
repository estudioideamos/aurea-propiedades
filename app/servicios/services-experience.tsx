"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";

const services = [
  {
    number: "01",
    title: "Compra y venta",
    description: "Diseñamos una estrategia comercial completa para presentar, difundir y negociar cada propiedad con criterio.",
    points: ["Producción y publicación digital", "Gestión de visitas e interesados", "Negociación y acompañamiento al cierre"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1500&q=88",
  },
  {
    number: "02",
    title: "Administración de alquileres",
    description: "Cuidamos la relación locativa de punta a punta para que propietarios e inquilinos tengan una experiencia ordenada.",
    points: ["Selección y validación de perfiles", "Contratos y cobranza mensual", "Seguimiento de impuestos y servicios"],
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1500&q=88",
  },
  {
    number: "03",
    title: "Tasaciones",
    description: "Determinamos el valor real de mercado con información comparable, lectura de contexto y una mirada objetiva.",
    points: ["Análisis comparativo de mercado", "Evaluación de atributos y estado", "Informe y recomendación comercial en 48 h"],
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1500&q=88",
  },
  {
    number: "04",
    title: "Sucesiones",
    description: "Coordinamos la documentación, los profesionales y la comercialización para simplificar una operación sensible.",
    points: ["Articulación legal y comercial", "Organización entre herederos", "Honorarios asociados a la operación"],
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1500&q=88",
  },
  {
    number: "05",
    title: "Hipotecas y financiación",
    description: "Te orientamos para evaluar alternativas de crédito y llegar a la escritura con la documentación preparada.",
    points: ["Análisis de opciones disponibles", "Preparación de documentación", "Coordinación con entidades y escribanía"],
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1500&q=88",
  },
];

export function ServicesExperience() {
  const [active, setActive] = useState(0);
  const current = services[active];

  return <section className="editorial-services" aria-labelledby="services-title">
    <header className="editorial-services-head">
      <div><span className="section-tag">01 / SERVICIOS INMOBILIARIOS</span><h2 id="services-title"><span>Soluciones para cada etapa</span><span>de tu propiedad.</span></h2></div>
      <p>Una gestión integral, clara y personalizada. Activamos el equipo indicado para que cada decisión tenga respaldo y cada proceso avance.</p>
    </header>
    <div className="editorial-services-layout">
      <div className="editorial-services-list" role="tablist" aria-label="Servicios de Áurea">
        {services.map((service, index) => <button key={service.number} type="button" role="tab" aria-selected={active === index} className={active === index ? "active" : ""} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
          <span className="service-number">/ {service.number} /</span>
          <span className="service-row-copy"><b>{service.title}</b><small>{service.description}</small></span>
          <span className="service-row-arrow"><ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></span>
        </button>)}
      </div>
      <article className="editorial-service-visual" key={current.number}>
        <img src={current.image} alt={current.title}/><div className="editorial-service-shade"/>
        <span className="visual-index">ÁUREA / {current.number}</span>
        <div className="visual-copy"><p>SERVICIO ACTIVO</p><h3>{current.title}</h3><ul>{current.points.map(point => <li key={point}><Check aria-hidden="true" strokeWidth={2.3}/>{point}</li>)}</ul></div>
      </article>
    </div>
  </section>;
}