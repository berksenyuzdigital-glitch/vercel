"use client";

import { useState } from "react";
import Kenar, { KenarMobil } from "@/components/Kenar";
import { NavCtx, type Gorunum } from "@/lib/nav";
import Bugun from "@/components/gorunumler/Bugun";
import Cikis from "@/components/gorunumler/Cikis";
import Stok from "@/components/gorunumler/Stok";
import Kacak from "@/components/gorunumler/Kacak";
import Miat from "@/components/gorunumler/Miat";
import MalKabul from "@/components/gorunumler/MalKabul";
import Hastalar from "@/components/gorunumler/Hastalar";
import Takvim from "@/components/gorunumler/Takvim";
import Musteriler from "@/components/gorunumler/Musteriler";

const EKRANLAR: Record<Gorunum, () => React.JSX.Element> = {
  "bugun": Bugun,
  "cikis": Cikis,
  "stok": Stok,
  "kacak": Kacak,
  "miat": Miat,
  "mal-kabul": MalKabul,
  "hastalar": Hastalar,
  "takvim": Takvim,
  "musteriler": Musteriler,
};

export default function Panel() {
  const [aktif, setAktif] = useState<Gorunum>("bugun");
  const Ekran = EKRANLAR[aktif];

  const git = (g: Gorunum) => {
    setAktif(g);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  return (
    <NavCtx.Provider value={{ aktif, git }}>
      <div className="lg:flex min-h-screen">
        <Kenar />
        <KenarMobil />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-7 max-w-[1500px]">
          <Ekran />
        </main>
      </div>
    </NavCtx.Provider>
  );
}
