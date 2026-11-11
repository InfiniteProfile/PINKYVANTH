# PINKYVANTH

Static, GitHub Pages-ready: `index.html`, `style.css`, `script.js`, and `data/`.

## Data (genuine records only)
- `data/manifest.json` lists page files in order and per-country counts:
  `{"pages":["page-0001.json"],"countries":[{"name":"India","region":"Asia","count":120}]}`
  Counts must be computed from real approved records (a script can regenerate them).
- Each `data/page-XXXX.json` is an array of ~100 records. Add pages forever; there is no limit. The site polls the manifest and picks up new pages.
- Record schema (all strings unless noted):
  `{"id":"123456789012345678901234567890","name":"Pinky Example","country":"India","region":"Asia",
    "profession":"","category":"Artists","bio":"","interests":["a","b"],"achievements":[],
    "photo":"https://...","photoConsent":true,"created":"2026-01-31",
    "status":"approved","consent":true,"adult":true}`
- IDs are digit strings of any length. Never convert them to numbers.
- The site refuses to display any record without `status:"approved"`, `consent:true`, `adult:true`. Do not include minors.
- `category` is one of: Artists, Students, Entrepreneurs, Professionals, Writers, Athletes, Creators, Scientists, Public Figures, Other Professions.

## Moderation
In `script.js` set `CONFIG.submitEndpoint` (Formspree, Getform, or your own API) or `CONFIG.contactEmail`.
Submissions go to your inbox only. A moderator verifies each one, then adds it to the next page file.
Handle correction and removal requests the same way and remove records promptly.

## Loading your records
`python3 tools/build_data.py records.json` validates the records (approved, consent, adult, digit-string ID, no duplicates),
keeps your order, writes the page files and rebuilds `manifest.json` with real country counts. Re-run it whenever records change.

## View counter (optional)
Set `CONFIG.countEndpoint` in `script.js`. Each page load, every profile scrolled into view sends one `POST {"ids":["123"]}`
and expects `{"counts":{"123":42}}` back with the updated totals. A refresh counts again. GitHub Pages cannot store counts,
so this needs a small backend (for example a Cloudflare Worker with KV). Leave it empty and no counter is shown.
