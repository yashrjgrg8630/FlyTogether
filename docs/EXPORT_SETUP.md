# FlyTogether source export — setup and handover

## What this archive contains

The current React/TanStack Start frontend: pages, route wrappers, reusable components, services/mock data, tests, assets, configuration, `bun.lock`, the API endpoint guide, live-data audit and Antigravity continuation prompt.

**Not included:** the separate FastAPI backend, PostgreSQL records, `.env` secrets, supplier credentials, git/history, dependencies, build output or Lovable workspace metadata. Mock passwords in demo fixtures are fictional test data, not production credentials. Demo changes reset on reload.

## Open it locally

1. Extract into a new frontend folder. Do not overwrite the existing backend or merge over your only working copy.
2. Install Bun (the export environment used Bun 1.4.4 with Node 22.23.5). Package versions are in `package.json` and `bun.lock`.
3. Copy `.env.example` to `.env`. It contains only public frontend configuration and enables demo mode intentionally.
4. In the extracted folder:

```sh
bun install --frozen-lockfile
bun run dev
```

Open the local URL printed by Vite. For tests:

```sh
bun run test
```

Production build command for your local/CI environment:

```sh
bun run build
```

The current Lovable-managed Vite configuration includes TanStack SSR and a default Cloudflare target. Audit Antideploy runtime support before choosing a production start command. This export is source, not a prebuilt static hosting bundle; `vite preview` is not the verified production hosting plan. Package installation and standalone deployment of the extracted archive have not been independently tested.

## Backend wiring

Read the complete function/endpoint table in `README.md`. Once the actual FastAPI backend is audited and running, use:

```dotenv
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Restart your local dev process after changing environment configuration. Deployments must set a reachable HTTPS API URL or properly configured same-origin API path, not localhost. Never put a Duffel token or private key in these frontend variables.

## Continue in Antigravity

Open `docs/ANTIGRAVITY_PROMPT.md`, paste its full continuation prompt into Antigravity and provide the separate redacted backend source or access to your local backend folder. Read `docs/LIVE_DATA_AUDIT.md` for dated findings and remaining gates.

You reported Duffel production access, but written search-only permission/pricing is still outstanding. The pilot approval is conditional. API integration waits for backend access; production searches wait for written terms, secure credentials and approved coverage checks. Frontend visual refinement is specified in the prompt and has not been newly implemented as part of this handover.
