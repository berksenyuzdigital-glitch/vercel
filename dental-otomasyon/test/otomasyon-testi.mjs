#!/usr/bin/env node
/**
 * Otomasyonun tüm akışını n8n, Meta ve Google Sheets OLMADAN test eder.
 * Workflow dosyalarındaki gerçek kodu okur ve sahte bir randevu defteri üzerinde çalıştırır.
 *
 * Çalıştırma:  node test/otomasyon-testi.mjs
 * Gereken:     sadece Node.js. Kurulum, hesap, internet gerekmez. Mesaj gönderilmez.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const KOK = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WF = path.join(KOK, 'workflows');

/* ---------- n8n taklidi: tarih/saat, node çalıştırıcı ---------- */

function DT(ms) {
  const d = new Date(ms);
  return {
    _d: d,
    weekday: d.getUTCDay() === 0 ? 7 : d.getUTCDay(),
    setZone() { return this; },
    startOf() { const x = new Date(this._d); x.setUTCHours(0, 0, 0, 0); return DT(x.getTime()); },
    plus(o) { return DT(this._d.getTime() + (o.days || 0) * 864e5 + (o.minutes || 0) * 6e4); },
    minus(o) { return DT(this._d.getTime() - (o.days || 0) * 864e5); },
    set(o) { const x = new Date(this._d); if (o.hour != null) x.setUTCHours(o.hour, o.minute || 0, 0, 0); return DT(x.getTime()); },
    diff(o) { return { minutes: (this._d - o._d) / 6e4 }; },
    toMillis() { return this._d.getTime(); },
    toFormat(f) {
      const p = (n) => String(n).padStart(2, '0');
      const Y = this._d.getUTCFullYear(), M = p(this._d.getUTCMonth() + 1), D = p(this._d.getUTCDate());
      const h = p(this._d.getUTCHours()), m = p(this._d.getUTCMinutes());
      return f.replace('yyyy-MM-dd HH:mm', `${Y}-${M}-${D} ${h}:${m}`)
              .replace('yyyy-MM-dd', `${Y}-${M}-${D}`)
              .replace('dd.MM.yyyy', `${D}.${M}.${Y}`);
    },
  };
}
const AN = (s) => DT(Date.parse(s + 'Z'));

const dosyalar = fs.readdirSync(WF).filter((f) => f.endsWith('.json'));
function kod(dosyaOnEki, nodeAdi) {
  const dosya = dosyalar.find((f) => f.startsWith(dosyaOnEki));
  const wf = JSON.parse(fs.readFileSync(path.join(WF, dosya), 'utf8'));
  const node = wf.nodes.find((n) => n.name === nodeAdi);
  if (!node) throw new Error(`${dosya} içinde "${nodeAdi}" node'u yok`);
  return node.parameters.jsCode;
}
function calistir(dosyaOnEki, nodeAdi, { girdi = [], nodelar = {}, simdi }) {
  const $input = { all: () => girdi.map((j) => ({ json: j })), first: () => ({ json: girdi[0] }) };
  const $ = (ad) => {
    if (!(ad in nodelar)) throw new Error(`Test eksik: "${ad}" node'unun çıktısı verilmedi`);
    return { first: () => ({ json: nodelar[ad] }), item: { json: nodelar[ad] } };
  };
  return new Function('$input', '$', '$now', kod(dosyaOnEki, nodeAdi))($input, $, simdi).map((i) => i.json);
}

/* ---------- Sahte Google Sheet ---------- */

const defter = [];
const ekle = (r) => defter.push({ ID: '', Ad: '', Telefon: '', Tarih: '', Saat: '', Durum: '', Kaynak: '', Hatirlatma24: '', Hatirlatma2: '', YorumIstek: '', TeklifTarih: '', TeklifSaat: '', Guncelleme: '', ...r });
const guncelle = (id, yama) => { const r = defter.find((x) => x.ID === id); Object.assign(r, yama); return r; };
const bul = (id) => defter.find((x) => x.ID === id);

