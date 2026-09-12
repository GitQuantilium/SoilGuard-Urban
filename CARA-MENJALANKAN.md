# 📖 CARA MENJALANKAN & MENGGUNAKAN SOILGUARD URBAN (v3.6.2)

Panduan lengkap. Bagian: **A** cara buka • **B** cara pakai • **C** sensor
• **D** akun & sync • **E** install ke HP • **F** reset data • **G** troubleshooting
• **H** changelog gabungan.

---

## A. CARA MEMBUKA APLIKASI (pilih salah satu)

### Cara 1 — Buka langsung di browser ✅ (paling gampang)
1. Ekstrak folder `soilguard-app` ke laptop (mis. `D:\SoilGuard`)
2. **Klik dua kali `index.html`** → terbuka di Chrome/Edge
3. Semua fitur analisis jalan **tanpa internet** (grafik, PDF, CSV, riwayat, ML)

### Cara 2 — Aplikasi desktop Electron (fitur penuh + sensor USB)
Syarat sekali: install [Node.js LTS](https://nodejs.org)
```
cd soilguard-app
npm install     (sekali, butuh internet)
npm start       (selanjutnya offline)
```

### Cara 3 — Installer .exe Windows
```
npm run build:win
```
Hasil di `dist/` → `SoilGuard Urban Setup 3.6.2.exe` (ikon sudah tersedia).

### Cara 4 — Dari HP / dari mana saja (hosting)
Host foldernya (Netlify Drop ± 3 menit atau GitHub Pages — lihat
`HOSTING-INSTALL-HP.md`) → buka URL-nya → bisa langsung dipakai **atau**
di-install jadi aplikasi HP (bagian E).

> 💡 Demo KTI: pakai Cara 1/4 + bawa copy-an di flashdisk. Tes dulu di laptop
> yang akan dipakai!

---

## B. CARA MENGGUNAKAN (alur harian)

1. **Buka aplikasi** → layar mulai kosong & jujur (bukan angka demo)
2. **Isi parameter tanah** di panel kiri (slider atau ketik):
   suhu, kelembaban, EC, pH, Nitrogen, Fosfor, Kalium — dari alat uji tanah/sensor
   - **v3.6: tiap parameter ada CENTANG** — alat tidak bisa ukur pH? Hapus centang
     pH → parameter itu dikecualikan dari analisis (skor, radar, saran, PDF, CSV,
     statistik menyesuaikan otomatis). Badge panel menunjukkan "N/7 Parameter"
   - **Sensor auto-adjust**: sensor hanya mengirim EC, N, P, K (tanpa pH)? Setelah
     2 pengiriman, centangan pH otomatis dilepas + notifikasi. Kalau tiba-tiba
     sensor mulai mengirim pH lagi → otomatis dicentang kembali
   - **Pop-up data kurang**: jika parameter aktif kurang dari 4, muncul peringatan
     "hasil mungkin kurang akurat" sebelum analisis jalan (bisa lanjut/batal)
   - Setelan centangan tersimpan (tidak hilang saat aplikasi ditutup)
3. Klik **Analisis & Rekomendasi**
4. Baca hasilnya:
   - **Skor keseluruhan** + status (Sangat Cocok … Sangat Tidak Cocok)
   - **Kartu rekomendasi tanaman** — badge `ML xx%` (bobot machine learning),
     `🌿 angka` (skor keberlanjutan). Rekomendasi hanya tanaman yang **benar-benar
     cocok** (skor akhir ≥ 60 dan skor agronomisnya ≥ 60); kalau tanah masih
     kurang tapi ada tanaman toleran, muncul peringatan kuning penjelasnya
   - **Saran Perbaikan Tanah** — SELALU muncul saat ada yang lemah (dosis dolomit,
     leaching, pupuk N/P/K, "Optimalkan parameter terlemah" berbasis zona optimal
     100 tanaman) + tombol **kalkulator media & dosis**
   - **Radar chart** — 100 = di zona optimal umum
5. **Riwayat** — tiap analisis tersimpan (maks 200) dengan badge sumber:
   Manual ⬜ / Sensor 🟩 / Simulasi 🟨 + statistik rerata skor hijau pilihanmu
6. **Ekspor**: tombol **CSV** (seluruh riwayat, siap Excel — jadi lampiran KTI)
   dan **PDF** (2 halaman: ringkasan + grafik radar + tabel 10 riwayat)
7. **Pengaturan (gear)**: Light/Dark, baud rate, **kalibrasi offset 7 parameter**,
   kontribusi data anonim, **backup/restore file JSON**, reset semua data
8. **Onboarding 4 langkah** muncul sekali di awal (bisa dilewati)

---

## C. SENSOR (tiga jalur — lihat detail di `ALAT-BLUETOOTH.md`)

| Jalur | Cara | Cocok untuk |
|---|---|---|
| **Bluetooth LE** (utama) | Modal "Sensor Terhubung" → **Hubungkan via Bluetooth** → pilih alat "SoilGuard-…" | HP Android & laptop |
| **Jembatan WiFi/Cloud** | Modal koneksi → bagian biru → isi ID alat → **Mulai Jembatan** | Semua perangkat **termasuk iPhone** (butuh SQL 2c) |
| **USB Serial** | Mode Electron: klik "Sensor Terhubung" → pilih port; atau di Chrome: tombol Web Serial | Laptop |

- Format data alat: `t:25.4,h:58,ec:1420,ph:6.4,n:195,p:68,k:275` atau CSV 7 angka
- Kalibrasi offset (Pengaturan) otomatis diterapkan ke semua jalur
- Data sensor otomatis berbadge **Sensor** 🟩 di riwayat; **Live Mode** hanya melabel
  "Sensor" kalau sensor benar-benar nyambung (tanpa sensor = "Live (Simulasi)" kuning)

---

## D. AKUN & SINKRONISASI CLOUD (opsional)

Tanpa login pun aplikasi berfungsi penuh. Login = data bisa diakses dari perangkat lain.

**Setup sekali saja (± 10 menit, gratis):** ikuti `PANDUAN-SUPABASE.md`
(buat project → jalankan SQL 2, 2b, 2c → isi `libs/supabase-config.js`).
⚠️ Jangan lupa atur **Site URL** (bagian 4b) biar link email konfirmasi gak error,
atau matikan "Confirm email" biar daftar langsung masuk.

**Pemakaian:**
1. Tombol **Akun** (kanan atas) → **Daftar Akun Baru** → **Masuk**
2. Klik **Sinkronkan Sekarang** (atau biarkan otomatis: saat login, saat buka app,
   saat kembali online) → riwayat + lokasi custom naik ke PostgreSQL
3. Di perangkat lain: login → sinkron → data turun semua
4. Data yang belum tersinkron dihitung ("N analisis belum tersinkron") — aman offline:
   tersimpan lokal dulu, dikirim begitu online
5. Blok **📊 Statistik aplikasi & komunitas**: jumlah akun, analisis tersinkron,
   kontribusi anonim, rerata parameter komunitas, 5 tanaman terpopuler (bagus untuk Bab IV)

**Privasi:** local-first (cloud hanya cermin), Row Level Security per akun,
kontribusi anonim opt-in & tidak pernah mengirim data Simulasi.

---

## E. INSTALL KE HP (PWA — Android & iOS)

1. Host aplikasinya (lihat `HOSTING-INSTALL-HP.md`):
   - **Netlify Drop**: drag folder → URL langsung jadi
   - **GitHub Pages**: upload semua file → Settings → Pages
2. 🤖 **Android (Chrome)**: buka URL → menu ⋮ → **Install app**
3. 🍎 **iPhone (Safari)**: buka URL → **Share → Add to Home Screen**
4. Buka dari ikon = fullscreen & **jalan offline penuh**
5. Setelah update file di hosting: naikkan versi `CACHE` di `sw.js`
   (pengguna lama buka ulang app 1–2× untuk dapat versi baru)

---

## F. RESET DATA

**Di aplikasi:** Pengaturan → **Reset Semua Data** (bersihkan localStorage perangkat itu).
**Backup dulu** kalau perlu: Pengaturan → **Unduh Cadangan** (file JSON, bisa dipulihkan).

**Di Supabase (SQL Editor → New query → Run; simpan sebagai `reset-data`):**
```sql
-- Reset data sync & statistik saja (akun tetap ada):
delete from public.soilguard_data;
delete from public.public_measurements;
delete from public.sensor_bridge;

-- Reset SEMUA akun (+ data sync-nya ikut terhapus otomatis):
delete from auth.users;
```
Setelah reset akun: pengguna daftar ulang; riwayat lokal di perangkat masing-masing
tetap ada dan akan ter-sync lagi ke cloud saat login (efeknya malah "restore").
Riwayat lokal: 15 → 200 entri (v3.2), dengan proteksi entri belum tersinkron.

---

## G. TROUBLESHOOTING CEPAT

| Masalah | Solusi |
|---|---|
| Tampilan berantakan / ikon kotak | Folder `libs/` & `assets/` ikut ter-copy? (di GitHub: upload SEMUA file, `index.html` di root) |
| Sudah update tapi tampilan lama | Hard refresh: Ctrl+Shift+R (laptop); tutup-buka app PWA 2× (HP) |
| Tombol PDF: jsPDF belum termuat | `libs/jspdf.umd.min.js` hilang → salin ulang folder libs |
| PDF gagal "Type of text must be string" | Sudah diperbaiki di v3.5.3+ — pastikan `index.html` versi terbaru |
| `npm start` error | Jalankan `npm install` dulu; cek Node.js ter-install |
| Build .exe gagal | Pastikan folder `assets/` (ikon) ada |
| Bluetooth tidak tersedia di iPhone | Web Bluetooth iOS = eksperimental → pakai **Jembatan WiFi/Cloud** (bagian C) |
| "Email rate limit exceeded" saat daftar | Lihat `PANDUAN-SUPABASE.md` bagian 4b: matikan Confirm email / pasang SMTP sendiri |
| Klik link konfirmasi email → error | Site URL belum diatur → `PANDUAN-SUPABASE.md` bagian 4b |
| Sync gagal | Cek chip header (🟢 online?); data aman lokal, coba lagi |
| Statistik Akun "belum tersedia" | Jalankan SQL langkah 2b |
| Riwayat hilang di browser | localStorage dibersihkan — biasakan backup JSON / login sync |
| Sensor data gak masuk | Cek format (bagian C); cek baud rate; pesan peringatan kini tampil (tidak diam) |

---

## H. CHANGELOG GABUNGAN

### v3.5.4 — Polesan teks
- Pesan pendaftaran akun disesuaikan (tanpa instruksi verifikasi email bila dimatikan)
- README & panduan ditulis ulang (versi tersinkron 3.5.4)

### v3.5.3 — Akurasi & Supabase
- **Fix panel saran kosong** (definisi tombol kalkulator hilang saat patch → saran tidak muncul saat tanah jelek)
- Rekomendasi syarat ganda (skor akhir ≥ 60 **dan** rule-based ≥ 60; cap skor dihapus — skor tampil apa adanya)
- Saran berbasis **zona optimal umum** + saran "Optimalkan parameter terlemah" (skor < 70 tidak lagi disebut "kondisi baik")
- Peringatan konteks saat tanah kurang tapi ada tanaman toleran
- Pesan error rate-limit email + panduan **4b** (matikan Confirm email, Site URL, SMTP Brevo)

### v3.5.2 — Jembatan WiFi/Cloud
- Fix "Invalid path specified in request URL" (validator konfigurasi + hint)
- **Jembatan WiFi/Cloud** untuk sensor di semua perangkat termasuk iPhone (SQL 2c)
- Diagnostik dukungan Web Bluetooth yang jujur per platform

### v3.5.1 — Anti-kepotong
- Modal panel flex + scroll internal (dvh), overlay scrollable, grid HP 1 kolom, header wrap

### v3.5.0 — Bluetooth LE jalur utama
- Web Bluetooth (Nordic UART), filter "SoilGuard", format sama dengan USB, badge Sensor

### v3.4.0 — Mobile & PWA iOS
- Meta iOS (apple-touch-icon, status bar), safe-area, anti-zoom, ikon maskable, layout HP

### v3.3.0 — Polesan UI
- Fix header tanpa latar, design system CSS (radius/bayangan/slider/modal animasi), favicon, empty state berikon

### v3.2.0 — Statistik & kontribusi
- Kontribusi anonim opt-in (SQL 2b), statistik aplikasi & komunitas, worksheet `UJI-DATA-KTI.md`, `validasi-rentang-est.csv`, fix PDF string

### v3.1.0 — Fitur kelas berat
- 100 tanaman + soft k-NN (Hit@1 67,9% / Presisi@5 60,6%), login & sync PostgreSQL (local-first), chip online/offline, PWA dasar, PDF 2 halaman, onboarding, backup JSON, Green Score, kalkulator dosis, fix 5 tombol mati (Analisis ML/Bandingkan/Lihat Semua/Detail/Pilih)

### v3.0.0 — Fondasi offline & kejujuran
- Semua pustaka lokal (100% offline), tanpa auto-demo, rekomendasi per-tanaman, saran selalu tampil, riwayat berlabel sumber, Live Mode jujur, kalibrasi, radar zona optimal, CSV seluruh riwayat, ikon aplikasi, handler Electron settings, keamanan XSS

### v2.0.0 — Perbaikan integritas data
- Kapasitas riwayat 200, badge sumber data, pesan error sensor, label jujur, sinkron versi & README

### v1.x–2.x — Versi awal (sebelum penulisan ulang)

---

## N.2 — v3.6.2 (ekspor riwayat penuh)
- Tombol **"Riwayat PDF"** baru di header: ekspor SELURUH riwayat (bukan cuma 10 terakhir) ke PDF multi-halaman otomatis — halaman 1: ringkasan (total entri, rata-rata/minimum/maksimum skor, tanaman terbaik terbanyak), lalu tabel lengkap (waktu, lokasi, sumber, skor, status, tanaman, parameter aktif per entri) + nomor halaman otomatis. Pas buat lampiran KTI.

## N.1 — v3.6.1 (fix bug centangan)
- **Fix**: setelan centangan tidak lagi "kembali semua tercentang" saat aplikasi dibuka (urutan init diperbaiki: setelan dimuat sebelum form dirender)
- **Fix**: panel "Pembacaan Saat Ini" kini hanya menampilkan parameter AKTIF + catatan kecil yang tidak diukur; centang batal → daftar langsung menyesuaikan

## N. YANG BARU DI v3.6 (checkbox parameter)

1. ☑️ **Centangan aktif/nonaktif per parameter** — parameter tanpa centang TIDAK
   dipakai & tidak diperhitungkan sama sekali (skor tanaman dengan bobot
   dinormalisasi, ML hanya dimensi aktif, radar/saran/peringatan/panel/CSV/PDF/
   statistik & kontribusi anonim menyesuaikan)
2. 🤖 **Auto-adjust dari sensor**: parameter yang dikirim sensor → otomatis
   dicentang; yang tidak pernah dikirim (setelah ≥ 2 pengiriman) → otomatis
   dihapus centangnya + notifikasi sekali per parameter
3. ⚠️ **Pop-up data kurang**: parameter aktif < 4 → peringatan akurasi sebelum
   analisis (lanjut/batal); badge panel berubah kuning "N/7 Parameter"
4. 💾 Setelan centangan tersimpan; entri riwayat ikut menyimpan parameter aktifnya
   (dibuka kembali = set centangan ikut dipulihkan); CSV punya kolom "Parameter Aktif";
   nilai parameter nonaktif dicetak "tidak diukur"
5. ✅ Audit: semua fungsi & ID utuh; uji logika subset lolos (pH 4.0 aktif = skor 49 →
   nonaktif = 88; formula subset konsisten; 2 parameter pun jalan)

---

## O. YANG BARU DI v4.0 (dwibahasa ID/EN)

1. 🌐 **Bahasa Indonesia 🇮🇩 / English 🇬🇧** — Pengaturan → **Bahasa Aplikasi** → pilih ID/EN (tersimpan permanen, langsung berlaku ke seluruh UI tanpa restart)
2. 📄 **Ekspor ikut berbahasa**: nama file & seluruh isi PDF laporan + PDF riwayat lengkap + header CSV berubah ke bahasa Inggris saat EN (tanggal format en-US)
3. 🧩 Implementasi: kamus i18n ±200 kunci × 2 bahasa, atribut `data-i18n`/`-html`/`-ph`/`-title` untuk elemen statis, fungsi `T()/TF()` untuk string dinamis (termasuk pesan error, pop-up, statistik komunitas)
4. ✅ Audit final: semua fungsi & ID utuh, semua kunci i18n terdefinisi, logika inti + subset parameter lolos smoke test

---

## Q. v4.1.1 — FIX TAMPILAN BERANTAKAN (PENTING!)
- **Tailwind diganti dari Play CDN ke CSS PRE-COMPILED statis** (`libs/tailwind-built.css`, 31 KB)
- **Penyebab masalah sebelumnya**: Tailwind Play CDN meng-generate CSS secara on-the-fly dengan
  scanning DOM — pada beberapa kondisi (browser/HP/hosting tertentu), class responsif seperti
  `xl:col-span-*` dan class dinamis dari JS **tidak ter-generate** → tampilan berantakan
- **Sekarang**: semua class sudah jadi CSS murni yang di-bake di file statis → **identik di semua
  browser & perangkat**, 100% offline, tidak tergantung proses generate runtime
- Fallback CDN tetap ada untuk jaga-jaga
- File baru: `libs/tailwind-built.css` — **WAJIB ikut ter-upload ke hosting!**

## P. YANG BARU DI v4.1 (pemilihan bahasa awal + fix)

1. 🌐 **Pengguna baru diminta pilih bahasa dulu** (🇮🇩 Bahasa Indonesia / 🇬🇧 English) saat pertama membuka — pilihan tersimpan permanen, langsung dipakai seluruh aplikasi & ekspor
2. 🔧 **Fallback CDN** — bila pustaka lokal (Tailwind/FontAwesome) gagal dimuat, otomatis ambil dari CDN sehingga tampilan tidak berantakan
3. 🏷️ **Badge versi di header** (v4.1.0) untuk memudahkan verifikasi file terbaru sudah aktif
4. ✅ Audit lengkap: semua fungsi & ID utuh, logika inti + subset parameter lolos smoke test
