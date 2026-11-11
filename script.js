(() => {
'use strict';

/* ---------- Configuration ---------- */
const CONFIG = {
  dataBase: 'data/',          // manifest.json + page-XXXX.json live here
  initialTarget: 300,         // show at least this many profiles when available
  prefetchMargin: 1800,       // px before the end at which the next batch loads
  manifestPollMs: 60000,      // check for newly published pages
  // Moderation inbox. Set ONE of these (see README). Nothing is published without moderator approval.
  submitEndpoint: '',         // e.g. a Formspree / Getform / your own API URL
  contactEmail: ''            // mailto fallback if no endpoint is set
};
const REGIONS = ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'];
const CATEGORIES = ['Artists', 'Students', 'Entrepreneurs', 'Professionals', 'Writers', 'Athletes', 'Creators', 'Scientists', 'Public Figures', 'Other Professions'];

const $ = (s, r = document) => r.querySelector(s);
const state = { manifest: { pages: [], countries: [] }, next: 0, loading: false, seen: new Set(),
  filter: { region: '', country: '', category: '' }, shown: 0, epoch: 0, fails: 0, retryTimer: 0, cache: new Map() };

/* ---------- Helpers ---------- */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;       // textContent only: records are never parsed as HTML
  return n;
}
function toast(msg, ms = 3500) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, ms);
}
async function getJSON(url, bust) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(bust ? url + '?t=' + Date.now() : url, { signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(to); }
}
function getPage(i) {                            // cached; failed fetches are not cached
  const name = state.manifest.pages[i];
  if (!state.cache.has(i)) {
    const p = getJSON(CONFIG.dataBase + name).catch(e => { state.cache.delete(i); throw e; });
    state.cache.set(i, p);
  }
  return state.cache.get(i);
}
/* Only approved, consented, adult records with a digit-string ID are ever displayed. */
function valid(p) {
  return p && typeof p.id === 'string' && /^[0-9]+$/.test(p.id) && typeof p.name === 'string' && p.name.trim() &&
    p.status === 'approved' && p.consent === true && p.adult === true;
}
function matchesFilter(p) {
  const f = state.filter;
  if (f.country && p.country !== f.country) return false;
  if (f.region && p.region !== f.region) return false;
  if (f.category && p.category !== f.category) return false;
  return true;
}

/* ---------- Cards ---------- */
function card(p) {
  const c = el('article', 'card');
  const row = el('div', 'top-row');
  if (p.photo && p.photoConsent === true && /^https:\/\//i.test(p.photo)) {
    const img = el('img', 'avatar'); img.loading = 'lazy'; img.decoding = 'async'; img.width = img.height = 64;
    img.alt = ''; img.referrerPolicy = 'no-referrer'; img.src = p.photo; row.append(img);
  } else row.append(el('div', 'avatar'));
  const head = el('div'); head.append(el('h3', '', p.name));
  const id = el('div', 'pid', 'ID ' + p.id); id.tabIndex = 0; head.append(id);
  row.append(head); c.append(row);
  const meta = [p.country, p.profession].filter(Boolean).join(' · ');
  if (meta) c.append(el('div', 'meta', meta));
  if (p.bio) c.append(el('p', '', p.bio));
  if (Array.isArray(p.interests) && p.interests.length) {
    const t = el('div', 'tags'); p.interests.slice(0, 8).forEach(i => t.append(el('span', 'tag', String(i)))); c.append(t);
  }
  if (Array.isArray(p.achievements) && p.achievements.length) c.append(el('p', '', 'Achievements: ' + p.achievements.join('; ')));
  if (p.created) { const d = new Date(p.created); if (!isNaN(d)) c.append(el('div', 'date', 'Added ' + d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }))); }
  return c;
}
/* Append in small frame-sized chunks so the page never freezes. Appending never moves the viewport. */
function appendCards(list, host) {
  return new Promise(res => {
    let i = 0;
    (function step() {
      const frag = document.createDocumentFragment();
      for (const end = Math.min(i + 25, list.length); i < end; i++) frag.append(card(list[i]));
      host.append(frag);
      i < list.length ? requestAnimationFrame(step) : res();
    })();
  });
}

