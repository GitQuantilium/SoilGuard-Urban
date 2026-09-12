/* =====================================================================
   SOILGUARD URBAN v3.0 — MODUL SINKRONISASI (LOCAL-FIRST, pure functions)
   =====================================================================
   Fungsi-fungsi MURNI (tanpa DOM/network) supaya bisa diuji otomatis.
   Prinsip: localStorage = sumber kebenaran; cloud = cermin untuk perangkat lain.
   Aturan konflik: data dengan tanggal TERBARU yang menang.
   ===================================================================== */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) { module.exports = factory(); }
    else { root.SoilGuardSync = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {

    const MAX_HISTORY = 200;

    // Bangun baris upsert untuk tabel soilguard_data dari entri riwayat lokal
    function rowsFromHistory(userId, entries) {
        return entries.map(e => ({
            user_id: userId,
            kind: 'history',
            key: String(e.id),
            payload: e,
            updated_at: new Date().toISOString()
        }));
    }

    // Bangun baris upsert untuk lokasi custom
    function rowsFromLocations(userId, locations) {
        return locations.map(name => ({
            user_id: userId,
            kind: 'location',
            key: String(name),
            payload: { name: name },
            updated_at: new Date().toISOString()
        }));
    }

    // Gabungkan baris cloud (kind 'history') ke riwayat lokal.
    // remoteRows: [{key, payload, updated_at}]
    // Hasil: { merged, added, updated, skipped }
    function mergePull(localHistory, remoteRows) {
        const local = Array.isArray(localHistory) ? localHistory.slice() : [];
        const index = {};
        local.forEach((e, i) => { index[String(e.id)] = i; });
        let added = 0, updated = 0, skipped = 0;

        (remoteRows || []).forEach(row => {
            const payload = row.payload;
            if (!payload || payload.id === undefined) { skipped++; return; }
            const keyStr = String(payload.id);
            if (index[keyStr] === undefined) {
                const entry = Object.assign({}, payload, { synced: true });
                local.push(entry);
                index[keyStr] = local.length - 1;
                added++;
            } else {
                const i = index[keyStr];
                const localDate = new Date(local[i].date || 0).getTime();
                const remoteDate = new Date(payload.date || 0).getTime();
                if (remoteDate > localDate) {
                    local[i] = Object.assign({}, payload, { synced: true });
                    updated++;
                } else { skipped++; }
            }
        });

        // urutkan terbaru dulu + batasi kapasitas
        const merged = trimHistory(local.sort((a, b) => new Date(b.date) - new Date(a.date)), MAX_HISTORY);
        return { merged, added, updated, skipped };
    }

    // Gabungkan daftar lokasi custom lokal + cloud (union, urutan lokal dulu)
    function mergeLocations(localList, remoteRows) {
        const out = (Array.isArray(localList) ? localList.slice() : []);
        (remoteRows || []).forEach(row => {
            const name = row && row.payload && row.payload.name;
            if (name && out.indexOf(name) === -1) out.push(name);
        });
        return out;
    }

    // Pangkas riwayat ke maksimum N — pangkas yang SUDAH tersinkron dulu
    // (entri belum tersinkron dijaga selagi mungkin). Pemilihan berdasar TANGGAL
    // (terlama dipangkas dulu), tidak bergantung urutan array.
    function trimHistory(entries, max) {
        const n = (typeof max === 'number' && max > 0) ? max : MAX_HISTORY;
        if (entries.length <= n) return entries;
        const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
        const synced = entries.filter(e => e.synced).sort(byDateDesc);
        const unsynced = entries.filter(e => !e.synced).sort(byDateDesc);
        const keepSynced = synced.slice(0, Math.max(0, n - Math.min(unsynced.length, n)));
        return keepSynced.concat(unsynced).sort(byDateDesc).slice(0, n);
    }

    return {
        MAX_HISTORY: MAX_HISTORY,
        rowsFromHistory: rowsFromHistory,
        rowsFromLocations: rowsFromLocations,
        mergePull: mergePull,
        mergeLocations: mergeLocations,
        trimHistory: trimHistory
    };
}));
