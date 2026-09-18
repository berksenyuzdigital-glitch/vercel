"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { TL, sayi, tarihTR, saatTR } from "@/lib/hesap";
import { PROTOKOLLER } from "@/lib/veri";
import { Baslik, Bolum, Bos, Yukleniyor, KiloGrafik } from "@/components/Ui";

const TIP_AD: Record<string, string> = {
  muayene: "Muayene", asi: "Aşı", kuafor: "Kuaför",
  otel: "Pansiyon", operasyon: "Operasyon", perakende: "Perakende",
};

export default function Hastalar() {
  const { veri } = useStore();
  const [secili, setSecili] = useState<string | null>(null);
  const [ara, setAra] = useState("");
  if (!veri) return <Yukleniyor />;

  const kucuk = (s: string) => s.toLocaleLowerCase("tr");
  const aktif = secili ?? veri.hastalar[0].id;
  const hasta = veri.hastalar.find((h) => h.id === aktif)!;
  const sahip = veri.sahipler.find((s) => s.id === hasta.sahipId)!;
  const kardesler = veri.hastalar.filter((h) => h.sahipId === sahip.id);

  const olcumler = veri.olcumler
    .filter((o) => o.hastaId === hasta.id)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const sonKilo = olcumler.at(-1);
  const ilkKilo = olcumler[0];
  const degisim = sonKilo && ilkKilo ? sonKilo.kiloKg - ilkKilo.kiloKg : 0;

  const islemler = veri.islemler
    .filter((i) => i.hastaId === hasta.id && i.durum !== "iptal")
    .sort((a, b) => b.tarih.localeCompare(a.tarih));
  const toplamHarcama = islemler.reduce(
    (t, i) => t + i.satirlar.reduce((x, s) => x + (s.ucretlendirildi ? s.miktar * s.birimFiyat : 0), 0), 0);

  const uygulamalar = veri.uygulamalar.filter((u) => u.hastaId === hasta.id);
  const protokolIdx = new Map(PROTOKOLLER.map((p) => [p.id, p]));

  const yasHesap = (d: string) => {
    const ay = Math.floor((Date.now() - new Date(d).getTime()) / (30.44 * 86400000));
    return ay < 24 ? `${ay} aylık` : `${Math.floor(ay / 12)} yaşında`;
  };

  const liste = veri.hastalar
    .map((h) => ({ ...h, s: veri.sahipler.find((x) => x.id === h.sahipId) }))
    .filter((h) => !ara || kucuk(h.ad).includes(kucuk(ara)) || kucuk(h.s?.ad ?? "").includes(kucuk(ara)));

  return (
    <>
      <Baslik ust="Hasta kayıtları" ana="Hastalar"
              alt="Hayvan profili, kilo/diyet takibi, işlem geçmişi ve koruyucu hekimlik durumu tek kartta." />

      <div className="grid lg:grid-cols-[280px_1fr] gap-5 items-start">
        <div className="kart overflow-hidden lg:sticky lg:top-6">
          <div className="p-3 border-b border-line">
            <input className="girdi" placeholder="Hasta veya sahip ara…"
                   value={ara} onChange={(e) => setAra(e.target.value)} />
          </div>
          <div className="max-h-[620px] overflow-y-auto">
            {liste.map((h) => (
              <button key={h.id} onClick={() => setSecili(h.id)}
                      className="w-full text-left px-4 py-2.5 border-b border-line flex items-center gap-2.5"
                      style={h.id === aktif ? { background: "var(--accent-soft)" } : undefined}>
                <span className="text-[16px]" aria-hidden>
                  {h.tur === "kedi" ? "🐈" : h.tur === "kopek" ? "🐕" : "🐾"}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium truncate"
                        style={h.id === aktif ? { color: "var(--accent-ink)" } : undefined}>{h.ad}</span>
                  <span className="block text-[11.5px] text-ink-muted truncate">{h.s?.ad}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5 min-w-0">
          {/* Profil */}
          <div className="kart p-5">
            <div className="flex flex-wrap items-start gap-5">
              <div className="size-[72px] rounded-[14px] grid place-items-center text-[34px] shrink-0"
                   style={{ background: "var(--surface-2)" }} aria-hidden>
                {hasta.tur === "kedi" ? "🐈" : hasta.tur === "kopek" ? "🐕" : "🐾"}
              </div>
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-[22px] font-semibold">{hasta.ad}</h2>
                  <span className="rozet rozet-notr">{hasta.cinsiyet === "disi" ? "♀ Dişi" : "♂ Erkek"}</span>
                  {hasta.kisir && <span className="rozet rozet-iyi">Kısır</span>}
                </div>
                <p className="text-[13.5px] text-ink-2 mt-1">
                  {hasta.irk} · {yasHesap(hasta.dogumTarihi)} · {sahip.ad} ({sahip.telefon})
                </p>
                {hasta.mikrocip && (
                  <p className="text-[12px] text-ink-muted mt-1 num">Mikroçip: {hasta.mikrocip}</p>
                )}
                {hasta.kronikNot && (
                  <div className="rozet rozet-uyari mt-2.5">⚕ {hasta.kronikNot}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[12px] text-ink-2 mb-1">Yaşam boyu değer</div>
                <div className="text-[24px] font-semibold num">{TL(toplamHarcama)}</div>
                <div className="text-[12px] text-ink-muted mt-0.5">{islemler.length} işlem</div>
              </div>
            </div>

            {kardesler.length > 1 && (
              <div className="mt-4 pt-4 border-t border-line flex items-center gap-2 flex-wrap">
                <span className="text-[12.5px] text-ink-muted">Aynı sahibin diğer hayvanları:</span>
                {kardesler.filter((k) => k.id !== hasta.id).map((k) => (
                  <button key={k.id} onClick={() => setSecili(k.id)} className="rozet rozet-notr cursor-pointer">
                    {k.tur === "kedi" ? "🐈" : "🐕"} {k.ad}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kilo takibi */}
          <Bolum
            baslik="Kilo takibi"
            aciklama={sonKilo ? `Son ölçüm ${tarihTR(sonKilo.tarih)} · ${sonKilo.kiloKg} kg` : undefined}
            sag={
              olcumler.length > 1 ? (
                <span className={`rozet ${Math.abs(degisim) < 0.3 ? "rozet-iyi" : degisim > 0 ? "rozet-uyari" : "rozet-iyi"}`}>
                  {degisim > 0 ? "▲" : "▼"} {Math.abs(degisim).toFixed(1)} kg
                </span>
              ) : undefined
            }>
            <div className="p-4">
              <KiloGrafik noktalar={olcumler.map((o) => ({ tarih: o.tarih, deger: o.kiloKg }))} />
              {sonKilo?.vks && (
                <p className="text-[12.5px] text-ink-muted mt-3">
                  Vücut kondisyon skoru: <strong className="text-ink num">{sonKilo.vks}/9</strong>
                  {sonKilo.vks >= 7 && " — ideal aralığın üzerinde, diyet takibi önerilir."}
                  {sonKilo.vks >= 4 && sonKilo.vks <= 6 && " — ideal aralıkta."}
                </p>
              )}
            </div>
          </Bolum>

          {/* Koruyucu hekimlik */}
          <Bolum baslik="Koruyucu hekimlik">
            <table className="w-full tablo">
              <thead><tr><th>Uygulama</th><th>Son</th><th>Sonraki</th><th className="text-right">Durum</th></tr></thead>
              <tbody>
                {uygulamalar.map((u) => {
                  const p = protokolIdx.get(u.protokolId);
                  const kalan = Math.round((new Date(u.sonrakiTarih).getTime() - Date.now()) / 86400000);
                  return (
                    <tr key={u.id}>
                      <td className="font-medium text-[13.5px]">{p?.ad}</td>
                      <td className="num text-[12.5px] text-ink-muted">{u.uygulamaTarihi ?? "—"}</td>
                      <td className="num text-[12.5px]">{u.sonrakiTarih}</td>
                      <td className="text-right">
                        <span className={`rozet ${kalan < 0 ? "rozet-kritik" : kalan <= 14 ? "rozet-uyari" : "rozet-iyi"}`}>
                          {kalan < 0 ? `${Math.abs(kalan)} gün gecikti` : `${kalan} gün kaldı`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Bolum>

          {/* Geçmiş */}
          <Bolum baslik="İşlem geçmişi" aciklama={`${islemler.length} kayıt`}>
            {islemler.length === 0 ? <Bos mesaj="Kayıt yok." /> : (
              <div className="max-h-[420px] overflow-y-auto">
                {islemler.slice(0, 25).map((i) => {
                  const tutar = i.satirlar.reduce((t, s) => t + (s.ucretlendirildi ? s.miktar * s.birimFiyat : 0), 0);
                  const kacak = i.satirlar.filter((s) => !s.ucretlendirildi);
                  return (
                    <div key={i.id} className="px-4 py-3 border-b border-line">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <span className="rozet rozet-notr">{TIP_AD[i.tip] ?? i.tip}</span>
                          <span className="text-[13px] num text-ink-2">
                            {tarihTR(i.tarih)} · {saatTR(i.tarih)}
                          </span>
                          <span className="text-[12.5px] text-ink-muted">{i.personel}</span>
                        </div>
                        <span className="font-semibold num text-[14px]">{TL(tutar)}</span>
                      </div>
                      <div className="mt-1.5 text-[12.5px] text-ink-2">
                        {i.satirlar.map((s) => `${s.aciklama}${s.miktar > 1 ? ` ×${sayi(s.miktar)}` : ""}`).join(" · ")}
                      </div>
                      {kacak.length > 0 && (
                        <div className="mt-1.5 text-[12px]" style={{ color: "var(--critical)" }}>
                          ⚠︎ {kacak.length} kalem ücretlendirilmedi
                          ({TL(kacak.reduce((t, s) => t + s.miktar * s.birimFiyat, 0))})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Bolum>
        </div>
      </div>
    </>
  );
}
