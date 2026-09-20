#!/usr/bin/env python3
"""
meta_ad_intel.py
================
Meta (Instagram + Facebook) Reklam Kutuphanesi'nden uygulama reklamlarini ceker ve
"hangi uygulama gercekten para kazaniyor" sorusunu reklam OMRU uzerinden cevaplar.

Temel mantik:
  Bir reklam pahalidir. Reklamveren zarar ediyorsa reklami 3-10 gun icinde kapatir.
  Bir reklam 30+ gundur HALA YAYINDA ise, o reklam kendini amorti ediyor demektir.
  Ayni sayfada 30+ gunluk AKTIF reklam sayisi arttikca, is modeli o kadar saglamdir.

Kullanim:
  export APIFY_TOKEN=apify_api_xxx
  python3 meta_ad_intel.py --probe                      # 20 reklamlik ucuz test, alan adlarini gosterir
  python3 meta_ad_intel.py --budget 2.0 --per-query 400 # gercek tarama
  python3 meta_ad_intel.py --analyze-only out/raw.json  # sifir maliyet, mevcut veriyi yeniden puanla
"""

import argparse
import json
import os
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone, date

try:
    import requests
except ImportError:
    sys.exit("Once kurun:  pip install requests")

API = "https://api.apify.com/v2"

# ---------------------------------------------------------------------------
# Aktor secenekleri. Fiyatlar Apify Store'dan dogrulanmalidir (--budget zaten korur).
# ---------------------------------------------------------------------------
ACTORS = {
    # Kullanicinin sectigi aktor. Slug yerine aktor ID'si kullaniliyor (daha guvenilir).
    "facebook-ads-scraper": {
        "id": "JJghSZmShuco4j9gJ",
        "usd_per_1k": 1.50,
        "note": "apify/facebook-ads-scraper — resmi. PAHALI: $2 ile ~1.300 reklam.",
    },
    "blackfalcondata": {
        "id": "blackfalcondata~facebook-ads-library-scraper",
        "usd_per_1k": 0.05,
        "note": "En ucuz. Ilk tercih.",
    },
    "curious_coder": {
        "id": "curious_coder~facebook-ads-library-scraper",
        "usd_per_1k": 1.00,
        "note": "Klasik, genis alan seti.",
    },
    "memo23": {
        "id": "memo23~facebook-ads-library-scraper-cheerio",
        "usd_per_1k": 0.75,
        "note": "AB erisim (reach) verisi de dondurur.",
    },
    "apify": {
        "id": "apify~facebook-page-ads",
        "usd_per_1k": 1.70,
        "note": "Resmi aktor, sayfa bazli.",
    },
}

AD_LIBRARY = (
    "https://www.facebook.com/ads/library/"
    "?active_status={status}&ad_type=all&country={country}"
    "&q={query}&search_type=keyword_unordered&media_type=all"
)

# Bir reklamin UYGULAMA reklami oldugunu ele veren izler.
APP_STORE_PAT = re.compile(
    r"(apps\.apple\.com|itunes\.apple\.com|play\.google\.com/store/apps"
    r"|app\.adjust\.com|appsflyer|apps?\.link|onelink\.me|branch\.io|go\.onelink)",
    re.I,
)
APP_WORD_PAT = re.compile(
    r"\b(download the app|app store|google play|uygulamayi indir|indir|"
    r"free trial|start your free|subscribe|premium|unlock)\b",
    re.I,
)

