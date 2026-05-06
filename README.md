# Team Task Manager (TaskFlow)

A role-based team workspace to manage projects, members, and tasks with secure, scoped access per account.

## Project Overview

TaskFlow is built for small teams that need:
- `ADMIN` users to create and own projects
- `MEMBER` users to join projects using an invite code
- a shared task board per project
- account-scoped visibility (new users start with empty data)

Core capabilities:
- Authentication (signup, login, logout) with JWT cookie sessions
- Project creation (admins only)
- Project join via 8-character join code
- Project member management by project owner
- Task creation and status updates
- Dashboard metrics scoped to only accessible projects

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript
- Backend: Next.js Route Handlers (`/api/*`)
- Database: PostgreSQL (Neon)
- ORM: Prisma
- Auth: JWT (`jsonwebtoken`) + `httpOnly` cookie
- Password hashing: `bcryptjs`
- Styling: global CSS + reusable UI surface components
- Linting: ESLint

## Codebase File Tree

```text
Team Task Manager/
|- src/
|  |- app/
|  |  |- api/
|  |  |  |- auth/
|  |  |  |  |- login/route.ts
|  |  |  |  |- logout/route.ts
|  |  |  |  |- session/route.ts
|  |  |  |  `- signup/route.ts
|  |  |  |- dashboard/route.ts
|  |  |  |- projects/
|  |  |  |  |- route.ts
|  |  |  |  |- join/route.ts
|  |  |  |  `- [id]/
|  |  |  |     |- route.ts
|  |  |  |     `- members/route.ts
|  |  |  `- tasks/route.ts
|  |  |- login/page.tsx
|  |  |- signup/page.tsx
|  |  |- projects/
|  |  |  |- page.tsx
|  |  |  |- new/page.tsx
|  |  |  |- join/page.tsx
|  |  |  `- [id]/
|  |  |     |- page.tsx
|  |  |     `- tasks/page.tsx
|  |  |- tasks/page.tsx
|  |  |- page.tsx
|  |  |- layout.tsx
|  |  `- globals.css
|  |- components/
|  |  |- Navbar.tsx
|  |  `- surface.tsx
|  `- lib/
|     |- auth.ts
|     |- join-code.ts
|     `- prisma.ts
|- prisma/
|  |- schema.prisma
|  |- seed.ts
|  `- migrations/
|- .env.example
|- package.json
`- README.md
```

## Architecture

### 1. Request Flow
- Client pages call `/api/*` route handlers.
- Route handlers validate session via `getSession()` from `src/lib/auth.ts`.
- Prisma handles reads/writes through `src/lib/prisma.ts`.
- Responses are JSON for client components, while some server pages query Prisma directly.

### 2. Auth and Session Model
- On signup/login, password is hashed or verified with `bcryptjs`.
- JWT contains `{ id, email, role }`.
- JWT is stored in `token` cookie (`httpOnly`, `sameSite=lax`, secure in production).
- Protected routes return `401` when session is missing/invalid.

### 3. Data Model
- `User`: account + role (`ADMIN` or `MEMBER`)
- `Project`: owned by a user, includes unique `joinCode`
- `ProjectMember`: user-to-project membership + role
- `Task`: belongs to a project and can be assigned to a user

### 4. Authorization Rules
- `ADMIN` can create projects.
- Project owner can manage members (add/update/remove).
- Members can join a project using a valid join code.
- Project/task visibility is limited to projects the user owns or joined.
- Dashboard and task counts are scoped per user.

## How to Use the Platform

1. Create an account on `/signup` as `ADMIN` or `MEMBER`.
2. Login from `/login`.
3. If `ADMIN`, create a project from `/projects/new`.
4. If `ADMIN`, open project details and copy the join code.
5. If `MEMBER`, join a project from `/projects/join` using the join code.
6. Open `/projects/[id]/tasks` to create and update project tasks.
7. Use `/tasks` to see only your assigned tasks.
8. Use `/` dashboard to track scoped stats and recent work.

## Install and Run from GitHub

### 1. Clone repository
```bash
git clone <your-repo-url>
cd "Team Task Manager"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env
```

Fill `.env` values:
- `DATABASE_URL`: Neon pooled URL (contains `-pooler`)
- `DIRECT_URL`: Neon direct URL (non-pooler host)
- `JWT_SECRET`: long random secret
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` for local

### 4. Apply migrations
```bash
npm run db:migrate:deploy
```

### 5. Optional seed data
```bash
npm run db:seed
```

### 6. Run development server
```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Deployment

Set these environment variables in your hosting platform:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

Use:
- Build command: `npm run build`
- Start command: `npm run start`
- Release migration step: `npm run db:migrate:deploy`

## Deploy on Railway

1. Push this repository to GitHub.
2. In Railway, click `New Project` -> `Deploy from GitHub repo`.
3. Select this repo and service root.
4. Add environment variables in Railway service:
- `DATABASE_URL` (Neon pooled URL, usually `-pooler` host)
- `DIRECT_URL` (Neon direct URL, non-pooler host)
- `JWT_SECRET` (long random secret)
- `NEXT_PUBLIC_APP_URL` (your Railway public domain or custom domain)
5. Deploy.

This repo already includes Railway config in [`railway.json`](railway.json):
- `buildCommand`: `npm run build`
- `preDeployCommand`: `npm run db:migrate:deploy`
- `startCommand`: `npm run start`
- `healthcheckPath`: `/api/health`

After deploy, verify:
- `https://<your-domain>/api/health` returns `{ "ok": true }`
- signup/login works
- project/task data persists in Neon

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run db:generate` - generate Prisma client
- `npm run db:migrate:dev` - create/apply development migration
- `npm run db:migrate:deploy` - apply migrations in deploy/production
- `npm run db:seed` - seed database
