/* =====================================================================
   SOILGUARD URBAN v3.0 — EVALUASI AKURASI MODEL k-NN
   Jalankan:  node ml-evaluasi.js
   Membaca database tanaman yang BENAR-BENAR dipakai aplikasi
   (27 tanaman dari index.html + 73 tanaman dari libs/soilguard-ml.js),
   lalu mengukur akurasi uji sintetis hold-out dan mencetak hasilnya.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const SGM = require('./libs/soilguard-ml.js');

// --- Ambil 27 tanaman awal langsung dari index.html (satu sumber kebenaran) ---
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/const plantsDatabase = (\[[\s\S]*?\n        \]);/);
if (!m) { console.error('GAGAL: plantsDatabase tidak ditemukan di index.html'); process.exit(1); }
const base27 = (new Function('return ' + m[1]))();

// --- Gabungkan persis seperti yang dilakukan aplikasi ---
const plants = base27.map(p => Object.assign({}, p, { src: p.src || 'lit' }))
    .concat(SGM.PLANTS_EXTRA.map(p => Object.assign({}, p)));

console.log('Database tanaman: ' + base27.length + ' (awal, src lit) + ' + SGM.PLANTS_EXTRA.length + ' (tambahan, src est) = ' + plants.length + ' tanaman');
const perKategori = {};
plants.forEach(p => { perKategori[p.category] = (perKategori[p.category] || 0) + 1; });
console.log('Per kategori:', JSON.stringify(perKategori));
console.log('');

// --- Evaluasi hold-out (seed berbeda untuk latih & uji agar tidak tumpang tindih) ---
const res = SGM.evaluate(plants, { trainPer: 20, testPer: 10, trainSeed: 20260101, testSeed: 20260202 });

console.log('=== HASIL EVALUASI soft k-NN (uji sintetis hold-out) ===');
console.log('Sampel latihan   : ' + res.trainSamples);
console.log('Sampel uji       : ' + res.testSamples);
console.log('Hit@1            : ' + res.hit1 + '%   (peringkat-1 ML berada dalam rentang ideal sampel)');
console.log('Presisi@5        : ' + res.precisionAt5 + '% (dari 5 rekomendasi teratas, berapa % relevan)');
console.log('Recall@10        : ' + res.recallAt10 + '%  (tanaman relevan yang tertutup 10 teratas)');
console.log('Rerata relevan   : ' + res.avgRelevant + ' tanaman memuat tiap sampel uji (rentang tumpang tindih)');
console.log('');
console.log(res.note);
console.log('');
console.log('Angka Hit@1 / Presisi@5 / Recall@10 inilah yang dikutip di KTI');
console.log('DENGAN kalimat lengkap + penjelasan metodenya (jangan potong konteks!).');