# ---------------------------------------------------------------------------
# Alan adi normalizasyonu: her aktor farkli isim kullaniyor, hepsini tek sozluge indir.
# ---------------------------------------------------------------------------
FIELD_MAP = {
    "start": ["ad_delivery_start_time", "startDate", "start_date", "startDateFormatted",
              "ad_creation_time", "adDeliveryStartTime", "created_time"],
    "stop": ["ad_delivery_stop_time", "endDate", "end_date", "stopDate",
             "adDeliveryStopTime", "ad_delivery_end_time"],
    "active": ["is_active", "isActive", "active", "status", "ad_status"],
    "page_name": ["page_name", "pageName", "advertiser_name", "advertiserName", "page"],
    "page_id": ["page_id", "pageId", "advertiser_id", "pageID"],
    "ad_id": ["ad_archive_id", "adArchiveID", "id", "ad_id", "adId", "archive_id"],
    "link": ["link_url", "linkUrl", "cta_link", "url", "ad_snapshot_url", "snapshot_url"],
    "body": ["ad_creative_bodies", "body", "adText", "ad_creative_body", "text",
             "caption", "bodies"],
    "platforms": ["publisher_platforms", "publisherPlatform", "platforms",
                  "publisher_platform"],
}


def dig(obj, path_keys):
    """Ic ice sozluklerde de ara; ilk bos olmayan degeri dondur."""
    for key in path_keys:
        if isinstance(obj, dict):
            if key in obj and obj[key] not in (None, "", [], {}):
                return obj[key]
            for v in obj.values():
                if isinstance(v, dict):
                    got = dig(v, [key])
                    if got not in (None, "", [], {}):
                        return got
    return None


def flatten_text(val):
    if val is None:
        return ""
    if isinstance(val, str):
        return val
    if isinstance(val, list):
        return " ".join(flatten_text(v) for v in val)
    if isinstance(val, dict):
        return " ".join(flatten_text(v) for v in val.values())
    return str(val)


def parse_date(val):
    if val in (None, "", 0):
        return None
    if isinstance(val, (int, float)):
        try:
            return datetime.fromtimestamp(float(val), tz=timezone.utc).date()
        except (ValueError, OSError, OverflowError):
            return None
    s = str(val).strip()
    if s.isdigit() and len(s) >= 10:
        try:
            return datetime.fromtimestamp(int(s[:10]), tz=timezone.utc).date()
        except (ValueError, OSError, OverflowError):
            return None
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S",
                "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%b %d, %Y", "%d %b %Y"):
        try:
            d = datetime.strptime(s.replace("Z", "+0000"), fmt)
            return d.date()
        except ValueError:
            continue
    return None


def truthy_active(val):
    if val is None:
        return None
    if isinstance(val, bool):
        return val
    s = str(val).strip().lower()
    if s in ("true", "1", "active", "yes"):
        return True
    if s in ("false", "0", "inactive", "no", "expired", "finished"):
        return False
    return None


def normalize(raw):
    """Ham aktor kaydini standart bir reklam sozlugune cevir."""
    start = parse_date(dig(raw, FIELD_MAP["start"]))
    stop = parse_date(dig(raw, FIELD_MAP["stop"]))
    active = truthy_active(dig(raw, FIELD_MAP["active"]))
    today = date.today()

    # Aktiflik alani yoksa bitis tarihinden turet.
    if active is None:
        active = stop is None or stop >= today

    # "Hala yayinda" diyen ama bitis tarihi gecmis kayitlari duzelt.
    if stop is not None and stop < today:
        active = False

    effective_end = today if active else (stop or today)
    days = (effective_end - start).days if start else None

    body = flatten_text(dig(raw, FIELD_MAP["body"]))
    link = flatten_text(dig(raw, FIELD_MAP["link"]))
    platforms = flatten_text(dig(raw, FIELD_MAP["platforms"]))

    return {
        "ad_id": str(dig(raw, FIELD_MAP["ad_id"]) or ""),
        "page_name": flatten_text(dig(raw, FIELD_MAP["page_name"])) or "(bilinmiyor)",
        "page_id": str(dig(raw, FIELD_MAP["page_id"]) or ""),
        "start": start.isoformat() if start else None,
        "stop": stop.isoformat() if stop else None,
        "is_active": bool(active),
        "days_running": days,
        "link": link[:300],
        "body": body[:600],
        "platforms": platforms[:120],
        "is_app_ad": bool(APP_STORE_PAT.search(link) or APP_STORE_PAT.search(body)),
        "app_ish": bool(APP_WORD_PAT.search(body)),
        "on_instagram": "instagram" in platforms.lower(),
    }


