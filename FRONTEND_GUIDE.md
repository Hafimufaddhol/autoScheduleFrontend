# Frontend Autoschedule

Frontend aplikasi penjadwalan sekolah otomatis menggunakan Vue 3, Vite, dan Tailwind CSS.

## 🚀 Fitur

### Halaman Yang Tersedia:

1. **Dashboard** - Halaman utama dengan ringkasan
2. **Jadwal** - Tampilan dan manajemen jadwal pelajaran
3. **Guru** - CRUD data guru dengan kompetensi mengajar
4. **Kelas** - CRUD data kelas (jurusan, tingkat)
5. **Mata Pelajaran** - CRUD data mapel dengan filter jurusan/tingkat
6. **Aturan Kelas** - Konfigurasi slot harian, hari libur, dan slot terkunci per kelas
7. **Konfigurasi** - Pengaturan global sistem (JP min/max, guru max JP/hari)
8. **Pengguna** - Manajemen user

### Komponen UI:

- **Modal** - Modal untuk create/edit form
- **Card** - Card container
- **Alert** - Notifikasi sukses/error
- **Badge** - Badge label
- **Input** - Input field dengan label
- **Table** - Tabel data
- **Button** - Tombol dengan berbagai variant

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Preview build
npm run preview
```

## 🔧 Konfigurasi

Buat file `.env` dari `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
VITE_API_URL=http://localhost:5000
```

## 📁 Struktur Folder

```
src/
├── assets/          # CSS dan gambar
├── components/      # Komponen reusable
│   ├── ui/         # UI components (Modal, Card, etc)
│   ├── forms/      # Form components
│   └── charts/     # Chart components
├── composables/    # Vue composables (hooks)
├── layouts/        # Layout components (Sidebar, Navbar)
├── pages/          # Halaman aplikasi
│   ├── auth/       # Login/Register
│   ├── guru/       # Halaman Guru
│   ├── kelas/      # Halaman Kelas
│   ├── mapel/      # Halaman Mapel
│   ├── kelas_rules/# Halaman Aturan Kelas
│   ├── konfigurasi/# Halaman Konfigurasi
│   ├── jadwal/     # Halaman Jadwal
│   └── users/      # Halaman Users
├── repositories/   # API calls
│   ├── guruRepository.js
│   ├── kelasRepository.js
│   ├── mapelRepository.js
│   ├── kelasRulesRepository.js
│   ├── konfigurasiRepository.js
│   └── jadwalRepository.js
├── router/         # Vue Router
├── stores/         # Pinia stores
└── utils/          # Helper functions
```

## 🎨 Tailwind CSS

Proyek ini menggunakan Tailwind CSS untuk styling. Konfigurasi ada di `tailwind.config.js`.

## 📡 API Integration

Semua API calls dilakukan melalui repositories di folder `src/repositories/`. 

Contoh penggunaan:

```javascript
import { guruRepository } from '@/repositories/guruRepository'

// Get all guru
const response = await guruRepository.getAll()
const gurus = response.data.data

// Create guru
await guruRepository.create({
  nama: 'Budi',
  kode: 'GR-001',
  kompetensi: { 'MATH': true },
  hari_tidak_masuk: ['Rabu']
})

// Update guru
await guruRepository.update(id, data)

// Delete guru
await guruRepository.delete(id)
```

## 🔐 Authentication

Authentication menggunakan Pinia store di `src/stores/auth.js`. 

Route guard sudah dikonfigurasi di `src/router/index.js` untuk melindungi halaman yang memerlukan login.

## 🎯 TODO / Pengembangan Selanjutnya

- [ ] Implement search dan filter di setiap tabel
- [ ] Pagination untuk tabel besar
- [ ] Export jadwal ke PDF/Excel
- [ ] Drag & drop untuk jadwal
- [ ] Dark mode
- [ ] Responsive design untuk mobile
- [ ] Loading skeleton
- [ ] Form validation yang lebih detail

## 📝 Catatan

- Pastikan backend sudah running di `http://localhost:5000`
- Firestore emulator harus aktif untuk backend
- Font Awesome digunakan untuk icons
- Vue Router sudah dikonfigurasi dengan meta `requiresAuth`

## 🛠️ Tech Stack

- Vue 3 (Composition API)
- Vite
- Vue Router
- Pinia (State Management)
- Axios (HTTP Client)
- Tailwind CSS
- Font Awesome Icons
