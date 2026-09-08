# Dental Koltuk Doldurma Makinesi

Diş kliniği için WhatsApp + n8n + Google Sheets randevu otomasyonu.
**Anında karşılama → 24 saat hatırlatma → 2 saat konum → iptal doldurma → Google yorum**,
üstüne bekleme listesi, hata alarmı ve günlük rapor.

n8n'e direkt import edilebilir 8 workflow. Ayarları elle dolaşmana gerek yok:
tek bir config dosyası doldurup `kur.py` çalıştırıyorsun.

---

## İçerik

| Dosya | Ne yapar | Tetikleyici |
|---|---|---|
| `workflows/01-yeni-lead-karsilama.json` | Lead düşer düşmez (hedef <60 sn) karşılama + 2 saat teklifi, Sheet'e kayıt | Webhook `POST /webhook/dental-lead` |
| `workflows/02-24saat-hatirlatma.json` | Yarınki randevulara onay mesajı | Cron 09:00 |
| `workflows/03-2saat-konum-ve-iptal-doldurma.json` | Randevuya ~2 saat kala konum **+** boşalan koltuğu bekleme listesine teklif | Cron 15 dk + Webhook `POST /webhook/dental-iptal` |
| `workflows/04-google-yorum-istek.json` | Gelen hastaya ertesi gün Google yorum linki | Cron 12:00 |
| `workflows/05-whatsapp-gelen-mesaj-router.json` | Hastanın **1 / 2** cevabını işler, "ilk yazan alır" kilidi, insana devir | Webhook `GET+POST /webhook/dental-wa` |
| `workflows/06-bekleme-listesi-kayit.json` | Bekleme listesine kayıt (mükerrer kaydı engeller) | Webhook `POST /webhook/dental-bekleme` |
| `workflows/07-hata-bildirimi.json` | Bir akış patlarsa sana WhatsApp uyarısı + `Hatalar` sekmesine log | n8n Error Trigger |
| `workflows/08-gunluk-ozet.json` | Kliniğe akşam özeti + `Rapor` sekmesine ölçüm satırı | Cron 19:00 |

**Neden 4 değil 8:** 05 olmadan hastanın "1" cevabını kimse işlemez, akış tek yönlü kalır.
06 olmadan bekleme listesi hiç dolmaz, dolayısıyla iptal doldurma da boşa çalışır.
07 olmadan token süresi dolduğunda haftalarca sessizce mesaj gitmez.
08 olmadan klinik otomasyonun işe yaradığını göremez, abonelik yenilemez.

---

## Kurulum

### 1. Google Sheet
`dental-randevu` adında bir Sheet aç ve **3 sekme** oluştur (başlıklar `sablonlar/google-sheet-basliklari.csv` içinde):

- **`Randevular`** — ana tablo:
  `ID | Ad | Telefon | Tarih | Saat | Durum | Kaynak | Hatirlatma24 | Hatirlatma2 | YorumIstek | TeklifTarih | TeklifSaat | Guncelleme`
- **`Rapor`** — Workflow 08 her akşam bir satır ekler.
- **`Hatalar`** — Workflow 07 hata olunca yazar.

Kurallar:
- `Tarih` → `2026-09-09` (yyyy-aa-gg), `Saat` → `11:00`, `Telefon` → `905321112233`. Kolonları **düz metin** formatına al.
- `Durum` değerleri: `yeni` · `onaylı` · `iptal` · `geldi` · `gelmedi` · `bekleme` · `teklif_edildi`
- `geldi` / `gelmedi` işaretini sekreter koyar (Workflow 04 ve 08 buna bakıyor). Tek manuel iş bu —
  günlük kullanım için `KULLANIM.md`.
- `ID` boş kalamaz; tüm güncellemeler bu kolondan eşleşiyor.

