"use client";

import { useEffect, useRef, useState } from "react";

// Vercel'in istek gövdesi sınırı ~4.5 MB. Base64 kodlama boyutu ~%33 büyüttüğü
// için görseli tarayıcıda küçültüp bu sınırın altında tutuyoruz.
const MAX_EDGE = 1920;
const MAX_DATA_URI_BYTES = 3_500_000;

const MODELS = [
  { value: "ltx-2-5-pro", label: "LTX 2.5 Pro — en iyi kalite" },
  { value: "ltx-2-5-fast", label: "LTX 2.5 Fast — daha hızlı, daha ucuz" },
  { value: "ltx-2-3-pro", label: "LTX 2.3 Pro" },
  { value: "ltx-2-3-fast", label: "LTX 2.3 Fast" },
];

const RESOLUTIONS = [
  { value: "1920x1080", label: "1080p yatay (1920x1080)" },
  { value: "1080x1920", label: "1080p dikey (1080x1920) — Reels/TikTok" },
  { value: "1280x720", label: "720p yatay (1280x720)" },
  { value: "720x1280", label: "720p dikey (720x1280)" },
  { value: "2560x1440", label: "1440p yatay (2560x1440)" },
  { value: "3840x2160", label: "4K yatay (3840x2160)" },
];

const CAMERA = [
  { value: "", label: "Kamera hareketi yok (varsayılan)" },
  { value: "static", label: "Sabit kamera" },
  { value: "dolly_in", label: "Yaklaş (dolly in)" },
  { value: "dolly_out", label: "Uzaklaş (dolly out)" },
  { value: "dolly_left", label: "Sola kaydır" },
  { value: "dolly_right", label: "Sağa kaydır" },
  { value: "jib_up", label: "Yukarı yüksel" },
  { value: "jib_down", label: "Aşağı in" },
  { value: "focus_shift", label: "Odak değişimi" },
];

