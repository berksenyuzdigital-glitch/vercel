import type { Veri } from "./veri";
import type { Urun, Lot, StokHareket } from "./tipler";

export const TL = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
export const TL2 = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(n);
export const sayi = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n);
export const tarihTR = (s: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(s));
export const saatTR = (s: string) =>
  new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(s));

export type StokSatir = {
  urun: Urun;
  lot: Lot | null;
  mevcut: number;
  kalanGun: number | null;
};

/** Mevcut stok = hareket defterinin toplamı. Miktar hiçbir yerde üzerine yazılmaz. */
export function mevcutStok(v: Veri): StokSatir[] {
  const bugun = Date.now();
  const anahtar = (h: StokHareket) => `${h.urunId}|${h.lotId ?? "-"}`;
  const toplam = new Map<string, number>();
  for (const h of v.hareketler) toplam.set(anahtar(h), (toplam.get(anahtar(h)) ?? 0) + h.miktar);

  const urunIdx = new Map(v.urunler.map((u) => [u.id, u]));
  const lotIdx = new Map(v.lotlar.map((l) => [l.id, l]));

  const out: StokSatir[] = [];
  for (const [k, mevcut] of toplam) {
    const [urunId, lotId] = k.split("|");
    const urun = urunIdx.get(urunId);
    if (!urun) continue;
    const lot = lotId === "-" ? null : lotIdx.get(lotId) ?? null;
    out.push({
      urun, lot, mevcut,
      kalanGun: lot?.miat ? Math.round((new Date(lot.miat).getTime() - bugun) / 86400000) : null,
    });
  }
  return out.sort((a, b) => a.urun.kod.localeCompare(b.urun.kod, "tr"));
}

export type UrunToplam = { urun: Urun; toplam: number; kritik: boolean };

export function urunToplamlari(v: Veri): UrunToplam[] {
  const m = new Map<string, number>();
  for (const s of mevcutStok(v)) m.set(s.urun.id, (m.get(s.urun.id) ?? 0) + s.mevcut);
  return v.urunler.map((urun) => {
    const toplam = m.get(urun.id) ?? 0;
    return { urun, toplam, kritik: toplam <= urun.kritikSeviye };
  });
}

export const kritikStok = (v: Veri) =>
  urunToplamlari(v).filter((x) => x.kritik).sort((a, b) => a.toplam - b.toplam);

export const miatTakibi = (v: Veri, esikGun = 60) =>
  mevcutStok(v)
    .filter((s) => s.kalanGun !== null && s.mevcut > 0 && s.kalanGun <= esikGun)
    .sort((a, b) => (a.kalanGun ?? 0) - (b.kalanGun ?? 0));

export type KacakSatir = {
  islemId: string; tarih: string; tip: string;
  sahip: string; hasta: string; personel: string;
  aciklama: string; miktar: number; birimFiyat: number; tutar: number;
};

/** Kullanıldı ama ücretlendirilmedi — kliniğin en yaygın gelir kaçağı. */
export function kacakRaporu(v: Veri, gunSayisi = 30): KacakSatir[] {
  const sinir = Date.now() - gunSayisi * 86400000;
  const sahipIdx = new Map(v.sahipler.map((s) => [s.id, s.ad]));
  const hastaIdx = new Map(v.hastalar.map((h) => [h.id, h.ad]));
  const out: KacakSatir[] = [];
  for (const i of v.islemler) {
    if (i.durum === "iptal") continue;
    if (new Date(i.tarih).getTime() < sinir) continue;
    for (const s of i.satirlar) {
      if (s.ucretlendirildi || !s.urunId) continue;
      out.push({
        islemId: i.id, tarih: i.tarih, tip: i.tip,
        sahip: sahipIdx.get(i.sahipId) ?? "—",
        hasta: i.hastaId ? hastaIdx.get(i.hastaId) ?? "—" : "—",
        personel: i.personel, aciklama: s.aciklama, miktar: s.miktar,
        birimFiyat: s.birimFiyat, tutar: s.miktar * s.birimFiyat,
      });
    }
  }
  return out.sort((a, b) => b.tarih.localeCompare(a.tarih));
}

export function ciro(v: Veri, gunSayisi = 30) {
  const sinir = Date.now() - gunSayisi * 86400000;
  let t = 0;
  for (const i of v.islemler) {
    if (i.durum === "iptal" || new Date(i.tarih).getTime() < sinir) continue;
    for (const s of i.satirlar) if (s.ucretlendirildi) t += s.miktar * s.birimFiyat;
  }
  return t;
}

export function bugunCiro(v: Veri) {
  const g = new Date().toISOString().slice(0, 10);
  let t = 0, adet = 0;
  for (const i of v.islemler) {
    if (i.durum === "iptal" || !i.tarih.startsWith(g)) continue;
    adet++;
    for (const s of i.satirlar) if (s.ucretlendirildi) t += s.miktar * s.birimFiyat;
  }
  return { tutar: t, adet };
}

