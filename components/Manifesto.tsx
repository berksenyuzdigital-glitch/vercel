"use client";

import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/clinic";

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const numeric = Number(value.replace(/\./g, "").replace(",", "."));
    if (Number.isNaN(numeric)) return;

    const decimals = value.includes(".") && value.split(".").length === 2 && value.length <= 3 ? 1 : 0;
    setText(decimals ? "0.0" : "0");

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const duration = 1400;
        const start = performance.now();

        const frame = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          const current = numeric * eased;
          setText(
            decimals
              ? current.toFixed(1)
              : Math.round(current).toLocaleString("tr-TR"),
          );
          if (p < 1) requestAnimationFrame(frame);
          else setText(value);
        };
        requestAnimationFrame(frame);
      },
      { threshold: 0.5 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {text}
    </span>
  );
}

export default function Manifesto() {
  return (
    <section id="klinik" data-nav="light" className="shell py-24 md:py-36">
      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow" data-reveal>
            (01) — Klinik
          </p>
          <h2 className="display fluid-lg mt-6 max-w-sm" data-reveal>
            Az sayıda hasta, <em>tam</em> dikkat.
          </h2>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <p className="text-xl leading-relaxed text-ink/80 md:text-2xl" data-reveal>
            Aurea bir zincir klinik değil; günde on iki randevu alan bir atölye. Her tedavi planı
            tek bir hekimin sorumluluğunda başlar ve o hekimle biter.
          </p>
          <p
            className="mt-6 text-base leading-relaxed text-ink/60"
            data-reveal
            style={{ ["--reveal-delay" as string]: "120ms" }}
          >
            Kendi dijital laboratuvarımızda ürettiğimiz restorasyonlar, ağız içi tarayıcıdan çıkan
            veriyle mikron seviyesinde eşleşir. Bu yüzden prova sayısı azalır, seans süreleri kısalır
            ve sonuç ilk günden tasarladığımız şeye benzer. Randevunuza ayırdığımız süre asla bir
            sonraki hastanın gecikmesi anlamına gelmez.
          </p>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t hairline pt-10 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
                <p className="display text-4xl md:text-5xl">
                  <Counter value={stat.value} />
                  <span className="text-clay">{stat.suffix}</span>
                </p>
                <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
