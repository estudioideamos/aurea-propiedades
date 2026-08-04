"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState, type TouchEvent } from "react";

type PropertyGalleryProps = { images: string[]; title: string };

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  const visibleImages = images.slice(0, 5);
  const previous = () => setActive(current => current === null ? 0 : (current - 1 + images.length) % images.length);
  const next = () => setActive(current => current === null ? 0 : (current + 1) % images.length);

  useEffect(() => {
    if (active === null) return;
    const originalOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive(current => current === null ? 0 : (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActive(current => current === null ? 0 : (current + 1) % images.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = originalOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [active, images.length]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => { touchStart.current = event.touches[0]?.clientX ?? null; };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    if (Math.abs(distance) > 45) distance > 0 ? previous() : next();
    touchStart.current = null;
  };

  return <>
    <section className="detail-gallery-grid" aria-label={"Galería de " + title}>
      {visibleImages.map((image, index) => <button type="button" onClick={() => setActive(index)} key={image + "-" + index} className={index === 0 ? "gallery-main" : "gallery-small gallery-" + index} aria-label={"Abrir foto " + (index + 1) + " de " + images.length}>
        <img src={image} alt={index === 0 ? title : title + ", vista " + (index + 1)} loading={index === 0 ? "eager" : "lazy"} decoding="async"/>
        {index === 0 && <span>Imagen principal</span>}
        {index === visibleImages.length - 1 && images.length > 1 && <span className="gallery-count">VER GALERÍA / {String(images.length).padStart(2, "0")}</span>}
      </button>)}
    </section>
    {active !== null && <div className="property-lightbox" role="dialog" aria-modal="true" aria-label={"Galería de " + title} onClick={() => setActive(null)}>
      <div className="lightbox-counter"><b>{String(active + 1).padStart(2, "0")}</b><span>/ {String(images.length).padStart(2, "0")}</span></div>
      <button className="lightbox-close" type="button" onClick={() => setActive(null)} aria-label="Cerrar galería"><X aria-hidden="true"/></button>
      <div className="lightbox-stage" onClick={event => event.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <button className="lightbox-arrow lightbox-prev" type="button" onClick={previous} aria-label="Foto anterior"><ChevronLeft aria-hidden="true"/></button>
        <img key={active} src={images[active]} alt={title + ", foto " + (active + 1) + " de " + images.length}/>
        <button className="lightbox-arrow lightbox-next" type="button" onClick={next} aria-label="Foto siguiente"><ChevronRight aria-hidden="true"/></button>
      </div>
      <div className="lightbox-thumbs" onClick={event => event.stopPropagation()}>
        {images.map((image, index) => <button type="button" key={"thumb-" + image + "-" + index} className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-label={"Ver foto " + (index + 1)}><img src={image} alt=""/></button>)}
      </div>
    </div>}
  </>;
}
