# Autoschedule Frontend

Vue 3 + Vite dashboard for the autoschedule project. Authentication uses Firebase Auth, state is stored in Pinia, and every API request shares a centralized Axios client that automatically injects Firebase ID tokens.

## Prerequisites

- Node.js 20+ (see `package.json` engines field)
- Firebase project (web app) for authentication
- Backend service running on `http://localhost:5000` (or adjust `VITE_API_URL`)

## Environment variables

Copy `.env.example` to `.env` and fill the values:

```ini
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=<your-key>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
VITE_FIREBASE_USE_AUTH_EMULATOR=false
VITE_FIREBASE_AUTH_EMULATOR_URL=http://127.0.0.1:9099
```

> **Note:** Even when using the Firebase emulator suite you still need a Firebase web-app configuration (API key, auth domain, etc.). When `VITE_FIREBASE_USE_AUTH_EMULATOR=true`, any missing fields fall back to demo values so the app can boot, but it is recommended to paste the real config from the Firebase console for consistency.

## Using the Firebase Auth emulator

1. Start the emulator (from your Firebase project folder):

	```sh
	firebase emulators:start --only auth --project <project-id>
	```

2. Copy the real Firebase Web App config (API key, auth domain, etc.) from the console into `frontend/.env`—the emulator still proxies those calls through your project.
3. Set `VITE_FIREBASE_USE_AUTH_EMULATOR=true` (and optionally adjust `VITE_FIREBASE_AUTH_EMULATOR_URL`).
4. In `backend/.env`, ensure `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` and leave `REQUIRE_AUTH=1` so tokens are still validated.
5. Seed a user inside the emulator (see below) and restart both frontend (`npm run dev`) and backend (`python app.py`).

### Seeding emulator users

The backend ships with `scripts/seed_auth_emulator.py` to bootstrap credentials. Example:

```powershell
cd ..\backend
python scripts\seed_auth_emulator.py --email admin@example.com --password S3cretPass --role admin
```

The script respects `.env` (project ID + emulator host) and will create/update the user, including the `role` custom claim, so the frontend can log in immediately.

## Install dependencies

```sh
npm install
```

## Run locally

```sh
npm run dev
```

## Production build

```sh
npm run build
```

## Notable folders

- `src/firebase` – Firebase app/bootstrap
- `src/stores/auth` – Pinia store wired to Firebase Auth
- `src/utils/apiClient` – Axios instance that attaches ID tokens
- `src/repositories/*` – API abstractions using the shared client

## Authentication flow

1. `main.js` waits for `authStore.init()` before mounting.
2. `authStore` listens to `onAuthStateChanged`, persists ID tokens + profile, and exposes helpers for Axios/route guards.
3. Route guard (`router/index.js`) blocks every page (except `/login`) until Firebase validates the user.

## API requests

All repositories import the shared `apiClient`. The Axios interceptors:

- Attach the latest Firebase ID token to every request.
- Retry once on `401` by requesting a fresh token from Firebase.

This keeps backend endpoints consistent and avoids duplicating networking logic.
