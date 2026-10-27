# Artifak Teknologi

Aplikasi bazar artifak teknologi — katalog digital untuk memamerkan dan mengelola koleksi artifak teknologi.

## Fitur

- Katalog artifak dengan pencarian dan filter kategori
- Halaman detail artifak (gambar + video)
- Panel admin: login, tambah, edit, dan hapus artifak
- Upload gambar/video artifak
- REST API dengan autentikasi JWT

## Teknologi

| Bagian   | Teknologi                                                    |
| -------- | ------------------------------------------------------------ |
| Frontend | React 18, TypeScript, React Router, Framer Motion, Axios     |
| Backend  | Node.js, Express, SQLite, JWT, Multer, Bcrypt                |

## Struktur Project

```
.
├── frontend/   # Aplikasi React (Create React App)
└── backend/    # REST API Express + SQLite
```

## Menjalankan Secara Lokal

Persyaratan: Node.js 18+

### 1. Backend

```bash
cd backend
npm install
npm start
```

Server berjalan di `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Aplikasi berjalan di `http://localhost:3000`.

## Variabel Environment

### Frontend

| Variabel          | Default                  | Keterangan            |
| ----------------- | ------------------------ | --------------------- |
| `REACT_APP_API_URL` | `http://localhost:5000/api` | URL dasar REST API |

### Backend

| Variabel     | Default          | Keterangan                        |
| ------------ | ---------------- | --------------------------------- |
| `PORT`       | `5000`           | Port server                       |
| `JWT_SECRET` | `dev-secret-key` | Secret untuk menandatangani token |

## Deployment

| Bagian   | Platform |
| -------- | -------- |
| Frontend | Vercel   |
| Backend  | Railway  |

## Lisensi

Proyek pembelajaran.
