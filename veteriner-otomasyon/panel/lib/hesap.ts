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
