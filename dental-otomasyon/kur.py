#!/usr/bin/env python3
"""Klinik ayarlarını workflow JSON'larına işler.

Kullanım:
    python3 kur.py klinik.json            -> hazir/ klasörüne yazar
    python3 kur.py klinik.json -o cikti   -> başka klasöre yazar

Ayarlar workflow'lardaki "Ayarlar" node'larına ismine göre yazılır; kör metin
değiştirme yapılmaz, bu yüzden şablon metinlerine veya koda dokunmaz.
"""
import json
import os
import sys

VARSAYILAN = {
    "SHEET_ADI": "Randevular",
    "RAPOR_SHEET_ADI": "Rapor",
    "HATA_SHEET_ADI": "Hatalar",
    "GRAPH_VERSION": "v21.0",
    "SLOT_1": "11:00",
    "SLOT_2": "15:00",
    "TEKLIF_ADEDI": "10",
}
ZORUNLU = ["SHEET_ID", "PHONE_NUMBER_ID", "N8N_BASE_URL"]


def yukle(yol):
    with open(yol, encoding="utf-8") as f:
        return json.load(f)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    cfg_yolu = sys.argv[1]
    cikti = "hazir"
    if "-o" in sys.argv:
        cikti = sys.argv[sys.argv.index("-o") + 1]

    kok = os.path.dirname(os.path.abspath(__file__))
    cfg = dict(VARSAYILAN)
    cfg.update(yukle(cfg_yolu))

    eksik = [k for k in ZORUNLU if not str(cfg.get(k, "")).strip() or "BURAYA" in str(cfg.get(k))]
    if eksik:
        print("HATA: config dosyasında şu alanlar doldurulmamış: " + ", ".join(eksik))
        return 1

    taban = str(cfg["N8N_BASE_URL"]).rstrip("/")
    cfg.setdefault("IPTAL_WEBHOOK_URL", taban + "/webhook/dental-iptal")

    kaynak = os.path.join(kok, "workflows")
    hedef = os.path.join(kok, cikti)
    os.makedirs(hedef, exist_ok=True)

    toplam_yazilan = 0
    kalan_placeholder = []
    for dosya in sorted(os.listdir(kaynak)):
        if not dosya.endswith(".json"):
            continue
        wf = yukle(os.path.join(kaynak, dosya))
        yazilan = []
        for node in wf.get("nodes", []):
            if node.get("type") != "n8n-nodes-base.set":
                continue
            for atama in node.get("parameters", {}).get("assignments", {}).get("assignments", []):
                ad = atama.get("name")
                if ad in cfg and not str(atama.get("value", "")).startswith("={{"):
                    atama["value"] = str(cfg[ad])
                    yazilan.append(ad)
        metin = json.dumps(wf, ensure_ascii=False, indent=2)
        if "BURAYA" in metin:
            kalan_placeholder.append(dosya)
        with open(os.path.join(hedef, dosya), "w", encoding="utf-8") as f:
            f.write(metin + "\n")
        toplam_yazilan += len(yazilan)
        print("%-45s %2d ayar yazıldı" % (dosya, len(yazilan)))

    print("\n%d workflow hazır -> %s/ (toplam %d ayar)" % (len(os.listdir(hedef)), cikti, toplam_yazilan))
    if kalan_placeholder:
        print("UYARI: hâlâ BURAYA_ placeholder'ı olan dosyalar: " + ", ".join(kalan_placeholder))
        print("       Config'e eksik anahtarı ekleyip tekrar çalıştır.")
    else:
        print("Placeholder kalmadı. n8n -> Import from File ile bu klasördeki dosyaları yükle.")
    print("\nSonraki adımlar: her HTTP Request node'unda Header Auth credential'ını seç,")
    print("Google Sheets credential'ını bağla, 8 workflow'u da Active yap.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
