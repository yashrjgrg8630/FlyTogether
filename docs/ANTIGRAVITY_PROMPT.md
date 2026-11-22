# FlyTogether — complete Antigravity continuation prompt

Copy everything below into Antigravity with the extracted frontend project open. Give it access to the separate backend folder when ready. This prompt describes future work; it is not a claim that live integration is already implemented.

---

Act as a senior travel-tech engineer, FastAPI/PostgreSQL architect, React product designer and security-focused API integration specialist. Continue my existing **FlyTogether** application; do not start over. Audit first, preserve working flows, then implement the remaining work in small verified steps. Maintain a task checklist and distinguish completed, tested, unverified and blocked work. Ask only for missing facts you cannot inspect yourself.

## 1. Inputs and current decision status

- My local project is `D:\My work\work\Projects\FlyTogether`; the separate backend is `D:\My work\work\Projects\FlyTogether\backend`.
- This ZIP contains the current **frontend source only**. It does not contain the FastAPI backend, a production database dump, supplier credentials or deployment secrets. Inspect the local backend if accessible; otherwise request the redacted archive and stop API integration until it is supplied.
- Target deployment platform: **Antideploy**. Preferred domain: `flytogether.antideploy.app`. Neither hosting functionality nor domain ownership/configuration has been verified; inspect the actual platform rather than inventing deployment instructions.
- Read `AGENTS.md`, `README.md`, `roadmap.md`, `docs/EXPORT_SETUP.md`, `docs/LIVE_DATA_AUDIT.md`, every relevant service/type/test and the actual backend before changing them.
- Frontend audit/provider comparison was performed on **21 November 2026**. Its findings are a dated baseline, not a guarantee about today's provider contracts. Recheck official documentation before implementing provider behavior or relying on prices.
- I reported **Duffel live production access**. No live token, account configuration or Indian-route coverage has been independently tested.
- I approved a **conditional Duffel pilot** on 21 November 2026. This is NOT permission to purchase a service or generate chargeable traffic without prerequisite confirmation.
- As of **22 November 2026**, Duffel has **not** provided written permission/pricing for search-only usage without creating orders. Keep production supplier searches OFF until that confirmation exists and server-side credentials are securely configured. Do not run a live "connection test" that creates an offer request before this gate is cleared.
- No live supplier calls, backend integration or production migrations have been done here.

## 2. Non-negotiable business and safety rules

FlyTogether aggregates genuine registered-traveller demand, matches compatible routes/dates, forms passenger-seat groups and displays authorised supplier quotations. It **does not sell tickets, reserve seats, create supplier orders, process payments or guarantee discounts**.

Keep this exact disclaimer: **"FlyTogether aggregates demand. It does not sell tickets or reserve seats."**

- Never say "verified by airline" without evidence; do not add that claim as UI copy.
- Individual offers are not group fares. Never fabricate a bulk discount or assume a fare is available to an entire group.
- No scraping MakeMyTrip, RedBus, Google Flights or other travel websites; no bypassing authentication, commercial restrictions or rate limits.
- No invented prices, schedules, inventory, credentials, endorsements or freshness. Keep unavailable provider fields null and show an honest unavailable state.
- Never expose another traveller's email, phone or private identity. Use safe display aliases and enforce backend access controls.
- No destructive migrations, database reset/drop, production record deletion or unrelated rewrites. Back up and verify restoration before changing production schema.
- Keep Duffel credentials backend-only in Antideploy environment/secret storage; never place them in `VITE_*`, browser code, git, screenshots or logs.
- No paid subscription, new supplier or unexpected chargeable usage without my approval.

## 3. Preserve the actual frontend architecture

The newer frontend is **React 19 + TypeScript + TanStack Start/Router + Tailwind v4**, not the older HTML/CSS/JS frontend described in the earlier backend brief. Installed package versions and `bun.lock` are authoritative; do not replace them merely to match older notes.

