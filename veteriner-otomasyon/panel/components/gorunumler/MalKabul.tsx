"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { TL, sayi, tarihTR } from "@/lib/hesap";
import { Baslik, Bolum, Bos, Yukleniyor } from "@/components/Ui";

export default function MalKabul() {
  const { veri, malKabul } = useStore();
  const [urunId, setUrunId] = useState("");
  const [miktar, setMiktar] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [miat, setMiat] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [bildirim, setBildirim] = useState<string | null>(null);
  if (!veri) return <Yukleniyor />;

  const urun = veri.urunler.find((u) => u.id === urunId);
  const gecerli = !!urun && Number(miktar) > 0;

  const kaydet = () => {
    if (!gecerli || !urun) return;
    malKabul({
      urunId, miktar: Number(miktar), lotNo,
      miat: urun.miatTakipli ? miat : "",
      alisFiyat: Number(fiyat) || urun.alisFiyat,
    });
    setBildirim(`${urun.ad} · ${miktar} ${urun.birim} stoğa girdi`);
    setMiktar(""); setLotNo(""); setMiat(""); setFiyat("");
    setTimeout(() => setBildirim(null), 4000);
  };

  const sonGirisler = veri.hareketler
    .filter((h) => h.tip === "giris")
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .slice(0, 12);
  const urunIdx = new Map(veri.urunler.map((u) => [u.id, u]));
  const lotIdx = new Map(veri.lotlar.map((l) => [l.id, l]));

  return (
    <>
      <Baslik ust="Envanter" ana="Mal kabul"
              alt="İrsaliyeden giriş. Miat takipli üründe lot ve miat zorunludur — miat raporunun doğruluğu buna bağlı." />

      {bildirim && (
        <div className="kart p-3.5 mb-5 text-[14px] font-medium"
             style={{ borderColor: "var(--good)", background: "var(--good-wash)", color: "var(--good)" }}>
          ✓ {bildirim}
        </div>
      )}

      <div className="grid lg:grid-cols-[400px_1fr] gap-5 items-start">
        <Bolum baslik="Yeni giriş">
          <div className="p-4 space-y-4">
            <div>
              <label className="etiket">Ürün</label>
              <select className="girdi" value={urunId} onChange={(e) => {
                setUrunId(e.target.value);
                const u = veri.urunler.find((x) => x.id === e.target.value);
                setFiyat(u ? String(u.alisFiyat) : "");
              }}>
                <option value="">Seçiniz…</option>
                {veri.urunler.map((u) => (
                  <option key={u.id} value={u.id}>{u.kod} — {u.ad}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="etiket">Miktar {urun && `(${urun.birim})`}</label>
                <input className="girdi num" type="number" min="1" value={miktar}
                       onChange={(e) => setMiktar(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="etiket">Alış fiyatı</label>
                <input className="girdi num" type="number" min="0" value={fiyat}
                       onChange={(e) => setFiyat(e.target.value)} placeholder="0" />
              </div>
            </div>

            {urun?.miatTakipli && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="etiket">Lot no</label>
                  <input className="girdi num" value={lotNo} onChange={(e) => setLotNo(e.target.value)}
                         placeholder="L20260001" />
                </div>
                <div>
                  <label className="etiket">Miat</label>
                  <input className="girdi num" type="date" value={miat} onChange={(e) => setMiat(e.target.value)} />
                </div>
              </div>
            )}

            {urun && (
              <div className="rounded-[10px] p-3 text-[13px]" style={{ background: "var(--surface-2)" }}>
                <div className="flex justify-between mb-1">
                  <span className="text-ink-2">Giriş maliyeti</span>
                  <span className="font-semibold num">{TL((Number(fiyat) || urun.alisFiyat) * (Number(miktar) || 0))}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Satış değeri</span>
                  <span className="num">{TL(urun.satisFiyat * (Number(miktar) || 0))}</span>
                </div>
              </div>
            )}

            <button className="btn btn-ana w-full !py-2.5" disabled={!gecerli} onClick={kaydet}>
              Stoğa al
            </button>
          </div>
        </Bolum>

        <Bolum baslik="Son girişler">
          {sonGirisler.length === 0 ? <Bos mesaj="Henüz giriş yok." /> : (
            <table className="w-full tablo">
              <thead>
                <tr><th>Tarih</th><th>Ürün</th><th>Lot / Miat</th>
                    <th className="text-right">Miktar</th><th className="text-right">Maliyet</th></tr>
              </thead>
              <tbody>
                {sonGirisler.map((h) => {
                  const u = urunIdx.get(h.urunId);
                  const l = h.lotId ? lotIdx.get(h.lotId) : null;
                  return (
                    <tr key={h.id}>
                      <td className="num text-[12.5px] whitespace-nowrap">{tarihTR(h.tarih)}</td>
                      <td className="font-medium text-[13.5px]">{u?.ad}</td>
                      <td className="num text-[12.5px] text-ink-muted">
                        {l?.lotNo ?? "—"}{l?.miat ? ` · ${l.miat}` : ""}
                      </td>
                      <td className="text-right num font-medium">+{sayi(h.miktar)}</td>
                      <td className="text-right num">{TL(h.miktar * h.birimFiyat)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Bolum>
      </div>
    </>
  );
}
