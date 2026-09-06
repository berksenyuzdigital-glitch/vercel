import { LTX_BASE, JOB_KINDS, getApiKey, jsonError } from "../ltx";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const kind = searchParams.get("kind") || "image-to-video";

  if (!id) return jsonError("id parametresi eksik.", 400);
  if (!JOB_KINDS.includes(kind)) return jsonError(`Bilinmeyen iş türü: ${kind}`, 400);
  // Yol enjeksiyonuna karşı: id yalnızca güvenli karakterler içerebilir.
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return jsonError("Geçersiz id.", 400);

  let key;
  try {
    key = getApiKey();
  } catch (err) {
    return jsonError(err.message, 500);
  }

  let res;
  try {
    res = await fetch(`${LTX_BASE}/${kind}/${id}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
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
    return jsonError(`Durum sorgulanamadı (${res.status}).`, res.status);
  }

  return Response.json(data);
}