- Keep `src/router.tsx`, `src/start.ts`, `src/server.ts` and `src/routes/__root.tsx`. Do not migrate to Next.js, Angular, Vue or React Router DOM.
- Existing pages live in `src/pages/*`; `src/routes/*` are thin TanStack wrappers. New views need their own valid route files. Do not edit generated `src/routeTree.gen.ts` by hand.
- All data access belongs in `src/services/*`, using `call(mock, real)` from `api.ts`. No raw fetching inside page components. Preserve a clean mock/real boundary with identical contracts.
- `VITE_USE_MOCKS=true` currently uses in-memory demo data. Mutations reset on reload. This is not a database. The API base is `VITE_API_BASE_URL`, currently intended as `http://localhost:8000/api/v1`.
- Existing auth uses `AuthContext`, bearer tokens and localStorage key `flytogether_token`; `_traveller` and `_admin` layouts are `ssr: false` with traveller/admin guards. Preserve compatibility while auditing expiry, logout and XSS protection; propose any auth-contract migration explicitly.
- Backend remains external **FastAPI + PostgreSQL + SQLAlchemy + Alembic**. Do not add Lovable Cloud, Supabase or another backend.
- Existing UI stack: shadcn/Radix, Axios, React Hook Form + Zod, TanStack Query, Recharts, lucide and framer-motion. Reuse installed libraries. Ask before adding a new library outside my requested stack; explain need and alternatives.
- Current Vite configuration uses `@lovable.dev/vite-tanstack-config` and defaults to a Cloudflare build target. Audit output/runtime compatibility with Antideploy first; do not assume a static Vite SPA or that `vite preview` is a production SSR server. If a different runtime target is needed, propose the minimal documented change and verify it before deployment.

## 4. Existing working screens and behaviors — do not regress

- Home, login, register and forbidden page.
- Traveller Dashboard with requests, edit/cancel, joined groups, recommendations and latest quotations.
- CreateRequest: airport autocomplete, date picker, flexibility **0–7 days**, whole-number passengers, optional positive max budget, origin ≠ destination and Zod validation. Current frontend cap is 20 passengers (an implementation choice, not an established supplier limit); inspect backend/supplier constraints and confirm before changing it.
- Post-create matching screen ranked by `match_score`, date/budget/capacity explanation tooltips; budget stays unscored unless a justified pricing source exists.
- Discover filters by route/date/status; group details; join/leave confirmation and clear full-group, duplicate-join and HTTP 409 messaging.
- Seats progress with minimum quotation-threshold marker. Capacity always means **passenger seats**, not number of accounts or people who clicked Join.
- Quotations and shared `PriceComparison`/`QuoteCard`: price per passenger, baggage, terms, seats, source badges, countdown, expired state, best valid price. Potential savings only against an explicit user-provided indicative reference; exclude expired offers and label savings **potential**, not verified.
- My groups, notifications page, bell unread count/dropdown and mark-read/mark-all-read.
- Guarded admin dashboard, ManageGroups, quotation request for eligible groups, ManageQuotes draft → publish flow, demand charts and festival heatmap.
- Drafts must not leak to travellers; reject expired draft publishing and invalid quotation/group transitions. Shared `SourceBadge` is the only quotation-source badge implementation.
- Preserve loading placeholders, empty states, error toasts, focus styles, keyboard interactions and reduced-motion support.
- Reuse `GroupCard`, `GroupActions`, `PriceComparison` and `QuoteCard`; invalidate group/membership/request/match/quote queries as appropriate after writes or conflicts.

## 5. Make the frontend noticeably more polished

Improve the **existing frontend**, not a replacement landing-only mockup. Polish every traveller/admin screen and both themes. Keep current routes/services/business behavior intact during the visual pass; put functional/data changes in separate steps.

### Design direction

