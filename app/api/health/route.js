export const runtime = "nodejs";

// Anahtarın kurulu olup olmadığını söyler. Anahtarın kendisini ASLA döndürmez.
export async function GET() {
  const key = process.env.LTX_API_KEY;
  return Response.json({
    keyConfigured: Boolean(key && key.trim()),
  });
}
