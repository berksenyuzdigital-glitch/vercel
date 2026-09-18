"use client";

import React from "react";

/* Sayfa başlığı — göz üstü etiket, ad, bir cümle, sağda kontrol */
export function Baslik({ ust, ana, alt, sag }: {
  ust?: string; ana: string; alt?: string; sag?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 mb-8">
      <div className="min-w-0">
        {ust && <div className="mikro mb-2">{ust}</div>}
        <h1 className="text-[28px] font-semibold leading-[1.15]">{ana}</h1>
        {alt && <p className="text-[13.5px] text-ink-2 mt-2 max-w-[70ch] leading-relaxed">{alt}</p>}
      </div>
      {sag && <div className="shrink-0 flex items-center gap-2">{sag}</div>}
    </header>
  );
}

/* Kahraman figür — sayfanın tek ana sayısı. Kart değil. */
export function Odak({ etiket, deger, aciklama, tip = "notr", eylem }: {
  etiket: string; deger: string; aciklama?: React.ReactNode;
  tip?: "notr" | "kritik" | "iyi"; eylem?: React.ReactNode;
}) {
  const renk = tip === "kritik" ? "var(--critical)" : tip === "iyi" ? "var(--good)" : "var(--ink)";
  return (
    <section className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 pb-7 mb-7 border-b border-line">
      <div className="min-w-0">
        <div className="mikro mb-3">{etiket}</div>
        <div className="rakam text-[46px] leading-none font-semibold" style={{ color: renk }}>
          {deger}
        </div>
        {aciklama && (
          <p className="text-[13.5px] text-ink-2 mt-3.5 max-w-[62ch] leading-relaxed">{aciklama}</p>
        )}
      </div>
      {eylem && <div className="shrink-0">{eylem}</div>}
    </section>
  );
}

/* İkincil ölçüler — kutu yok, dikey çizgiyle ayrılmış sessiz sütunlar */
export function Olculer({ ogeler }: {
  ogeler: { etiket: string; deger: string; not?: string; tip?: "notr" | "kritik" | "uyari" | "iyi" }[];
}) {
  const renk = (t?: string) =>
    t === "kritik" ? "var(--critical)" : t === "uyari" ? "var(--warning)"
      : t === "iyi" ? "var(--good)" : "var(--ink)";
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 mb-9">
      {ogeler.map((o, i) => (
        <div key={o.etiket} className={i > 0 ? "md:pl-8 md:border-l border-line" : ""}>
          <div className="mikro mb-2.5">{o.etiket}</div>
          <div className="rakam text-[24px] leading-none font-semibold" style={{ color: renk(o.tip) }}>
            {o.deger}
          </div>
          {o.not && <div className="text-[12.5px] text-ink-muted mt-2 leading-snug">{o.not}</div>}
        </div>
      ))}
    </div>
  );
}

/* İçerik bloğu */
export function Bolum({ baslik, aciklama, sag, dolgu, children }: {
  baslik: string; aciklama?: string; sag?: React.ReactNode;
  dolgu?: boolean; children: React.ReactNode;
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3.5">
        <div className="min-w-0">
          <h2 className="text-[14.5px] font-semibold leading-tight">{baslik}</h2>
          {aciklama && <p className="text-[12.5px] text-ink-muted mt-1">{aciklama}</p>}
        </div>
        {sag}
      </div>
      <div className={dolgu ? "px-4 pb-4" : ""}>{children}</div>
    </section>
  );
}

export function Bos({ mesaj }: { mesaj: string }) {
  return <div className="px-4 py-12 text-center text-[13px] text-ink-muted">{mesaj}</div>;
}

export function Yukleniyor() {
  return (
    <div className="flex items-center gap-3 text-[13.5px] text-ink-muted py-24 justify-center">
      <span className="size-3.5 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--line)", borderTopColor: "var(--accent)" }} />
      Veriler hazırlanıyor
    </div>
  );
}

/* Hasta monogramı — emoji yerine */
export function Mono({ ad, tur, boyut = 32 }: { ad: string; tur?: string; boyut?: number }) {
  const harf = (ad || "?").trim().charAt(0).toLocaleUpperCase("tr");
  const kedi = tur === "kedi";
  return (
    <span
      className="monogram"
      style={{
        width: boyut, height: boyut, fontSize: boyut * 0.42,
        background: kedi ? "var(--accent-wash)" : "var(--surface-2)",
        color: kedi ? "var(--accent-ink)" : "var(--ink-2)",
      }}
      aria-hidden
    >
      {harf}
    </span>
  );
}

