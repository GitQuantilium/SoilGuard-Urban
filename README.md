# 🌱 SoilGuard Urban v3.6.2

**Sistem Monitoring Multi-Parameter Tanah Urban — Mesin Hybrid (Rule-based + Machine Learning) • Offline-First • PWA Android/iOS • Sensor Bluetooth LE / USB / WiFi-Cloud • Sinkronisasi PostgreSQL Opsional**

Aplikasi web (bisa di-install sebagai aplikasi di HP & laptop, atau dijalankan sebagai
aplikasi desktop Electron) untuk membantu pemilik lahan sempit (urban farming) memilih
tanaman paling sesuai dengan kondisi tanah — lengkap dengan saran perbaikan tanah.

Dikembangkan oleh kelompok siswa XI-F SMA Labschool Bintaro untuk Karya Tulis Ilmiah
(Raden Rasya Zaidan, Kayla Azka Shafira, Muhammad Farzan R., Early Danisha Syafasat).

---

## ✨ Fitur

### 🧠 Mesin Analisis (100% OFFLINE — mati internet pun jalan penuh)
- **100 Tanaman** (34 sayuran, 19 buah, 27 rempah, 11 umbi, 6 kacang, 3 serealia)
  — 27 rentang acuan literatur + 73 rentang estimasi peneliti (ditandai `src: lit/est`)
- **Mesin hybrid**: skor rule-based berbobot (65%) + **soft k-NN machine learning** (35%)
  — ML berjalan lokal di dalam aplikasi, tanpa server
- **Hasil uji model (uji sintetis hold-out, 1000 sampel)**: Hit@1 **67,9%**,
  Presisi@5 **60,6%**, Recall@10 **36,7%** (rerata 23,4 tanaman relevan per sampel —
  acak ≈ 23%). Ukur ulang kapan saja: `node ml-evaluasi.js`
- **Akurasi rekomendasi (v3.5.3)**: syarat ganda — skor akhir ≥ 60 **dan** skor
  rule-based tanaman itu sendiri ≥ 60 (tanaman "diangkat" ML tanpa dasar agronomis
  tidak direkomendasikan); terverifikasi 200 kondisi acak tanpa pelanggaran
- **Saran perbaikan tanah selalu muncul** — dosis dolomit/leaching/pupuk NPK/suhu,
  plus saran "Optimalkan parameter terlemah" berbasis zona optimal umum 100 tanaman
  (termasuk saat skor belum <55 pun dihadapi dengan jujur)
- **7 Parameter + centangan aktif/nonaktif (v3.6)** — alat tidak bisa ukur pH?
  Hapus centang pH-nya: parameter dikecualikan dari skoring (bobot dinormalisasi),
  ML (jarak hanya dimensi aktif), radar, saran, peringatan, CSV, PDF, statistik
  & kontribusi anonim. Sensor yang hanya mengirim sebagian parameter menyesuaikan
  centangan OTOMATIS (aktif/nonaktif + notifikasi). Data kurang dari 4 parameter →
  pop-up peringatan akurasi sebelum analisis
- **7 Parameter**: suhu, kelembaban, EC, pH, N, P, K — input manual, sensor, atau simulasi
- **Radar chart kesesuaian vs zona optimal** • riwayat 200 entri berbadge sumber data
  (Manual ⬜ / Sensor 🟩 / Simulasi 🟨) • grafik Line/Bar/Pie/Tabel • statistik rerata
  skor keberlanjutan pilihan pengguna
- **🌿 Green Score** — skor keberlanjutan tiap tanaman (heuristik kategori + kebutuhan
  air & hara; kacang-kacangan tertinggi karena fiksasi nitrogen)
- **🧮 Kalkulator Media & Dosis** — volume media + dosis kompos/dolomit/NPK untuk
  pot (diameter × tinggi) atau lahan (m²), sadar-pH untuk koreksi dolomit
- **Ekspor**: CSV seluruh riwayat (siap Excel) • laporan PDF 2 halaman (radar + 10
  riwayat terakhir) • **PDF riwayat lengkap multi-halaman** (ringkasan statistik +
  tabel semua entri + parameter aktif per entri — siap lampiran KTI)
- **Kalibrasi offset 7 parameter** • Mode Live jujur (label "Simulasi" bila tanpa sensor)

### 📱 PWA — Install di HP Android & iOS
- Dari hosting (https): Chrome Android → *Install app*; Safari iOS → *Add to Home Screen*
- Jalan **offline penuh** setelah ter-install (service worker menyimpan seluruh aset)
- Layout responsif HP: header wrap, modal anti-terpotong (dvh + scroll internal),
  anti-zoom iOS, safe-area notch, target sentuh ≥ 40px

### 📡 Akuisisi Data Sensor — Tiga Jalur
| Jalur | Perangkat | Keterangan |
|---|---|---|
| **Bluetooth LE** (utama) | HP Android & laptop | Web Bluetooth, Nordic UART Service, alat bernama awalan "SoilGuard" |
| **Jembatan WiFi/Cloud** | Semua, termasuk **iPhone** | Alat POST ke tabel `sensor_bridge` (Supabase) → aplikasi polling tiap 3 dtk |
| **USB Serial** | Laptop | Electron (`npm start`) atau Web Serial (Chrome/Edge browser) |

Format data sama di semua jalur: `t:25.4,h:58,ec:1420,ph:6.4,n:195,p:68,k:275`
atau CSV 7 angka. Firmware contoh ESP32 (BLE + WiFi): `ALAT-BLUETOOTH.md`.

