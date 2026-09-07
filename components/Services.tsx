"use client";

import { useRef, useState } from "react";
import { services } from "@/lib/clinic";
import { openBooking } from "@/lib/events";

export default function Services() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = preview.current;
    if (!node) return;
    node.style.transform = `translate3d(${event.clientX + 28}px, ${event.clientY - 130}px, 0)`;
  };

  return (
    <section id="tedaviler" data-nav="light" className="relative py-24 md:py-36" onPointerMove={handleMove}>
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b hairline pb-8">
          <div>
            <p className="eyebrow" data-reveal>
              (02) — Tedaviler
            </p>
            <h2 className="display fluid-lg mt-6 max-w-2xl" data-reveal>
              Her biri ayrı bir <em>uzmanlık</em>.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ink/60" data-reveal>
            Satırların üzerine gelin, detay için tıklayın. Randevu adımında seçiminiz hazır gelir.
          </p>
        </div>

        <ul className="mt-2">
          {services.map((service, i) => {
            const isOpen = open === service.id;
            return (
              <li
                key={service.id}
                className="border-b hairline"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
                onPointerEnter={() => setActive(service.id)}
                onPointerLeave={() => setActive((v) => (v === service.id ? null : v))}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : service.id)}
                  aria-expanded={isOpen}
                  className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-5 py-7 text-left md:gap-10"
                >
                  <span className="font-mono text-xs text-ink/40">{service.index}</span>

                  <span className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <span className="display text-3xl transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-2 md:text-5xl">
                      {service.title}
                    </span>
                    <span className="hidden max-w-sm text-sm text-ink/50 lg:block">
                      {service.short}
                    </span>
                  </span>

                  <span className="flex items-center gap-6">
                    <span className="hidden font-mono text-xs text-ink/45 sm:block">
                      {service.priceFrom}&apos;den
                    </span>
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full border hairline text-lg transition-all duration-500 group-hover:border-forest group-hover:bg-forest group-hover:text-bone ${
                        isOpen ? "rotate-45 border-forest bg-forest text-bone" : ""
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-700 [transition-timing-function:var(--ease-out-expo)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-8 pb-10 md:grid-cols-[1fr_auto] md:items-end md:pl-[4.5rem]">
                      <div className="max-w-2xl">
                        <p className="text-base leading-relaxed text-ink/70">{service.description}</p>
                        <ul className="mt-6 flex flex-wrap gap-2">
                          {service.tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded-full border hairline px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink/60"
                            >
                              {tag}
                            </li>
                          ))}
                          <li className="rounded-full bg-mint/40 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-forest">
                            {service.duration} dk seans
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => openBooking({ serviceId: service.id })}
                        className="btn btn-solid shrink-0"
                      >
                        Bu tedavi için randevu
                        <span aria-hidden>↗</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* İmleci takip eden önizleme kartı (yalnız işaretçi cihazlarda) */}
      <div
        ref={preview}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-30 hidden w-64 overflow-hidden rounded-2xl border border-forest/15 bg-bone-dim/90 p-5 backdrop-blur-md transition-opacity duration-500 lg:block ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="noise-card mb-4 h-28 rounded-xl bg-forest" />
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink/50">
          {services.find((s) => s.id === active)?.duration} dakika · seans
        </p>
        <p className="mt-2 text-sm leading-snug text-ink/80">
          {services.find((s) => s.id === active)?.short}
        </p>
      </div>
    </section>
  );
}
