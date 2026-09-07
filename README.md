# AUREA — Dental Atelier

Butik bir diş kliniği için tasarlanmış, online randevu sistemi içeren premium tek sayfa
deneyimi. Next.js App Router + TypeScript + Tailwind v4 ile yazıldı; Vercel'e olduğu gibi
dağıtılabilir.

## Öne çıkanlar

- **Randevu sihirbazı** (`components/Booking.tsx`) — tedavi → hekim → tarih/saat → bilgiler
  akışı, adım adım doğrulama ve randevu kodu üreten onay ekranı.
- **Gerçek uygunluk verisi** — saatler `GET /api/availability` üzerinden gelir; çalışma
  saatleri, pazar tatili, geçmiş saatler ve dolu slotlar sunucuda hesaplanır. Hero'daki
  "ilk uygun randevu" rozeti de aynı uçtan beslenir.
- **Randevu kaydı** — `POST /api/appointments` sunucu tarafında yeniden doğrular, çakışmayı
  engeller ve `AUR-XXX000` biçiminde kod döner.
- **Awwwards tonunda arayüz** — özel imleç, film grenli doku, giriş yükleyicisi, maskeli
  satır animasyonları, manyetik butonlar, yapışkan süreç bölümü, sürüklenebilir atölye
  galerisi ve bölüm rengine göre renk değiştiren navigasyon.
- **Erişilebilirlik & performans** — `prefers-reduced-motion` desteği, klavyeyle
  kullanılabilir bileşenler, kendi sunucumuzda barındırılan yazı tipleri (dış istek yok),
  `Dentist` şeması ile yapısal veri.

## Geliştirme

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # üretim derlemesi
```

## Yapı

```
app/
  layout.tsx            kök düzen, yükleyici, imleç, grain
  page.tsx              bölümlerin kompozisyonu + JSON-LD
  globals.css           tasarım sistemi (renk, tipografi, hareket)
  fonts.css             yerel @font-face tanımları
  api/availability      uygun saatler
  api/appointments      randevu oluşturma
components/             bölümler ve etkileşim primitifleri
lib/clinic.ts           klinik içeriği (tedaviler, hekimler, SSS…)
lib/booking.ts          çalışma saatleri, slot üretimi, doğrulama, kayıt
```

## İçeriği güncelleme

Metinlerin tamamı `lib/clinic.ts` içindedir: klinik bilgileri, tedaviler (süre ve başlangıç
fiyatı dahil), hekimler, süreç adımları, hasta yorumları ve SSS. Bileşenlere dokunmadan
düzenlenebilir.

## Üretime alırken

Randevular şu an süreç belleğinde tutulur (`lib/booking.ts` içindeki `store`); demo ve
önizleme için yeterlidir, ancak sunucu her yeniden başladığında sıfırlanır. Canlıda kalıcı
bir veritabanına (ör. Postgres / Supabase) bağlanması ve onay e-postası / SMS entegrasyonunun
eklenmesi gerekir. `getSlots` ve `createAppointment` fonksiyonları bu geçiş için tek
dokunulacak yer olacak şekilde ayrılmıştır.
