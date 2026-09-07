"use client";

import { useEffect } from "react";

/**
 * [data-reveal] taşıyan her düğümü görünür olduğunda "in" durumuna alır.
 * Bölümler sonradan monte edilse bile MutationObserver ile yakalanır.
 */
export default function RevealProvider() {
  useEffect(() => {
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-reveal", "in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    const scan = () => {
      document.querySelectorAll("[data-reveal]").forEach((node) => {
        if (seen.has(node) || node.getAttribute("data-reveal") === "in") return;
        seen.add(node);
        io.observe(node);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
