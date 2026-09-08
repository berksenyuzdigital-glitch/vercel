# Dental Koltuk Doldurma Makinesi

Diş kliniği için WhatsApp + n8n + Google Sheets randevu otomasyonu.
**Anında karşılama → 24 saat hatırlatma → 2 saat konum → iptal doldurma → Google yorum.**

n8n'e direkt import edilebilir 5 workflow. Tek yapman gereken 3 değeri değiştirmek:
`SHEET_ID`, `PHONE_NUMBER_ID`, ve klinik bilgileri (konum + Google yorum linki).

---

## İçerik

| Dosya | Ne yapar | Tetikleyici |
|---|---|---|
| `workflows/01-yeni-lead-karsilama.json` | Lead düşer düşmez (hedef <60 sn) karşılama + 2 saat teklifi, Sheet'e kayıt | Webhook `POST /webhook/dental-lead` |
| `workflows/02-24saat-hatirlatma.json` | Yarınki randevulara onay mesajı | Cron, her gün 09:00 |
| `workflows/03-2saat-konum-ve-iptal-doldurma.json` | Randevuya ~2 saat kala konum **+** boşalan koltuğu bekleme listesine teklif | Cron 15 dk + Webhook `POST /webhook/dental-iptal` |
| `workflows/04-google-yorum-istek.json` | Gelen hastaya ertesi gün Google yorum linki | Cron, her gün 12:00 |
| `workflows/05-whatsapp-gelen-mesaj-router.json` | Hastanın **1 / 2** cevabını işler, "ilk yazan alır" kilidini kurar, anlamadığını insana devreder | Webhook `GET+POST /webhook/dental-wa` |

Workflow 05 opsiyonel değil: 1/2 cevaplarını o işliyor, onsuz diğerleri tek yönlü kalır.

---

## Kurulum (yaklaşık 1 saat)

### 1. Google Sheet
`dental-randevu` adında bir Sheet aç, ilk sayfanın adını **`Randevular`** yap.
1. satıra `sablonlar/google-sheet-basliklari.csv` içindeki başlıkları **birebir** yapıştır:

```
ID | Ad | Telefon | Tarih | Saat | Durum | Kaynak | Hatirlatma24 | Hatirlatma2 | YorumIstek | TeklifTarih | TeklifSaat | Guncelleme
```

Kurallar:
- `Tarih` → `2026-09-09` (yyyy-aa-gg), `Saat` → `11:00`. Hücreleri **düz metin** yap ki Sheets formatı bozmasın.
- `Telefon` → `905321112233` (başında + yok, düz metin).
- `Durum` → `yeni` / `onaylı` / `iptal` / `geldi` / `bekleme` / `teklif_edildi`
- `bekleme` = bekleme listesi. Boşluk açıldığında teklif bu satırlara gider.
- `geldi` işaretini sekreter koyar (ya da kliniğin yazılımından besleyebilirsin) — Workflow 04 buna bakıyor.
- `ID` boş bırakılamaz, tüm güncellemeler bu kolondan eşleşiyor. Elle satır eklerken `RND-` + rastgele bir şey yaz.

