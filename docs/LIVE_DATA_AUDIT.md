# FlyTogether live-data audit and provider recommendation

**Date:** 21 November 2026  
**Status:** Phase 1 frontend audit and Phase 2 provider research complete. No supplier integration, application behavior, database, or deployment configuration has been changed. No supplier credentials were used and nothing was purchased.

> You reported having **Duffel live production access**. That access has not been tested or independently verified.

## Executive recommendation

Use **Duffel as the conditional first adapter** because production access already exists. Before production implementation, confirm two things with Duffel:

1. **Search-only commercial terms.** FlyTogether creates no Duffel orders, while Duffel's public excess-search pricing is based on a 1,500:1 search-to-book ratio.
2. **Enabled Indian domestic coverage.** Duffel's fetched public airline list did not include Air India, IndiGo, Akasa Air or SpiceJet. That list is not proof of what your account can access; your dashboard's enabled Sources and real route searches are decisive.

If Duffel cannot cover the required Indian routes or permit the search-only model on acceptable terms, evaluate **TBO Air API as the second adapter**. Keep airline group quotations manual until a supplier provides an authorised group-sales channel with evidence. Do not convert individual offers into supposed group fares.

---

# Phase 1 — Existing data-source audit

## Scope and an important limitation

This checkout contains only the **TanStack Start/React frontend**. It has no FastAPI, SQLAlchemy, Alembic, PostgreSQL, Docker, Antideploy, Python or SQL application files. Therefore:

- The frontend audit below is complete.
- The existing FastAPI endpoints, database schema, production records, background workers, scheduled jobs, migrations and Antideploy settings **could not be inspected or verified**.
- The FastAPI repository and a redacted Antideploy configuration are required to complete the whole-application audit. Do not provide secret values.

The active frontend configuration is `VITE_USE_MOCKS=true` with `VITE_API_BASE_URL=http://localhost:8000/api/v1`. There are **no live external API data sources in the current application**.

## Every current application dataset

| Dataset                       | Current source and classification                                                                    | Persistence and findings                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Airports                      | **STATIC_REFERENCE_DATA**: 26 hardcoded Indian airports in `src/services/mockDb.ts`                  | Includes IATA code, airport, city and country. This is a small reference list, not a live airport database.                                                                     |
| Users and authentication      | **SIMULATED_DEMO_DATA**: two hardcoded demo users and passwords; mock tokens                         | Registrations and sessions use in-memory user data. Only token, cached user and theme are stored in browser localStorage. No user database is active.                           |
| Travel requests               | **SIMULATED_DEMO_DATA**: two seeded requests plus browser-session mutations                          | Create, edit and cancel modify an in-memory array. Changes reset on reload. No database-backed duplicate-request prevention exists.                                             |
| Groups                        | **SIMULATED_DEMO_DATA**: ten seeded groups                                                           | Routes, windows, capacities, thresholds, deadlines and statuses are hardcoded. Status changes are local mock mutations.                                                         |
| Group members and seat counts | **SIMULATED_DEMO_DATA**: four seeded memberships, all in `g_1`                                       | Join/leave changes local arrays and seat totals. No SQL transaction, row lock or database constraint protects capacity across concurrent users.                                 |
| Matching results              | **SIMULATED_DEMO_DATA** derived from mock requests/groups                                            | Score deducts 12 points per day of date distance and 30 for insufficient capacity; budget is explicitly unscored. It is not an airline price or availability prediction.        |
| Quotations                    | **SIMULATED_DEMO_DATA**: seven seeded quotes                                                         | Three are labelled manual and four simulated, but all seven are hardcoded demo records—not evidence of received airline quotations.                                             |
| Admin-created quotations      | **ADMIN_ENTERED_MANUAL** when `manual` is chosen; **SIMULATED_DEMO_DATA** when `simulated` is chosen | Saved only in memory. The form defaults to simulated and has no supplier identity, quotation reference, passenger count, currency, taxes, evidence attachment or audit history. |
| Dashboard/admin analytics     | **SIMULATED_DEMO_DATA**                                                                              | User count adds a hardcoded 1,240; request count adds 3,180. Request-over-time values use a formula. Routes and active groups are derived from mock arrays.                     |
| Festival demand               | **SIMULATED_DEMO_DATA**                                                                              | Six routes × six festivals = 36 hardcoded passenger-seat counts. The UI already calls this illustrative and not a forecast.                                                     |
| Notifications                 | **SIMULATED_DEMO_DATA**                                                                              | Four seeded notifications; read/unread changes are local and reset on reload.                                                                                                   |
| Landing-page examples         | **SIMULATED_DEMO_DATA**                                                                              | A hardcoded BLR–DEL group card (14/30 seats, threshold 10, target 21 Dec ±2 days) and two hardcoded quotation displays.                                                         |
| Real API adapters             | Intended future **INTERNAL_DATABASE** access through FastAPI                                         | Adapters exist, but no running backend or database-backed response was verified. They are inactive while mocks are enabled.                                                     |

