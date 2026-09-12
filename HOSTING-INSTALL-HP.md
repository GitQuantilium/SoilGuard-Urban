# 📱 HOSTING & INSTALL KE HP — SoilGuard Urban (PWA)

Panduan 10 menit: dari laptop ke HP Android & iPhone. Gratis, tanpa app store.

---

## LANGKAH 1 — Hosting (wajib, PWA butuh alamat https)

Pilih SALAH SATU cara:

### Cara A — Netlify Drop (paling cepat, ± 3 menit) ⭐
1. Buka https://app.netlify.com/drop di browser
2. **Drag & drop seluruh folder `soilguard-app`** ke halaman itu
   (daftar dulu gratis pakai email/Google biar URL-nya permanen)
3. Selesai → dapat URL seperti `https://nama-acak.netlify.app`
4. (Opsional) Site configuration → *Change site name* → ganti jadi
   `soilguard-urban.netlify.app`

### Cara B — GitHub Pages (URL paling permanen)
1. Buat/buka akun github.com → **New repository** (public, mis. `soilguard-urban`)
2. **Upload semua isi folder `soilguard-app`** (Add file → Upload files → drag semuanya → Commit)
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` → Save
4. Tunggu ± 2 menit → URL: `https://USERNAME.github.io/soilguard-urban/`

### Cara C — WiFi lokal (tanpa upload, untuk demo dadakan)
Di laptop (harus terinstall Node.js): buka terminal di folder `soilguard-app` →
```
npx serve -l 3000
```
HP nyambung ke **WiFi yang sama** → buka `http://IP-LAPTOP:3000`
(IP laptop: Windows `ipconfig`, Mac/Linux `ifconfig | grep inet`)
⚠️ Cara C = PWA tidak bisa "di-install", tapi bisa dipakai dari HP. Untuk install, pakai Cara A/B.

---

## LANGKAH 2 — Install ke Home Screen

### 🤖 Android (Chrome)
1. Buka URL aplikasi di Chrome
2. Menu **⋮** → **"Install app"** (atau "Tambahkan ke layar utama")
3. Ikon 🌱 muncul di home screen → buka = fullscreen seperti aplikasi asli

### 🍎 iPhone / iPad (WAJIB Safari)
1. Buka URL aplikasi di **Safari**
2. Tombol **Share** (kotak dengan panah ke atas)
3. Scroll → **"Add to Home Screen"** → Add
4. Ikon muncul di home screen → buka = tampilan standalone (tanpa bar Safari)

---

## Apa yang bisa & tidak bisa di HP

| Fitur | Android | iOS |
|---|---|---|
| Analisis + rekomendasi + ML | ✅ | ✅ |
| Offline penuh (setelah install & dibuka 1× online) | ✅ | ✅ |
| Riwayat, PDF, CSV, backup, kalkulator | ✅ | ✅ |
| Login + sinkronisasi cloud | ✅ | ✅ |
| Kamera/foto (belum ada fiturnya) | — | — |
| Sensor USB serial (Web Serial) | ⚠️ hanya di Chrome desktop | ❌ tidak didukung iOS |

## Kalau ikon belum mau muncul / offline tidak jalan

- Pastikan buka lewat **https** (bukan file://) — coba di Netlify/GitHub Pages
- Android: buka aplikasi 1× saat online dulu (service worker perlu mengunduh cache)
- iOS: setelah "Add to Home Screen", buka dari ikon (bukan dari Safari tab)
- Setelah update file di hosting: pengguna lama perlu buka ulang 1–2×
  (versi cache di `sw.js` harus dinaikkan agar perangkat menarik versi baru)

## Bonus: jadi file .apk (opsional, masih gratis)

Setelah hosting jalan: buka **pwabuilder.com** → tempel URL aplikasi →
*Package for stores* → Android → unduh paket APK → kirim ke HP → install
(izinkan "install aplikasi dari sumber tidak dikenal"). Cara ini membuat aplikasi
terlihat sebagai aplikasi Android "asli" di daftar aplikasi.
