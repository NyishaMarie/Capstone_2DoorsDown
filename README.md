# Toolshed

A neighborhood tool-lending app. Neighbors list tools they own, browse what's
available nearby, and borrow from each other instead of buying something they
will use twice.

Fullstack Academy capstone, cohort 2605 — built by Nyisha and Priscilla.

**Live API:** https://toolshed-api-iyy3.onrender.com/api/health

**Live site:** https://2doorsdown.netlify.app

## The problem

Most people own tools they use once or twice a year. A tile saw, a pressure
washer, an extension ladder, all of which are expensive, bulky,
and left unused almost all the time.
Meanwhile the neighbor two doors down is renting the same thing for the weekend.

Toolshed is a shared shed for a neighborhood. You list what you have, you see
what is nearby, and you borrow it.

## Screenshots

TO DO — Priscilla

- Create a "docs" folder with a "screenshots" folder inside it
- Add screenshots of Browse, Tool Detail, Register, and My Borrows
- Mac: command+shift+4

## Goals

Toolshed set out to do four things:

1. **Replace the group chat.** The goal was to create a real catalog you can search instead of a message you have to send.
2. **Never show a tool as available when it isn't.** Availability had to be correct
   at the moment someone looks, not whenever a field last got updated.
3. **Give both sides of a loan the same picture.** The person who lent a tool and
   the person who borrowed it should see the same due date and the same status.
4. **Deployment** A working URL, not a project that only runs on our laptops.

### Out of scope on purpose

Stretch goals we cut to protect the MVP: borrow requests needing owner approval,
overdue notifications, real photo uploads, neighborhood radius filtering, a waitlist
for tools that are out, and a borrow history timeline on each tool page.

## Core distinguishing features

**Availability is calculated, never stored.** There is no "is_available" column.
A tool is available when no unreturned borrow points at it, worked out fresh on
every query with a "NOT EXISTS" subquery. A stored column would go stale the moment
a borrow was created somewhere that forgot to update it. This one cannot drift.

**Overdue works the same way.** "returned_at IS NULL AND due_at < NOW()" is computed
in SQL, so a borrow becomes overdue on its own as time passes. Nothing has to run
to make that happen, and React never does date math.

**Every borrow carries both people.** A borrow object includes the borrower and the
owner — names, ids, and the owner's neighborhood. That is why one "BorrowRow"
component renders on both the borrower's My Borrows page and the owner's My Toolshed
page instead of needing two different shapes for the same thing.

**Either party can mark a tool returned.** Not just the borrower. When a tool changes
hands in a driveway, either person might be the one holding their phone. The check
needs a join, because a borrow row knows who borrowed it but not who owns the tool.

**Borrowing runs three guards in a fixed order.** The tool has to exist, you cannot
borrow your own tool, and nobody else can already have it. The order is deliberate:
borrowing your own tool that is also checked out returns "you cannot borrow your own
tool," not "already checked out." One of those is permanent and the other is
temporary, and the permanent one is the more useful thing to be told.

**Neighborhood is part of who you are.** It is a required field at registration and
it travels with every tool and every borrow, because a catalog of tools forty minutes
away is not useful.

**Every error answers in the same shape.** When something goes wrong, the server
sends JSON with one key called "error" holding a sentence a person can read. Because
it is always that shape, the client has one place that handles failure instead of a
special case per route.

## Tech stack

**Back end**
- Node.js and Express 5
- PostgreSQL with pg
- bcrypt for password hashing
- jsonwebtoken for auth
- Vitest for tests

**Front end**
- React 19 with Vite
- React Router

**Hosting**
- Render — API and Postgres database
- Netlify — client

## Architecture

Two separate programs in one repository. They share no code. The only thing
connecting them is the client sending a request over the network and the server
answering with JSON. That is why each half has its own package.json, its own
node_modules and .env file.

### Back end

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
calls a function from db/queries/, and sends back the answer.

### Front end

