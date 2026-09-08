#!/usr/bin/env bash
# Yeni klinik kurulumunu tek komutta yapar.
#
#   cp klinik.ornek.json klinik.json     # klinik bilgilerini doldur
#   export META_TOKEN=...  WABA_ID=...  N8N_URL=...  N8N_API_KEY=...
#   export WHATSAPP_TOKEN=...            # opsiyonel, credential'ı otomatik kurar
#   export GOOGLE_CREDENTIAL_ID=...      # opsiyonel, n8n'de bir kez oluşturduğun Sheets credential'ı
#   ./kurulum.sh klinik.json
#
# Token'lar bilerek ortam değişkeninde tutuluyor, dosyaya yazılmıyor.
set -euo pipefail
CFG="${1:-klinik.json}"
cd "$(dirname "$0")"

echo "═══ 1/4  Mantık testi (kurulum bozuksa buradan anlarız)"
node test/otomasyon-testi.mjs > /dev/null && echo "     tüm kontroller geçti"

echo
echo "═══ 2/4  Klinik ayarları workflow'lara işleniyor"
python3 kur.py "$CFG"

echo
echo "═══ 3/4  WhatsApp şablonları Meta'ya yükleniyor"
if [ -n "${META_TOKEN:-}" ] && [ -n "${WABA_ID:-}" ]; then
  node araclar/meta-sablon-yukle.mjs
else
  echo "     META_TOKEN / WABA_ID yok, atlandı."
  echo "     Şablonlar WABA başına bir kez yüklenir; daha önce yüklediysen bu normal."
fi

echo
echo "═══ 4/4  Workflow'lar n8n'e yükleniyor"
node araclar/n8n-yukle.mjs "${2:-}"

echo
echo "═══ Bitti. Kalan işler için: TEST.md aşama 2 ve 3"
