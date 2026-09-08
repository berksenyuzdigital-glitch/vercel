# Kullanım Kılavuzu

Kurulum bittikten sonra sistem günlük hayatta nasıl işliyor.
İki bölüm: **sekreterin yaptığı iş** (5 dakika/gün) ve **senin yaptığın iş** (haftada 10 dakika).

---

# BÖLÜM 1 — Klinik / sekreter için

## Sistem neyi kendi yapıyor, sen neyi yapıyorsun

| Otomasyon yapıyor | Sen yapıyorsun |
|---|---|
| Yeni talebe 1 dakika içinde cevap | Hasta gelince `geldi` yazmak |
| Bir gün önce hatırlatma + onay toplama | Gelmeyene `gelmedi` yazmak |
| 2 saat kala konum atma | Telefonla gelen randevuyu Sheet'e eklemek |
| İptal olunca koltuğu bekleme listesinden doldurma | Saat değişikliğini Sheet'te düzeltmek |
| Ertesi gün Google yorumu isteme | — |
| Akşam günlük özet göndermek | — |

**Altın kural: Sheet neyse gerçek odur.** Hastayı arayıp randevu değiştirdiysen Sheet'e
yazmadığın sürece sistem eski saati bilir ve yanlış hatırlatma gönderir.

## Günlük rutin (5 dakika)

**Sabah (09:30 civarı)**
`Randevular` sekmesini aç, yarının tarihine bak. Otomasyon 09:00'da hatırlatma attı;
saat 12:00'ye kadar `Durum` kolonu hâlâ `yeni` kalanları **telefonla ara**. Bunlar
"okumadı veya cevaplamadı" grubudur, gelmeme ihtimali en yüksek olanlar bunlar.

**Gün boyu**
Hasta koltuğa oturduğunda satırındaki `Durum` → **`geldi`**.
Randevu saati geçti, hasta gelmediyse → **`gelmedi`**.
Bu iki kelime sistemin tek yakıtı: `geldi` yazmazsan ertesi gün Google yorumu istenmez,
`gelmedi` yazmazsan aylık raporda no-show'un düştüğü görünmez.

**Akşam**
WhatsApp'a günlük özet gelir. Yarın kaç randevu var, kaçı onaylı, bugün kaç kişi gelmedi,
kaç boş koltuk dolduruldu. Onay bekleyen sayısı yüksekse ertesi sabah arayacağın liste bellidir.

## Sık yapılan işler

**Telefonla randevu alan hasta** — `Randevular` sekmesine yeni satır:

| ID | Ad | Telefon | Tarih | Saat | Durum | Kaynak |
|---|---|---|---|---|---|---|
| RND-0912-01 | Ali Kaya | 905321112233 | 2026-09-12 | 14:30 | onaylı | telefon |

- `ID` boş kalamaz, benzersiz olsun (tarih + sıra yeter). Sistem satırları bundan buluyor.
- `Telefon` mutlaka **905321112233** formatında: başında 0 veya + yok.
- `Tarih` **2026-09-12**, `Saat` **14:30**. Format bozulursa o satıra hiç mesaj gitmez.
- Hasta telefonda "geleceğim" dediyse `onaylı`, kararsızsa `yeni` yaz.

**Randevu saati değişti** — `Tarih` / `Saat` hücrelerini düzelt, sonra
**`Hatirlatma24` ve `Hatirlatma2` hücrelerini boşalt.** Bunları silmezsen sistem
"bu hastaya zaten haber verdim" sanar ve yeni saat için hatırlatma göndermez.

