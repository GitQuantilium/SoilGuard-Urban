/* =====================================================================
   SOILGUARD URBAN v3.0 — MODUL MACHINE LEARNING (OFFLINE)
   =====================================================================
   Isi:
   1. PLANTS_EXTRA  : 73 tanaman tambahan (total database = 100 tanaman)
                      src:"lit"  = rentang dari 27 tanaman awal (acuan literatur)
                      src:"est"  = rentang estimasi/kompilasi peneliti (tandai untuk validasi)
   2. Mesin k-NN (k-nearest neighbors) — algoritma machine learning
      instance-based yang berjalan 100% OFFLINE di dalam aplikasi.
      Data latih = sampel sintetis yang dibangkitkan dari rentang ideal
      tiap tanaman (seed tetap -> reprodusibel).
   3. evaluate()     : uji akurasi hold-out (bisa dijalankan ulang via ml-evaluasi.js)

   CATATAN KEJUJURAN ILMIH (untuk KTI):
   - Akurasi yang diukur adalah akurasi UJI SINTETIS (kemampuan model mengenali
     kembali rentang ideal dalam database), BUKAN akurasi lapangan.
   - Rentang bertanda "est" perlu validasi literatur lanjutan.
   ===================================================================== */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) { module.exports = factory(); }
    else { root.SoilGuardML = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {

    // ===== 1. DATABASE TAMBAHAN (id 28-100, melanjutkan 27 tanaman awal) =====
    const PLANTS_EXTRA = [
        /* --- SAYURAN --- */
        { id: 28, name: "Kale", category: "Sayuran", emoji: "🥬", ph: [6.0, 7.2], temp: [15, 24], moist: [50, 75], ec: [700, 2100], n: [100, 260], p: [35, 100], k: [150, 330], desc: "Supergreen populer untuk smoothie dan pot.", src: "est" },
        { id: 29, name: "Kailan", category: "Sayuran", emoji: "🥬", ph: [6.0, 7.0], temp: [15, 26], moist: [50, 75], ec: [700, 2000], n: [95, 240], p: [35, 95], k: [140, 320], desc: "Saudara pakcoy, tahan panas sedang.", src: "est" },
        { id: 30, name: "Kol Bunga", category: "Sayuran", emoji: "🥦", ph: [6.0, 7.0], temp: [15, 23], moist: [50, 75], ec: [700, 2050], n: [100, 250], p: [35, 98], k: [145, 320], desc: "Butuh suhu sejuk dan sinar matahari penuh.", src: "est" },
        { id: 31, name: "Seledri", category: "Sayuran", emoji: "🌿", ph: [6.0, 7.0], temp: [15, 24], moist: [55, 80], ec: [750, 2000], n: [90, 240], p: [30, 95], k: [140, 320], desc: "Butuh air stabil, cocok pot dalam.", src: "est" },
        { id: 32, name: "Peterseli", category: "Sayuran", emoji: "🌿", ph: [6.0, 7.0], temp: [15, 25], moist: [45, 70], ec: [650, 1800], n: [80, 210], p: [30, 85], k: [130, 290], desc: "Herbal daun untuk garnish, cepat panen.", src: "est" },
        { id: 33, name: "Arugula", category: "Sayuran", emoji: "🥬", ph: [6.0, 7.0], temp: [15, 26], moist: [45, 70], ec: [650, 1900], n: [85, 220], p: [30, 88], k: [130, 300], desc: "Daun rocket rasa pedas, panen 30 hari.", src: "est" },
        { id: 34, name: "Zucchini", category: "Sayuran", emoji: "🥒", ph: [5.8, 7.0], temp: [20, 30], moist: [50, 78], ec: [900, 2400], n: [110, 280], p: [40, 110], k: [160, 380], desc: "Produktif, butuh pot besar dan ruang.", src: "est" },
        { id: 35, name: "Okra (Labia)", category: "Sayuran", emoji: "🌿", ph: [5.8, 7.0], temp: [24, 33], moist: [45, 72], ec: [800, 2200], n: [90, 240], p: [35, 100], k: [150, 350], desc: "Pecinta panas, cocok iklim tropis.", src: "est" },
        { id: 36, name: "Labu Siam", category: "Sayuran", emoji: "🥒", ph: [5.5, 7.0], temp: [20, 30], moist: [45, 75], ec: [750, 2100], n: [90, 240], p: [35, 100], k: [150, 350], desc: "Mudah tumbuh, tanaman merambat kuat.", src: "est" },
        { id: 37, name: "Labu Kuning", category: "Sayuran", emoji: "🎃", ph: [5.8, 7.0], temp: [21, 31], moist: [48, 76], ec: [780, 2150], n: [92, 245], p: [34, 102], k: [152, 370], desc: "Butuh ruang rambat, panen berlimpah.", src: "est" },
        { id: 38, name: "Oyong", category: "Sayuran", emoji: "🥒", ph: [5.8, 7.0], temp: [22, 32], moist: [50, 78], ec: [750, 2100], n: [90, 240], p: [35, 100], k: [150, 350], desc: "Rambat annual favorit pekarangan.", src: "est" },
        { id: 39, name: "Paria", category: "Sayuran", emoji: "🥒", ph: [5.5, 6.8], temp: [22, 33], moist: [45, 75], ec: [800, 2200], n: [95, 250], p: [35, 105], k: [150, 360], desc: "Buah pahit berkhasiat, mudah di pot.", src: "est" },
        { id: 40, name: "Tomat Ceri", category: "Sayuran", emoji: "🍅", ph: [5.5, 6.8], temp: [18, 29], moist: [45, 72], ec: [900, 2600], n: [110, 300], p: [40, 120], k: [170, 400], desc: "Varian tomat mungil, ideal pot gantung.", src: "est" },
        { id: 41, name: "Cabai Rawit", category: "Sayuran", emoji: "🌶️", ph: [5.5, 6.8], temp: [21, 33], moist: [40, 68], ec: [950, 2800], n: [130, 330], p: [45, 135], k: [180, 430], desc: "Wajib rumah Indonesia, produktif di pot.", src: "est" },
        { id: 42, name: "Bligo (Labu Putih)", category: "Sayuran", emoji: "🎃", ph: [5.8, 7.0], temp: [22, 33], moist: [50, 78], ec: [800, 2200], n: [95, 250], p: [35, 105], k: [160, 380], desc: "Rambat besar, buah penyimpan lama.", src: "est" },
        { id: 43, name: "Asparagus", category: "Sayuran", emoji: "🌿", ph: [6.0, 7.5], temp: [16, 27], moist: [45, 70], ec: [750, 2000], n: [85, 220], p: [35, 95], k: [150, 340], desc: "Tanaman tahunan, panen mulai tahun ke-2.", src: "est" },
        { id: 44, name: "Daun Katuk", category: "Sayuran", emoji: "🌿", ph: [5.5, 6.8], temp: [22, 32], moist: [50, 80], ec: [700, 1900], n: [85, 230], p: [30, 92], k: [140, 330], desc: "Sayuran daun Indonesia, kaya protein.", src: "est" },
        { id: 45, name: "Daun Kelor", category: "Sayuran", emoji: "🌳", ph: [5.5, 7.5], temp: [20, 35], moist: [35, 65], ec: [550, 1700], n: [70, 200], p: [25, 85], k: [120, 300], desc: "Superfood tahan kering, tumbuh cepat.", src: "est" },
        /* --- KACANG-KACANGAN --- */
        { id: 46, name: "Buncis", category: "Kacang", emoji: "🫛", ph: [5.8, 7.0], temp: [16, 27], moist: [45, 70], ec: [700, 1900], n: [70, 190], p: [30, 90], k: [130, 300], desc: "Memperbaiki nitrogen tanah sendiri.", src: "est" },
        { id: 47, name: "Kacang Panjang", category: "Kacang", emoji: "🫛", ph: [5.5, 7.0], temp: [22, 33], moist: [45, 72], ec: [650, 1900], n: [70, 200], p: [30, 92], k: [140, 310], desc: "Tropis, panen harian di musim ramai.", src: "est" },
        /* --- UMBI --- */
        { id: 48, name: "Kentang", category: "Umbi", emoji: "🥔", ph: [5.0, 6.5], temp: [15, 25], moist: [55, 75], ec: [900, 2200], n: [120, 300], p: [40, 110], k: [180, 400], desc: "Butuh tanah gembur dan suhu sejuk.", src: "est" },
        { id: 49, name: "Ubi Jalar", category: "Umbi", emoji: "🍠", ph: [5.5, 6.5], temp: [20, 32], moist: [50, 75], ec: [700, 2000], n: [80, 220], p: [30, 95], k: [150, 350], desc: "Mudah, toleran lahan miskin.", src: "est" },
        { id: 50, name: "Singkong", category: "Umbi", emoji: "🌿", ph: [4.5, 7.0], temp: [22, 35], moist: [40, 70], ec: [500, 1600], n: [60, 180], p: [25, 80], k: [120, 300], desc: "Sangat tangguh, cocok pemula.", src: "est" },
        { id: 51, name: "Bawang Merah", category: "Umbi", emoji: "🧅", ph: [5.5, 6.8], temp: [18, 28], moist: [40, 65], ec: [900, 2300], n: [100, 260], p: [35, 100], k: [150, 360], desc: "Dapur wajib, cocok polybag dalam.", src: "est" },
        { id: 52, name: "Bawang Putih", category: "Umbi", emoji: "🧄", ph: [5.5, 7.0], temp: [15, 27], moist: [40, 65], ec: [900, 2200], n: [90, 240], p: [35, 95], k: [140, 340], desc: "Butuh suhu lebih sejuk saat pembesaran.", src: "est" },
        { id: 53, name: "Bit Merah", category: "Umbi", emoji: "🍠", ph: [6.0, 7.0], temp: [15, 25], moist: [45, 75], ec: [800, 2200], n: [80, 220], p: [30, 95], k: [160, 380], desc: "Akar merah manis, cepat panen.", src: "est" },
        { id: 54, name: "Lengkuas", category: "Umbi", emoji: "🌿", ph: [5.5, 7.0], temp: [22, 32], moist: [45, 70], ec: [700, 1900], n: [70, 200], p: [30, 85], k: [130, 300], desc: "Rempah rimpang, tanaman tahunan.", src: "est" },
        { id: 55, name: "Kencur", category: "Umbi", emoji: "🌿", ph: [5.5, 7.0], temp: [22, 31], moist: [40, 68], ec: [700, 1800], n: [70, 190], p: [30, 80], k: [120, 280], desc: "Rempah berkah (beras kencur), mudah.", src: "est" },
        { id: 56, name: "Daikon (Lobak Putih)", category: "Umbi", emoji: "🥕", ph: [5.8, 7.0], temp: [15, 25], moist: [45, 72], ec: [650, 1900], n: [70, 190], p: [30, 88], k: [140, 290], desc: "Akar putih besar, butuh kedalaman.", src: "est" },
        { id: 57, name: "Talas (Keladi)", category: "Umbi", emoji: "🥔", ph: [5.5, 7.0], temp: [22, 32], moist: [55, 80], ec: [700, 1900], n: [80, 210], p: [30, 90], k: [140, 320], desc: "Suka lembab, daunnya juga ikonik.", src: "est" },
        { id: 58, name: "Temu Lawak", category: "Umbi", emoji: "🌿", ph: [5.5, 7.0], temp: [22, 32], moist: [45, 72], ec: [700, 1900], n: [75, 205], p: [30, 88], k: [135, 300], desc: "Rimpang obat, tumbuh besar.", src: "est" },
        /* --- KACANG (LANJUTAN) --- */
        { id: 59, name: "Kacang Hijau", category: "Kacang", emoji: "🌱", ph: [5.5, 7.0], temp: [25, 33], moist: [40, 65], ec: [500, 1600], n: [60, 180], p: [25, 85], k: [120, 300], desc: "Panen < 60 hari, sangat mudah.", src: "est" },
        { id: 60, name: "Kacang Tanah", category: "Kacang", emoji: "🥜", ph: [5.5, 6.5], temp: [22, 32], moist: [40, 70], ec: [600, 1800], n: [60, 190], p: [30, 95], k: [130, 320], desc: "Memperbaiki kadar nitrogen tanah.", src: "est" },
        { id: 61, name: "Kedelai", category: "Kacang", emoji: "🌱", ph: [5.5, 7.0], temp: [20, 30], moist: [45, 70], ec: [700, 2000], n: [70, 200], p: [30, 95], k: [140, 330], desc: "Sumber protein, butuh sinar penuh.", src: "est" },
        { id: 62, name: "Kacang Merah", category: "Kacang", emoji: "🫘", ph: [5.8, 7.0], temp: [18, 28], moist: [40, 68], ec: [650, 1800], n: [70, 190], p: [30, 90], k: [130, 300], desc: "Cocok dataran sedang, panen kering.", src: "est" },
        /* --- SEREALIA --- */
        { id: 63, name: "Padi (Pot)", category: "Serealia", emoji: "🌾", ph: [5.5, 6.5], temp: [22, 33], moist: [70, 95], ec: [700, 2000], n: [90, 260], p: [30, 100], k: [150, 380], desc: "Proyek edukasi: padi mini di ember.", src: "est" },
        { id: 64, name: "Gandum (Dataran Tinggi)", category: "Serealia", emoji: "🌾", ph: [6.0, 7.0], temp: [13, 24], moist: [45, 70], ec: [700, 1900], n: [85, 225], p: [30, 92], k: [140, 330], desc: "Butuh malam sejuk, eksperimen menarik.", src: "est" },
        { id: 65, name: "Quinoa", category: "Serealia", emoji: "🌾", ph: [6.0, 7.5], temp: [15, 25], moist: [40, 68], ec: [650, 1800], n: [75, 205], p: [30, 90], k: [130, 300], desc: "Superfood biji, toleran tanah kurang.", src: "est" },
        /* --- BUAH --- */
        { id: 66, name: "Pepaya", category: "Buah", emoji: "🍈", ph: [6.0, 7.0], temp: [22, 33], moist: [45, 75], ec: [800, 2300], n: [100, 260], p: [35, 105], k: [160, 380], desc: "Cepat berbuah, cocok halaman kecil.", src: "est" },
        { id: 67, name: "Pisang (Pot)", category: "Buah", emoji: "🍌", ph: [5.5, 7.0], temp: [24, 33], moist: [50, 80], ec: [800, 2400], n: [110, 300], p: [35, 110], k: [200, 450], desc: "Pisang cavendish/ambon mini di pot besar.", src: "est" },
        { id: 68, name: "Jeruk Lemon", category: "Buah", emoji: "🍋", ph: [5.5, 6.8], temp: [18, 30], moist: [45, 72], ec: [850, 2300], n: [95, 250], p: [35, 100], k: [160, 380], desc: "Lemon pot dwarf, wajib sinar penuh.", src: "est" },
        { id: 69, name: "Jeruk Nipis", category: "Buah", emoji: "🍋", ph: [5.5, 6.8], temp: [20, 32], moist: [45, 72], ec: [850, 2300], n: [95, 250], p: [35, 100], k: [160, 380], desc: "Tropis produktif, favorit dapur.", src: "est" },
        { id: 70, name: "Jeruk Manis", category: "Buah", emoji: "🍊", ph: [6.0, 7.0], temp: [20, 32], moist: [45, 75], ec: [850, 2400], n: [100, 260], p: [35, 105], k: [170, 400], desc: "Butuh panas cukup agar manis.", src: "est" },
        { id: 71, name: "Mangga (Pot)", category: "Buah", emoji: "🥭", ph: [5.5, 7.0], temp: [24, 34], moist: [40, 70], ec: [750, 2200], n: [90, 240], p: [30, 100], k: [160, 380], desc: "Mangga harum manis dwarf di pot.", src: "est" },
        { id: 72, name: "Jambu Biji (Pot)", category: "Buah", emoji: "🍏", ph: [5.5, 7.2], temp: [22, 34], moist: [40, 72], ec: [750, 2200], n: [90, 240], p: [30, 100], k: [160, 390], desc: "Sangat toleran, cepat berbuah.", src: "est" },
        { id: 73, name: "Sirsak", category: "Buah", emoji: "🍈", ph: [5.5, 7.0], temp: [22, 33], moist: [45, 75], ec: [750, 2100], n: [90, 240], p: [30, 98], k: [160, 380], desc: "Buah besar, butuh pot sangat besar.", src: "est" },
        { id: 74, name: "Markisa", category: "Buah", emoji: "🍇", ph: [5.8, 7.0], temp: [20, 31], moist: [45, 75], ec: [800, 2200], n: [95, 250], p: [35, 105], k: [160, 380], desc: "Rambat buah, butuh pergola/trending.", src: "est" },
        { id: 75, name: "Buah Naga", category: "Buah", emoji: "🐉", ph: [5.5, 7.0], temp: [21, 34], moist: [35, 65], ec: [650, 1900], n: [70, 200], p: [30, 95], k: [140, 350], desc: "Kaktus buah, tahan kering, ikonik.", src: "est" },
        { id: 76, name: "Nanas (Pot)", category: "Buah", emoji: "🍍", ph: [5.0, 6.5], temp: [20, 32], moist: [45, 70], ec: [650, 2000], n: [70, 210], p: [25, 90], k: [140, 340], desc: "Suka asam, tanpa biji, unik di pot.", src: "est" },
        { id: 77, name: "Kelengkeng (Pot)", category: "Buah", emoji: "🍇", ph: [5.5, 7.0], temp: [22, 33], moist: [40, 70], ec: [750, 2100], n: [90, 230], p: [30, 95], k: [150, 360], desc: "Buah klimakterik populer pot dwarf.", src: "est" },
        { id: 78, name: "Anggur (Pot)", category: "Buah", emoji: "🍇", ph: [5.8, 7.2], temp: [18, 30], moist: [45, 72], ec: [850, 2300], n: [95, 250], p: [35, 105], k: [160, 390], desc: "Butuh pemangkasan dan sinar penuh.", src: "est" },
        { id: 79, name: "Delima (Pot)", category: "Buah", emoji: "🍎", ph: [5.5, 7.2], temp: [22, 35], moist: [35, 65], ec: [650, 1900], n: [70, 200], p: [30, 95], k: [150, 370], desc: "Tahan kering, buah melimpah di pot.", src: "est" },
        { id: 80, name: "Kopi (Pot)", category: "Buah", emoji: "☕", ph: [5.5, 6.5], temp: [18, 26], moist: [50, 78], ec: [750, 2100], n: [90, 240], p: [30, 95], k: [150, 350], desc: "Kopi arabika pot, suka naungan & asam.", src: "est" },
        /* --- REMPAH & HERBAL --- */
        { id: 81, name: "Teh (Pot)", category: "Rempah", emoji: "🍵", ph: [4.5, 5.5], temp: [18, 27], moist: [55, 80], ec: [650, 1900], n: [90, 240], p: [30, 90], k: [140, 330], desc: "Pecinta tanah asam, daun untuk teh.", src: "est" },
        { id: 82, name: "Basil Genovese", category: "Rempah", emoji: "🌿", ph: [5.8, 7.0], temp: [18, 30], moist: [45, 72], ec: [700, 1900], n: [80, 220], p: [30, 90], k: [130, 300], desc: "Basil pasta pesto, wangi kuat.", src: "est" },
        { id: 83, name: "Thyme", category: "Rempah", emoji: "🌿", ph: [5.5, 7.0], temp: [15, 28], moist: [30, 58], ec: [600, 1700], n: [65, 180], p: [28, 80], k: [120, 290], desc: "Herbal kering-toleran untuk masakan barat.", src: "est" },
        { id: 84, name: "Sage", category: "Rempah", emoji: "🌿", ph: [5.8, 7.0], temp: [15, 28], moist: [32, 60], ec: [600, 1700], n: [65, 185], p: [28, 80], k: [120, 290], desc: "Daun abu-abu aromatik, tahan kering.", src: "est" },
        { id: 85, name: "Lavender", category: "Rempah", emoji: "🌸", ph: [6.0, 8.0], temp: [15, 30], moist: [28, 55], ec: [550, 1600], n: [55, 160], p: [25, 75], k: [110, 280], desc: "Toleran basa & kering, pengusir nyamuk.", src: "est" },
        { id: 86, name: "Chamomile", category: "Rempah", emoji: "🌼", ph: [5.8, 7.2], temp: [15, 27], moist: [38, 65], ec: [600, 1700], n: [60, 175], p: [25, 78], k: [110, 270], desc: "Bunga teh menenangkan, mudah dari biji.", src: "est" },
        { id: 87, name: "Ketumbar (Cilantro)", category: "Rempah", emoji: "🌿", ph: [6.0, 7.5], temp: [15, 25], moist: [40, 68], ec: [650, 1800], n: [70, 195], p: [28, 82], k: [120, 280], desc: "Daun ketumbar, cepat bolos panas.", src: "est" },
        { id: 88, name: "Dill", category: "Rempah", emoji: "🌿", ph: [5.8, 7.0], temp: [15, 25], moist: [40, 70], ec: [650, 1800], n: [70, 195], p: [28, 82], k: [120, 280], desc: "Herbal untaian untuk ikan & acar.", src: "est" },
        { id: 89, name: "Adas (Fennel)", category: "Rempah", emoji: "🌿", ph: [5.8, 7.2], temp: [16, 27], moist: [40, 68], ec: [650, 1800], n: [70, 190], p: [28, 80], k: [125, 285], desc: "Biji & umbi dimakan, aromatik.", src: "est" },
        { id: 90, name: "Stevia", category: "Rempah", emoji: "🍃", ph: [6.0, 7.5], temp: [18, 30], moist: [45, 72], ec: [650, 1800], n: [70, 190], p: [28, 82], k: [120, 280], desc: "Pemanis alami 0 kalori dari daun.", src: "est" },
        { id: 91, name: "Pandan", category: "Rempah", emoji: "🌿", ph: [5.5, 7.0], temp: [22, 33], moist: [55, 82], ec: [700, 1900], n: [80, 215], p: [30, 88], k: [130, 300], desc: "Wajib dapur Indonesia, suka lembab.", src: "est" },
        { id: 92, name: "Kayu Manis (Pot)", category: "Rempah", emoji: "🌿", ph: [5.5, 6.8], temp: [20, 30], moist: [45, 72], ec: [700, 1900], n: [80, 210], p: [30, 88], k: [135, 310], desc: "Kulit batik kayu manis, tanaman tahunan.", src: "est" },
        { id: 93, name: "Rosella", category: "Rempah", emoji: "🌺", ph: [5.5, 7.0], temp: [20, 32], moist: [40, 70], ec: [650, 1850], n: [70, 200], p: [28, 88], k: [130, 310], desc: "Kelopak untuk teh merah segar.", src: "est" },
        { id: 94, name: "Kumis Kucing", category: "Rempah", emoji: "🌿", ph: [5.5, 7.0], temp: [20, 31], moist: [45, 72], ec: [650, 1800], n: [70, 195], p: [28, 85], k: [125, 290], desc: "Tanaman obat batuk & kencing manis.", src: "est" },
        { id: 95, name: "Sambung Nyawa", category: "Rempah", emoji: "🌿", ph: [5.5, 7.0], temp: [21, 32], moist: [48, 76], ec: [680, 1850], n: [75, 205], p: [28, 88], k: [128, 295], desc: "Tanaman obat populer, stek mudah.", src: "est" },
        { id: 96, name: "Salam", category: "Rempah", emoji: "🌿", ph: [5.5, 7.0], temp: [20, 32], moist: [40, 70], ec: [700, 1900], n: [80, 215], p: [30, 90], k: [135, 310], desc: "Daun salam dapur, pohon pot tahunan.", src: "est" },
        { id: 97, name: "Sirih", category: "Rempah", emoji: "🍃", ph: [5.5, 7.0], temp: [20, 33], moist: [50, 78], ec: [700, 1900], n: [75, 210], p: [28, 88], k: [130, 300], desc: "Tanaman obat merambat, mudah dirawat.", src: "est" },
        { id: 98, name: "Lidah Buat", category: "Rempah", emoji: "🌵", ph: [5.5, 7.5], temp: [18, 35], moist: [25, 55], ec: [550, 1600], n: [50, 150], p: [22, 72], k: [105, 265], desc: "Sukulen obat, jangan terlalu sering siram.", src: "est" },
        { id: 99, name: "Ruku-Ruku (Kemangi Suci)", category: "Rempah", emoji: "🌿", ph: [5.5, 7.0], temp: [18, 31], moist: [42, 70], ec: [650, 1850], n: [70, 200], p: [28, 86], k: [125, 295], desc: "Holy basil, sedikit lebih pedas dari kemangi.", src: "est" },
        { id: 100, name: "Kenikir", category: "Sayuran", emoji: "🌼", ph: [5.5, 7.0], temp: [20, 31], moist: [45, 72], ec: [650, 1800], n: [70, 195], p: [28, 85], k: [125, 290], desc: "Lalapan khas, bunganya cantik.", src: "est" }
    ];

    // ===== 2. MESIN k-NN (OFFLINE) =====
    // Rentang normalisasi fitur — HARUS SAMA dengan sensorLimits di index.html
    const FEATURE_LIMITS = {
        temp: { min: -10, max: 55 },
        moist: { min: 0, max: 100 },
        ec: { min: 0, max: 20000 },
        ph: { min: 3, max: 9 },
        n: { min: 0, max: 1999 },
        p: { min: 0, max: 1999 },
        k: { min: 0, max: 1999 }
    };
    const KEYS = ['ph', 'temp', 'moist', 'ec', 'n', 'p', 'k'];

    // RNG deterministik (mulberry32) supaya hasil reprodusibel untuk KTI
    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function normalizeVec(r) {
        return KEYS.map(key => {
            const lim = FEATURE_LIMITS[key];
            const v = (Number(r[key]) - lim.min) / (lim.max - lim.min);
            return Math.max(0, Math.min(1, v));
        });
    }

    // Bangun baris sampel -> (dipakai predict & evaluate)
    function genSamples(plants, perPlant, seed) {
        const rng = mulberry32(seed);
        const samples = [];
        plants.forEach(plant => {
            for (let i = 0; i < perPlant; i++) {
                const raw = {};
                KEYS.forEach(key => {
                    const [lo, hi] = plant[key];
                    raw[key] = lo + rng() * (hi - lo);
                });
                samples.push({ label: plant.id, v: normalizeVec(raw), raw: raw });
            }
        });
        return samples;
    }

    // Latih model (instance-based: simpan sampel; tak ada fase optimasi berat)
    // k = null berarti SEMUA sampel ikut memberi bobot (soft k-NN)
    function buildModel(plants, opts) {
        const o = Object.assign({ samplesPerPlant: 25, seed: 20260101, k: null }, opts || {});
        return {
            type: 'softknn',
            k: o.k,
            samples: genSamples(plants, o.samplesPerPlant, o.seed),
            plantCount: plants.length,
            samplesPerPlant: o.samplesPerPlant,
            seed: o.seed,
            featureKeys: KEYS.slice()
        };
    }

    // Voting berbobot invers-jarak atas vektor yang SUDAH dinormalisasi.
    // Mengembalikan ranking PENUH seluruh tanaman (weight turun monoton vs jarak).
    function predictVec(model, qvec, k) {
        const useAll = !(typeof k === 'number' && k > 0) && !(typeof model.k === 'number' && model.k > 0);
        const scored = model.samples.map(s => {
            let sum = 0;
            for (let i = 0; i < 7; i++) { const d = s.v[i] - qvec[i]; sum += d * d; }
            return { label: s.label, dist: Math.sqrt(sum) };
        });
        scored.sort((a, b) => a.dist - b.dist);
        const voters = useAll ? scored : scored.slice(0, (typeof k === 'number' && k > 0) ? k : model.k);
        const weights = {};
        voters.forEach(s => {
            weights[s.label] = (weights[s.label] || 0) + 1 / (s.dist + 1e-6);
        });
        const maxW = Math.max.apply(null, Object.keys(weights).map(k2 => weights[k2]));
        const ranked = Object.keys(weights)
            .map(id => ({ id: Number(id), weight: weights[id], pct: Math.round(weights[id] / maxW * 100) }))
            .sort((a, b) => b.weight - a.weight);
        return { ranked, weights };
    }

    // Prediksi dari pembacaan mentah (dinormalisasi dulu)
    function predict(model, readings, k) {
        return predictVec(model, normalizeVec(readings), k);
    }

    // Cocokkan pembacaan tanah -> peta kemiripan {plantId: 0-100}
    function match(model, readings) {
        const { ranked } = predict(model, readings);
        const sim = {};
        ranked.forEach(r => { sim[r.id] = r.pct; });
        return { sim, ranked };
    }

    // ===== REVISI v3.6: match dengan SUBSET parameter aktif =====
    // Jarak dihitung hanya pada dimensi yang aktif (dinormalisasi per jumlah dimensi
    // agar skornya sebanding); berguna saat alat tidak mengukur semua parameter.
    function matchActive(model, readings, keys) {
        const ks = (keys && keys.length) ? keys : KEYS;
        const idx = ks.map(k => KEYS.indexOf(k)).filter(i => i !== -1);
        const q = normalizeVec(readings);
        const useAll = !(typeof model.k === 'number' && model.k > 0);
        const scored = model.samples.map(s => {
            let sum = 0;
            for (let j = 0; j < idx.length; j++) {
                const i = idx[j];
                const d = s.v[i] - q[i];
                sum += d * d;
            }
            return { label: s.label, dist: Math.sqrt(sum / Math.max(1, idx.length)) };
        });
        scored.sort((a, b) => a.dist - b.dist);
        const voters = useAll ? scored : scored.slice(0, model.k);
        const weights = {};
        voters.forEach(s => {
            weights[s.label] = (weights[s.label] || 0) + 1 / (s.dist + 1e-6);
        });
        const maxW = Math.max.apply(null, Object.keys(weights).map(k2 => weights[k2]));
        const ranked = Object.keys(weights)
            .map(id => ({ id: Number(id), weight: weights[id], pct: Math.round(weights[id] / maxW * 100) }))
            .sort((a, b) => b.weight - a.weight);
        const sim = {};
        ranked.forEach(r => { sim[r.id] = r.pct; });
        return { sim, ranked };
    }

    // Evaluasi kualitas REKOMENDASI (framing yang benar untuk data rentang yang
    // saling tumpang tindih — BUKAN akurasi klasifikasi 1-label):
    //   - sampel uji sintetis dibangkitkan di dalam rentang ideal suatu tanaman
    //   - "relevan" = semua tanaman yang rentang idealnya MEMuat sampel itu
    //   - Presisi@5  : dari 5 teratas ML, berapa % yang relevan
    //   - Recall@10  : berapa % tanaman relevan ditemukan dalam 10 teratas
    //   - Hit@1      : apakah peringkat 1 relevan
    function evaluate(plants, opts) {
        const o = Object.assign({ trainPer: 20, testPer: 10, trainSeed: 20260101, testSeed: 20260202 }, opts || {});
        const train = genSamples(plants, o.trainPer, o.trainSeed);
        const model = { type: 'softknn', k: null, samples: train };
        const test = genSamples(plants, o.testPer, o.testSeed);

        let hit1 = 0, p5sum = 0, r10sum = 0, relTotal = 0;
        test.forEach(t => {
            // himpunan tanaman relevan: rentang ideal memuat seluruh nilai sampel
            const relevant = new Set();
            plants.forEach(p => {
                let inside = true;
                for (let i = 0; i < KEYS.length; i++) {
                    const key = KEYS[i];
                    if (t.raw[key] < p[key][0] || t.raw[key] > p[key][1]) { inside = false; break; }
                }
                if (inside) relevant.add(p.id);
            });
            relTotal += relevant.size;

            const { ranked } = predictVec(model, t.v);
            if (relevant.has(ranked[0].id)) hit1++;
            const top5 = ranked.slice(0, 5).filter(r => relevant.has(r.id)).length;
            p5sum += top5 / 5;
            const top10 = ranked.slice(0, 10).filter(r => relevant.has(r.id)).length;
            r10sum += relevant.size ? top10 / relevant.size : 0;
        });

        const n = test.length;
        return {
            testSamples: n,
            trainSamples: train.length,
            hit1: Math.round(hit1 / n * 1000) / 10,          // % peringkat-1 relevan
            precisionAt5: Math.round(p5sum / n * 1000) / 10, // % dari top-5 yang relevan
            recallAt10: Math.round(r10sum / n * 1000) / 10,  // % tanaman relevan tertutup top-10
            avgRelevant: Math.round(relTotal / n * 10) / 10, // rata-rata jumlah tanaman relevan per sampel
            note: 'Rata-rata ' + Math.round(relTotal / n) + ' tanaman memuat tiap sampel uji (rentang saling tumpang tindih), sehingga framing tepat adalah presisi/recall rekomendasi, bukan akurasi klasifikasi 1-label.'
        };
    }

    // ===== 3. METADATA (diukur ulang oleh ml-evaluasi.js) =====
    const META = {
        algorithm: 'soft k-NN (instance-based learning, voting berbobot invers-jarak, 7 fitur dinormalisasi)',
        featureCount: 7,
        samplesPerPlant: 25,
        trainSeed: 20260101,
        hitAt1: 67.9,     // % sampel uji yang peringkat-1-nya relevan (diukur ml-evaluasi.js, 1000 sampel uji)
        precisionAt5: 60.6,  // % dari 5 rekomendasi teratas yang benar-benar dalam rentang ideal
        recallAt10: 36.7,    // % tanaman relevan yang tertutup 10 teratas (batas teoretis 10/23.4 = 42.7%)
        testSamples: 1000,
        note: 'Metrik = uji sintetis hold-out terhadap database (bukan akurasi lapangan). Rentang antar-tanaman saling tumpang tindih, sehingga framing yang tepat adalah presisi/recall rekomendasi.'
    };

    return {
        PLANTS_EXTRA: PLANTS_EXTRA,
        FEATURE_LIMITS: FEATURE_LIMITS,
        KEYS: KEYS,
        buildModel: buildModel,
        match: match,
        matchActive: matchActive,
        predict: predict,
        predictVec: predictVec,
        evaluate: evaluate,
        normalizeVec: normalizeVec,
        META: META
    };
}));
