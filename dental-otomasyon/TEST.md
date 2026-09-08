# Otomasyonu Nasıl Test Edersin

Üç aşama. Sırayla git — her aşama bir öncekinin üstüne biniyor.
Gerçek hastaya mesaj gitmesi **sadece 3. aşamada** mümkün.

| Aşama | Ne test eder | Gereken | Süre |
|---|---|---|---|
| 1 | Akışın mantığı (kim ne zaman ne mesaj alır) | Sadece Node.js | 10 saniye |
| 2 | n8n bağlantıları (Sheets okuma/yazma, ayarlar) | n8n + Google Sheets | 20 dakika |
| 3 | Gerçek uçtan uca (WhatsApp dahil) | + Meta onaylı şablonlar | 1 saat |

---

## Aşama 1 — Kurulum olmadan mantık testi

Hiçbir hesap, kurulum veya internet gerekmez. Mesaj gönderilmez, Sheet'e yazılmaz.

```bash
cd dental-otomasyon
node test/otomasyon-testi.mjs
```

Bu test workflow dosyalarındaki **gerçek kodu** okuyup sahte bir randevu defteri üzerinde
11 adımlık tam bir hikâye oynatıyor:

1. Instagram'dan lead geliyor → karşılama mesajı
2. Hasta "1" yazıyor → onaylanıyor
3. Ertesi gün hatırlatma gidiyor → cron ikinci kez çalışsa tekrar gitmiyor
4. Bekleme listesine 2 kişi ekleniyor → aynı numara ikinci kez engelleniyor
5. Hasta "2" yazıyor → iptal, koltuk serbest
6. Boş koltuk bekleme listesine teklif ediliyor
7. İki kişi de "1" yazıyor → **ilk yazan alıyor**, geç kalan listede kalıyor
8. Randevuya 2 saat kala konum gidiyor
9. Hasta geldi → ertesi gün Google yorumu isteniyor
10. Akşam kliniğe özet gidiyor
11. "Dişim ağrıyor fiyat nedir" → sekretere devrediliyor

Çıktıda **her mesajın kime, hangi şablonla, hangi metinle gideceğini** görürsün.
Sonda `20 kontrol geçti, 0 kontrol kaldı` yazmalı. Kırmızı ✗ varsa o adım bozulmuştur.

**Ne zaman çalıştır:** Bir Code node'una dokunduğunda, şablon parametre sırasını
değiştirdiğinde, yeni bir klinik için ayar değiştirdiğinde. 10 saniyede seni yanlış
mesaj göndermekten kurtarır.

**Ne test etmez:** Google Sheets bağlantısı, Meta şablon onayı, gerçek mesaj gönderimi.
Onlar 2. ve 3. aşama.

---

## Aşama 2 — n8n içinde, mesaj göndermeden

Sheets bağlantısını ve ayarları test edersin, WhatsApp'a hiç dokunmadan.

**Hazırlık:** `Randevular` sekmesine elle 3-4 test satırı gir. Telefon kolonuna
**kendi numaranı** yaz. Tarihlerden birini yarın, birini bugün 2 saat sonrası yap.

**Adımlar:**

1. n8n'de `Dental 02` workflow'unu aç, **Active yapma**.
2. WhatsApp gönderen node'a sağ tıkla → **Deactivate**. Artık akış oraya gelince duracak.
3. Yukarıdaki **Test workflow** butonuna bas.
4. Her node'un yanındaki sayıya bak: `Randevuları Oku` kaç satır getirdi?
   `Yarınki Randevuları Seç` kaç satır bıraktı? Beklediğin sayı mı?
5. Node'a tıklayıp **OUTPUT** sekmesinden gerçek veriyi gör. Telefon formatı doğru mu,
   tarih doğru mu?

Aynısını 03, 04, 08 için tekrarla. Bu aşamada aradığın hatalar:

