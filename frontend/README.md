# Trello Clone: frontend

React 19 + Vite single-page app for the Trello Clone API. See the [root README](../README.md) for the full project overview, API reference and setup.

## Quick start

```bash
npm install
cp .env.example .env   # only if your API is not at http://127.0.0.1:8000/api
npm run dev            # http://localhost:5173
```

The Django API must be running (`uv run python manage.py runserver` in the repo root).

## Source layout

```text
src/
├── api/         http.js (envelope, errors, token refresh, pagination), index.js (endpoints)
├── auth/        AuthContext: session restore, sign in / up / out
├── theme/       ThemeContext: light / dark, saved per browser
├── data/        useWorkspace: loads boards, lists and tasks and derives per-board progress
├── lib/         formatting and date helpers
├── components/
│   ├── ui/      Modal, ConfirmDialog, Menu, pills, empty and error states
│   └── board/   ListColumn, TaskCard, TaskModal, board and list forms
├── pages/       Login, Register, Dashboard, Boards, Board, Tasks, NotFound
└── styles/      tokens.css, base.css, shell.css, pages.css, board.css
```

## Design notes

- **Tokens first.** All colours, radii and type sizes are CSS custom properties in `styles/tokens.css`. The dark theme only swaps token values, so components never hard-code colours.
- **Status is never colour alone.** Statuses and due states pair colour with an icon and a text label.
- **Keyboard and screen readers.** Dialogs trap focus and restore it on close, `Esc` closes them, form errors are announced, and cards can be moved without dragging through the "List" select in the card editor.
- **Reduced motion** is respected.
