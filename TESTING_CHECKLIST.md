# ✅ Testing Checklist - Frontend Autoschedule

## 🎯 Pre-Testing Setup

- [ ] Backend running di `http://localhost:5000`
- [ ] Firestore emulator running
- [ ] Frontend running di `http://localhost:5173`
- [ ] `.env` file sudah dikonfigurasi dengan benar
- [ ] Browser console tidak ada error

---

## 🧪 Testing Per Halaman

### 1. Dashboard (`/`)

#### Visual Check
- [x] Tampilan dashboard loading dengan baik
- [x] Statistics cards muncul (Guru, Kelas, Mapel, Jadwal)
- [x] Quick actions cards ada dan clickable
- [x] Layout responsive (coba resize browser)

#### Functionality
- [x] Klik card "Kelola Guru" → navigate ke `/guru`
- [x] Klik card "Kelola Kelas" → navigate ke `/kelas`
- [x] Klik card "Kelola Mapel" → navigate ke `/mapel`
- [x] Klik button "Buat Jadwal" → modal muncul

---

### 2. Guru Management (`/guru`)

#### List View
- [ ] Tabel guru tampil dengan data yang benar
- [ ] Kolom: Nama, Kode, Kompetensi, Hari Tidak Masuk, Aksi
- [ ] Badge kompetensi muncul dengan warna yang tepat
- [ ] Loading state muncul saat fetch data
- [ ] Empty state muncul jika tidak ada data

#### Create Guru
- [ ] Klik button "Tambah Guru" → modal muncul
- [ ] Form fields: Nama, Kode, Kompetensi (checkbox), Hari Tidak Masuk (checkbox)
- [ ] Isi form dengan data valid → klik "Simpan"
- [ ] Alert sukses muncul
- [ ] Data baru muncul di tabel
- [ ] Modal tertutup otomatis

#### Edit Guru
- [ ] Klik button "Edit" pada salah satu guru
- [ ] Modal muncul dengan data guru yang dipilih
- [ ] Form ter-populate dengan data yang benar
- [ ] Ubah data → klik "Update"
- [ ] Alert sukses muncul
- [ ] Data ter-update di tabel

#### Delete Guru
- [ ] Klik button "Hapus"
- [ ] Confirm dialog muncul (native browser confirm)
- [ ] Klik "OK" → guru terhapus
- [ ] Alert sukses muncul
- [ ] Data hilang dari tabel

#### Validation
- [ ] Submit form kosong → error/required validation
- [ ] Nama terlalu pendek → error
- [ ] Kode duplikat → error dari backend

---

### 3. Kelas Management (`/kelas`)

#### List View
- [ ] Tabel kelas tampil dengan data yang benar
- [ ] Kolom: Nama, Kode, Jurusan, Tingkat, Aksi
- [ ] Badge jurusan muncul
- [ ] Loading state
- [ ] Empty state

#### Create Kelas
- [ ] Klik "Tambah Kelas" → modal muncul
- [ ] Form fields: Nama, Kode, Jurusan (dropdown), Tingkat (dropdown)
- [ ] Dropdown jurusan memiliki opsi: IPA, IPS, Bahasa, Umum
- [ ] Dropdown tingkat memiliki opsi: 10, 11, 12
- [ ] Isi form → "Simpan"
- [ ] Alert sukses
- [ ] Data muncul di tabel

#### Edit Kelas
- [ ] Klik "Edit" → modal muncul dengan data
- [ ] Form ter-populate
- [ ] Ubah data → "Update"
- [ ] Alert sukses
- [ ] Data ter-update

#### Delete Kelas
- [ ] Klik "Hapus" → confirm
- [ ] Kelas terhapus
- [ ] Alert sukses

---

### 4. Mapel Management (`/mapel`)

#### List View
- [ ] Tabel mapel tampil
- [ ] Kolom: Nama, Kode, Jurusan Tertentu, Tingkat Tertentu, Aksi
- [ ] Badge untuk kode dan jurusan
- [ ] "Semua" muncul jika tidak ada filter

#### Create Mapel
- [ ] Klik "Tambah Mapel" → modal muncul
- [ ] Form: Nama, Kode, Jurusan Tertentu (checkbox), Tingkat Tertentu (checkbox)
- [ ] Kosongkan semua checkbox → berarti untuk semua jurusan/tingkat
- [ ] Pilih beberapa checkbox → hanya untuk yang dipilih
- [ ] "Simpan" → alert sukses → data muncul

#### Edit Mapel
- [ ] Klik "Edit" → modal dengan data
- [ ] Checkbox ter-check sesuai data
- [ ] Update → sukses

#### Delete Mapel
- [ ] Hapus → confirm → sukses

---

### 5. Konfigurasi (`/konfigurasi`)

#### Form View
- [ ] Form konfigurasi tampil
- [ ] Input: Min JP, Max JP, Guru Max JP
- [ ] Section Default Slot Harian dengan dynamic array

#### Default Slot Harian
- [ ] Klik "Tambah Slot Harian" → baris baru muncul
- [ ] Dropdown hari: Senin - Sabtu
- [ ] Input total slot: angka
- [ ] Klik icon trash → baris terhapus

#### Save
- [ ] Isi semua field → "Simpan Konfigurasi"
- [ ] Alert sukses
- [ ] Reload page → data ter-save

---

### 6. Aturan Kelas (`/kelas-rules`)

#### Select Kelas
- [ ] Dropdown kelas tampil dengan semua kelas
- [ ] Pilih salah satu kelas
- [ ] Form aturan muncul

#### Slot Harian
- [ ] Klik "Tambah Slot Harian" → baris baru
- [ ] Dropdown hari + input total slot
- [ ] Hapus baris → icon trash

