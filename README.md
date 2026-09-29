# 📖 PANDUAN LENGKAP PENGGUNAAN
### Document Repository — fajarprdn07/my-docs

Simpan panduan ini! Ini adalah "buku manual" Anda untuk mengelola website dokumen sehari-hari.

---

## 📋 DAFTAR ISI

| No | Topik | Deskripsi |
|----|-------|---------|
| 1 | 🚀 Setup Awal & Aktivasi Website | Cara aktivasi pertama kali (Hanya Sekali) |
| 2 | ➕ Menambahkan File Baru | Mengunggah dokumen ke website |
| 3 | 📂 Mengorganisir File dengan Folder | Mengelompokkan dokumen ke dalam folder |
| 4 | 🗑️ Menghapus File atau Folder | Membersihkan dokumen lama |
| 5 | 🔄 Mengganti / Update File | Memperbarui versi dokumen |
| 6 | 🔍 Mengecek Status Build | Memantau proses otomatis di GitHub |
| 7 | 🔎 Menggunakan Fitur Search & Navigasi | Cara mencari teks & navigasi folder |
| 8 | 🤖 Mengakses File untuk AI | Menggunakan data untuk integrasi AI/LLM |
| 9 | 🛠️ Troubleshooting | Pemecahan masalah jika terjadi error |

---

## 1. 🚀 SETUP AWAL & AKTIVASI WEBSITE (HANYA SEKALI)

Sebelum website dapat memproses dokumen secara otomatis, Anda harus mengunggah file kode "mesin" utama Anda ke GitHub untuk pertama kali dan mengaktifkan fitur GitHub Pages.

### Langkah 1 — Upload Kode ke GitHub Dulu
Buka **Command Prompt** (tekan `Windows + R`, ketik `cmd`, Enter), lalu jalankan perintah berikut satu per satu:

```cmd
git add .
```
*(Artinya: Menandai seluruh file kode mesin baru untuk di-upload)*

```cmd
git commit -m "Setup website"
```
*(Artinya: Menyimpan perubahan dengan pesan "Setup website")*

```cmd
git push origin main
```
*(Artinya: Mengirimkan seluruh kode mesin utama ke GitHub)*

> 🔑 **Catatan Login:** Jika diminta kredensial login GitHub di terminal, masukkan Username GitHub Anda dan gunakan **Personal Access Token** sebagai password-nya.

### Langkah 2 — Aktifkan Fitur GitHub Pages
Setelah push pertama selesai dan sukses:
1. Buka browser dan pergi ke halaman repository GitHub Anda: 👉 **`https://github.com/fajarprdn07/my-docs`**
2. Klik tab **"Settings"** (ikon gerigi ⚙️ di baris atas).
3. Pada menu sebelah kiri, cari dan klik **"Pages"**.
4. Di bagian **"Build and deployment"** -> **"Source"**, ubah pilihan dropdown dari "Deploy from a branch" menjadi **"GitHub Actions"**.
5. *PENTING:* Abaikan saja template saran (seperti Jekyll atau Static HTML) yang muncul setelahnya. Jangan diklik.
6. Selesai! Website Anda sekarang sudah aktif dan akan ter-update otomatis setiap kali ada file baru di-upload.

---

## 2. ➕ MENAMBAHKAN FILE BARU

### Cara A: Via Laptop (Rekomendasi untuk banyak file)

**Langkah-langkah:**

1. Buka **File Explorer** di laptop Anda.
2. Masuk ke folder **`D:\1\my-docs\docs`**.
3. **Copy-paste** file-file baru ke dalam folder tersebut.
   - ✅ Format yang didukung: `.pdf`, `.md`, `.png`, `.jpg`, `.jpeg`, `.tiff`, `.bmp`, `.webp`
   - ❌ Format yang TIDAK didukung: `.docx`, `.xlsx`, `.pptx`, `.zip`, `.mp4`

4. Buka **Command Prompt** (tekan `Windows + R`, ketik `cmd`, Enter).
5. Ketik perintah berikut secara berurutan:

```cmd
cd D:\1\my-docs
git add docs/
git commit -m "Tambah file baru"
git push origin main
```

6. **Selesai!** Tunggu 3-7 menit, website otomatis update.

---

### Cara B: Via Website GitHub (Tanpa laptop, bisa dari HP)

**Langkah-langkah:**

1. Buka browser: 👉 **`https://github.com/fajarprdn07/my-docs`**
2. Klik folder **`docs`**
3. Klik tombol **"Add file"** (di kanan atas daftar file) → pilih **"Upload files"**
4. **Drag & drop** file atau klik **"choose your files"**
5. Di bagian bawah, isi pesan commit: `Tambah laporan baru`
6. Klik tombol hijau **"Commit changes"**
7. **Selesai!** Tunggu 3-7 menit.

