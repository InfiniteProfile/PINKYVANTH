/* PINKYVANTH — infinite fictional Pinky profiles. Vanilla JS, fully offline. */
(function (root) {
  'use strict';

  var BATCH = 300;          // profiles generated per batch
  var START_ID = 100001;    // first numeric profile ID

  /* ---------- Dataset ---------- */
  var REGIONS = {
    'Asia': [
      ['India', ['Sharma', 'Das', 'Patel', 'Singh', 'Gupta', 'Roy', 'Nair', 'Iyer']],
      ['Bangladesh', ['Rahman', 'Akter', 'Begum', 'Hossain', 'Chowdhury', 'Sultana']],
      ['Pakistan', ['Khan', 'Malik', 'Ahmed', 'Siddiqui', 'Qureshi']],
      ['Nepal', ['Thapa', 'Gurung', 'Shrestha', 'Rai']],
      ['Sri Lanka', ['Perera', 'Silva', 'Fernando', 'Jayasinghe']],
      ['Philippines', ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Fernandes']],
      ['Japan', ['Tanaka', 'Sato', 'Suzuki', 'Watanabe', 'Kobayashi']],
      ['South Korea', ['Kim', 'Park', 'Choi', 'Jung', 'Kang']],
      ['Vietnam', ['Nguyen', 'Tran', 'Le', 'Pham']],
      ['Thailand', ['Srisai', 'Chaiyo', 'Wongsa', 'Boonmee']],
      ['Indonesia', ['Wijaya', 'Putri', 'Saputra', 'Lestari']],
      ['UAE', ['Al Mansoori', 'Haddad', 'Nasser', 'Farouk']]
    ],
    'Europe': [
      ['United Kingdom', ['Williams', 'Anderson', 'Taylor', 'Wilson', 'Evans', 'Clarke']],
      ['Germany', ['Muller', 'Schmidt', 'Weber', 'Fischer', 'Becker']],
      ['France', ['Martin', 'Bernard', 'Dubois', 'Laurent', 'Moreau']],
      ['Spain', ['Garcia', 'Fernandez', 'Lopez', 'Martinez', 'Ruiz']],
      ['Italy', ['Rossi', 'Ferrari', 'Esposito', 'Bianchi', 'Romano']],
      ['Portugal', ['Silva', 'Santos', 'Ferreira', 'Pereira']],
      ['Poland', ['Nowak', 'Kowalska', 'Wisniewska', 'Zielinska']],
      ['Sweden', ['Johansson', 'Lindberg', 'Eriksson', 'Nilsson']],
      ['Netherlands', ['de Vries', 'Jansen', 'Bakker', 'Visser']],
      ['Greece', ['Papadakis', 'Nikolaou', 'Georgiou', 'Dimitriou']]
    ],
    'Africa': [
      ['Nigeria', ['Okafor', 'Adeyemi', 'Balogun', 'Eze', 'Ibrahim']],
      ['Kenya', ['Otieno', 'Wanjiru', 'Mwangi', 'Kamau']],
      ['South Africa', ['Naidoo', 'Dlamini', 'van der Merwe', 'Mokoena']],
      ['Egypt', ['Hassan', 'Mostafa', 'Salem', 'Abdelrahman']],
      ['Ghana', ['Mensah', 'Boateng', 'Owusu', 'Asante']],
      ['Morocco', ['Benali', 'El Idrissi', 'Tazi', 'Berrada']],
      ['Ethiopia', ['Alemu', 'Tesfaye', 'Bekele', 'Gebre']]
    ],
    'North America': [
      ['United States', ['Johnson', 'Anderson', 'Davis', 'Miller', 'Thompson', 'Harris']],
      ['Canada', ['Tremblay', 'MacDonald', 'Singh', 'Campbell', 'Roy']],
      ['Mexico', ['Hernandez', 'Gonzalez', 'Ramirez', 'Torres', 'Flores']],
      ['Jamaica', ['Campbell', 'Brown', 'Bailey', 'Grant']],
      ['Costa Rica', ['Vargas', 'Jimenez', 'Rojas', 'Mora']]
    ],
    'South America': [
      ['Brazil', ['Souza', 'Oliveira', 'Lima', 'Costa', 'Almeida']],
      ['Argentina', ['Gomez', 'Diaz', 'Romero', 'Sosa']],
      ['Colombia', ['Rodriguez', 'Castro', 'Ortiz', 'Mejia']],
      ['Chile', ['Soto', 'Munoz', 'Contreras', 'Araya']],
      ['Peru', ['Quispe', 'Huaman', 'Chavez', 'Mendoza']]
    ],
    'Oceania': [
      ['Australia', ['Smith', 'Jones', 'Brown', 'Wilson', 'Taylor']],
      ['New Zealand', ['Walker', 'Ngata', 'Parata', 'Robertson']],
      ['Fiji', ['Naidu', 'Ravuvu', 'Kumar', 'Tuilagi']],
      ['Samoa', ['Faleolo', 'Tuala', 'Leota', 'Matai']]
    ]
  };

  var CATEGORIES = {
    'Creative': ['Graphic Designer', 'Illustrator', 'Photographer', 'Filmmaker', 'Fashion Designer', 'Musician', 'Writer', 'Architect', 'Potter'],
    'Technology': ['Software Engineer', 'Data Analyst', 'UX Designer', 'Game Developer', 'Cybersecurity Analyst', 'Robotics Engineer', 'Product Manager'],
    'Health': ['Doctor', 'Nurse', 'Physiotherapist', 'Nutritionist', 'Pharmacist', 'Psychologist', 'Midwife'],
    'Education': ['Teacher', 'Professor', 'Librarian', 'Language Tutor', 'School Principal', 'Education Researcher'],
    'Business': ['Entrepreneur', 'Accountant', 'Marketing Lead', 'Lawyer', 'Banker', 'Consultant', 'Shop Owner'],
    'Science': ['Marine Biologist', 'Astronomer', 'Chemist', 'Climate Scientist', 'Geologist', 'Botanist', 'Physicist'],
    'Service': ['Chef', 'Pilot', 'Journalist', 'Tour Guide', 'Farmer', 'Firefighter', 'Event Planner', 'Baker'],
    'Sports': ['Yoga Instructor', 'Cricketer', 'Swimmer', 'Football Coach', 'Mountaineer', 'Runner', 'Martial Artist']
  };

  var INTERESTS = ['reading', 'hiking', 'cooking', 'travel', 'painting', 'gardening', 'chess', 'poetry', 'cycling', 'astronomy',
    'photography', 'baking', 'dancing', 'volunteering', 'board games', 'podcasts', 'film nights', 'birdwatching', 'yoga',
    'street food', 'pottery', 'languages', 'knitting', 'stargazing', 'running', 'coffee tasting', 'journaling', 'swimming',
    'open-source', 'calligraphy', 'karaoke', 'sketching', 'tea blending', 'thrift shopping', 'rock climbing', 'origami'];

  var BIO_A = ['Curious by nature,', 'Quietly ambitious,', 'Warm and a little stubborn,', 'Always up before sunrise,',
    'Loves a good plan,', 'Easily distracted by good music,', 'A natural storyteller,', 'Calm in a crisis,',
    'Collects small joys,', 'Proudly bad at karaoke,'];
  var BIO_B = ['works as a {p} in {c}', 'spends the day as a {p} near {c}', 'is building a career as a {p} in {c}',
    'has been a {p} in {c} for {y} years', 'recently moved to {c} to work as a {p}'];
  var BIO_C = ['and dreams of visiting every coastline.', 'and mentors newcomers on weekends.', 'and is happiest with a notebook and tea.',
    'and trades recipes with neighbours.', 'and believes small habits change everything.', 'and keeps a very large plant collection.',
    'and never skips a sunset.', 'and is learning a new language this year.', 'and hosts a monthly game night.',
    'and still writes letters by hand.'];

  var SYL = {
    'Asia': ['ka', 'ra', 'shi', 'mon', 'tan', 'lu', 'pa', 'dha', 'sa', 'vi', 'na', 'ku', 'mi', 'jo'],
    'Europe': ['berg', 'ton', 'vel', 'mar', 'ni', 'bru', 'sol', 'fel', 'den', 'ar', 'lo', 'ven', 'cas', 'wick'],
    'Africa': ['ka', 'bo', 'ru', 'zan', 'mba', 'lo', 'ti', 'nde', 'sa', 'wa', 'ke', 'dou', 'ma', 'ba'],
    'North America': ['port', 'wood', 'lake', 'san', 'rio', 'del', 'fort', 'mont', 'river', 'pine', 'bay', 'cor'],
    'South America': ['sol', 'tu', 'ca', 'ria', 'mar', 'ven', 'pa', 'lo', 'ra', 'sanra', 'cor', 'ibi'],
    'Oceania': ['wai', 'ta', 'ko', 'mu', 'rua', 'bay', 'ho', 'lani', 'ki', 'ra', 'tu', 'pau']
  };
  var CITY_SUFFIX = ['Heights', 'Bay', 'Hills', 'Valley', 'Harbour', 'Gardens', 'Crossing', 'Park', 'Meadows', 'Point'];

  var SKIN = ['#fbd9c3', '#f3c3a0', '#e6a97f', '#cf8d63', '#b57149', '#96553a', '#7a3f2b', '#5e2f21'];
  var HAIR = ['#1b1216', '#2c1a14', '#4a2a1c', '#6b3f22', '#a8662f', '#d9a441', '#8a2b4a', '#c23a7a', '#6b4bbd', '#d9d9e2'];
  var CLOTH = ['#ff2e93', '#ff6fb1', '#9b6bff', '#2a2233', '#ffd6ea', '#c2185b', '#6a3dbf', '#f06292', '#3b2f4a'];
  var BGPAIR = [['#ff2e93', '#9b6bff'], ['#ff6fb1', '#ffd6ea'], ['#9b6bff', '#2a1a40'], ['#c2185b', '#ff6fb1'],
    ['#ffd6ea', '#ff2e93'], ['#2a2233', '#ff2e93'], ['#ff6fb1', '#6a3dbf'], ['#f48fb1', '#512da8']];

  var COUNTRIES = [];       // flat list of {n, r, s}
  var REGION_NAMES = Object.keys(REGIONS);
  REGION_NAMES.forEach(function (r) {
    REGIONS[r].forEach(function (c) { COUNTRIES.push({ n: c[0], r: r, s: c[1] }); });
  });
  var CAT_NAMES = Object.keys(CATEGORIES);

  /* ---------- Deterministic PRNG: same ID always yields the same profile ---------- */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Profile factory (id is a string; never converted to Number) ---------- */
  function makeProfile(id) {
    id = String(id);
    var r = rng(hash(id));
    var co = pick(r, COUNTRIES);
    var cat = pick(r, CAT_NAMES);
    var prof = pick(r, CATEGORIES[cat]);
    var syl = SYL[co.r];
    var city = cap(pick(r, syl) + pick(r, syl)) + ' ' + pick(r, CITY_SUFFIX);
    var interests = [];
    while (interests.length < 3 + Math.floor(r() * 2)) {
      var it = pick(r, INTERESTS);
      if (interests.indexOf(it) < 0) interests.push(it);
    }
    var age = 18 + Math.floor(r() * 48);
    var bio = pick(r, BIO_A) + ' ' + pick(r, BIO_B)
      .replace('{p}', prof.toLowerCase()).replace('{c}', city).replace('{y}', String(1 + Math.floor(r() * Math.max(1, age - 20)))) +
      ' ' + pick(r, BIO_C);
    var bg = pick(r, BGPAIR);
    return {
      id: id,
      name: 'Pinky ' + pick(r, co.s),
      country: co.n, region: co.r, city: city,
      age: age, cat: cat, profession: prof,
      interests: interests, bio: bio,
      av: {
        a: bg[0], b: bg[1], s: pick(r, SKIN), h: pick(r, HAIR), c: pick(r, CLOTH),
        st: Math.floor(r() * 5), sq: r() < 0.3
      }
    };
  }

  /* ---------- Store ---------- */
  var store = {
    list: [], byId: Object.create(null), next: START_ID,
    countryCount: Object.create(null), catCount: Object.create(null),
    addBatch: function (n) {
      var out = [];
      for (var i = 0; i < n; i++) {
        var id = String(store.next++);
        if (store.byId[id]) continue;            // never duplicate an ID
        var p = makeProfile(id);
        store.byId[id] = p; store.list.push(p); out.push(p);
        store.countryCount[p.country] = (store.countryCount[p.country] || 0) + 1;
        store.catCount[p.cat] = (store.catCount[p.cat] || 0) + 1;
      }
      return out;
    }
  };

  /* ---------- Search (pure) ---------- */
  function search(query, opts) {
    opts = opts || {};
    var q = String(query || '').trim();
    var limit = opts.limit || 60, res = [], i, p;
    var fc = opts.country, fcat = opts.cat, fr = opts.region;
    if (q && /^[0-9]+$/.test(q)) {                // numeric ID: exact string comparison only
      p = store.byId[q] || makeProfile(q);        // any numeric ID resolves to its fixed profile
      return [p];
    }
    var ql = q.toLowerCase();
    for (i = 0; i < store.list.length && res.length < limit; i++) {
      p = store.list[i];
      if (fc && p.country !== fc) continue;
      if (fr && p.region !== fr) continue;
      if (fcat && p.cat !== fcat) continue;
      if (ql && (p.id !== q) && p.name.toLowerCase().indexOf(ql) < 0 && p.country.toLowerCase().indexOf(ql) < 0 &&
          p.profession.toLowerCase().indexOf(ql) < 0 && p.cat.toLowerCase().indexOf(ql) < 0) continue;
      res.push(p);
    }
    return res;
  }

  var engine = { makeProfile: makeProfile, store: store, search: search, BATCH: BATCH, COUNTRIES: COUNTRIES };

  if (typeof document === 'undefined') {          // Node / test mode
    if (typeof module !== 'undefined') module.exports = engine;
    return;
  }
  root.PinkyEngine = engine;

  /* ---------- UI ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var feed = $('feed'), sentinel = $('sentinel'), totalEl = $('total');
  var results = $('results'), rgrid = $('rgrid'), rinfo = $('rinfo');
  var input = $('q'), clearBtn = $('clear');
  var state = { region: '', country: '', cat: '', busy: false, renderedCount: 0 };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function avatarHTML(a) {
    return '<div class="av st' + a.st + (a.sq ? ' sq' : '') + '" style="--a:' + a.a + ';--b:' + a.b + ';--s:' + a.s +
      ';--h:' + a.h + ';--c:' + a.c + '" role="img" aria-label="Generated illustrated avatar">' +
      '<i class="hb"></i><i class="bd"></i><i class="hd"></i><i class="hf"></i><i class="bn"></i></div>';
  }

  function cardHTML(p) {
    var tags = p.interests.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join('');
    return '<article class="card" data-id="' + p.id + '">' +
      '<div class="head">' + avatarHTML(p.av) +
      '<div class="who"><h2>' + esc(p.name) + '</h2><span class="pid">ID ' + p.id + '</span></div></div>' +
      '<p class="meta">' + esc(p.profession) + ' <span>&middot; age ' + p.age + '</span><br><span>' +
      esc(p.city) + ', ' + esc(p.country) + '</span></p>' +
      '<p class="bio">' + esc(p.bio) + '</p>' +
      '<div class="tags">' + tags + '</div>' +
      '<span class="fic">Fictional demo profile</span></article>';
  }

  // Append profiles in small chunks so the page never freezes; appending never alters scroll position.
  function renderInto(container, profiles, done) {
    var i = 0, CH = 60;
    (function step() {
      var tpl = document.createElement('template'), html = '';
      for (var n = 0; n < CH && i < profiles.length; n++, i++) html += cardHTML(profiles[i]);
      tpl.innerHTML = html;
      var frag = document.createDocumentFragment();
      frag.appendChild(tpl.content);
      container.appendChild(frag);
      if (i < profiles.length) requestAnimationFrame(step); else if (done) done();
    })();
  }

  function updateStats() {
    totalEl.textContent = store.list.length.toLocaleString('en-US');
    renderCountries();
    renderCats();
  }

  function generateBatch(first) {
    if (state.busy) return;
    state.busy = true;
    var batch = store.addBatch(BATCH);
    updateStats();
    if (first) {                                   // first screen renders synchronously: no blank page
      var tpl = document.createElement('template'), html = '';
      for (var i = 0; i < batch.length; i++) html += cardHTML(batch[i]);
      tpl.innerHTML = html;
      feed.appendChild(tpl.content);
      state.busy = false;
    } else {
      renderInto(feed, batch, function () { state.busy = false; });
    }
  }

  /* Prefetch: when the sentinel is within ~3 screens of the viewport, add another 300. */
  function checkNeed() {
    if (state.busy) return;
    var rect = sentinel.getBoundingClientRect();
    if (rect.top - window.innerHeight < window.innerHeight * 3) generateBatch(false);
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; checkNeed(); });
  }
  function setupInfinite() {
    if ('IntersectionObserver' in window) {
      try {
        new IntersectionObserver(function (e) { if (e[0].isIntersecting) checkNeed(); },
          { rootMargin: '0px 0px 3000px 0px' }).observe(sentinel);
      } catch (err) { /* fall through to scroll listener */ }
    }
    window.addEventListener('scroll', onScroll, { passive: true });   // reliable fallback, always on
    window.addEventListener('resize', onScroll, { passive: true });
    setInterval(function () { if (!state.busy) checkNeed(); }, 1200);  // safety net
  }

  /* ---------- Discovery ---------- */
  function renderRegions() {
    var h = '';
    REGION_NAMES.forEach(function (r) {
      h += '<button type="button" class="tab" data-r="' + r + '" aria-pressed="' + (state.region === r) + '">' + r + '</button>';
    });
    $('regions').innerHTML = h;
  }
  function renderCountries() {
    var box = $('countries');
    if (!state.region) { box.hidden = true; return; }
    box.hidden = false;
    var h = '';
    COUNTRIES.forEach(function (c) {
      if (c.r !== state.region) return;
      h += '<button type="button" class="chip" data-c="' + esc(c.n) + '" aria-pressed="' + (state.country === c.n) + '">' +
        esc(c.n) + '<i>' + (store.countryCount[c.n] || 0) + '</i></button>';
    });
    box.innerHTML = h;
  }
  function renderCats() {
    var h = '';
    CAT_NAMES.forEach(function (c) {
      h += '<button type="button" class="chip" data-k="' + c + '" aria-pressed="' + (state.cat === c) + '">' +
        c + '<i>' + (store.catCount[c] || 0) + '</i></button>';
    });
    $('cats').innerHTML = h;
  }

  /* ---------- Results panel (feed stays intact underneath) ---------- */
  function runSearch() {
    var q = input.value.trim();
    clearBtn.hidden = !q;
    if (!q && !state.region && !state.country && !state.cat) { results.hidden = true; rgrid.innerHTML = ''; return; }
    var list = search(q, { country: state.country, region: state.country ? '' : state.region, cat: state.cat, limit: 60 });
    rgrid.innerHTML = '';
    if (list.length) {
      var tpl = document.createElement('template'), html = '';
      list.forEach(function (p) { html += cardHTML(p); });
      tpl.innerHTML = html;
      rgrid.appendChild(tpl.content);
    }
    var label = [];
    if (q) label.push('"' + q.slice(0, 40) + (q.length > 40 ? '…' : '') + '"');
    if (state.country) label.push(state.country); else if (state.region) label.push(state.region);
    if (state.cat) label.push(state.cat);
    rinfo.textContent = list.length ? (list.length + (list.length === 60 ? '+' : '') + ' found · ' + label.join(' · '))
      : 'No profile matches ' + label.join(' · ') + '. Try another name, country or profession.';
    results.hidden = false;
  }
  function resetFilters() {
    state.region = state.country = state.cat = ''; input.value = '';
    renderRegions(); renderCountries(); renderCats(); runSearch();
  }

  /* ---------- Events ---------- */
  var timer;
  input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(runSearch, 160); });
  $('searchForm').addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(timer); runSearch(); input.blur(); });
  clearBtn.addEventListener('click', function () { input.value = ''; runSearch(); input.focus(); });
  $('rclose').addEventListener('click', resetFilters);
  $('regions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-r]'); if (!b) return;
    state.region = state.region === b.dataset.r ? '' : b.dataset.r; state.country = '';
    renderRegions(); renderCountries(); runSearch();
  });
  $('countries').addEventListener('click', function (e) {
    var b = e.target.closest('[data-c]'); if (!b) return;
    state.country = state.country === b.dataset.c ? '' : b.dataset.c;
    renderCountries(); runSearch();
  });
  $('cats').addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]'); if (!b) return;
    state.cat = state.cat === b.dataset.k ? '' : b.dataset.k;
    renderCats(); runSearch();
  });

  /* ---------- Boot: 300 cards are rendered immediately, before anything else ---------- */
  try {
    renderRegions();
    generateBatch(true);
    setupInfinite();
  } catch (err) {
    console.error('PINKYVANTH error:', err);
    feed.innerHTML = '<p class="notice">Something went wrong while generating profiles. Reload the page to try again.</p>';
  }
})(typeof window !== 'undefined' ? window : this);
