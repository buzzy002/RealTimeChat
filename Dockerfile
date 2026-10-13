# --- Step 1 : frontend build ---
FROM node:22-alpine AS frontend
WORKDIR /front
COPY app-client/package.json app-client/package-lock.json ./
RUN npm ci
COPY app-client/ ./
RUN npm run build

# --- Step 2 : complete build ---
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY RealTimeChat/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY RealTimeChat/ ./
COPY --from=frontend /front/dist ./frontend
RUN DJANGO_SECRET_KEY=build-only python manage.py collectstatic --noinput

RUN useradd --create-home app && chown -R app /app
USER app

EXPOSE 8000
CMD ["uvicorn", "RealTimeChat.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--proxy-headers", "--forwarded-allow-ips", "*"]