> ⚠️ **Keterbatasan Cara B:** Maksimal 100 file per upload, dan tidak bisa upload file >25MB via browser.

---

## 3. 📂 MENGORGANISIR FILE DENGAN FOLDER *(FITUR BARU)*

Website sekarang mendukung struktur folder bertingkat (subfolder tanpa batas), breadcrumb, dan indikator jumlah file.

### Langkah 1: Buat Folder di Laptop
1. Buka File Explorer → masuk ke **`D:\1\my-docs\docs`**.
2. Klik kanan → **New** → **Folder**.
3. Beri nama folder, contoh: `skripsi`
4. Buka folder `skripsi`, lalu taruh file-file PDF di dalamnya.

Struktur folder Anda akan menjadi seperti ini:
```text
docs/
├── skripsi/
│   ├── bab1.pdf
│   └── bab2.pdf
└── 0_A_Ibnudin_Fauzan_2025.pdf
```

### Langkah 2: Upload ke GitHub
Buka Command Prompt, lalu jalankan:

```cmd
cd D:\1\my-docs
git add docs/
git commit -m "Tambah folder skripsi dan isinya"
git push origin main
```

### Langkah 3: Tampilan di Website

Setelah build selesai, buka: 👉 **`https://fajarprdn07.github.io/my-docs/`**

**1. Halaman Utama (Home):**
```text
📁 Home

📂 Document Repository

📁 skripsi          ← KLIK untuk masuk
   2 file

📄 0_A_Ibnudin_Fauzan_2025.pdf
```

**2. Di dalam Folder `skripsi`:**
```text
📁 Home › 📂 skripsi

📂 skripsi

📄 bab1.pdf
📄 bab2.pdf
```

### 🎯 Fitur Folder di Website:

| Fitur | Keterangan |
|---|---|
| 📁 **Navigasi Folder** | Klik folder untuk masuk ke dalamnya |
| 🍞 **Breadcrumb** | `Home › skripsi › lampiran` — setiap bagian jalur navigasi bisa langsung diklik untuk berpindah |
| 🔍 **Search Global** | Mengetik di search bar akan mencari di **semua folder sekaligus** secara otomatis |
| 🔢 **Folder Count** | Menampilkan badge jumlah file yang ada di dalam masing-masing folder |
| 🌲 **Subfolder Tanpa Batas** | Anda bisa membuat subfolder di dalam folder (misal: `docs/skripsi/revisi/bab1.pdf`) |

---

## 4. 🗑️ MENGHAPUS FILE ATAU FOLDER

### Cara A: Via Laptop (Rekomendasi)

1. Buka **File Explorer** → masuk ke **`D:\1\my-docs\docs`**
2. **Hapus file atau folder** yang tidak diingingkan (klik kanan → Delete)
3. Buka **Command Prompt**, ketik:

```cmd
cd D:\1\my-docs
git add -A
git commit -m "Hapus file/folder lama"
git push origin main
```
*(Catatan: `-A` akan otomatis mendeteksi semua perubahan termasuk penghapusan file/folder)*

4. **Selesai!** Item akan terhapus dari website setelah build selesai.

---

### Cara B: Via Website GitHub

1. Buka **`https://github.com/fajarprdn07/my-docs`**
2. Masuk ke folder **`docs`** (atau subfoldernya)
3. Klik nama file yang ingin dihapus
4. Klik ikon **titik tiga (⋯)** di kanan atas → pilih **"Delete file"**
5. Klik tombol hijau **"Commit changes"**

---

## 5. 🔄 MENGGANTI / UPDATE FILE

Misalnya Anda punya file `bab1.pdf` di dalam folder `skripsi/` yang ingin diganti dengan revisi baru:

1. Buka folder tujuan di **`D:\1\my-docs\docs\skripsi`**
2. Langsung **timpa (overwrite)** file lama dengan file baru (pastikan nama file sama persis)
3. Buka Command Prompt, ketik:

```cmd
cd D:\1\my-docs
git add docs/
git commit -m "Update skripsi/bab1.pdf"
git push origin main
```

4. **Selesai!** Website akan memproses versi yang terbaru.

---

## 6. 🔍 MENGECEK STATUS BUILD

Setiap kali melakukan push, pantau proses publikasi:

1. Buka: 👉 **`https://github.com/fajarprdn07/my-docs/actions`**
2. Status yang terlihat:

| Ikon | Status | Arti |
|---|---|---|
| 🟡 Berputar | In Progress | Sedang diproses / di-generate, silakan tunggu |
| ✅ Centang hijau | Success | Berhasil! Website sudah terupdate |
| ❌ Silang merah | Failure | Ada kendala/error pada build |

3. Jika **gagal (❌)**:
   - Klik proses yang gagal → klik langkah yang bertanda ❌
   - Screenshot / copy pesan error untuk diperbaiki.