/* ---------- Infinite feed ---------- */
function wantsMore() {
  if (state.next >= state.manifest.pages.length) return false;
  if (state.shown < CONFIG.initialTarget) return true;
  return $('#sentinel').getBoundingClientRect().top < innerHeight + CONFIG.prefetchMargin;
}
async function fill() {
  if (state.loading || state.retryTimer || !wantsMore()) return;
  state.loading = true; const epoch = state.epoch;
  try {
    const page = await getPage(state.next);
    if (epoch !== state.epoch) return;
    state.next++; state.fails = 0;
    const fresh = [];
    for (const p of Array.isArray(page) ? page : []) {
      if (!valid(p) || state.seen.has(p.id) || !matchesFilter(p)) continue;
      state.seen.add(p.id); fresh.push(p);
    }
    await appendCards(fresh, $('#grid'));
    if (epoch !== state.epoch) return;
    state.shown += fresh.length;
    if (state.next < state.manifest.pages.length) getPage(state.next).catch(() => {});   // warm next batch
  } catch (e) {
    if (epoch === state.epoch) {
      state.fails++;
      const wait = Math.min(30000, 1000 * 2 ** state.fails);
      toast('Connection problem. Retrying shortly.');
      state.retryTimer = setTimeout(() => { state.retryTimer = 0; fill(); }, wait);
    }
  } finally {
    state.loading = false;
    if (epoch === state.epoch) { updateEmpty(); if (!state.retryTimer) queueMicrotask(fill); }
  }
}
function updateEmpty() {
  const done = state.next >= state.manifest.pages.length && !state.loading;
  $('#empty').hidden = !(done && state.shown === 0);
}
function resetFeed() {
  state.epoch++; state.next = 0; state.shown = 0; state.seen = new Set(); state.loading = false;
  clearTimeout(state.retryTimer); state.retryTimer = 0;
  $('#grid').replaceChildren(); $('#empty').hidden = true;
  fill();
}

/* ---------- Discovery ---------- */
function chip(label, pressed, onClick, count) {
  const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', String(pressed));
  if (count != null) b.append(el('small', '', String(count)));
  b.onclick = onClick; return b;
}
function renderDiscovery() {
  const f = state.filter, m = state.manifest;
  const regions = $('#regions'); regions.replaceChildren(chip('All regions', !f.region, () => { f.region = f.country = ''; renderDiscovery(); resetFeed(); }));
  REGIONS.forEach(r => {
    const n = (m.countries || []).filter(c => c.region === r).reduce((a, c) => a + (c.count || 0), 0);
    regions.append(chip(r, f.region === r, () => { f.region = f.region === r ? '' : r; f.country = ''; renderDiscovery(); resetFeed(); }, n));
  });
  const countries = $('#countries'); countries.replaceChildren();
  (m.countries || []).filter(c => c.count > 0 && (!f.region || c.region === f.region)).sort((a, b) => b.count - a.count)
    .forEach(c => countries.append(chip(c.name, f.country === c.name, () => { f.country = f.country === c.name ? '' : c.name; renderDiscovery(); resetFeed(); }, c.count)));
  const cats = $('#categories'); cats.replaceChildren();
  CATEGORIES.forEach(c => cats.append(chip(c, f.category === c, () => { f.category = f.category === c ? '' : c; renderDiscovery(); resetFeed(); })));
}

/* ---------- Search (results open in a panel; the feed and its scroll position are untouched) ---------- */
const norm = s => String(s == null ? '' : s).toLowerCase();
function matchProfile(p, mode, q) {
  if (mode === 'id') return p.id === q;                                   // exact string match, no Number/BigInt parsing
  const ql = norm(q);
  if (mode === 'country') return norm(p.country).includes(ql);
  if (mode === 'profession') return norm(p.profession).includes(ql) || norm(p.category).includes(ql);
  if (mode === 'interests') return (p.interests || []).some(i => norm(i).includes(ql));
  return [p.name, p.country, p.profession, p.bio, (p.interests || []).join(' ')].some(v => norm(v).includes(ql));
}
let searchRun = 0;
async function runSearch(mode, q) {
  const run = ++searchRun, list = $('#resultsList'), seen = new Set(), max = mode === 'id' ? 1 : 200;
  const panel = $('#results'); panel.hidden = false; list.replaceChildren(); $('#resultsCount').textContent = 'Searching…';
  let found = 0, failed = false;
  for (let i = 0; i < state.manifest.pages.length && found < max; i++) {
    let page; try { page = await getPage(i); } catch { failed = true; continue; }
    if (run !== searchRun) return;
    const hits = (Array.isArray(page) ? page : []).filter(p => valid(p) && !seen.has(p.id) && matchProfile(p, mode, q));
    hits.slice(0, max - found).forEach(p => seen.add(p.id));
    await appendCards(hits.slice(0, max - found), list); found += Math.min(hits.length, max - found);
  }
  if (run !== searchRun) return;
  $('#resultsCount').textContent = (found ? found + (found === 1 ? ' match' : ' matches') : 'No matches') + (failed ? ' (some data failed to load)' : '');
}

