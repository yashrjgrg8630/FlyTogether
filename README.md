# FlyTogether ✈️

> **Group Flight Demand Aggregation Platform**  
> *Pool flight demand with travellers on your route. Compare group quotations together.*

[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-38%20Passed-brightgreen)](https://github.com/yashrjgrg8630/FlyTogether)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-17%20Passed-brightgreen)](https://github.com/yashrjgrg8630/FlyTogether)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-red)](https://alembic.sqlalchemy.org)

---

## 📌 Core Mission & Non-Negotiable Rules

> **MANDATORY LEGAL DISCLAIMER**  
> **"FlyTogether aggregates demand. It does not sell tickets or reserve seats."**

- **Demand Pooling Only:** FlyTogether pools registered travellers heading on compatible routes and overlapping dates to reach group quotation thresholds. It does not sell tickets, issue PNRs, process flight payments, or guarantee discounts.
- **Truthful Provenance:** Individual flight offers are never presented as group fares. Quotes clearly state their provenance (`simulated`, `manual`, `static`, or `live`). We never fabricate bulk discounts or claim airline endorsement.
- **Privacy by Design:** Traveller personal information (email, phone, private identity) is never exposed to other travellers. Member lists strictly display safe aliases (e.g. `Aarav S.`).
- **Gated Live Flight Searches:** Third-party supplier calls (e.g., Duffel) remain strictly disabled until written commercial confirmation for search-only terms without order creation is secured. When inactive, an honest offline notice is displayed without fake mock data.

---

## 🏗️ Architecture & Tech Stack

```
FlyTogether/
├── backend/                       # Python FastAPI Backend
│   ├── alembic/                   # Alembic database migration versions & env
│   ├── app/
│   │   ├── models.py              # SQLAlchemy 2.0 relational models (7 entities)
│   │   ├── schemas.py             # Pydantic v2 schemas
│   │   ├── auth.py                # JWT Bearer auth, bcrypt, safe alias logic
│   │   ├── database.py            # Engine, session, pool pre-ping
│   │   ├── seed.py                # Deterministic seed data matching mockDb
│   │   ├── config.py              # Environment settings (database, secrets, CORS)
│   │   ├── providers/             # External supplier adapters & circuit breakers
│   │   │   ├── base.py            # Abstract BaseFlightProvider
│   │   │   └── duffel.py          # Duffel API adapter with circuit breaker
│   │   ├── services/              # Business automation services
│   │   │   ├── clustering.py      # Demand clustering & group auto-formation
│   │   │   ├── notifications.py   # Multi-channel notification dispatcher
│   │   │   └── rfq.py             # Official airline group RFQ generator
│   │   └── routers/               # FastAPI route modules under /api/v1
│   │       ├── auth.py            # Login, register, /users/me
│   │       ├── airports.py        # Airport autocomplete search (26 Indian hubs)
│   │       ├── travel_requests.py # CRUD travel requirements with validation
│   │       ├── matching.py        # Compatibility ranking & score breakdown
│   │       ├── groups.py          # Group discovery, details, join/leave, admin create
│   │       ├── quotes.py          # Admin quotation drafts & publishing
│   │       ├── notifications.py   # In-app notifications & read receipts
│   │       ├── analytics.py       # Admin analytics & festival demand heatmap
│   │       ├── flights.py         # Flight search & provider health diagnostics
│   │       └── operations.py      # Automated clustering & airline RFQ endpoints
│   ├── tests/                     # 17 Pytest unit & integration tests
│   ├── Dockerfile                 # Python 3.11-slim production container
│   └── requirements.txt           # Python dependencies
│
├── src/                           # React 19 Frontend
│   ├── pages/                     # Full page views (Home, Dashboard, Discover, etc.)
│   ├── routes/                    # Thin TanStack Start / Router route wrappers
│   ├── components/
│   │   ├── admin/                 # Demand charts, festival heatmap, RFQ outreach dialog
│   │   ├── common/                # Badges, Logo, EmptyState, PageSkeleton, RouteGuards
│   │   ├── groups/                # GroupCard, GroupProgress, GroupActions, MatchScore
│   │   ├── layout/                # Floating glass Navbar, Footer with disclaimer
│   │   ├── quotations/            # PriceComparison, QuoteCard, SourceBadge
│   │   └── travel/                # AirportCombobox, RequestForm
│   ├── context/                   # AuthContext (JWT bearer in localStorage), ThemeContext
│   ├── services/                  # Data access layer using call(mock, real) pattern
│   ├── styles.css                 # Semantic design tokens in dark & light modes
│   └── utils/                     # Formatting, validation, group & quote business rules
│
├── docker-compose.yml             # Local multi-container dev (PostgreSQL 16 + FastAPI)
└── .env.docker.example            # Sample Docker Compose environment variables
```

---

## ✨ Features

### 👤 Traveller Workspace
- **Requirement Publishing:** Origin, destination (26 Indian commercial airports), departure date, flexibility window (0–7 days), passenger count (whole seats), and optional budget cap.
- **Match Scoring Engine:** Transparent compatibility score (0–100) deducting points for date distance and insufficient capacity, explicitly leaving budget unscored without a live guaranteed fare.
- **Group Formation & Safe Aliases:** Discover forming and quote-eligible groups; join/leave with ACID capacity enforcement. Member lists display safe aliases (e.g. `Priya N.`, `Aarav S.`) to protect privacy.
- **Price Comparison & Potential Savings:** Compare published airline quotes with baggage allowance and countdown timers. Savings are calculated strictly against an explicit user-provided indicative reference fare.

### 🛡️ Admin Workspace
- **Demand Analytics:** Real-time metrics on registered travellers, travel requirements, active groups, route demand charts, and a multi-festival demand heatmap (Holi, Eid, Onam, Durga Puja, Diwali, Christmas).
- **Automated Demand Clustering:** Algorithmic clustering engine that groups open traveller requirements into new groups when pooled seats reach threshold (≥ 10 seats).
- **Airline RFQ Outreach Generator:** Automated generation of formal Request For Quotation (RFQ) packets with unique tracking codes (`FT-RFQ-G1`) and airline group booking desk contacts (IndiGo, Air India, SpiceJet, Akasa Air) with 1-click clipboard copy.
- **Quotation Management:** Draft creation, validation, and publishing flow. Drafts are strictly hidden from travellers until verified and published.
- **Provider Health Diagnostics:** Live monitoring of external supplier status, rate limits, and circuit breaker operational state.

### 🔒 Security & Protection
- **JWT Authentication:** Secure token-based authentication with bcrypt password hashing.
- **Sliding-Window Rate Limiting:** 30 requests/minute per client IP on authentication endpoints to prevent brute-force attacks.
- **Security Headers:** Enforced via middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `HSTS`).
- **Server-Side Credentials:** All supplier credentials remain exclusively in backend environment storage.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher) & **npm**
- **Python** (v3.11.0 or higher) & **pip**
- *(Optional)* **Docker & Docker Compose** for running PostgreSQL

