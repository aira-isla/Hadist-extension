/* ============================================================
   script.js — Halal Search
   Clock · random hadith · search
   ============================================================ */

/* ------------------------------------------------------------
   1. Clock — 24 jam, format Indonesia
   ------------------------------------------------------------ */

const clockHourEl = document.getElementById('clockHour');
const clockMinuteEl = document.getElementById('clockMinute');
const clockSecondsEl = document.getElementById('clockSeconds');
const clockDayEl = document.getElementById('clockDay');
const clockDateEl = document.getElementById('clockDate');
const clockColonEl = document.getElementById('clockColon');

const pad2 = (n) => String(n).padStart(2, '0');

/* --- teks jam & tanggal (update tiap detik) --- */

function renderClock() {
  const now = new Date();

  clockHourEl.textContent = pad2(now.getHours());
  clockMinuteEl.textContent = pad2(now.getMinutes());
  clockSecondsEl.textContent = pad2(now.getSeconds());

  /* Tanggal Indonesia: "Selasa" + "23 September 2026" */
  clockDayEl.textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long',
  });

  clockDateEl.textContent = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* Self-correcting tick — selalu jatuh tepat di pergantian detik */
function startClock() {
  renderClock();
  const delay = 1000 - (Date.now() % 1000);
  setTimeout(startClock, delay);
}

/* --- titik dua: berkedip 2x lebih cepat (500ms on / 500ms off) --- */

function blinkColon() {
  const phase = Math.floor(Date.now() / 500) % 2;
  clockColonEl.classList.toggle('is-dim', phase === 1);
}

/* Self-correcting tick untuk kedipan — selalu jatuh di batas 500ms */
function startColonBlink() {
  blinkColon();
  const delay = 500 - (Date.now() % 500);
  setTimeout(startColonBlink, delay);
}

startClock();
startColonBlink();

/* ------------------------------------------------------------
   2. Random hadith
   ------------------------------------------------------------ */

const hadisLoader = new HadisLoader();

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

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function showRandomHadith() {
  const token = ++requestToken;
  const imam = pick(IMAMS);

  const bookPromise = hadisLoader.loadBook(imam.key);

  if (hasRendered) {
    cardEl.classList.add('is-fading');
    await wait(220);
  }

  try {
    const book = await bookPromise;
    if (token !== requestToken) return;

    const entry = pick(book);
    const text = entry.id ?? entry.text ?? entry.hadith ?? '';
    const number = entry.number ?? entry.no ?? '';

    textEl.textContent = text || 'Hadis tidak tersedia.';
    refEl.textContent = number
      ? `HR. Imam ${imam.name} No. ${number}`
      : `HR. Imam ${imam.name}`;

    hasRendered = true;
  } catch (error) {
    if (token !== requestToken) return;

    console.error('Gagal memuat hadis:', error);
    textEl.textContent = 'Maaf, data hadis gagal dimuat.';
    refEl.textContent = 'Periksa koneksi lalu coba lagi';
  } finally {
    if (token === requestToken) {
      requestAnimationFrame(() => cardEl.classList.remove('is-fading'));
    }
  }
}

/* ------------------------------------------------------------
   3. Search + submit button
   ------------------------------------------------------------ */

const searchInput = document.querySelector('.search-input');
const searchSubmit = document.querySelector('.search-submit');

function handleSubmit() {
  const value = searchInput.value.trim();

  if (value) {
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(value);
    window.open(url, '_self');
    searchInput.value = '';
  } else {
    showRandomHadith(); /* empty input = new random hadith */
  }
}

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
});

searchSubmit.addEventListener('click', handleSubmit);

/* ------------------------------------------------------------
   4. Boot
   ------------------------------------------------------------ */

showRandomHadith();
