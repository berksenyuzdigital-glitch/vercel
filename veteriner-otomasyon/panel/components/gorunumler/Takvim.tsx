"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { yaklasanUygulamalar, tarihTR } from "@/lib/hesap";
import { PROTOKOLLER } from "@/lib/veri";
import { Baslik, Olculer, Bolum, Bos, Yukleniyor, Segman, Mono } from "@/components/Ui";

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
              sag={<Segman secili={pencere} sec={setPencere}
                           secenekler={[14, 30, 60].map((g) => ({ deger: g, ad: `${g} gün` }))} />} />

      <Olculer
        ogeler={[
          { etiket: "Kaçırılan uygulama", deger: String(kacirilan.length),
            tip: kacirilan.length ? "kritik" : "iyi", not: "Tarihi geçti, hasta gelmedi" },
          { etiket: "Bu hafta", deger: String(buHafta.length), tip: "uyari",
            not: "7 gün içinde" },
          { etiket: `${pencere} gün içinde`, deger: String(hepsi.filter((u) => u.kalan >= 0).length),
            not: "Planlanan uygulama" },
          { etiket: "Takipteki hasta", deger: String(veri.hastalar.length), not: "Aktif kayıt" },
        ]}
      />

      <Bolum baslik="Hatırlatma listesi"
             aciklama="n8n bu listeyi okuyup WhatsApp'tan gönderir — panelde manuel de tetiklenebilir">
        {hepsi.length === 0 ? <Bos mesaj="Bu aralıkta uygulama yok." /> : (
          <div className="overflow-x-auto">
            <table className="w-full tablo">
              <thead>
                <tr>
                  <th>Hasta</th><th>Sahip</th><th>Uygulama</th>
                  <th>Tarih</th><th className="sag">Durum</th><th className="sag">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {hepsi.map((u) => {
                  const p = protokolIdx.get(u.protokolId);
                  const g = u.kalan;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Mono ad={u.hasta?.ad ?? "?"} tur={u.hasta?.tur} boyut={30} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{u.hasta?.ad}</div>
                            <div className="text-[11.5px] text-ink-muted truncate">{u.hasta?.irk}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-[13.5px]">{u.sahip?.ad}</div>
                        <div className="text-[12px] text-ink-muted num">{u.sahip?.telefon}</div>
                      </td>
                      <td className="text-[13.5px]">
                        {p?.ad}
                        <span className="text-ink-muted text-[12px]"> · {p?.tekrarAy} ayda bir</span>
                      </td>
                      <td className="num text-[12.5px] whitespace-nowrap">{tarihTR(u.sonrakiTarih)}</td>
                      <td className="sag">
                        <span className={`durum ${g < 0 ? "durum-kritik" : g <= 7 ? "durum-uyari" : "durum-notr"}`}>
                          {g < 0 ? `${Math.abs(g)} gün gecikti` : g === 0 ? "bugün" : `${g} gün kaldı`}
                        </span>
                      </td>
                      <td className="sag">
                        <button
                          className="durum cursor-pointer"
                          onClick={() => setGonderildi((s) => ({ ...s, [u.id]: true }))}
                          style={gonderildi[u.id]
                            ? { background: "var(--good-wash)", color: "var(--good)" }
                            : { background: "var(--accent)", color: "#fff" }}>
                          {gonderildi[u.id] ? "Gönderildi" : "WhatsApp gönder"}
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
