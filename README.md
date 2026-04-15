# InnovaPie — Audit Document Management System

A simple, customizable full-stack prototype for an Audit Department Document
Management System.

Stack: **React (Vite)** + **Node.js (Express)** + **SQLite (Prisma)**.
Organized as an npm workspaces monorepo.

## Features

- Full CRUD on documents with dynamic / customizable fields
- Fully admin-configurable status workflow (add / rename / recolor / reorder
  / delete statuses — no code changes required)
- Per-status history log with timestamps
- Aging metrics: total age, time-in-current-status, warn / overdue flags
- Dashboard with summary cards and oldest-open list
- Filterable, searchable document table
- Admin Settings page for statuses, aging thresholds, and custom field
  definitions

## Layout

```
client/      React (Vite) frontend
server/      Express API + Prisma
  prisma/    SQLite schema + generated db
shared/      shared defaults and type helpers
```

## Setup

```bash
npm install            # install all workspaces
npm run db:setup       # create SQLite db, run migration, seed default config
npm run dev            # start api on :4000 and client on :5173
```

Open http://localhost:5173 in your browser.

The API is available at http://localhost:4000/api and proxied through Vite
under `/api`.

## Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run both backend and frontend with live reload |
| `npm run dev:server` | Run only the backend (nodemon) on :4000 |
| `npm run dev:client` | Run only the frontend (Vite) on :5173 |
| `npm run db:setup` | `prisma migrate dev` + seed default config |
| `npm run build` | Production client build |

## Notes

- No authentication is included — this is a prototype. A placeholder header
  ("Logged in as Admin") is shown in the nav.
- Statuses are **not** hardcoded anywhere. Everything flows from
  `Config.statuses`, edited via **Admin Settings**.
- Re-running `db:setup` will re-apply migrations but will not overwrite
  existing config rows.
