"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { miatTakibi, miatZarari, TL, sayi, tarihTR } from "@/lib/hesap";
import { Baslik, Olculer, Bolum, Bos, Yukleniyor, Segman } from "@/components/Ui";

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
              sag={<Segman secili={esik} sec={setEsik}
                           secenekler={[30, 60, 90].map((g) => ({ deger: g, ad: `${g} gün` }))} />} />

      <Olculer
        ogeler={[
          { etiket: "Miadı geçmiş lot", deger: String(gecmis.length),
            tip: gecmis.length ? "kritik" : "iyi", not: `${TL(zarar)} tutarında zarar` },
          { etiket: "30 gün içinde dolacak", deger: String(yakin.length),
            tip: yakin.length ? "uyari" : "iyi", not: "Öncelikli kullanılmalı" },
          { etiket: "Risk altındaki stok", deger: TL(risk), tip: "uyari",
            not: "Alış maliyeti üzerinden" },
          { etiket: "Gerçekleşen zarar", deger: TL(zarar), tip: zarar > 0 ? "kritik" : "iyi",
            not: "Miadı geçip elde kalan" },
        ]}
      />

      <Bolum baslik="Lotlar" aciklama="Miada göre sıralı — en acili üstte">
        {satirlar.length === 0 ? <Bos mesaj="Bu aralıkta miat riski yok." /> : (
          <div className="overflow-x-auto">
            <table className="w-full tablo">
              <thead>
                <tr>
                  <th>Ürün</th><th>Lot</th><th>Miat</th>
                  <th className="sag">Kalan adet</th><th className="sag">Maliyet</th>
                  <th className="sag">Durum</th><th>Öneri</th>
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
                      <td className="num text-[12.5px]">{s.lot?.miat ? tarihTR(s.lot.miat) : "—"}</td>
                      <td className="sag num font-semibold">{sayi(s.mevcut)} <span className="text-ink-muted font-normal text-[12px]">{s.urun.birim}</span></td>
                      <td className="sag num">{TL(s.mevcut * s.urun.alisFiyat)}</td>
                      <td className="sag">
                        <span className={`durum ${g < 0 ? "durum-kritik" : g <= 30 ? "durum-uyari" : "durum-notr"}`}>
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
