# Toolshed

A neighborhood tool-lending app. Neighbors list tools they own, browse what's
available nearby, and borrow from each other instead of buying something they
will use twice.

Fullstack Academy capstone, cohort 2605 — built by Nyisha and Priscilla.

**Live API:** https://toolshed-api-iyy3.onrender.com/api/health

**Live site:** https://2doorsdown.netlify.app

## The problem

Most people own tools they use once or twice a year. A tile saw, a pressure
washer, an extension ladder — expensive, bulky, and idle almost all the time.
Meanwhile the neighbor two doors down is renting the same thing for the weekend.

Toolshed is a shared shed for a neighborhood. You list what you have, you see
what is nearby, and you borrow it.

## Tech stack

**Back end**
- Node.js and Express 5
- PostgreSQL with `pg`
- bcrypt for password hashing
- jsonwebtoken for auth
- Vitest for tests

**Front end**
- React 19 with Vite
- React Router

**Hosting**
- Render — API and Postgres database
- Netlify — client

## Folder structure

```
server/
├── server.js           starts the server listening
├── app.js              builds the app — middleware in order, then the routers
│
├── db/
│   ├── client.js       the one connection to Postgres
│   ├── schema.sql      the three tables
│   ├── seed.js         fills them with fake data
│   └── queries/        all SQL lives here, one file per table
│       ├── users.js
│       ├── tools.js
│       └── borrows.js
│
├── api/
│   ├── index.js        mounts every router, owns /api/health
│   ├── auth.js         register, login, me
│   ├── tools.js        the catalog
│   ├── borrows.js      borrowing and returning
│   └── users.js        public profiles
│
├── middleware/
│   ├── auth.js         getUserFromToken and requireUser
│   └── errors.js       turns Postgres errors into readable messages
│
├── utils/
│   └── jwt.js          createToken and verifyToken
│
└── tests/              one file per feature
```

A router never writes SQL. It reads the request, decides whether it is allowed,
calls a function from `db/queries/`, and sends back the answer.

## Endpoints

Everything is under `/api`. A token goes in the header as
`Authorization: Bearer <token>`.

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/api/health` | no | Server pulse check. No database, no auth. |
| POST | `/api/auth/register` | no | Creates an account, returns `{ token, user }` |
| POST | `/api/auth/login` | no | Returns `{ token, user }` |
| GET | `/api/auth/me` | yes | The logged-in user |
| GET | `/api/tools` | no | The catalog. `?category=` and `?available=true` |
| GET | `/api/tools/:id` | no | One tool |

Routes still being built:

| Method | Path | Auth | Owner |
|---|---|---|---|
| GET | `/api/tools/mine` | yes | Priscilla |
| POST | `/api/tools` | yes | Priscilla |
| PATCH | `/api/tools/:id` | yes, owner only | Priscilla |
| DELETE | `/api/tools/:id` | yes, owner only | Priscilla |
| POST | `/api/tools/:id/borrows` | yes | Nyisha |
| GET | `/api/borrows/mine` | yes | Nyisha |
| GET | `/api/borrows/lent` | yes | Nyisha |
| PATCH | `/api/borrows/:id/return` | yes | Nyisha |
| GET | `/api/users/:id` | no | Priscilla |
| PATCH | `/api/users/me` | yes | Priscilla |

## Running it locally

**Back end**

```bash
cd server
npm install
psql -d toolshed -f db/schema.sql
npm run db:seed
npm run dev
```

Runs on `http://localhost:3000`.

You need a `server/.env` file with:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | `postgresql://localhost:5432/toolshed` |
| `JWT_SECRET` | any long random string |
| `CORS_ORIGIN` | `http://localhost:5173` |

**Front end**

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`. Needs a `client/.env` with
`VITE_API_URL=http://localhost:3000` — no trailing slash.

**Tests**

```bash
cd server
npm test
```

## Deployment

**API — Render**

- Root Directory: `server`
- Build: `npm install`
- Start: `npm start`
- Environment: `DATABASE_URL` (internal Postgres URL), `JWT_SECRET`, `CORS_ORIGIN`

**Client — Netlify**

- Base directory: `client`
- Build: `npm run build`
- Publish: `dist`
- Environment: `VITE_API_URL` — no trailing slash