/* ============================================================
   script.js — Halal Search
   Clock · random hadith · search · idle warm-up
   ============================================================ */

/* ---------- 1. Clock ---------- */

const clockHourEl = document.getElementById('clockHour');
const clockMinuteEl = document.getElementById('clockMinute');
const clockSecondsEl = document.getElementById('clockSeconds');
const clockDayEl = document.getElementById('clockDay');
const clockDateEl = document.getElementById('clockDate');
const clockColonEl = document.getElementById('clockColon');

const pad2 = (n) => String(n).padStart(2, '0');

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long' });

let clockTimer = null;
let colonTimer = null;

function renderClock() {
  const now = new Date();
  clockHourEl.textContent = pad2(now.getHours());
  clockMinuteEl.textContent = pad2(now.getMinutes());
  clockSecondsEl.textContent = pad2(now.getSeconds());
  clockDayEl.textContent = dayFmt.format(now);
  clockDateEl.textContent = dateFmt.format(now);
}

function tickClock() {
  renderClock();
  clockTimer = setTimeout(tickClock, 1000 - (Date.now() % 1000));
}

function tickColon() {
  const dim = Math.floor(Date.now() / 500) % 2 === 1;
  clockColonEl.classList.toggle('is-dim', dim);
  colonTimer = setTimeout(tickColon, 500 - (Date.now() % 500));
}

function startClock() {
  if (clockTimer) return;
  renderClock();
  tickClock();
  tickColon();
}

function stopClock() {
  clearTimeout(clockTimer);
  clockTimer = null;
  clearTimeout(colonTimer);
  colonTimer = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopClock();
  else startClock();
});

startClock();

/* ---------- 2. Random hadith ---------- */

const hadisLoader = new HadisLoader({ maxCachedChunks: 6 });

const IMAMS = [
  { key: 'abu-daud', name: 'Abu-Daud' },
  { key: 'ahmad', name: 'Ahmad' },
  { key: 'bukhari', name: 'Bukhari' },
  { key: 'ibnu-majah', name: 'Ibnu Majah' },
  { key: 'malik', name: 'Malik' },
  { key: 'muslim', name: 'Muslim' },
  { key: 'tirmidzi', name: 'Tirmidzi' },
];

const cardEl = document.querySelector('.quote-card');
const textEl = document.getElementById('hadithText');
const refEl = document.getElementById('hadithRef');

let requestToken = 0;
let hasRendered = false;

const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function showRandomHadith() {
  const token = ++requestToken;
  const imam = pick(IMAMS);

  const promise = hadisLoader.getRandomHadith(imam.key);

  if (hasRendered) {
    cardEl.classList.add('is-fading');
    await wait(180);
  }

 try {
    const { entry, number } = await promise;
    if (token !== requestToken) return; // superseded by a newer click

    console.log( {
      imam: imam.name,
      number,
      text: entry.id,          // Indonesian
      arabic: entry.arab,      // Arabic
    });

    const text = entry?.id ?? entry?.arab ?? '';
    textEl.textContent = text || 'Hadis tidak tersedia.';
    refEl.textContent = (number !== '' && number != null)
      ? `HR. Imam ${imam.name} No. ${number}`
      : `HR. Imam ${imam.name}`;

    hasRendered = true;
  }  catch (err) {
    if (token !== requestToken) return;
    console.error('Gagal memuat hadis:', err);
    textEl.textContent = 'Maaf, data hadis gagal dimuat.';
    refEl.textContent = 'Periksa koneksi lalu coba lagi';
  } finally {
    if (token === requestToken) {
      requestAnimationFrame(() => cardEl.classList.remove('is-fading'));
    }
  }
}

/* ---------- 3. Search ---------- */

const searchInput = document.querySelector('.search-input');
const searchSubmit = document.querySelector('.search-submit');

function handleSubmit() {
  const value = searchInput.value.trim();
  if (value) {
    window.location.href =
      'https://www.google.com/search?q=' + encodeURIComponent(value);
    searchInput.value = '';
  } else {
    showRandomHadith();
  }
}

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
});
searchSubmit.addEventListener('click', handleSubmit);

/* ---------- 4. Boot + idle warm-up ---------- */

showRandomHadith();

const idle = window.requestIdleCallback
  ? window.requestIdleCallback.bind(window)
  : (cb) => setTimeout(cb, 2000);

const nav = navigator;
const lowData = nav.connection?.saveData === true;
const lowMem = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2;

if (!lowData && !lowMem) {
  idle(
    () => {
      (async () => {
        // Pre-load one chunk per book so first click on any imam is instant.
        for (const imam of IMAMS) {
          try {
            await hadisLoader.warm(imam.key, 1);
          } catch {
            /* ignore */
          }
        }
      })();
    },
    { timeout: 4000 },
  );
}
