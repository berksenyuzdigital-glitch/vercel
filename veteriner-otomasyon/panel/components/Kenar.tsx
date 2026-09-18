"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useNav, type Gorunum } from "@/lib/nav";
import { kritikStok, miatTakibi, kacakRaporu } from "@/lib/hesap";

type Oge = { yol: Gorunum; ad: string; ikon: string };

const GRUPLAR: { baslik?: string; ogeler: Oge[] }[] = [
  {
    ogeler: [{ yol: "bugun", ad: "Bugün", ikon: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" }],
  },
  {
    baslik: "İş akışı",
    ogeler: [
      { yol: "cikis", ad: "Hızlı çıkış", ikon: "M13 3 4 14h6l-1 7 9-11h-6z" },
      { yol: "mal-kabul", ad: "Mal kabul", ikon: "M12 5v14M5 12h14" },
    ],
  },
  {
    baslik: "Envanter",
    ogeler: [
      { yol: "stok", ad: "Stok", ikon: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5 12 12l9-4.5M12 12v9" },
      { yol: "miat", ad: "Miat takibi", ikon: "M12 7.5V12l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
    ],
  },
  {
    baslik: "Hastalar",
    ogeler: [
      { yol: "hastalar", ad: "Hasta kayıtları", ikon: "M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM21 20v-2a4 4 0 0 0-3-3.87" },
      { yol: "takvim", ad: "Aşı takvimi", ikon: "M8 2.5v4M16 2.5v4M3 10h18M5 4.5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" },
    ],
  },
  {
    baslik: "Raporlar",
    ogeler: [
      { yol: "rapor", ad: "Aylık denetim", ikon: "M14 2.5H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5zM14 2.5v6h6M8 13h8M8 17h5" },
      { yol: "kacak", ad: "Gelir kaçağı", ikon: "M12 2.5v19M17 6.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
      { yol: "musteriler", ad: "Cari & LTV", ikon: "M3 3v18h18M7 15l4-4 3 3 5-6" },
    ],
  },
];

function Tema() {
  const [koyu, setKoyu] = useState(false);
  useEffect(() => {
    try {
      const k = localStorage.getItem("vet-tema");
      if (k) { setKoyu(k === "dark"); document.documentElement.dataset.theme = k; }
    } catch {}
  }, []);
  return (
    <button
      className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-muted rounded-[7px] hover:bg-[color:var(--surface-2)] transition-colors lg:w-full"
      onClick={() => {
        const y = !koyu; setKoyu(y);
        document.documentElement.dataset.theme = y ? "dark" : "light";
        try { localStorage.setItem("vet-tema", y ? "dark" : "light"); } catch {}
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
           strokeLinecap="round" strokeLinejoin="round">
        {koyu
          ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
          : <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
      </svg>
      {koyu ? "Açık tema" : "Koyu tema"}
    </button>
  );
}

export default function Kenar() {
  const { aktif, git } = useNav();
  const { veri } = useStore();

  const sayac: Partial<Record<Gorunum, { n: number; kritik: boolean }>> = {};
  if (veri) {
    const k = kritikStok(veri).length;
    const m = miatTakibi(veri).length;
    const c = kacakRaporu(veri, 30).length;
    if (k) sayac.stok = { n: k, kritik: true };
    if (m) sayac.miat = { n: m, kritik: false };
    if (c) sayac.kacak = { n: c, kritik: true };
  }

  return (
    <aside className="hidden lg:flex w-[232px] shrink-0 border-r border-line bg-surface min-h-screen sticky top-0 flex-col">
      <div className="px-5 pt-6 pb-7">
        <div className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden>
            <ellipse cx="7.2" cy="8.4" rx="2.1" ry="2.7" />
            <ellipse cx="12" cy="6.6" rx="2.1" ry="2.9" />
            <ellipse cx="16.8" cy="8.4" rx="2.1" ry="2.7" />
            <path d="M12 11.4c2.9 0 5.4 2.3 5.4 4.8 0 1.9-1.5 3-3.4 3-.9 0-1.4-.3-2-.3s-1.1.3-2 .3c-1.9 0-3.4-1.1-3.4-3 0-2.5 2.5-4.8 5.4-4.8z" />
          </svg>
          <div className="leading-tight">
            <div className="baslik-yazi font-semibold text-[15px]">PatiKlinik</div>
            <div className="text-[11px] text-ink-muted">Kadıköy Polikliniği</div>
          </div>
        </div>
      </div>

      <nav className="px-2.5 flex-1 space-y-6">
        {GRUPLAR.map((grup, gi) => (
          <div key={grup.baslik ?? gi}>
            {grup.baslik && <div className="mikro px-2.5 mb-2">{grup.baslik}</div>}
            <div className="space-y-px">
              {grup.ogeler.map((m) => {
                const secili = aktif === m.yol;
                const s = sayac[m.yol];
                return (
                  <button
                    key={m.yol}
                    onClick={() => git(m.yol)}
                    aria-current={secili ? "page" : undefined}
                    className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[13px] text-left transition-colors"
                    style={secili
                      ? { background: "var(--accent-wash)", color: "var(--accent-ink)", fontWeight: 600 }
                      : { color: "var(--ink-2)" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                      <path d={m.ikon} />
                    </svg>
                    <span className="flex-1 truncate">{m.ad}</span>
                    {s && (
                      <span className="num text-[11.5px] font-medium tabular-nums"
                            style={{ color: s.kritik ? "var(--critical)" : "var(--ink-muted)" }}>
                        {s.n}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2.5 mt-6">
        <Tema />
        <p className="text-[11px] text-ink-muted px-3 pt-2 leading-relaxed">
          Demo · veriler tarayıcıda
        </p>
      </div>
    </aside>
  );
}

/* Telefon ve tablet: yatay kaydirilabilir ust serit */
export function KenarMobil() {
  const { aktif, git } = useNav();
  const ogeler = GRUPLAR.flatMap((g) => g.ogeler);
  return (
    <div className="lg:hidden sticky top-0 z-20 bg-surface border-b border-line">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden>
            <ellipse cx="7.2" cy="8.4" rx="2.1" ry="2.7" />
            <ellipse cx="12" cy="6.6" rx="2.1" ry="2.9" />
            <ellipse cx="16.8" cy="8.4" rx="2.1" ry="2.7" />
            <path d="M12 11.4c2.9 0 5.4 2.3 5.4 4.8 0 1.9-1.5 3-3.4 3-.9 0-1.4-.3-2-.3s-1.1.3-2 .3c-1.9 0-3.4-1.1-3.4-3 0-2.5 2.5-4.8 5.4-4.8z" />
          </svg>
          <span className="baslik-yazi font-semibold text-[14px]">PatiKlinik</span>
        </div>
        <Tema />
      </div>
      <div className="flex gap-1 px-3 pb-2.5 overflow-x-auto">
        {ogeler.map((m) => {
          const secili = aktif === m.yol;
          return (
            <button
              key={m.yol}
              onClick={() => git(m.yol)}
              aria-current={secili ? "page" : undefined}
              className="shrink-0 px-3 py-1.5 rounded-[7px] text-[13px] whitespace-nowrap transition-colors"
              style={secili
                ? { background: "var(--accent-wash)", color: "var(--accent-ink)", fontWeight: 600 }
                : { color: "var(--ink-2)" }}
            >
              {m.ad}
            </button>
          );
        })}
      </div>
    </div>
  );
}