/* ---------- Forms ---------- */
const dlg = $('#dlg'), form = $('#reqForm');
const TITLES = { submit: 'Add your profile', correct: 'Request a correction', remove: 'Request removal' };
function openForm(type) {
  form.reset(); form.type.value = type; $('#dlgTitle').textContent = TITLES[type]; $('#formNote').textContent = '';
  form.querySelectorAll('[data-for]').forEach(l => { l.hidden = !l.dataset.for.split(' ').includes(type); });
  dlg.showModal();
}
form.addEventListener('submit', async e => {
  e.preventDefault();
  const type = form.type.value, note = $('#formNote');
  if (form.website_hp.value) return;
  if (!form.name.value.trim() || !form.email.validity.valid || !form.email.value) { note.textContent = 'Enter your name and a valid email.'; return; }
  if (type === 'submit' && !(form.adult.checked && form.consent.checked)) { note.textContent = 'Confirm you are 18 or older and consent to publish.'; return; }
  if (type !== 'submit' && !/^[0-9]+$/.test(form.profile_id.value.trim())) { note.textContent = 'Enter the numeric profile ID.'; return; }
  const fd = new FormData(form); fd.delete('website_hp'); fd.set('adult', form.adult.checked); fd.set('consent', form.consent.checked);
  try {
    if (CONFIG.submitEndpoint) {
      const r = await fetch(CONFIG.submitEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
    } else if (CONFIG.contactEmail) {
      const body = [...fd.entries()].filter(([, v]) => typeof v === 'string' && v).map(([k, v]) => k + ': ' + v).join('\n');
      location.href = 'mailto:' + CONFIG.contactEmail + '?subject=' + encodeURIComponent('PINKYVANTH ' + type) + '&body=' + encodeURIComponent(body);
    } else { note.textContent = 'Submissions are not connected yet. The site owner must set a moderation inbox in script.js.'; return; }
    dlg.close(); toast(type === 'submit' ? 'Sent. It will appear after moderator approval.' : 'Request sent.');
  } catch { note.textContent = 'Could not send. Check your connection and try again.'; }
});

/* ---------- Wiring ---------- */
document.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openForm(b.dataset.open); });
$('#dlgCancel').onclick = () => dlg.close();
$('#searchToggle').onclick = function () {
  const bar = $('#searchBar'), open = bar.hidden; bar.hidden = !open; this.setAttribute('aria-expanded', String(open));
  if (open) $('#searchInput').focus(); else { $('#results').hidden = true; searchRun++; }
};
$('#searchBar').addEventListener('submit', e => {
  e.preventDefault();
  const q = $('#searchInput').value.trim(); if (!q) return;
  runSearch($('#searchMode').value, q);
});
$('#resultsClose').onclick = () => { $('#results').hidden = true; searchRun++; };
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#results').hidden) $('#resultsClose').click(); });

/* Observer triggers the next batch early; scroll/resize listener is the fallback and a safety net. */
if ('IntersectionObserver' in window) {
  new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) fill(); }, { rootMargin: '0px 0px ' + CONFIG.prefetchMargin + 'px 0px' }).observe($('#sentinel'));
} else {
  let tick = false;
  const on = () => { if (tick) return; tick = true; requestAnimationFrame(() => { tick = false; fill(); }); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
}

async function loadManifest(first) {
  try {
    const m = await getJSON(CONFIG.dataBase + 'manifest.json', true);
    const grew = Array.isArray(m.pages) && m.pages.length > state.manifest.pages.length;
    state.manifest = { pages: Array.isArray(m.pages) ? m.pages : [], countries: Array.isArray(m.countries) ? m.countries : [] };
    if (first) { renderDiscovery(); fill(); updateEmpty(); } else if (grew) { renderDiscovery(); fill(); }
  } catch { if (first) { toast('Could not load the directory. Retrying…'); setTimeout(() => loadManifest(true), 5000); } }
}
renderDiscovery();
loadManifest(true);
setInterval(() => loadManifest(false), CONFIG.manifestPollMs);
})();
