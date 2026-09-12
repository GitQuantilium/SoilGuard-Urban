# ☁️ PANDUAN SUPABASE — Login & Sinkronisasi Cloud SoilGuard Urban

Fitur akun **opsional**. Tanpa langkah ini, aplikasi tetap berfungsi 100% (offline)
— data hanya tersimpan di perangkat. Setelah langkah ini selesai, data riwayat &
lokasi custom bisa diakses dari perangkat lain setelah login.

Waktu pengerjaan: ± 10 menit. Gratis (tier free Supabase cukup untuk KTI).

---

## 1. Buat Project Supabase

1. Buka https://supabase.com → **Start your project** → daftar (bisa pakai GitHub/Google).
2. Klik **New Project** → beri nama `soilguard-urban` → buat password database
   (simpan sendiri, tidak dipakai di aplikasi) → pilih region terdekat (Singapore).
3. Tunggu ± 2 menit sampai project siap.

## 2. Jalankan SQL (membuat tabel + proteksi keamanan)

1. Di dashboard Supabase, buka menu **SQL Editor** (ikon terminal di kiri).
2. Klik **New query**, tempel seluruh SQL di bawah, lalu klik **Run**.

```sql
-- Tabel data SoilGuard (riwayat analisis + lokasi custom)
create table if not exists public.soilguard_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,               -- 'history' | 'location'
  key text not null,                -- id entri / nama lokasi
  payload jsonb not null,           -- isi data lengkap
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, key)
);

-- WAJIB: Row Level Security — tiap user hanya bisa lihat/ubah data miliknya sendiri
alter table public.soilguard_data enable row level security;

-- Anti-error jika dijalankan ulang: hapus policy lama dulu kalau sudah ada
-- (create policy TIDAK mendukung "if not exists", jadi tanpa drop di bawah ini,
--  menjalankan script dua kali akan error 42710 "policy already exists")
drop policy if exists "pemilik_data_full_akses" on public.soilguard_data;

create policy "pemilik_data_full_akses"
  on public.soilguard_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Kalau muncul "Success. No rows returned" → berhasil.

### 2b. (Baru di v3.2) Statistik Aplikasi & Kontribusi Anonim

Jalankan sekali di SQL Editor (boleh digabung saat Run ulang — aman, sudah anti-error):

```sql
-- Tabel kontribusi pengukuran anonim (crowdsourced, opt-in dari Pengaturan)
create table if not exists public.public_measurements (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  temp double precision, moist double precision, ec double precision,
  ph double precision, n double precision, p double precision, k double precision,
  score int, status text, top_plant text, city text
);
alter table public.public_measurements enable row level security;

drop policy if exists "siapapun_boleh_kontribusi" on public.public_measurements;
create policy "siapapun_boleh_kontribusi"
  on public.public_measurements for insert
  to anon, authenticated
  with check (true);
-- Sengaja TIDAK ada policy select/update/delete:
-- data mentah TIDAK bisa dibaca/diubah/dihapus publik, hanya bisa menambah.

-- Fungsi agregat untuk dashboard statistik (hanya angka agregat, tanpa data pribadi;
-- SECURITY DEFINER = berjalan sebagai pemilik tabel sehingga melewati RLS)
create or replace function public.get_app_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'users',   (select count(*) from auth.users),
    'entries', (select count(*) from public.soilguard_data where kind = 'history'),
    'community', json_build_object(
      'total', (select count(*) from public.public_measurements),
      'avg', (select json_build_object(
                'ph', avg(ph), 'temp', avg(temp), 'moist', avg(moist),
                'ec', avg(ec), 'n', avg(n), 'p', avg(p), 'k', avg(k),
                'score', avg(score))
              from public.public_measurements),
      'top_plants', (select coalesce(json_agg(t), '[]'::json)
                     from (select top_plant as nama, count(*) as jumlah
                           from public.public_measurements
                           where top_plant is not null
                           group by top_plant
                           order by count(*) desc
                           limit 5) t)
    )
  );
