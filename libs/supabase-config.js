/* =====================================================================
   KONFIGURASI SUPABASE — isi sesuai PANDUAN-SUPABASE.md (bagian 2)
   =====================================================================
   1. Buat akun & project gratis di https://supabase.com
   2. Jalankan SQL yang ada di PANDUAN-SUPABASE.md
   3. Salin Project URL & anon public key ke bawah ini.

   AMAN: anon key memang dirancang boleh tampil di sisi klien,
   ASALKAN Row Level Security (RLS) sudah diaktifkan (lihat panduan).
   Tanpa konfigurasi -> fitur akun tampil "belum dikonfigurasi",
   seluruh fitur offline tetap berjalan normal.
   ===================================================================== */
const SUPABASE_CONFIG = {
    url: "https://etcnqoczbahpyinpdkar.supabase.co",       // contoh: https://abcdxyz.supabase.co
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y25xb2N6YmFocHlpbnBka2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzUzMjEsImV4cCI6MjEwNDQxMTMyMX0.r0aIdKNwujmE_rl_ya8EglxaA1L_0z-HwPcU8BaqluA"
};
