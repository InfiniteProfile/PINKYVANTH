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