### 2. WhatsApp Cloud API
1. Meta Business Manager → WhatsApp → **Cloud API** (Twilio'ya gerek yok). Numarayı doğrula.
2. **Phone Number ID** ve kalıcı **System User Token**'ı al.
3. `sablonlar/whatsapp-sablonlari.md` içindeki 8 şablonu **Utility** kategorisinde onaya gönder.
4. Configuration → Webhooks: URL `https://SENIN-N8N/webhook/dental-wa`, `messages` alanına abone ol.
   (Workflow 05'in GET ucu challenge'ı otomatik döner — önce o workflow'u Active yap.)

### 3. Ayarları işle
`klinik.ornek.json` dosyasını kopyalayıp klinik bilgileriyle doldur:

```bash
cp klinik.ornek.json klinik.json    # SHEET_ID, PHONE_NUMBER_ID, N8N_BASE_URL, linkler...
python3 kur.py klinik.json          # hazir/ klasörüne 8 workflow üretir
```

Ya da tek komutla hepsi (şablon yükleme + n8n'e kurulum + aktif etme):

```bash
export META_TOKEN=... WABA_ID=... N8N_URL=... N8N_API_KEY=...
./kurulum.sh klinik.json
```

| Araç | Ne yapar |
|---|---|
| `kur.py` | Klinik ayarlarını 8 workflow'a işler |
| `araclar/meta-sablon-yukle.mjs` | 8 WhatsApp şablonunu Meta'ya yükler (`--durum` ile onay durumu) |
| `araclar/n8n-yukle.mjs` | Workflow'ları n8n'e yükler, credential bağlar, hata akışını ayarlar, aktif eder |
| `sablonlar/dental-randevu-sablonu.xlsx` | 3 sekmeli hazır Sheet — Drive'a atıp Sheets olarak aç |
| `kurulum.sh` | Yukarıdakilerin hepsini sırayla çalıştırır |

Script ayarları node isimlerine göre yazar (kör metin değiştirme yok), sonunda hâlâ
doldurulmamış alan kaldıysa uyarır. Elle uğraşmak istersen her workflow'daki **Ayarlar**
node'unda `BURAYA_...` yazan alanları değiştirmek de yeterli.

| Config anahtarı | Ne |
|---|---|
| `SHEET_ID` | Sheet URL'inde `/d/` ile `/edit` arasındaki kod |
| `PHONE_NUMBER_ID` | Meta'daki Phone Number ID |
| `N8N_BASE_URL` | n8n adresin — `IPTAL_WEBHOOK_URL` bundan türetilir |
| `KLINIK_TELEFON` | Günlük özetin gideceği numara (klinik) |
| `OPERATOR_TELEFON` | Hata uyarılarının gideceği numara (sen) |
| `KONUM_LINK` / `GOOGLE_YORUM_LINK` | Maps kısa linki / `https://g.page/r/.../review` |
| `SLOT_1` / `SLOT_2` | Ön muayene için teklif edilen saatler |
| `TEKLIF_ADEDI` | Boş koltuk kaç kişiye aynı anda teklif edilsin (varsayılan 10) |

### 4. n8n
1. Cloud (~20 €/ay) veya kendi sunucun. **Settings → Timezone: Europe/Istanbul.**
2. Credentials:
   - **Google Sheets OAuth2**
   - **Header Auth**: Name `Authorization`, Value `Bearer <WHATSAPP_TOKEN>`
     — token hiçbir dosyada yazmıyor, sadece burada duruyor.
3. `hazir/*.json` dosyalarını import et (Workflows → Import from File).
4. Her HTTP Request node'unda Header Auth credential'ını seç (import sonrası bir kez).
5. **07 hariç** her workflow'un Settings → **Error Workflow** alanına `Dental 07 - Hata Bildirimi`'ni seç.
   Bunu yapmazsan hata alarmı hiç çalışmaz.
6. 8 workflow'u da **Active** yap.
7. `./test-komutlari.sh` ile duman testi (içindeki `N8N` değişkenini değiştir).

### 5. Lead kaynaklarını bağla
- Randevu formu / Instagram Lead Form / "Randevu Al" butonu → `POST /webhook/dental-lead`
- "Boşluk olursa haber ver" formu → `POST /webhook/dental-bekleme`

```json
{ "ad": "Mehmet Yılmaz", "telefon": "0532 111 22 33", "kaynak": "instagram" }
```
Alan adları esnek: `ad|isim|name`, `telefon|tel|phone`, `kaynak|source`.

---

## Akış

```
Lead gelir ──────► W01: Sheet'e "yeni" + karşılama şablonu (2 saat teklifi)
Bekleme formu ───► W06: Sheet'e "bekleme" (aynı numara iki kez eklenmez)

Hasta "1" yazar ─► W05: Durum = onaylı
Hasta "2" yazar ─► W05: onaylı randevu ise  → iptal   ─┐
                        henüz onaylanmamışsa → bekleme ─┤ (koltuk serbest kalır)
                                                        ▼
                                          W03 iptal ucu: bekleme listesine "boşluk var" (max 10 kişi)
                                                        │
                                        ilk "1" yazan ──► W05: koltuk onun, Durum = onaylı
                                        geç kalanlar  ──► "doldu, listedesiniz", Durum = bekleme

24s önce ──► W02 onay hatırlatması      ~2s önce ──► W03 konum mesajı
Ziyaretten 1 gün sonra ──► W04 Google yorum (Durum "geldi" ise)
Her akşam 19:00 ──► W08 kliniğe özet + Rapor satırı
Herhangi bir hata ──► W07 sana WhatsApp + Hatalar sekmesine log
Anlaşılmayan mesaj ──► W05 "danışmanımız dönecek" + insana devir
```

Her adım Sheet'e zaman damgası yazdığı için **mükerrer mesaj yok** — cron iki kez çalışsa bile mesaj bir kez gider.

---

## KVKK yaklaşımı

Sistem bilinçli olarak **sağlık verisi tutmaz**. Sheet'te teşhis, şikayet, tedavi adı, röntgen yok;
sadece `Ad | Telefon | Tarih | Saat | Durum | Kaynak` ve teknik damgalar var. Hastanın yazdığı mesajın
metni de **hiçbir yere kaydedilmez** — Workflow 05 onu yalnızca "1 mi 2 mi" kararı için okur.
Hata kayıtlarına da hasta verisi değil, sadece workflow/node/hata mesajı yazılır.

Satarken atlanmaması gerekenler:
- Klinik veri sorumlusu; **aydınlatma metni** ve VERBİS yükümlülüğü onda. Formun altına aydınlatma metni linki koy.
- Randevu hatırlatması ticari ileti değildir; ama **"boşluk açıldı, gelmek ister misiniz?"** ve
  **Google yorum isteği** ticari iletiye kayabilir → bekleme listesine girerken açık onay al,
  İYS tarafını kliniğin hukukçusuna teyit ettir. Bu iki akışı onaysız kitleye çalıştırma.
- "Bir diş kliniğinin hastası olmak" tek başına dolaylı sağlık verisi sayılabiliyor; Sheet'i herkese
  açık linkle paylaşma, n8n credential'larını klinikle paylaşma.
- Ben hukukçu değilim; sözleşmeye "KVKK'ya tam uyumlu" yazmadan önce metinleri kliniğin danışmanına okut.

---

## Notlar

- Mesaj gönderimi hata verirse (numara WhatsApp'ta yok, şablon reddedilmiş) akış durmaz, o kayıt atlanır
  ve Workflow 07 seni uyarır.
- Şablon parametre sırasını değiştirirsen Code node'daki `parameters` dizisini de değiştir, yoksa Meta 400 döner.
- 15 dakikalık cron 105–135 dk penceresine bakıyor; cron aralığını değiştirirsen pencereyi de değiştir
  (`03` içindeki `2 Saat Kalanları Seç`), yoksa ya çift mesaj ya atlama olur.
- Her kliniğe **kendi Sheet'i + kendi WhatsApp numarası**. Aynı Sheet'te iki klinik tutma.
- Günlük kullanım, sekreter kılavuzu ve sorun giderme: **`KULLANIM.md`**.
- Yeni klinik devreye alma (kim ne yapıyor, klinik başına 1 saatlik checklist): **`YENI-KLINIK-KURULUM.md`**.
- Test etme: **`TEST.md`**. En hızlısı `node test/otomasyon-testi.mjs` — kurulum gerektirmeden
  tüm akışı simüle eder, 10 saniyede biter.
- `Rapor` sekmesi 1 ay birikince kliniğe "no-show şu kadar düştü, şu kadar koltuk doldu" diye
  somut tablo gösterirsin — yenileme görüşmesinin dayanağı bu, tahmini rakamlar değil.
- Metindeki pazar verileri (otomasyon kullanım oranı, no-show düşüşü) senin verdiğin rakamlar; doğrulamadım.
  Kliniğin kendi no-show oranını kurulumdan önce 2 hafta ölçmek en sağlam kanıt olur.
