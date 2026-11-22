# Group discovery and matching

- [x] Build shared group cards, match breakdowns, and confirmed join/leave controls.
- [x] Build discovery, group details, and post-request ranked matches.
- [x] Test capacity, duplicate joins, conflict handling, and the signed-in flow.

# Quotation comparison

- [x] Build quotations page and reusable quote comparison cards with validity and potential savings.
- [x] Test savings and expiration rules and verify the signed-in comparison on desktop and mobile.

# Admin workspace

- [x] Build dashboard, group management, quote drafts/publishing, and demand analytics with a festival heatmap.
- [x] Test admin access, eligibility and quote rules; verify admin flows and mobile layouts.

# Polish

- [x] Notifications page and bell dropdown with unread count; My groups page.
- [x] Global error toasts, skeletons/empty states, focus outlines, reduced motion.
- [x] README endpoint table for FastAPI wiring.

# Live flight data discovery

- [x] Audit every frontend data source, endpoint, persistence assumption, and refresh mechanism.
- [x] Compare authorised flight-data providers using current official documentation.
- [x] Present costs, access requirements, credentials, limitations, and an implementation plan; wait for approval before integration.
- [x] Build FastAPI backend with SQLAlchemy/SQLite — all endpoints matching frontend service contracts (22 Nov). 10 unit tests + 22 integration checks passing.
- [x] Wire frontend ↔ backend via `.env.local` (`VITE_USE_MOCKS=false`). All 38 frontend tests pass with mock-forced vitest config.
- [x] Alembic migration engine scaffolded with initial schema migration (`33722597c340_initial_schema.py`) and verified upgrade path.
- [x] Uncharged supplier preparation: `DuffelFlightProvider` adapter module implemented with circuit breaker, honest offline state, and zero network calls when unpermitted.
- [x] Docker Compose multi-container configuration (`docker-compose.yml`, `backend/Dockerfile`, `.env.docker.example`) with PostgreSQL 16 alpine and FastAPI.
- [ ] Build the conditional Duffel pilot — plan approved 21 Nov; blocked until search-only commercial confirmation and Indian route coverage checks. Search-only written confirmation is still outstanding as of 22 Nov, so production searches stay disabled.
- [ ] Deploy to Antideploy — pending platform audit and configuration.

# Antigravity handover

- [x] Write a complete continuation prompt covering frontend polish, backend audit, live-data prerequisites, implementation and verification.
- [x] Prepare the current frontend source export with setup instructions, a safe environment example and the live-data audit; exclude secrets, repository metadata, dependencies and build output. Remaining implementation is handed over to Antigravity under the prerequisite gates above.
