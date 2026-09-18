"use client";

import React from "react";

export function Baslik({ ust, ana, alt, sag }: {
  ust?: string; ana: string; alt?: string; sag?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-6 mb-6">
      <div>
        {ust && <div className="text-[12px] font-medium text-ink-muted uppercase tracking-wide mb-1">{ust}</div>}
        <h1 className="text-[26px] font-semibold leading-tight">{ana}</h1>
        {alt && <p className="text-[14px] text-ink-2 mt-1.5 max-w-[68ch]">{alt}</p>}
      </div>
      {sag && <div className="shrink-0 flex items-center gap-2">{sag}</div>}
    </header>
  );
}

export function Kpi({ etiket, deger, alt, tip = "notr", ikon }: {
  etiket: string; deger: string; alt?: string;
  tip?: "notr" | "iyi" | "uyari" | "kritik"; ikon?: string;
}) {
  const renk =
    tip === "kritik" ? "var(--critical)" :
    tip === "uyari" ? "var(--serious)" :
    tip === "iyi" ? "var(--good)" : "var(--ink)";
  return (
    <div className="kart p-4">
      <div className="flex items-center gap-2 mb-2.5">
        {ikon && <span className="text-[14px] leading-none" aria-hidden>{ikon}</span>}
        <div className="text-[12.5px] text-ink-2 font-medium">{etiket}</div>
      </div>
      <div className="text-[27px] font-semibold leading-none num" style={{ color: renk }}>{deger}</div>
      {alt && <div className="text-[12px] text-ink-muted mt-2 leading-snug">{alt}</div>}
    </div>
  );
}

export function Bolum({ baslik, aciklama, sag, children }: {
  baslik: string; aciklama?: string; sag?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="kart overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-line">
        <div>
          <h2 className="text-[15px] font-semibold">{baslik}</h2>
          {aciklama && <p className="text-[12.5px] text-ink-muted mt-0.5">{aciklama}</p>}
        </div>
        {sag}
      </div>
      {children}
    </section>
  );
}

export function Bos({ mesaj }: { mesaj: string }) {
  return <div className="px-4 py-10 text-center text-[13.5px] text-ink-muted">{mesaj}</div>;
}

export function Yukleniyor() {
  return (
    <div className="flex items-center gap-3 text-[14px] text-ink-muted py-20 justify-center">
      <span className="size-4 rounded-full border-2 border-line-strong animate-spin"
            style={{ borderTopColor: "var(--accent)" }} />
      Veriler hazırlanıyor…
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kilo takip grafiği — tek seri, 2px çizgi, crosshair + tooltip       */
/* ------------------------------------------------------------------ */

export function KiloGrafik({ noktalar, birim = "kg" }: {
  noktalar: { tarih: string; deger: number }[]; birim?: string;
}) {
  const [aktif, setAktif] = React.useState<number | null>(null);
  const G = { ust: 16, sag: 76, alt: 26, sol: 40 };
  const W = 640, H = 210;
  const iw = W - G.sol - G.sag, ih = H - G.ust - G.alt;

  if (noktalar.length < 2) return <Bos mesaj="Grafik için en az iki ölçüm gerekiyor." />;

  const degerler = noktalar.map((n) => n.deger);
  const ham = { min: Math.min(...degerler), max: Math.max(...degerler) };
  const pay = Math.max((ham.max - ham.min) * 0.25, 0.4);
  const min = ham.min - pay, max = ham.max + pay;

  const x = (i: number) => G.sol + (i / (noktalar.length - 1)) * iw;
  const y = (v: number) => G.ust + ih - ((v - min) / (max - min)) * ih;

  const cizgi = noktalar.map((n, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(n.deger).toFixed(1)}`).join(" ");
  const tikler = [min + (max - min) * 0.1, (min + max) / 2, max - (max - min) * 0.1];
  const son = noktalar.length - 1;
  const kisaTarih = (t: string) =>
    new Intl.DateTimeFormat("tr-TR", { month: "short", year: "2-digit" }).format(new Date(t));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} role="img"
           aria-label="Kilo değişim grafiği"
           onMouseLeave={() => setAktif(null)}>
        {tikler.map((t, i) => (
          <g key={i}>
            <line x1={G.sol} x2={W - G.sag} y1={y(t)} y2={y(t)} stroke="var(--line-strong)" strokeWidth="1" />
            <text x={G.sol - 8} y={y(t) + 4} textAnchor="end" fontSize="11"
                  fill="var(--ink-muted)" className="num">{t.toFixed(1)}</text>
          </g>
        ))}

        <path d={cizgi} fill="none" stroke="var(--s1)" strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />

        {noktalar.map((n, i) => (
          <circle key={i} cx={x(i)} cy={y(n.deger)} r={aktif === i ? 5.5 : 4.5}
                  fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
        ))}

        {aktif !== null && (
          <line x1={x(aktif)} x2={x(aktif)} y1={G.ust} y2={G.ust + ih}
                stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 3" />
        )}

        {/* son noktanın doğrudan etiketi */}
        <text x={x(son) + 9} y={y(noktalar[son].deger) + 4} fontSize="12.5" fontWeight="600"
              fill="var(--ink)" className="num">{noktalar[son].deger} {birim}</text>

        <text x={G.sol} y={H - 7} fontSize="11" fill="var(--ink-muted)">{kisaTarih(noktalar[0].tarih)}</text>
        <text x={W - G.sag} y={H - 7} fontSize="11" fill="var(--ink-muted)" textAnchor="end">
          {kisaTarih(noktalar[son].tarih)}
        </text>

        {/* hit alanları — işaretten büyük */}
        {noktalar.map((_, i) => (
          <rect key={i} x={x(i) - iw / (noktalar.length - 1) / 2} y={G.ust}
                width={iw / (noktalar.length - 1)} height={ih}
                fill="transparent" onMouseEnter={() => setAktif(i)} />
        ))}
      </svg>

      {aktif !== null && (
        <div className="absolute pointer-events-none kart px-2.5 py-1.5 text-[12px] shadow-lg"
             style={{
               left: `${(x(aktif) / W) * 100}%`, top: 0,
               transform: "translate(-50%, -6px)", whiteSpace: "nowrap",
             }}>
          <span className="text-ink-muted">
            {new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" })
              .format(new Date(noktalar[aktif].tarih))}
          </span>
          <span className="font-semibold num ml-2">{noktalar[aktif].deger} {birim}</span>
        </div>
      )}
    </div>
  );
}