---

### Method A: Local Development (SQLite + Fast Dev Server)

#### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000/api/v1`
- Interactive Swagger Docs: `http://localhost:8000/docs`

#### 2. Start the Frontend
In a separate terminal:
```bash
npm install
npm run dev
```
- Open `http://localhost:8080` in your browser.
- *Note:* The frontend is configured to communicate with the real backend via `.env.local` (`VITE_USE_MOCKS=false`). Set `VITE_USE_MOCKS=true` if you wish to run in standalone demo mock mode.

---

### Method B: Multi-Container Setup with PostgreSQL (Docker Compose)

```bash
# Copy example environment configuration
cp .env.docker.example .env

# Start PostgreSQL and FastAPI backend in containers
docker compose up -d

# Verify services are healthy
docker compose ps
```
- PostgreSQL is available on `localhost:5432`.
- FastAPI backend is available on `localhost:8000`.

---

## 🔑 Demo Accounts

The database comes pre-seeded with test accounts matching the frontend demo data:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Traveller** | `traveller@demo.com` | `demo1234` | Traveller dashboard, requirements, matching, group join/leave, quotations |
| **Admin** | `admin@demo.com` | `demo1234` | Admin dashboard, analytics, group management, quote publishing, RFQ generation |

---

## 📋 API Contract Specification

