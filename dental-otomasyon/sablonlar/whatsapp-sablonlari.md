# WhatsApp Mesaj Şablonları (Meta onayı için)

Meta Business Suite → WhatsApp Manager → **Message Templates** → Create template.

Hepsi için:
- **Kategori: Utility** (Marketing DEĞİL. Utility hem ucuz hem hızlı onaylanır.)
- **Dil: Turkish (tr)**
- İçinde "indirim, kampanya, satın al, fırsat" gibi kelime **olmasın** → Marketing'e düşer / reddedilir.
- Değişken sırası aşağıdakiyle **birebir aynı** olmalı, workflow'lar bu sıraya göre parametre gönderiyor.

---

## 1. `dental_hosgeldin_randevu_teklif`
Kullanan: Workflow 01

```
Merhaba {{1}}, randevu talebiniz alındı. {{2}} tarihinde saat {{3}} veya {{4}} ön muayene için uygun mu? Onay için 1 yazmanız yeterli.
```
| Değişken | Örnek |
|---|---|
| {{1}} | Mehmet Yılmaz |
| {{2}} | 09.09.2026 |
| {{3}} | 11:00 |
| {{4}} | 15:00 |

---

## 2. `dental_24h_hatirlatma`
Kullanan: Workflow 02 (her gün 09:00)

```
Merhaba {{1}}, {{2}} tarihinde saat {{3}} randevunuz var. Onaylıyor musunuz? 1: Evet, 2: İptal / Değişiklik
```
| Değişken | Örnek |
|---|---|
| {{1}} | Mehmet Yılmaz |
| {{2}} | 09.09.2026 |
| {{3}} | 11:00 |

---

## 3. `dental_2saat_konum`
Kullanan: Workflow 03 (randevuya ~2 saat kala)

```
Merhaba {{1}}, saat {{2}} randevunuz için sizi bekliyoruz. Klinik konumumuz: {{3}}
```
| Değişken | Örnek |
|---|---|
| {{1}} | Mehmet Yılmaz |
| {{2}} | 12:00 |
| {{3}} | https://maps.app.goo.gl/... |

> Not: Meta metin içindeki linke bazen takılıyor. Takılırsa {{3}}'ü çıkarıp konumu **URL butonu** olarak ekle,
> workflow'daki 3. parametreyi de sil.

---

## 4. `dental_iptal_doldur`
Kullanan: Workflow 03 (iptal olunca bekleme listesine)

```
Merhaba {{1}}, {{2}} günü saat {{3}} için bir boşluk açıldı. Gelmek ister misiniz? Onay için 1 yazın, ilk yazan alır.
```
| Değişken | Örnek |
|---|---|
| {{1}} | Ayşe Demir |
| {{2}} | 08.09.2026 |
| {{3}} | 16:00 |

---

## 5. `dental_yorum_istek`
Kullanan: Workflow 04 (ziyaretten 1 gün sonra 12:00)

```
Merhaba {{1}}, bizi tercih ettiğiniz için teşekkür ederiz. Memnun kaldıysanız 1 dakikanızı ayırıp Google değerlendirmesi bırakır mısınız? {{2}}
```
| Değişken | Örnek |
|---|---|
| {{1}} | Mehmet Yılmaz |
| {{2}} | https://g.page/r/.../review |

---

## Hastanın yazdığı cevaplar (şablon gerekmez)
Hasta bize mesaj attığı anda 24 saatlik **customer service window** açılır; o pencerede serbest
metin gönderebilirsin. Workflow 05'in verdiği tüm cevaplar (onay, iptal, "koltuk doldu", insana devir)
bu yüzden şablonsuz düz mesaj olarak gider — onaylatman gerekmez.

---

# Ek şablonlar (Workflow 06 / 07 / 08)

## 6. `dental_bekleme_kayit`
Kullanan: Workflow 06 — biri bekleme listesine kaydolduğunda.

```
Merhaba {{1}}, bekleme listemize kaydınız alındı. Uygun bir randevu boşluğu açıldığında size buradan haber vereceğiz.
```
| Değişken | Örnek |
|---|---|
| {{1}} | Ayşe Demir |

---

## 7. `dental_sistem_uyari`
Kullanan: Workflow 07 — bir workflow patladığında **sana** (kliniğe değil) gider.

```
Sistem uyarısı: {{1}} akışı hata verdi. Node: {{2}}. Hata: {{3}}
```
| Değişken | Örnek |
|---|---|
| {{1}} | Dental 02 - 24 Saat Önce Hatırlatma |
| {{2}} | 24s Hatırlatma Gönder |
| {{3}} | Request failed with status code 400 |

> Bu şablonu onaylatmak istemezsen Workflow 07'deki WhatsApp node'unu silip yerine n8n'in
> **Send Email** node'unu koyabilirsin; hata kaydı zaten `Hatalar` sekmesine yazılıyor.

---

## 8. `dental_gunluk_ozet`
Kullanan: Workflow 08 — her akşam 19:00, klinik sahibine/sekretere.

```
{{1}} özeti: Yarın {{2}} randevu var ({{3}} onaylı, {{4}} onay bekliyor). Bugün {{5}} iptal oldu, {{6}} boş koltuk dolduruldu. Bekleme listesinde {{7}} kişi var.
```
| Değişken | Örnek |
|---|---|
| {{1}} | 08.09.2026 |
| {{2}} | 12 |
| {{3}} | 9 |
| {{4}} | 3 |
| {{5}} | 2 |
| {{6}} | 1 |
| {{7}} | 14 |

> Bu mesaj kliniğin her gün otomasyonun işini görmesini sağlıyor — abonelik yenilemesinde
> en güçlü argüman bu. `Rapor` sekmesinde aynı veriler tarih tarih birikiyor.