**Hasta iptal etti (telefonla)** — `Durum` → `iptal`. Koltuğun otomatik dolmasını istiyorsan
`Tarih` ve `Saat` yerinde kalsın, sonra bekleme listesine haber gitmesi için sana haber ver
(ya da hastanın WhatsApp'tan **2** yazmasını iste, o zaman her şey otomatik olur).

**Bekleme listesine biri eklenecek** — yeni satır: `ID`, `Ad`, `Telefon`, `Durum` = **`bekleme`**,
`Tarih` ve `Saat` **boş**. Boşluk açıldığında teklif bu kişilere gider.

## Durum kolonu sözlüğü

| Durum | Anlamı | Kim yazar |
|---|---|---|
| `yeni` | Talep geldi, hasta henüz onaylamadı | Otomasyon |
| `onaylı` | Hasta geleceğini söyledi | Otomasyon (hasta 1 yazınca) / sekreter |
| `iptal` | Randevu iptal | Otomasyon (hasta 2 yazınca) / sekreter |
| `geldi` | Hasta kliniğe geldi | **Sekreter** |
| `gelmedi` | Randevuya gelmedi (no-show) | **Sekreter** |
| `bekleme` | Boşluk açılırsa haber verilecek kişi | Otomasyon / sekreter |
| `teklif_edildi` | Boş koltuk teklif edildi, cevap bekleniyor | Otomasyon |

`teklif_edildi` satırlarına elle dokunma, sistem yönetiyor.

## Yapılmaması gerekenler

- **Sheet'e şikayet, teşhis, tedavi adı yazma.** ("kanal tedavisi", "ağrı var", "implant fiyat verildi")
  Sistemin KVKK açısından güvenli olmasının tek sebebi burada sağlık verisi bulunmaması.
  Bu notları kliniğin kendi hasta programında tut.
- **Kolon başlıklarını değiştirme, kolon silme, kolonların yerini değiştirme.** Otomasyon
  başlık isimlerine göre çalışır; `Telefon`'u `Tel` yaparsan her şey durur.
- **Satır silme.** Geçmiş randevuları silme, rapor bozulur. Gerekiyorsa yıl sonunda arşivle.
- Aynı hastaya ait satırlara **aynı ID'yi verme.**

---

# BÖLÜM 2 — Senin için (sistemi işleten)

## Devreye alma sırası (ilk 2 hafta)

Hepsini aynı gün açma. Bir sorun çıktığında hangisinden geldiğini bulamazsın.

| Gün | Aç | Neden |
|---|---|---|
| 1 | **02** (24s hatırlatma) | En düşük riskli, faydası anında görünür |
| 3 | **05** (router) + **01** (karşılama) | Artık hasta cevapları işleniyor |
| 7 | **06** (bekleme) + **03** (konum + iptal doldurma) | Bekleme listesi dolmadan 03'ü açmanın anlamı yok |
| 10 | **04** (Google yorum) | Kliniğin yorum linkini test ettikten sonra |
| 14 | **08** (günlük özet) | Veri birikince anlamlı olur |
| Baştan | **07** (hata bildirimi) | Bu ilk günden açık olsun |

İlk hafta her akşam n8n → **Executions** ekranına bak. Kırmızı satır varsa aç, hangi node'da
patladığını gör.

## Haftalık bakım (10 dakika)

1. **n8n → Executions** — kırmızı olanları geç, düzelt.
2. **`Hatalar` sekmesi** — aynı hata tekrar ediyorsa yapısal bir sorun vardır.
3. **Meta → WhatsApp Manager → Insights** — numaranın **kalite derecesi**ne bak.
   Sarı/kırmızıya düşerse günlük mesaj limitin kısılır. Sebebi genelde hastaların "Engelle"
   demesidir: mesaj sıklığını azalt, bekleme listesi tekliflerini seyrekleştir.
4. **Şablon durumları** — Meta bir şablonu geriye dönük reddedebilir. `Rejected` olan varsa
   o akış sessizce çalışmaz hale gelir (07 sana haber verir).

## Aylık: kliniğe rapor

`Rapor` sekmesindeki satırları aylık topla. Kliniğe göstereceğin tablo:

| Metrik | Nereden |
|---|---|
| No-show oranı | `BugunGelmedi` ÷ (`BugunGeldi` + `BugunGelmedi`) |
| Otomasyonun doldurduğu koltuk | `DoldurulanKoltuk` toplamı |
| Kazanç | Doldurulan koltuk × klinik ortalama işlem tutarı |
| Bekleme listesi büyüklüğü | `BeklemeListesi` son değer |

Kurulumdan **önce** kliniğin 2 haftalık no-show oranını not al. Yenileme görüşmesinde
"öncesi %X, sonrası %Y" diyebilmenin tek yolu bu. Tahmini rakamla konuşma.

## Sorun giderme

| Belirti | Muhtemel sebep | Çözüm |
|---|---|---|
| Hiç mesaj gitmiyor | Token süresi doldu / şablon reddedildi | Executions'ta hatayı oku; Meta'da token ve şablon durumunu kontrol et |
| Hasta **1** yazdı, Durum değişmedi | 05 aktif değil, ya da Meta webhook'unda `messages` aboneliği yok | 05'i Active yap; Meta → Configuration → Webhooks → `messages` işaretli mi |
| Aynı hastaya iki kez hatırlatma | `Hatirlatma24` hücresi elle silinmiş | Normal davranış; silmemesi gerektiğini sekretere hatırlat |
| Mesajlar yanlış saatte gidiyor | n8n zaman dilimi | Settings → Timezone: `Europe/Istanbul` |
| Boş koltuk teklifi kimseye gitmedi | Bekleme listesi boş | `Durum` = `bekleme` olan satır var mı bak |
| Bir satıra hiç mesaj gitmiyor | Telefon veya tarih formatı bozuk | `905321112233` / `2026-09-12` / `14:30` |
| Meta hata kodu **131047** | 24 saatlik pencere kapalı, serbest metin gönderilemez | Şablon kullan (05'in cevapları hariç, onlar pencere içinde) |
| Meta hata kodu **132000** | Şablondaki değişken sayısı ile gönderilen parametre sayısı uyuşmuyor | Şablonu değiştirdiysen Code node'daki `parameters` dizisini de güncelle |
| Meta hata kodu **131030** | Numara test listesinde değil | Numarayı Meta'da allowed list'e ekle veya hesabı Live moda al |

## Ölçek büyürken

- **Her kliniğe kendi Sheet'i + kendi WhatsApp numarası.** Aynı Sheet'te iki klinik tutma;
  KVKK açısından da işletme açısından da karışır.
- Sheet 5.000 satırı geçince okuma yavaşlar. Yıl sonunda geçmiş randevuları
  `Arsiv` sekmesine taşı, `Randevular`da son 6 ay kalsın.
- 20+ klinik olursa Sheets'ten Postgres'e geçmen gerekir; workflow mantığı aynı kalır,
  sadece Sheets node'ları değişir.
