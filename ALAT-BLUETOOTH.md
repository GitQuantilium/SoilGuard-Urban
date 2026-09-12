# 📡 ALAT BLE — Panduan Firmware (ESP32) untuk SoilGuard Urban

Mulai v3.5, jalur **UTAMA** pengiriman data alat → aplikasi adalah **Bluetooth LE**
(Web Bluetooth). USB tetap tersedia sebagai alternatif di laptop.

## Yang dibutuhkan

| Komponen | Perkiraan harga |
|---|---|
| ESP32 DevKit (punya BLE + WiFi) | ± Rp 40–70 ribu |
| Sensor tanah (mis. kapasitif moisture, DS18B20 suhu, modul NPK/EC/pH) | bervariasi |
| Kabel + breadboard/powerbank | — |

## Cara kerja (protokol)

1. ESP32 memancarkan Bluetooth LE dengan **nama diawali `SoilGuard`**
   (mis. `SoilGuard-Alat01`) — aplikasi memfilter otomatis nama ini.
2. Aplikasi mencari **Nordic UART Service (NUS)** — standar de-facto "serial via BLE":

   | UUID | Peran |
   |---|---|
   | Service `6e400001-b5a3-f393-e0a9-e50e24dcca9e` | wadah |
   | Char `6e400002-...` (WRITE) | alat → aplikasi (notify) |
   | Char `6e400003-...` (WRITE dari app, opsional) | aplikasi → alat (perintah) |

3. Alat mengirim teks **setiap 2–5 detik** (satu baris per pengukuran), formatnya
   SAMA dengan USB — dua format dikenali aplikasi:

   ```
   t:25.4,h:58,ec:1420,ph:6.4,n:195,p:68,k:275
   ```
   atau CSV 7 angka:
   ```
   25.4,58,1420,6.4,195,68,275
   ```

   Keterangan: t = suhu °C, h = kelembaban %, ec = µS/cm, ph, n/p/k = mg/kg.
   Baris diakhiri `\n`. Kirim tiap baris sebagai notifikasi (payload ≤ 20 byte per
   paket BLE; pecah bila perlu — aplikasi menggabungkan per baris).

   **Boleh kirim SEBAGIAN parameter!** (mis. alatmu cuma punya sensor EC + NPK:
   kirim `ec:1420,n:195,p:68,k:275`). Aplikasi otomatis menyesuaikan centangan
   parameter (v3.6): yang tidak pernah dikirim dikecualikan dari analisis + notifikasi;
   yang mulai dikirim diaktifkan kembali. Semua jalur (BLE, WiFi-bridge, USB) sama.

## Kerangka firmware (Arduino IDE, pustaka "ESP32 Arduino BLE")

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLE2902.h>

BLECharacteristic *txChar;
bool deviceConnected = false;

void setup() {
  Serial.begin(115200);
  BLEDevice::init("SoilGuard-Alat01");              // NAMA WAJIB berawalan SoilGuard
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new BLEServerCallbacks() {
    void onConnect(BLEServer*) override { deviceConnected = true; }
    void onDisconnect(BLEServer*) override { deviceConnected = false; BLEDevice::startAdvertising(); }
  });
  BLEService *svc = server->createService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  txChar = svc->createCharacteristic(
      "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
      BLECharacteristic::PROPERTY_NOTIFY);
  txChar->addDescriptor(new BLE2902());
  svc->start();
  server->getAdvertising()->addServiceUUID("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  server->getAdvertising()->start();
}