/** Miadı geçmiş ve elde kalan stoğun alış maliyeti = doğrudan zarar */
export function miatZarari(v: Veri) {
  return mevcutStok(v)
    .filter((s) => s.kalanGun !== null && s.kalanGun < 0 && s.mevcut > 0)
    .reduce((t, s) => t + s.mevcut * s.urun.alisFiyat, 0);
}

export type LtvSatir = {
  sahipId: string; sahip: string; telefon: string;
  islemSayisi: number; toplam: number; sonZiyaret: string; gunOnce: number;
};

export function ltv(v: Veri): LtvSatir[] {
  const m = new Map<string, LtvSatir>();
  for (const i of v.islemler) {
    if (i.durum === "iptal") continue;
    const s = v.sahipler.find((x) => x.id === i.sahipId);
    if (!s) continue;
    const cur = m.get(i.sahipId) ?? {
      sahipId: i.sahipId, sahip: s.ad, telefon: s.telefon,
      islemSayisi: 0, toplam: 0, sonZiyaret: i.tarih, gunOnce: 0,
    };
    cur.islemSayisi++;
    for (const st of i.satirlar) if (st.ucretlendirildi) cur.toplam += st.miktar * st.birimFiyat;
    if (i.tarih > cur.sonZiyaret) cur.sonZiyaret = i.tarih;
    m.set(i.sahipId, cur);
  }
  const now = Date.now();
  return [...m.values()]
    .map((x) => ({ ...x, gunOnce: Math.round((now - new Date(x.sonZiyaret).getTime()) / 86400000) }))
    .sort((a, b) => b.toplam - a.toplam);
}

export function yaklasanUygulamalar(v: Veri, gun = 30) {
  const now = Date.now();
  const hastaIdx = new Map(v.hastalar.map((h) => [h.id, h]));
  const sahipIdx = new Map(v.sahipler.map((s) => [s.id, s]));
  return v.uygulamalar
    .map((u) => {
      const h = hastaIdx.get(u.hastaId);
      const s = h ? sahipIdx.get(h.sahipId) : undefined;
      const kalan = Math.round((new Date(u.sonrakiTarih).getTime() - now) / 86400000);
      return { ...u, hasta: h, sahip: s, kalan };
    })
    .filter((u) => u.hasta && u.kalan <= gun)
    .sort((a, b) => a.kalan - b.kalan);
}

/* ==================================================================
   AYLIK DENETİM RAPORU
   Kliniğe her ay gönderilen belgenin tüm sayıları tek yerden üretilir.
   Bazı ölçüler aya bağlı (kaçak, ciro), bazıları anlık durum
   (miat riski, kayıp hasta, ölü stok) — raporda ayrı işaretlenir.
================================================================== */

export type Denetim = {
  ay: string;                 // YYYY-MM
  ayAdi: string;
  ciro: number;
  islemSayisi: number;
  kacak: {
    tutar: number; kalem: number; oran: number;
    urunler: { ad: string; adet: number; tutar: number }[];
    personel: { ad: string; tutar: number }[];
  };
  miat: { gerceklesen: number; risk: number; lotAdedi: number };
  koruyucu: { kacirilan: number; tutar: number; yaklasan: number };
  kayip: { adet: number; deger: number; ortalamaLtv: number };
  stok: { bagliSermaye: number; oluDeger: number; oluKalem: number };
  uyum: { oran: number; toplamKalem: number; ucretlendirilen: number };
  /** Kalem kalem doğrulanabilen, gerçekleşmiş kayıp: kaçak + imha */
  tespitEdilenKayip: number;
  /** Varsayıma dayalı, henüz kaybedilmemiş gelir: koruyucu hekimlik + kayıp hasta */
  firsat: number;
  /** Koruyucu hekimlik hesabında kullanılan birim bedel — raporda açıkça yazılır */
  birimAsiBedeli: number;
};

export const ayAdi = (ay: string) =>
  new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" })
    .format(new Date(ay + "-01T12:00:00Z"));

/** Veride işlem bulunan aylar, yeniden eskiye */
export function mevcutAylar(v: Veri): string[] {
  const s = new Set<string>();
  for (const i of v.islemler) if (i.durum !== "iptal") s.add(i.tarih.slice(0, 7));
  return [...s].sort().reverse();
}