## Every hardcoded fare and simulated quotation

The seven seeded quotation prices in `src/services/mockDb.ts` are:

- IndiGo **₹5,180** per passenger — simulated, published.
- Air India **₹5,640** — manual-labelled demo, published.
- IndiGo **₹4,850** — simulated, published.
- Air India **₹5,320** — manual-labelled demo, published.
- Akasa Air **₹4,590** — simulated, expired.
- Vistara **₹6,100** — manual-labelled demo, published.
- SpiceJet **₹5,450** — simulated, draft.

The landing page separately hardcodes **Air India ₹5,320** and **IndiGo ₹4,850** as illustrative examples. These are not live prices. The quotation comparison's indicative fare is explicitly supplied by the user; it is not a live airline fare.

## Declared frontend-to-FastAPI endpoint contract

These are **frontend target paths, not endpoints confirmed to be running**. There are 25 service functions calling 24 unique paths; group quotation retrieval is duplicated through two service functions.

| Area             | Method and path                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth             | `POST /auth/login`; `POST /auth/register`; `GET /users/me`                                                                                    |
| Reference data   | `GET /airports?q=`                                                                                                                            |
| Travel requests  | `POST /travel-requests`; `GET /travel-requests/my`; `PATCH /travel-requests/{id}`; `DELETE /travel-requests/{id}`                             |
| Matching         | `GET /matching/{request_id}`                                                                                                                  |
| Groups           | `GET /groups`; `GET /groups/{id}`; `GET /groups/{id}/members`; `POST /groups/{id}/join`; `POST /groups/{id}/leave`; `GET /groups/{id}/quotes` |
| Admin quotations | `GET /admin/quotes`; `POST /admin/quotes/request`; `POST /admin/quotes`; `PATCH /admin/quotes/{id}/publish`                                   |
| Notifications    | `GET /notifications`; `PATCH /notifications/{id}/read`; `PATCH /notifications/read-all`                                                       |
| Admin analytics  | `GET /admin/analytics`; `GET /admin/analytics/festival-demand`                                                                                |

There are no frontend contracts yet for flight search, offer revalidation, provider connections, supplier usage, refresh jobs, data-source audits or health checks.

## Refresh, persistence and deployment findings

- **Background/scheduled jobs:** none found. Notifications poll every 60 seconds; quotation countdown text updates every second; airport search uses a short debounce. These are UI timers, not supplier refresh jobs.
- **Caching:** React Query uses a 15-second stale time and one retry. This is not a supplier-compliant offer cache or refresh strategy.
- **Persistence:** all operational travel data is in memory and resets on reload. Browser localStorage holds only sign-in/token cache and theme.
- **Deployment:** no Antideploy configuration, health check, migration configuration, container definition or worker locking is present in this checkout.
- **Production safety:** no production database was touched. Its existence, migration state and record safety remain unverified.

## Gaps that must be fixed before calling the product real-data-driven