/* ---------- Ayarlar (klinik.json'un test karşılığı) ---------- */

const AYAR = {
  SHEET_ID: 'test', SHEET_ADI: 'Randevular', RAPOR_SHEET_ADI: 'Rapor', HATA_SHEET_ADI: 'Hatalar',
  PHONE_NUMBER_ID: 'test', GRAPH_VERSION: 'v21.0',
  KLINIK_ADI: 'Test Dental', KLINIK_TELEFON: '0212 000 00 00', OPERATOR_TELEFON: '0533 999 88 77',
  KONUM_LINK: 'https://maps.app.goo.gl/test', GOOGLE_YORUM_LINK: 'https://g.page/r/test/review',
  SLOT_1: '11:00', SLOT_2: '15:00', TEKLIF_ADEDI: '10',
};

/* ---------- Test altyapısı ---------- */

let gecen = 0, kalan = 0;
const adim = (b) => console.log(`\n\x1b[1m${b}\x1b[0m`);
const bilgi = (m) => console.log('   ' + m);
function kontrol(kosul, mesaj) {
  if (kosul) { gecen++; console.log('   \x1b[32m✓\x1b[0m ' + mesaj); }
  else { kalan++; console.log('   \x1b[31m✗ ' + mesaj + '\x1b[0m'); }
}
function mesajYaz(wa) {
  if (!wa) return bilgi('(mesaj yok)');
  if (wa.type === 'template') {
    const p = wa.template.components[0].parameters.map((x) => x.text);
    bilgi(`WhatsApp -> ${wa.to}  [şablon: ${wa.template.name}]`);
    p.forEach((v, i) => bilgi(`      {{${i + 1}}} = ${v}`));
  } else {
    bilgi(`WhatsApp -> ${wa.to}  [düz mesaj]`);
    bilgi(`      "${wa.text.body}"`);
  }
}
// Hastanın yazdığı mesajı Meta'nın gerçek webhook formatında üretir.
const metaMesaji = (tel, metin) => ({ body: { entry: [{ changes: [{ value: { messages: [{ from: tel, type: 'text', text: { body: metin } }] } }] }] } });

function hastaYazdi(tel, metin, simdi) {
  const ayristirilan = calistir('05', 'Gelen Mesajı Ayrıştır', { girdi: [metaMesaji(tel, metin)], simdi })[0];
  const karar = calistir('05', 'Karar', {
    girdi: defter, simdi,
    nodelar: { 'Ayarlar (Gelen)': AYAR, 'Gelen Mesajı Ayrıştır': ayristirilan },
  })[0];
  if (karar.ID) guncelle(karar.ID, { Durum: karar.Durum, Tarih: karar.Tarih, Saat: karar.Saat, Guncelleme: karar.Guncelleme });
  return karar;
}

console.log('\n\x1b[1m=== DENTAL OTOMASYON — UÇTAN UCA SENARYO TESTİ ===\x1b[0m');
console.log('Gerçek mesaj gönderilmez, gerçek Sheet yazılmaz. Sadece mantık test edilir.');

/* ================= SENARYO ================= */

adim('1) Salı 09:00 — Instagram\'dan yeni randevu talebi geliyor');
let t = AN('2026-03-10T09:00:00');
const lead = calistir('01', 'Lead Normalize', {
  girdi: [{ body: { ad: 'Mehmet Yılmaz', telefon: '0532 111 22 33', kaynak: 'instagram' } }],
  nodelar: { Ayarlar: AYAR }, simdi: t,
})[0];
ekle(lead);
bilgi(`Deftere yazıldı: ${lead.Ad} | ${lead.Telefon} | ${lead.Tarih} ${lead.Saat} | ${lead.Durum}`);
mesajYaz(lead.wa);
kontrol(lead.Telefon === '905321112233', 'Telefon 0532... -> 905321112233 formatına çevrildi');
kontrol(lead.Durum === 'yeni', 'Durum "yeni" olarak kaydedildi');
kontrol(lead.Tarih === '2026-03-11', 'Randevu yarına teklif edildi');
kontrol(lead.wa.template.name === 'dental_hosgeldin_randevu_teklif', 'Karşılama şablonu seçildi');