export function aylikDenetim(v: Veri, ay: string): Denetim {
  const buAy = (t: string) => t.startsWith(ay);
  const sahipIdx = new Map(v.sahipler.map((s) => [s.id, s.ad]));

  // --- Ciro, kaçak ve ücretlendirme uyumu ---
  let ciro = 0, kacakTutar = 0, kacakKalem = 0;
  let toplamUrunKalem = 0, ucretliUrunKalem = 0, islemSayisi = 0;
  const urunKir = new Map<string, { ad: string; adet: number; tutar: number }>();
  const personelKir = new Map<string, number>();

  for (const i of v.islemler) {
    if (i.durum === "iptal" || !buAy(i.tarih)) continue;
    islemSayisi++;
    for (const s of i.satirlar) {
      const tutar = s.miktar * s.birimFiyat;
      if (s.urunId) {
        toplamUrunKalem++;
        if (s.ucretlendirildi) ucretliUrunKalem++;
      }
      if (s.ucretlendirildi) { ciro += tutar; continue; }
      if (!s.urunId) continue;
      kacakTutar += tutar; kacakKalem++;
      const c = urunKir.get(s.aciklama) ?? { ad: s.aciklama, adet: 0, tutar: 0 };
      c.adet += s.miktar; c.tutar += tutar;
      urunKir.set(s.aciklama, c);
      personelKir.set(i.personel, (personelKir.get(i.personel) ?? 0) + tutar);
    }
  }

  // --- Miat: anlık durum ---
  const stokSatirlari = mevcutStok(v);
  const gecmisLotlar = stokSatirlari.filter((s) => (s.kalanGun ?? 1) < 0 && s.mevcut > 0);
  const riskLotlar = stokSatirlari.filter(
    (s) => s.kalanGun !== null && s.kalanGun >= 0 && s.kalanGun <= 60 && s.mevcut > 0);

  // --- Koruyucu hekimlik: kaçırılan uygulamaların parasal karşılığı ---
  // Ortalama aşı bedeli = aşı ürünlerinin satış ortalaması + uygulama hizmeti
  const asiUrunleri = v.urunler.filter((u) => u.kategori === "asi" || u.kategori === "parazit");
  const ortAsiBedeli = asiUrunleri.length
    ? asiUrunleri.reduce((t, u) => t + u.satisFiyat, 0) / asiUrunleri.length
    : 0;
  const uygulamaHizmeti = 250;
  const simdi = Date.now();
  let kacirilan = 0, yaklasan = 0;
  for (const u of v.uygulamalar) {
    const kalan = Math.round((new Date(u.sonrakiTarih).getTime() - simdi) / 86400000);
    if (kalan < -14) kacirilan++;
    else if (kalan <= 30) yaklasan++;
  }

  // --- Kayıp hasta: anlık durum ---
  const ltvListesi = ltv(v);
  const kayipListesi = ltvListesi.filter((x) => x.gunOnce > 90);
  const ortalamaLtv = ltvListesi.length
    ? ltvListesi.reduce((t, x) => t + x.toplam, 0) / ltvListesi.length : 0;

  // --- Stok: bağlı sermaye ve ölü stok (90 gündür çıkışı olmayan) ---
  const sonCikis = new Map<string, number>();
  for (const h of v.hareketler) {
    if (h.miktar >= 0) continue;
    const t = new Date(h.tarih).getTime();
    if (t > (sonCikis.get(h.urunId) ?? 0)) sonCikis.set(h.urunId, t);
  }
  let bagliSermaye = 0, oluDeger = 0, oluKalem = 0;
  for (const { urun, toplam } of urunToplamlari(v)) {
    if (toplam <= 0) continue;
    const deger = toplam * urun.alisFiyat;
    bagliSermaye += deger;
    const son = sonCikis.get(urun.id) ?? 0;
    if ((simdi - son) / 86400000 > 90) { oluDeger += deger; oluKalem++; }
  }

  const miatGerceklesen = gecmisLotlar.reduce((t, s) => t + s.mevcut * s.urun.alisFiyat, 0);
  const miatRisk = riskLotlar.reduce((t, s) => t + s.mevcut * s.urun.alisFiyat, 0);
  const koruyucuTutar = kacirilan * (ortAsiBedeli + uygulamaHizmeti);

  return {
    ay, ayAdi: ayAdi(ay), ciro, islemSayisi,
    kacak: {
      tutar: kacakTutar, kalem: kacakKalem,
      oran: ciro + kacakTutar > 0 ? (kacakTutar / (ciro + kacakTutar)) * 100 : 0,
      urunler: [...urunKir.values()].sort((a, b) => b.tutar - a.tutar).slice(0, 5),
      personel: [...personelKir.entries()].map(([ad, tutar]) => ({ ad, tutar }))
        .sort((a, b) => b.tutar - a.tutar),
    },
    miat: { gerceklesen: miatGerceklesen, risk: miatRisk, lotAdedi: gecmisLotlar.length + riskLotlar.length },
    koruyucu: { kacirilan, tutar: koruyucuTutar, yaklasan },
    kayip: {
      adet: kayipListesi.length,
      deger: kayipListesi.reduce((t, x) => t + x.toplam, 0),
      ortalamaLtv,
    },
    stok: { bagliSermaye, oluDeger, oluKalem },
    uyum: {
      oran: toplamUrunKalem > 0 ? (ucretliUrunKalem / toplamUrunKalem) * 100 : 100,
      toplamKalem: toplamUrunKalem, ucretlendirilen: ucretliUrunKalem,
    },
    tespitEdilenKayip: kacakTutar + miatGerceklesen,
    firsat: koruyucuTutar,
    birimAsiBedeli: ortAsiBedeli + uygulamaHizmeti,
  };
}
