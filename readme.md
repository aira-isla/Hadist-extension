# Daily Hadist  (support offline mode)

Ekstensi browser yang menampilkan hadis pilihan setiap kali kamu membuka tab baru atau me-refresh tab. Dilengkapi jam real-time dan kotak pencarian. **Stay halal.**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Firefox](https://img.shields.io/badge/Firefox-142%2B-orange)
![Chrome](https://img.shields.io/badge/Chrome%2FEdge%2FBrave-supported-green)

---

## ✨ Fitur

- 📖 Menampilkan hadis acak setiap kali tab baru dibuka
- 🕐 Jam & tanggal real-time
- 🔍 Kotak pencarian — kosongkan kolom & tekan tombol untuk hadis acak
- 🌙 Tema gelap yang nyaman di mata

---

## 📦 Cara Instalasi

### 1. Unduh Source Code

**Opsi A — Via Git  :**

```bash
git clone https://github.com/<username>/<nama-repo>.git
cd <nama-repo>
```

**Opsi B — Via ZIP:**

1. Buka halaman repo di GitHub
2. Klik tombol **Code** → **Download ZIP**
3. Ekstrak file ZIP ke folder pilihanmu

---

### 2. Instalasi di Mozilla Firefox

> **Persyaratan:** Firefox versi **142 atau lebih baru** (sesuai `strict_min_version` pada manifest).

1. Buka Firefox, lalu ketik di address bar:

   ```
   about:debugging#/runtime/this-firefox
   ```

2. Klik tombol **Load Temporary Add-on…**
3. Arahkan ke folder hasil ekstrak, lalu pilih file **`manifest.json`**
4. Ekstensi langsung aktif. Buka tab baru (`Ctrl + T`) untuk mencobanya.

> ⚠️ **Catatan:** Karena dimuat sebagai *temporary add-on*, ekstensi akan hilang saat Firefox ditutup.
>
> Untuk instalasi permanen, pilih salah satu:
>
> - Tandatangani ekstensi lewat [addons.mozilla.org](https://addons.mozilla.org/developers/) (self-distribution), **atau**
> - Gunakan Firefox Developer Edition / Nightly, lalu set `xpinstall.signatures.required` ke `false` di `about:config`, **atau**
> - Jika repo ini menyediakan file `.xpi` di halaman **Releases**, drag-and-drop file tersebut ke jendela Firefox.

---

### 3. Instalasi di Browser Berbasis Chromium

Berlaku untuk **Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi**, dll.

1. Buka halaman ekstensi:
   - Chrome → `chrome://extensions`
   - Edge → `edge://extensions`
   - Brave → `brave://extensions`
2. Aktifkan **Developer mode** (toggle di kanan atas).
3. Klik tombol **Load unpacked**.
4. Pilih **folder hasil ekstrak** (folder yang berisi `manifest.json`).
5. Ekstensi terpasang. Buka tab baru (`Ctrl + T`) — halaman *Daily Hadist* akan tampil.

> ⚠️ **Catatan:**
>
> - Chrome akan menampilkan peringatan *"Disable developer mode extensions"* setiap kali browser dibuka. Ini normal dan bisa diabaikan.
> - Kunci `browser_specific_settings` di `manifest.json` hanya untuk Firefox. Chrome akan mengabaikannya dan mungkin menampilkan warning kecil saat loading — tidak masalah, ekstensi tetap berjalan.
> - `chrome_url_overrides.newtab` **berfungsi** pada ekstensi unpacked, jadi halaman tab baru akan otomatis tergantikan.

---

## 🗂️ Struktur Proyek

```
.
├── main.html              # Halaman tab baru
├── manifest.json          # Konfigurasi ekstensi (MV3)
├── icon/
│   ├── mosque.png
│   └── MagnifyingGlass.svg
└── script/
    ├── style.css
    ├── hadis-loader.js
    └── script.js
```

---

## 🛠️ Pengembangan

Ingin berkontribusi atau memodifikasi?

1. Lakukan perubahan pada file HTML/CSS/JS.
2. **Firefox:** klik **Reload** di `about:debugging`.
3. **Chromium:** klik ikon 🔄 di halaman `chrome://extensions`.
4. Refresh tab baru untuk melihat hasilnya.

---

## 🐛 Pelaporan Bug & Kontribusi

Silakan buka **Issue** atau kirim **Pull Request** melalui halaman GitHub repo ini.

---

## 📄 Lisensi

Lihat file `LICENSE` pada repositori ini untuk detail lisensi.

---

## 👤 Author

**Dev Outpost** — `dailyhadist@devoutpost.com`

> _Stay halal._ 🕌