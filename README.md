# RealTimeChat

Real-time team messaging, in the spirit of Slack: workspaces, group channels, direct messages and live notifications.

**Live:** https://chat.gillesmaes.dev

## Features

- Sign up, log in and log out (Django sessions, CSRF-protected JSON API)
- New users automatically join the default workspace and its `#general` channel
- Group channels per workspace; any member (not guests) can create one from the sidebar
- Direct (1:1) conversations with colleagues from a shared workspace
- Real-time messaging over WebSocket, with the last 50 messages loaded on open and automatic reconnection
- Live notifications: unread counters per conversation, clickable toast, total in the tab title
- Access control enforced on the server for both the API and the WebSocket: a direct conversation is visible only to its two participants
- Responsive layout (sidebar becomes a drawer on small screens)
- Public landing page with a Free / Pro pricing (quotas are displayed, not enforced yet)

## Stack

| Layer | Technology |
|---|---|
| Backend | Django 6 (ASGI), Django Channels, Uvicorn |
| Real-time relay | Redis (channel layer only, not a database) |
| Database | PostgreSQL in production, SQLite in development |
| Frontend | React, Vite, Tailwind CSS, shadcn/ui |
| Static files | WhiteNoise (serves the React build and the admin) |
| Hosting | OVH VPS, Docker Compose, Caddy (automatic HTTPS) |
| CI/CD | GitHub Actions → GHCR → SSH deploy |

## Project layout

```
.
├── app-client/              React app (Vite)
│   └── src/                 App.jsx, Login.jsx, Register.jsx, Chat.jsx, api.js
├── RealTimeChat/            Django project (manage.py lives here)
│   ├── RealTimeChat/        settings.py, asgi.py, urls.py
│   └── accounts/            models, JSON API (api.py), WebSocket consumers, tests
├── .devcontainer/           VS Code dev container (Python 3.12 + Node 22)
├── .github/workflows/       deploy.yml: test → build → deploy
└── Dockerfile               multi-stage: builds React, then the Python image
```

## Running locally

The project is meant to be opened in the **dev container**: nothing needs to be installed on the host apart from Docker and VS Code.

1. Open the repository in VS Code, then run **Dev Containers: Reopen in Container**. The first build installs the Python and Node dependencies.
2. In a first terminal (inside the container):

   ```bash
   cd RealTimeChat
   python manage.py migrate
   python manage.py createsuperuser   # optional, for /admin/
   uvicorn RealTimeChat.asgi:application --reload --port 8000
   ```

3. In a second terminal:

   ```bash
   cd app-client
   npm run dev
   ```

4. Open **http://127.0.0.1:5173**. Vite proxies `/api` and `/ws` to Django on port 8000. Use `127.0.0.1` rather than `localhost`: some browsers resolve `localhost` to IPv6 and the WebSocket connection fails.

The admin is at http://127.0.0.1:8000/admin/.

## Tests

```bash
cd RealTimeChat
python manage.py test accounts
```

`tests.py` covers the HTTP API (auth, channels, direct messages); `test_consumers.py` covers the WebSocket consumers (access rules, broadcast, notifications). Tests use an in-memory channel layer, so Redis is not needed.

## Configuration

All settings come from environment variables:

| Variable | Purpose | Default |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | required |
| `DJANGO_DEBUG` | `1` enables debug mode | `0` |
| `DJANGO_ALLOWED_HOSTS` | comma-separated host names | `localhost,127.0.0.1` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | comma-separated origins, e.g. `https://chat.gillesmaes.dev` | |
| `DATABASE_URL` | e.g. `postgres://user:pass@db:5432/realtimechat` | local SQLite |
| `REDIS_URL` | e.g. `redis://redis:6379/0`; without it, an in-memory layer is used | |
| `DJANGO_DEFAULT_WORKSPACE` | workspace new users join | `Demo` |

## Deployment

Every push to `main` runs the workflow in `.github/workflows/deploy.yml`:

1. **test** and **frontend** (also run on every pull request): `ruff` lint, `manage.py check --deploy` and the Django test suite; ESLint and the Vite build for the React app;
2. **build**: builds the Docker image and pushes it to `ghcr.io/buzzy002/realtimechat`;
3. **deploy**: connects to the server over SSH, pulls the image, runs the migrations and restarts the app.

`main` is protected: changes go through a pull request with a passing `test` check. Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## Team

- Gilles Maes
- Michael Warez