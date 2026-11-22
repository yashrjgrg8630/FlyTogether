# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Wiring the FastAPI backend

All data access goes through `src/services/*`. Each function calls `call(mock, real)`; set `VITE_USE_MOCKS=false` and `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`) in `.env` to switch to the real API. Every request sends `Authorization: Bearer <token>` (stored in localStorage as `flytogether_token`). A `401` clears the token and redirects to `/login`. Errors should return `{ "detail": "message" }` — the message is shown to the user in a toast. Return `409` for join race conditions (group full / already joined).

Paths are relative to `VITE_API_BASE_URL`. Types live in `src/types/index.ts`.

| Service function                    | Method & endpoint                                | Request                         | Response                                    |
| ----------------------------------- | ------------------------------------------------ | ------------------------------- | ------------------------------------------- |
| `authService.login(p)`              | `POST /auth/login`                               | `LoginPayload`                  | `AuthResponse`                              |
| `authService.register(p)`           | `POST /auth/register`                            | `RegisterPayload`               | `AuthResponse`                              |
| `authService.me()`                  | `GET /users/me`                                  | —                               | `User`                                      |
| `airportService.search(q)`          | `GET /airports?q=`                               | query `q`                       | `Airport[]`                                 |
| `travelService.create(p)`           | `POST /travel-requests`                          | `TravelRequestPayload`          | `TravelRequest`                             |
| `travelService.listMine()`          | `GET /travel-requests/my`                        | —                               | `TravelRequest[]`                           |
| `travelService.update(id, p)`       | `PATCH /travel-requests/{id}`                    | `Partial<TravelRequestPayload>` | `TravelRequest`                             |
| `travelService.remove(id)`          | `DELETE /travel-requests/{id}`                   | —                               | `204`                                       |
| `matchingService.forRequest(id)`    | `GET /matching/{request_id}`                     | —                               | `MatchingResponse` (with `score_breakdown`) |
| `groupService.list(f)`              | `GET /groups?origin=&destination=&status=&date=` | `GroupFilters`                  | `Group[]`                                   |
| `groupService.get(id)`              | `GET /groups/{id}`                               | —                               | `Group`                                     |
| `groupService.members(id)`          | `GET /groups/{id}/members`                       | —                               | `GroupMember[]`                             |
| `groupService.join(id, reqId)`      | `POST /groups/{id}/join`                         | `{ travel_request_id }`         | `Group` (`409` if full/duplicate)           |
| `groupService.leave(id)`            | `POST /groups/{id}/leave`                        | —                               | `204`                                       |
| `groupService.quotes(id)`           | `GET /groups/{id}/quotes`                        | —                               | `Quote[]` (published only)                  |
| `quoteService.forGroup(id)`         | `GET /groups/{id}/quotes`                        | —                               | `Quote[]` (published only)                  |
| `quoteService.listAdmin()`          | `GET /admin/quotes`                              | —                               | `Quote[]` (incl. drafts)                    |
| `quoteService.requestQuotes(p)`     | `POST /admin/quotes/request`                     | `QuoteRequestPayload`           | `{ ok: true }`                              |
| `quoteService.create(p)`            | `POST /admin/quotes`                             | `QuoteCreatePayload`            | `Quote` (status `draft`)                    |
| `quoteService.publish(id)`          | `PATCH /admin/quotes/{id}/publish`               | —                               | `Quote`                                     |
| `notificationService.list()`        | `GET /notifications`                             | —                               | `Notification[]`                            |
| `notificationService.markRead(id)`  | `PATCH /notifications/{id}/read`                 | —                               | `Notification`                              |
| `notificationService.markAllRead()` | `PATCH /notifications/read-all`                  | —                               | `{ updated: number }`                       |
| `adminService.analytics()`          | `GET /admin/analytics`                           | —                               | `Analytics`                                 |
| `adminService.festivalDemand()`     | `GET /admin/analytics/festival-demand`           | —                               | `FestivalDemand`                            |
| `flightService.search(p)`           | `POST /flights/search`                           | `FlightSearchPayload`           | `FlightSearchResponse`                      |
| `flightService.getOffer(id)`        | `GET /flights/offers/{id}`                       | —                               | `FlightOffer`                               |
| `flightService.providerHealth()`    | `GET /admin/providers/health`                    | —                               | `ProviderHealth[]`                          |

All `/admin/*` endpoints must return `403` for non-admin users.
