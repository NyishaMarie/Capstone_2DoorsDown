Toolshed — Frontend

The client for Toolshed, a neighborhood tool-lending app. Neighbors list tools they own, browse what's available nearby, and borrow from each other instead of buying something they'll use twice.

Fullstack Academy capstone, cohort 2605 — built by Nyisha and Priscilla.

Live site: https://2doorsdown.netlify.app Live API: https://toolshed-api-iyy3.onrender.com/api/health

This README covers the frontend only. For the API, database, and full project architecture, see the root README.

Overview

The frontend is a single-page React app that talks to the Toolshed API over fetch. It handles:

Browsing the tool catalog, with category and availability filters
Auth — register, log in, and stay logged in via a token in context
Listing tools — create, edit, and delete tools you own
Borrowing — request a tool, see what you've borrowed, see what you've lent out, and mark either side as returned
Accounts — viewing your own account and public profiles

Routing, auth state, and API calls are each handled in one place (App.jsx, AuthContext.jsx, Api.js), so pages stay focused on layout and don't duplicate that logic.

Screenshots

Landing Show Image

Browse Show Image

My Toolshed Show Image

My Borrows Show Image

Account Show Image

Tech stack
React 19 with Vite — component UI and dev/build tooling
React Router (react-router-dom) — client-side routing
ESLint — linting, with React Hooks and React Refresh plugins
Deployed on Netlify

See package.json for exact versions.

Folder structure
client/
├── index.html            Vite entry HTML
├── vite.config.js        Vite config
├── eslint.config.js      Lint rules
├── package.json
├── .env.example           Template for local env vars
│
├── public/
│   ├── _redirects         Netlify SPA redirect rule (client-side routing)
│   ├── favicon.svg
│   └── icons.svg
│
└── src/
    ├── main.jsx            Entry point — mounts React into index.html
    ├── App.jsx             Route table and AuthProvider
    ├── index.css           Design tokens and component styles
    │
    ├── api/
    │   └── Services/
    │       └── Api.js      One fetch wrapper — adds base URL and auth token
    │
    ├── auth/
    │   └── AuthContext.jsx Holds the token and the logged-in user
    │
    ├── layout/
    │   ├── Layout.jsx      Frame around every page
    │   └── Navbar.jsx      Nav links that change when logged in
    │
    ├── pages/              One file per screen, each with its own URL
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
    └── components/         Reusable pieces that live inside pages
        ├── ToolCard.jsx
        ├── AvailabilityBadge.jsx
        ├── CategoryFilter.jsx
        ├── ToolForm.jsx
        ├── BorrowRow.jsx
        ├── ProtectedRoute.jsx
        └── Errors.jsx

If it has its own URL, it's a page. If it appears inside something else, it's a component.

Setup instructions

You'll need Node installed and the backend running locally (or point at the deployed API — see the env var below).

bash
cd client
npm install
cp .env.example .env
npm run dev

The app runs at http://localhost:5173

Environment variables

client/.env needs:

VITE_API_URL=http://localhost:3000/api

Point this at the deployed API instead (https://toolshed-api-iyy3.onrender.com/api) if you don't want to run the backend locally.

Vite only reads .env on startup — after changing it, stop the dev server (Ctrl+C) and restart it. A hot reload won't pick up the change.

Other scripts
bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint        # run ESLint
Deployment

Deployed on Netlify:

Base directory: client
Build command: npm run build
Publish directory: dist
Environment: VITE_API_URL (set to the deployed API's /api URL)

The public/_redirects file handles client-side routing on Netlify — without it, refreshing on any route other than / would 404.