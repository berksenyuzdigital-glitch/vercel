"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { veriUret, type Veri } from "./veri";
import type { Islem, IslemSatir, StokHareket } from "./tipler";

const ANAHTAR = "vet-panel-v1";

type Ctx = {
  veri: Veri | null;
  cikisYap: (p: {
    hastaId: string; urunId: string; miktar: number;
    ucretlendirildi: boolean; personel: string;
  }) => void;
  malKabul: (p: {
    urunId: string; miktar: number; lotNo: string; miat: string; alisFiyat: number;
  }) => void;
  sifirla: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [veri, setVeri] = useState<Veri | null>(null);

  // Hydration uyumsuzluğunu önlemek için veri yalnızca istemcide üretilir
  useEffect(() => {
    try {
      const kayit = localStorage.getItem(ANAHTAR);
      if (kayit) { setVeri(JSON.parse(kayit)); return; }
    } catch {}
    setVeri(veriUret());
  }, []);

  useEffect(() => {
    if (!veri) return;
    try { localStorage.setItem(ANAHTAR, JSON.stringify(veri)); } catch {}
  }, [veri]);

  const deger = useMemo<Ctx>(() => ({
    veri,
    sifirla: () => {
      try { localStorage.removeItem(ANAHTAR); } catch {}
      setVeri(veriUret());
    },
    cikisYap: ({ hastaId, urunId, miktar, ucretlendirildi, personel }) =>
      setVeri((v) => {
        if (!v) return v;
        const urun = v.urunler.find((u) => u.id === urunId);
        const hasta = v.hastalar.find((h) => h.id === hastaId);
        if (!urun || !hasta) return v;

        // FEFO: miadı en yakın lottan düş
        const lotlar = v.lotlar.filter((l) => l.urunId === urunId);
        const lot =
          lotlar.slice().sort((a, b) => (a.miat ?? "9999").localeCompare(b.miat ?? "9999"))[0] ?? null;

        const simdi = new Date().toISOString();
        const islemId = `i-${Date.now()}`;
        const satir: IslemSatir = {
          id: `is-${Date.now()}`, urunId, aciklama: urun.ad,
          miktar, birimFiyat: urun.satisFiyat, kdv: urun.kdv, ucretlendirildi,
        };
        const islem: Islem = {
          id: islemId, sahipId: hasta.sahipId, hastaId, tip: "muayene",
          durum: "tamamlandi", personel, tarih: simdi, satirlar: [satir],
        };
        const hareket: StokHareket = {
          id: `h-${Date.now()}`, urunId, lotId: lot?.id ?? null, tip: "cikis",
          kaynak: "muayene", miktar: -miktar, birimFiyat: urun.satisFiyat,
          islemId, hastaId, kullanici: personel, tarih: simdi,
        };
        return { ...v, islemler: [...v.islemler, islem], hareketler: [...v.hareketler, hareket] };
      }),

    malKabul: ({ urunId, miktar, lotNo, miat, alisFiyat }) =>
      setVeri((v) => {
        if (!v) return v;
        const simdi = new Date().toISOString();
        const lotId = `l-${Date.now()}`;
        return {
          ...v,
          lotlar: [...v.lotlar, {
            id: lotId, urunId, lotNo: lotNo || "-",
            miat: miat || null, girisTarihi: simdi.slice(0, 10),
          }],
          hareketler: [...v.hareketler, {
            id: `h-${Date.now()}`, urunId, lotId, tip: "giris", kaynak: "mal_kabul",
            miktar, birimFiyat: alisFiyat, islemId: null, hastaId: null,
            kullanici: "Sekreter Nur", aciklama: "Mal kabul", tarih: simdi,
          }],
        };
      }),
  }), [veri]);

  return <StoreCtx.Provider value={deger}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore, StoreProvider içinde kullanılmalı");
  return c;
}