All endpoints are prefixed with `/api/v1`:

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public (Rate-limited) | Authenticate user, return JWT access token |
| `POST` | `/auth/register` | Public (Rate-limited) | Register new traveller account |
| `GET` | `/users/me` | Authenticated | Retrieve current user profile |
| `GET` | `/airports?q={query}` | Public | Search commercial Indian airports by code/city |
| `POST` | `/travel-requests` | Traveller | Publish travel requirement (triggers demand clustering) |
| `GET` | `/travel-requests/my` | Traveller | List authenticated user's travel requirements |
| `PATCH`| `/travel-requests/{id}` | Traveller | Update travel requirement (open only) |
| `DELETE`| `/travel-requests/{id}`| Traveller | Cancel travel requirement |
| `GET` | `/matching/{request_id}` | Traveller | Get ranked group matches with score breakdown |
| `GET` | `/groups` | Public | List groups with route, date, and status filters |
| `GET` | `/groups/{id}` | Public | Retrieve group details and passenger seat progress |
| `GET` | `/groups/{id}/members` | Public | Retrieve group members with privacy-safe display aliases |
| `POST` | `/groups/{id}/join` | Traveller | Join group with an open requirement (ACID capacity check) |
| `POST` | `/groups/{id}/leave` | Traveller | Leave group and reopen travel requirement |
| `GET` | `/groups/{id}/quotes` | Public | Get published airline quotes for a group |
| `POST` | `/groups` | Admin | Create a new group manually |
| `GET` | `/admin/quotes` | Admin | List all quotations (including draft records) |
| `POST` | `/admin/quotes` | Admin | Create draft quotation for a group |
| `PATCH`| `/admin/quotes/{id}/publish` | Admin | Publish draft quotation and notify group members |
| `POST` | `/admin/quotes/request` | Admin | Update group status to quote requested with deadline |
| `GET` | `/admin/groups/{id}/rfq` | Admin | Generate official Airline RFQ packet & email copy |
| `POST` | `/admin/clustering/run` | Admin | Run automated demand clustering engine |
| `GET` | `/admin/analytics` | Admin | Get demand totals, route counts, and 14-day trends |
| `GET` | `/admin/analytics/festival-demand` | Admin | Get festival route demand heatmap |
| `POST` | `/flights/search` | Authenticated | Search live flight benchmark offers (gated) |
| `GET` | `/admin/providers/health` | Admin | Check flight provider status and circuit breaker state |
| `GET` | `/notifications` | Authenticated | List user notifications |
| `PATCH`| `/notifications/{id}/read`| Authenticated | Mark single notification as read |
| `PATCH`| `/notifications/read-all` | Authenticated | Mark all notifications as read |

---

## 🧪 Testing & Quality Assurance

Both frontend and backend are thoroughly covered by automated test suites:

### Run Backend Tests (Pytest)
```bash
cd backend
python -m pytest tests/ -v
```
- **17 passing unit & integration tests** covering health, authentication, RBAC authorization, travel request CRUD, matching formulas, group concurrency rules, notification ordering, provider circuit breaker, demand clustering, and RFQ generation.

### Run Integration Smoke Test
```bash
cd backend
python tests/integration_smoke.py
```
- **22/22 end-to-end contract verification checks** passing.

### Run Frontend Tests (Vitest)
```bash
npm test
```
- **38 passing Vitest tests** covering routing, form validation, quote expiration, group joining rules, safe alias privacy, and flight provider offline notices.

### TypeScript Typecheck & Production Build
```bash
npx tsc --noEmit
npm run build
```
- **0 TypeScript errors.** Production build succeeds with Nitro / TanStack Start.

---

## 📄 License & Attribution

This project is licensed under the MIT License.  
FlyTogether is an independent demand aggregation platform. Airline names and airport identifiers are used solely for informational itinerary matching.