### 2. WhatsApp Cloud API
1. Meta Business Manager → WhatsApp → **Cloud API** (Twilio'ya gerek yok).
2. Numarayı doğrula, **Phone Number ID**'yi ve kalıcı **System User Token**'ı al.
3. `sablonlar/whatsapp-sablonlari.md` içindeki 5 şablonu **Utility** kategorisinde onaya gönder.
4. Configuration → Webhooks: URL `https://SENIN-N8N/webhook/dental-wa`, verify token kendi belirlediğin bir şey,
   `messages` alanına abone ol. (Workflow 05'in GET ucu challenge'ı otomatik döner — önce workflow'u aktif et.)

### 3. n8n
1. Cloud (~20 €/ay) veya kendi sunucun. **Settings → Timezone: Europe/Istanbul.**
2. Credentials:
   - **Google Sheets OAuth2** → Sheet'e erişim.
   - **Header Auth** (adı fark etmez): Name `Authorization`, Value `Bearer <WHATSAPP_TOKEN>`.
     Token dosyalarda yazmıyor, sadece bu credential'da duruyor.
3. `workflows/*.json` dosyalarını sırayla import et (Workflows → Import from File).
4. Her workflow'daki **Ayarlar** node'unda `BURAYA_...` yazan alanları doldur:

   | Alan | Nerede | Ne yazacaksın |
   |---|---|---|
   | `SHEET_ID` | 5 workflow'da da | Sheet URL'indeki `/d/` ile `/edit` arasındaki kod |
   | `PHONE_NUMBER_ID` | 5 workflow'da da | Meta'daki Phone Number ID |
   | `KONUM_LINK` | 03 | Google Maps kısa linki |
   | `GOOGLE_YORUM_LINK` | 04 | `https://g.page/r/.../review` |
   | `IPTAL_WEBHOOK_URL` | 05 | `https://SENIN-N8N/webhook/dental-iptal` |
   | `KLINIK_TELEFON` | 05 | İnsana devrederken verilecek numara |
   | `SLOT_1` / `SLOT_2` | 01 | Ön muayene için teklif edilen saatler |

5. Her HTTP Request node'unda credential olarak Header Auth'u seç (import sonrası bir kez).
6. 5 workflow'u da **Active** yap.
7. `./test-komutlari.sh` ile duman testi (içindeki `N8N` değişkenini değiştir).

### 4. Lead kaynaklarını bağla
Instagram Lead Form / web formu / "Randevu Al" butonunu `POST /webhook/dental-lead` adresine bağla.
Beklenen gövde (alan adları esnek: `ad|isim|name`, `telefon|tel|phone`):

```json
{ "ad": "Mehmet Yılmaz", "telefon": "0532 111 22 33", "kaynak": "instagram" }
```

---

## Akış nasıl işliyor

```
Lead gelir ──► W01: Sheet'e "yeni" + karşılama şablonu (2 saat teklifi)
                    │
Hasta "1" yazar ──► W05: Durum = onaylı
Hasta "2" yazar ──► W05: Durum = iptal ──► W03 iptal ucu ──► bekleme listesine "boşluk var" (max 10 kişi)
                                                              │
                                              ilk "1" yazan ──► W05: koltuk onun, Durum = onaylı
                                              geç kalanlar  ──► "doldu, listedesiniz", Durum = bekleme
Randevudan 24s önce ──► W02: onay hatırlatması (Hatirlatma24 damgalanır, iki kez gitmez)
Randevudan ~2s önce ──► W03: konum mesajı (Hatirlatma2 damgalanır)
Ziyaretten 1 gün sonra ──► W04: Durum "geldi" ise Google yorum linki (YorumIstek damgalanır)
Anlaşılmayan mesaj ──► W05: "danışmanımız dönecek" + insana devir
```

Her adım Sheet'e zaman damgası yazdığı için **tekrar gönderim yok** — cron iki kez çalışsa bile mesaj bir kez gider.

---

## KVKK yaklaşımı

Bu sistem bilinçli olarak **sağlık verisi tutmaz**. Sheet'te teşhis, şikayet, tedavi adı, röntgen yok;
sadece `Ad | Telefon | Tarih | Saat | Durum | Kaynak` ve teknik damgalar var. Hastanın yazdığı mesajın
metni de **hiçbir yere kaydedilmez** — Workflow 05 onu yalnızca akış içinde "1 mi 2 mi" kararı için okur.

Yine de sistemi satarken bunları atlama:
- Klinik veri sorumlusu; **aydınlatma metni** ve VERBİS yükümlülüğü onda. Formun altına aydınlatma metni linki koy.
- Randevu hatırlatma mesajı ticari ileti değildir; ama **"boşluk açıldı, gelmek ister misiniz?"** ve
  **Google yorum isteği** ticari iletiye kayabilir → bekleme listesine girerken açık onay al, İYS tarafını kliniğin
  hukukçusuna teyit ettir. Bu iki workflow'u onaysız kitleye çalıştırma.
- "Bir diş kliniğinin hastası olmak" tek başına dolaylı bir sağlık verisi sayılabiliyor; erişimi Sheet'te
  sadece klinikle paylaş, herkese açık link verme, n8n credential'larını paylaşma.
- Ben hukukçu değilim; metinleri kliniğin danışmanına okutmadan sözleşmeye "KVKK'ya tam uyumlu" diye yazma.

---

## Notlar

- Mesaj gönderimi hata verirse (numara WhatsApp'ta yok, şablon reddedilmiş) akış durmaz, o kayıt atlanır
  — n8n Executions ekranından görürsün.
- Şablon parametre sırasını değiştirirsen Code node'daki `parameters` dizisini de değiştir, yoksa Meta 400 döner.
- 15 dakikalık cron 105–135 dk penceresine bakıyor; cron aralığını değiştirirsen pencereyi de değiştir
  (`03` içindeki `2 Saat Kalanları Seç` node'u), yoksa ya çift mesaj ya da atlama olur.
- Ölçekleme: aynı Sheet'te birden fazla klinik tutma. Her kliniğe kendi Sheet'i + kendi WhatsApp numarası.
- Metindeki pazar verileri (kliniklerin otomasyon kullanım oranı, no-show düşüşü) senin verdiğin rakamlar;
  doğrulamadım. Satış sunumunda kaynak göstereceksen önce teyit et — kurulumdan sonra kliniğin kendi
  no-show oranını 1 ay ölçmek en sağlam kanıt olur.
