"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const revealSelector = [
  ".property-card",
  ".development-card",
  ".related-grid > article",
].join(",");

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    body.classList.remove("route-enter");
    void body.offsetWidth;
    body.classList.add("route-enter");
    const timer = window.setTimeout(() => body.classList.remove("route-enter"), 560);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observed = new WeakSet<Element>();
    const observer = reducedMotion ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer?.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5%" });

    const register = (root: ParentNode = document) => {
      root.querySelectorAll(revealSelector).forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.classList.add("site-reveal-item");
        (element as HTMLElement).style.setProperty("--reveal-order", String(index % 6));
        if (reducedMotion) element.classList.add("is-visible");
        else observer?.observe(element);
      });
    };

    register();
    const mutations = new MutationObserver((entries) => {
      entries.forEach((entry) => entry.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(revealSelector)) register(node.parentNode ?? document);
        else register(node);
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
