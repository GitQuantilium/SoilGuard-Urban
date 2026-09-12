# 🧪 PAKET PENGUMPULAN DATA KTI — WORKSHEET SOILGUARD URBAN

Semua template di bawah ini untuk **isi Bab IV** (hasil & pembahasan).
Isi secara jujur — hasil negatif tetap sah sebagai data penelitian!
File pendamping: `validasi-rentang-est.csv` (checklist validasi 73 rentang estimasi).

---

## 1. UJI BLACK-BOX — 10 Skenario (uji fungsi terstruktur)

Cara: buka aplikasi → isi parameter sesuai skenario → klik **Analisis Tanah** →
catat apa yang terjadi. "Hasil diharapkan" sudah gue tulis — cocokkan!

| # | Skenario input (kunci: pH / suhu / lembab / EC / N-P-K) | Hasil yang diharapkan | Hasil aktual | Lolos? |
|---|---|---|---|---|
| 1 | Tanah ideal: pH 6.4, 25.4°C, 58%, EC 1420, N195-P68-K275 | Skor tinggi, muncul ≥ 3 rekomendasi, status "Sangat Cocok" | | |
| 2 | Asam: pH 4.5 (lainnya normal) | Saran "pH Terlalu Asam + dosis dolomit" muncul | | |
| 3 | Basa: pH 8.3 (lainnya normal) | Saran "pH Terlalu Basa (kompos/sulfur)" muncul | | |
| 4 | Garam berlebih: EC 18000 | Saran "Garam Berlebih (leaching)" + peringatan EC sangat tinggi | | |
| 5 | Kering: kelembaban 10% | Saran "Tanah Kering (siram + mulsa)" muncul | | |
| 6 | Hara nol: N 0, P 0, K 0 | Tiga saran pupuk (N/P/K) muncul sekaligus | | |
| 7 | Suhu ekstrem: 50°C | Saran "Suhu Terlalu Panas (naungan/paranet)" muncul | | |
| 8 | Semua parameter ekstrem (pH 4.0, 45°C, 5%, EC 15000, 5-3-5) | Tidak ada rekomendasi + banner "perbaiki langkah demi langkah" + saran tetap tampil | | |
| 9 | Nilai batas diterima: pH 3.0 lalu pH 9.0 | Input valid (tidak ditandai merah), analisis jalan | | |
| 10 | Di luar batas: pH 2.9 (atau 9.1) | Input DITOLAK: kotak merah "Harus 3 - 9", analisis diblok | | |

Tingkat kelulusan yang wajar: 10/10. Kalau ada yang gagal → screenshot & perbaiki/ laporkan.

### 1b. UJI FITUR CENTANGAN PARAMETER (v3.6) — 5 skenario

| # | Skenario | Hasil yang diharapkan | Hasil aktual | Lolos? |
|---|---|---|---|---|
| 11 | Hapus centang pH, isi pH 4.0 (tidak valid utk tanaman), analisis | pH 4.0 TIDAK mempengaruhi skor; panel analisis & radar tanpa pH; catatan "Parameter dikecualikan: pH" | | |
| 12 | Hapus centang sampai hanya 3 parameter, klik Analisis | POP-UP peringatan "data kurang" muncul; Batal = tidak analisis; Lanjut = jalan + skor tercatat | | |
| 13 | (Sensor/bridge) alat kirim tanpa pH sebanyak 2× | Centangan pH otomatis lepas + notifikasi sekali | | |
| 14 | Aktifkan lagi pH di tengah aliran data | Otomatis ter-centang kembali + notifikasi | | |
| 15 | Tutup & buka ulang aplikasi | Setelan centangan tetap seperti terakhir (tersimpan) | | |


---

## 2. UJI LAPANGAN — Perbandingan dengan Alat Acuan (bukti akurasi nyata)

Ambil **3–5 sampel tanah berbeda** (kebun sekolah, pot rumah, taman). Untuk tiap
sampel: ukur dengan aplikasi/alat kalian (A) **dan** alat acuan (B) — pH meter kertas
lakmus/universal indikator, TDS meter murah untuk EC. Ulangi 2× per sampel.

| Sampel | Lokasi (kelurahan) | Parameter | Hasil Aplikasi (A) | Hasil Alat Acuan (B) | Selisih \|A−B\| |
|---|---|---|---|---|---|
| S1 | | pH | | | |
| S1 | | EC (µS/cm) | | | |
| S2 | | pH | | | |
| S2 | | EC (µS/cm) | | | |
| S3 | | pH | | | |
| S3 | | EC (µS/cm) | | | |

Lalu hitung: **rata-rata selisih** & tulis kalimat jujur di Bab IV, contoh:
*"Selisih rata-rata pembacaan pH aplikasi terhadap alat acuan adalah X (n=6 pengukuran, 3 sampel)."*

---

## 3. ANGKET PENGGUNA — 20–30 responden (siswa & guru)

Responden diminta mencoba aplikasi ± 5 menit lalu mengisi skala **1–5**
(5 = Sangat Setuju, 4 = Setuju, 3 = Netral, 2 = Tidak Setuju, 1 = Sangat Tidak Setuju).

| # | Pernyataan | Rerata |
|---|---|---|
| 1 | Aplikasi mudah digunakan | |
| 2 | Tampilan aplikasi menarik dan jelas | |
| 3 | Saya paham arti skor kesesuaian tanaman | |
| 4 | Rekomendasi tanaman terasa masuk akal | |
| 5 | Saran perbaikan tanah berguna dan mudah dipahami | |
| 6 | Kalkulator media & dosis membantu saya menanam | |
| 7 | Saya menjadi lebih tertarik bertanam di lahan sempit | |
| 8 | Saya akan merekomendasikan aplikasi ini ke orang lain | |

**Cara analisis:** hitung rerata tiap butir + rerata keseluruhan → konversi kategori:
1,00–1,80 Sangat Lemah | 1,81–2,60 Lemah | 2,61–3,40 Cukup | 3,41–4,20 Kuat | 4,21–5,00 Sangat Kuat.
Tampilkan juga diagram batang per butir di Bab IV.

---

## 4. CARA PAKAI STATISTIK KOMUNITAS (data penggunaan nyata)

Setelah SQL langkah 2b dijalankan & beberapa orang memakai aplikasi:
buka **modal Akun** → blok "📊 Statistik aplikasi & komunitas" → catat:
- jumlah akun terdaftar & jumlah analisis tersinkron
- jumlah kontribusi anonim + rerata parameter komunitas
- 5 tanaman terpopuler versi komunitas

Kalimat contoh untuk Bab IV: *"Selama masa pengujian, aplikasi melayani N analisis
tersinkron dari M akun; K kontribusi anonim menunjukkan rerata pH X dan tanaman
paling sering direkomendasikan adalah Y."*

---

## 5. VALIDASI RENTANG "est" (73 tanaman)

Buka `validasi-rentang-est.csv` (bisa dibuka di Excel). Untuk tiap baris:
cari sumber (buku budidaya, FAO EcoCrop, jurnal agronomi) → isi kolom
`sumber` + `halaman/URL` → ubah kolom `status` jadi `lit`.
Sudah divalidasi sebagian pun sudah bernilai — tulis progresnya di Bab III
("dari 73 rentang estimasi, X telah divalidasi terhadap literatur").
