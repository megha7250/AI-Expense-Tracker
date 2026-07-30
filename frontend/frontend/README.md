# Expensely — AI Expense Tracker (Frontend)

A production frontend for the `et-core` Spring Boot backend: React 19 +
TypeScript + Vite + Tailwind v4 + shadcn-style UI (Radix) + Framer Motion +
TanStack Query + Axios + React Hook Form + Zod + Recharts.

Every API call in this app maps to a real endpoint in your backend — see
[`API_INTEGRATION_MAP.md`](./API_INTEGRATION_MAP.md) for the full audit,
including the handful of features (category/payment-mode/bank CRUD, password
change, profile updates, token refresh) that the current backend doesn't
support yet. Those are shown in the UI with a clearly labeled
"not implemented" badge instead of being faked.

## Requirements

- Node.js 18+
- The `et-core` Spring Boot backend running locally (or reachable) with
  PostgreSQL configured, per its own `application.yml`

## 1. Install

```bash
npm install
```

## 2. Configure the API URL

```bash
cp .env.example .env
```

```env
# .env
VITE_API_BASE_URL=http://localhost:8080
```

## 3. ⚠️ Backend CORS — must match

`AppConfig.corsConfigurationSource()` in the backend hardcodes:

```java
configuration.setAllowedOrigins(List.of("http://localhost:3000"));
```

This frontend's dev server is configured in `vite.config.ts` to run on
**port 3000** specifically so it matches. If you change the dev port, update
the backend's CORS allowlist too (or the browser will silently block every
request).

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000. Register a new account, complete onboarding
(creates your first bank + cash account against the real
`POST /api/onboarding` endpoint), then explore the dashboard.

## 5. Build for production

```bash
npm run build
```

Outputs static assets to `dist/`. Preview locally with:

```bash
npm run preview
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the Spring Boot backend. No trailing slash. |

## Deployment

This is a static SPA (Vite build output) — deploy `dist/` to any static host
(Vercel, Netlify, S3+CloudFront, Nginx, etc).

1. Set `VITE_API_BASE_URL` to your deployed backend's public URL at build
   time (Vite inlines env vars into the bundle, so it must be set **before**
   `npm run build`, not just at runtime).
2. Update the backend's `AppConfig.corsConfigurationSource()` to allow your
   deployed frontend's origin (it currently only allows `localhost:3000`).
3. Because the app is a client-side router (React Router), configure your
   host to rewrite all unknown paths to `/index.html` (SPA fallback) —
   e.g. Netlify's `_redirects: /* /index.html 200`, or Vercel's default
   SPA handling, or an Nginx `try_files $uri /index.html;`.
4. Serve over HTTPS — mixed content (HTTPS frontend calling HTTP backend)
   will be blocked by browsers, and the SSE notifications endpoint in
   particular needs a stable connection.

## Project structure

```
src/
  api/          Thin axios wrappers, one file per backend controller
  components/
    ui/         shadcn-style primitives (button, dialog, table, select, ...)
    transactions/  TransactionFormDialog (create/edit)
    common/     PageHeader, EmptyState, ErrorState, NotImplemented badge
  hooks/        React Query hooks per resource (useTransactions, useAi, ...)
  layouts/      AuthLayout, DashboardLayout (sidebar/topbar/notifications)
  pages/        One file per route
  routes/       ProtectedRoute / OnboardingRoute / PublicOnlyRoute guards
  services/     sse.ts — authenticated SSE client (fetch-based)
  store/        Zustand: authStore (JWT + session), themeStore (dark/light)
  types/        api.ts — TypeScript types mirroring backend DTOs exactly
  utils/        schemas.ts (Zod), formatting helpers
```

## Notable implementation decisions

- **No fake token refresh.** The backend issues only short-lived access
  tokens with no refresh endpoint. Rather than build a refresh flow that
  doesn't exist server-side, a 401 response anywhere triggers a clean logout
  and redirect to `/login?expired=1` with a toast explaining why.
- **Authenticated SSE without `EventSource`.** `/api/notifications/subscribe`
  requires a Bearer token, but the native `EventSource` API can't send
  custom headers. `src/services/sse.ts` implements the `text/event-stream`
  wire protocol manually over `fetch()` + `ReadableStream`.
- **Signed transaction amounts.** The backend returns transaction amounts
  already signed (negative for money leaving an account). The UI always
  submits positive magnitudes and lets the backend apply the sign per
  `TransactionType`.
- **Category id sign convention.** Per `Transaction.getCategoryId()` in the
  backend, positive ids are system categories and negative ids are
  user-defined categories — preserved as-is end to end.
- **Currency formatting** uses `Intl.NumberFormat('en-IN', { currency: 'INR' })`
  with tabular mono numerals throughout, since the backend's seed data
  (banks, categories) targets an Indian fintech context.

## Design system

Palette, type system (Sora display / Inter body / JetBrains Mono for all
currency figures), and layout are defined as CSS custom properties in
`src/index.css` and consumed via Tailwind v4's `@theme inline`. Both light
and dark themes are fully supported and persisted (`useThemeStore`).
