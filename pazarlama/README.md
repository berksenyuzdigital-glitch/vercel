# Klinik Lead Tarama

OpenStreetMap'ten diş kliniklerini çekip sitelerini tarayan, e-posta ve telefon
ayıklayıp Google Sheets'e yazan n8n workflow'u. `dental-otomasyon` paketini
kime satacağını bulmak için.

`workflows/` altındaki müşteri otomasyonlarından ayrı — bu **senin** aracın,
kliniğe teslim edilmiyor.

---

## Akış

```
Manual Trigger
  └► HTTP Request      Overpass API, İstanbul ili, amenity/healthcare = dentist
      └► Split Out     elements → tek tek klinik
          └► Edit Fields1   tags'ten ad / site / telefon / koordinat normalize
              ├► If  (email var mı)  ──true──────────────────┐
              └► If1 (website var mı) ──true─► HTTP Request1 ─┤  site HTML'i
                                      └false─────────────────┤
                                                              ▼
                                                    Code in JavaScript
                                                      · HTML'den e-posta + telefon
                                                      · çöp/rehber adresleri eler
                                                      · kliniğin kendi alan adını tercih eder
                                                      · HTML'i çöpe atar (bellek)
                                                              │
                                                              ▼
                                              Google Sheets (Append or Update)
```

Üç dal da tek bir Code node'unda birleşiyor. `Append or Update` **`OSM_ID`**
kolonundan eşleştiği için workflow kaç kez çalışırsa çalışsın mükerrer satır olmaz.

---

## Kurulum

### 1. Google Sheet

`Potansiyel Müşteriler` adında bir Sheet aç, ilk satıra bu 8 başlığı koy:

```
OSM_ID | Klinik | Sehir | Telefon | Website | Email | Durum | Tarih
```

Kolonları **düz metin** formatına al (telefon başındaki sıfır kaybolmasın).

> İlk satıra başlık dışında hiçbir şey yazma. Oraya bir formül koyarsan
> n8n onu yeni bir sütun sanar ve node `Column names were updated` hatası verir.

### 2. Workflow

1. `09-klinik-lead-tarama.json` dosyasını n8n'e import et
2. Google Sheets node'unda `BURAYA_SHEET_ID` yerine kendi Sheet ID'ni yaz
   (Sheet URL'inde `/d/` ile `/edit` arasındaki kod)
3. Google Sheets OAuth2 credential'ını seç
4. `Execute workflow`

### 3. Başka bir şehir

`HTTP Request` node'u → `Body Fields` → `data`:

```
[out:json][timeout:300];area["name"="İstanbul"]["boundary"="administrative"]["admin_level"="4"]->.il;(nwr["amenity"="dentist"](area.il);nwr["healthcare"="dentist"](area.il););out center;
```

`"İstanbul"` yerine il adını yaz. `admin_level=4` Türkiye'de **il** demek;
ilçe için `6`, mahalle için `8`.

---

## Durum değerleri

| Değer | Ne demek | Ne yapacaksın |
|---|---|---|
| `eposta_var` | Sitesinden e-posta çıktı | Yazabilirsin |
| `eposta_yok` | Site var ama e-posta yok, ya da site hiç yok | Telefon varsa ararsın |
| `rehber_sitesi` | Website alanı zoon/nicelocal gibi bir rehber | Gerçek site değil, e-posta yazılmaz |

---

## Bilinen sınırlar

- **OSM kapsamı dar.** İstanbul ili genelinde 405 klinik çıkıyor; gerçek sayı
  bunun çok üstünde. Haritaya işlenmemiş klinikleri bu akış göremez.
- **Sadece ana sayfa taranıyor.** Türkiye'deki klinik sitelerinde e-posta
  genelde `/iletisim` sayfasında durur. E-posta verimi bu yüzden ~%18'de kalıyor.
  Telefon verimi daha iyi (~%40), çünkü telefon ana sayfada da olur.
- **`Sehir` kolonu sabit `İstanbul` yazıyor.** İl geneline çıkıldığı için ilçe
  bilgisi gerekiyor; `tags['addr:district']` ile doldurulacak.
- `Edit Fields` node'undaki `search_query` alanı kullanılmıyor, ilk taslaktan kalma.
- Overpass ücretsiz ve kotalı. Sorguyu döngüye sokma, taramayı haftada birden
  sık çalıştırma.

---

## Liste hazır — sonra ne olacak

Ticari elektronik ileti tarafı: tacir ve esnafa **önceden onay** şart değil,
ama **İYS kaydı ve ret imkânı zorunlu**. Bu listeye toplu e-posta veya WhatsApp
atmadan önce İYS tarafını hallet.

Kazınan adres **kurumsal iletişim adresi** olsun; `dr.ahmet@...` gibi kişi adı
taşıyan adresler farklı bir kategori.

Ben hukukçu değilim; toplu gönderime geçmeden önce metinleri bir danışmana okut.
