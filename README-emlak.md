# Şenyüz Estate — scroll ile oynayan video arka planlı gayrimenkul sitesi

Statik site. Derleme adımı yok: `index.html` + `assets/`.

## Öne çıkan özellik: scroll'a bağlı video

Hero bölümü 420vh yüksekliğinde bir "scrollytelling" alanı. Sayfa kaydırıldıkça
video **oynatılmaz, sürülür**: kaydırma ilerlemesi doğrudan `video.currentTime`
değerine eşlenir. Geri kaydırınca video geri sarar.

- `assets/js/main.js` içinde ilerleme → hedef zaman eşlemesi yapılır, `requestAnimationFrame`
  döngüsünde lerp ile yumuşatılır; böylece kaydırma sıçramaları akıcı görünür.
- Video **her koşulda sessizdir**: kaynak dosyadan ses izi tamamen çıkarıldı, ayrıca
  `muted` özniteliği + JS'te `volume = 0` ve `volumechange` koruması var.
- Fare hareketi hero'da hafif parallax ve imleci takip eden ışık huzmesi üretir;
  kartlarda 3B eğim verir.
- `prefers-reduced-motion: reduce` seçili kullanıcıda yumuşatma ve parallax kapanır,
  video yalnızca kaydırmayla adım adım ilerler.

## Video hazırlığı

Kaynak video scrub için yeniden kodlandı (ffmpeg):

```
ffmpeg -i kaynak.mp4 -an \
  -c:v libx264 -preset medium -crf 24 -g 6 -keyint_min 6 -sc_threshold 0 \
  -vf "scale=1600:-2" -pix_fmt yuv420p -movflags +faststart \
  assets/video/villa.mp4
```

- `-an`: ses izi tamamen silinir.
- `-g 6`: her 6 karede bir keyframe → geri/ileri sarma anında kare bulur, scrub akıcı olur.
- `-movflags +faststart`: metadata başa alınır, video anında oynatılabilir.

Portföy kartlarındaki görseller ve `assets/video/poster.jpg` aynı videodan alınan karelerdir.

## Yerelde çalıştırma

`index.html` dosyasına çift tıklamayın: `file://` üzerinden video sarma çalışmaz.
Ayrıca sunucunun **Range (206)** isteklerini desteklemesi gerekir —
`python3 -m http.server` bunu desteklemez, video ilk karede takılır.

Depoda hazır gelen sunucuyu kullanın (kurulum gerektirmez):

```
python3 sunucu.py
# http://localhost:8000
```

Farklı port için: `python3 sunucu.py 3000`

Node tarafını tercih ederseniz `npx serve .` de Range destekler.

## Yayın

Vercel'de ek ayar gerekmez; depo kökü statik olarak yayınlanır. `vercel.json`
yalnızca önbellek başlıklarını ayarlar.
