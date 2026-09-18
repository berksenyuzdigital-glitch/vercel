export type Kategori = "ilac" | "asi" | "parazit" | "mama" | "sarf";

export type Urun = {
  id: string;
  kod: string;
  ad: string;
  kategori: Kategori;
  birim: string;
  kritikSeviye: number;
  alisFiyat: number;
  satisFiyat: number;
  kdv: number;
  miatTakipli: boolean;
};

export type Lot = {
  id: string;
  urunId: string;
  lotNo: string;
  miat: string | null; // YYYY-MM-DD
  girisTarihi: string;
};

export type HareketTip = "giris" | "cikis" | "fire" | "sayim" | "iade";
export type HareketKaynak =
  | "mal_kabul"
  | "muayene"
  | "perakende"
  | "manuel"
  | "sayim"
  | "fire";

export type StokHareket = {
  id: string;
  urunId: string;
  lotId: string | null;
  tip: HareketTip;
  kaynak: HareketKaynak;
  miktar: number; // giris +, cikis -
  birimFiyat: number;
  islemId: string | null;
  hastaId: string | null;
  kullanici: string;
  aciklama?: string;
  tarih: string; // ISO
};

export type Sahip = {
  id: string;
  ad: string;
  telefon: string;
  email?: string;
  ilce?: string;
  kayitTarihi: string;
};

export type Tur = "kedi" | "kopek" | "kus" | "kemirgen" | "diger";

export type Hasta = {
  id: string;
  sahipId: string;
  ad: string;
  tur: Tur;
  irk: string;
  cinsiyet: "erkek" | "disi";
  dogumTarihi: string;
  mikrocip?: string;
  kisir: boolean;
  gorsel?: string;
  kronikNot?: string;
};

export type Olcum = {
  id: string;
  hastaId: string;
  tarih: string;
  kiloKg: number;
  vks?: number; // vücut kondisyon skoru 1-9
  not?: string;
};

export type IslemTip =
  | "muayene"
  | "asi"
  | "kuafor"
  | "otel"
  | "operasyon"
  | "perakende";

export type IslemSatir = {
  id: string;
  urunId?: string;
  hizmetId?: string;
  aciklama: string;
  miktar: number;
  birimFiyat: number;
  kdv: number;
  /** false ise: kullanıldı ama faturaya yansımadı → kaçak raporuna düşer */
  ucretlendirildi: boolean;
};

export type Islem = {
  id: string;
  sahipId: string;
  hastaId: string | null;
  tip: IslemTip;
  durum: "acik" | "tamamlandi" | "iptal";
  personel: string;
  tarih: string;
  satirlar: IslemSatir[];
};

export type Hizmet = {
  id: string;
  kod: string;
  ad: string;
  fiyat: number;
  sureDk: number;
  kdv: number;
};

export type Protokol = {
  id: string;
  ad: string;
  tur: Tur | null;
  tekrarAy: number;
};

export type Uygulama = {
  id: string;
  hastaId: string;
  protokolId: string;
  uygulamaTarihi: string | null;
  sonrakiTarih: string;
  durum: "planlandi" | "uygulandi" | "kacirildi";
};
