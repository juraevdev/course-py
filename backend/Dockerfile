FROM python:3.12-slim-bookworm

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends docker.io \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV RUNNER_USE_DOCKER=1
ENV RUNNER_DOCKER_IMAGE=kurs-sandbox:latest

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
