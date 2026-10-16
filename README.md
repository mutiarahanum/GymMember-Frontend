# GymMember Frontend

Frontend aplikasi manajemen keanggotaan gym yang dibangun menggunakan Next.js dan TypeScript, serta terhubung dengan backend Laravel API.

## Teknologi

- Next.js
- React
- TypeScript
- Tailwind CSS
- Laravel REST API
- Sanctum Authentication

## Fitur

- Login dan autentikasi API
- Menampilkan dan mengelola data member
- Menampilkan dan mengelola paket membership
- Pendaftaran membership
- Pencatatan pembayaran
- Melihat status membership

## Persyaratan

Pastikan perangkat sudah memiliki:

- Node.js dan npm
- Git
- Backend GymMember yang sudah berjalan

## Instalasi

### 1. Clone repository

```bash
git clone https://github.com/mutiarahanum/GymMember-Frontend.git
cd gymmember-nextjs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi environment

Buat file `.env.local` di folder utama project, lalu isi:

```env
API_BASE_URL=http://127.0.0.1:8000/api
API_TOKEN=isi_token_sanctum
```

Ganti `API_TOKEN` dengan token Sanctum yang valid dari backend GymMember.

Jangan unggah `.env.local` atau token asli ke GitHub.

### 4. Jalankan backend

Pastikan backend Laravel sudah berjalan dan database sudah dikonfigurasi dengan benar.

### 5. Jalankan frontend

```bash
npm run dev
```

Buka aplikasi melalui:

http://localhost:3000

## Repository

- Backend: https://github.com/mutiarahanum/GymMember-Backend
- Frontend: https://github.com/mutiarahanum/GymMember-Frontend

## Catatan

- Backend menggunakan Laravel API.
- Frontend menggunakan token Sanctum untuk mengakses endpoint API.
- Jika konfigurasi environment diubah, restart server development Next.js.
