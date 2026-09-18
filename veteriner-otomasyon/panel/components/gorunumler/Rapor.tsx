"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { aylikDenetim, mevcutAylar, ayAdi, TL, sayi } from "@/lib/hesap";
import { Yukleniyor } from "@/components/Ui";

/** Kliniğe her ay gönderilen tek sayfalık denetim belgesi. */
export default function Rapor() {
  const { veri } = useStore();
  const aylar = useMemo(() => (veri ? mevcutAylar(veri) : []), [veri]);
  const [ay, setAy] = useState<string | null>(null);
  const [bedel, setBedel] = useState(5000);

  if (!veri) return <Yukleniyor />;
  const seciliAy = ay ?? aylar[0];
  const d = aylikDenetim(veri, seciliAy);
  const kat = bedel > 0 ? d.tespitEdilenKayip / bedel : 0;

  const bloklar = [
    {
      no: 1, grup: "kayip", baslik: "Gelir kaçağı — faturaya yansımayan kullanım",
      tutar: d.kacak.tutar,
      ozet: `${d.kacak.kalem} kalem ilaç ve sarf malzeme hastaya uygulandı, stoktan düştü, faturaya girmedi. Ayın cirosunun %${d.kacak.oran.toFixed(1)}'i.`,
      detay: d.kacak.urunler.map((u) => [u.ad, `${sayi(u.adet)} adet`, TL(u.tutar)] as [string, string, string]),
      detayBaslik: "En çok kaçan kalemler",
      donem: "ay",
    },
    {
      no: 2, grup: "kayip", baslik: "Miat zararı — imha edilen stok",
      tutar: d.miat.gerceklesen,
      ozet: `Miadı geçmiş ve elde kalan ürünlerin alış maliyeti. Ayrıca önümüzdeki 60 gün içinde ${TL(d.miat.risk)} tutarında stok risk altında.`,
      detay: [["Riskli ve miadı geçmiş lot", `${d.miat.lotAdedi} lot`, TL(d.miat.gerceklesen + d.miat.risk)]] as [string, string, string][],
      detayBaslik: "Toplam risk",
      donem: "anlık",
    },
    {
      no: 3, grup: "firsat", baslik: "Koruyucu hekimlik — geri kazanılabilir randevu",
      tutar: d.koruyucu.tutar,
      ozet: `${d.koruyucu.kacirilan} hastanın aşı veya parazit uygulaması takvimden düştü. Tutar, hasta sayısının ortalama aşı + uygulama bedeliyle (${TL(d.birimAsiBedeli)}) çarpımıdır — gerçekleşmiş kayıp değil, geri kazanılabilir randevu karşılığıdır. Önümüzdeki 30 günde ${d.koruyucu.yaklasan} uygulama daha planlı.`,
      detay: [
        ["Kaçırılan uygulama", `${d.koruyucu.kacirilan} hasta`, TL(d.koruyucu.tutar)],
        ["Kullanılan birim bedel", "ortalama", TL(d.birimAsiBedeli)],
        ["Önümüzdeki 30 gün", `${d.koruyucu.yaklasan} hasta`, "takipte"],
      ] as [string, string, string][],
      detayBaslik: "Takvim durumu",
      donem: "anlık",
    },
    {
      no: 4, grup: "firsat", baslik: "Kayıp hasta — geri kazanım listesi",
      tutar: d.kayip.deger,
      ozet: `${d.kayip.adet} hasta sahibi 90 günden uzun süredir kliniğe gelmedi. Ortalama müşteri yaşam boyu değeri ${TL(d.kayip.ortalamaLtv)}.`,
      detay: [
        ["90+ gündür gelmeyen", `${d.kayip.adet} sahip`, TL(d.kayip.deger)],
        ["Ortalama yaşam boyu değer", "—", TL(d.kayip.ortalamaLtv)],
      ] as [string, string, string][],
      detayBaslik: "Geri kazanım potansiyeli",
      donem: "anlık",
    },
    {
      no: 5, grup: "verim", baslik: "Stok verimliliği",
      tutar: d.stok.oluDeger,
      ozet: `Depoda ${TL(d.stok.bagliSermaye)} tutarında mal bağlı. Bunun ${TL(d.stok.oluDeger)} kadarı 90 gündür hiç kullanılmadı.`,
      detay: [
        ["Toplam bağlı sermaye", "—", TL(d.stok.bagliSermaye)],
        ["Hareketsiz stok", `${d.stok.oluKalem} kalem`, TL(d.stok.oluDeger)],
      ] as [string, string, string][],
      detayBaslik: "Depo durumu",
      donem: "anlık",
    },
    {
      no: 6, grup: "verim", baslik: "Ücretlendirme uyumu",
      tutar: null as number | null,
      yuzde: d.uyum.oran,
      ozet: `Kullanılan ${d.uyum.toplamKalem} ürün kaleminin ${d.uyum.ucretlendirilen} tanesi faturaya işlendi. Bu oran %95'in altındayken 1. maddedeki kayıp büyümeye devam eder.`,
      detay: [
        ["Kullanılan kalem", "—", sayi(d.uyum.toplamKalem)],
        ["Faturaya işlenen", "—", sayi(d.uyum.ucretlendirilen)],
      ] as [string, string, string][],
      detayBaslik: "Ölçüm",
      donem: "ay",
    },
  ];

  return (
    <>
      {/* Kontroller — yazdırmada gizlenir */}
      <div className="yazdirma-gizle flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="mikro mb-2">Aylık denetim</div>
          <h1 className="text-[28px] font-semibold leading-[1.15]">Rapor</h1>
          <p className="text-[13.5px] text-ink-2 mt-2 max-w-[62ch]">
            Kliniğe her ay gönderilen belge. Aylık hizmet bedelinin görünür karşılığı budur.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="etiket" htmlFor="rapor-ay">Dönem</label>
            <select id="rapor-ay" className="girdi !w-auto" value={seciliAy}
                    onChange={(e) => setAy(e.target.value)}>
              {aylar.map((a) => <option key={a} value={a}>{ayAdi(a)}</option>)}
            </select>
          </div>
          <div>
            <label className="etiket" htmlFor="rapor-bedel">Aylık hizmet bedeli</label>
            <input id="rapor-bedel" className="girdi !w-[130px] num" type="number" min={0} step={500}
                   value={bedel} onChange={(e) => setBedel(Number(e.target.value) || 0)} />
          </div>
          <button className="btn btn-ana" onClick={() => window.print()}>Yazdır / PDF</button>
        </div>
      </div>

      {/* Belge */}
      <article className="sayfa">
        <header className="flex items-start justify-between gap-6 pb-5 mb-7 border-b kagit-line"
                style={{ borderBottomWidth: 1 }}>
          <div className="flex items-center gap-3">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#0d5b50" aria-hidden>
              <ellipse cx="7.2" cy="8.4" rx="2.1" ry="2.7" />
              <ellipse cx="12" cy="6.6" rx="2.1" ry="2.9" />
              <ellipse cx="16.8" cy="8.4" rx="2.1" ry="2.7" />
              <path d="M12 11.4c2.9 0 5.4 2.3 5.4 4.8 0 1.9-1.5 3-3.4 3-.9 0-1.4-.3-2-.3s-1.1.3-2 .3c-1.9 0-3.4-1.1-3.4-3 0-2.5 2.5-4.8 5.4-4.8z" />
            </svg>
            <div>
              <div className="baslik-yazi text-[17px] font-semibold kagit-ink">
                Kadıköy Veteriner Polikliniği
              </div>
              <div className="text-[12.5px] kagit-muted">Aylık Denetim Raporu · {d.ayAdi}</div>
            </div>
          </div>
          <div className="text-right text-[11.5px] kagit-muted leading-relaxed">
            <div>Hazırlayan: PatiKlinik</div>
            <div className="num">
              {new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" })
                .format(new Date())}
            </div>
          </div>
        </header>

        {/* Tek satır — belgenin tamamı bu rakam için var */}
        <section className="rapor-blok mb-8">
          <div className="mikro mb-3" style={{ color: "#6f7975" }}>
            {d.ayAdi} döneminde tespit edilen kayıp
          </div>
          <div className="rakam font-semibold leading-none"
               style={{ fontSize: 54, color: "#a8322c" }}>
            {TL(d.tespitEdilenKayip)}
          </div>
          <p className="text-[13.5px] kagit-ink2 mt-4 leading-relaxed max-w-[66ch]">
            Faturaya yansımayan kullanım ve miadı geçip imha edilen stoğun toplamı.
            Her iki kalem de kliniğin kendi işlem kayıtlarından{" "}
            <strong className="kagit-ink">kalem kalem doğrulanabilir</strong> — tahmin değildir.
          </p>
          <div className="mt-5 pt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1"
               style={{ borderTop: "1px solid #eeeee8" }}>
            <span className="text-[13px] kagit-ink2">Ayrıca geri kazanım fırsatı:</span>
            <span className="rakam text-[19px] font-semibold" style={{ color: "#0d5b50" }}>
              {TL(d.firsat)}
            </span>
            <span className="text-[12px] kagit-muted">
              (takvimden düşen {d.koruyucu.kacirilan} koruyucu hekimlik randevusunun karşılığı — varsayıma dayalı)
            </span>
          </div>
        </section>

        {/* Özet şerit */}
        <section className="rapor-blok grid grid-cols-3 gap-px mb-9 kagit-fill"
                 style={{ border: "1px solid #e2e2db", borderRadius: 6, overflow: "hidden" }}>
          {[
            ["Ücretlendirilen ciro", TL(d.ciro), `${d.islemSayisi} işlem`],
            ["Kaçağın cirodaki payı", `%${d.kacak.oran.toFixed(1)}`, "sektör bandı %5–15"],
            ["Ücretlendirme uyumu", `%${d.uyum.oran.toFixed(0)}`, "hedef %95+"],
          ].map(([e, v, n]) => (
            <div key={e} className="p-4" style={{ background: "#ffffff" }}>
              <div className="mikro mb-2" style={{ color: "#6f7975" }}>{e}</div>
              <div className="rakam text-[21px] font-semibold kagit-ink">{v}</div>
              <div className="text-[11.5px] kagit-muted mt-1.5">{n}</div>
            </div>
          ))}
        </section>

        {/* Altı başlık */}
        <div className="space-y-7">
          {bloklar.map((b, i) => (
            <div key={`g${b.no}`}>
            {(i === 0 || bloklar[i - 1].grup !== b.grup) && (
              <div className="mikro pt-1 pb-4" style={{ color: "#6f7975" }}>
                {b.grup === "kayip" ? "Tespit edilen kayıp — doğrulanabilir"
                  : b.grup === "firsat" ? "Geri kazanım fırsatı — varsayıma dayalı"
                  : "Verimlilik göstergeleri"}
              </div>
            )}
            <section key={b.no} className="rapor-blok">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="rakam text-[13px] font-semibold" style={{ color: "#0d5b50" }}>
                  {String(b.no).padStart(2, "0")}
                </span>
                <h2 className="text-[15px] font-semibold kagit-ink flex-1">{b.baslik}</h2>
                <span className="rakam text-[17px] font-semibold"
                      style={{ color: b.tutar === null ? "#14201d" : "#a8322c" }}>
                  {b.tutar === null ? `%${b.yuzde!.toFixed(0)}` : TL(b.tutar)}
                </span>
              </div>
              <p className="text-[13px] kagit-ink2 leading-relaxed mb-3 max-w-[72ch]">
                {b.ozet}
                {b.donem === "anlık" && (
                  <span className="kagit-muted"> (anlık durum, aya bağlı değil)</span>
                )}
              </p>
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <caption className="mikro text-left pb-1.5" style={{ color: "#6f7975" }}>
                  {b.detayBaslik}
                </caption>
                <tbody>
                  {b.detay.map((satir, i) => (
                    <tr key={i}>
                      <td className="text-[12.5px] kagit-ink2 py-1.5"
                          style={{ borderTop: "1px solid #eeeee8" }}>{satir[0]}</td>
                      <td className="text-[12.5px] kagit-muted py-1.5 num text-right whitespace-nowrap px-4"
                          style={{ borderTop: "1px solid #eeeee8" }}>{satir[1]}</td>
                      <td className="text-[12.5px] kagit-ink py-1.5 num text-right font-medium whitespace-nowrap"
                          style={{ borderTop: "1px solid #eeeee8" }}>{satir[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            </div>
          ))}
        </div>

        {/* Kapanış */}
        <footer className="rapor-blok mt-10 pt-6" style={{ borderTop: "1px solid #e2e2db" }}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[46ch]">
              <div className="mikro mb-2" style={{ color: "#6f7975" }}>Karşılaştırma</div>
              <p className="text-[13.5px] kagit-ink2 leading-relaxed">
                Bu ay doğrulanabilir şekilde tespit edilen kayıp{" "}
                <strong className="kagit-ink rakam">{TL(d.tespitEdilenKayip)}</strong>,
                aylık hizmet bedeli <strong className="kagit-ink rakam">{TL(bedel)}</strong>.
                Geri kazanım fırsatı bu karşılaştırmaya dahil edilmemiştir.
              </p>
            </div>
            <div className="text-right">
              <div className="rakam font-semibold leading-none" style={{ fontSize: 40, color: "#0d5b50" }}>
                {kat >= 100 ? "99+" : kat.toFixed(1)}×
              </div>
              <div className="text-[11.5px] kagit-muted mt-1.5">hizmet bedelinin karşılığı</div>
            </div>
          </div>
          <p className="text-[11px] kagit-muted mt-6 leading-relaxed">
            Rakamlar kliniğin kendi işlem kayıtlarından üretilmiştir. &quot;Anlık durum&quot; işaretli
            maddeler rapor tarihindeki envanter ve hasta durumunu yansıtır. Sektör kaynakları
            veteriner kliniklerinde faturalanmayan işlem oranını %5–15 bandında bildirmektedir.
          </p>
        </footer>
      </article>
    </>
  );
}
