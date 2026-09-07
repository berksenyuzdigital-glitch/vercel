"use client";

import { useEffect, useRef, useState } from "react";
import { process } from "@/lib/clinic";

export default function Process() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = refs.current.findIndex((node) => node === entry.target);
          if (index >= 0) setActive(index);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    refs.current.forEach((node) => node && io.observe(node));
    return () => io.disconnect();
  }, []);

  return (
    <section id="surec" data-nav="light" className="shell py-24 md:py-36">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <p className="eyebrow" data-reveal>
              (04) — Süreç
            </p>
            <h2 className="display fluid-lg mt-6 max-w-xs" data-reveal>
              Dört adım, <em>sürpriz yok</em>.
            </h2>

            <div className="mt-10 flex items-center gap-4" aria-hidden>
              {process.map((item, i) => (
                <span
                  key={item.step}
                  className={`h-px flex-1 transition-all duration-700 ${
                    i <= active ? "bg-forest" : "bg-ink/15"
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 font-mono text-xs text-ink/50">
              {`0${active + 1}`} / {`0${process.length}`}
            </p>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {process.map((item, i) => (
            <div
              key={item.step}
              ref={(node) => {
                refs.current[i] = node;
              }}
              className={`border-t hairline py-12 transition-opacity duration-700 first:border-t-0 ${
                active === i ? "opacity-100" : "opacity-45"
              }`}
              data-reveal
            >
              <div className="flex items-start gap-6">
                <span className="font-mono text-xs text-clay">{item.step}</span>
                <div>
                  <h3 className="display text-3xl md:text-4xl">{item.title}</h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/65">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