```
client/src/
├── main.jsx            the first thing that runs, mounts React into index.html
├── App.jsx             the route table and the AuthProvider
├── index.css           design tokens and component styles
│
├── api/
│   └── Services/
│       └── Api.js      one fetch wrapper, adds the base URL and the token
│
├── auth/
│   └── AuthContext.jsx holds the token and the logged-in user
│
├── layout/
│   ├── Layout.jsx      the frame around every page
│   └── Navbar.jsx      nav links that change when you log in
│
├── pages/              one file per screen, each has its own URL
│   ├── Landing.jsx
│   ├── Browse.jsx
│   ├── ToolDetail.jsx
│   ├── NewTool.jsx
│   ├── EditTool.jsx
│   ├── MyToolshed.jsx
│   ├── MyBorrows.jsx
│   ├── Profile.jsx
│   ├── Account.jsx
│   ├── Register.jsx
│   ├── Login.jsx
│   └── NotFound.jsx
│
└── components/         reusable pieces that live inside pages
    ├── ToolCard.jsx
    ├── AvailabilityBadge.jsx
    ├── CategoryFilter.jsx
    ├── ToolForm.jsx
    ├── BorrowRow.jsx
    ├── ProtectedRoute.jsx
    └── Errors.jsx
```

If it has its own URL it is a page. If it appears inside something else it is a
component.

## Endpoints

Everything is under "/api". A token goes in the header as
"Authorization: Bearer <token>".

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | "/api/health" | no | Server pulse check. No database, no auth. |
| POST | "/api/auth/register" | no | Creates an account, returns a token and the user |
| POST | "/api/auth/login" | no | Returns a token and the user |
| GET | "/api/auth/me" | yes | The logged-in user |
| GET | "/api/tools" | no | The catalog. Filters with "?category=" and "?available=true" |
| GET | "/api/tools/mine" | yes | Tools you own |
| GET | "/api/tools/:id" | no | One tool, with its active borrow if it has one |
| POST | "/api/tools" | yes | List a new tool |
| PATCH | "/api/tools/:id" | yes, owner only | Edit a tool |
| DELETE | "/api/tools/:id" | yes, owner only | Remove a tool |
| POST | "/api/tools/:id/borrows" | yes | Borrow a tool. Three guards, in order |
| GET | "/api/borrows/mine" | yes | Everything you have borrowed |
| GET | "/api/borrows/lent" | yes | Borrows on tools you own |
| PATCH | "/api/borrows/:id/return" | yes, borrower or owner | Mark a tool returned |

Still to come:

Public profiles and editing your own account are still in progress.

## Running it locally

You need PostgreSQL running and Node installed.

**Back end**

```bash
cd server
npm install
cp .env.example .env
createdb toolshed
psql -d toolshed -f db/schema.sql
npm run db:seed
npm run dev
```

Runs on http://localhost:3000

"server/.env" needs:

DATABASE_URL "postgresql://localhost:5432/toolshed" — add "username:password@" before "localhost" if your Postgres asks for a password

JWT_SECRET — any long random string
CORS_ORIGIN "http://localhost:5173" 

**Front end**

In a second terminal tab:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Runs on http://localhost:5173

client/.env needs:

VITE_API_URL "http://localhost:3000/api" — includes "/api"

Vite only reads .env when it starts. After changing it, stop the dev server with
Ctrl+C and start it again. A hot reload will not pick it up.

**Seeded accounts**

The seed creates 10 users, 20 tools, and 30 borrows — 6 currently out, 4 overdue,
20 returned. Every seeded account uses the password "password". Log in as
"sarah@toolshed.dev" to see a user who both owns and borrows tools.

**Tests**

```bash
cd server
npm test
```

## Deployment

**API — Render**

- Root Directory: "server"
- Build: "npm install"
- Start: "npm start"
- Environment: DATABASE_URL (the internal Postgres URL), JWT_SECRET, CORS_ORIGIN

**Client — Netlify**

- Base directory: "client"
- Build: "npm run build"
- Publish: "dist"
- Environment: VITE_API_URL