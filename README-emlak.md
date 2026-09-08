# Şenyüz Estate

Statik site. Derleme adımı yok: `index.html` + `assets/`.

## Film

Açılış, kaydırmayla sürülen bir film. Video **oynatılmaz, sarılır**: kaydırma
ilerlemesi doğrudan `video.currentTime` değerine eşlenir, geri kaydırınca
görüntü geri sarar.

Ekranda hiçbir oynatıcı arayüzü yoktur — ilerleme çubuğu, yüzde, "kaydırın"
ipucu ya da sessizlik rozeti yok. Görüntü, ilerlemenin **%82'sine kadar
tamamen çıplak** kalır; perde ve olta cümlesi yalnızca son karelerde belirir
(`FILM_SONU`, `OLTA_BAS`, `OLTA_BIT` sabitleri `assets/js/main.js` başında).

Video her koşulda sessizdir: kaynak dosyada ses izi yok, `muted` açık ve
`volumechange` dinleyicisi sesi sıfırda kilitliyor.

`prefers-reduced-motion: reduce` seçili kullanıcıda yumuşatma ve fare kayması
kapanır; film yalnızca kaydırmayla adım adım ilerler.

## Video hazırlığı

Kaynak video sarma için yeniden kodlandı (ffmpeg):

```
ffmpeg -i kaynak.mp4 -an \
  -c:v libx264 -preset medium -crf 24 -g 6 -keyint_min 6 -sc_threshold 0 \
  -vf "scale=1600:-2" -pix_fmt yuv420p -movflags +faststart \
  assets/video/villa.mp4
```

- `-an`: ses izi tamamen silinir.
- `-g 6`: her 6 karede bir keyframe → sarma anında kare bulur, akıcı olur.
- `-movflags +faststart`: metadata başa alınır.

`assets/img/mulk-*.jpg` ve `assets/video/poster.jpg` aynı filmden alınan
karelerdir; bölümdeki zaman kodları bu karelerin gerçek saniyeleridir.

## Tipografi

Archivo (değişken: genişlik + kalınlık) ve IBM Plex Mono, `assets/fonts/`
altında kendi sunucumuzdan servis edilir — latin + latin-ext alt kümeleri,
Türkçe glifler dahil. Dışarıya hiçbir istek gitmez.

## Yerelde çalıştırma

`index.html` dosyasına çift tıklamayın: `file://` üzerinden video sarma
çalışmaz. Sunucunun **Range (206)** isteklerini desteklemesi de gerekir —
`python3 -m http.server` desteklemez, film ilk karede takılır.

Depoda hazır gelen sunucuyu kullanın (kurulum gerektirmez):

```
python3 sunucu.py
# http://localhost:8000
```

Farklı port için: `python3 sunucu.py 3000`. Node tarafında `npx serve .` de olur.

## Yayın

Vercel'de ek ayar gerekmez; depo kökü statik olarak yayınlanır. `vercel.json`
yalnızca önbellek başlıklarını ayarlar.
