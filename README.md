# Kurs — dasturlash

Offline dasturlash kursi: o‘quvchi hisoblari, mavzular, topshiriqlar, Python editor + Docker sandbox.

## Frontend (Next.js)

```bash
npm install
npm run db:setup
npm run dev
```

[http://localhost:3000](http://localhost:3000)

O‘qituvchi hisobi `npm run db:seed` orqali yaratiladi (email/parol `prisma/seed.ts` da).

## Backend — Python runner

### Local

```bash
cd backend
.\.venv\Scripts\activate
python manage.py runserver 8000
```

### Docker sandbox (server)

```bash
# Sandbox image
docker build -f backend/Dockerfile.sandbox -t kurs-sandbox:latest backend

# API (docker.sock orqali yangi konteyner ochadi)
docker compose up -d --build runner
```

API: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

## Asosiy imkoniyatlar

- O‘qituvchi: mavzu/topshiriq, guruhlar, o‘quvchi qo‘shish, javoblarni ko‘rish
- Ball + avto-test: CODE topshiriqda stdin/stdout testlari, qo‘lda baholash
- Reyting: guruh ichida va umumiy ballashuv
- O‘quvchi: progress, muddat, savol, eslatma, Kod/Javob, Python Run
- Bildirishnoma: faqat sayt ichida (email yo‘q)
