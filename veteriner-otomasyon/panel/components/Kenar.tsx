"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { kritikStok, miatTakibi, kacakRaporu } from "@/lib/hesap";

const MENU = [
  { yol: "/", ad: "Bugün", ikon: "M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z" },
  { yol: "/cikis", ad: "Hızlı çıkış", ikon: "M13 2L3 14h7l-1 8 10-12h-7z" },
  { yol: "/stok", ad: "Stok", ikon: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10" },
  { yol: "/kacak", ad: "Kaçak raporu", ikon: "M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
  { yol: "/miat", ad: "Miat takibi", ikon: "M12 8v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { yol: "/mal-kabul", ad: "Mal kabul", ikon: "M12 5v14M5 12h14" },
  { yol: "/hastalar", ad: "Hastalar", ikon: "M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 6a4 4 0 100 8 4 4 0 000-8zM21 20v-2a4 4 0 00-3-3.87" },
  { yol: "/takvim", ad: "Aşı takvimi", ikon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
  { yol: "/musteriler", ad: "Cari & LTV", ikon: "M3 3v18h18M7 15l4-4 3 3 5-6" },
];

function Tema() {
  const [koyu, setKoyu] = useState(false);
  useEffect(() => {
    const k = localStorage.getItem("vet-tema");
    if (k) { setKoyu(k === "dark"); document.documentElement.dataset.theme = k; }
  }, []);
  return (
    <button
      className="btn w-full !justify-start text-[13px]"
      onClick={() => {
        const y = !koyu; setKoyu(y);
        document.documentElement.dataset.theme = y ? "dark" : "light";
        localStorage.setItem("vet-tema", y ? "dark" : "light");
      }}
    >
      {koyu ? "☀︎  Açık tema" : "☾  Koyu tema"}
    </button>
  );
}

export default function Kenar() {
  const yol = usePathname();
  const { veri } = useStore();

  const rozetler: Record<string, { n: number; tip: string }> = {};
  if (veri) {
    const k = kritikStok(veri).length;
    const m = miatTakibi(veri).length;
    const c = kacakRaporu(veri, 30).length;
    if (k) rozetler["/stok"] = { n: k, tip: "kritik" };
    if (m) rozetler["/miat"] = { n: m, tip: "uyari" };
    if (c) rozetler["/kacak"] = { n: c, tip: "kritik" };
  }

  return (
    <aside className="w-[236px] shrink-0 border-r border-line bg-surface min-h-screen sticky top-0 flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-[10px] grid place-items-center text-white text-[15px] font-semibold"
               style={{ background: "var(--accent)" }}>
            🐾
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px]">PatiKlinik</div>
            <div className="text-[11px] text-ink-muted">Kadıköy Veteriner Polikliniği</div>
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 space-y-0.5">
        {MENU.map((m) => {
          const aktif = yol === m.yol;
          const r = rozetler[m.yol];
          return (
            <Link
              key={m.yol}
              href={m.yol}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] text-[13.5px] transition-colors"
              style={
                aktif
                  ? { background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 600 }
                  : { color: "var(--ink-2)" }
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d={m.ikon} />
              </svg>
              <span className="flex-1">{m.ad}</span>
              {r && (
                <span className={`rozet ${r.tip === "kritik" ? "rozet-kritik" : "rozet-uyari"} !px-1.5 !py-0 !text-[11px] num`}>
                  {r.n}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-2">
        <Tema />
        <div className="text-[11px] text-ink-muted px-1 leading-relaxed">
          Demo sürümü · veriler tarayıcıda tutulur
        </div>
      </div>
    </aside>
  );
}
