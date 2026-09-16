#!/usr/bin/env node
/**
 * Pulls the public Google Sheet and writes public/answers.json, which the page
 * uses as a fallback when it can't reach Google directly (offline, file://).
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchEntries, SHEET_ID } from './sheet.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'public', 'answers.json');

const entries = await fetchEntries(process.env.SHEET_ID || SHEET_ID);
if (!entries.length) {
  console.error('No Answer/Person rows found in the sheet.');
  process.exit(1);
}

const people = [...new Set(entries.map((e) => e.person))].sort((a, b) =>
  a.localeCompare(b)
);

await mkdir(dirname(outFile), { recursive: true });
await writeFile(
  outFile,
  JSON.stringify({ fetchedAt: new Date().toISOString(), entries }, null, 2) + '\n'
);

console.log(`Wrote ${entries.length} answers for ${people.length} people to ${outFile}`);
for (const person of people) {
  console.log(`  ${person}: ${entries.filter((e) => e.person === person).length}`);
}
