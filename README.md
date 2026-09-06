# LTX Video Stüdyo

Fotoğraftan video üreten basit bir web arayüzü. LTX API'sinin
`image-to-video` uç noktasını kullanır.

## Kurulum (tek seferlik)

1. Bu depoyu Vercel'e bağlayıp yayınlayın.
2. Vercel panelinde **Settings → Environment Variables** bölümüne gidin.
3. `LTX_API_KEY` adında bir değişken ekleyin, değerine LTX API anahtarınızı yazın.
   Production, Preview ve Development ortamlarının üçünü de işaretleyin.
4. **Deployments → Redeploy** ile projeyi yeniden yayınlayın.

Anahtar yalnızca sunucu tarafında okunur; tarayıcıya hiçbir zaman gönderilmez.
Sayfa açıldığında `/api/health` uç noktası anahtarın kurulu olup olmadığını
söyler — anahtarın kendisini döndürmez.

## Kullanım

Sayfayı açın, fotoğrafı sürükleyin, videoda ne olmasını istediğinizi yazın,
"Videoyu üret" deyin. İş tamamlanınca video sayfada oynar ve indirilebilir.

## Yapı

- `app/page.js` — arayüz. Fotoğrafı tarayıcıda küçültüp base64 data URI'ye
  çevirir (Vercel'in ~4.5 MB istek gövdesi sınırı için).
- `app/api/generate/route.js` — LTX'e iş gönderir, iş kimliğini döndürür.
- `app/api/status/route.js` — iş durumunu sorgular.
- `app/api/health/route.js` — anahtar kurulu mu, onu bildirir.
- `app/api/ltx.js` — ortak yardımcılar ve izin verilen iş türleri listesi.
