"use client";

import { useRef } from "react";

const CARDS = [
  {
    n: "A",
    title: "Dijital Laboratuvar",
    text: "Restorasyonlar klinik içinde tasarlanır ve frezelenir. Dış laboratuvar beklemesi yok.",
    tint: "#a8e6c9",
  },
  {
    n: "B",
    title: "Mikroskop Altında",
    text: "Kanal tedavisi ve kesim işlemleri 25 kat büyütmeyle uygulanır.",
    tint: "#c9a887",
  },
  {
    n: "C",
    title: "Ağız İçi Tarayıcı",
    text: "Ölçü macunu yok. Tarama 90 saniye sürer, veri anında laboratuvara düşer.",
    tint: "#b9c8f2",
  },
  {
    n: "D",
    title: "Sterilizasyon Protokolü",
    text: "Her set tek hastaya özel paketlenir, izlenebilir barkodla kayıt altına alınır.",
    tint: "#e6c9a8",
  },
  {
    n: "E",
    title: "Sessiz Bekleme",
    text: "Randevu aralıkları çakışmayacak şekilde planlanır; bekleme salonu doldurulmaz.",
    tint: "#a8e6c9",
  },
];

export default function Atelier() {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scroll: 0 });

  const onPointerDown = (event: React.PointerEvent) => {
    const node = track.current;
    if (!node) return;
    drag.current = { active: true, startX: event.clientX, scroll: node.scrollLeft };
    node.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const node = track.current;
    if (!node || !drag.current.active) return;
    node.scrollLeft = drag.current.scroll - (event.clientX - drag.current.startX);
  };

  const onPointerUp = () => {
    drag.current.active = false;
  };

  return (
    <section data-nav="light" className="overflow-hidden py-24 md:py-32">
      <div className="shell flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow" data-reveal>
            (05) — Atölye
          </p>
          <h2 className="display fluid-lg mt-6 max-w-xl" data-reveal>
            İşin <em>zanaat</em> tarafı.
          </h2>
        </div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink/45" data-reveal>
          ← sürükleyin →
        </p>
      </div>

      <div
        ref={track}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        data-cursor
        className="no-scrollbar mt-12 flex cursor-grab gap-5 overflow-x-auto px-[clamp(1.25rem,4vw,4rem)] pb-4 active:cursor-grabbing"
      >
        {CARDS.map((card, i) => (
          <article
            key={card.n}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
            className="group relative aspect-[4/5] w-[78vw] shrink-0 select-none overflow-hidden rounded-3xl bg-forest p-8 text-bone sm:w-[46vw] lg:w-[26vw]"
          >
            <div
              className="absolute inset-0 transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out-expo)] group-hover:scale-110"
              style={{
                backgroundImage: `radial-gradient(90% 70% at 78% 12%, ${card.tint}4d 0%, transparent 58%)`,
              }}
              aria-hidden
            />
            <div className="relative flex h-full flex-col justify-between">
              <span className="font-mono text-xs tracking-[0.2em] text-mint/70">{card.n}</span>
              <div>
                <h3 className="display text-3xl">{card.title}</h3>
                <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-bone/60">{card.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
