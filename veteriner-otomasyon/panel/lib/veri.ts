import type {
  Urun, Lot, StokHareket, Sahip, Hasta, Olcum, Islem, IslemSatir,
  Hizmet, Protokol, Uygulama, Kategori,
} from "./tipler";

// Deterministik rastgele — demo her açılışta aynı görünsün
function prng(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gun = 86400000;
export const iso = (d: Date) => d.toISOString().slice(0, 10);
const kaydir = (temel: Date, g: number) => new Date(temel.getTime() + g * gun);

type UrunTanim = [string, string, Kategori, string, number, number, number, number, boolean];

const URUN_TANIMLARI: UrunTanim[] = [
  // kod, ad, kategori, birim, kritik, alis, satis, kdv, miatTakipli
  ["ILC-001", "Rimadyl 50 mg tablet", "ilac", "tablet", 40, 38, 65, 10, true],
  ["ILC-002", "Metacam %1.5 oral süspansiyon 10 ml", "ilac", "şişe", 4, 420, 690, 10, true],
  ["ILC-003", "Convenia 80 mg enjeksiyonluk", "ilac", "flakon", 3, 980, 1550, 10, true],
  ["ILC-004", "Baytril %5 enjeksiyonluk 50 ml", "ilac", "şişe", 3, 520, 850, 10, true],
  ["ILC-005", "Onsior 6 mg tablet (kedi)", "ilac", "tablet", 30, 55, 95, 10, true],
  ["ILC-006", "Duphalyte 500 ml", "ilac", "şişe", 5, 310, 520, 10, true],
  ["ILC-007", "Vetmedin 2.5 mg kapsül", "ilac", "kapsül", 25, 48, 88, 10, true],
  ["ILC-008", "Amoksisilin LA 50 ml", "ilac", "şişe", 4, 295, 470, 10, true],
  ["ILC-009", "Prednisolon 5 mg tablet", "ilac", "tablet", 50, 9, 22, 10, true],
  ["ILC-010", "Ringer Laktat 500 ml", "ilac", "şişe", 12, 78, 165, 10, true],
  ["ASI-001", "Nobivac DHPPi (köpek karma)", "asi", "doz", 8, 340, 650, 10, true],
  ["ASI-002", "Nobivac Rabies (kuduz)", "asi", "doz", 10, 180, 400, 10, true],
  ["ASI-003", "Purevax RCP (kedi karma)", "asi", "doz", 8, 380, 700, 10, true],
  ["ASI-004", "Versifel CVR", "asi", "doz", 6, 355, 660, 10, true],
  ["ASI-005", "Nobivac Lepto", "asi", "doz", 6, 210, 430, 10, true],
  ["PRZ-001", "Advocate kedi 0.8 ml spot-on", "parazit", "pipet", 12, 145, 260, 10, true],
  ["PRZ-002", "Bravecto köpek 500 mg", "parazit", "tablet", 10, 390, 620, 10, true],
  ["PRZ-003", "Drontal Plus tablet", "parazit", "tablet", 30, 42, 85, 10, true],
  ["PRZ-004", "Frontline Combo köpek M", "parazit", "pipet", 12, 165, 290, 10, true],
  ["PRZ-005", "Milpro kedi tablet", "parazit", "tablet", 20, 58, 110, 10, true],
  ["MMA-001", "Royal Canin Renal kedi 2 kg", "mama", "paket", 4, 780, 1150, 10, true],
  ["MMA-002", "Hill's i/d köpek 5 kg", "mama", "paket", 3, 1450, 2100, 10, true],
  ["MMA-003", "Royal Canin Urinary S/O kedi 1.5 kg", "mama", "paket", 4, 690, 1020, 10, true],
  ["MMA-004", "Pro Plan Sterilised kedi 3 kg", "mama", "paket", 6, 520, 790, 10, true],
  ["MMA-005", "Royal Canin Gastro Puppy 2.5 kg", "mama", "paket", 4, 740, 1090, 10, true],
  ["MMA-006", "Hill's Metabolic köpek 4 kg", "mama", "paket", 3, 1190, 1720, 10, true],
  ["SRF-001", "Enjektör 2.5 ml", "sarf", "adet", 100, 3.5, 10, 20, false],
  ["SRF-002", "IV kateter 22G", "sarf", "adet", 30, 22, 60, 20, false],
  ["SRF-003", "Serum seti", "sarf", "adet", 25, 34, 85, 20, false],
  ["SRF-004", "Steril eldiven 7.5", "sarf", "çift", 40, 18, 45, 20, false],
  ["SRF-005", "Gazlı bez 10x10 (100'lü)", "sarf", "paket", 10, 62, 130, 20, false],
  ["SRF-006", "Elizabeth yakalığı M", "sarf", "adet", 8, 85, 180, 20, false],
];

export const HIZMETLER: Hizmet[] = [
  { id: "h1", kod: "MUY", ad: "Klinik muayene", fiyat: 950, sureDk: 20, kdv: 20 },
  { id: "h2", kod: "MUY-K", ad: "Kontrol muayenesi", fiyat: 450, sureDk: 15, kdv: 20 },
  { id: "h3", kod: "ASI-U", ad: "Aşı uygulama", fiyat: 250, sureDk: 15, kdv: 20 },
  { id: "h4", kod: "KUA-K", ad: "Kuaför / tıraş (kedi)", fiyat: 900, sureDk: 60, kdv: 20 },
  { id: "h5", kod: "KUA-D", ad: "Kuaför / tıraş (köpek)", fiyat: 1300, sureDk: 75, kdv: 20 },
  { id: "h6", kod: "LAB-H", ad: "Hemogram", fiyat: 780, sureDk: 15, kdv: 20 },
  { id: "h7", kod: "LAB-B", ad: "Biyokimya paneli", fiyat: 1250, sureDk: 20, kdv: 20 },
  { id: "h8", kod: "USG", ad: "Ultrason", fiyat: 1400, sureDk: 30, kdv: 20 },
  { id: "h9", kod: "OTL", ad: "Pansiyon (gece)", fiyat: 650, sureDk: 0, kdv: 20 },
  { id: "h10", kod: "OPR-K", ad: "Kısırlaştırma operasyonu", fiyat: 6500, sureDk: 90, kdv: 20 },
];

export const PROTOKOLLER: Protokol[] = [
  { id: "p1", ad: "Karma aşı", tur: null, tekrarAy: 12 },
  { id: "p2", ad: "Kuduz aşısı", tur: null, tekrarAy: 12 },
  { id: "p3", ad: "İç parazit", tur: null, tekrarAy: 3 },
  { id: "p4", ad: "Dış parazit", tur: null, tekrarAy: 1 },
];


const AD_HAVUZ = ["Ahmet","Ayla","Barış","Ceren","Deniz","Ebru","Furkan","Gizem","Hakan","Irmak",
  "İlker","Jale","Kerem","Lale","Murat","Nihan","Okan","Pelin","Rüya","Serkan","Tuğba","Ufuk",
  "Volkan","Yasemin","Zafer","Aslı","Berk","Cem","Dilek","Erkan","Fatma","Gökhan","Hande","İpek",
  "Kaan","Leyla","Melis","Nuri","Orhan","Pınar","Rana","Sinem","Tolga","Umut","Yiğit","Zehra"];
const SOYAD_HAVUZ = ["Yılmaz","Kaya","Demir","Şahin","Çelik","Yıldız","Yıldırım","Öztürk","Aydın",
  "Özdemir","Arslan","Doğan","Kılıç","Aslan","Çetin","Kara","Koç","Kurt","Özkan","Şimşek","Polat",
  "Erdoğan","Korkmaz","Taş","Aksoy","Bulut","Güneş","Yalçın","Bozkurt","Acar"];
const KEDI_AD = ["Mia","Tarçın","Şeker","Pofuduk","Minnoş","Tekir","Zeus","Luna","Mavi","Badem",
  "Kömür","Süt","Çıtır","Nar","Pati","Limon","Simit","Bulut","Duman","Kaju","Tombik","Yumak"];
const KOPEK_AD = ["Rex","Çakıl","Bruno","Lokum","Zeytin","Kont","Paşa","Tarçın","Max","Roki",
  "Bal","Yumoş","Cesur","Şila","Tofi","Kuki","Alfa","Bonzo","Çomar","Nemo","Pamuk","Toffee"];
const KEDI_IRK = ["Tekir","British Shorthair","Sarman","Scottish Fold","İran Kedisi","Van Kedisi","Ankara Kedisi","Siyam"];
const KOPEK_IRK = ["Golden Retriever","Pomeranian","Beagle","Jack Russell","Alman Çoban","Labrador","Maltese","Cocker Spaniel","Terrier","Chihuahua"];
const ILCELER = ["Kadıköy","Ataşehir","Üsküdar","Maltepe","Kartal","Ümraniye","Beşiktaş","Bostancı"];

const PERSONEL = ["Dr. Elif Arslan", "Dr. Kaan Toprak", "Sekreter Nur", "Tekn. Baran"];

const SAHIP_TANIM: [string, string, string][] = [
  ["Ayşe Demir", "905321114488", "Kadıköy"],
  ["Mehmet Yıldız", "905337772211", "Ataşehir"],
  ["Zeynep Kaya", "905445558899", "Kadıköy"],
  ["Can Öztürk", "905309996633", "Üsküdar"],
  ["Elif Şahin", "905356661177", "Maltepe"],
  ["Burak Aydın", "905422223344", "Kadıköy"],
  ["Merve Çelik", "905388887755", "Ataşehir"],
  ["Deniz Koç", "905317778822", "Kartal"],
  ["Selin Acar", "905364449900", "Kadıköy"],
  ["Emre Polat", "905331112299", "Maltepe"],
];

const HASTA_TANIM: [number, string, Hasta["tur"], string, "erkek" | "disi", number, boolean, string][] = [
  // sahipIndex, ad, tur, irk, cinsiyet, yasAy, kisir, kronikNot
  [0, "Pamuk", "kedi", "British Shorthair", "disi", 52, true, ""],
  [0, "Zeytin", "kedi", "Tekir", "erkek", 26, true, ""],
  [1, "Leo", "kopek", "Golden Retriever", "erkek", 74, false, "Kalça displazisi takibi"],
  [2, "Boncuk", "kedi", "Van Kedisi", "disi", 110, true, "Kronik böbrek yetmezliği (Evre 2)"],
  [3, "Duman", "kopek", "Sibirya Kurdu", "erkek", 38, false, ""],
  [4, "Karamel", "kopek", "Pomeranian", "disi", 62, true, "Obezite — diyet programında"],
  [5, "Şila", "kedi", "Scottish Fold", "disi", 14, false, ""],
  [6, "Maya", "kopek", "Beagle", "disi", 86, true, ""],
  [6, "Fındık", "kedi", "Tekir", "erkek", 34, true, ""],
  [6, "Mırnav", "kedi", "Sarman", "erkek", 60, true, ""],
  [7, "Zıpkın", "kopek", "Jack Russell", "erkek", 44, false, ""],
  [8, "Lokum", "kedi", "Ankara Kedisi", "disi", 20, true, ""],
  [9, "Paşa", "kopek", "Alman Çoban", "erkek", 96, true, "Yaşa bağlı eklem desteği"],
];

export type Veri = {
  urunler: Urun[];
  lotlar: Lot[];
  hareketler: StokHareket[];
  sahipler: Sahip[];
  hastalar: Hasta[];
  olcumler: Olcum[];
  islemler: Islem[];
  uygulamalar: Uygulama[];
};

export function veriUret(bugun = new Date()): Veri {
  const r = prng(20260918);
  const b = new Date(iso(bugun) + "T09:00:00.000Z");

  // --- Ürünler ---
  const urunler: Urun[] = URUN_TANIMLARI.map(([kod, ad, kategori, birim, kritik, alis, satis, kdv, miatT], i) => ({
    id: `u${i + 1}`, kod, ad, kategori, birim,
    kritikSeviye: kritik, alisFiyat: alis, satisFiyat: satis, kdv, miatTakipli: miatT,
  }));
  const urunIdx = new Map(urunler.map((u) => [u.kod, u]));

  // --- Lotlar: bazıları bilerek miadı yakın / geçmiş ---
  const lotlar: Lot[] = [];
  const hareketler: StokHareket[] = [];
  let lotSayac = 0, harSayac = 0;

  const miatPlani: Record<string, number[]> = {
    // kod: lot miat gün farkları (bugüne göre)
    "ILC-002": [-12, 240],   // biri geçmiş
    "ILC-003": [21],         // 21 gün kaldı
    "ASI-001": [34, 400],
    "ASI-003": [9],          // 9 gün kaldı — kritik
    "PRZ-001": [48, 520],
    "PRZ-003": [-5],         // geçmiş
    "MMA-001": [58, 430],
    "MMA-003": [26],
    "ILC-009": [410],
    "ILC-010": [190],
  };

  for (const u of urunler) {
    const plan = miatPlani[u.kod] ?? (u.miatTakipli ? [180 + Math.floor(r() * 400)] : [null as unknown as number]);
    for (const fark of plan) {
      lotSayac++;
      const lot: Lot = {
        id: `l${lotSayac}`,
        urunId: u.id,
        lotNo: u.miatTakipli ? `L${2026}${String(lotSayac).padStart(4, "0")}` : "-",
        miat: u.miatTakipli && fark != null ? iso(kaydir(b, fark)) : null,
        girisTarihi: iso(kaydir(b, -60 - Math.floor(r() * 90))),
      };
      lotlar.push(lot);
    }
  }

  // --- Sahipler & hastalar ---
  const sahipler: Sahip[] = SAHIP_TANIM.map(([ad, tel, ilce], i) => ({
    id: `s${i + 1}`, ad, telefon: tel, ilce,
    kayitTarihi: iso(kaydir(b, -(200 + Math.floor(r() * 900)))),
  }));

  const hastalar: Hasta[] = HASTA_TANIM.map(([si, ad, tur, irk, cins, yasAy, kisir, kronik], i) => ({
    id: `p${i + 1}`, sahipId: sahipler[si].id, ad, tur, irk, cinsiyet: cins,
    dogumTarihi: iso(kaydir(b, -yasAy * 30)),
    mikrocip: r() > 0.25 ? `792${Math.floor(100000000000 + r() * 8e11)}`.slice(0, 15) : undefined,
    kisir, kronikNot: kronik || undefined,
  }));

  // Gerçekçi hacim: hasta başına ziyaret sayısı makul kalsın diye havuz genişletilir
  const sec = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  for (let i = 0; i < 118; i++) {
    const sid = `s${sahipler.length + 1}`;
    sahipler.push({
      id: sid,
      ad: `${sec(AD_HAVUZ)} ${sec(SOYAD_HAVUZ)}`,
      telefon: `9053${Math.floor(10000000 + r() * 89999999)}`,
      ilce: sec(ILCELER),
      kayitTarihi: iso(kaydir(b, -(60 + Math.floor(r() * 1100)))),
    });
    const kacHayvan = r() > 0.82 ? 2 : 1;
    for (let k = 0; k < kacHayvan; k++) {
      const tur: Hasta["tur"] = r() > 0.46 ? "kedi" : "kopek";
      const yasAy = 6 + Math.floor(r() * 130);
      hastalar.push({
        id: `p${hastalar.length + 1}`, sahipId: sid,
        ad: sec(tur === "kedi" ? KEDI_AD : KOPEK_AD),
        tur, irk: sec(tur === "kedi" ? KEDI_IRK : KOPEK_IRK),
        cinsiyet: r() > 0.5 ? "erkek" : "disi",
        dogumTarihi: iso(kaydir(b, -yasAy * 30)),
        mikrocip: r() > 0.3 ? `792${Math.floor(100000000000 + r() * 8e11)}`.slice(0, 15) : undefined,
        kisir: r() > 0.42,
      });
    }
  }

  // --- Kilo ölçümleri (Karamel'de diyet eğrisi) ---
  const olcumler: Olcum[] = [];
  let olcSayac = 0;
  for (const h of hastalar) {
    const temel = h.tur === "kedi" ? 4.2 : h.ad === "Karamel" ? 5.4 : h.ad === "Paşa" ? 34 : h.ad === "Leo" ? 31 : 14;
    const n = h.ad === "Karamel" ? 9 : 4 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      olcSayac++;
      const gunOnce = (n - 1 - i) * (h.ad === "Karamel" ? 45 : 80);
      let kilo: number;
      if (h.ad === "Karamel") {
        // önce artış, 5. ölçümden sonra diyetle düşüş
        kilo = i <= 4 ? temel + i * 0.42 : temel + 4 * 0.42 - (i - 4) * 0.38;
      } else {
        kilo = temel * (0.97 + r() * 0.06);
      }
      olcumler.push({
        id: `o${olcSayac}`, hastaId: h.id,
        tarih: iso(kaydir(b, -gunOnce)),
        kiloKg: Math.round(kilo * 10) / 10,
        vks: h.ad === "Karamel" ? (i <= 4 ? 7 + Math.min(1, Math.floor(i / 3)) : 6) : 5,
      });
    }
  }

  // --- İşlemler (son 45 gün) + stok çıkışları ---
  const islemler: Islem[] = [];
  let isSayac = 0, satSayac = 0;

  const tipDagilim: Islem["tip"][] = [
    "muayene", "muayene", "muayene", "asi", "asi", "kuafor", "perakende", "perakende", "operasyon", "otel",
  ];

  // Son 45 gun yogun, oncesi seyrek: LTV ve kayip musteri raporu anlamli olsun
  for (let g = 270; g >= 0; g--) {
    const tarih = kaydir(b, -g);
    const haftaSonu = tarih.getUTCDay() === 0;
    const yakin = g <= 45;
    const adet = haftaSonu
      ? (yakin ? 3 + Math.floor(r() * 3) : 1 + Math.floor(r() * 2))
      : (yakin ? 7 + Math.floor(r() * 7) : 2 + Math.floor(r() * 3));
    for (let k = 0; k < adet; k++) {
      isSayac++;
      const tip = tipDagilim[Math.floor(r() * tipDagilim.length)];
      const hasta = hastalar[Math.floor(r() * hastalar.length)];
      const personel = PERSONEL[Math.floor(r() * 2)];
      const saat = 9 + Math.floor(r() * 10);
      const dk = Math.floor(r() * 12) * 5;
      const isoTarih = `${iso(tarih)}T${String(saat).padStart(2, "0")}:${String(dk).padStart(2, "0")}:00.000Z`;
      const satirlar: IslemSatir[] = [];

      const ekleHizmet = (h: Hizmet) => {
        satSayac++;
        satirlar.push({
          id: `is${satSayac}`, hizmetId: h.id, aciklama: h.ad,
          miktar: 1, birimFiyat: h.fiyat, kdv: h.kdv, ucretlendirildi: true,
        });
      };

      const ekleUrun = (kod: string, miktar: number, zorlaKacak?: boolean) => {
        const u = urunIdx.get(kod);
        if (!u) return;
        const lot = lotlar.find((l) => l.urunId === u.id) ?? null;
        // Sarf ve enjeksiyonluk ilaçlarda kaçak oranı yüksek — gerçek hayattaki tablo
        const kacakOrani = u.kategori === "sarf" ? 0.55 : u.kategori === "ilac" ? 0.14 : 0.03;
        const ucretlendirildi = zorlaKacak ? false : r() > kacakOrani;
        satSayac++;
        satirlar.push({
          id: `is${satSayac}`, urunId: u.id, aciklama: u.ad,
          miktar, birimFiyat: u.satisFiyat, kdv: u.kdv, ucretlendirildi,
        });
        harSayac++;
        hareketler.push({
          id: `h${harSayac}`, urunId: u.id, lotId: lot?.id ?? null, tip: "cikis",
          kaynak: tip === "perakende" ? "perakende" : "muayene",
          miktar: -miktar, birimFiyat: u.satisFiyat,
          islemId: `i${isSayac}`, hastaId: hasta.id, kullanici: personel, tarih: isoTarih,
        });
      };

      if (tip === "muayene") {
        ekleHizmet(HIZMETLER[r() > 0.6 ? 1 : 0]);
        if (r() > 0.5) ekleUrun("SRF-001", 1 + Math.floor(r() * 2));
        if (r() > 0.6) ekleUrun(r() > 0.5 ? "ILC-004" : "ILC-008", 1);
        if (r() > 0.75) ekleHizmet(HIZMETLER[5]);
        if (r() > 0.85) ekleHizmet(HIZMETLER[6]);
        if (r() > 0.8) ekleUrun("ILC-010", 1);
      } else if (tip === "asi") {
        ekleHizmet(HIZMETLER[2]);
        const asi = hasta.tur === "kedi" ? (r() > 0.5 ? "ASI-003" : "ASI-004") : (r() > 0.45 ? "ASI-001" : "ASI-002");
        ekleUrun(asi, 1);
        if (r() > 0.55) ekleUrun(hasta.tur === "kedi" ? "PRZ-001" : "PRZ-002", 1);
        if (r() > 0.7) ekleUrun("SRF-001", 1);
      } else if (tip === "kuafor") {
        ekleHizmet(HIZMETLER[hasta.tur === "kedi" ? 3 : 4]);
        if (r() > 0.8) ekleUrun("PRZ-004", 1);
      } else if (tip === "perakende") {
        const mamalar = ["MMA-001", "MMA-002", "MMA-003", "MMA-004", "MMA-005", "MMA-006"];
        ekleUrun(mamalar[Math.floor(r() * mamalar.length)], 1);
        if (r() > 0.7) ekleUrun("PRZ-003", 2);
      } else if (tip === "operasyon") {
        ekleHizmet(HIZMETLER[9]);
        ekleUrun("SRF-004", 2);
        ekleUrun("SRF-002", 1);
        ekleUrun("SRF-003", 1);
        ekleUrun("ILC-003", 1, r() > 0.55);
        ekleUrun("ILC-002", 1);
        ekleUrun("SRF-006", 1);
      } else {
        const gece = 1 + Math.floor(r() * 3);
        satSayac++;
        satirlar.push({
          id: `is${satSayac}`, hizmetId: "h9", aciklama: `Pansiyon (${gece} gece)`,
          miktar: gece, birimFiyat: HIZMETLER[8].fiyat, kdv: 20, ucretlendirildi: true,
        });
      }

      islemler.push({
        id: `i${isSayac}`,
        sahipId: hasta.sahipId,
        hastaId: tip === "perakende" ? hasta.id : hasta.id,
        tip, durum: g === 0 && r() > 0.7 ? "acik" : "tamamlandi",
        personel, tarih: isoTarih, satirlar,
      });
    }
  }

  // --- Aşı / parazit takvimi ---
  const uygulamalar: Uygulama[] = [];
  let uygSayac = 0;
  for (const h of hastalar) {
    for (const p of PROTOKOLLER) {
      uygSayac++;
      const fark = Math.floor(r() * 150) - 60; // -60 .. +90 gün
      uygulamalar.push({
        id: `y${uygSayac}`, hastaId: h.id, protokolId: p.id,
        uygulamaTarihi: iso(kaydir(b, fark - p.tekrarAy * 30)),
        sonrakiTarih: iso(kaydir(b, fark)),
        durum: fark < -14 ? "kacirildi" : "planlandi",
      });
    }
  }

  // --- Açılış stoğu: tüketimden SONRA hesaplanır, böylece stok asla eksiye düşmez ---
  // Bilerek kritik seviyenin altında bırakılan ürünler (demoda sipariş listesini doldurur)
  const KRITIK_KODLAR = new Set([
    "PRZ-003", "ASI-003", "MMA-004", "MMA-006", "MMA-002", "MMA-003", "ILC-003",
  ]);

  const tuketim = new Map<string, number>();
  for (const h of hareketler) {
    if (h.miktar >= 0 || !h.lotId) continue;
    tuketim.set(h.lotId, (tuketim.get(h.lotId) ?? 0) + Math.abs(h.miktar));
  }

  const ilkLotIdx = new Map<string, string>();
  for (const l of lotlar) if (!ilkLotIdx.has(l.urunId)) ilkLotIdx.set(l.urunId, l.id);

  const acilis: StokHareket[] = [];
  for (const lot of lotlar) {
    const u = urunler.find((x) => x.id === lot.urunId)!;
    const ilk = ilkLotIdx.get(u.id) === lot.id;
    const tuketilen = tuketim.get(lot.id) ?? 0;
    const hedefKalan = ilk
      ? KRITIK_KODLAR.has(u.kod)
        ? Math.max(1, Math.floor(u.kritikSeviye * (0.15 + r() * 0.55)))
        : Math.ceil(u.kritikSeviye * (1.7 + r() * 1.9))
      : Math.ceil(u.kritikSeviye * (0.7 + r() * 1.1));
    harSayac++;
    acilis.push({
      id: `h${harSayac}`, urunId: u.id, lotId: lot.id, tip: "giris", kaynak: "mal_kabul",
      miktar: tuketilen + hedefKalan,
      birimFiyat: u.alisFiyat, islemId: null, hastaId: null,
      kullanici: "Sekreter Nur", aciklama: "Açılış stoğu",
      tarih: lot.girisTarihi + "T10:00:00.000Z",
    });
  }

  return {
    urunler, lotlar,
    hareketler: [...acilis, ...hareketler],
    sahipler, hastalar, olcumler, islemler, uygulamalar,
  };
}
