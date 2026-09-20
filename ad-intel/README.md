# Viral Uygulama Avcısı — Meta/Instagram Reklam Ömrü Analizi

Bu araç, **reklamın ne kadar süre yayında kaldığına** bakarak hangi uygulamaların
gerçekten para kazandığını bulur.

## Neden reklam ömrü?

Reklam pahalıdır. Zarar eden bir kreatifi kimse aylarca yayında bırakmaz.

| Sinyal | Anlamı |
|---|---|
| 1-7 gün yayında kalıp kapanmış | Kreatif tutmadı, kapatıldı |
| 30+ gündür **hâlâ açık** | Reklam kendini amorti ediyor → kârlı |
| 90+ gündür **hâlâ açık** | Evergreen kazanan → ciddi para var |
| 10+ tane 30 gün üstü aktif reklam | Ölçekliyorlar, iş modeli oturmuş |
| Çok reklam ama hepsi 7 günde kapanıyor | Para yakıyorlar, kopyalamayın |

Araç her reklamverene bir **skor** ve bir **durum** etiketi verir:
`ÖLÇEKLİYOR` · `KAZANIYOR` · `TEST AŞAMASI` · `SOĞUYOR` · `ÖLÜ`

## Kurulum

```bash
pip install requests
export APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxx
```

## 1. Adım — Ucuz test (önce bunu yapın, ~$0.01)

```bash
python3 meta_ad_intel.py --probe
```

Tek bir 20 reklamlık çalışma yapar ve **ham JSON alan adlarını ekrana basar.**
Çıktıda `Tarih okunabilen kayit: 20/20` görüyorsanız her şey yolunda.
Göremiyorsanız, ham kayıttaki tarih alanının adını `meta_ad_intel.py` içindeki
`FIELD_MAP["start"]` / `["stop"]` listelerine ekleyin. (Her Apify aktörü farklı
alan adı kullanıyor, bu yüzden araç birden çok isim deniyor.)

## 2. Adım — Gerçek tarama (tavan $2)

```bash
python3 meta_ad_intel.py --budget 2.0 --country US
```

- Varsayılan aktör `apify/facebook-ads-scraper` (~$1.50/1K) → ~11 sorgu × 120 reklam ≈ **$1.98**
- Aynı parayla 20x daha fazla veri için: `--actor blackfalcondata` → 45 sorgu × 400 reklam ≈ **$0.90**
- `--budget` **sert tavandır**: her çalışma sonrası Apify'ın bildirdiği gerçek
  `usageTotalUsd` toplanır, tavana değince kalan sorgular atlanır.
- Türkiye pazarı için: `--country TR`
- Daha geniş tarama: `--per-query 600`

## 3. Adım — Yeniden puanlama (bedava)

Ham veri `out/raw.json` içinde saklanır. Skoru değiştirip tekrar analiz etmek
**hiç para harcamaz**:

```bash
python3 meta_ad_intel.py --analyze-only out/raw.json
```

## Çıktılar

| Dosya | İçerik |
|---|---|
| `out/reklamverenler.csv` | Skorlanmış reklamveren tablosu — asıl kullanacağınız dosya |
| `out/reklamlar.json` | Reklam bazında normalize veri (başlangıç, bitiş, gün, link) |
| `out/raw.json` | Ham Apify çıktısı (yeniden analiz için saklayın) |

CSV'deki önemli sütunlar:

- `kanitlanmis_30g+` — 30+ gündür **hâlâ açık** reklam sayısı ← **en önemli sütun**
- `evergreen_90g+` — 90+ gündür hâlâ açık reklam sayısı
- `en_uzun_aktif_gun` — en uzun ömürlü aktif reklamın gün sayısı
- `hayatta_kalma_%` — kreatif isabet oranı (yüksek = ne yaptığını biliyor)
- `hizli_kapatilan_7g-` — 7 günde kapatılanlar (yüksek = para yakıyor)
- `son_reklamdan_gecen_gun` — küçük = hâlâ aktif olarak ölçekliyor

## Nasıl yorumlanır

**Kopyalanacak model:** `ÖLÇEKLİYOR` durumunda, `evergreen_90g+` ≥ 3 ve
`hayatta_kalma_%` ≥ 50 olan reklamverenler. Bunların `ornek_metin` ve
`ornek_link` alanlarına bakın — hangi vaat, hangi fiyatlandırma, hangi hedef kitle.

**Girilecek niş:** Bir nişte **birden fazla** reklamveren `KAZANIYOR`/`ÖLÇEKLİYOR`
ise talep kanıtlanmıştır. Tek bir dev varsa rekabet zor; 3-5 orta ölçekli
oyuncu varsa pazar sizin için de yer bırakmış demektir.

**Kaçınılacak:** `hizli_kapatilan_7g-` yüksek ama `kanitlanmis_30g+` = 0 olan
nişler. Orada herkes deniyor, kimse tutturamıyor.

## Aktör seçenekleri ve bütçe

```bash
python3 meta_ad_intel.py --actor facebook-ads-scraper  # ~$1.50/1K — VARSAYILAN (apify/facebook-ads-scraper)
python3 meta_ad_intel.py --actor blackfalcondata       # ~$0.05/1K — 30x daha ucuz
python3 meta_ad_intel.py --actor memo23                # ~$0.75/1K — AB erişim verisi dahil
python3 meta_ad_intel.py --actor curious_coder         # ~$1.00/1K — geniş alan seti
python3 meta_ad_intel.py --actor apify                 # ~$1.70/1K — sayfa bazlı resmî aktör
```

**Fiyat, ne kadar veri göreceğinizi doğrudan belirliyor.** $2 bütçeyle:

| Aktör | Çekilebilen reklam | Gerçekleşen tarama |
|---|---|---|
| `facebook-ads-scraper` ($1.50/1K) | ~1.333 | 11 sorgu × 120 reklam |
| `blackfalcondata` ($0.05/1K) | ~40.000 | 45 sorgu × 400 reklam |

Araç `--per-query` vermezseniz bunu **otomatik hesaplar.** Bütçe sorgu başına
120 reklamın altına düşecekse, sorgu listesini kısaltıp derinliği korur — çünkü
bir reklamvereni 30 reklamla yargılayamazsınız. Kısaltma yapıldığında ekrana uyarı basar.

Aktör fiyatlarını çalıştırmadan önce Apify Store sayfasından doğrulayın; bazıları
sonuç ücretine ek compute unit da yazar. `--budget` gerçek harcamayı okuduğu için
her durumda sizi korur.

Fiyatları çalıştırmadan önce Apify Store'daki aktör sayfasından doğrulayın;
bazı aktörler sonuç ücretine ek olarak compute unit da yazar. `--budget`
gerçek harcamayı okuduğu için her durumda sizi korur.

## Notlar

- Meta Reklam Kütüphanesi'nde Instagram ve Facebook reklamları **aynı havuzdadır**.
  `platforms` alanı hangi platformda yayınlandığını söyler; `instagram_reklami`
  sütunu Instagram'da da dönen reklam sayısını verir.
- Siyasi olmayan reklamlarda Meta harcama tutarını vermez. Bu yüzden ömür +
  kreatif sayısı, harcamanın en iyi vekil göstergesidir.
- `--status active` varsayılandır (hâlâ açık reklamlar). Ölüm oranını da görmek
  için `--status all` kullanın — hayatta kalma oranı ancak o zaman anlamlıdır.