/* Segman seçici */
export function Segman<T extends string | number>({ secili, secenekler, sec }: {
  secili: T; secenekler: { deger: T; ad: string }[]; sec: (d: T) => void;
}) {
  return (
    <div className="segman">
      {secenekler.map((s) => (
        <button key={String(s.deger)} onClick={() => sec(s.deger)} aria-pressed={s.deger === secili}>
          {s.ad}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kilo takip grafiği — tek seri, 2px çizgi, crosshair + ipucu        */
/* ------------------------------------------------------------------ */

export function KiloGrafik({ noktalar, birim = "kg" }: {
  noktalar: { tarih: string; deger: number }[]; birim?: string;
}) {
  const [aktif, setAktif] = React.useState<number | null>(null);
  const G = { ust: 18, sag: 78, alt: 28, sol: 44 };
  const W = 660, H = 220;
  const iw = W - G.sol - G.sag, ih = H - G.ust - G.alt;

  if (noktalar.length < 2) return <Bos mesaj="Grafik için en az iki ölçüm gerekiyor." />;

  const degerler = noktalar.map((n) => n.deger);
  const ham = { min: Math.min(...degerler), max: Math.max(...degerler) };
  const pay = Math.max((ham.max - ham.min) * 0.28, 0.4);
  const min = ham.min - pay, max = ham.max + pay;

  const x = (i: number) => G.sol + (i / (noktalar.length - 1)) * iw;
  const y = (v: number) => G.ust + ih - ((v - min) / (max - min)) * ih;

  const cizgi = noktalar.map((n, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(n.deger).toFixed(1)}`).join(" ");
  const alan = `${cizgi} L${x(noktalar.length - 1).toFixed(1)},${(G.ust + ih).toFixed(1)} L${G.sol},${(G.ust + ih).toFixed(1)} Z`;
  const tikler = [min + (max - min) * 0.12, (min + max) / 2, max - (max - min) * 0.12];
  const son = noktalar.length - 1;
  const kisa = (t: string) =>
    new Intl.DateTimeFormat("tr-TR", { month: "short", year: "2-digit" }).format(new Date(t));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
           aria-label="Kilo değişim grafiği" onMouseLeave={() => setAktif(null)}>
        {tikler.map((t, i) => (
          <g key={i}>
            <line x1={G.sol} x2={W - G.sag} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={G.sol - 10} y={y(t) + 4} textAnchor="end" fontSize="11"
                  fill="var(--ink-muted)" className="num">{t.toFixed(1)}</text>
          </g>
        ))}

        <path d={alan} fill="var(--seri-1-wash)" stroke="none" />
        <path d={cizgi} fill="none" stroke="var(--seri-1)" strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />

        {aktif !== null && (
          <line x1={x(aktif)} x2={x(aktif)} y1={G.ust} y2={G.ust + ih}
                stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="3 3" />
        )}

        {noktalar.map((n, i) => (
          <circle key={i} cx={x(i)} cy={y(n.deger)} r={i === son || aktif === i ? 5 : 4}
                  fill="var(--seri-1)" stroke="var(--surface)" strokeWidth="2" />
        ))}

        <text x={x(son) + 11} y={y(noktalar[son].deger) + 4} fontSize="13" fontWeight="600"
              fill="var(--ink)" className="rakam">{noktalar[son].deger} {birim}</text>

        <text x={G.sol} y={H - 8} fontSize="11" fill="var(--ink-muted)">{kisa(noktalar[0].tarih)}</text>
        <text x={W - G.sag} y={H - 8} fontSize="11" fill="var(--ink-muted)" textAnchor="end">
          {kisa(noktalar[son].tarih)}
        </text>

        {noktalar.map((_, i) => (
          <rect key={i} x={x(i) - iw / (noktalar.length - 1) / 2} y={G.ust}
                width={iw / (noktalar.length - 1)} height={ih}
                fill="transparent" onMouseEnter={() => setAktif(i)} />
        ))}
      </svg>

      {aktif !== null && (
        <div className="absolute pointer-events-none panel px-2.5 py-1.5 text-[12px]"
             style={{ left: `${(x(aktif) / W) * 100}%`, top: 0, transform: "translate(-50%, -8px)", whiteSpace: "nowrap" }}>
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
