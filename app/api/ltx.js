// Ortak LTX yardımcıları. API anahtarı SADECE sunucuda okunur,
// tarayıcıya hiçbir zaman gönderilmez.

export const LTX_BASE = "https://api.ltx.io/v2";

// İzin verilen iş türleri. Tarayıcıdan gelen değer bu listede yoksa reddedilir,
// böylece sayfa üzerinden rastgele bir adrese istek atılamaz.
export const JOB_KINDS = [
  "image-to-video",
  "text-to-video",
  "audio-to-video",
  "retake",
  "extend",
  "video-to-video-hdr",
  "video-to-video-reframe",
];

export function getApiKey() {
  const key = process.env.LTX_API_KEY;
  if (!key) {
    throw new Error(
      "LTX_API_KEY tanımlı değil. Vercel > Settings > Environment Variables bölümünden ekleyin."
    );
  }
  return key;
}

export function jsonError(message, status = 400, extra = {}) {
  return Response.json({ error: message, ...extra }, { status });
}
