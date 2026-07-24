// Domain-handle verification for AT Protocol (Bluesky).
//
// If settings.atproto.handle (or .did) is set, this writes
// public/.well-known/atproto-did containing the account's DID. Serving that
// file is all it takes for this site's domain to become the account's
// Bluesky handle: after deploy, go to Bluesky → Settings → Handle →
// "I have my own domain" → enter this domain → verify.
//
// Runs at the start of `npm run build`. Never fails the build: if the
// handle can't be resolved (offline, typo), it warns and leaves the
// previous file in place.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SETTINGS = 'src/content/settings.json';
const OUT_DIR = 'public/.well-known';
const OUT_FILE = `${OUT_DIR}/atproto-did`;

const settings = JSON.parse(await readFile(SETTINGS, 'utf8'));
const at = settings.atproto || {};
let did = (at.did || '').trim();
const handle = (at.handle || '').trim().replace(/^@/, '');

if (!did && !handle) {
  if (existsSync(OUT_FILE)) {
    await rm(OUT_FILE);
    console.log('✓ atproto-did: removed (no handle configured)');
  }
  process.exit(0);
}

if (!did) {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    did = (await res.json()).did;
  } catch (err) {
    console.warn(`⚠ atproto-did: could not resolve @${handle} (${err.message}) — skipping`);
    process.exit(0);
  }
}

if (!/^did:(plc|web):/.test(did)) {
  console.warn(`⚠ atproto-did: "${did}" doesn't look like a DID — skipping`);
  process.exit(0);
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, did + '\n');
console.log(`✓ atproto-did: ${did}${handle ? ` (@${handle})` : ''} → /.well-known/atproto-did`);
