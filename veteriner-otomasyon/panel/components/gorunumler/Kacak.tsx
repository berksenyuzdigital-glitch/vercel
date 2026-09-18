"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { kacakRaporu, ciro, TL, sayi, tarihTR, saatTR } from "@/lib/hesap";
import { Baslik, Olculer, Bolum, Bos, Yukleniyor, Segman } from "@/components/Ui";

const ARALIKLAR = [
  { g: 7, ad: "Son 7 gün" },
  { g: 30, ad: "Son 30 gün" },
  { g: 45, ad: "Son 45 gün" },
];

const TIP_AD: Record<string, string> = {
  muayene: "Muayene", asi: "Aşı", kuafor: "Kuaför",
  otel: "Pansiyon", operasyon: "Operasyon", perakende: "Perakende",
};

export default function Kacak() {
  const { veri } = useStore();
  const [gun, setGun] = useState(30);
  if (!veri) return <Yukleniyor />;

  const satirlar = kacakRaporu(veri, gun);
  const toplam = satirlar.reduce((t, s) => t + s.tutar, 0);
  const gelir = ciro(veri, gun);
  const oran = gelir + toplam > 0 ? (toplam / (gelir + toplam)) * 100 : 0;

  // Ürün bazında kırılım
  const urunBazli = new Map<string, { ad: string; adet: number; tutar: number }>();
  for (const s of satirlar) {
    const c = urunBazli.get(s.aciklama) ?? { ad: s.aciklama, adet: 0, tutar: 0 };
    c.adet += s.miktar; c.tutar += s.tutar;
    urunBazli.set(s.aciklama, c);
  }
  const kirilim = [...urunBazli.values()].sort((a, b) => b.tutar - a.tutar);
  const enBuyuk = kirilim[0]?.tutar ?? 1;

  // Personel bazında
  const personelBazli = new Map<string, number>();
  for (const s of satirlar) personelBazli.set(s.personel, (personelBazli.get(s.personel) ?? 0) + s.tutar);

  return (
    <>
      <Baslik
        ust="Gelir kaçağı"
        ana="Faturaya yansımayan kullanım"
        alt="Hastaya uygulandı, stoktan düştü, ama ücretlendirilmedi. Kliniklerin en yaygın ve en görünmez gelir kaybı."
        sag={<Segman secili={gun} sec={setGun}
                     secenekler={ARALIKLAR.map((a) => ({ deger: a.g, ad: a.ad }))} />}
      />

      <Olculer
        ogeler={[
          { etiket: "Toplam kaçak", deger: TL(toplam), tip: "kritik",
            not: `${satirlar.length} kalem · son ${gun} gün` },
          { etiket: "Cirodaki payı", deger: `%${oran.toFixed(1)}`, tip: "kritik",
            not: `Ücretlendirilen ciro ${TL(gelir)}` },
          { etiket: "Yıllık karşılığı", deger: TL((toplam / gun) * 365), tip: "kritik",
            not: "Bu hız devam ederse" },
          { etiket: "En çok kaçan kalem", deger: kirilim[0] ? TL(kirilim[0].tutar) : "—",
            not: kirilim[0]?.ad ?? "" },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <Bolum baslik="Kalem kalem" aciklama="Her satır bir işleme ve bir hastaya bağlıdır">
          {satirlar.length === 0 ? <Bos mesaj="Bu aralıkta kaçak kaydı yok." /> : (
            <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
              <table className="w-full tablo">
                <thead className="sticky top-0" style={{ background: "var(--surface)" }}>
                  <tr>
                    <th>Tarih</th><th>Hasta / Sahip</th>
                    <th>Kullanılan</th><th className="sag">Adet</th>
                    <th className="sag">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {satirlar.map((s, i) => (
                    <tr key={s.islemId + i}>
                      <td className="whitespace-nowrap align-top">
                        <div className="num">{tarihTR(s.tarih)} · {saatTR(s.tarih)}</div>
                        <div className="text-[11.5px] text-ink-muted mt-0.5">
                          {TIP_AD[s.tip] ?? s.tip} · {s.personel}
                        </div>
                      </td>
                      <td className="align-top">
                        <div className="font-medium whitespace-nowrap">{s.hasta}</div>
                        <div className="text-[11.5px] text-ink-muted whitespace-nowrap">{s.sahip}</div>
                      </td>
                      <td className="align-top min-w-[180px]">{s.aciklama}</td>
                      <td className="sag num align-top">{sayi(s.miktar)}</td>
                      <td className="sag rakam font-semibold align-top" style={{ color: "var(--critical)" }}>
                        {TL(s.tutar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Bolum>

        <div className="space-y-5">
          <Bolum baslik="Ürün bazında" aciklama="En çok kaçan kalemler">
            <div className="p-4 space-y-3">
              {kirilim.slice(0, 8).map((k) => (
                <div key={k.ad}>
                  <div className="flex justify-between items-baseline gap-3 mb-1.5">
                    <span className="text-[13px] leading-snug">{k.ad}</span>
                    <span className="text-[13px] font-semibold num whitespace-nowrap">{TL(k.tutar)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${(k.tutar / enBuyuk) * 100}%`, background: "var(--critical)" }} />
                  </div>
                  <div className="text-[11.5px] text-ink-muted mt-1 num">{sayi(k.adet)} adet</div>
                </div>
              ))}
            </div>
          </Bolum>

          <Bolum baslik="Personel bazında">
            <table className="w-full tablo">
              <thead><tr><th>Personel</th><th className="sag">Tutar</th></tr></thead>
              <tbody>
                {[...personelBazli.entries()].sort((a, b) => b[1] - a[1]).map(([p, t]) => (
                  <tr key={p}>
                    <td className="text-[13.5px]">{p}</td>
                    <td className="sag num font-medium">{TL(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 text-[12px] text-ink-muted leading-relaxed border-t border-line">
              Bu tablo suçlu aramak için değil — çoğu kaçak, acelede unutulan sarf malzemeden doğar.
              Eğitim ve ekran akışıyla düzelir.
            </div>
          </Bolum>
        </div>
      </div>
    </>
  );
}
