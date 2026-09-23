/* ============================================================
   script.js — Halal Search
   Clock · random hadith · search
   ============================================================ */

/* ------------------------------------------------------------
   1. Clock & date
   ------------------------------------------------------------ */

class MainFunc {
  constructor(root) {
    this.root = root;
    this.timeEl = root.querySelector('.time');
    this.longEl = root.querySelector('.date-long');
    this.shortEl = root.querySelector('.date-short');
    this.timer = null;
  }

  start() {
    this.render();
    this.timer = setInterval(() => this.render(), 1000);
  }

  stop() {
    clearInterval(this.timer);
  }

  render() {
    const now = new Date();

    let hours = now.getHours();
    const period = hours < 12 ? 'AM' : 'PM';
    hours = hours % 12 || 12;

    const minutes = String(now.getMinutes()).padStart(2, '0');

    // rebuild the clock node so the AM/PM tag keeps its styling
    this.timeEl.textContent = `${hours}:${minutes}`;

    const periodEl = document.createElement('span');
    periodEl.className = 'time-period';
    periodEl.textContent = period;
    this.timeEl.appendChild(periodEl);

    this.longEl.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    this.shortEl.textContent = now.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
}

const clock = new MainFunc(document.querySelector('.time-container'));
clock.start();

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

const hadithBody = document.querySelector('.hadith-body');
const hadithText = document.querySelector('.hadist');
const hadithImam = document.querySelector('.imam');
const hadithCard = document.querySelector('.left-container');

let requestToken = 0; // guards against out-of-order responses
let hasRendered = false; // first load skips the fade-out

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function showRandomHadith() {
  const token = ++requestToken;
  const imam = pick(IMAMS);

  // kick the fetch off immediately so it overlaps the fade-out
  const bookPromise = hadisLoader.loadBook(imam.key);

  if (hasRendered) {
    hadithBody.classList.add('is-fading');
    await wait(240);
  } else {
    hadithText.textContent = 'Memuat hadis…';
    hadithImam.textContent = '—';
  }

  try {
    const book = await bookPromise;

    if (token !== requestToken) return; // a newer request took over

    const entry = pick(book);
    const text = entry.id ?? entry.text ?? entry.hadith ?? '';
    const number = entry.number ?? entry.no ?? '';

    hadithText.textContent = text || 'Hadis tidak tersedia.';
    hadithImam.textContent = number
      ? `HR. Imam ${imam.name} No. ${number}`
      : `HR. Imam ${imam.name}`;

    hasRendered = true;
  } catch (error) {
    if (token !== requestToken) return;

    console.error('Gagal memuat hadis:', error);
    hadithText.textContent = 'Maaf, data hadis gagal dimuat.';
    hadithImam.textContent = 'Periksa koneksi lalu coba lagi';
  } finally {
    if (token === requestToken) {
      requestAnimationFrame(() => hadithBody.classList.remove('is-fading'));
    }
  }
}

/* ------------------------------------------------------------
   3. Search bar
   ------------------------------------------------------------ */

const query = document.querySelector('.search');
const submitSearch = document.querySelector('.submitSearch');

function handleSubmit() {
  const value = query.value.trim();

  if (value) {
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(value);
    window.open(url, '_self');
    query.value = '';
  } else {
    showRandomHadith();
  }
}

query.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  }
});

submitSearch.addEventListener('click', handleSubmit);

/* Desktop-only hover hint: empty input → highlight the hadith card */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  submitSearch.addEventListener('mouseenter', () => {
    if (!query.value.trim()) hadithCard.classList.add('glow');
  });

  submitSearch.addEventListener('mouseleave', () => {
    hadithCard.classList.remove('glow');
  });
}

/* ------------------------------------------------------------
   4. Boot
   ------------------------------------------------------------ */

showRandomHadith();
