# ForumIQ — Next.js frontend

Live site: https://forumiq.muhammadyeasin.com

This is the frontend client for ForumIQ, built with Next.js (App Router) + React 19 and TypeScript. The app consumes a REST API (configured via `NEXT_PUBLIC_API_BASE_URL`) and uses NextAuth for authentication.

---

## Quick start (local development)

Prerequisites
- Node.js 18+ (Node 20 recommended)
- pnpm (recommended) or npm/yarn
- A running backend API (see `NEXT_PUBLIC_API_BASE_URL`)

1. Clone and install

```bash
git clone <repo-url>
cd forumiq-client
pnpm install
```

2. Create env file

Copy `.env.example` to `.env.local` or `.env` and fill values (see `.env.example` in the repo).

3. Run dev server

```bash
pnpm dev
# opens on http://localhost:3000
```

4. Build & production run

```bash
pnpm build
pnpm start
```

If running in Docker, provide build-arg and runtime envs as needed (see Docker section below).

---

## Environment variables

Required variables (see `.env.example`):

- `NEXT_PUBLIC_API_BASE_URL` — public API base URL used by the frontend (baked at build time). Example: `https://api-forumiq.muhammadyeasin.com/api/v1`
- `NEXTAUTH_URL` — public URL where the frontend is served. Example: `https://forumiq.muhammadyeasin.com`
- `NEXTAUTH_SECRET` — secret used by NextAuth for signing cookies.

Notes:
- `NEXT_PUBLIC_*` variables are embedded into the client at build time. If you need different API endpoints per environment, you must either rebuild with different build-args or implement a runtime config injection.
- Do not commit `.env` with secrets. Use `.env.example` as a template.

---

## Docker

Simple build (bakes API base at build time):

```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1 -t forumiq-client:latest .
docker run -d -p 3000:3000 --env-file .env --rm forumiq-client:latest
```

If you plan to deploy the same image to multiple environments, consider using Next.js `output: "standalone"` or a small runtime config injection to avoid baking `NEXT_PUBLIC_API_BASE_URL` into the bundle.

---

## Project structure (high-level)

Root files and folders you’ll commonly edit:

- `app/` — Next.js App Router pages and layouts
	- `app/page.tsx` — home page (lists threads, creates thread UI)
	- `app/_components/` — shared UI building blocks used by app pages (threads list, thread card, create-thread, etc.)
	- `app/threads/[id]/` — thread detail page
	- `app/login`, `app/register`, `app/profile` — auth pages

- `src/components/` — reusable UI components (navbar, notifications, avatars, etc.)
- `src/providers/` — React providers (SessionProvider, Redux provider, sockets)
- `src/redux/` — RTK Query slices and store
- `src/lib/` — utility helpers
- `src/config/` — runtime/build-time config helpers (e.g. `env.ts`)
- `public/` — static assets served as-is
- `next.config.ts`, `package.json`, `pnpm-lock.yaml` — project config and deps

When you want to change behavior/UI:

- For a page change, edit the file under `app/` (App Router). For example change the home layout in `app/page.tsx`.
- For a small UI component, edit `src/components/...` or `src/components/ui/` for shared primitives.
- Data fetching uses RTK Query slices in `src/redux/features/*-api.ts`. Update endpoints there to change how the client talks to the API.

---

## Authentication notes

- The project uses NextAuth; ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set.
- If login returns `401 Unauthorized`, check:
	- The frontend is calling the correct API URL (check network tab). `NEXT_PUBLIC_API_BASE_URL` must point to the backend.
	- Cookies: backend must set cookies with appropriate `SameSite`/`Secure` flags for your environment. During local HTTP development `Secure` must be false.
	- CORS: backend must allow credentials and the frontend origin.

---

## Testing / Lint / Typecheck

- Typecheck: `pnpm build` runs TypeScript checks.
- Lint: `pnpm lint` (configured in `package.json`).

---

## Contributing

- Fork, create a branch, and open a PR. Keep changes small and focused.
- Add tests for new functionality when possible.

---

## Troubleshooting

- `401 Unauthorized` on login: check API URL, CORS, cookies (see Authentication notes).
- `useSearchParams() should be wrapped in a suspense boundary` during build: wrap client components that use `next/navigation` in a React `Suspense` boundary in the parent server component (see `app/layout.tsx` / `app/page.tsx`).
- Build fails in Docker: ensure required env build-args are passed to `docker build` and that server APIs are reachable by the client domain.

---

If you want, I can:
- Add a runtime-config injection script and example Dockerfile so `NEXT_PUBLIC_API_BASE_URL` can be overridden at container start.
- Add a short contributor guide with local debugging steps for auth issues.

---

Happy hacking — if you want any of the optional follow-ups, tell me which and I’ll implement it.