$$;
grant execute on function public.get_app_stats() to anon, authenticated;
```

Setelah ini, modal **Akun** menampilkan statistik: jumlah akun, jumlah analisis
tersinkron, jumlah kontribusi anonim, rerata parameter komunitas, dan 5 tanaman
terpopuler. Angka-angka ini bisa dikutip di Bab IV KTI (data penggunaan nyata).

> 💡 Error `42710: policy ... already exists` artinya script sebelumnya SUDAH
> berhasil dijalankan — setup kamu selesai, lanjut ke langkah 3. Untuk mengecek,
> jalankan: `select * from pg_policies where tablename = 'soilguard_data';`

### 2c. (Baru di v3.5.2) Jembatan WiFi/Cloud untuk Sensor — kompatibel iPHONE

Web Bluetooth di iPhone itu eksperimental (sering tidak tersedia). Solusi pasti:
alat mengirim data lewat **WiFi ke Supabase**, aplikasi menariknya otomatis.
Jalankan sekali di SQL Editor:

```sql
-- Tabel jembatan data sensor (append-only; alat POST, aplikasi baca)
create table if not exists public.sensor_bridge (
  id bigint generated always as identity primary key,
  device_id text not null,
  reading text not null,
  created_at timestamptz not null default now()
);
alter table public.sensor_bridge enable row level security;

drop policy if exists "sensor_bridge_insert" on public.sensor_bridge;
create policy "sensor_bridge_insert"
  on public.sensor_bridge for insert to anon, authenticated with check (true);

drop policy if exists "sensor_bridge_select" on public.sensor_bridge;
create policy "sensor_bridge_select"
  on public.sensor_bridge for select to anon, authenticated using (true);
-- Sengaja TIDAK ada update/delete: data alat hanya bisa ditambah.
-- Bersihkan sesekali: delete from sensor_bridge where created_at < now() - interval '7 days';
```

Setelah itu di aplikasi: modal koneksi → **Jembatan WiFi/Cloud** → isi ID alat
(mis. `SoilGuard-Alat01`) → Mulai. Firmware alat (ESP32, WiFi) lihat
**ALAT-BLUETOOTH.md bagian "Mode Jembatan WiFi"**.

## 3. Salin Kredensial ke Aplikasi

1. Menu **Project Settings** (ikon gear) → **API**.
2. Salin dua hal ini:
   - **Project URL** (mis. `https://abcdxyz.supabase.co`)
   - **anon public key** (kunci panjang di bawah "Project API Keys")
3. Buka file `libs/supabase-config.js` di folder aplikasi, ganti isinya:

```js
const SUPABASE_CONFIG = {
    url: "https://abcdxyz.supabase.co",
    anonKey: "eyJhbGciOi....(kunci anon kamu)"
};
```

4. Simpan file. Buka aplikasi → tombol **Akun** sekarang aktif: daftar → masuk →
   klik **Sinkronkan Sekarang**.

> 🔒 **Kenapa aman?** `anon key` memang dirancang untuk tampil di sisi klien.
> Yang melindungi data adalah RLS di langkah 2: tiap akun hanya bisa membaca/
> menulis baris dengan `user_id` miliknya sendiri. JANGAN pernah memakai
> `service_role key` di aplikasi.

## 4. Cara Kerja Sync (untuk ditulis di KTI)

- **Local-first**: setiap analisis selalu tersimpan dulu di `localStorage` perangkat.
  Fitur offline tidak pernah bergantung pada cloud.
- **Push**: saat login & online, entri yang belum tersinkron dikirim ke tabel
  `soilguard_data` (upsert, konflik kunci `(user_id, kind, key)`).
- **Pull**: aplikasi menarik seluruh baris milik user, menggabungkan ke lokal dengan
  aturan **data terbaru menang** (perbandingan tanggal entri).
- **Trigger sinkron**: setelah login, saat aplikasi dibuka (sesi aktif), ketika
  koneksi kembali online, dan tombol manual.
- Indikator: chip 🟢 Online / 🔴 Offline di header + jumlah data yang belum tersinkron.

