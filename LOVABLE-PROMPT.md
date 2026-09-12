# 🎨 PANDUAN LOVABLE — UI Baru SoilGuard Urban (Tanpa Kehilangan Fitur v3.5.4)

## ⚠️ Baca dulu: cara kerja yang BENAR

Lovable **tidak bisa mengimpor** aplikasi kita (117 fungsi JS dalam 1 file HTML).
Kalau kamu tempel seluruh kode ke Lovable, ia akan **menulis ulang dari nol** → fitur hancur.
Tapi Lovable **sangat jago bikin UI cantik**. Jadi strateginya HYBRID:

```
LANGKAH A (kamu + Lovable)  : buat UI SHELL cantik — layout, warna, kartu, modal,
                              TANPA logika (data placeholder saja)
LANGKAH B (kamu)            : export dari Lovable → GitHub → download ZIP
LANGKAH C (gue/agent)       : merge — ambil desainnya, pasangkan kembali ke
                              117 fungsi & 75 elemen aplikasi v3.5.4 → fitur utuh
```

Waktu: A ± 15 menit, B ± 5 menit, C kirim balik ke agent (gue) yang mengerjakan.

---

## LANGKAH A — Kerjakan di Lovable (https://lovable.dev)

1. Daftar/masuk → **New project**.
2. **(Opsional tapi ampuh)** Sebelum ketik prompt: screenshot aplikasi saat ini
   (buka `index.html`, screenshot 3–4 bagian: dashboard atas, kartu rekomendasi,
   modal riwayat, dark mode) → drag ke chat Lovable → tulis
   *"Match this layout but make it look polished"* lalu tempel prompt di bawah.
3. Tempel **MASTER PROMPT** (bagian bawah halaman ini) → kirim.
4. Lihat hasil → iterasi pakai **PROMPT LANJUTAN** (satu per satu, jangan sekaligus).
5. Berhenti saat UI sudah cantik — **JANGAN minta Lovable membuat logika**
   (scoring, ML, Supabase, sensor — itu tugas merge nanti).

### Tips iterasi di Lovable
- Satu permintaan per pesan; kalau hasil melenceng: *"Revert"* lalu coba kalimat lain.
- Kalau muncul fitur yang tidak diminta (auth, database): *"Remove that, UI only."*

## LANGKAH B — Export

1. Di Lovable: tombol **GitHub** (kanan atas) → *Connect* → *Create repo / Export*.
2. Dari GitHub: **Code → Download ZIP** (atau beri tahu agent nama repo-nya).
3. Kirim file ZIP itu ke agent (upload di chat ini).

---

## 📋 MASTER PROMPT (bahasa Inggris — copy semuanya)

```
Build a polished web UI SHELL (visual only, placeholder data, no business logic)
for "SoilGuard Urban" — a soil-monitoring dashboard for urban farming that helps
small-space growers pick the right crop. This will be demoed by high-school
students to examiners, so it must look like a serious, trustworthy data tool.

SCREENS & COMPONENTS (single-page dashboard + modals):

1) TOP HEADER (sticky, deep emerald gradient #166534→#14532d, white text):
   - Left: leaf logo mark in a frosted rounded square + wordmark "SoilGuard Urban"
   - Right (compact pill controls, all in one row): Live Mode toggle with status dot,
     Online/Offline indicator dot, a location selector (select: "Kebun Belakang",
     "Polybag A", "Polybag B", "Lahan Depan"), a "Sensor" connection pill with a
     green dot, an "Akun" user button, a gear (Settings) button, and an info button.
2) MAIN GRID (12-col, generous whitespace, max-width 1480px):
   - LEFT (4 cols): "Input Parameter" card — 7 labeled range+number field pairs
     (Suhu °C, Kelembaban %, EC µS/cm, pH, Nitrogen, Fosfor, Kalium mg/kg), each
     row: label with a small info icon, unit on the right, slider + compact number
     input. Bottom: primary button "Analisis Tanah" (full width, emerald),
     secondary buttons "Reset" and three small ghost buttons "Simulasi Baik /
     Buruk / Acak".
   - RIGHT (8 cols):
     a) Score hero card: big number 0–100 (huge semibold, tabular numerals),
        status label ("Sangat Cocok"), a thin rounded progress bar, small tier text.
     b) "Kondisi Terukur" — 7 compact metric tiles (icon, label, big value, unit,
        small status chip: Baik/Sedang/Warning).
     c) "Top Rekomendasi Tanaman" — 3 crop cards (emoji, plant name, category,
        big score number, badges "ML 87%" and "🌿 85", two small buttons "Detail"
        and "Pilih"), plus one ghost row "Lihat semua 100 tanaman" and a
        "Bandingkan" ghost button.
     d) Two-column lower area: "Radar Kesesuaian" (placeholder radar chart) and
        "Saran Perbaikan Tanah" — list of small advisory rows (icon, bold title,
        one-line advice, e.g. dolomit dose, leaching) + a small calculator button
        "Hitung Media & Dosis".
3) MODALS (reuse one overlay style: dark blur backdrop, rounded-2xl panel):
   - Riwayat & Statistik: search input, tab pills (Line/Bar/Pie/Tabel), chart area,
     recent-analysis list with colored source badges (Manual gray, Sensor green,
     Simulasi amber).
   - Pengaturan: theme toggle Light/Dark, baud rate select, 7 small calibration
     offset number inputs, anonymous-data contribution toggle + city text input,
     backup/restore buttons, red "Reset semua data" danger button.
   - Akun & Sinkronisasi: email+password fields, Masuk / Daftar buttons, when
     logged-in show email + "Sinkronkan Sekarang" primary button + community
     statistics block.
   - Katalog tanaman: search + category chips (Semua/Sayuran/Buah/Rempah/Umbi/
     Kacang/Serealia) + scrollable plant list.
4) EMPTY STATE for the main area: centered muted icon + "Belum ada data tanah.
   Isi parameter lalu klik Analisis Tanah."

DESIGN SYSTEM (strict):
- Palette: emerald green primary #166534 (dark #14532d), accent #10B981, neutral
  slate grays; functional accents only — amber warnings, red danger, lime for
  sustainability badges. Near-white greenish background #F3F6F4, dark mode surface
  #0B1220 (deep blue-black, not pure black).
- Typography: Poppins semibold for headings/wordmark, Inter for body and ALL
  numbers (tabular-nums). One H1 per screen; small uppercase letter-spaced labels
  for data fields.
- 8px spacing grid; consistent radii (cards 18px, controls 12px); layered soft
  shadows; subtle 1px borders (slate-200 / slate-700 in dark).
- Micro-interactions: hover lift on cards, active press on buttons, focus-visible
  emerald outline, smooth modal fade+pop (150–200ms).
- MUST include good Light AND Dark mode; all states visible (empty, loaded).
- AVOID: purple/blue gradients, glows, neumorphism, uniform 3-column filler cards,
  emoji used as system icons (emoji allowed ONLY inside plant-name contexts),
  placeholder copy like "Lorem ipsum" / "Welcome".

TECH: React + Tailwind CSS only. Pure presentational components with hardcoded
sample data. No routing, no backend, no auth, no charts library config — just a
static placeholder radar box. Accessibility: labeled inputs, aria-labels on icon
buttons, visible focus states.
```

