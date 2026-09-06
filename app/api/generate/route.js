import { LTX_BASE, JOB_KINDS, getApiKey, jsonError } from "../ltx";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("İstek gövdesi okunamadı.", 400);
  }

  const { kind = "image-to-video", ...payload } = body || {};

  if (!JOB_KINDS.includes(kind)) {
    return jsonError(`Bilinmeyen iş türü: ${kind}`, 400);
  }

  let key;
  try {
    key = getApiKey();
  } catch (err) {
    return jsonError(err.message, 500);
  }

  let res;
  try {
    res = await fetch(`${LTX_BASE}/${kind}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return jsonError(`LTX sunucusuna ulaşılamadı: ${err.message}`, 502);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    return jsonError(readableError(res.status, data), res.status);
  }

  return Response.json({ id: data.id, created_at: data.created_at, kind });
}

function readableError(status, data) {
  const detail =
    data?.error?.message || data?.message || data?.detail || data?.raw || "";

  if (status === 401 || status === 403) {
    return `API anahtarı kabul edilmedi (${status}). Vercel'deki LTX_API_KEY değerini kontrol edin. ${detail}`;
  }
  if (status === 402) {
    return `LTX hesabınızda yeterli kredi görünmüyor (402). ${detail}`;
  }
  if (status === 413) {
    return `Görsel çok büyük (413). Daha küçük bir fotoğraf deneyin. ${detail}`;
  }
  if (status === 422 || status === 400) {
    return `LTX isteği reddetti (${status}). ${detail}`;
  }
  if (status === 429) {
    return `Çok fazla istek gönderildi (429). Biraz bekleyip tekrar deneyin. ${detail}`;
  }
  return `LTX hatası (${status}). ${detail}`;
}
