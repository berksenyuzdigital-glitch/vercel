#!/usr/bin/env node
/**
 * 8 workflow'u n8n'e tek komutla yükler, credential'ları bağlar, hata workflow'unu
 * ayarlar ve hepsini aktif eder. n8n arayüzünde tek tek import etmek yok.
 *
 *   export N8N_URL="https://klinik.app.n8n.cloud"
 *   export N8N_API_KEY="n8n_api_..."            # n8n -> Settings -> API
 *   export WHATSAPP_TOKEN="EAAG..."             # opsiyonel: Header Auth credential'ı otomatik kurar
 *   export GOOGLE_CREDENTIAL_ID="abc123"        # opsiyonel: n8n'de bir kez oluşturduğun Sheets credential'ı
 *   node araclar/n8n-yukle.mjs                  # hazir/ klasörünü yükler
 *   node araclar/n8n-yukle.mjs --pasif          # yükler ama aktif etmez (önce test etmek için)
 *
 * Google Sheets credential'ı tarayıcıda OAuth onayı istediği için API'den kurulamaz:
 * onu n8n'de bir kez elle oluştur, ID'sini (URL'de görünür) buraya ver.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const KOK = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TABAN = (process.env.N8N_URL || '').replace(/\/$/, '');
const ANAHTAR = process.env.N8N_API_KEY;
const AKTIF_ET = !process.argv.includes('--pasif');
const KAYNAK = path.join(KOK, process.argv.find((a) => a.startsWith('--klasor='))?.split('=')[1] || 'hazir');

if (!TABAN || !ANAHTAR) {
  console.error('\nEksik ayar:\n');
  console.error('  export N8N_URL="https://seninadresin.app.n8n.cloud"');
  console.error('  export N8N_API_KEY="n8n_api_..."   (n8n -> Settings -> n8n API -> Create API key)\n');
  process.exit(1);
}
if (!fs.existsSync(KAYNAK)) {
  console.error(`\n${KAYNAK} klasörü yok. Önce ayarları işle:\n  python3 kur.py klinik.json\n`);
  process.exit(1);
}

const api = async (yol, secenek = {}) => {
  const r = await fetch(`${TABAN}/api/v1${yol}`, {
    ...secenek,
    headers: { 'X-N8N-API-KEY': ANAHTAR, 'Content-Type': 'application/json', ...(secenek.headers || {}) },
  });
  const metin = await r.text();
  let govde;
  try { govde = JSON.parse(metin); } catch { govde = { message: metin.slice(0, 200) }; }
  if (!r.ok) throw new Error(`${r.status} ${govde.message || metin.slice(0, 200)}`);
  return govde;
};

console.log(`\nn8n: ${TABAN}`);
let mevcutlar;
try {
  mevcutlar = (await api('/workflows?limit=250')).data || [];
  console.log(`Bağlantı tamam. Hesapta hâlihazırda ${mevcutlar.length} workflow var.\n`);
} catch (e) {
  console.error(`\nn8n'e bağlanılamadı: ${e.message}`);
  console.error('N8N_URL ve N8N_API_KEY doğru mu? URL sonunda /api/v1 OLMAMALI.\n');
  process.exit(1);
}

/* ---- Header Auth credential (WhatsApp token) ---- */
let waCredential = null;
if (process.env.WHATSAPP_TOKEN) {
  try {
    const c = await api('/credentials', {
      method: 'POST',
      body: JSON.stringify({
        name: 'WhatsApp Cloud API (dental)',
        type: 'httpHeaderAuth',
        data: { name: 'Authorization', value: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      }),
    });
    waCredential = { id: c.id, name: c.name };
    console.log(`✓ WhatsApp credential oluşturuldu (${c.id})`);
  } catch (e) {
    console.log(`! WhatsApp credential oluşturulamadı: ${e.message}`);
    console.log('  Sorun değil, n8n arayüzünden elle seçebilirsin.');
  }
}
const sheetsCredential = process.env.GOOGLE_CREDENTIAL_ID
  ? { id: process.env.GOOGLE_CREDENTIAL_ID, name: 'Google Sheets' }
  : null;
if (!sheetsCredential) console.log('! GOOGLE_CREDENTIAL_ID verilmedi — Sheets credential\'ını n8n\'de elle seçeceksin.');

/* ---- Workflow'ları yükle ---- */
const dosyalar = fs.readdirSync(KAYNAK).filter((f) => f.endsWith('.json')).sort();
const yuklenen = {};
console.log();

for (const dosya of dosyalar) {
  const wf = JSON.parse(fs.readFileSync(path.join(KAYNAK, dosya), 'utf8'));

  for (const node of wf.nodes) {
    if (node.type === 'n8n-nodes-base.httpRequest' && node.parameters?.genericAuthType === 'httpHeaderAuth' && waCredential) {
      node.credentials = { httpHeaderAuth: waCredential };
    }
    if (node.type === 'n8n-nodes-base.googleSheets' && sheetsCredential) {
      node.credentials = { googleSheetsOAuth2Api: sheetsCredential };
    }
  }

  const govde = { name: wf.name, nodes: wf.nodes, connections: wf.connections, settings: wf.settings || {} };
  const eskisi = mevcutlar.find((m) => m.name === wf.name);
  try {
    let sonuc;
    if (eskisi) {
      sonuc = await api(`/workflows/${eskisi.id}`, { method: 'PUT', body: JSON.stringify(govde) });
      console.log(`  \x1b[36m↻\x1b[0m ${wf.name} — güncellendi`);
    } else {
      sonuc = await api('/workflows', { method: 'POST', body: JSON.stringify(govde) });
      console.log(`  \x1b[32m✓\x1b[0m ${wf.name} — yüklendi`);
    }
    yuklenen[dosya] = { id: sonuc.id, name: wf.name, govde };
  } catch (e) {
    console.log(`  \x1b[31m✗\x1b[0m ${wf.name} — ${e.message}`);
  }
}

/* ---- Hata workflow'unu bağla ---- */
const hataWf = Object.values(yuklenen).find((w) => w.name.includes('Hata Bildirimi'));
if (hataWf) {
  let sayi = 0;
  for (const [dosya, w] of Object.entries(yuklenen)) {
    if (w.id === hataWf.id) continue;
    try {
      await api(`/workflows/${w.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...w.govde, settings: { ...w.govde.settings, errorWorkflow: hataWf.id } }),
      });
      sayi++;
    } catch (e) {
      console.log(`  ! ${w.name} için hata workflow'u ayarlanamadı: ${e.message}`);
    }
  }
  console.log(`\n✓ ${sayi} workflow'un hata bildirimi "${hataWf.name}" akışına bağlandı`);
}

/* ---- Aktif et ---- */
if (AKTIF_ET) {
  let aktif = 0;
  for (const w of Object.values(yuklenen)) {
    try { await api(`/workflows/${w.id}/activate`, { method: 'POST' }); aktif++; }
    catch (e) { console.log(`  ! ${w.name} aktif edilemedi: ${e.message}`); }
  }
  console.log(`✓ ${aktif}/${Object.keys(yuklenen).length} workflow aktif`);
} else {
  console.log('\n(--pasif verildi, workflow\'lar aktif edilmedi)');
}

console.log('\nGeriye kalan tek elle iş:');
if (!waCredential) console.log('  - HTTP Request node\'larında Header Auth credential\'ını seç');
if (!sheetsCredential) console.log('  - Google Sheets node\'larında credential\'ı seç');
console.log('  - Meta -> Configuration -> Webhooks: ' + TABAN + '/webhook/dental-wa , "messages" aboneliği');
console.log('  - Kliniğin randevu formunu ' + TABAN + '/webhook/dental-lead adresine bağla\n');