## 🔁 PROMPT LANJUTAN (kirim satu per satu sesuai kebutuhan)

1. `Make the score hero card more prominent: larger number, add a subtle ring gauge around it. Keep everything else.`
2. `Refine dark mode: raise card contrast (surface #0F172A), keep the emerald accents, dim the radial glow.`
3. `Give the 7 metric tiles a cleaner look: icon in a soft emerald tinted square, value bigger, status chip smaller.`
4. `Add a compact bottom status bar: data source of last analysis (Manual/Sensor/Simulasi badge) + timestamp + small PDF and CSV export buttons on the right.`
5. `Polish the modals: consistent 24px padding, title 18px semibold, close button top-right, max-height with scroll.`
6. `Make the header pills smaller and neater; group Live Mode + Online dot + Location into one segmented cluster.`

---

## 📎 LAMPIRAN UNTUK AGENT (tidak perlu dikasih ke Lovable)

Setelah UI jadi, agent akan menyambungkan kembali semua ini (sudah terinventaris
otomatis dari v3.5.4 — jangan sampai ada yang hilang saat merger):

**52 fungsi yang wajib ada panggilannya:**
accountResetPass, accountSignIn, accountSignOut, accountSignUp, analyzeCurrentData, apSetCat, cmpToggle, connectBluetooth, connectToSelectedPort, connectWebSerial, disconnectBluetooth, doseHitung, exportBackup, exportToExcel, exportToPDF, hideAccountModal, hideConnectionModal, hideDoseModal, hideInfoModal, hideSettingsModal, hideWarning, loadHistoryEntry, obNext, obPrev, obSkip, quitApp, refreshPorts, renderHistoryChart, resetAllData, resetForm, runAIAnalysis, saveSettings, selectPlant, setTheme, showAccountModal, showAllPlantsModal, showCompareModal, showConnectionModal, showDoseCalc, showHistoryModal, showInfoModal, showPlantDetail, showSettingsModal, showTrendModal, simulateBadData, simulateGoodData, simulateSensorData, startBridge, stopBridge, syncNow, toggleLiveMode, validateAndAnalyze

**81 ID elemen yang wajib ada di UI baru:**
acc-auth-box, acc-config-warn, acc-email, acc-msg, acc-pass, acc-pending, acc-stats, acc-sync-btn, acc-sync-status, acc-user-box, acc-user-email, account-btn-label, account-icon, account-modal, analysis-content, ap-list, ap-search, auto-analyze, baud-rate, ble-connect-btn, ble-disconnect-btn, bridge-device, bridge-start-btn, bridge-status, bridge-stop-btn, cal-ec, cal-k, cal-moist, cal-n, cal-p, cal-ph, cal-temp, cmp-list, cmp-search, cmp-table, connection-dot, connection-modal, connection-port, connection-text, current-location-badge, dose-dia, dose-lahan-inputs, dose-lebar, dose-modal, dose-panjang, dose-pot-inputs, dose-result, dose-tinggi, history-chart, history-chart-container, history-list-container, history-search, improvement-suggestions, info-modal, input-form, live-dot, live-text, location-select, net-dot, net-text, ob-back, ob-body, ob-dots, ob-next, onboard-modal, overall-bar, overall-label, overall-score, port-list, radar-chart, readings-grid, recommendations-grid, restore-file, settings-modal, share-anon, share-city, suitability-tier, timestamp-text, trend-prediction, warning-text, warning-toast


> Catatan teknis merger: Lovable menghasilkan React. Merger paling aman = ambil
> **struktur HTML + class Tailwind + palet** dari hasil Lovable, lalu dipasang ke
> aplikasi vanilla kita (semua JS lama tetap). Alternatif full-React (port 117
> fungsi ke komponen) bisa dilakukan tapi kerjanya jauh lebih lama & berisiko.
