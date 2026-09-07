"use client";

import { useEffect, useState } from "react";

const WORDS = ["Aurea", "Dental", "Atelier"];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    document.body.style.overflow = "hidden";
    let value = 0;

    const tick = window.setInterval(() => {
      value = Math.min(100, value + 6 + Math.random() * 12);
      setProgress(Math.round(value));
      if (value >= 100) {
        window.clearInterval(tick);
        window.setTimeout(() => setDone(true), 520);
      }
    }, 90);

    return () => {
      window.clearInterval(tick);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-forest px-6 py-8 text-bone transition-[clip-path,opacity] duration-[1100ms] [transition-timing-function:var(--ease-in-out-quint)] sm:px-12 ${
        done
          ? "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]"
          : "[clip-path:inset(0_0_0_0)]"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="eyebrow text-mint/70">Nişantaşı · İstanbul</span>
        <span className="font-mono text-xs text-bone/60">EST. 2011</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-5">
        {WORDS.map((word, i) => (
          <span key={word} className="line-mask">
            <span
              className="display fluid-xl text-bone"
              style={{ transform: "none", transitionDelay: `${i * 90 + 120}ms` }}
            >
              {word}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-end justify-between gap-8">
        <div className="h-px flex-1 bg-bone/20">
          <div
            className="h-px bg-mint transition-[width] duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-sm tabular-nums text-bone/80">
          {`${progress}`.padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}