# ---------------------------------------------------------------------------
# Apify calistirma
# ---------------------------------------------------------------------------
def run_actor(token, actor_id, run_input, timeout_s=900):
    """Aktoru calistir, bitmesini bekle, (kayitlar, gercek_usd_maliyet) dondur."""
    r = requests.post(
        f"{API}/acts/{actor_id}/runs",
        params={"token": token},
        json=run_input,
        timeout=60,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Aktor baslatilamadi ({r.status_code}): {r.text[:400]}")
    run = r.json()["data"]
    run_id = run["id"]
    print(f"    run={run_id} baslatildi, bekleniyor...", flush=True)

    deadline = time.time() + timeout_s
    while time.time() < deadline:
        time.sleep(6)
        s = requests.get(f"{API}/actor-runs/{run_id}", params={"token": token}, timeout=60)
        s.raise_for_status()
        run = s.json()["data"]
        if run["status"] in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            break
    else:
        requests.post(f"{API}/actor-runs/{run_id}/abort", params={"token": token}, timeout=60)
        run["status"] = "TIMED-OUT (abort edildi)"

    cost = float(run.get("usageTotalUsd") or 0.0)
    items = []
    ds_id = run.get("defaultDatasetId")
    if ds_id:
        d = requests.get(
            f"{API}/datasets/{ds_id}/items",
            params={"token": token, "format": "json", "clean": "true"},
            timeout=180,
        )
        if d.ok:
            try:
                items = d.json()
            except ValueError:
                items = []
    print(f"    durum={run['status']}  kayit={len(items)}  maliyet=${cost:.4f}", flush=True)
    return items, cost


def build_input(actor_key, url, count):
    """Aktorlerin farkli girdi semalarini tek cagri ile karsila (fazla alan yok sayilir)."""
    return {
        "urls": [{"url": url, "method": "GET"}],
        "startUrls": [{"url": url}],
        "url": url,
        "count": count,
        "maxItems": count,
        "maxResults": count,
        "resultsLimit": count,
        "limit": count,
        "scrapePageAds": False,
        "activeStatus": "all",
    }


# ---------------------------------------------------------------------------
# Puanlama
# ---------------------------------------------------------------------------
def score_advertisers(ads, min_ads=2):
    by_page = defaultdict(list)
    for a in ads:
        if a["page_name"] and a["page_name"] != "(bilinmiyor)":
            by_page[(a["page_name"], a["page_id"])].append(a)

    today = date.today()
    rows = []
    for (name, pid), group in by_page.items():
        if len(group) < min_ads:
            continue
        dated = [a for a in group if a["days_running"] is not None]
        if not dated:
            continue

        active = [a for a in dated if a["is_active"]]
        dead = [a for a in dated if not a["is_active"]]

        # 30+ gundur HALA yayinda olan reklamlar: kanitlanmis kazananlar.
        proven = [a for a in active if a["days_running"] >= 30]
        # 90+ gun: evergreen, cok guclu sinyal.
        evergreen = [a for a in active if a["days_running"] >= 90]
        # 7 gunden once kapatilanlar: basarisiz kreatifler.
        quick_kills = [a for a in dead if a["days_running"] <= 7]

        # Test edilmeye firsat bulmus (>=21 gunluk) reklamlarda hayatta kalma orani.
        mature = [a for a in dated
                  if a["days_running"] is not None
                  and (a["is_active"] or a["days_running"] >= 21)]
        survivors = [a for a in mature if a["days_running"] >= 21]
        survival = len(survivors) / len(mature) if mature else 0.0

        starts = sorted(a["start"] for a in dated if a["start"])
        months = {s[:7] for s in starts}
        newest = max(starts) if starts else None
        oldest = min(starts) if starts else None
        days_since_launch = (today - parse_date(newest)).days if newest else 999

        longest = max((a["days_running"] for a in active), default=0)
        app_ads = [a for a in group if a["is_app_ad"]]
        ig_ads = [a for a in group if a["on_instagram"]]

        # --- Skor ---
        # Kanitlanmis uzun omurlu aktif reklam sayisi en agirlikli sinyal.
        score = 0.0
        score += min(len(proven), 25) * 3.0          # 30+ gun aktif reklam adedi
        score += min(len(evergreen), 15) * 4.0       # 90+ gun aktif reklam adedi
        score += min(longest, 365) / 365 * 20        # en uzun omurlu aktif reklam
        score += survival * 15                       # kreatif isabet orani
        score += min(len(months), 12) * 1.5          # surekli yeni kreatif basiyor mu
        score += 8 if days_since_launch <= 14 else 0 # son 2 haftada da basmis: hala olcekliyor
        score += 6 if app_ads else 0                 # net uygulama reklami
        score -= min(len(quick_kills), 20) * 0.4     # cok sayida hizli kapatma: cop atiyor

        # Soguma cezasi: soru "SU AN kim para kazaniyor". Hic aktif reklami olmayan
        # veya aylardir yeni reklam basmayan reklamveren, gecmisi ne olursa olsun geri duser.
        if not active:
            durum = "OLU (aktif reklam yok)"
            score *= 0.15
        elif days_since_launch > 90:
            durum = "SOGUYOR (90+ gundur yeni kreatif yok)"
            score *= 0.6
        elif len(proven) == 0:
            durum = "TEST ASAMASI (henuz 30 gun gecen reklami yok)"
        elif evergreen:
            durum = "OLCEKLIYOR (90+ gunluk aktif reklam)"
        else:
            durum = "KAZANIYOR (30+ gunluk aktif reklam)"

        rows.append({
            "reklamveren": name,
            "page_id": pid,
            "skor": round(score, 1),
            "durum": durum,
            "toplam_reklam": len(group),
            "aktif_reklam": len(active),
            "kanitlanmis_30g+": len(proven),
            "evergreen_90g+": len(evergreen),
            "en_uzun_aktif_gun": longest,
            "hayatta_kalma_%": round(survival * 100),
            "hizli_kapatilan_7g-": len(quick_kills),
            "farkli_ay_sayisi": len(months),
            "ilk_reklam": oldest,
            "son_reklam": newest,
            "son_reklamdan_gecen_gun": days_since_launch,
            "uygulama_reklami": len(app_ads),
            "instagram_reklami": len(ig_ads),
            "ornek_link": next((a["link"] for a in group if a["link"]), ""),
            "ornek_metin": next((a["body"] for a in group if a["body"]), "")[:220],
        })

    rows.sort(key=lambda r: r["skor"], reverse=True)
    return rows


def write_csv(rows, path):
    import csv
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


def print_report(rows, top=25):
    if not rows:
        print("\nPuanlanacak reklamveren bulunamadi. Sorgulari genislet veya --per-query artir.")
        return
    print("\n" + "=" * 100)
    print("EN GUCLU SINYAL VEREN REKLAMVERENLER  (uzun sure yayinda kalan aktif reklam = para kazaniyor)")
    print("=" * 110)
    hdr = (f"{'#':>3} {'SKOR':>6} {'REKLAMVEREN':<28} {'AKTIF':>6} {'30G+':>5} {'90G+':>5} "
           f"{'ENUZUN':>7}  {'DURUM'}")
    print(hdr)
    print("-" * 110)
    for i, r in enumerate(rows[:top], 1):
        print(f"{i:>3} {r['skor']:>6} {r['reklamveren'][:28]:<28} "
              f"{r['aktif_reklam']:>6} {r['kanitlanmis_30g+']:>5} {r['evergreen_90g+']:>5} "
              f"{r['en_uzun_aktif_gun']:>7}  {r['durum']}")
    print("-" * 100)
    print("\nEN IYI 5 - DETAY\n")
    for i, r in enumerate(rows[:5], 1):
        print(f"{i}. {r['reklamveren']}  (skor {r['skor']})  [{r['durum']}]")
        print(f"   Ilk reklam: {r['ilk_reklam']}  |  Son reklam: {r['son_reklam']} "
              f"({r['son_reklamdan_gecen_gun']} gun once)")
        print(f"   {r['aktif_reklam']} aktif reklam, bunlarin {r['kanitlanmis_30g+']} tanesi 30+ gundur yayinda, "
              f"en uzunu {r['en_uzun_aktif_gun']} gun.")
        print(f"   Kreatif isabet orani: %{r['hayatta_kalma_%']}  |  7 gun icinde kapatilan: {r['hizli_kapatilan_7g-']}")
        print(f"   Link: {r['ornek_link'][:110]}")
        print(f"   Metin: {r['ornek_metin'][:160]}")
        print()


# ---------------------------------------------------------------------------
def main():
    p = argparse.ArgumentParser(description="Meta Reklam Kutuphanesi uygulama-reklami istihbarati")
    p.add_argument("--token", default=os.getenv("APIFY_TOKEN"))
    p.add_argument("--actor", default="facebook-ads-scraper", choices=list(ACTORS))
    p.add_argument("--budget", type=float, default=2.0, help="Sert USD ust siniri")
    p.add_argument("--per-query", type=int, default=0,
                   help="Sorgu basina reklam. 0 = butceye gore otomatik hesapla")
    p.add_argument("--country", default="US", help="US, TR, GB, DE ...")
    p.add_argument("--status", default="active", choices=["active", "all", "inactive"])
    p.add_argument("--queries", default="niches.json", help="Anahtar kelime JSON dosyasi")
    p.add_argument("--out", default="out")
    p.add_argument("--min-ads", type=int, default=2, help="Puanlama icin min reklam sayisi")
    p.add_argument("--probe", action="store_true", help="Tek, 20 reklamlik ucuz test calismasi")
    p.add_argument("--analyze-only", metavar="RAW_JSON", help="Sifir maliyet: mevcut ham veriyi puanla")
    args = p.parse_args()

    os.makedirs(args.out, exist_ok=True)

    # --- Sifir maliyet yolu ---
    if args.analyze_only:
        with open(args.analyze_only, encoding="utf-8") as f:
            raw = json.load(f)
        ads = [normalize(x) for x in raw]
        rows = score_advertisers(ads, args.min_ads)
        write_csv(rows, os.path.join(args.out, "reklamverenler.csv"))
        print_report(rows)
        return

    if not args.token:
        sys.exit("APIFY_TOKEN yok. export APIFY_TOKEN=apify_api_xxx")

    actor = ACTORS[args.actor]
    print(f"Aktor: {actor['id']}  (~${actor['usd_per_1k']}/1000 reklam) — {actor['note']}")
    print(f"Butce tavani: ${args.budget:.2f}\n")

    # --- Probe: tek ucuz calisma, alan adlarini goster ---
    if args.probe:
        url = AD_LIBRARY.format(status="active", country=args.country, query="ai+photo+app")
        items, cost = run_actor(args.token, actor["id"], build_input(args.actor, url, 20))
        if items:
            print("\n--- HAM KAYIT ORNEGI (alan adlarini dogrulayin) ---")
            print(json.dumps(items[0], indent=2, ensure_ascii=False)[:2500])
            print("\n--- NORMALIZE EDILMIS ---")
            print(json.dumps(normalize(items[0]), indent=2, ensure_ascii=False))
            ok = sum(1 for x in items if normalize(x)["start"])
            print(f"\nTarih okunabilen kayit: {ok}/{len(items)}")
            if ok < len(items) * 0.5:
                print("UYARI: Tarih alani okunamiyor. FIELD_MAP['start'] icine dogru anahtari ekleyin.")
        print(f"\nProbe maliyeti: ${cost:.4f}")
        return

    # --- Tam tarama ---
    with open(args.queries, encoding="utf-8") as f:
        queries = json.load(f)
    if isinstance(queries, dict):
        queries = [q for group in queries.values() for q in group]

    # --- Otomatik boyutlandirma ---
    # Pahali bir aktorle 45 sorgu calistirmak, sorgu basina 30 reklam demek olur ki
    # bu bir reklamvereni yargilamaya yetmez. Butce yetmiyorsa sorgu listesini kis,
    # derinligi koru. Az sayida saglam sinyal, cok sayida gurultuden iyidir.
    MIN_DEPTH = 120  # bir reklamvereni degerlendirmek icin sorgu basina gereken minimum
    per_query = args.per_query
    if per_query <= 0:
        affordable = int(args.budget / actor["usd_per_1k"] * 1000)
        per_query = max(60, min(400, affordable // max(len(queries), 1)))
        if per_query < MIN_DEPTH:
            keep = max(3, affordable // MIN_DEPTH)
            if keep < len(queries):
                print(f"UYARI: ${args.budget:.2f} butce / ${actor['usd_per_1k']}-1K fiyatla "
                      f"toplam ~{affordable} reklam cekilebilir.")
                print(f"       {len(queries)} sorguya bolununce sorgu basina {per_query} reklam duserdi "
                      f"— reklamveren degerlendirmek icin cok az.")
                print(f"       Sorgu listesi ilk {keep} taneye kisiliyor, derinlik {MIN_DEPTH} yapiliyor.")
                print(f"       Daha genis tarama isterseniz: --actor blackfalcondata "
                      f"(~$0.05/1K, ayni parayla ~40.000 reklam)\n")
                queries = queries[:keep]
                per_query = MIN_DEPTH
    print(f"{len(queries)} sorgu x {per_query} reklam  "
          f"(tahmini ${len(queries) * per_query / 1000 * actor['usd_per_1k']:.2f})\n")

    spent = 0.0
    raw_all, seen = [], set()

    for i, q in enumerate(queries, 1):
        if spent >= args.budget:
            print(f"\n>>> Butce doldu (${spent:.4f}). {len(queries) - i + 1} sorgu atlandi.")
            break
        url = AD_LIBRARY.format(
            status=args.status, country=args.country, query=requests.utils.quote(q)
        )
        print(f"[{i}/{len(queries)}] '{q}'  (harcanan ${spent:.4f}/{args.budget:.2f})")
        try:
            items, cost = run_actor(args.token, actor["id"], build_input(args.actor, url, per_query))
        except Exception as e:                                  # noqa: BLE001
            print(f"    ATLANDI: {e}")
            continue
        spent += cost
        for it in items:
            key = json.dumps(it, sort_keys=True)[:400]
            if key not in seen:
                seen.add(key)
                it["_query"] = q
                raw_all.append(it)

    raw_path = os.path.join(args.out, "raw.json")
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(raw_all, f, ensure_ascii=False)

    ads = [normalize(x) for x in raw_all]
    with open(os.path.join(args.out, "reklamlar.json"), "w", encoding="utf-8") as f:
        json.dump(ads, f, ensure_ascii=False, indent=1)

    rows = score_advertisers(ads, args.min_ads)
    write_csv(rows, os.path.join(args.out, "reklamverenler.csv"))

    print(f"\nToplam harcama: ${spent:.4f} / ${args.budget:.2f}")
    print(f"Toplam reklam: {len(ads)}  |  Reklamveren: {len(rows)}")
    print(f"Ham veri: {raw_path}  (yeniden puanlamak bedava: --analyze-only {raw_path})")
    print_report(rows)


if __name__ == "__main__":
    main()
