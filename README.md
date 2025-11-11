# Accessibility Audit Agent — Vercel
Vercel-ready Vite + React + TypeScript app with serverless API endpoints for accessibility audits.

## Structure
- Frontend (Vite app) in this folder.
- API functions in `/api` (Vercel Serverless Functions).

## Endpoints
- `POST /api/audit_html`  -> { html, baseUrl?, options? }
- `POST /api/audit_url`   -> { url, options? }
- `POST /api/audit_dynamic` -> { url, options? } (Chromium-rendered, for JS-heavy sites)

## Local dev
npm i -g vercel
npm install
vercel dev

## Deploy
Push to Git and import in Vercel with:
- Root Directory: this folder
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist

Dynamic audits may take longer on cold starts.
