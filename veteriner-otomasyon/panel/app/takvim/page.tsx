"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { yaklasanUygulamalar } from "@/lib/hesap";
import { PROTOKOLLER } from "@/lib/veri";
import { Baslik, Kpi, Bolum, Bos, Yukleniyor } from "@/components/Ui";

export default function Takvim() {
  const { veri } = useStore();
  const [pencere, setPencere] = useState(30);
  const [gonderildi, setGonderildi] = useState<Record<string, boolean>>({});
  if (!veri) return <Yukleniyor />;

  const hepsi = yaklasanUygulamalar(veri, pencere);
  const kacirilan = hepsi.filter((u) => u.kalan < 0);
  const buHafta = hepsi.filter((u) => u.kalan >= 0 && u.kalan <= 7);
  const protokolIdx = new Map(PROTOKOLLER.map((p) => [p.id, p]));

  return (
    <>
      <Baslik ust="Koruyucu hekimlik" ana="Aşı & parazit takvimi"
              alt="Kliniğin tekrar eden gelirinin tamamı burada. Kaçan her hatırlatma, kaybedilen bir hastadır."
              sag={
                <div className="flex gap-1.5">
                  {[14, 30, 60].map((g) => (
                    <button key={g} onClick={() => setPencere(g)} className="rozet"
                            style={g === pencere ? { background: "var(--accent)", color: "#fff" }
                                                 : { background: "var(--surface-2)", color: "var(--ink-2)" }}>
                      {g} gün
                    </button>
                  ))}
                </div>
              } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi etiket="Kaçırılan uygulama" deger={String(kacirilan.length)} tip={kacirilan.length ? "kritik" : "iyi"}
             ikon="🚨" alt="Tarihi geçti, hasta gelmedi" />
        <Kpi etiket="Bu hafta" deger={String(buHafta.length)} tip="uyari" ikon="📅" />
        <Kpi etiket={`${pencere} gün içinde`} deger={String(hepsi.filter((u) => u.kalan >= 0).length)} ikon="🗓️" />
        <Kpi etiket="Takipteki hasta" deger={String(veri.hastalar.length)} ikon="🐾" />
      </div>

      <Bolum baslik="Hatırlatma listesi"
             aciklama="n8n bu listeyi okuyup WhatsApp'tan gönderir — panelde manuel de tetiklenebilir">
        {hepsi.length === 0 ? <Bos mesaj="Bu aralıkta uygulama yok." /> : (
          <div className="overflow-x-auto">
            <table className="w-full tablo">
              <thead>
                <tr>
                  <th>Hasta</th><th>Sahip</th><th>Uygulama</th>
                  <th>Tarih</th><th className="text-right">Durum</th><th className="text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {hepsi.map((u) => {
                  const p = protokolIdx.get(u.protokolId);
                  const g = u.kalan;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="font-medium flex items-center gap-1.5">
                          <span aria-hidden>{u.hasta?.tur === "kedi" ? "🐈" : u.hasta?.tur === "kopek" ? "🐕" : "🐾"}</span>
                          {u.hasta?.ad}
                        </div>
                        <div className="text-[12px] text-ink-muted">{u.hasta?.irk}</div>
                      </td>
                      <td>
                        <div className="text-[13.5px]">{u.sahip?.ad}</div>
                        <div className="text-[12px] text-ink-muted num">{u.sahip?.telefon}</div>
                      </td>
                      <td className="text-[13.5px]">
                        {p?.ad}
                        <span className="text-ink-muted text-[12px]"> · {p?.tekrarAy} ayda bir</span>
                      </td>
                      <td className="num text-[12.5px]">{u.sonrakiTarih}</td>
                      <td className="text-right">
                        <span className={`rozet ${g < 0 ? "rozet-kritik" : g <= 7 ? "rozet-uyari" : "rozet-notr"}`}>
                          {g < 0 ? `${Math.abs(g)} gün gecikti` : g === 0 ? "bugün" : `${g} gün kaldı`}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="rozet cursor-pointer"
                          onClick={() => setGonderildi((s) => ({ ...s, [u.id]: true }))}
                          style={gonderildi[u.id]
                            ? { background: "var(--good-wash)", color: "var(--good)" }
                            : { background: "var(--accent)", color: "#fff" }}>
                          {gonderildi[u.id] ? "✓ gönderildi" : "WhatsApp gönder"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Bolum>
    </>
  );
}
