# 🚀 Quick Start Guide - Autoschedule Frontend

## Prerequisites
- Node.js v20.19.0 atau >=22.12.0
- npm atau yarn
- Backend sudah running di http://localhost:5000

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
```bash
# Copy file .env.example ke .env
cp .env.example .env

# Edit .env jika perlu
# VITE_API_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di: http://localhost:5173

### 4. Build untuk Production
```bash
npm run build
```

## 📁 Struktur Project

```
frontend/
├── src/
│   ├── pages/              # Halaman aplikasi
│   │   ├── guru/          # ✨ Halaman Guru (CRUD)
│   │   ├── kelas/         # ✨ Halaman Kelas (CRUD)
│   │   ├── mapel/         # ✨ Halaman Mapel (CRUD)
│   │   ├── konfigurasi/   # ✨ Halaman Konfigurasi
│   │   ├── kelas_rules/   # ✨ Halaman Aturan Kelas
│   │   ├── jadwal/        # Halaman Jadwal
│   │   ├── users/         # Halaman Users
│   │   └── auth/          # Login/Register
│   │
│   ├── repositories/       # API Calls
│   │   ├── guruRepository.js      # ✨
│   │   ├── kelasRepository.js     # ✨
│   │   ├── mapelRepository.js     # ✨
│   │   ├── konfigurasiRepository.js # ✨
│   │   ├── kelasRulesRepository.js  # ✨
│   │   └── jadwalRepository.js      # ✨
│   │
│   ├── components/        # Reusable Components
│   │   └── ui/           # UI Components
│   │       ├── Modal.vue
│   │       ├── Alert.vue
│   │       ├── Card.vue
│   │       ├── Badge.vue
│   │       ├── Loading.vue          # ✨
│   │       └── ConfirmDialog.vue    # ✨
│   │
│   ├── router/           # Vue Router
│   ├── stores/           # Pinia State Management
│   └── layouts/          # Layout Components
│
├── .env                  # Environment variables
└── package.json
```

## 🎯 Fitur Utama

### 1. Guru Management (`/guru`)
- ✅ List semua guru
- ✅ Create guru baru
- ✅ Edit guru
- ✅ Delete guru
- ✅ Kelola kompetensi mengajar (pilih mapel)
- ✅ Set hari tidak masuk

### 2. Kelas Management (`/kelas`)
- ✅ List semua kelas
- ✅ Create kelas baru
- ✅ Edit kelas
- ✅ Delete kelas
- ✅ Set jurusan (IPA/IPS/Bahasa/Umum)
- ✅ Set tingkat (10/11/12)

### 3. Mapel Management (`/mapel`)
- ✅ List semua mata pelajaran
- ✅ Create mapel baru
- ✅ Edit mapel
- ✅ Delete mapel
- ✅ Filter jurusan tertentu
- ✅ Filter tingkat tertentu

### 4. Konfigurasi (`/konfigurasi`)
- ✅ Set min/max JP per mapel per minggu
- ✅ Set guru max JP per hari
- ✅ Set default slot harian
- ✅ Tambah/hapus slot harian dinamis

### 5. Aturan Kelas (`/kelas-rules`)
- ✅ Pilih kelas untuk diatur
- ✅ Set slot harian per kelas
- ✅ Set hari tidak aktif (libur)
- ✅ Lock slot tertentu dengan mapel
- ✅ Tambah/hapus slot dinamis

### 6. Jadwal (`/jadwal`)
- ✅ Lihat jadwal per kelas
- ✅ Lihat jadwal per guru
- ✅ View raw data (JSON)
- ✅ Grid mingguan view

## 🔧 Development Tips

### Hot Module Replacement (HMR)
Vite mendukung HMR, perubahan akan langsung terlihat tanpa refresh.

### Vue DevTools
Install Vue DevTools extension untuk debugging:
- Chrome: [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### API Debugging
Gunakan browser DevTools > Network tab untuk melihat API requests.

### Font Awesome Icons
Icons tersedia dari CDN Font Awesome. Lihat dokumentasi: https://fontawesome.com/icons

## 🎨 UI Components Usage

### Modal
```vue
<Modal :show="showModal" @close="showModal = false" title="Form Title">
  <form @submit.prevent="handleSubmit">
    <!-- Form content -->
  </form>
</Modal>
```

### Alert
```vue
<Alert 
  v-if="alert.show" 
  :type="alert.type" 
  :message="alert.message" 
  @close="alert.show = false" 
/>
```

### Card
```vue
<Card>
  <h2>Card Title</h2>
  <p>Card content...</p>
</Card>
```

### Badge
```vue
<Badge text="IPA" color="blue" />
<Badge text="Active" color="green" />
```

### Loading
```vue
<Loading :show="loading" message="Memuat data..." />
```

### ConfirmDialog
```vue
<ConfirmDialog
  :show="showConfirm"
  title="Konfirmasi Hapus"
  message="Yakin ingin menghapus?"
  @confirm="handleDelete"
  @cancel="showConfirm = false"
/>
```

## 📡 API Integration Example

```javascript
import { guruRepository } from '@/repositories/guruRepository'

// Get all
const response = await guruRepository.getAll()
const gurus = response.data.data

// Create
await guruRepository.create({
  nama: 'Budi',
  kode: 'GR-001',
  kompetensi: { 'MATH': true },
  hari_tidak_masuk: ['Rabu']
})

// Update
await guruRepository.update(id, data)

// Delete
await guruRepository.delete(id)
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process di port 5173
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Atau gunakan port lain:
npm run dev -- --port 3000
```

### API Connection Error
1. Pastikan backend running di `http://localhost:5000`
2. Check `.env` file: `VITE_API_URL=http://localhost:5000`
3. Check CORS settings di backend

### Module Not Found
```bash
# Clear cache dan reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Build Error
```bash
# Clear Vite cache
rm -rf .vite
rm -rf dist
npm run build
```

## 📝 Next Steps

1. **Setup Backend**: Pastikan backend dan Firestore emulator running
2. **Login**: Gunakan halaman login untuk autentikasi
3. **Add Data Master**: 
   - Tambah Guru
   - Tambah Kelas
   - Tambah Mata Pelajaran
4. **Configure**: Set konfigurasi global dan aturan kelas
5. **Generate Jadwal**: Buat jadwal otomatis

## 🎓 Learning Resources

- Vue 3: https://vuejs.org/
- Vue Router: https://router.vuejs.org/
- Pinia: https://pinia.vuejs.org/
- Tailwind CSS: https://tailwindcss.com/
- Axios: https://axios-http.com/

## 🤝 Support

Jika ada pertanyaan atau issue, lihat:
- `FRONTEND_COMPLETE_SUMMARY.md` - Summary lengkap
- `FRONTEND_GUIDE.md` - Panduan detail
- `JADWAL_PAGE_GUIDE.md` - Khusus halaman jadwal

---

**Happy Coding! 🚀**
