const SHEET_ID = '1oXKrOvpjZxp2b5BYWnzTSZ6dVJSHkETO6vxCSoVkQBM';

const csvUrl = (id = SHEET_ID) =>
  `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;

/**
 * Minimal RFC 4180 CSV parser: handles quoted fields, escaped quotes ("")
 * and newlines inside quotes. Returns an array of row arrays.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }

  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Turns the raw sheet CSV into `[{ answer, person }]`, dropping the blank
 * padding columns/rows Google adds and anything missing either value.
 */
function toEntries(csvText) {
  const rows = parseCsv(csvText).filter((r) => r.some((c) => c.trim() !== ''));
  if (!rows.length) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const answerIdx = header.indexOf('answer');
  const personIdx = header.indexOf('person');

  if (answerIdx === -1 || personIdx === -1) {
    throw new Error(
      `Sheet must have "Answer" and "Person" columns; found: ${header.filter(Boolean).join(', ')}`
    );
  }

  return rows
    .slice(1)
    .map((r) => ({
      answer: (r[answerIdx] || '').trim(),
      person: (r[personIdx] || '').trim(),
    }))
    .filter((e) => e.answer && e.person);
}

async function fetchEntries(id = SHEET_ID) {
  const res = await fetch(csvUrl(id));
  if (!res.ok) {
    throw new Error(`Google Sheets returned ${res.status} ${res.statusText}`);
  }
  return toEntries(await res.text());
}

export { SHEET_ID, csvUrl, parseCsv, toEntries, fetchEntries };