### ☁️ Akun & Sinkronisasi (ONLINE, opsional)
- Login email/password via **Supabase Auth** (PostgreSQL)
- Riwayat & lokasi custom tersinkron antar perangkat — prinsip **local-first**
  (data selalu aman di perangkat; sync gagal = tidak ada data hilang)
- Aturan konflik *data terbaru menang*; entri belum tersinkron dijaga dari pemangkasan
- **Row Level Security**: tiap akun hanya dapat mengakses datanya sendiri
- **📊 Statistik aplikasi & komunitas** di modal Akun (agregat, via SQL `get_app_stats`)
- **Kontribusi data anonim (opt-in)** untuk statistik komunitas — data Simulasi tidak
  pernah dikirim; tabel publik hanya-bisa-tambah (tanpa baca/ubah publik)

### 🌐 Online vs Offline
| Fitur | 🔴 Offline | 🟢 Online |
|---|---|---|
| Analisis hybrid + 100 tanaman + ML | ✅ | ✅ |
| Riwayat, PDF, CSV, kalkulator, kalibrasi | ✅ | ✅ |
| Backup/restore file JSON | ✅ | ✅ |
| Login akun & sinkronisasi cloud | antrian lokal | ✅ |
| Jembatan sensor WiFi/Cloud | ❌ | ✅ |

## ▶️ Cara Menjalankan

**Termudah (tanpa install):** buka `index.html` dengan Chrome/Edge.
**Desktop penuh (sensor USB):**
```bash
cd soilguard-app
npm install
npm start
```
**Build installer Windows:** `npm run build:win` → hasil di `dist/`.
**Host + install ke HP:** lihat `HOSTING-INSTALL-HP.md` (Netlify Drop ± 3 menit
atau GitHub Pages).
**Aktifkan akun & sinkronisasi:** lihat `PANDUAN-SUPABASE.md` (± 10 menit, gratis).

## 🧮 Metode (ringkas)

Skor rule-based per tanaman = rata-rata berbobot 7 sub-skor (pH 1.6, suhu 1.4, EC 1.3,
kelembaban 1.1, N/P/K 0.9; penalti deviasi koefisien 1.85; pH/suhu/EC kritikal <18 → ×0.55).
ML soft k-NN: 2.500 sampel latihan sintetis (25/tanaman, seed deterministik 20260101),
7 fitur dinormalisasi, voting berbobot invers-jarak → skor kemiripan 0–100.
Skor akhir = 0.65×rule + 0.35×ML (tanpa bobot ML → skor aturan penuh).
**Parameter nonaktif (tidak dicentang/tidak diukur) dikecualikan sepenuhnya**:
skoring hanya dari parameter aktif dengan bobot dinormalisasi (Σ bobot aktif),
ML menghitung jarak hanya pada dimensi aktif (matchActive), kritis hanya dari
pH/suhu/EC yang aktif.
Rekomendasi: skor akhir ≥ 60 **dan** skor aturan ≥ 60. Ambang, bobot, dan seed adalah
desain peneliti — dijustifikasi dan diuji dalam KTI.

## 📁 Struktur

```
soilguard-app/
├── index.html              ← seluruh aplikasi (HTML/CSS/JS)
├── main.js                 ← proses utama Electron (serial + settings file)
├── preload.js              ← jembatan aman Electron
├── ml-evaluasi.js          ← ukur ulang metrik ML (node ml-evaluasi.js)
├── manifest.json / sw.js   ← PWA (installable + cache offline)
├── package.json            ← v3.6.2
├── assets/                 ← ikon (png/ico/icns + icon-192/512 + apple-touch-icon)
├── PANDUAN-SUPABASE.md     ← setup akun/sync/statistik (SQL 2, 2b, 2c, batas email)
├── HOSTING-INSTALL-HP.md   ← hosting + install PWA ke Android/iOS
├── ALAT-BLUETOOTH.md       ← protokol BLE/bridge + firmware contoh ESP32
├── UJI-DATA-KTI.md         ← worksheet uji black-box/lapangan/angket
├── validasi-rentang-est.csv← checklist validasi 73 rentang estimasi
└── libs/                   ← pustaka lokal offline: tailwind, chart.js, jspdf (+autotable),
                              fontawesome, font, supabase.js, supabase-config.js,
                              soilguard-ml.js (100 tanaman + ML), soilguard-sync.js
```

## 🧪 Data untuk KTI

- `UJI-DATA-KTI.md` — 10 skenario uji black-box (beserta hasil yang diharapkan),
  tabel uji lapangan alat acuan, angket Likert 8 butir + cara analisisnya
- Statistik penggunaan nyata: modal Akun → blok 📊 (butuh SQL 2b)
- `validasi-rentang-est.csv` — 511 baris (73 tanaman × 7 parameter) untuk
  validasi literatur bertahap

## 📜 Lisensi & Sumber

Dibuat untuk keperluan pendidikan (KTI SMA Labschool Bintaro, tema *Green Future*).
27 rentang tanaman awal bersumber literatur; 73 rentang tambahan adalah estimasi
kompilasi peneliti (ditandai, divalidasi bertahap). Metrik ML adalah uji sintetis
terhadap database — bukan akurasi lapangan. Jalur sensor (BLE/USB/bridge) teruji di
sisi perangkat lunak; uji perangkat fisik dilakukan terpisah dan didokumentasikan.
