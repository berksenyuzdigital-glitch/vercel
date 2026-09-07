"use client";

import { doctors } from "@/lib/clinic";
import { openBooking } from "@/lib/events";

export default function Team() {
  return (
    <section id="ekip" data-nav="dark" className="bg-forest py-24 text-bone md:py-36">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b hairline-light pb-8">
          <div>
            <p className="eyebrow text-mint/60" data-reveal>
              (03) — Ekip
            </p>
            <h2 className="display fluid-lg mt-6" data-reveal>
              Tedavinizi <em className="text-mint">tek</em> hekim yürütür.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-bone/60" data-reveal>
            Koordinatör değil, hekimin kendisi arar. Kontrol randevularınız aynı isimle devam eder.
          </p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor, i) => (
            <article
              key={doctor.id}
              className="group"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-soft">
                <div
                  className="absolute inset-0 opacity-80 transition-transform duration-[1200ms] [transition-timing-function:var(--ease-out-expo)] group-hover:scale-105"
                  style={{
                    backgroundImage: `radial-gradient(120% 90% at 30% 8%, ${doctor.accent}55 0%, transparent 62%), linear-gradient(200deg, #16342a 0%, #0b1c17 100%)`,
                  }}
                />
                <svg
                  viewBox="0 0 300 400"
                  aria-hidden
                  className="absolute inset-0 h-full w-full opacity-[0.22] transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out-expo)] group-hover:-translate-y-2"
                >
                  {[150, 120, 90, 60, 30].map((r) => (
                    <path
                      key={r}
                      d={`M ${150 - r} 300 A ${r} ${r * 1.05} 0 0 1 ${150 + r} 300`}
                      fill="none"
                      stroke="#f2efe8"
                      strokeWidth="1"
                    />
                  ))}
                  <circle cx="150" cy="300" r="3" fill="#f2efe8" />
                </svg>

                <span className="display absolute bottom-5 left-5 text-6xl text-bone/90">
                  {doctor.initials}
                </span>
                <span className="absolute right-5 top-5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/50">
                  {doctor.since}&apos;den beri
                </span>

                <button
                  type="button"
                  onClick={() => openBooking({ doctorId: doctor.id })}
                  className="absolute inset-x-4 bottom-4 translate-y-[calc(100%+1.5rem)] rounded-full bg-mint py-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-forest transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-y-0 focus-visible:translate-y-0"
                >
                  Randevu Al ↗
                </button>
              </div>

              <h3 className="display mt-5 text-2xl">{doctor.name}</h3>
              <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mint/70">
                {doctor.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-bone/55">{doctor.focus}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