adim('2) Hasta "1" yazıyor');
let k = hastaYazdi('905321112233', '1', AN('2026-03-10T09:02:00'));
mesajYaz(k.wa);
kontrol(bul(lead.ID).Durum === 'onaylı', 'Durum "onaylı" oldu');

adim('3) Aynı gün 09:00 cron — 24 saat önce hatırlatma');
const hatirlatma = calistir('02', 'Yarınki Randevuları Seç', { girdi: defter, nodelar: { Ayarlar: AYAR }, simdi: t });
kontrol(hatirlatma.length === 1, `Yarın randevusu olan ${hatirlatma.length} kişi bulundu (beklenen 1)`);
mesajYaz(hatirlatma[0].wa);
guncelle(hatirlatma[0].ID, { Hatirlatma24: '2026-03-10 09:00' });
const tekrar = calistir('02', 'Yarınki Randevuları Seç', { girdi: defter, nodelar: { Ayarlar: AYAR }, simdi: t });
kontrol(tekrar.length === 0, 'Cron ikinci kez çalışsa aynı hastaya TEKRAR mesaj gitmiyor');

adim('4) Bekleme listesinde 2 kişi var');
for (const b of [{ ad: 'Ayşe Demir', telefon: '0533 222 33 44' }, { ad: 'Can Öz', telefon: '0534 333 44 55' }]) {
  const kayit = calistir('06', 'Kaydı Hazırla', { girdi: defter, nodelar: { 'Bekleme Webhook': { body: b } }, simdi: t })[0];
  if (kayit.gecerli && !kayit.mukerrer) { ekle(kayit); bilgi(`Bekleme listesine eklendi: ${kayit.Ad} (${kayit.Telefon})`); }
}
const mukerrer = calistir('06', 'Kaydı Hazırla', { girdi: defter, nodelar: { 'Bekleme Webhook': { body: { ad: 'Ayşe Demir', telefon: '0533 222 33 44' } } }, simdi: t })[0];
kontrol(mukerrer.mukerrer === true, 'Aynı numara ikinci kez eklenmeye çalışılınca engellendi');

adim('5) Hasta ertesi sabah "2" yazıyor (iptal)');
t = AN('2026-03-11T08:00:00');
k = hastaYazdi('905321112233', '2', t);
mesajYaz(k.wa);
kontrol(bul(lead.ID).Durum === 'iptal', 'Durum "iptal" oldu');
kontrol(k.tetikle_iptal === true, 'Boş koltuk doldurma akışı tetiklendi');
bilgi(`Boşalan koltuk: ${k.iptal_tarih} ${k.iptal_saat}`);

adim('6) Boşalan koltuk bekleme listesine teklif ediliyor');
const teklifler = calistir('03', 'Bekleme Listesini Seç', {
  girdi: defter, simdi: t,
  nodelar: { 'Ayarlar (İptal)': { ...AYAR, bos_tarih: k.iptal_tarih, bos_saat: k.iptal_saat } },
});
kontrol(teklifler.length === 2, `Bekleme listesindeki ${teklifler.length} kişiye teklif gitti (beklenen 2)`);
mesajYaz(teklifler[0].wa);
teklifler.forEach((x) => guncelle(x.ID, { Durum: 'teklif_edildi', TeklifTarih: x.TeklifTarih, TeklifSaat: x.TeklifSaat }));