- Neutral dark surfaces: background `#09090B`, card `#111113`, elevated `#18181B`; orange accent `#FF6A2B`, hover `#FF824D`. NO navy/royal-blue surfaces or dominant purple gradients, rainbow/gradient text, generic decorative blobs or excessive nested cards.
- Light: background `#FAFAF9`, card white, border `#E7E5E4`. Use the existing deeper light-mode orange where needed for WCAG AA; do not sacrifice contrast to literal color matching.
- Define colors, shadows and state roles as semantic tokens in `src/styles.css`; use token classes and existing shadcn variants, not hardcoded colors scattered through JSX.
- Geist for UI and numbers; one italic Instrument Serif accent word per main headline. Tabular numbers for prices and seats. No viewport-scaled typography; keep lettering readable and avoid negative tracking.
- Hairline borders, restrained shadows, **12px controls / 20px repeated-item cards / pill badges**. Glass only for floating navbar, menus and popovers. Full-width/unframed page sections, not cards containing cards.
- At most one visually dominant primary action per view; secondary actions should remain accessible. Consistent lucide icons at 1.5 stroke, tooltips for unfamiliar icon-only controls.
- Preserve the existing relevant sky asset; improve image framing/contrast rather than hotlinking arbitrary stock photos. Any new media must be licensed and stored locally/project-managed. Do not generate fake airline logos or flight evidence.
- Restrained 150–200ms transitions, seat-progress fill and entrance/stat animation only where useful; honor `prefers-reduced-motion`.

### Screen-by-screen priorities

1. Home: stronger FlyTogether identity in the first viewport, clear demand-aggregation action, legible full-width imagery, honest demo examples and no fabricated social-proof statistics. Keep a hint of the next section visible on mobile and desktop.
2. Auth: coherent typography/form spacing, clear validation, proper autocomplete labels and password accessibility without exposing secrets.
3. Dashboard: scannable hierarchy between requests, joined groups, matches and quotes; prioritize the user's next action rather than oversized decoration.
4. CreateRequest: balanced form grouping, easy route swap, usable autocomplete/date picker on touch devices, stable stepper/slider layouts and clear inline errors.
5. Discover/Matches/GroupDetails: large route codes, easy comparison of dates/status/seats, visible threshold, usable filters, consistent join/leave states and explanation tooltips.
6. Quotations: comparable cards or mobile stack, highlight cheapest valid quote without implying guaranteed availability, legible expiry/currency/source/reference and no sales CTA.
7. Notifications: readable density, distinct unread state, reachable bell/dropdown controls and useful empty state.
8. Admin: compact readable tables, mobile-safe scrolling with visible headings, coherent charts/heatmap, quote forms and dialogs that fit the viewport. Do not use chart color alone to communicate values.

Verify at **360, 390, 502, 768, 1280 and 1440px widths**, including the current compact viewport **502×679**, in dark and light mode. No horizontal page overflow, text/control overlap, inaccessible clipped dialogs or menus. Check keyboard-only navigation, focus restoration, labels, touch targets, screen-reader status announcements and contrast. Keep theme preference persistence/system-first behavior without a flash or hydration mismatch. Every content route needs its own meaningful title, description and social metadata.

## 6. Complete the backend/data audit before wiring APIs

Classify each source as `LIVE_EXTERNAL_API`, `INTERNAL_DATABASE`, `ADMIN_ENTERED_MANUAL`, `STATIC_REFERENCE_DATA` or `SIMULATED_DEMO_DATA`.

Audit routes and router wiring, OpenAPI, auth/roles, models/schemas, migration history, PostgreSQL/Python versions, storage, workers/scheduler, Docker, deployment settings and existing production data. Record hardcoded datasets/prices, endpoints, background jobs, cache/refresh intervals and persistence. Treat inaccessible production settings as unverified, not absent.

Known frontend issues to resolve safely:

