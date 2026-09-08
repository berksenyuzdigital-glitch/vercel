# Yeni Klinik Nasıl Devreye Alınır

**Müşteri hiçbir şey kurmuyor.** Kurulumu sen yapıyorsun — aldığın kurulum ücreti
tam olarak bunun karşılığı. Kliniğin göreceği tek şey Google Sheet ve WhatsApp'ına
düşen mesajlar.

---

## Kim ne yapıyor

| İş | Kim | Süre |
|---|---|---|
| Meta Business hesabı, Cloud API, 8 şablon onayı | **Sen — hayatında bir kez** | 1 gün |
| n8n kurulumu ve credential'lar | **Sen — hayatında bir kez** | 1 saat |
| Klinik başına Sheet + numara + workflow kopyası | **Sen — klinik başına** | 45-60 dk |
| WhatsApp numarası ve doğrulama kodu | Klinik | 10 dk (telefonda) |
| Konum linki, Google yorum linki | Klinik | 5 dk |
| Sheet'te `geldi` / `gelmedi` yazmak | Klinik sekreteri | Günde 2 dk |

Kliniğin teknik iş yükü toplam **15 dakika**, o da sadece ilk gün.

---

## Bir kez yapılan işler (ilk klinikten önce)

Bunları bir defa yaparsın, sonraki bütün klinikler bunun üstüne biner.

1. **Meta Business Manager + WhatsApp Cloud API hesabı.** Kendi işletmen adına aç.
2. **İşletme doğrulaması (Business Verification).** Vergi levhası / imza sirküleri istiyor.
   Doğrulanmış hesap **25 numaraya** kadar ekleyebiliyor; doğrulanmamış hesap sadece 1.
   Bu adımı atlarsan ikinci kliniği alamazsın, en başta yap.
3. **8 şablonu onaya gönder** (`sablonlar/whatsapp-sablonlari.md`).
   Kritik nokta: **şablonlar numaraya değil, WhatsApp Business Account'a (WABA) bağlı.**
   Bir kez onaylanan şablon, o hesaba eklediğin **bütün klinik numaralarında** çalışır.
   Her klinik için baştan onay almazsın. WABA başına 250 şablon sınırı var, sen 8 kullanıyorsun.
4. **n8n kur** (cloud ya da kendi sunucun) ve iki credential'ı bir kez tanımla:
   Google Sheets OAuth + Header Auth (WhatsApp token).
5. **Sheet şablonunu hazırla:** 3 sekmeli boş bir Sheet (`Randevular` / `Rapor` / `Hatalar`),
   başlıklar yerinde. Her yeni klinikte bunu "Kopyasını oluştur" ile çoğaltacaksın.

Bu bir günü bitirdikten sonra klinik başına iş 1 saate iner.

---

## Klinik başına kurulum (45-60 dakika)

### Klinikten önceden isteyeceğin 4 şey

Tek telefon görüşmesinde toplanır:

1. **Otomasyon için ayrı bir WhatsApp numarası** (aşağıdaki uyarıyı mutlaka oku)
2. Google Maps konum linki
3. Google yorum linki (`https://g.page/r/.../review`)
4. Günlük özetin gideceği numara (sekreterin kendi telefonu olabilir) + sekreterin Gmail adresi

> ### ⚠ En kritik nokta: numara
> Cloud API'ye bağlanan numara, **normal WhatsApp ve WhatsApp Business uygulamasında
> artık kullanılamaz.** Kliniğin sekreterinin telefonunda günlük kullandığı numarayı
> bağlarsan o numara telefondan düşer ve klinik seni linç eder.
>
> Doğru yol: klinik **yeni bir hat** alsın (ya da kullanılmayan ikinci bir numara versin),
> otomasyon o numaradan çalışsın. Mevcut numaraya gelen mesajlar sekreterde kalır.
> Bunu satış görüşmesinde söyle, kurulumda değil.

### Adımlar