adim('7) "İlk yazan alır" — iki kişi de "1" yazıyor');
const birinci = hastaYazdi('905332223344', '1', AN('2026-03-11T08:03:00'));
bilgi('Ayşe Demir (ilk yazan):');
mesajYaz(birinci.wa);
kontrol(birinci.islem === 'slot_verildi' && bul(birinci.ID).Durum === 'onaylı', 'Koltuk ilk yazana verildi');
kontrol(bul(birinci.ID).Tarih === '2026-03-11' && bul(birinci.ID).Saat === '11:00', 'Randevu tarih/saati kaydına işlendi');

const ikinci = hastaYazdi('905343334455', '1', AN('2026-03-11T08:05:00'));
bilgi('Can Öz (geç kalan):');
mesajYaz(ikinci.wa);
kontrol(ikinci.islem === 'slot_dolu', 'İkinci kişiye "doldu" cevabı verildi');
kontrol(bul(ikinci.ID).Durum === 'bekleme', 'İkinci kişi bekleme listesinde kaldı, kaybedilmedi');

adim('8) Randevuya 2 saat kala konum mesajı');
t = AN('2026-03-11T09:00:00');
const konum = calistir('03', '2 Saat Kalanları Seç', { girdi: defter, nodelar: { Ayarlar: AYAR }, simdi: t });
kontrol(konum.length === 1, `2 saat kalan ${konum.length} randevu bulundu (beklenen 1)`);
mesajYaz(konum[0].wa);
guncelle(konum[0].ID, { Hatirlatma2: '2026-03-11 09:00' });

adim('9) Hasta geldi, sekreter "geldi" yazıyor — ertesi gün yorum isteniyor');
guncelle(birinci.ID, { Durum: 'geldi' });
const yorum = calistir('04', 'Dün Gelenleri Seç', { girdi: defter, nodelar: { Ayarlar: AYAR }, simdi: AN('2026-03-12T12:00:00') });
kontrol(yorum.length === 1, 'Dün gelen hastaya yorum isteği hazırlandı');
mesajYaz(yorum[0].wa);

adim('10) Akşam 19:00 — kliniğe günlük özet');
const ozet = calistir('08', 'Günü Hesapla', { girdi: defter, nodelar: { Ayarlar: AYAR }, simdi: AN('2026-03-11T19:00:00') })[0];
bilgi(`Bugün: ${ozet.BugunGeldi} geldi, ${ozet.BugunGelmedi} gelmedi, ${ozet.BugunIptal} iptal`);
bilgi(`Otomasyonun doldurduğu koltuk: ${ozet.DoldurulanKoltuk} | Bekleme listesi: ${ozet.BeklemeListesi}`);
mesajYaz(ozet.wa);
kontrol(ozet.BugunIptal === 1, 'İptal doğru sayıldı');
kontrol(ozet.DoldurulanKoltuk === 1, 'Doldurulan koltuk doğru sayıldı — ürünün sattığı metrik bu');

adim('11) Anlaşılmayan mesaj insana devrediliyor');
const devir = hastaYazdi('905321112233', 'dişim ağrıyor fiyat nedir', t);
mesajYaz(devir.wa);
kontrol(devir.islem === 'devir' && !devir.ID, 'Serbest metin hiçbir kaydı bozmadan sekretere yönlendirildi');

/* ================= SONUÇ ================= */

adim('DEFTERİN SON HALİ');
console.table(defter.map((r) => ({ ID: r.ID.slice(0, 12), Ad: r.Ad, Telefon: r.Telefon, Tarih: r.Tarih, Saat: r.Saat, Durum: r.Durum })));

console.log(`\n\x1b[1m${gecen} kontrol geçti, ${kalan} kontrol kaldı.\x1b[0m`);
if (kalan) { console.log('\x1b[31mBir şey bozulmuş. Yukarıdaki ✗ satırına bak.\x1b[0m\n'); process.exit(1); }
console.log('\x1b[32mAkışın tamamı beklendiği gibi çalışıyor.\x1b[0m\n');