---

## 7. 🔎 MENGGUNAKAN FITUR SEARCH & NAVIGASI

### 1. Pencarian Global (Search Bar Utama):
- Buka **`https://fajarprdn07.github.io/my-docs/`**
- Ketik kata kunci pada kotak pencarian (minimal 2 karakter)
- **Search ini bersifat Global:** Menemukan file yang cocok di **semua folder dan subfolder**
- Hasil menampilkan:
  - 📄 Nama file & lokasinya
  - 📊 Jumlah halaman
  - 📝 Cuplikan teks yang cocok (highlight kuning)

### 2. Navigasi Breadcrumb:
- Di bagian atas daftar dokumen, Anda dapat melihat jalur navigasi seperti: `Home › folder1 › folder2`
- Klik nama folder mana saja pada breadcrumb untuk langsung kembali ke level tersebut.

### 3. Pencarian di dalam PDF Viewer:
- Saat membaca dokumen PDF, tekan **`Ctrl + F`** di keyboard untuk mencari kata di seluruh halaman PDF tersebut.

---

## 8. 🤖 MENGAKSES FILE UNTUK AI

Website Anda sudah terstruktur dan ramah dibaca oleh model AI (LLM):

- **Index Dokumen untuk LLM:**
  ```text
  https://fajarprdn07.github.io/my-docs/llms.txt
  ```
- **Akses Teks Polos (Plain Text):**
  ```text
  https://fajarprdn07.github.io/my-docs/text/[nama-file].txt
  ```
- **Sitemap & Robots:**
  ```text
  https://fajarprdn07.github.io/my-docs/sitemap.xml
  https://fajarprdn07.github.io/my-docs/robots.txt
  ```

---

## 9. 🛠️ TROUBLESHOOTING (PEMECAHAN MASALAH)

| Masalah | Solusi Cepat |
|---|---|
| **`git push` ditolak / Out of sync** | Jalankan `git pull origin main --rebase`, lalu ulangi `git push origin main`. |
| **Halaman 404 Not Found** | Cek Settings → Pages di repo, pastikan Build and deployment Source diset ke **GitHub Actions**. |
| **File/Folder tidak muncul** | Pastikan build di tab **Actions** sudah centang hijau ✅, lalu lakukan hard refresh di browser dengan **`Ctrl + Shift + R`**. |
| **Folder kosong tidak muncul di web** | Git tidak membaca folder yang benar-benar kosong. Taruh minimal 1 file di dalam folder tersebut. |
| **PDF Viewer gelap / tidak termuat** | Gunakan tombol **"🌐 Buka File Asli"** di toolbar atas viewer. |

---

## 📌 RINGKASAN PERINTAH GIT (Cheat Sheet)

| Perintah | Fungsi |
|---|---|
| `cd D:\1\my-docs` | Masuk ke direktori repository lokal |
| `git status` | Melihat file/folder mana saja yang baru, diedit, atau dihapus |
| `git add docs/` | Menandai perubahan khusus di dalam folder `docs/` |
| `git add -A` | Menandai seluruh perubahan (termasuk file/folder yang dihapus) |
| `git commit -m "pesan perubahan"` | Menyimpan catatan riwayat perubahan |
| `git push origin main` | Mengirim data terbaru ke GitHub untuk di-build |
| `git pull origin main --rebase` | Mengambil pembaruan terbaru dari GitHub |

---

## 🔄 WORKFLOW HARIAN (Ringkasan)

```
┌─────────────────────────────────────────────────────────────┐
│                 WORKFLOW HARIAN ANDA                        │
│                                                             │
│  1. Atur file/folder di: D:\1\my-docs\docs                  │
│              ↓                                              │
│  2. Buka Command Prompt, jalankan:                          │
│     cd D:\1\my-docs                                         │
│     git add -A                                              │
│     git commit -m "Update dokumen dan folder"               │
│     git push origin main                                    │
│              ↓                                              │
│  3. Tunggu 3-7 menit (Actions: ✅)                          │
│              ↓                                              │
│  4. Buka https://fajarprdn07.github.io/my-docs/             │
│     → Folder, file & search sudah aktif! 🎉                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 TIPS PENTING

1. **Folder Kosong:** Git tidak mendeteksi folder yang kosong. Agar folder muncul di website, pastikan ada minimal 1 file di dalamnya.
2. **Penamaan Folder & File:** Gunakan huruf kecil, angka, serta tanda strip `-` atau underscore `_` (contoh: `laporan-2025`, `skripsi_bab1.pdf`) untuk meminimalisir error link URL.
3. **Folder Inti:** Jangan mengubah file di dalam `.github/` atau `scripts/` kecuali ada penyesuaian sistem. Cukup kelola isi folder `docs/`.
