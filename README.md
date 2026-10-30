# Web Monitoring IoT (Full Stack)
Tugas Praktikum WS Sistem Tertanam. Dibuat sesuai instruksi.

**Nama Lengkap:** [NAMA MAHASISWA]
**NIM:** [NIM MAHASISWA]
**Kelas:** [KELAS]

## Fitur & Nilai Plus (Semua Tantangan Bonus Selesai!):
1. **Real-time WebSocket (Socket.io)**: Menggantikan polling konvensional dengan push data real-time, sehingga dashboard langsung update seketika.
2. **Multi-device Support**: Mendukung pemantauan banyak perangkat (simulator.js diset multi-device GH-01 dan GH-02). Tersedia dropdown di dashboard.
3. **Export to CSV**: Tersedia tombol dan endpoint `/api/export` untuk mengunduh seluruh data deret waktu ke dalam file `.csv`.
4. **Dynamic Temperature Threshold**: Ambang batas peringatan suhu (default 35°C) bisa diubah live dari frontend dan disimpan permanen ke SQLite.
5. **Kode ESP32 Asli (C++)**: Melampirkan kode `.ino` untuk Hardware ESP32 + DHT11/22 (terdapat di folder `esp32_code/`).

## Cara Menjalankan Aplikasi
1. Buka terminal pada folder `iot-monitoring` ini.
2. Instal semua *dependencies*: `npm install`
3. Jalankan backend server: `node server.js`
4. Buka terminal baru, jalankan simulator IoT: `node simulator.js`
5. Buka web browser favorit Anda, akses URL: [http://localhost:3000](http://localhost:3000)

## Automasi Git (Untuk Rubrik Penilaian Git 10 Poin)
Agar Anda mendapatkan poin maksimal pada riwayat Git (Syarat: Minimal 6 commit bertahap):
1. Jalankan script `setup_git.bat` (Windows) atau `setup_git.sh` (Mac/Linux).
2. Script ini otomatis akan menjalankan perintah `git init` dan melakukan 6 proses komit satu persatu sesuai nama tahapan yang diminta oleh dosen.
3. Setelah selesai, Anda tinggal melakukan `git push` ke repository GitHub Anda!

## Tabel Endpoint REST API
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/readings` | Menerima data sensor dari perangkat/simulator |
| GET | `/api/readings/latest` | Data terbaru untuk pembaruan kartu nilai |
| GET | `/api/readings?limit=20` | Riwayat sejumlah N data terakhir untuk tabel & grafik |
| GET | `/api/stats` | Rata-rata, min, maks suhu dan kelembapan |
| GET | `/api/export` | **[Bonus]** Ekspor seluruh riwayat data ke file CSV |
| GET | `/api/settings` | **[Bonus]** Mengambil nilai ambang batas suhu di memori |
| POST | `/api/settings` | **[Bonus]** Memperbarui threshold yang tersimpan di DB |
| GET | `/api/devices` | **[Bonus]** Daftar unik ID perangkat untuk dropdown |
