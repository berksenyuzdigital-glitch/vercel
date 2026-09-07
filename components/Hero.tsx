"use client";

import { useEffect, useState } from "react";
import ArcVisual from "./ArcVisual";
import Magnetic from "./Magnetic";
import RotatingBadge from "./RotatingBadge";
import { doctors, services } from "@/lib/clinic";

const LINES = ["Gülüşünüz", "sizden önce", "konuşur."];

export default function Hero() {
  const [nextSlot, setNextSlot] = useState<string | null>(null);

  /* Ana ekranda gerçek uygunluk verisinden ilk boş saati gösterir. */
  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      for (let offset = 0; offset < 7; offset += 1) {
        const day = new Date();
        day.setDate(day.getDate() + offset);
        const iso = day.toISOString().slice(0, 10);
        try {
          const res = await fetch(
            `/api/availability?date=${iso}&doctor=${doctors[0].id}&service=${services[0].id}`,
            { signal: controller.signal },
          );
          if (!res.ok) continue;
          const data: { slots: { time: string; available: boolean }[] } = await res.json();
          const slot = data.slots.find((s) => s.available);
          if (slot) {
            const label =
              offset === 0 ? "bugün" : offset === 1 ? "yarın" : `${day.getDate()} ${day.toLocaleDateString("tr-TR", { month: "long" })}`;
            setNextSlot(`${label} · ${slot.time}`);
            return;
          }
        } catch {
          return;
        }
      }
    };

    run();
    return () => controller.abort();
  }, []);

  return (
    <section id="top" data-nav="light" className="relative min-h-[100svh] overflow-hidden pt-[72px]">
      <div className="pointer-events-none absolute -right-[18%] top-[6%] h-[min(80vw,44rem)] w-[min(80vw,44rem)] opacity-90 md:-right-[6%]">
        <ArcVisual />
      </div>

      <div className="shell relative flex min-h-[calc(100svh-72px)] flex-col justify-between py-10">
        <div className="flex flex-wrap items-center justify-between gap-4" data-reveal>
          <span className="eyebrow">Nişantaşı · Dental Atelier</span>
          <span className="eyebrow hidden sm:block">Est. 2011 — İstanbul</span>
        </div>

        <div className="mt-[clamp(2rem,6vh,4rem)] max-w-5xl">
          <h1 className="display fluid-hero">
            {LINES.map((line, i) => (
              <span key={line} className="line-mask" data-reveal style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}>
                <span>
                  {i === 1 ? (
                    <>
                      sizden <em>önce</em>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <div className="mt-[clamp(2.5rem,7vh,4.5rem)] grid gap-10 border-t hairline pt-8 md:grid-cols-[1.1fr_auto] md:items-end">
          <div className="max-w-xl" data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
            <p className="text-base leading-relaxed text-ink/70 md:text-lg">
              Dijital muayene, tasarım seansı ve tek hekim sorumluluğu. Tedaviniz ekranda
              onaylanmadan hiçbir işlem başlamaz.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Magnetic>
                <a href="#randevu" className="btn btn-solid">
                  Randevu Oluştur
                  <span aria-hidden>↗</span>
                </a>
              </Magnetic>
              <a href="#tedaviler" className="btn btn-ghost">
                Tedavileri İncele
              </a>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink/60">
                {nextSlot ? `İlk uygun randevu: ${nextSlot}` : "Uygunluk kontrol ediliyor…"}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-8 md:justify-end">
            <div className="scroll-hint hidden md:block" aria-hidden>
              <span />
            </div>
            <RotatingBadge className="h-28 w-28 text-forest md:h-32 md:w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}