- Demo includes 26 airports, 10 groups, 2 requests, 4 memberships, 7 quotation rows, illustrative festival counts, synthetic analytics offsets and landing-page prices.
- Manual-labelled seeded quotations are fictional demo records, not actual received airline quotations. Keep their provenance explicitly demo.
- Notifications, registrations and request/group/quote mutations are in-memory in mock mode.
- Current service default is mocks ON if configuration is missing. Production must explicitly disable mocks and fail honestly on API failure; never quietly serve fake prices.
- Browser notifications poll every 60s and quote countdowns tick every second; these are not supplier refresh workers.
- Existing frontend guards are not security boundaries. Enforce every permission in FastAPI.

Inspect each actual service and reconcile it with FastAPI OpenAPI. `README.md` documents **25 service functions / 24 endpoint paths**: auth, users/me, airports, travel requests, matching, groups/members/join/leave/quotes, admin quotes/request/create/publish, notifications/read/read-all and admin analytics/festival demand. Do not assume these backend routes exist already.

Keep meaningful status/error contracts: validation errors, 401 expired/invalid auth, 403 non-admin, 404 missing resource, 409 duplicate/full/concurrent conflict and 429 limits. Adapt Pydantic validation errors into useful field messages rather than leaking traces. Check route precedence for `/notifications/read-all` versus `/{id}/read` and serializer/ID/date/nullability compatibility.

## 7. Real internal demand and group quotations

Persist genuine users, requests, groups, memberships, notifications and quotation records in PostgreSQL. Implement ownership checks, role checks and transactions for create/edit/cancel/join/leave. Use locks/constraints/idempotency as appropriate to prevent duplicate joins and over-capacity under concurrent requests. Derive passenger-seat totals from current memberships; rollback entire operations on conflict. Match current route/date/flexibility records; document budget behavior instead of inventing prices.

Separate **individual flight offers** from **group quotations** in models, services and UI. Keep genuine group quotations manual unless an authorised group-sales integration is proven. Record supplier identity, reference, passenger count, currency, per-passenger price, taxes and their inclusion, correctly calculated/supplied total, baggage, conditions, validity, evidence reference and immutable audit events. Protect evidence access and storage. Disable simulated quote creation in production; published fictional demo records must never appear as genuine manual airline responses.

Analytics/festival demand must come from genuine internal data or explicitly labelled demo/reference sources. Never fabricate usage metrics or forecasts.

## 8. Conditional Duffel adapter and live flight screens

Implement safe interfaces, normalized schemas and mocked contract tests while commercial access is blocked; keep all supplier calls feature-gated. After backend audit, written search-only terms, secure credentials and approved coverage checks, implement Duffel first. Consider TBO/Travelport/direct NDC only with separate approved access if Duffel cannot meet Indian-route needs.

- Recheck official Duffel docs, API version, retry semantics, cache permissions, search-only economics and enabled Sources. Public pricing previously listed `$0.005` excess searches above a `1500:1` search-to-order allowance; at zero orders the actual applicable terms are unconfirmed. Do not promise free usage.
- Server config: `DUFFEL_ACCESS_TOKEN`, `DUFFEL_API_VERSION`, `DUFFEL_API_BASE_URL`; secrets backend-only. Add configurable live-enabled switch, per-user/global limits and approved spend/usage ceilings. No automatic activation when a token merely exists.
- Define provider-independent search/offer/details/revalidation/health interfaces. Authenticated search inputs: origin, destination, outbound date, optional supported return date, passengers and cabin. Validate provider passenger limits rather than applying group capacity to individual search.
- Normalize supplied airline/operating carrier, flight number, airport codes, zoned timestamps, duration, stops, cabin, baggage, conditions, total/currency, supplier/reference, retrieval time, `live_mode` and expiry. Money uses decimal-safe handling. Inventory is nullable; passenger count and seat maps are not remaining seats.
- Add FastAPI endpoints and matching frontend service adapters; document new contracts. Protect public health responses and keep admin provider details privileged.
- Build flight search/results/detail views and admin data-source management, integrated with current navigation. Do not turn them into checkout/booking/payment flows.
- Show `LIVE SUPPLIER DATA`, `MANUAL AIRLINE QUOTATION`, `STATIC REFERENCE DATA`, `SIMULATED DEMO DATA` consistently through shared source presentation. Distinguish provenance from freshness: live-origin cached data must still be labelled cached/stale, not real-time.
- Each offer shows source, fetched time, currency, expiry and availability status. No-provider/outage state: **"Live flight data is currently unavailable."** No fake-price fallback.
- Respect supplier expiry, revalidate on details, show loading/empty/error/stale/expired states and warn of price changes. Group quotes continue through their separate manual workflow.

