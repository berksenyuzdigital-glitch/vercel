"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  kritikStok, miatTakibi, kacakRaporu, bugunCiro, ciro, miatZarari,
  yaklasanUygulamalar, TL, sayi,
} from "@/lib/hesap";
import { PROTOKOLLER } from "@/lib/veri";
import { Baslik, Kpi, Bolum, Bos, Yukleniyor } from "@/components/Ui";

export default function Bugun() {
  const { veri } = useStore();
  if (!veri) return <Yukleniyor />;

  const kacaklar = kacakRaporu(veri, 30);
  const kacakTutar = kacaklar.reduce((t, k) => t + k.tutar, 0);
  const aylikCiro = ciro(veri, 30);
  const kritikler = kritikStok(veri);
  const miatlar = miatTakibi(veri, 60);
  const gecmis = miatlar.filter((m) => (m.kalanGun ?? 0) < 0);
  const bugun = bugunCiro(veri);
  const zarar = miatZarari(veri);
  const yaklasan = yaklasanUygulamalar(veri, 21);
  const kacirilan = yaklasan.filter((u) => u.kalan < 0);
  const oran = aylikCiro > 0 ? (kacakTutar / (aylikCiro + kacakTutar)) * 100 : 0;
  const protokolIdx = new Map(PROTOKOLLER.map((p) => [p.id, p.ad]));

  return (
    <>
      <Baslik
        ust={new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
        ana="Bugün"
        alt="Kliniğin bugün para kaybettiği ve kaybedeceği yerler. Her kart tıklanabilir."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi ikon="🩸" tip="kritik" etiket="Son 30 gün — faturaya yansımayan"
             deger={TL(kacakTutar)} alt={`${kacaklar.length} kalem · cironun %${oran.toFixed(1)}'i`} />
        <Kpi ikon="📦" tip={kritikler.length ? "kritik" : "iyi"} etiket="Kritik seviyede ürün"
             deger={String(kritikler.length)} alt={kritikler[0] ? `En düşük: ${kritikler[0].urun.ad}` : "Tümü yeterli"} />
        <Kpi ikon="⏳" tip={gecmis.length ? "kritik" : miatlar.length ? "uyari" : "iyi"} etiket="Miadı 60 günde dolacak"
             deger={String(miatlar.length)} alt={gecmis.length ? `${gecmis.length} lotun miadı GEÇTİ · ${TL(zarar)} zarar` : "Miadı geçen yok"} />
        <Kpi ikon="💳" etiket="Bugünkü ciro" deger={TL(bugun.tutar)} alt={`${bugun.adet} işlem`} />
      </div>

      {/* Satışın kalbi: kaçak vurgusu */}
      <div className="kart p-5 mb-6" style={{ borderColor: "var(--critical)", background: "var(--crit-wash)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-[62ch]">
            <div className="text-[13px] font-semibold mb-1.5" style={{ color: "var(--critical)" }}>
              ⚠︎ Faturaya yansımayan kullanım
            </div>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Son 30 günde <strong className="text-ink num">{TL(kacakTutar)}</strong> değerinde ilaç ve
              sarf malzeme hastaya uygulandı ama <strong>ücretlendirilmedi</strong>. Yıllık karşılığı
              yaklaşık <strong className="text-ink num">{TL(kacakTutar * 12)}</strong>.
            </p>
          </div>
          <Link href="/kacak" className="btn btn-ana">Kalem kalem gör →</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Bolum baslik="Kritik stok" aciklama="Kritik seviyenin altına düşen ürünler"
               sag={<Link href="/stok" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>Tüm stok →</Link>}>
          {kritikler.length === 0 ? <Bos mesaj="Kritik seviyede ürün yok." /> : (
            <table className="w-full tablo">
              <thead><tr><th>Ürün</th><th className="text-right">Kalan</th><th className="text-right">Kritik</th><th></th></tr></thead>
              <tbody>
                {kritikler.slice(0, 7).map(({ urun, toplam }) => (
                  <tr key={urun.id}>
                    <td>
                      <div className="font-medium">{urun.ad}</div>
                      <div className="text-[12px] text-ink-muted num">{urun.kod}</div>
                    </td>
                    <td className="text-right num font-semibold" style={{ color: "var(--critical)" }}>
                      {sayi(toplam)} <span className="text-ink-muted font-normal">{urun.birim}</span>
                    </td>
                    <td className="text-right num text-ink-muted">{sayi(urun.kritikSeviye)}</td>
                    <td className="text-right"><span className="rozet rozet-kritik">sipariş</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Bolum>

        <Bolum baslik="Miat takibi" aciklama="Miadı geçen ve 60 gün içinde dolacak lotlar"
               sag={<Link href="/miat" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>Detay →</Link>}>
          {miatlar.length === 0 ? <Bos mesaj="Yaklaşan miat yok." /> : (
            <table className="w-full tablo">
              <thead><tr><th>Ürün / Lot</th><th className="text-right">Adet</th><th className="text-right">Durum</th></tr></thead>
              <tbody>
                {miatlar.slice(0, 7).map((m) => {
                  const g = m.kalanGun ?? 0;
                  return (
                    <tr key={`${m.urun.id}-${m.lot?.id}`}>
                      <td>
                        <div className="font-medium">{m.urun.ad}</div>
                        <div className="text-[12px] text-ink-muted num">Lot {m.lot?.lotNo} · {m.lot?.miat}</div>
                      </td>
                      <td className="text-right num">{sayi(m.mevcut)}</td>
                      <td className="text-right">
                        <span className={`rozet ${g < 0 ? "rozet-kritik" : g <= 30 ? "rozet-uyari" : "rozet-notr"}`}>
                          {g < 0 ? `${Math.abs(g)} gün geçti` : `${g} gün`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Bolum>

        <Bolum baslik="Aşı & parazit takvimi" aciklama="Kaçırılan ve 21 gün içinde gelmesi gerekenler"
               sag={<Link href="/takvim" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>Takvim →</Link>}>
          {yaklasan.length === 0 ? <Bos mesaj="Yaklaşan uygulama yok." /> : (
            <table className="w-full tablo">
              <thead><tr><th>Hasta</th><th>Uygulama</th><th className="text-right">Durum</th></tr></thead>
              <tbody>
                {yaklasan.slice(0, 7).map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="font-medium">{u.hasta?.ad}</div>
                      <div className="text-[12px] text-ink-muted">{u.sahip?.ad}</div>
                    </td>
                    <td className="text-[13.5px]">{protokolIdx.get(u.protokolId)}</td>
                    <td className="text-right">
                      <span className={`rozet ${u.kalan < 0 ? "rozet-kritik" : u.kalan <= 7 ? "rozet-uyari" : "rozet-notr"}`}>
                        {u.kalan < 0 ? `${Math.abs(u.kalan)} gün gecikti` : `${u.kalan} gün kaldı`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Bolum>

        <Bolum baslik="Bu ayın özeti">
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              ["Ücretlendirilen ciro", TL(aylikCiro), "var(--ink)"],
              ["Kaçak (ücretlendirilmeyen)", TL(kacakTutar), "var(--critical)"],
              ["Miadı geçen stok zararı", TL(zarar), "var(--critical)"],
              ["Kaçırılan aşı randevusu", `${kacirilan.length} hasta`, "var(--serious)"],
            ].map(([e, d, c]) => (
              <div key={e} className="rounded-[10px] p-3.5" style={{ background: "var(--surface-2)" }}>
                <div className="text-[12px] text-ink-2 mb-1.5">{e}</div>
                <div className="text-[18px] font-semibold num" style={{ color: c }}>{d}</div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 -mt-1">
            <p className="text-[12.5px] text-ink-muted leading-relaxed">
              Toplam geri kazanılabilir tutar:{" "}
              <strong className="text-ink num">{TL(kacakTutar + zarar)}</strong> / ay.
            </p>
          </div>
        </Bolum>
      </div>
    </>
  );
}
