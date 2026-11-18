# Storefront — FullStack Intern Coding Challenge

A complete React + Express + PostgreSQL store-rating application. Includes one login system and server-enforced Administrator, Normal User, and Store Owner roles.

## Quick start on Windows (no database installation)

Requires Node.js 22.12+ or 24. Run in PowerShell:

```powershell
cd D:\ENTITY\store-rating
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

Open http://localhost:3001. This uses PGlite (embedded PostgreSQL) and persists data under `D:\ENTITY\store-rating\.data\postgres`. npm cache, packages and build output remain in this project on D:. The script only changes execution policy for its process.

Demo accounts (local demonstration only):

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@example.com | Welcome@123 |
| Normal user | user@example.com | Welcome@123 |
| Store owner | owner@example.com | Welcome@123 |

The demo creates one store and three accounts. Seed runs are idempotent and do not reset passwords or overwrite data. Stop with Ctrl+C. Do not run two processes against the same embedded database directory.

## Standard PostgreSQL setup

1. Create a PostgreSQL database named `store_rating`. An optional `compose.yaml` is included if Docker is installed. Its database directory is bound to `.data/postgres-docker`; configure Docker's own image storage on D: separately if required.
2. Copy `.env.example` to `.env`, set `DATABASE_URL`, and choose your seed password. Leave `SEED_PASSWORD` unset to create only the schema.
3. Run:

```powershell
$env:TEMP='D:\ENTITY\store-rating\.cache'
$env:TMP=$env:TEMP
npm install --offline=false
npm run db:setup
npm run dev
```

React development server: http://localhost:5173; Express API: http://localhost:3001. Vite proxies API requests with cookies. For the built app, use `npm run build` then `npm start`. Unset `DEMO_DB` when switching from demo to standard PostgreSQL. In production set `NODE_ENV=production`, use HTTPS (secure cookies), a private database and unique account passwords. The server binds to localhost, suitable for a local run or reverse proxy.

## Vercel deployment

The React build is served as static assets and `api/index.js` runs the Express API as a Vercel Function. `vercel.json` keeps frontend and API on the same domain.

1. Import this repository into Vercel with the Vite preset.
2. Provision a hosted PostgreSQL database (for example Neon), and set `DATABASE_URL` in the project's encrypted environment variables. Use the provider's pooled connection URL with TLS enabled.
3. Initialize that database once by running `npm run db:setup` with its `DATABASE_URL` and a unique `SEED_PASSWORD` in your local shell environment. Do not commit secrets. Seed accounts use the emails shown above but the password you choose here.
4. Deploy to production. Do not set `DEMO_DB` on Vercel: local filesystem databases cannot persist reliably across function instances.
5. Verify login, signup, ratings, and owner dashboard on the deployed URL.

The local demo credentials are not automatically seeded into a hosted database. Auth rate limiting is per function instance; add a shared rate-limit store or platform firewall limits before high-volume production use.

## Implemented functionality

- **Administrator:** total users/stores/ratings, add users of all roles, add stores, filter users by name/email/address/role, filter stores by name/email/address, view user details including an owner's store average.
- **Normal user:** registration, login/logout, password update, search stores by name/address, see average and own rating, submit or change a rating from 1–5.
- **Store owner:** login/logout, password update, store average and list of users who rated it.
- **Sorting:** ascending/descending user columns, store name/email/address/rating, owner rater name/email/rating/date.
- **Validation:** names 20–60 characters, required address up to 400 characters, email syntax, password 8–16 characters with uppercase and special character. All enforced on server; browser constraints provide early feedback.
- **Security:** bcrypt passwords, opaque random session tokens with only SHA-256 hashes in the database, HttpOnly/SameSite cookies, seven-day sessions, logout revocation, password changes revoke all sessions, auth rate limiting, same-origin JSON writes, parameterized SQL and allowlisted sorting, no public role selection, protected endpoints.
- **Database:** foreign keys, unique normalized email addresses, unique user/store ratings, database rating constraints, relevant indexes, computed averages without stale denormalized totals.

## Interpretation of the brief

One store belongs to one owner, and an owner has at most one store (the brief refers to “their store”). Administrators can create owners, then assign unassigned owners during store creation. Owners cannot self-register. Unrated stores display “Not rated” instead of a misleading zero. Name length validation is applied to both users and stores. Store listings have no role field; role filtering applies to users. No external publishing or submission is performed.

## API

All requests and responses use JSON. Authentication is a same-origin session cookie.

| Method | Path | Access |
| --- | --- | --- |
| POST | /api/auth/signup, /api/auth/login | Public |
| GET | /api/auth/me | Authenticated |
| POST | /api/auth/logout | Authenticated |
| PUT | /api/auth/password | Authenticated |
| GET | /api/admin/stats | Admin |
| GET, POST | /api/admin/users | Admin |
| GET | /api/admin/users/:id | Admin |
| POST | /api/admin/stores | Admin |
| GET | /api/stores | Admin, User |
| PUT | /api/stores/:id/rating | User |
| GET | /api/owner/dashboard | Owner |

List query parameters include `sort`, `direction=asc|desc`, and applicable `name`, `email`, `address`, `role` filters. Rating writes use `{ "value": 5 }`. Store creation uses `{ "name", "email", "address", "ownerId" }`. Password changes use `{ "currentPassword", "newPassword" }`.

## Verification

```powershell
npm test
npm run build
```

Integration tests execute the real SQL schema against isolated in-memory PostgreSQL (PGlite), exercise Express over HTTP, and cover role restrictions, validation, duplicate emails, store assignment, rating updates/averages, filters, password/session invalidation and cross-origin rejection. PostgreSQL server deployment should additionally be smoke-tested against your configured `DATABASE_URL`.

## Source layout

`src/` React UI and responsive styles; `server/` Express API, validation, schema, database adapter and seed; `tests/` API integration tests. No credentials need to be committed. This challenge implementation returns complete filtered listings; a large production directory should add pagination.
