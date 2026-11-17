# Acme Workspace

A Notion-inspired workspace built with Next.js 16, Tailwind CSS 4, shadcn-style Radix components,
Prisma ORM, PostgreSQL, Better Auth, OpenRouter, Zod and lucide-react.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

The assistant reads its key from `.env.local` (git-ignored). If that file does not exist, create it and
add `OPENROUTER_API_KEY=YOUR_API_KEY_HERE`. Replace the placeholder with your own key and restart
`npm run dev`. The app never asks for the key in chat and never sends it to the browser.

Open <http://localhost:3000>.

This environment uses the system PostgreSQL cluster on **port 5432** with the `cloud` database.
The schema is migrated and seeded with all 226 workspace pages already.

If you need to regenerate the Prisma Client, apply migrations, or restore seed data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

An optional project-local cluster (port 5433) is also included; start it with `npm run db:start`
and point `DATABASE_URL` at it if you want an isolated database.

The UI also has an automatic seed-data fallback if the database is unavailable, so it never gets
stuck on a blank screen.

## Accounts and profile

- `/sign-up` — create an account; a unique **DiceBear Open Peeps** character is generated from your name.
- `/sign-in` — sign in with email and password (Better Auth, backed by PostgreSQL).
- `/profile` — pick an Open Peeps avatar, background color and display name; changes persist to your account.

The sidebar user menu links to all three pages and to sign out. Avatars show up there too.

Open Peeps artwork is by Pablo Stanley, released under CC0 1.0.

## PostgreSQL + DBeaver

The active configuration in `.env` is:

```
DATABASE_URL=postgresql://postgres:1234@localhost:5432/cloud?schema=public
```

In DBeaver: **New Database Connection → PostgreSQL**

- Host `localhost`, Port `5432`, Database `cloud`
- User `postgres`, Password `1234`
- Driver properties → `currentSchema = public`
- JDBC URL: `jdbc:postgresql://localhost:5432/cloud`

Database commands: `npm run db:start`, `npm run db:stop`, `npm run db:status`, `npm run db:generate`,
`npm run db:migrate`, `npm run db:seed`, `npm run db:studio`.

> `npm run db:push` is available for quick schema syncs. For reproducible environments,
> prefer `db:generate` + `db:migrate`, which apply the committed Prisma migration.

## AI assistant

The assistant connects to OpenRouter with exactly three curated free models:

| Model | Model ID | Use |
| --- | --- | --- |
| NVIDIA Nemotron 3 Ultra (free) — default | `nvidia/nemotron-3-ultra-550b-a55b:free` | Advanced reasoning, coding and complex tasks |
| NVIDIA Nemotron 3.5 Super VL (free) | `nvidia/nemotron-3.5-super-vl:free` | Image and document understanding |
| NVIDIA Nemotron 3.5 Lightning (free) | `nvidia/nemotron-3.5-lightning:free` | Fast everyday conversations |

The IDs were verified against OpenRouter's official `/api/v1/models` catalog. The dropdown contains
only these three models; the API validates every request against the same server-side allowlist, so
paid models cannot be selected. Nemotron 3 Ultra is the default. Users can switch models at any time
from the assistant header, and the selected model is remembered in `localStorage` across conversations.

### Activating the assistant

1. Open `.env.local` in the project root. If it is missing, create it with
   `OPENROUTER_API_KEY=YOUR_API_KEY_HERE`.
2. Replace `YOUR_API_KEY_HERE` with your OpenRouter key. Do not change any other variables.
3. Restart `npm run dev`.

`lib/ai/server.ts` is the only place that reads `process.env.OPENROUTER_API_KEY`. Client code imports
only `lib/ai/models.ts`. While the key is missing or still the placeholder, the assistant shows a
configuration message and sends no chat request. The chat history, authentication, database and page
editor are unchanged.

## Performance features

- **Virtualization** — the private page list uses `@tanstack/react-virtual`.
- **Lazy loading** — the AI assistant and command menu are `next/dynamic` chunks loaded on first open.
- **Page cache** — visited pages are stored in React Query (infinite stale time) and `localStorage`,
  so a page is fetched only on its first visit.
- **Skeletons** — boot, sidebar, page and assistant states use animated skeleton components.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘/Ctrl + K` | Search pages / commands |
| `⌘/Ctrl + J` | Toggle AI assistant |
| `⌘/Ctrl + \\` | Toggle sidebar |
| `/` on an empty block | Open the block menu |
