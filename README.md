# govi-isuru-web

Web app for **Govi Isuru**, a smart-farming platform for Sri Lankan farmers, officers and buyers (Sinhala and English).
Next.js 15 (App Router), React 19, Tailwind CSS. Hosted on Vercel.

```
browser ──> govi-isuru-web (this repo) ──/api/*──> govi-isuru-api ──> govi-isuru-ai-service
```

The browser calls `/api/*` and `/uploads/*` on this site's own origin. Next.js forwards them to the backend set in
`API_URL` (`next.config.mjs`), so CORS isn't needed and the backend address isn't built into the bundle.

## Screens

* **Farmers:**
  * AI Doctor (photo diagnosis for paddy, tea and chili, with heatmap, wrong-crop retry and retake advice)
  * crop chatbot
  * paddy yield forecasts (official DCS data)
  * crop suitability (FAO EcoCrop)
  * disease reports and area alerts
  * consultations with officers (video)
  * marketplace
* **Officers:**
  * dashboard
  * report verification
  * **unknown-disease review** (group the photos the AI couldn't match, then confirm a new disease or dismiss)
  * field visits
  * analytics
* **Buyers:** marketplace and saved listings.
* **Admins:** users, officer approval, moderation.

## Run locally

```bash
cp .env.example .env.local      # API_URL=http://localhost:5000 (govi-isuru-api)
npm install
npm run dev                     # http://localhost:3000
```

## Deploy on Vercel (free)

1. Import `Kalana-Lakshan/govi-isuru-web` in Vercel; the framework is detected as Next.js.
2. Set the environment variable `API_URL` to the backend URL, e.g. `https://govi-isuru-api.onrender.com`.
3. In the backend, set `CORS_ORIGINS` and `FRONTEND_URL` to the Vercel URL. `FRONTEND_URL` is used in email links.

## Structure

```
src/app/           Next.js entry: layout (metadata, global CSS) and a catch-all page
src/legacy/        the screens carried over from the original React app, routed on the client by react-router
public/            icons, manifest, service worker (push notifications), map data
```

All screens run in the browser (`ClientApp.js`, `ssr: false`), because they use `localStorage`, the camera and
react-router. Screens can be moved one at a time to `src/app/<route>/page.js` as server or client components; the
catch-all page keeps the rest working meanwhile.
