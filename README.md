# Magic-a-Ball

A mobile-first virtual Magic 8 Ball. Answers come from a public Google Sheet with
`Answer` and `Person` columns; a dropdown above the ball filters to one person's
answers, and the button below shakes it.

## Run it

```bash
npm run dev     # refresh answers.json, then serve public/ on :3000
```

Or separately:

```bash
npm run fetch   # pull the sheet into public/answers.json
npm start       # serve public/ (PORT=3000 by default)
```

The server prints a LAN URL too, so you can open it on your phone over wifi.

## How the data flows

The page reads the sheet live in the browser — Google's CSV export endpoint sends
CORS headers, so no backend or API key is needed, and edits to the sheet show up
on the next page load. `public/answers.json`, written by `npm run fetch`, is the
offline fallback; there's a small hard-coded answer set as a last resort.

The sheet: <https://docs.google.com/spreadsheets/d/1oXKrOvpjZxp2b5BYWnzTSZ6dVJSHkETO6vxCSoVkQBM/edit>
It must stay shared as "anyone with the link can view".

To point at a different sheet, change `SHEET_ID` in both [src/sheet.js](src/sheet.js)
and the inline script in [public/index.html](public/index.html) (or set
`SHEET_ID=... npm run fetch` for the fallback file only).

## Layout

- [public/index.html](public/index.html) — the whole app: markup, CSS, and JS in one file
- [public/answers.json](public/answers.json) — generated offline fallback
- [src/sheet.js](src/sheet.js) — CSV parsing and sheet fetching for Node
- [src/fetch-answers.js](src/fetch-answers.js) — writes `answers.json`
- [src/server.js](src/server.js) — dependency-free static server

No dependencies; needs Node 18+ for built-in `fetch`.

## Mobile details

- Loads showing the "8" side; shaking rattles the ball, then spins it around to
  the answer window. Changing the person turns the "8" back to the front.
- Sized with `dvh`-friendly flex layout and safe-area insets, so it fits notched screens
- Shake the physical phone to ask (iOS shows an "Enable shake-to-ask" button first,
  since it requires a permission prompt from a user gesture)
- Haptic buzz on shake where `navigator.vibrate` is supported
- Selected person is remembered in `localStorage`
- The same answer never comes up twice in a row
