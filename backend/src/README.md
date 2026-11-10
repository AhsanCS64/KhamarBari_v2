# Khamar Backend

Express + MongoDB API for the Khamar farm management system.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from template
copy .env.example .env
# (edit .env — fill MONGODB_URI, JWT_SECRET)

# 3. Start
npm run dev
```

## Deploy to Vercel

1. Import the repository into Vercel and set the project root to `backend`.
2. Add these environment variables in the Vercel project settings:
   - `MONGODB_URI`: your MongoDB Atlas connection string, including the database name.
   - `JWT_SECRET`: a long, unique secret.
   - `CORS_ORIGIN`: the deployed frontend origin (or comma-separated allowed origins).
   - `NODE_ENV`: `production`.
3. Ensure your MongoDB Atlas network access settings allow connections from your deployment.
4. Deploy. The API is available under `/api` (for example, `/api/health`).

Do not commit `.env` or put database credentials in `vercel.json`; configure secrets in Vercel's environment settings.
