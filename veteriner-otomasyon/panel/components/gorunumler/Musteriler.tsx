"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ltv, TL, tarihTR } from "@/lib/hesap";
import { Baslik, Olculer, Bolum, Bos, Yukleniyor } from "@/components/Ui";

export default function Musteriler() {
  const { veri } = useStore();
  const [sadeceKayip, setSadeceKayip] = useState(false);
  if (!veri) return <Yukleniyor />;

  const tum = ltv(veri);
  const kayip = tum.filter((x) => x.gunOnce > 90);
  const liste = sadeceKayip ? kayip : tum;
  const ortalama = tum.length ? tum.reduce((t, x) => t + x.toplam, 0) / tum.length : 0;
  const kayipDeger = kayip.reduce((t, x) => t + x.toplam, 0);
  const hastaSayisi = new Map<string, number>();
  for (const h of veri.hastalar) hastaSayisi.set(h.sahipId, (hastaSayisi.get(h.sahipId) ?? 0) + 1);

  return (
    <>
      <Baslik ust="Cari & müşteri değeri" ana="Yaşam boyu değer (LTV)"
              alt="Bir hasta sahibinin klinikte bıraktığı toplam tutar. Kayıp müşteri, kaybedilen yıllık gelirdir."
              sag={
                <button onClick={() => setSadeceKayip((v) => !v)} className="durum cursor-pointer"
                        style={sadeceKayip ? { background: "var(--critical)", color: "#fff" }
                                           : { background: "var(--surface-2)", color: "var(--ink-2)" }}>
                  90+ gündür gelmeyenler
                </button>
              } />

      <Olculer
        ogeler={[
          { etiket: "Ortalama LTV", deger: TL(ortalama), not: `${tum.length} kayıtlı sahip` },
          { etiket: "90+ gündür gelmeyen", deger: String(kayip.length),
            tip: kayip.length ? "kritik" : "iyi", not: "Geri kazanım listesi" },
          { etiket: "Risk altındaki değer", deger: TL(kayipDeger), tip: "kritik",
            not: "Geri kazanılmazsa kaybedilecek" },
          { etiket: "En değerli müşteri", deger: tum[0] ? TL(tum[0].toplam) : "—",
            not: tum[0]?.sahip ?? "" },
        ]}
      />

      <Bolum baslik={sadeceKayip ? "Geri kazanım listesi" : "Tüm müşteriler"}
             aciklama={sadeceKayip ? "Tek tıkla hatırlatma gönderilecek hasta sahipleri" : "Toplam harcamaya göre sıralı"}>
        {liste.length === 0 ? <Bos mesaj="Kayıt yok." /> : (
          <div className="overflow-x-auto">
            <table className="w-full tablo">
              <thead>
                <tr>
                  <th>Sahip</th><th>Telefon</th><th className="sag">Hayvan</th>
                  <th className="sag">İşlem</th><th className="sag">Toplam (LTV)</th>
                  <th>Son ziyaret</th><th className="sag">Durum</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((x) => (
                  <tr key={x.sahipId}>
                    <td className="font-medium">{x.sahip}</td>
                    <td className="num text-[12.5px] text-ink-2">{x.telefon}</td>
                    <td className="sag num">{hastaSayisi.get(x.sahipId) ?? 0}</td>
                    <td className="sag num">{x.islemSayisi}</td>
                    <td className="sag num font-semibold">{TL(x.toplam)}</td>
                    <td className="num text-[12.5px]">{tarihTR(x.sonZiyaret)}</td>
                    <td className="sag">
                      <span className={`durum ${x.gunOnce > 90 ? "durum-kritik" : x.gunOnce > 30 ? "durum-uyari" : "durum-iyi"}`}>
                        {x.gunOnce} gün önce
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3.5 border-t border-line text-[12.5px] text-ink-2 leading-relaxed">
          <strong className="text-ink">Satış argümanı:</strong> bu klinikte ortalama müşteri değeri{" "}
          <strong className="text-ink num">{TL(ortalama)}</strong>. 90 günden uzun süredir gelmeyen{" "}
          <strong className="text-ink num">{kayip.length}</strong> müşterinin toplam değeri{" "}
          <strong className="num" style={{ color: "var(--critical)" }}>{TL(kayipDeger)}</strong>.
        </div>
      </Bolum>
    </>
  );
}