void loop() {
  if (deviceConnected) {
    // GANTI dengan pembacaan sensor asli:
    float t = 25.4, h = 58, ec = 1420, ph = 6.4, n = 195, p = 68, k = 275;
    char buf[64];
    snprintf(buf, sizeof(buf), "t:%.1f,h:%.0f,ec:%.0f,ph:%.1f,n:%.0f,p:%.0f,k:%.0f\n",
             t, h, ec, ph, n, p, k);
    txChar->setValue((uint8_t*)buf, strlen(buf));
    txChar->notify();
    delay(3000);  // kirim tiap 3 detik
  }
  delay(10);
}
```

## Di sisi aplikasi

1. Buka aplikasi → klik pill **"Sensor Terhubung"** di header
2. Klik **"Hubungkan via Bluetooth"** (paling atas — jalur utama)
3. Pilih `SoilGuard-Alat01` → selesai. Data masuk otomatis:
   - form terisi, analisis jalan, sumber data otomatis bertanda **Sensor** 🟩 di riwayat
   - kalibrasi offset (Pengaturan) otomatis diterapkan
4. Tombol berubah jadi **"Putuskan Bluetooth"** saat terhubung

## Dukungan browser (Web Bluetooth)

| Platform | Didukung |
|---|---|
| Chrome/Edge — Android | ✅ |
| Chrome/Edge — Windows/Mac/Linux | ✅ |
| Safari iOS/iPadOS | ⚠️ eksperimental — sering TIDAK tersedia (tergantung versi iOS/fitur eksperimental); di PWA ter-install biasanya tidak ada. Untuk iPhone pakai **Mode Jembatan WiFi** di bawah |
| Firefox | ❌ |
| Electron (aplikasi desktop kita) | ❌ (pakai USB di desktop) |

## Troubleshooting

| Masalah | Solusi |
|---|---|
| "Web Bluetooth tidak tersedia" | Pakai Chrome/Edge; di iOS pastikan versi 17+ dan pakai Safari |
| Alat tidak muncul di daftar | Pastikan nama diawali `SoilGuard`; alat sedang advertising (belum terhubung ke device lain) |
| Terhubung tapi tidak ada data | Cek karakteristik NOTIFY + `notify()` dipanggil; cek format baris (harus ada `:`/koma & >3 karakter) |
| Data masuk tapi dilabel "format tidak dikenali" | Baris terpotong — kirim `\n` di akhir baris & jangan melebihi MTU |
| Nilai melenceng dari alat acuan | Pakai kalibrasi offset di menu Pengaturan aplikasi |

## Mode Jembatan WiFi (WAJIB untuk iPhone) 📶

Karena Web Bluetooth tidak andal di iOS, ini jalur sensor yang **pasti jalan di
semua perangkat** (termasuk iPhone): alat mengirim pembacaan lewat **WiFi ke
Supabase** (tabel `sensor_bridge`, SQL langkah 2c), aplikasi menarik otomatis tiap 3 detik.

Siapkan:
1. Jalankan SQL **2c** di PANDUAN-SUPABASE.md
2. Di aplikasi: modal koneksi → **Jembatan WiFi/Cloud** → isi ID alat → Mulai
3. Firmware alat (ganti URL & anon key sesuai project Supabase-mu):

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "NAMA_WIFI";
const char* WIFI_PASS = "PASSWORD_WIFI";
// Salin dari Supabase > Project Settings > API:
const char* SUPABASE_URL  = "https://xxxx.supabase.co";
const char* SUPABASE_ANON = "eyJhbGciOi....";   // anon public key
const char* DEVICE_ID     = "SoilGuard-Alat01";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(300); }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // GANTI dengan pembacaan sensor asli:
    float t = 25.4, h = 58, ec = 1420, ph = 6.4, n = 195, p = 68, k = 275;
    char payload[96];
    snprintf(payload, sizeof(payload),
      "{\"device_id\":\"%s\",\"reading\":\"t:%.1f,h:%.0f,ec:%.0f,ph:%.1f,n:%.0f,p:%.0f,k:%.0f\"}",
      DEVICE_ID, t, h, ec, ph, n, p, k);

    HTTPClient http;
    http.begin(String(SUPABASE_URL) + "/rest/v1/sensor_bridge");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON);
    http.addHeader("Prefer", "return=minimal");
    http.POST(payload);          // baris data yang sama seperti BLE/USB
    http.end();
  }
  delay(5000);  // kirim tiap 5 detik
}
```

> Firmware di atas sengaja sederhana (tanpa TLS verify) untuk pembelajaran.
> Untuk pengerjaan serius, aktifkan sertifikat WiFiClientSecure.

## Kejujuran ilmiah (untuk KTI)

Seperti USB, jalur BLE ini **teruji di sisi perangkat lunak** (parser, alur UI,
state koneksi) namun **belum diuji dengan perangkat fisik**. Untuk KTI: uji satu
kali dengan ESP32 nyata, screenshot proses pairing + data masuk, lampirkan.
