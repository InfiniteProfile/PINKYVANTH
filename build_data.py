#!/usr/bin/env python3
"""Usage: python3 tools/build_data.py records.json
Reads a JSON array of records, keeps only valid ones (approved, consent, adult, digit-string ID,
no duplicate IDs), keeps input order, writes data/page-XXXX.json (100 per page) and data/manifest.json."""
import json, re, sys, os
PAGE = 100
src = sys.argv[1]
rows = json.load(open(src, encoding='utf-8'))
seen, good = set(), []
for r in rows:
    r['id'] = str(r.get('id', ''))
    ok = (re.fullmatch(r'[0-9]+', r['id']) and str(r.get('name', '')).strip()
          and r.get('status') == 'approved' and r.get('consent') is True and r.get('adult') is True)
    if ok and r['id'] not in seen:
        seen.add(r['id']); good.append(r)
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if re.fullmatch(r'page-\d{4,}\.json', f): os.remove(os.path.join(out, f))
pages = []
for i in range(0, len(good), PAGE):
    name = 'page-%04d.json' % (i // PAGE + 1)
    json.dump(good[i:i + PAGE], open(os.path.join(out, name), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    pages.append(name)
c = {}
for r in good:
    k = (r.get('country', ''), r.get('region', ''))
    if k[0]: c[k] = c.get(k, 0) + 1
json.dump({'pages': pages, 'countries': [{'name': k[0], 'region': k[1], 'count': n} for k, n in sorted(c.items())]},
          open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), indent=1)
print('kept %d of %d records, %d pages' % (len(good), len(rows), len(pages)))
