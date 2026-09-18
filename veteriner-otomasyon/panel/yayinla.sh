#!/usr/bin/env bash
# Paneli statik olarak derleyip artifact yayınına hazır "yayin/" klasörünü üretir.
#
# Artifact servisi "_" ile başlayan yolları kendine ayırdığı için Next'in
# _next klasörü "next" olarak yeniden adlandırılır. Tam bir HTML belgesi
# artifact iskeletinin içine gömülemediğinden gerçek uygulama app/index.html
# olarak yayınlanır, kök sayfa onu bir iframe ile açar.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf out .next yayin
npx next build

mkdir -p yayin
cp -r out yayin/app
cd yayin/app

mv _next next
find next -name "_*" -exec bash -c 'mv "$1" "$(dirname "$1")/$(basename "$1" | sed "s/^_//")"' _ {} \;

find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.txt" \) -print0 |
  xargs -0 sed -i -e 's|\./_next/|./next/|g' -e 's|_next/|next/|g' \
                  -e 's|_buildManifest|buildManifest|g' -e 's|_ssgManifest|ssgManifest|g'

# Eski tarayıcı polyfill paketi geçersiz UTF-8 içeriyor; modern tarayıcılar yüklemiyor
rm -f next/static/chunks/polyfills-*.js
sed -i 's|<script src="[^"]*polyfills-[^"]*" noModule=""></script>||' index.html

cd ..
cat > index.html <<'HTML'
<title>PatiKlinik Paneli</title>
<style>
  :root { color-scheme: light dark; }
  html, body { height: 100%; margin: 0; background: #f9f9f7; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) html,
    :root:not([data-theme="light"]) body { background: #0d0d0d; }
  }
  :root[data-theme="dark"] html, :root[data-theme="dark"] body { background: #0d0d0d; }
  #panel { display: block; width: 100%; height: 100%; min-height: 100vh; border: 0; }
</style>
<iframe id="panel" src="app/index.html" title="PatiKlinik veteriner klinik paneli"></iframe>
HTML

echo "hazır: $(pwd) — $(find . -type f | wc -l) dosya"
