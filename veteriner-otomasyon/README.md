# Veteriner Klinik Otomasyonu

Klinik paneli + hasta sahibi uygulaması + n8n otomasyon katmanı.

## Temel ilke

Stok, cari hesap ve LTV **ayrı sistemler değildir.** Üçü de tek bir olaydan türer:

> "18.09.2026 14:30 — Ayşe Hanım'ın kedisi Pamuk'a, Dr. Mehmet 2 ml X ilacı uyguladı, 450 TL"

Bu olay `islemler` + `islem_satirlari` olarak yazılır ve:

| Türeyen şey | Nereden |
|---|---|
| Stok düşümü | `stok_hareketleri` (negatif miktar) |
| Cari borç | `cari_hareketler` |
| Hasta geçmişi | `islemler.hasta_id` |
| LTV | `v_sahip_ltv` |
| **Kaçak raporu** | `islem_satirlari.ucretlendirildi = false` |

Miktar ve bakiye **hiçbir yerde üzerine yazılmaz** — her olay yeni satırdır (ledger).
Bu, eşzamanlı stok düşümünde veri kaybını önler ve geriye dönük izlemeyi mümkün kılar.

## Modüller

| # | Modül | Faz | Durum |
|---|---|---|---|
| M1 | Stok & Tedarik (ürün, lot, miat, mal kabul, sayım) | 1 | şema ✅ |
| M2 | Kasa & Cari (işlem, tahsilat, bakiye) | 1 | şema ✅ |
| M3 | Hasta & Sahip (hayvan profili, kilo/diyet grafiği, görsel) | 2 | şema ✅ |
| M4 | Koruyucu Hekimlik (aşı/parazit protokolü + hatırlatma) | 2 | şema ✅ |
| M5 | Randevu (muayene/aşı/tıraş/otel — tip başına süre) | 3 | şema ✅ |
| M6 | Rapor & LTV (kaçak, miat zararı, kayıp hasta) | 5 | görünümler ✅ |

## Faz planı

| Faz | İçerik | Süre | Satılabilir |
|---|---|---|---|
| 0 | Veri modeli + Supabase şeması | 3 gün | — |
| 1 | Stok + cari + hızlı çıkış + mal kabul + sayım + kaçak raporu | 2–3 hafta | ✅ |
| 2 | Hasta kartı + kilo grafiği + aşı takvimi + n8n hatırlatma | 2–3 hafta | ✅ |
| 3 | Randevu + kasa + e-fatura | 2–3 hafta | ✅ |
| 4 | Hasta sahibi app (PWA → mobil) | 3–4 hafta | upsell |
| 5 | LTV & yönetim raporları | 1–2 hafta | ✅ |

## Mimari

```
Klinik Paneli (Next.js / Vercel) ─┐
Hasta Sahibi App (PWA)           ─┼─→ Supabase (Postgres)  ← tek doğru kaynak
n8n (cron + webhook + WhatsApp)  ─┘
```

**n8n veri katmanı değildir.** Görevi:
- `hatirlatmalar` tablosundaki bekleyen kayıtları WhatsApp'tan gönderir
- `v_kritik_stok` / `v_miat_takibi` üzerinden alarm üretir
- Günlük özet raporu gönderir (dental paketindeki 08 mantığı)
- Hata bildirimi (dental paketindeki 07 mantığı)

CRUD işleri panelde, Postgres'e doğrudan yazılır.

## Dizin

```
veteriner-otomasyon/
├── db/
│   └── 001_sema.sql        # Faz 0 — tablolar, enum'lar, görünümler
├── workflows/              # n8n workflow JSON'ları (gelecek)
└── panel/                  # Next.js klinik paneli (gelecek)
```

## Kurulum (Faz 0)

```bash
# Supabase projesinde SQL Editor'da çalıştır
psql "$DATABASE_URL" -f db/001_sema.sql
```

Sonraki adım: RLS politikaları (`002_rls.sql`) ve demo veri (`003_demo.sql`).

---

## Panel (demo)

`panel/` — Next.js 15 klinik paneli. Faz 1 ekranları çalışır durumda:

| Ekran | Yol | Ne gösteriyor |
|---|---|---|
| Bugün | `/` | Kaçak tutarı, kritik stok, miat, günlük ciro |
| Hızlı çıkış | `/cikis` | Muayenede 2 dokunuşla stok düşümü + ücretlendir/ücretsiz |
| Stok | `/stok` | Ürün + lot kırılımı, kritik filtresi |
| Kaçak raporu | `/kacak` | Faturaya yansımayan kullanım — ürün ve personel kırılımı |
| Miat takibi | `/miat` | Geçen/yaklaşan lotlar, risk ve zarar tutarı |
| Mal kabul | `/mal-kabul` | İrsaliye girişi, lot + miat |
| Hastalar | `/hastalar` | Hayvan profili, kilo grafiği, koruyucu hekimlik, geçmiş |
| Aşı takvimi | `/takvim` | Kaçırılan ve yaklaşan uygulamalar + hatırlatma |
| Cari & LTV | `/musteriler` | Yaşam boyu değer, kayıp müşteri listesi |

**Demo modu:** veri `lib/veri.ts` içinde deterministik üretilir ve tarayıcıda (localStorage)
tutulur. Harici veritabanı bağımlılığı yoktur — klinikte internet olmasa da açılır.
Gerçek kurulumda `lib/store.tsx` Supabase istemcisiyle değiştirilir; `db/001_sema.sql`
aynı veri modelini Postgres'te karşılar.

```bash
cd panel && npm install && npm run dev
```
