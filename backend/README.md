# Kurs — Python code runner (Django + Docker sandbox)

## Local (Docker siz)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

`RUNNER_USE_DOCKER=0` (default) — lokal Python.

## Server (Docker sandbox)

```bash
# 1) Sandbox image
docker build -f backend/Dockerfile.sandbox -t kurs-sandbox:latest backend

# 2) API (+ docker.sock orqali sandbox ochadi)
docker compose up -d --build runner
```

Yoki faqat API hostda, sandbox Docker’da:

```bash
set RUNNER_USE_DOCKER=1
set RUNNER_DOCKER_IMAGE=kurs-sandbox:latest
python manage.py runserver 8000
```

## API

- `GET /api/health/` — status + docker mode
- `POST /api/run/` — `{ "code", "stdin", "language": "python" }`

## Test

```bash
python manage.py test runner
```
