"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/lib/clinic";

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % testimonials.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [index]);

  const go = (next: number) =>
    setIndex((next + testimonials.length) % testimonials.length);

  return (
    <section data-nav="light" className="shell border-y hairline py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="eyebrow" data-reveal>
            (06) — Hasta Sözleri
          </p>
          <p className="mt-6 font-mono text-xs text-ink/45">
            {`0${index + 1}`} — {`0${testimonials.length}`}
          </p>
        </div>

        <div className="md:col-span-9">
          <div className="relative min-h-[13rem] md:min-h-[15rem]">
            {testimonials.map((item, i) => (
              <figure
                key={item.name}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-all duration-[900ms] [transition-timing-function:var(--ease-out-expo)] ${
                  i === index
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-6 opacity-0"
                }`}
              >
                <blockquote className="display text-3xl leading-[1.15] md:text-5xl">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink/50">
                  <span className="text-ink">{item.name}</span>
                  <span aria-hidden>/</span>
                  <span>{item.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Önceki yorum"
              className="grid h-11 w-11 place-items-center rounded-full border hairline transition-colors hover:bg-forest hover:text-bone"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Sonraki yorum"
              className="grid h-11 w-11 place-items-center rounded-full border hairline transition-colors hover:bg-forest hover:text-bone"
            >
              →
            </button>
            <div className="ml-4 flex flex-1 gap-2" aria-hidden>
              {testimonials.map((item, i) => (
                <span
                  key={item.name}
                  className={`h-px flex-1 transition-colors duration-500 ${
                    i === index ? "bg-forest" : "bg-ink/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
