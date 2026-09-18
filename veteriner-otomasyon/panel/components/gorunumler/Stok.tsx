"use client";

import { Fragment, useState } from "react";
import { useStore } from "@/lib/store";
import { mevcutStok, urunToplamlari, TL, sayi } from "@/lib/hesap";
import { Baslik, Olculer, Bolum, Bos, Yukleniyor, Segman } from "@/components/Ui";
import type { Kategori } from "@/lib/tipler";

const KAT: { id: Kategori | "hepsi"; ad: string }[] = [
  { id: "hepsi", ad: "Tümü" }, { id: "ilac", ad: "İlaç" }, { id: "asi", ad: "Aşı" },
  { id: "parazit", ad: "Parazit" }, { id: "mama", ad: "Mama" }, { id: "sarf", ad: "Sarf" },
];

export default function Stok() {
  const { veri } = useStore();
  const [ara, setAra] = useState("");
  const [kat, setKat] = useState<Kategori | "hepsi">("hepsi");
  const [sadeceKritik, setSadeceKritik] = useState(false);
  const [acik, setAcik] = useState<string | null>(null);
  if (!veri) return <Yukleniyor />;

  const kucuk = (s: string) => s.toLocaleLowerCase("tr");
  const lotlar = mevcutStok(veri);
  const tum = urunToplamlari(veri);
  const satirlar = tum.filter(({ urun, kritik }) =>
    (kat === "hepsi" || urun.kategori === kat) &&
    (!sadeceKritik || kritik) &&
    (!ara || kucuk(urun.ad).includes(kucuk(ara)) || kucuk(urun.kod).includes(kucuk(ara))));

  const stokDegeri = tum.reduce((t, x) => t + x.toplam * x.urun.alisFiyat, 0);
  const satisDegeri = tum.reduce((t, x) => t + x.toplam * x.urun.satisFiyat, 0);
  const kritikAdet = tum.filter((x) => x.kritik).length;

  return (
    <>
      <Baslik ust="Envanter" ana="Stok"
              alt="Mevcut miktar hareket defterinin toplamıdır — hiçbir yerde üzerine yazılmaz." />

      <Olculer
        ogeler={[
          { etiket: "Stok maliyeti", deger: TL(stokDegeri), not: "Alış fiyatı üzerinden" },
          { etiket: "Satış değeri", deger: TL(satisDegeri), not: "Etiket fiyatı üzerinden" },
          { etiket: "Kritik seviyede", deger: String(kritikAdet),
            tip: kritikAdet ? "kritik" : "iyi", not: "Sipariş verilmeli" },
          { etiket: "Takip edilen kalem", deger: String(tum.length), not: "Ürün kartı" },
        ]}
      />

      <Bolum baslik="Ürünler" aciklama={`${satirlar.length} kalem listeleniyor`}>
        <div className="p-3 border-b border-line flex flex-wrap gap-2 items-center">
          <input className="girdi max-w-[280px]" placeholder="Ürün ara…"
                 value={ara} onChange={(e) => setAra(e.target.value)} />
          <Segman secili={kat} sec={setKat}
                  secenekler={KAT.map((k) => ({ deger: k.id, ad: k.ad }))} />
          <button onClick={() => setSadeceKritik((v) => !v)} className="durum ml-auto"
                  style={sadeceKritik ? { background: "var(--critical)", color: "#fff" }
                                      : { background: "var(--surface-2)", color: "var(--ink-2)" }}>
            Sadece kritik
          </button>
        </div>

        {satirlar.length === 0 ? <Bos mesaj="Eşleşen ürün yok." /> : (
          <div className="overflow-x-auto">
            <table className="w-full tablo">
              <thead>
                <tr>
                  <th>Kod</th><th>Ürün</th><th>Kategori</th>
                  <th className="sag">Mevcut</th><th className="sag">Kritik</th>
                  <th className="sag">Alış</th><th className="sag">Satış</th>
                  <th className="sag">Değer</th><th></th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map(({ urun, toplam, kritik }) => {
                  const uLot = lotlar.filter((l) => l.urun.id === urun.id && l.mevcut !== 0);
                  const acikMi = acik === urun.id;
                  return (
                    <Fragment key={urun.id}>
                      <tr onClick={() => setAcik(acikMi ? null : urun.id)} className="cursor-pointer">
                        <td className="num text-ink-muted text-[12.5px]">{urun.kod}</td>
                        <td className="font-medium">{urun.ad}</td>
                        <td><span className="etiket-kutu">{KAT.find((k) => k.id === urun.kategori)?.ad}</span></td>
                        <td className="sag num font-semibold"
                            style={kritik ? { color: "var(--critical)" } : undefined}>
                          {sayi(toplam)} <span className="text-ink-muted font-normal text-[12px]">{urun.birim}</span>
                        </td>
                        <td className="sag num text-ink-muted">{sayi(urun.kritikSeviye)}</td>
                        <td className="sag num text-ink-2">{TL(urun.alisFiyat)}</td>
                        <td className="sag num">{TL(urun.satisFiyat)}</td>
                        <td className="sag num font-medium">{TL(toplam * urun.alisFiyat)}</td>
                        <td className="sag text-ink-muted text-[12px]">{acikMi ? "▾" : "▸"}</td>
                      </tr>
                      {acikMi && (
                        <tr>
                          <td colSpan={9} style={{ background: "var(--surface-2)" }} className="!p-0">
                            <div className="px-4 py-3">
                              <div className="text-[12px] font-medium text-ink-muted uppercase tracking-wide mb-2">
                                Lotlar
                              </div>
                              {uLot.length === 0 ? (
                                <div className="text-[13px] text-ink-muted">Lot kaydı yok.</div>
                              ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {uLot.map((l) => {
                                    const g = l.kalanGun;
                                    return (
                                      <div key={l.lot?.id} className="panel p-3 flex items-center justify-between gap-3">
                                        <div>
                                          <div className="text-[13px] font-medium num">Lot {l.lot?.lotNo ?? "—"}</div>
                                          <div className="text-[12px] text-ink-muted num">
                                            {l.lot?.miat ? `Miat ${l.lot.miat}` : "Miat takipsiz"}
                                          </div>
                                        </div>
                                        <div className="sag">
                                          <div className="text-[14px] font-semibold num">{sayi(l.mevcut)}</div>
                                          {g !== null && (
                                            <span className={`durum ${g < 0 ? "durum-kritik" : g <= 60 ? "durum-uyari" : "durum-iyi"} !text-[11px]`}>
                                              {g < 0 ? `${Math.abs(g)} gün geçti` : `${g} gün`}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Bolum>
    </>
  );
}
