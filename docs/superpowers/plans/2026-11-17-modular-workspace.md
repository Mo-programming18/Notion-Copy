# Modular workspace expansion plan

Autonomous execution plan for the current request. The user explicitly asked for no clarifying questions, so this plan records the chosen design instead of pausing for approval.

## Goals

1. Remove Drizzle completely and restore OpenRouter as the assistant provider with exactly three curated free models.
2. Centralize reusable constants/configuration.
3. Split backend and frontend code into modular layers with reusable components.
4. Complete every missing page reachable from the workspace navigation and make navigation work in both directions.
5. Preserve the existing editor, virtualization, lazy loading, first-visit-only page cache, skeletons, auth, avatars and 226 seeded pages.

## Backend

- Keep Prisma 6 as the only ORM.
- Add soft-delete support (`deletedAt`) to `WorkspacePage` with a new migration, index, API route and restore route.
- Replace `lib/data.ts` with a thin barrel over `lib/services/page-store.ts`.
- Add `lib/services/workspace-service.ts` for overview, inbox, activity and team-derived data.
- Add `/api/workspace/*` routes and extend `/api/pages/[id]` with `DELETE`.
- Rebuild the assistant service around server-only OpenRouter access: strict three-model allowlist, `.env.local` placeholder, no browser key exposure, and friendly config/rate-limit/model errors.

## Frontend architecture

- `lib/constants/*`: app metadata, reusable routes, navigation config, cache/limit constants.
- `lib/hooks/*`: reusable client hooks such as local storage state.
- `components/ui/*`: reusable Card, Badge, EmptyState primitives.
- `components/layout/*`: `SubpageShell`, `PageHeader`, `SectionCard`, `PageLinkCard`, `SettingsTabs`.
- `components/workspace/*`: keep existing editor/sidebar/topbar, wire all dead actions and reuse extracted constants/components.
- `app/(workspace)/*`: new pages under one shared route-group layout; root `/` remains the editor workspace.

## Pages to add

`/home`, `/inbox`, `/favorites`, `/search`, `/updates`, `/trash`, `/settings`, `/help`, `/ai`, `/comments`, and `/teams/[slug]` for Product, Engineering and Marketing.

## Navigation/actions to wire

- Sidebar: Home, Inbox, Favorites, Updates, Trash, Help, Settings & members, Invite people, AI features, teamspaces.
- Topbar: Comments, page history, duplicate page, move to parent, move to trash.
- Command palette: navigate to workspace pages from any subpage.
- User menu: profile, settings, sign in/up/out.

## Verification

- `npx prisma generate`, `npx prisma migrate deploy`, drift diff.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Browser smoke test of root workspace, subpages, navigation, trash/restore and the restored assistant.
- Confirm zero Drizzle references remain; the OpenRouter key is read only from `process.env.OPENROUTER_API_KEY` in server code, `.env.local` is git-ignored, and only the three verified free model IDs are accepted.