export default function Page() {
  const [keyConfigured, setKeyConfigured] = useState(null);

  const [imageDataUri, setImageDataUri] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageInfo, setImageInfo] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("ltx-2-5-pro");
  const [duration, setDuration] = useState("auto");
  const [resolution, setResolution] = useState("1920x1080");
  const [camera, setCamera] = useState("");
  const [audio, setAudio] = useState(true);

  const [phase, setPhase] = useState("idle"); // idle | preparing | working | done | error
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const fileInput = useRef(null);
  const cancelled = useRef(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setKeyConfigured(Boolean(d.keyConfigured)))
      .catch(() => setKeyConfigured(false));
  }, []);

  useEffect(() => {
    if (phase !== "working") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Bu bir görsel dosyası değil. JPG veya PNG seçin.");
      return;
    }
    setError("");
    setPhase("preparing");
    setMessage("Fotoğraf hazırlanıyor…");
    try {
      const dataUri = await shrinkImage(file);
      if (approxBytes(dataUri) > MAX_DATA_URI_BYTES) {
        throw new Error(
          "Fotoğraf küçültüldükten sonra bile çok büyük. Daha küçük çözünürlüklü bir fotoğraf deneyin."
        );
      }
      setImageDataUri(dataUri);
      setImageName(file.name);
      setImageInfo(`${(approxBytes(dataUri) / 1024 / 1024).toFixed(2)} MB gönderilecek`);
      setPhase("idle");
      setMessage("");
    } catch (err) {
      setPhase("error");
      setError(err.message || "Fotoğraf okunamadı.");
    }
  }

  async function generate() {
    setError("");
    setVideoUrl("");
    setElapsed(0);
    cancelled.current = false;

    if (!imageDataUri) return setError("Önce bir fotoğraf seçin.");
    if (!prompt.trim()) return setError("Videoda ne olmasını istediğinizi yazın.");

    setPhase("working");
    setMessage("İstek LTX'e gönderiliyor…");

    const payload = {
      kind: "image-to-video",
      image_uri: imageDataUri,
      prompt: prompt.trim(),
      model,
      duration: duration === "auto" ? null : Number(duration),
      resolution,
      generate_audio: audio,
    };
    if (camera) payload.camera_motion = camera;

    let id;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İstek gönderilemedi.");
      id = data.id;
    } catch (err) {
      setPhase("error");
      setError(err.message);
      return;
    }

    setMessage("Video üretiliyor. Bu birkaç dakika sürebilir, sayfayı kapatmayın…");

    // 20 dakikaya kadar, 5 saniyede bir durum sorgula.
    for (let i = 0; i < 240; i++) {
      if (cancelled.current) return;
      await sleep(5000);
      if (cancelled.current) return;

      let data;
      try {
        const res = await fetch(
          `/api/status?id=${encodeURIComponent(id)}&kind=image-to-video`
        );
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Durum sorgulanamadı.");
      } catch (err) {
        // Geçici ağ hatasında pes etme, bir sonraki turda tekrar dene.
        continue;
      }

      const status = String(data.status || "").toLowerCase();

      if (status === "completed") {
        const url = data.result?.video_url;
        if (!url) {
          setPhase("error");
          setError("Video tamamlandı ama indirme adresi gelmedi.");
          return;
        }
        setVideoUrl(url);
        setPhase("done");
        setMessage("");
        return;
      }

      if (status === "failed" || status === "error" || status === "canceled") {
        setPhase("error");
        setError(
          data.error?.message ||
            data.failure_reason ||
            "LTX video üretimini tamamlayamadı. Açıklamayı biraz değiştirip tekrar deneyin."
        );
        return;
      }
    }

    setPhase("error");
    setError("20 dakika doldu ve video hâlâ hazır değil. LTX konsolundan işin durumunu kontrol edin.");
  }

  const busy = phase === "working" || phase === "preparing";

  return (
    <div className="wrap">
      <h1>LTX Video Stüdyo</h1>
      <p className="sub">Fotoğraf yükle, ne olmasını istediğini yaz, videoyu indir.</p>

      {keyConfigured === false && (
        <div className="banner warn">
          <b>API anahtarı henüz kurulmamış</b>
          Vercel panelinde <code>Settings → Environment Variables</code> bölümüne
          gidip <code>LTX_API_KEY</code> adında bir değer ekleyin, sonra projeyi
          yeniden yayınlayın (Redeploy). O zamana kadar üretim çalışmaz.
        </div>
      )}

      {error && (
        <div className="banner err">
          <b>Hata</b>
          {error}
        </div>
      )}

      <div className="card">
        <p className="step-title">1 · Fotoğraf</p>

        {imageDataUri ? (
          <div className="preview">
            <img src={imageDataUri} alt="Seçilen fotoğraf" />
            <div className="meta">
              <b>{imageName}</b>
              {imageInfo}
              <div className="row">
                <button
                  className="ghost"
                  onClick={() => {
                    setImageDataUri("");
                    setImageName("");
                    setImageInfo("");
                  }}
                  disabled={busy}
                >
                  Fotoğrafı değiştir
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={dragOver ? "drop over" : "drop"}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            <strong>Fotoğrafı buraya sürükle</strong>
            <p>veya tıklayıp bilgisayarından seç · JPG, PNG</p>
          </div>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {phase === "preparing" && <p className="hint">{message}</p>}
      </div>

      <div className="card">
        <p className="step-title">2 · Ne olsun?</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Örnek: Kadın yavaşça kameraya doğru dönüp gülümsüyor, arkadaki perdeler hafif rüzgârda dalgalanıyor, sıcak akşam ışığı."
          disabled={busy}
        />
        <p className="hint">
          Ne kadar somut yazarsan sonuç o kadar iyi olur. Hareketi tarif et:
          kim/ne, nasıl hareket ediyor, ışık nasıl.
        </p>
      </div>

      <div className="card">
        <p className="step-title">3 · Ayarlar</p>
        <div className="grid">
          <label className="field">
            <span>Model</span>
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={busy}>
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Süre</span>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} disabled={busy}>
              <option value="auto">Otomatik (LTX karar versin)</option>
              <option value="6">6 saniye</option>
              <option value="8">8 saniye</option>
              <option value="10">10 saniye</option>
            </select>
          </label>

          <label className="field">
            <span>Çözünürlük</span>
            <select value={resolution} onChange={(e) => setResolution(e.target.value)} disabled={busy}>
              {RESOLUTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Kamera hareketi</span>
            <select value={camera} onChange={(e) => setCamera(e.target.value)} disabled={busy}>
              {CAMERA.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={audio}
            onChange={(e) => setAudio(e.target.checked)}
            disabled={busy}
          />
          Videoya ses de üretilsin
        </label>

        <p className="hint">
          &quot;Otomatik&quot; süre yalnızca LTX 2.5 modellerinde çalışır. 2.3
          modellerinden birini seçtiysen sabit bir süre seç.
        </p>
      </div>

      <div className="card">
        {phase === "working" ? (
          <>
            <div className="status">
              <div className="spinner" />
              <div>
                {message}
                <div className="hint" style={{ marginTop: 2 }}>
                  Geçen süre: {formatTime(elapsed)}
                </div>
              </div>
            </div>
            <div className="row">
              <button
                className="ghost"
                onClick={() => {
                  cancelled.current = true;
                  setPhase("idle");
                  setMessage("");
                }}
              >
                Beklemeyi bırak
              </button>
            </div>
          </>
        ) : (
          <button
            className="primary"
            onClick={generate}
            disabled={busy || !imageDataUri || !prompt.trim()}
          >
            Videoyu üret
          </button>
        )}
      </div>

      {phase === "done" && videoUrl && (
        <div className="card">
          <p className="step-title">Video hazır</p>
          <video src={videoUrl} controls autoPlay loop playsInline />
          <div className="row">
            <a className="dl" href={videoUrl} download target="_blank" rel="noreferrer">
              Videoyu indir
            </a>
            <button className="ghost" onClick={() => { setPhase("idle"); setVideoUrl(""); }}>
              Yeni video üret
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m} dk ${r} sn` : `${r} sn`;
}

// data URI'nin kabaca kaç bayta denk geldiği.
function approxBytes(dataUri) {
  const base64 = dataUri.slice(dataUri.indexOf(",") + 1);
  return Math.floor(base64.length * 0.75);
}

// Görseli uzun kenarı MAX_EDGE olacak şekilde küçültüp JPEG data URI'ye çevirir.
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Görsel açılamadı. Bozuk olabilir."));
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        let out = canvas.toDataURL("image/jpeg", 0.9);
        // Hâlâ büyükse kaliteyi kademeli düşür.
        for (const q of [0.8, 0.7, 0.6]) {
          if (approxBytes(out) <= MAX_DATA_URI_BYTES) break;
          out = canvas.toDataURL("image/jpeg", q);
        }
        resolve(out);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
