#!/usr/bin/env node
/**
 * 8 WhatsApp şablonunu Meta'ya tek komutla yükler. Elle form doldurmak yok.
 *
 *   export META_TOKEN="EAAG..."          # System User token
 *   export WABA_ID="1234567890"          # WhatsApp Business Account ID
 *   node araclar/meta-sablon-yukle.mjs           # şablonları yükler
 *   node araclar/meta-sablon-yukle.mjs --durum   # mevcut şablonların onay durumunu listeler
 *
 * Şablonlar WABA'ya bağlıdır: bir kez yüklersin, o hesaptaki bütün klinik
 * numaraları kullanır. Her klinik için tekrar çalıştırmana gerek yok.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const KOK = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SURUM = process.env.GRAPH_VERSION || 'v21.0';
const TOKEN = process.env.META_TOKEN;
const WABA = process.env.WABA_ID;
const DURUM_MODU = process.argv.includes('--durum');

if (!TOKEN || !WABA) {
  console.error('\nEksik ayar. Şunları tanımla:\n');
  console.error('  export META_TOKEN="EAAG..."   (Meta System User token)');
  console.error('  export WABA_ID="1234567890"   (WhatsApp Business Account ID)\n');
  console.error('İkisini de Meta Business Manager -> WhatsApp Manager -> API Setup ekranında bulursun.\n');
  process.exit(1);
}

const url = (yol) => `https://graph.facebook.com/${SURUM}/${yol}`;
const basliklar = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function mevcutSablonlar() {
  const r = await fetch(url(`${WABA}/message_templates?limit=200&fields=name,status,category,language`), { headers: basliklar });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || JSON.stringify(j));
  return j.data || [];
}

if (DURUM_MODU) {
  const liste = await mevcutSablonlar();
  console.log(`\nWABA ${WABA} içindeki şablonlar (${liste.length}):\n`);
  for (const s of liste) {
    const isaret = s.status === 'APPROVED' ? '\x1b[32m✓\x1b[0m' : s.status === 'REJECTED' ? '\x1b[31m✗\x1b[0m' : '\x1b[33m…\x1b[0m';
    console.log(`  ${isaret} ${s.name.padEnd(35)} ${s.status.padEnd(10)} ${s.category} (${s.language})`);
  }
  const bekleyen = liste.filter((s) => s.status === 'PENDING').length;
  const red = liste.filter((s) => s.status === 'REJECTED').length;
  console.log(`\n${liste.filter((s) => s.status === 'APPROVED').length} onaylı, ${bekleyen} beklemede, ${red} reddedildi.`);
  if (red) console.log('\x1b[31mReddedilen şablonun kullandığı akış sessizce çalışmaz. Metni düzeltip tekrar yükle.\x1b[0m');
  console.log();
  process.exit(0);
}

const { sablonlar } = JSON.parse(fs.readFileSync(path.join(KOK, 'araclar/sablon-tanimlari.json'), 'utf8'));
const mevcut = new Set((await mevcutSablonlar()).map((s) => s.name));

console.log(`\n${sablonlar.length} şablon Meta'ya yükleniyor (WABA ${WABA})\n`);
let yeni = 0, atlanan = 0, hatali = 0;

for (const s of sablonlar) {
  if (mevcut.has(s.name)) {
    console.log(`  \x1b[90m—\x1b[0m ${s.name.padEnd(35)} zaten var, atlandı`);
    atlanan++;
    continue;
  }
  const govde = { type: 'BODY', text: s.body };
  if (s.ornek.length) govde.example = { body_text: [s.ornek] };

  const r = await fetch(url(`${WABA}/message_templates`), {
    method: 'POST',
    headers: basliklar,
    body: JSON.stringify({ name: s.name, language: 'tr', category: s.category, components: [govde] }),
  });
  const j = await r.json();
  if (r.ok) {
    console.log(`  \x1b[32m✓\x1b[0m ${s.name.padEnd(35)} gönderildi (${j.status || 'PENDING'})`);
    yeni++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${s.name.padEnd(35)} ${j.error?.error_user_msg || j.error?.message || 'bilinmeyen hata'}`);
    hatali++;
  }
}

console.log(`\n${yeni} yeni şablon gönderildi, ${atlanan} zaten vardı, ${hatali} hata.`);
console.log('Onay genelde birkaç dakika ile birkaç saat arası sürüyor.');
console.log('Durumu görmek için:  node araclar/meta-sablon-yukle.mjs --durum\n');
process.exit(hatali ? 1 : 0);
