# Khamar frontend

The React/Vite frontend reads and writes farm records through the Express API. It does not contain a demo database or offline write fallback.

## Local development

1. Start MongoDB and configure `backend/.env` from `backend/.env.example`.
2. From `backend`, run `npm install` once and `npm run dev`.
3. From `frontend`, copy `.env.example` to `.env.local`, run `npm install` once, then `npm run dev`.

The default API URL is `http://localhost:5000/api`. Set `VITE_API_URL` to the reachable API base URL (including `/api`) when it differs. Vite embeds this value at build time.

## Deployment

Deploy the frontend as a static Vite site and deploy the Express backend separately with MongoDB. Set the frontend build environment variable `VITE_API_URL` to the public Express API URL, and set the backend `CORS_ORIGIN` to the exact deployed frontend origin(s). Keep MongoDB and JWT credentials only in the backend environment; do not put them in frontend variables.

`npm run build` creates the static frontend bundle in `dist`. `npm run lint` runs ESLint.