#### Hari Tidak Aktif
- [ ] Checkbox untuk setiap hari (Senin - Minggu)
- [ ] Check beberapa hari
- [ ] Hari yang di-check = disabled day

#### Slot Terkunci
- [ ] Klik "Tambah Slot Terkunci" → baris baru
- [ ] Dropdown hari + input slot ke- + dropdown mapel
- [ ] Pilih mapel dari list
- [ ] Hapus → icon trash

#### Save
- [ ] "Simpan Aturan" → alert sukses
- [ ] Reload → pilih kelas yang sama → data ter-save

---

### 7. Jadwal (`/jadwal`)

#### View Jadwal
- [ ] Input periode (contoh: 2025_1)
- [ ] Klik "Tampilkan"
- [ ] Loading state
- [ ] Status muncul (ready/pending/error/not_found)

#### Tabs
- [ ] Tab "Per Kelas" → tampil jadwal per kelas
- [ ] Tab "Per Guru" → tampil jadwal per guru
- [ ] Tab "Data Mentah" → tampil JSON
- [ ] Tab "Grid Mingguan" → tampil grid view

#### Per Kelas View
- [ ] Setiap kelas dalam card terpisah
- [ ] Tabel dengan kolom: Hari, Jam, Mapel, Guru, Durasi
- [ ] Total JP per kelas tampil

#### Per Guru View
- [ ] Setiap guru dalam card terpisah
- [ ] Tabel dengan kolom: Hari, Jam, Kelas, Mapel, Durasi
- [ ] Total JP per guru tampil

---

## 🎨 UI/UX Testing

### Responsiveness
- [ ] Desktop (> 1024px) → layout 4 kolom untuk cards
- [ ] Tablet (768px - 1024px) → layout 2 kolom
- [ ] Mobile (< 768px) → layout 1 kolom
- [ ] Sidebar collapse di mobile
- [ ] Tabel horizontal scroll di mobile

### Modal Behavior
- [ ] Modal muncul smooth (fade in)
- [ ] Klik backdrop → modal tertutup
- [ ] Klik tombol "Batal" → modal tertutup
- [ ] Klik X (jika ada) → modal tertutup
- [ ] Modal tidak bisa scroll background saat terbuka

### Alert Notifications
- [ ] Alert muncul setelah action
- [ ] Alert warna berbeda: success (green), error (red)
- [ ] Alert auto-dismiss setelah 3 detik
- [ ] Alert bisa di-close manual

### Loading States
- [ ] Button disabled saat loading
- [ ] Text button berubah ("Menyimpan..." saat loading)
- [ ] Tabel tampil "Loading..." saat fetch data

### Empty States
- [ ] Tabel kosong tampil "Tidak ada data"
- [ ] Empty state dengan icon dan text
- [ ] CTA button untuk add data

---

## 🔐 Authentication Testing

- [ ] Akses halaman protected tanpa login → redirect ke `/login`
- [ ] Login berhasil → redirect ke dashboard
- [ ] Token tersimpan di localStorage/store
- [ ] Logout → token dihapus → redirect ke login

---

## 🐛 Error Handling

### Network Errors
- [ ] Backend mati → error message muncul
- [ ] API timeout → error message
- [ ] 404 Not Found → handled dengan baik
- [ ] 500 Server Error → handled

### Form Errors
- [ ] Required field kosong → validation error
- [ ] Format salah → validation error
- [ ] Duplikat data → error dari backend tampil

### Edge Cases
- [ ] Data sangat panjang → text truncate atau wrap
- [ ] Special characters di input → handled
- [ ] Multiple rapid clicks → button disabled prevent double submit

---

## ⚡ Performance Testing

- [ ] Initial page load < 3 detik
- [ ] Navigation antar page smooth
- [ ] Tabel dengan banyak data (> 100 rows) → performance OK
- [ ] Modal open/close smooth tanpa lag
- [ ] No memory leaks (cek dengan browser DevTools)

---

## 🌐 Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 📱 Accessibility

- [ ] Tab navigation works (keyboard)
- [ ] Focus visible pada form elements
- [ ] Alt text untuk images
- [ ] Aria labels untuk icons

---

## 🎯 Integration Testing

### Guru → Kelas Rules
- [ ] Create guru baru
- [ ] Create kelas baru
- [ ] Set aturan kelas
- [ ] Guru muncul di dropdown saat lock slot

### Mapel → Guru Kompetensi
- [ ] Create mapel baru
- [ ] Edit guru → mapel baru muncul di checkbox kompetensi
- [ ] Check mapel → kompetensi ter-update

### Full Flow: Create Schedule
- [ ] Create 3 guru dengan kompetensi berbeda
- [ ] Create 3 kelas (IPA, IPS, Umum)
- [ ] Create 5 mapel
- [ ] Set konfigurasi global
- [ ] Set aturan kelas untuk setiap kelas
- [ ] Trigger create jadwal
- [ ] View jadwal → data sesuai

---

## ✅ Final Checklist

- [ ] Semua fitur CRUD work correctly
- [ ] Semua modal work correctly
- [ ] Semua alert/notification work
- [ ] Responsive design OK
- [ ] No console errors
- [ ] No console warnings (kecuali yang tidak critical)
- [ ] API integration OK
- [ ] Authentication OK
- [ ] Navigation OK
- [ ] Forms validation OK

---

## 🚀 Production Ready Checklist

- [ ] Environment variables di-set untuk production
- [ ] Build success tanpa error: `npm run build`
- [ ] Bundle size reasonable (< 1MB ideally)
- [ ] Images optimized
- [ ] Unused code removed
- [ ] Console.log removed dari production code
- [ ] Error tracking setup (Sentry, etc)
- [ ] Analytics setup (optional)

---

**Jika semua checklist di atas ✅, frontend siap production! 🎉**