1. Production currently defaults to demo mode unless deployment overrides it; production must fail transparently rather than silently show demo data.
2. Seeded quotes labelled `MANUAL – entered by admin` are still fictional. Manual-labelled demo data must never be presented as an actual received quotation.
3. Simulated quotation creation must be unavailable in production.
4. Individual flight offers and group quotations need separate schemas and workflows.
5. Group quotation records need supplier identity, supplier reference, passenger count, currency, price, taxes, total when supplied/calculable, validity, conditions, evidence/reference and immutable audit events.
6. Join/leave and request changes need database transactions and constraints for duplicate prevention, current capacity and consistent group/request status.
7. Group membership currently uses a traveller's full name when joining. Use an explicit safe display alias and enforce backend authorization; never expose email, phone or other private details to other travellers.
8. Frontend admin guards are not a security boundary. The FastAPI backend must enforce every traveller/admin permission.

---

# Phase 2 — Provider comparison

## Current official findings

| Provider                                          | Coverage and offer capabilities                                                                                                                                                                                                                                                                                                                                                                | Access, limits and cost                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Group quotations                                                                                                          | Fit                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Duffel Flights**                                | One-way/return/multi-city search, passengers and cabin filters; offers contain slices/segments, prices/currency, baggage/conditions where supplied and `expires_at`. Offers typically expire within 30 minutes. Duffel advertises 300+ airlines across NDC, GDS and LCC, but enabled content varies by account. [4](https://duffel.com/flights/search) [3](https://duffel.com/docs/api/offers) | You report live production access. Public pricing has no upfront fee, then lists $3/confirmed order, 1% of order value for Managed Content, $2/paid ancillary and $0.005/excess search above 1,500 searches per order. [1](https://duffel.com/pricing) Rate-limit headers expose the actual limit; documentation illustrates 60 requests/60 seconds and says it can change. [Duffel rate limiting](https://duffel.com/docs/api/overview/response-handling/rate-limiting) | No general automated group-fare capability was established from the reviewed documentation. Keep manual supplier quotes.  | **Conditional first choice** due existing access, subject to search-only pricing and Indian route checks. |
| **Amadeus**                                       | The official portal now offers 100+ Enterprise APIs and sandbox access through an Amadeus consultant. Specific airline/fare coverage and capabilities depend on the contracted Enterprise product.                                                                                                                                                                                             | **Self-Service was decommissioned on 17 July 2026.** Enterprise access is by request; pricing and limits are not published on the current portal. [Amadeus Enterprise API Portal](https://developers.amadeus.com/)                                                                                                                                                                                                                                                       | Do not assume group fares; requires specific supplier/enterprise agreement.                                               | Not the first choice for this build; older Self-Service pricing guides are obsolete.                      |
| **Travelport TripServices**                       | Flights Search plus AirPrice revalidation; AirPrice is required for low-cost carriers and some NDC carriers. Supports GDS/NDC content according to provisioning. [3](https://developer.travelport.com/docs/flights/guides/flights-pricing-guide)                                                                                                                                               | Trial credentials on request. Production uses contracted APIs, provisioning and certification; Travelport asks for at least 15 days' notice before production. [1](https://developer.travelport.com/docs/getting-started) [2](https://developer.travelport.com/docs/getting-started/ready-to-certify) Pricing and search limits are commercial/provisioned values, not public fixed prices.                                                                              | No automatic group quote flow was verified.                                                                               | Capable later-stage GDS option, but more onboarding than using existing Duffel access.                    |
| **TBO Air API**                                   | India-relevant consolidator option. Its guide describes leading domestic LCC and full-service carriers, Search, FareQuote, FareRule, SSR and booking workflows. Actual enabled airlines/routes must be verified contractually. [2](https://dealint.tboair.com/APIDocument/Default.aspx) [4](https://apidoc.tektravels.com/flight/FlightFAQ.aspx)                                               | Registration and production KYC are required. Certification includes request/response evidence and booking cases; documented test-case verification is about 4–5 working days before sign-off/live access. [1](https://dealint.tboair.com/APIDocument/Certification.aspx) Pricing and rate limits are not public in the reviewed docs.                                                                                                                                   | No general group-fare API was verified; use a separate group-sales agreement/manual workflow.                             | **Best fallback to evaluate for Indian domestic coverage.**                                               |
| **Direct airline NDC / authorised consolidators** | NDC is an open Offer/Order data standard, not one universal API or inventory source. Each airline has its own onboarding, content, capabilities and credentials. [1](https://developer.iata.org/en/ndc/)                                                                                                                                                                                       | Airline-by-airline partnership, certification, commercial terms, limits and costs.                                                                                                                                                                                                                                                                                                                                                                                       | Direct airline group-sales channels may support genuine group quotations, but only with explicit agreements and evidence. | Strategic later adapters for priority airlines, not a single first integration.                           |

### Duffel coverage caveat

Duffel's current public airline page was fetched during this review. It listed Direct Connect and Travelport content but contained no entries matching Air India, IndiGo, Akasa Air, SpiceJet or Vistara. [1](https://duffel.com/flights/airlines) This is a coverage warning, not a conclusion about your private account. Verify enabled Sources and run authorised production searches for BLR–DEL, BOM–GOI, DEL–BOM, HYD–BLR, MAA–CCU and COK–DEL before promising domestic coverage.

### Fare freshness and seat availability

- Duffel's `expires_at` should drive expiry; it must not be replaced with an invented validity period. [3](https://duffel.com/docs/api/offers)
- Travelport provides a separate pricing confirmation step, which is a useful model for revalidation. [3](https://developer.travelport.com/docs/flights/guides/flights-pricing-guide)
- Passenger count in a search is **not** remaining airline inventory. Show `available_seats` only when the provider explicitly returns it for that offer. Duffel seat maps concern seat selection for supported airlines, not a universal remaining-seat count. [1](https://duffel.com/docs/guides/adding-seats)
- Cached results must be labelled cached/stale with the retrieval timestamp; never call them real-time.

## Expected costs and access requirements

### Duffel

- **Published upfront cost:** $0.
- **Published order-related prices:** $3 per confirmed order; Managed Content 1% of total order value; $2 per paid ancillary.
- **Published excess-search price:** $0.005 per search above the 1,500:1 search-to-book allowance. [1](https://duffel.com/pricing)
- **Expected FlyTogether production cost:** **unconfirmed**. FlyTogether intentionally creates no orders, so the public order-linked allowance does not provide a reliable cost model. Obtain written search-only pricing/permission before implementation or traffic ramp-up.
- **Required access:** your existing live Duffel account, a live token permitted to create/retrieve offer requests, enabled supplier sources, and commercial confirmation for search-only use. No order or payment flow is required or proposed.

### Other providers

Amadeus Enterprise, Travelport, TBO and direct NDC/consolidator pricing requires direct commercial discussion. No paid subscription should be activated without your approval. Travelport and TBO also require formal provisioning/certification; direct NDC requires separate airline agreements.

## Required credentials and configuration

For the proposed Duffel pilot, the backend will need:

- `DUFFEL_ACCESS_TOKEN` — a **live** token with permission to create and retrieve offer requests. Store only in Antideploy/FastAPI server environment variables. Do not paste it into chat, frontend code or a `VITE_*` variable.
- `DUFFEL_API_VERSION=v2` — non-secret server configuration.
- `DUFFEL_API_BASE_URL=https://api.duffel.com` — non-secret server configuration.
- Existing FastAPI database and deployment settings — to be audited from the backend repository; no values are needed in this report.

The frontend needs only its existing FastAPI base URL. It must never receive the Duffel token.

---

# Implementation plan after approval

1. **Complete the backend audit first.** Inspect FastAPI routes, SQLAlchemy models, Alembic history, current PostgreSQL records, worker scheduler, Docker and redacted Antideploy settings. Take a backup and verify restoration procedure before migrations; never drop/reset production data.
2. **Add a provider-independent backend boundary.** Define normalized flight search/offer/segment schemas and a provider interface for search, offer retrieval/revalidation and health. Implement Duffel as the first adapter without changing business logic or adding orders/payments.
3. **Preserve provenance.** Store supplier, supplier offer reference, `live_mode`, retrieval timestamp, expiry, currency and raw field mapping. Keep nullable fields null when absent; never invent schedules, seats, fares, taxes or conditions.
4. **Add FastAPI endpoints.** Authenticated traveller search/details/revalidation; admin provider status, usage, failed jobs, expired offers and audit history; health endpoints. Return `Live flight data is currently unavailable.` when no live supplier can serve a search, with no demo fallback.
5. **Implement compliant freshness and retries.** Search on demand, revalidate on detail open, mark stale/expired, deduplicate identical in-flight searches and cache only for permitted durations. Honour `ratelimit-reset`; use bounded exponential backoff with jitter only for retryable responses. Do not retry Duffel 500/502 responses when its documentation says not to.
6. **Use durable job control.** Use the existing backend scheduler if present. Otherwise add one after the backend audit, with a database-backed job ledger and advisory locking so multiple workers cannot duplicate refreshes. Monitor failures and preserve jobs across restarts.
7. **Move traveller demand to transactional database rules.** Add appropriate uniqueness constraints, transactional join/leave, accurate passenger-seat aggregation, current-record matching, lifecycle rules and backend authorization. Use safe display aliases.
8. **Separate individual offers from group quotations.** Keep the manual admin group-quote workflow; add supplier/reference/passenger/tax/evidence/audit fields. Disable simulated quotes in production and never infer bulk discounts from individual offers.
9. **Update the existing frontend without redesigning it.** Add service adapters and flight search/results, source labels, last-updated time, currency, expiry and live/stale/expired/error/empty/loading states. Add the admin data-source area. Keep the existing no-ticket-sales disclaimer.
10. **Deploy and verify gradually.** Configure Antideploy secrets, run additive migrations, enable health checks and monitored workers, then test failure handling and persistence. Only after authorised **production** Duffel searches verify real routes, prices, timestamps and revalidation should the integration be called live.

# Features that cannot be automated without partnerships or evidence

- Guaranteed group fares or bulk discounts from individual flight offers.
- Automated airline group quotations without an authorised group-sales API/channel and a supplier response/reference.
- Complete coverage of every Indian or international airline, fare, seat count, baggage rule or schedule through one provider.
- Guaranteed savings, availability or fare freshness after an offer expires.
- Real-time claims for cached data or during supplier outages.
- Production database/deployment verification without the FastAPI repository and Antideploy configuration.
- Any live verification before authorised production credentials are configured server-side.

Air India, for example, treats group travel as a separate product with group PNR and deposit conditions rather than ordinary individual pricing. [1](https://www.airindia.com/in/en/book/group-ticket-booking.html) IndiGo likewise operates a separate group-booking channel. [3](https://groupbooking.goindigo.in/) This supports keeping group quotations distinct from Duffel individual offers.

## Decision recorded

The **conditional Duffel pilot was approved on 21 November 2026**. The approved sequence is: backend audit → commercial/coverage prerequisite checks → provider-independent Duffel search adapter → transparent frontend and admin states. No orders, payments, fake fallback or paid subscription activation are included.

Implementation remains paused pending the FastAPI backend source, search-only commercial confirmation and enabled Indian-route coverage checks. No live supplier calls have been made.

As of 22 November 2026 the search-only commercial confirmation is **still outstanding**: Duffel has not given written confirmation that search-only usage without creating orders is permitted under the live production access. Production searches therefore remain disabled, and no live offer-request calls will be made until that confirmation exists in writing.

## Backend source archive — contents needed for the audit

The backend is currently local only (`D:\My work\work\Projects\FlyTogether\backend`) and is not in a public repository. API integration stays on hold until the archive is uploaded. Please exclude all secrets, `.env` files, database credentials, JWT keys, admin passwords and virtual environments, as you proposed. To make the first upload sufficient, please include:

- Application code and entry point (e.g. `main.py`), plus every API route module and the router wiring.
- Database models (SQLAlchemy or equivalent), Pydantic schemas, and the Alembic (or other) migration history.
- Dependency manifests (`requirements.txt`, `pyproject.toml` or `poetry.lock`) and the Python version in use.
- Docker / Procfile / Antideploy deployment configuration with secret values removed, plus the start command.
- Any scheduler, worker or cron code, and any background-job or cache configuration.
- Documentation, README, and any API contract notes.
- The redacted database connection string format (host/db/user placeholders only) and the PostgreSQL version.
- Whether the database currently holds real traveller data, and roughly how many rows in the main tables.
