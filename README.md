# Trello Clone

A full-stack, Trello-style Kanban task manager. A **Django REST Framework** API with JWT authentication powers a **React** single-page app where you organise work into boards, lists and cards, and drag cards between lists.

![Board view](docs/screenshots/drag-and-drop.png)

## Highlights

- **Kanban boards** with lists and cards, drag-and-drop between lists (mouse and touch), optimistic updates with automatic rollback if the API rejects a change.
- **Cards** with status (To do / In progress / Done), due dates with overdue and due-soon indicators, descriptions, and a one-click "mark as done".
- **Dashboard** with a workload summary, cards due soon and recently added cards.
- **My tasks** page driven by the API's own search, status filter, ordering and pagination. Filters live in the URL, so a view can be bookmarked.
- **Secure by default on the client**: JWT access tokens are refreshed silently, and the session ends cleanly if the refresh token expires.
- **Light and dark themes**, responsive down to phones, keyboard-accessible dialogs and visible focus states.
- **Documented API**: OpenAPI schema with Swagger UI and ReDoc, plus a Postman collection.

## Screenshots

| Dashboard | Boards |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Boards](docs/screenshots/boards.png) |

| Card editor | Dark theme |
| --- | --- |
| ![Card editor](docs/screenshots/card-editor.png) | ![Dark theme](docs/screenshots/board-dark.png) |

| Sign in | Mobile |
| --- | --- |
| ![Sign in](docs/screenshots/login.png) | <img src="docs/screenshots/mobile-board.png" alt="Mobile board" width="260"> |

## Tech stack

