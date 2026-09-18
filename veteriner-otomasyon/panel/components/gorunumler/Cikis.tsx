"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { urunToplamlari, TL, sayi } from "@/lib/hesap";
import { Baslik, Bolum, Yukleniyor, Segman, Mono } from "@/components/Ui";
import type { Kategori } from "@/lib/tipler";

const KATEGORILER: { id: Kategori | "hepsi"; ad: string }[] = [
  { id: "hepsi", ad: "Tümü" },
  { id: "ilac", ad: "İlaç" },
  { id: "asi", ad: "Aşı" },
  { id: "parazit", ad: "Parazit" },
  { id: "sarf", ad: "Sarf" },
  { id: "mama", ad: "Mama" },
];

export default function HizliCikis() {
  const { veri, cikisYap } = useStore();
  const [hastaId, setHastaId] = useState("");
  const [hastaAra, setHastaAra] = useState("");
  const [urunAra, setUrunAra] = useState("");
  const [kategori, setKategori] = useState<Kategori | "hepsi">("hepsi");
  const [sepet, setSepet] = useState<{ urunId: string; miktar: number; ucretli: boolean }[]>([]);
  const [bildirim, setBildirim] = useState<string | null>(null);
  const personel = "Dr. Elif Arslan";

  const stok = useMemo(() => (veri ? urunToplamlari(veri) : []), [veri]);
  if (!veri) return <Yukleniyor />;

  const kucuk = (s: string) => s.toLocaleLowerCase("tr");
  const hastalar = veri.hastalar
    .map((h) => ({ ...h, sahip: veri.sahipler.find((s) => s.id === h.sahipId) }))
    .filter((h) =>
      !hastaAra ||
      kucuk(h.ad).includes(kucuk(hastaAra)) ||
      kucuk(h.sahip?.ad ?? "").includes(kucuk(hastaAra)) ||
      (h.sahip?.telefon ?? "").includes(hastaAra));

  const secili = veri.hastalar.find((h) => h.id === hastaId);
  const seciliSahip = secili ? veri.sahipler.find((s) => s.id === secili.sahipId) : undefined;

  const urunler = stok.filter(({ urun }) =>
    (kategori === "hepsi" || urun.kategori === kategori) &&
    (!urunAra || kucuk(urun.ad).includes(kucuk(urunAra)) || kucuk(urun.kod).includes(kucuk(urunAra))));

  const urunIdx = new Map(veri.urunler.map((u) => [u.id, u]));
  const toplam = sepet.reduce((t, s) => {
    const u = urunIdx.get(s.urunId);
    return t + (s.ucretli && u ? u.satisFiyat * s.miktar : 0);
  }, 0);
  const kacak = sepet.reduce((t, s) => {
    const u = urunIdx.get(s.urunId);
    return t + (!s.ucretli && u ? u.satisFiyat * s.miktar : 0);
  }, 0);

  const ekle = (urunId: string) =>
    setSepet((s) => {
      const v = s.find((x) => x.urunId === urunId);
      return v
        ? s.map((x) => (x.urunId === urunId ? { ...x, miktar: x.miktar + 1 } : x))
        : [...s, { urunId, miktar: 1, ucretli: true }];
    });

  const kaydet = () => {
    if (!hastaId || sepet.length === 0) return;
    for (const s of sepet)
      cikisYap({ hastaId, urunId: s.urunId, miktar: s.miktar, ucretlendirildi: s.ucretli, personel });
    setBildirim(`${sepet.length} kalem ${secili?.ad} için kaydedildi · stok düşüldü`);
    setSepet([]);
    setTimeout(() => setBildirim(null), 4000);
  };

  return (
    <>
      <Baslik
        ust="Muayene sırasında"
        ana="Hızlı çıkış"
        alt="Kullanılan ilacı iki dokunuşla düş. Ücretlendirilmeyen kalem otomatik olarak kaçak raporuna gider."
      />

      {bildirim && (
        <div className="panel p-3.5 mb-5 text-[14px] font-medium flex items-center gap-2"
             style={{ borderColor: "var(--good)", background: "var(--good-wash)", color: "var(--good)" }}>
          {bildirim}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_1.15fr_320px] gap-5 items-start">
        <Bolum baslik="1 · Hasta">
          <div className="p-3 border-b border-line">
            <input className="girdi" placeholder="Hayvan, sahip veya telefon ara…"
                   value={hastaAra} onChange={(e) => setHastaAra(e.target.value)} />
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {hastalar.map((h) => {
              const aktif = h.id === hastaId;
              return (
                <button key={h.id} onClick={() => setHastaId(h.id)}
                        className="w-full text-left px-4 py-3 border-b border-line flex items-center gap-3 transition-colors"
                        style={aktif ? { background: "var(--accent-soft)" } : undefined}>
                  <Mono ad={h.ad} tur={h.tur} boyut={34} />
                  <span className="min-w-0">
                    <span className="block font-medium text-[14px] truncate"
                          style={aktif ? { color: "var(--accent-ink)" } : undefined}>{h.ad}</span>
                    <span className="block text-[12px] text-ink-muted truncate">{h.irk} · {h.sahip?.ad}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Bolum>

        <Bolum baslik="2 · Kullanılan ürün">
          <div className="p-3 border-b border-line space-y-2.5">
            <input className="girdi" placeholder="Ürün adı veya kodu…"
                   value={urunAra} onChange={(e) => setUrunAra(e.target.value)} />
            <Segman secili={kategori} sec={setKategori}
                    secenekler={KATEGORILER.map((k) => ({ deger: k.id, ad: k.ad }))} />
          </div>
          <div className="max-h-[420px] overflow-y-auto grid grid-cols-2 gap-2 p-3">
            {urunler.map(({ urun, toplam: kalan, kritik }) => (
              <button key={urun.id} onClick={() => ekle(urun.id)}
                      className="text-left rounded-[10px] border border-line p-3 transition-colors hover:border-[color:var(--accent)]"
                      style={{ background: "var(--surface)" }}>
                <div className="text-[13px] font-medium leading-snug min-h-[34px]">{urun.ad}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[12px] num" style={{ color: kritik ? "var(--critical)" : "var(--ink-muted)" }}>
                    {sayi(kalan)} {urun.birim}
                  </span>
                  <span className="text-[12.5px] font-semibold num">{TL(urun.satisFiyat)}</span>
                </div>
              </button>
            ))}
          </div>
        </Bolum>

        <div className="panel overflow-hidden lg:sticky lg:top-6">
          <div className="px-4 py-3.5 border-b border-line">
            <h2 className="text-[15px] font-semibold">3 · Onay</h2>
            {secili ? (
              <p className="text-[12.5px] text-ink-muted mt-0.5">{secili.ad} · {seciliSahip?.ad}</p>
            ) : (
              <p className="text-[12.5px] mt-0.5" style={{ color: "var(--serious)" }}>Önce hasta seç</p>
            )}
          </div>

          {sepet.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13px] text-ink-muted">Ürün seçilmedi</div>
          ) : (
            <div>
              {sepet.map((s) => {
                const u = urunIdx.get(s.urunId)!;
                return (
                  <div key={s.urunId} className="p-3 border-b border-line">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] font-medium leading-snug">{u.ad}</div>
                      <button onClick={() => setSepet((x) => x.filter((i) => i.urunId !== s.urunId))}
                              className="text-ink-muted text-[15px] leading-none shrink-0">×</button>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center rounded-[8px] border border-line overflow-hidden">
                        <button className="px-2.5 py-1 text-[15px]"
                                onClick={() => setSepet((x) => x.map((i) => i.urunId === s.urunId
                                  ? { ...i, miktar: Math.max(1, i.miktar - 1) } : i))}>−</button>
                        <span className="px-2.5 text-[13.5px] num font-medium min-w-[34px] text-center">{s.miktar}</span>
                        <button className="px-2.5 py-1 text-[15px]"
                                onClick={() => setSepet((x) => x.map((i) => i.urunId === s.urunId
                                  ? { ...i, miktar: i.miktar + 1 } : i))}>+</button>
                      </div>
                      <button
                        onClick={() => setSepet((x) => x.map((i) => i.urunId === s.urunId
                          ? { ...i, ucretli: !i.ucretli } : i))}
                        className={`durum ${s.ucretli ? "durum-iyi" : "durum-kritik"} flex-1 !justify-center !py-1.5 cursor-pointer`}>
                        {s.ucretli ? "Ücretlendirilecek" : "Ücretsiz"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-4 border-t border-line space-y-2.5" style={{ background: "var(--surface-2)" }}>
            <div className="flex justify-between text-[13.5px]">
              <span className="text-ink-2">Faturaya yazılacak</span>
              <span className="font-semibold num">{TL(toplam)}</span>
            </div>
            {kacak > 0 && (
              <div className="flex justify-between text-[13.5px]">
                <span style={{ color: "var(--critical)" }}>Ücretlendirilmeyen</span>
                <span className="font-semibold num" style={{ color: "var(--critical)" }}>{TL(kacak)}</span>
              </div>
            )}
            <button className="btn btn-ana w-full !py-2.5" disabled={!hastaId || sepet.length === 0} onClick={kaydet}>
              Kaydet ve stoktan düş
            </button>
            <p className="text-[11.5px] text-ink-muted leading-relaxed">
              Miadı en yakın lottan (FEFO) düşülür. İşlem sahibin cari hesabına yazılır.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