## 4b. Batas Email Supabase ("Email rate limit exceeded") — WAJIB DIBACA

Paket gratis Supabase memakai SMTP bawaan yang batasnya KECIL (beberapa email saja
per jam) untuk email auth (verifikasi daftar, reset password). Kalau muncul
"Email rate limit exceeded" saat beberapa orang mendaftar berurutan, ini solusinya
TANPA perlu ganti ke penyedia lain (database & akun yang sudah ada tetap dipakai):

**Penyebab "klik link konfirmasi malah ERROR" (gejala yang kamu alami):**
Supabase mengarahkan link konfirmasi ke **Site URL** project — bawaannya
`http://localhost:3000`, sehingga klik link dari HP = "site can't be reached".
Aplikasinya sendiri sudah benar (verifikasi tetap tercatat), yang salah TUJUAN LINK-nya.
Perbaikannya 1 menit:
1. Dashboard Supabase → **Authentication → URL Configuration**
2. **Site URL** → isi URL aplikasi yang ter-hosting (mis. `https://namakamu.github.io/soilguard-urban/` atau `https://xxx.netlify.app`)
3. **Redirect URLs** → Add URL → masukkan URL yang sama (boleh juga tambah `https://xxx.netlify.app/**`)
4. Sekarang klik link konfirmasi = dibawa ke aplikasi, bukan error.

**Solusi 1 — Matikan verifikasi email (paling cepat, cukup untuk kelas/demo):**
1. Dashboard Supabase → **Authentication → Sign In / Providers → Email**
2. Matikan toggle **"Confirm email"** → Save
3. Selesai: pendaftaran tidak lagi mengirim email apa pun, langsung bisa login.
   (Tanpa verifikasi email, siapapun bisa mendaftar dengan email sembarangan —
   untuk lingkungan sekolah ini biasanya tidak masalah.)

**Solusi 2 — Pasang SMTP gratis sendiri (kalau verifikasi/reset email tetap mau):**
1. Daftar Brevo (300 email/hari gratis) atau Resend (100/hari) → buat SMTP/API key
2. Supabase → **Authentication → SMTP Settings** → aktifkan → isi kredensial SMTP
3. Sekarang email auth lewat kuota SMTP-mu sendiri, bukan kuota kecil bawaan.

> Kenapa tidak ganti ke Firebase/Auth0? Bisa saja (Firebase tidak mengirim email
> saat pendaftaran password), tapi database & keamanan kita terikat pada
> `auth.users` Supabase (user_id). Ganti provider = migrasi seluruh skema & data.
> Untuk skala 5–30 pengguna, Solusi 1/2 jauh lebih masuk akal.

## 5. Masalah Umum

| Masalah | Solusi |
|---|---|
| "Sync cloud belum dikonfigurasi" | `libs/supabase-config.js` masih berisi kata GANTI |
| "Invalid API key" | Salin ulang **anon public key** (bukan service_role) |
| **"Invalid path specified in request URL"** saat daftar/masuk | `url` di `supabase-config.js` salah format. Harus TEPAT seperti `https://abcdefgh.supabase.co` — TANPA `/rest/v1`, TANPA `/` di akhir, dan BUKAN link dashboard (`supabase.com/dashboard/...`). Salin dari **Project Settings → API → Project URL**, simpan, lalu refresh aplikasi (Ctrl+Shift+R) |
| Email verifikasi diminta terus | Supabase → Authentication → Providers → Email; matikan "Confirm email" untuk demo sekolah, ATAU verifikasi email dulu |
| "relation soilguard_data does not exist" | SQL langkah 2 belum di-Run di project yang benar |
| Sinkron gagal saat demo | Chip header merah = offline; data aman lokal, coba lagi saat online |
| Ganti project Supabase | Cukup ganti URL/key; data lama di cloud lama tidak ikut pindah otomatis |
| Statistik di modal Akun bilang "belum tersedia" | SQL langkah **2b** belum di-Run |
| "Email rate limit exceeded" saat daftar | Lihat bagian **4b**: matikan Confirm email atau pasang SMTP sendiri |