| Layer | Technology |
| --- | --- |
| API | Python 3.11+, Django 5.2, Django REST Framework, Simple JWT, django-filter, django-cors-headers |
| API docs | drf-spectacular (OpenAPI 3, Swagger UI, ReDoc) |
| Database | SQLite (development) |
| Frontend | React 19, Vite, React Router 7 |
| UI | Hand-written CSS with design tokens, `@dnd-kit/core` for drag and drop, `lucide-react` icons, `sonner` toasts, Bricolage Grotesque + Instrument Sans (self-hosted via Fontsource) |
| Tooling | [`uv`](https://docs.astral.sh/uv/) for Python dependencies, npm for the frontend, Postman for API testing |

## Project structure

```text
trello-clone-api/
├── account/            # custom email-based User, register / login / profile / dashboard
├── board/              # Board model + viewset, board -> lists endpoint
├── list/               # List model + viewset, list -> tasks endpoint, ownership permission
├── task/               # Task model + viewset, search / filter / ordering, mark_done action
├── my_trello/          # settings, root URLs, response-envelope renderer
├── postman/            # Postman collection
├── docs/screenshots/   # images used in this README
├── frontend/           # React app (see frontend/README.md)
│   └── src/
│       ├── api/        # fetch client (envelope, errors, token refresh, pagination) + endpoints
│       ├── auth/       # AuthContext: session restore, sign in / up / out
│       ├── components/ # AppShell, modals, Kanban column and card
│       ├── pages/      # Login, Register, Dashboard, Boards, Board, Tasks
│       └── styles/     # tokens (light/dark), base UI kit, layout, board
├── manage.py
├── pyproject.toml
└── uv.lock
```

## Data model

```text
User ─┬─ Board ─┬─ List ─┬─ Task
      │         │        └─ title, description, status, due_date
      │         └─ title, description
      └─ name, description, is_active
```

A user owns many boards, a board has many lists, and a list has many tasks. Deleting a parent cascades to its children.

## Getting started

### Prerequisites

- Python 3.11 or newer and [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- Node.js 20.19+ (or 22+) and npm

### 1. Run the API

```bash
git clone https://github.com/Hitendra15/trello-clone-api.git
cd trello-clone-api

uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

The API is now at `http://127.0.0.1:8000/api/`. Interactive docs are at `http://127.0.0.1:8000/api/schema/swagger-ui/`.

### 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env     # optional: only needed if the API is not on 127.0.0.1:8000
npm run dev
```

Open `http://localhost:5173`, create an account, and make your first board.

> CORS is configured for `http://localhost:5173` and `http://127.0.0.1:5173`. If you serve the frontend from another origin, add it to `CORS_ALLOWED_ORIGINS` in `my_trello/settings.py`.

### Frontend scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build into `frontend/dist` |
| `npm run preview` | Serve the production build locally |

### Configuration

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | `frontend/.env` | `http://127.0.0.1:8000/api` | Base URL of the API |

## API overview

All responses are wrapped in a consistent envelope:

```json
{ "success": true, "message": "Request successful", "errors": null, "data": { } }
```

Errors set `success: false` and put the validation details in `errors`. List endpoints are paginated (10 per page) and return `data: { count, next, previous, results }`.

Send the access token on every protected request: `Authorization: Bearer <access_token>`. Access tokens last 10 minutes; refresh tokens last 1 day and are rotated on use.

| Area | Method and path | Notes |
| --- | --- | --- |
| Auth | `POST /api/register/` | Returns tokens, so the user is signed in immediately |
| | `POST /api/login/` | Email and password, returns `token.access` and `token.refresh` |
| | `POST /api/auth/token/` | Standard Simple JWT token pair |
| | `POST /api/auth/token/refresh/` | Exchange a refresh token for a new access token |
| | `GET /api/profile/` | Current user's name |
| | `GET /api/dashboard/` | Totals, task counts by status, and the user's boards |
| Boards | `GET, POST /api/boards/` | |
| | `GET, PUT, PATCH, DELETE /api/boards/<id>/` | |
| | `GET, POST /api/boards/<id>/lists/` | Lists of a board (`board` is also required in the POST body) |
| Lists | `GET, POST /api/lists/` | |
| | `GET, PUT, PATCH, DELETE /api/lists/<id>/` | |
| | `GET, POST /api/lists/<id>/tasks/` | Tasks of a list (`list` is also required in the POST body) |
| Tasks | `GET, POST /api/tasks/` | `?search=`, `?status=`, `?ordering=due_date\|created_at` (prefix `-` for descending), `?page=` |
| | `GET, PUT, PATCH, DELETE /api/tasks/<id>/` | |
| | `POST /api/tasks/<id>/mark_done/` | Sets the status to `done` |
| | `GET /api/tasks/completed_task/` | All completed tasks (not paginated) |
| Docs | `GET /api/schema/`, `/api/schema/swagger-ui/`, `/api/schema/redoc/` | OpenAPI |

Validation rules enforced by the API: task titles need at least 2 characters, descriptions at least 5 (when provided), and due dates cannot be in the past.

## How the frontend uses the API

- **One client, one place for protocol details.** `frontend/src/api/http.js` unwraps the response envelope, normalises the different error shapes DRF and Simple JWT produce into `{ message, fields }`, and attaches the bearer token.
- **Silent token refresh.** On a `401` the client refreshes the access token once (concurrent requests share a single refresh call), then replays the request. If the refresh fails, the user is returned to the sign-in screen.
- **Pagination handled for you.** `fetchAll` reads page 1, then fetches the remaining pages in parallel, so boards with more than 10 lists or cards render completely.
- **Optimistic UI.** Moving a card or toggling done updates the screen immediately and rolls back with an error message if the request fails.
- **Partial updates.** The card editor sends only the fields that changed, because the API re-validates every field it receives (for example, it would reject an unchanged due date once that date has passed).
- **Client-side aggregates.** The API has no per-board counts, so board progress and "due soon" lists are derived from the boards, lists and tasks endpoints.

## Testing the API

Import `postman/MYTRELLO APPLICATION.postman_collection.json` into Postman, or use Swagger UI. A good manual flow: register, log in, add the bearer token, create a board, a list and a task, then try validation errors, search, filtering, ordering, pagination, `mark_done`, and access with a second user.

## Known limitations

These are current limitations of the API that the interface works around or surfaces. They are good candidates for the next iteration.

- **Card order is not stored.** Tasks have no `position` field, so cards appear in creation order within a list and dragging only changes which list a card belongs to. Same for the order of lists.
- **Descriptions cannot be cleared.** The serializer rejects an empty description (it requires 5+ characters whenever the field is sent), so a description can be edited but not removed.
- **Ownership checks are missing on some nested routes.** `GET/POST /api/lists/<id>/tasks/` do not verify list ownership, and `POST /api/tasks/` / `PATCH /api/tasks/<id>/` accept any list id, so an authenticated user can read or add cards in another user's list if they know its id. The same applies to `board` on `POST /api/lists/`. Restrict these querysets and validate related ids against `request.user`.
- **Ordering by due date and empty values.** On SQLite, cards without a due date sort first when ordering ascending. Use `F("due_date").asc(nulls_last=True)` in a custom ordering filter if you want undated cards last.
- **Registration compares passwords case-insensitively** (`.lower()`) and does not run Django's password validators.
- **Before deploying**: move `SECRET_KEY` and `DEBUG` to environment variables, set `ALLOWED_HOSTS`, add the production origin to CORS, and consider token blacklisting because refresh tokens rotate.

## Roadmap

- Persist card and list order (`position` field plus a reorder endpoint)
- Fix the ownership gaps above and add automated tests (pytest, plus Vitest and Playwright on the frontend)
- Labels, assignees and board sharing
- Docker Compose with PostgreSQL, CI pipeline and production deployment

## Author

**Hitendra Marathe** · Python / Django developer

If this project is useful to you, consider giving it a star.