## 9. Refresh, jobs and admin monitoring

Use on-demand search, bounded provider-permitted cache and identical in-flight query deduplication. Apply per-user/global rate limits, honor provider reset/Retry-After headers and current documented retry rules. Prior research warned against retrying Duffel 500/502; recheck documentation and do not blindly retry non-idempotent or billed requests. Never let React Query's default retries duplicate chargeable searches.

Audit the existing scheduler before introducing another. Durable job ledger, locking/leases and recovery must prevent duplicate work across multiple workers/restarts. Refresh only where permitted/needed, not continuous costly polling of every route. Monitor failed jobs and expire offers correctly.

Admin data-source area: provider enabled/disabled/blocked status, last success/error, permitted usage/rate-limit information, failures, expired offers, manual quotation records and audit trail. Redact tokens and sensitive provider payloads. Do not call a provider healthy just because its token variable exists.

## 10. Deployment and verification

Deliver minimal Docker/runtime/deployment changes compatible with actual Antideploy capabilities. Document separate frontend/backend start commands, reverse proxy/API origin, HTTPS, CORS allowlist, secure environment config, persistent PostgreSQL/storage, migration release command, worker start/locking and health/readiness checks. Keep preferred domain conditional on actual availability. Do not assume SQLite, ephemeral container storage or in-process tasks provide production persistence.

Required verification:

1. Run existing frontend rule/service/routing tests; add concrete tests for changed rules. Verify build, lint/type errors and browser runtime without suppressing failures.
2. Test signed-out/traveller/admin permissions via backend calls, not just hidden buttons; drafts/evidence/private identities must stay protected.
3. End-to-end real API: register/login, create/edit/cancel request, ranked matches, join/leave, concurrency/full/duplicate 409, reload persistence, quotes request/draft/publish, traveller readback, notification read-all and analytics.
4. Test supplier fixtures/errors, unknown inventory, decimal currencies, timestamps, expiry/revalidation, cache labels, deduplication and rate limits before live calls.
5. Only after the commercial gate is cleared and I securely configure credentials, run a small authorised production pilot for **BLR–DEL, BOM–GOI, DEL–BOM, HYD–BLR, MAA–CCU and COK–DEL** at valid future dates. Verify actual enabled Indian coverage; absent carriers in the public airline list do not prove account-level absence.
6. Verify returned flight identifiers, actual supplier prices, retrieval timestamps, expiry, revalidation and failure states. Never mark live integration complete from sandbox/demo tests.
7. Test job recovery/multi-worker exclusivity, deployed persistence, migrations/backup restoration procedure and health checks.
8. Browser-check all screens in both themes and requested widths; capture screenshots privately, without tokens/personal data. Check console/network failures and keyboard accessibility.

Keep a final report listing code changes, actual tests/results, remaining blockers, deployment steps, new service/endpoint map and any unverified claims. Never claim a production deployment or live-price integration succeeded without actual evidence.

## Start now

First inspect the extracted frontend and available local backend, summarize gaps and make a phased task list. **Frontend-only visual polish and safe local tests can proceed now.** If the backend is missing, stop API integration and request it. If Duffel search-only confirmation is still absent, keep live calls off and continue only uncharged preparation. Finish all work possible under these gates; clearly report what waits for me instead of pretending it is complete.
