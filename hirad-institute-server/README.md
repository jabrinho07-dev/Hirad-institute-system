# Hirad Institute Server

API foundation for Hirad Institute. This includes configuration, security middleware, MongoDB, a health endpoint, and cookie-based authentication.

Email verification, password reset, refresh tokens, and administrative account creation are not implemented yet.

## Requirements

- Node.js 20 or newer
- A MongoDB Atlas cluster when you are ready to connect a database

The health endpoint can be checked without database credentials. Until `MONGODB_URI` connects successfully, the response reports the database as disconnected.

## Setup

From `hirad-institute-server`:

```powershell
Copy-Item .env.example .env
npm install
```

Edit `.env` on your machine. Do not commit `.env`.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port. Defaults to `5000` when omitted. |
| `MONGODB_URI` | MongoDB Atlas connection string. Required for a database connection, not for the health endpoint. |
| `CLIENT_URL` | Allowed browser origin for CORS. Required. |
| `NODE_ENV` | `development`, `production`, or `test`. |
| `JWT_ACCESS_SECRET` | Random secret for access tokens. Required. At least 32 characters. |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime, from `1m` to `60m`. Defaults to `15m`. |
| `AUTH_COOKIE_NAME` | HttpOnly access-token cookie name. Defaults to `hirad_access`. |
| `AUTH_COOKIE_SECURE` | `true` or `false`. Must be `true` in production. Use `false` only for local HTTP. |

## MongoDB Atlas

1. Create a project and cluster in MongoDB Atlas.
2. Create a database user and store the password in a password manager.
3. Under Network Access, allow only the IP addresses that should reach the cluster.
4. Choose Connect, then Drivers, and copy the connection string.
5. Replace the username, password, and database name.
6. Paste the result into `MONGODB_URI` in `.env` only.

If the password contains reserved characters such as `@`, `#`, or `/`, percent-encode them. Atlas will not be reported as connected until Mongoose reaches `readyState` 1.

## Authentication secret

Generate a secret and put it only in `.env`:

```powershell
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(48).toString('base64url'))"
```

The placeholder in `.env.example` is rejected at startup. Do not reuse a secret from documentation or source control.

## Authentication

Access tokens are short-lived JWTs stored in an HttpOnly `SameSite=Lax` cookie. A matching session is stored in MongoDB. Logout sets that session as revoked, so deleting the browser cookie is not treated as invalidation by itself.

The browser also receives a readable CSRF cookie named `<AUTH_COOKIE_NAME>_csrf`. State-changing auth requests must send:

- `X-Hirad-Request: 1`
- `X-CSRF-Token` with the token returned at login or registration, for logout and profile updates

Public registration accepts only `student` and `member`. Privileged roles cannot be chosen by the client.

`emailVerified` is stored, but verification email is not sent. Disabled accounts cannot sign in or use protected routes. There is no password-reset flow and no refresh token yet; the user signs in again after the access token expires.

## Scripts

Development:

```powershell
npm run dev
```

Production:

```powershell
npm start
```

Tests:

```powershell
npm test
```

Health check:

```powershell
Invoke-RestMethod http://localhost:5000/api/v1/health
```

`GET /api/v1/health` returns `success`, `message`, `server`, `database`, and `timestamp`. The `database` field is the current Mongoose connection state.

## Administration

`super_admin` and `admin` accounts can call `/api/v1/admin`. Every route requires the access cookie. `PATCH` and `DELETE` also require `X-Hirad-Request: 1` and `X-CSRF-Token`.

Disabled accounts are reported as inactive. An admin cannot manage `admin` or `super_admin` accounts, assign those roles, change their own role or status, or delete themselves. The last active `super_admin` cannot be disabled, demoted, or deleted.

`GET /api/v1/admin/stats`

Returns total users, active users, inactive users, counts by role, student and member totals, and the five most recently registered users.

`GET /api/v1/admin/users?page=1&limit=20&search=amina&role=student&status=active`

`page` starts at 1. `limit` is 1 to 50. `status` is `active` or `disabled`.

`GET /api/v1/admin/users/:id`

`PATCH /api/v1/admin/users/:id/status`

```json
{ "accountStatus": "disabled" }
```

`PATCH /api/v1/admin/users/:id/role`

```json
{ "role": "instructor" }
```

`PATCH /api/v1/admin/users/:id`

```json
{ "fullName": "Amina Yusuf", "email": "amina@example.com" }
```

`DELETE /api/v1/admin/users/:id`

Responses use `success` and `message`. User objects never include `passwordHash`.
