# Halaman Jadwal - User Guide

## Cara Menggunakan

1. **Akses Halaman Jadwal**
   - Buka menu "Jadwal" di sidebar
   - Atau akses langsung ke `/jadwal`

2. **Melihat Jadwal**
   - Masukkan periode (contoh: `2024-ganjil`)
   - Klik tombol "Tampilkan"
   - Tunggu hingga data dimuat

3. **Navigasi Tampilan**
   - **Per Kelas**: Lihat jadwal untuk setiap kelas
   - **Per Guru**: Lihat jadwal untuk setiap guru
   - **Data Mentah**: Lihat data JSON langsung dari server

## Format Data

### Status Jadwal
- **ready**: Jadwal sudah siap dan dapat ditampilkan
- **pending**: Jadwal sedang diproses oleh solver
- **error**: Terjadi kesalahan saat memproses jadwal
- **not_found**: Periode tidak ditemukan

### Informasi dalam Tabel
- **Hari**: Nama hari (Senin, Selasa, dst)
- **Jam**: Jam pelajaran (slot mulai)
- **Mapel**: Nama mata pelajaran
- **Guru**: Nama guru pengajar
- **Kelas**: Nama kelas (hanya di view Per Guru)
- **Durasi**: Jumlah jam pelajaran (JP)

## Setup Development

1. **Backend**
   - Pastikan backend Flask sudah berjalan di port 5000
   - Endpoint: `GET /jadwal/<periode>`

2. **Frontend**
   - Copy `.env.example` menjadi `.env`
   - Sesuaikan `VITE_API_URL` jika backend tidak di localhost:5000
   - Jalankan `npm run dev`

## API Endpoint

### GET /jadwal/:periode
Mengambil data jadwal untuk periode tertentu.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "created_at": "2024-01-01T10:00:00",
    "items": [
      {
        "block_id": "block_123",
        "guru_id": "guru_1",
        "guru_nama": "Pak Budi",
        "mapel_id": "mapel_1",
        "mapel_nama": "Matematika",
        "kelas_id": "kelas_1",
        "kelas_nama": "X-IPA-1",
        "hari": "Senin",
        "hari_index": 0,
        "start": 1,
        "size": 2,
        "slots": [1, 2]
      }
    ]
  }
}
```

## Troubleshooting

### Jadwal tidak muncul
- Pastikan periode sudah benar
- Cek status jadwal (pending/error/not_found)
- Refresh halaman jika status masih pending

### Error koneksi
- Pastikan backend sudah berjalan
- Cek VITE_API_URL di file `.env`
- Cek browser console untuk detail error

### Data tidak lengkap
- Pastikan solver sudah selesai memproses
- Cek data guru, mapel, dan kelas sudah ada di database
- Verifikasi data di tab "Data Mentah"
