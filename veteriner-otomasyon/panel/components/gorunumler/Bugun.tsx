"use client";

import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import {
  kritikStok, miatTakibi, kacakRaporu, bugunCiro, ciro, miatZarari,
  yaklasanUygulamalar, TL, sayi, tarihTR,
} from "@/lib/hesap";
import { PROTOKOLLER } from "@/lib/veri";
import { Baslik, Odak, Olculer, Bolum, Bos, Yukleniyor, Mono } from "@/components/Ui";

export default function Bugun() {
  const { veri } = useStore();
  const { git } = useNav();
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
  const oran = aylikCiro > 0 ? (kacakTutar / (aylikCiro + kacakTutar)) * 100 : 0;
  const protokolIdx = new Map(PROTOKOLLER.map((p) => [p.id, p.ad]));

  const tarih = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date());

  return (
    <>
      <Baslik ust={tarih} ana="Bugün" />

      <Odak
        etiket="Son 30 günde faturaya yansımayan kullanım"
        deger={TL(kacakTutar)}
        tip="kritik"
        aciklama={
          <>
            {kacaklar.length} kalem ilaç ve sarf malzeme hastaya uygulandı, stoktan düştü,
            ama ücretlendirilmedi. Ayın cirosunun <strong className="text-ink num">%{oran.toFixed(1)}</strong>'i;
            bu hızda yıllık karşılığı <strong className="text-ink num">{TL((kacakTutar / 30) * 365)}</strong>.
          </>
        }
        eylem={<button onClick={() => git("kacak")} className="btn btn-ana">Kalem kalem incele</button>}
      />

      <Olculer
        ogeler={[
          { etiket: "Bugünkü ciro", deger: TL(bugun.tutar), not: `${bugun.adet} işlem` },
          {
            etiket: "Kritik stok", deger: String(kritikler.length),
            tip: kritikler.length ? "kritik" : "iyi",
            not: kritikler[0] ? `En düşük: ${kritikler[0].urun.ad}` : "Tümü yeterli",
          },
          {
            etiket: "Miadı yaklaşan lot", deger: String(miatlar.length),
            tip: gecmis.length ? "kritik" : miatlar.length ? "uyari" : "iyi",
            not: gecmis.length ? `${gecmis.length} lotun miadı geçti` : "Miadı geçen yok",
          },
          {
            etiket: "Miat zararı", deger: TL(zarar),
            tip: zarar > 0 ? "kritik" : "iyi", not: "Elde kalan, miadı geçmiş stok",
          },
        ]}
      />

      <div className="grid xl:grid-cols-2 gap-5 items-start">
        <Bolum
          baslik="Sipariş verilmesi gerekenler"
          aciklama="Kritik seviyenin altına düşen ürünler"
          sag={<button onClick={() => git("stok")} className="text-[12.5px] font-medium"
                       style={{ color: "var(--accent-ink)" }}>Tüm stok</button>}
        >
          {kritikler.length === 0 ? <Bos mesaj="Kritik seviyede ürün yok." /> : (
            <table className="tablo">
              <thead><tr><th>Ürün</th><th className="sag">Kalan</th><th className="sag">Kritik eşik</th></tr></thead>
              <tbody>
                {kritikler.slice(0, 6).map(({ urun, toplam }) => (
                  <tr key={urun.id}>
                    <td>
                      <div className="font-medium">{urun.ad}</div>
                      <div className="text-[11.5px] text-ink-muted num mt-0.5">{urun.kod}</div>
                    </td>
                    <td className="sag num font-semibold" style={{ color: "var(--critical)" }}>
                      {sayi(toplam)}<span className="text-ink-muted font-normal"> {urun.birim}</span>
                    </td>
                    <td className="sag num text-ink-muted">{sayi(urun.kritikSeviye)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Bolum>

        <Bolum
          baslik="Miat riski"
          aciklama="Miadı geçen ve 60 gün içinde dolacak lotlar"
          sag={<button onClick={() => git("miat")} className="text-[12.5px] font-medium"
                       style={{ color: "var(--accent-ink)" }}>Detay</button>}
        >
          {miatlar.length === 0 ? <Bos mesaj="Yaklaşan miat yok." /> : (
            <table className="tablo">
              <thead><tr><th>Ürün</th><th className="sag">Adet</th><th className="sag">Durum</th></tr></thead>
              <tbody>
                {miatlar.slice(0, 6).map((m) => {
                  const g = m.kalanGun ?? 0;
                  return (
                    <tr key={`${m.urun.id}-${m.lot?.id}`}>
                      <td>
                        <div className="font-medium">{m.urun.ad}</div>
                        <div className="text-[11.5px] text-ink-muted num mt-0.5">
                          Lot {m.lot?.lotNo} · {m.lot?.miat ? tarihTR(m.lot.miat) : "—"}
                        </div>
                      </td>
                      <td className="sag num">{sayi(m.mevcut)}</td>
                      <td className="sag">
                        <span className={`durum ${g < 0 ? "durum-kritik" : g <= 30 ? "durum-uyari" : "durum-notr"}`}>
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

        <Bolum
          baslik="Koruyucu hekimlik"
          aciklama="Kaçırılan ve 21 gün içinde gelmesi gerekenler"
          sag={<button onClick={() => git("takvim")} className="text-[12.5px] font-medium"
                       style={{ color: "var(--accent-ink)" }}>Takvim</button>}
        >
          {yaklasan.length === 0 ? <Bos mesaj="Yaklaşan uygulama yok." /> : (
            <table className="tablo">
              <thead><tr><th>Hasta</th><th>Uygulama</th><th className="sag">Durum</th></tr></thead>
              <tbody>
                {yaklasan.slice(0, 6).map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Mono ad={u.hasta?.ad ?? "?"} tur={u.hasta?.tur} boyut={28} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{u.hasta?.ad}</div>
                          <div className="text-[11.5px] text-ink-muted truncate">{u.sahip?.ad}</div>
                        </div>
                      </div>
                    </td>
                    <td>{protokolIdx.get(u.protokolId)}</td>
                    <td className="sag">
                      <span className={`durum ${u.kalan < 0 ? "durum-kritik" : u.kalan <= 7 ? "durum-uyari" : "durum-notr"}`}>
                        {u.kalan < 0 ? `${Math.abs(u.kalan)} gün gecikti` : `${u.kalan} gün kaldı`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Bolum>

        <Bolum baslik="Ayın özeti" dolgu>
          <dl className="divide-y" style={{ borderColor: "var(--line-soft)" }}>
            {[
              ["Ücretlendirilen ciro", TL(aylikCiro), "var(--ink)"],
              ["Faturaya yansımayan", TL(kacakTutar), "var(--critical)"],
              ["Miadı geçen stok zararı", TL(zarar), "var(--critical)"],
              ["Kaçırılan aşı randevusu", `${yaklasan.filter((u) => u.kalan < 0).length} hasta`, "var(--warning)"],
            ].map(([e, d, c]) => (
              <div key={e} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[13.5px] text-ink-2">{e}</dt>
                <dd className="rakam text-[15px] font-semibold" style={{ color: c }}>{d}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[12.5px] text-ink-muted leading-relaxed pt-3.5 mt-1 border-t border-line">
            Bu ay geri kazanılabilir toplam:{" "}
            <strong className="text-ink rakam">{TL(kacakTutar + zarar)}</strong>
          </p>
        </Bolum>
      </div>
    </>
  );
}
