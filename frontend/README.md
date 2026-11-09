# Khamar frontend

The React/Vite frontend reads and writes farm records through the Express API. It does not contain a demo database or offline write fallback.

## Local development

1. Start MongoDB and configure `backend/.env` from `backend/.env.example`.
2. From `backend`, run `npm install` once and `npm run dev`.
3. From `frontend`, copy `.env.example` to `.env.local`, run `npm install` once, then `npm run dev`.

The default API URL is `http://localhost:5000/api`. Set `VITE_API_URL` to the reachable API base URL (including `/api`) when it differs. Vite embeds this value at build time.

## Deployment

Deploy the repository root as a single Vercel project. The root `vercel.json` builds the Vite frontend from `frontend` and routes `/api` requests to Vercel Functions backed by the existing Express app. Production uses the same-origin `/api` URL automatically; no `VITE_API_URL` setting is required. Local frontend development continues to use `http://localhost:5000/api`.

In Vercel project settings, set `MONGODB_URI` and a strong, unique `JWT_SECRET` as server-side environment variables for Development, Preview, and Production as needed. Do not use the `VITE_` prefix for secrets. Configure MongoDB Atlas Network Access to allow the Vercel function to connect; because Vercel does not provide a fixed outbound IP by default, use Atlas's documented network access options and a database user with only the permissions this app needs. The `CORS_ORIGIN` variable is only needed if the API is called from a different origin; otherwise the frontend and API share one Vercel origin.

From the repository root, `npm run build` creates the static frontend bundle in `frontend/dist`, and `npm run lint` runs ESLint. For local backend development, run `npm run dev:backend` from the repository root or use the existing commands from `backend`.
