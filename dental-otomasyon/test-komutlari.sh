#!/usr/bin/env bash
# Kurulum sonrası duman testleri. N8N adresini kendi adresinle değiştir.
set -euo pipefail
N8N="${N8N:-https://SENIN-N8N-ADRESIN}"

echo "1) Yeni lead -> anında karşılama"
curl -sS -X POST "$N8N/webhook/dental-lead" \
  -H 'Content-Type: application/json' \
  -d '{"ad":"Test Hasta","telefon":"0532 111 22 33","kaynak":"test"}'
echo

echo "2) İptal oldu -> bekleme listesine boş koltuk teklifi"
curl -sS -X POST "$N8N/webhook/dental-iptal" \
  -H 'Content-Type: application/json' \
  -d '{"tarih":"2026-09-08","saat":"16:00"}'
echo

echo "3) Meta webhook doğrulaması (Meta'nın yaptığı GET'in aynısı)"
curl -sS "$N8N/webhook/dental-wa?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=DOGRULAMA_TOKENIN"
echo

echo "4) Hasta '1' yazdı simülasyonu (gerçek Meta payload formatı)"
curl -sS -X POST "$N8N/webhook/dental-wa" \
  -H 'Content-Type: application/json' \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"905321112233","type":"text","text":{"body":"1"}}]}}]}]}'
echo

echo "5) Bekleme listesine kayıt"
curl -sS -X POST "$N8N/webhook/dental-bekleme" \
  -H 'Content-Type: application/json' \
  -d '{"ad":"Bekleyen Test","telefon":"0533 444 55 66","kaynak":"test"}'
echo

echo "6) Hasta '2' yazdı simülasyonu (iptal -> koltuk doldurma tetiklenir)"
curl -sS -X POST "$N8N/webhook/dental-wa" \
  -H 'Content-Type: application/json' \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"905321112233","type":"text","text":{"body":"2"}}]}}]}]}'
echo
