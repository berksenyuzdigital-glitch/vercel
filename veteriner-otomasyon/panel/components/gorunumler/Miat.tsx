"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { miatTakibi, miatZarari, TL, sayi } from "@/lib/hesap";
import { Baslik, Kpi, Bolum, Bos, Yukleniyor } from "@/components/Ui";

export default function Miat() {
  const { veri } = useStore();
  const [esik, setEsik] = useState(60);
  if (!veri) return <Yukleniyor />;

  const satirlar = miatTakibi(veri, esik);
  const gecmis = satirlar.filter((s) => (s.kalanGun ?? 0) < 0);
  const yakin = satirlar.filter((s) => (s.kalanGun ?? 0) >= 0 && (s.kalanGun ?? 0) <= 30);
  const zarar = miatZarari(veri);
  const risk = satirlar
    .filter((s) => (s.kalanGun ?? 0) >= 0)
    .reduce((t, s) => t + s.mevcut * s.urun.alisFiyat, 0);

  return (
    <>
      <Baslik ust="Envanter riski" ana="Miat takibi"
              alt="Miadı geçen ilaç doğrudan zarardır. Yaklaşan lotlar önce kullanılacak şekilde (FEFO) sıralanır."
              sag={
                <div className="flex gap-1.5">
                  {[30, 60, 90].map((g) => (
                    <button key={g} onClick={() => setEsik(g)} className="rozet"
                            style={g === esik ? { background: "var(--accent)", color: "#fff" }
                                              : { background: "var(--surface-2)", color: "var(--ink-2)" }}>
                      {g} gün
                    </button>
                  ))}
                </div>
              } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi etiket="Miadı geçmiş" deger={String(gecmis.length)} tip={gecmis.length ? "kritik" : "iyi"} ikon="🛑"
             alt={`${TL(zarar)} tutarında zarar`} />
        <Kpi etiket="30 gün içinde dolacak" deger={String(yakin.length)} tip={yakin.length ? "uyari" : "iyi"} ikon="⏳" />
        <Kpi etiket="Risk altındaki stok" deger={TL(risk)} tip="uyari" ikon="💸" alt="Alış maliyeti üzerinden" />
        <Kpi etiket="Gerçekleşen zarar" deger={TL(zarar)} tip="kritik" ikon="🗑️" alt="Miadı geçip elde kalan" />
      </div>

      <Bolum baslik="Lotlar" aciklama="Miada göre sıralı — en acili üstte">
        {satirlar.length === 0 ? <Bos mesaj="Bu aralıkta miat riski yok." /> : (
          <div className="overflow-x-auto">
            <table className="w-full tablo">
              <thead>
                <tr>
                  <th>Ürün</th><th>Lot</th><th>Miat</th>
                  <th className="text-right">Kalan adet</th><th className="text-right">Maliyet</th>
                  <th className="text-right">Durum</th><th>Öneri</th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map((s) => {
                  const g = s.kalanGun ?? 0;
                  return (
                    <tr key={`${s.urun.id}-${s.lot?.id}`}>
                      <td>
                        <div className="font-medium">{s.urun.ad}</div>
                        <div className="text-[12px] text-ink-muted num">{s.urun.kod}</div>
                      </td>
                      <td className="num text-[12.5px]">{s.lot?.lotNo}</td>
                      <td className="num text-[12.5px]">{s.lot?.miat}</td>
                      <td className="text-right num font-semibold">{sayi(s.mevcut)} <span className="text-ink-muted font-normal text-[12px]">{s.urun.birim}</span></td>
                      <td className="text-right num">{TL(s.mevcut * s.urun.alisFiyat)}</td>
                      <td className="text-right">
                        <span className={`rozet ${g < 0 ? "rozet-kritik" : g <= 30 ? "rozet-uyari" : "rozet-notr"}`}>
                          {g < 0 ? `${Math.abs(g)} gün geçti` : `${g} gün kaldı`}
                        </span>
                      </td>
                      <td className="text-[12.5px] text-ink-2">
                        {g < 0 ? "İmha / iade kaydı aç"
                          : g <= 14 ? "Öncelikli kullan · kampanya"
                          : g <= 30 ? "Önce bu lottan düş"
                          : "Takipte"}
                      </td>
                    </tr>
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