| # | İş | Süre |
|---|---|---|
| 1 | Sheet şablonunu kopyala, adını `dental-randevu-KLINIKADI` yap, sekreterin Gmail'ine düzenleme yetkisi ver | 3 dk |
| 2 | Kliniğin numarasını Meta'daki WABA'na ekle, doğrulama kodunu klinikten al | 10 dk |
| 3 | `klinik.json` doldur, `python3 kur.py klinik.json` çalıştır | 5 dk |
| 4 | `hazir/` içindeki 8 workflow'u n8n'e import et, credential'ları seç | 15 dk |
| 5 | 07 hariç hepsinin Settings → Error Workflow alanına `Dental 07`yi seç | 3 dk |
| 6 | Meta webhook URL'ini bu numara için ayarla, `messages` aboneliğini işaretle | 5 dk |
| 7 | `node test/otomasyon-testi.mjs` + n8n içinde Aşama 2 testleri (`TEST.md`) | 10 dk |
| 8 | Kendi numaranla gerçek uçtan uca test | 10 dk |
| 9 | Kliniğin randevu formunu / Instagram lead formunu webhook'a bağla | 10 dk |

İlk klinikte bu 4-6 saat sürer çünkü öğreniyorsun. Üçüncü klinikte 45 dakika.

### Teslim: sekretere 10 dakikalık eğitim

`KULLANIM.md`'nin **1. bölümünü** yazdır, sekretere ver. Anlatacağın tek şey:

- Hasta gelince `geldi`, gelmeyince `gelmedi` yaz. Sistemin tek yakıtı bu.
- Sabah, yarınki randevulardan `Durum` hâlâ `yeni` olanları ara.
- Randevu saati değişirse `Hatirlatma24` hücresini boşalt.
- Sheet'e şikayet/teşhis yazma.

Gerisini sistem yapıyor. Sekreterin n8n'i görmesine, Meta'yı bilmesine gerek yok.

---

## Numara ve hesap kimin adına olacak?

İki seçenek var, ikisinin de bedeli farklı:

**A) Hepsi senin WABA'nda (önerilen başlangıç)**
- Şablonlar bir kez onaylanır, bütün klinikler kullanır. Kurulum en hızlı bu.
- 25 klinik sınırı. Kalite derecesi numara başına ayrı tutulur, yani bir kliniğin
  kötü performansı diğerlerini etkilemez.
- Bedeli: numaralar senin hesabında. Klinik ayrılırsa numara devri zahmetli.
  **Sözleşmeye yaz:** "klinik ayrılırsa numara 30 gün içinde kliniğin hesabına devredilir."

**B) Her kliniğin kendi Meta Business hesabı, sana yönetici erişimi**
- Mülkiyet net, klinik ayrılırken sorun yok, sınır yok.
- Bedeli: **her klinikte 8 şablonu yeniden onaylatırsın** (2-3 gün bekleme) ve
  kliniği Meta doğrulamasından geçirmeye ikna etmen gerekir. Küçük klinikte bu zor.

Pratik yol: ilk 5-10 klinik A ile, iş oturunca kurumsallara B teklif et.

---

## "Bu çok karmaşık" hissine cevap

Karmaşık olan **kurulum**, kullanım değil. Karşılaştır:

| | Kurulum | Günlük kullanım |
|---|---|---|
| Sen | 1 gün (bir kez) + klinik başına 1 saat | Haftada 10 dk bakım |
| Klinik | 15 dakika telefon görüşmesi | Günde 2 dk Sheet |

Zaten müşterinin bunu kuramayacak olması **senin işinin var olma sebebi.** Klinik kurabilseydi
7.500 TL/ay ödemezdi. Sattığın şey n8n değil, "sekreterin 2 saatlik işini ben devraldım".

Kurulumun kendisi ağır gelirse sırayı bozma: önce **tek klinikte** baştan sona kur,
bir ay çalıştır, `Rapor` sekmesinde sonucu gör. İkinci klinikte aynı işi yarı sürede yaparsın.
İlk kliniğe kurulum ücretini indirimli verip referans olarak kullanmak, 5 kliniğe aynı anda
söz verip hiçbirini bitirememekten iyidir.