| Belirti | Sebep |
|---|---|
| `Randevuları Oku` 0 satır getiriyor | SHEET_ID yanlış veya sekme adı `Randevular` değil |
| Okuyor ama `Seç` node'u 0 bırakıyor | Tarih formatı `yyyy-aa-gg` değil, ya da Durum yazımı farklı |
| Sheets "permission denied" | Google credential'ı o Sheet'e erişemiyor |
| `Ayarlar` node'unda hâlâ `BURAYA_` yazıyor | `kur.py` çalıştırılmamış |

**Webhook'lu akışlar için (01, 06):** Workflow'u aç, **Listen for test event**'e bas,
sonra başka bir terminalden:

```bash
curl -X POST https://SENIN-N8N/webhook-test/dental-lead \
  -H 'Content-Type: application/json' \
  -d '{"ad":"Test","telefon":"0532 111 22 33","kaynak":"test"}'
```

Dikkat: test dinlerken adres `/webhook-test/`, canlıda `/webhook/`.

---

## Aşama 3 — Gerçek uçtan uca test

Artık gerçek mesaj gidecek. **Kendi numaranla** yap, klinikle değil.

**Ön koşul:** Meta'da 8 şablonun da durumu `Approved` olmalı. `Pending` olan varsa
o akışı test etme, 400 hatası alırsın.

**Sıra:**

1. **Karşılama (01):** `test-komutlari.sh` içindeki 1. komutu kendi numaranla çalıştır.
   Telefonuna 1 dakika içinde karşılama mesajı düşmeli.
2. **Onay (05):** Gelen mesaja **1** yaz. Sheet'te `Durum` kolonunun `onaylı` olduğunu gör.
   Olmadıysa: 05 Active mi, Meta webhook'unda `messages` aboneliği var mı?
3. **Hatırlatma (02):** Sheet'te randevunu yarına al, `Hatirlatma24` hücresini boşalt,
   n8n'de 02'yi elle çalıştır. Mesaj gelmeli.
4. **İptal + doldurma (05→03):** Bu sefer **2** yaz. Sheet'te `iptal` olmalı ve
   bekleme listesindeki numaraya "boşluk açıldı" mesajı gitmeli.
   Test için bekleme listesine ikinci bir numara (eşinin, arkadaşının) ekle.
5. **İlk yazan alır:** İki numaradan da **1** yaz. İkincisi "maalesef doldu" almalı.
6. **Konum (03):** Sheet'te randevu saatini "şu andan 2 saat sonra" yap,
   `Hatirlatma2`yi boşalt, 03'ü elle çalıştır.
7. **Yorum (04):** `Durum` = `geldi`, `Tarih` = dün yap, 04'ü elle çalıştır.
8. **Özet (08):** 08'i elle çalıştır, kliniğin numarası yerine kendi numaranı koyarak dene.
9. **Hata alarmı (07):** `Ayarlar`daki `PHONE_NUMBER_ID`yi bilerek boz, 02'yi çalıştır.
   Hata uyarısı sana gelmeli ve `Hatalar` sekmesine satır düşmeli. Sonra geri düzelt.

**Gerçek mesaj gitmeden önce son kontrol:** Sheet'te sadece senin ve test numaralarının
olduğundan emin ol. Gerçek hasta listesi yüklüyken elle workflow çalıştırma —
o anda 40 kişiye mesaj gider.

---

## Klinikte ilk hafta: gölge mod

Canlıya alırken hepsini birden açma.

1. **İlk 3 gün:** Sadece 02 (hatırlatma) açık. Sekreter zaten arayacağı hastaları
   arasın, otomasyonun mesajıyla çakışsın — hangisinin işe yaradığını gör.
2. **4-7. gün:** 05 + 01 açılır. Artık cevaplar işleniyor.
3. **2. hafta:** 06 + 03 (bekleme + koltuk doldurma), sonra 04 ve 08.

07 (hata bildirimi) ilk günden açık olsun.

Her akşam `Hatalar` sekmesine ve n8n **Executions** ekranına bak. İlk hafta günde
2 dakika bakman, ikinci hafta sistemin kendi kendine yürümesini sağlar.
