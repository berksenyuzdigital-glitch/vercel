"use client";

import { useState } from "react";
import { faq } from "@/lib/clinic";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="sorular" data-nav="light" className="shell py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow" data-reveal>
            (07) — Sorular
          </p>
          <h2 className="display fluid-lg mt-6 max-w-xs" data-reveal>
            Merak <em>edilenler</em>.
          </h2>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b hairline first:border-t" data-reveal>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg text-ink md:text-xl">{item.q}</span>
                  <span
                    className={`shrink-0 text-xl transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-700 [transition-timing-function:var(--ease-out-expo)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-7 text-base leading-relaxed text-ink/65">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
