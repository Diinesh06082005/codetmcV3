# CodeTMC

CodeTMC is a MERN real-time code collaboration app with authenticated rooms, JWT-secured API access, protected Socket.IO connections, Monaco-powered editing, a refined glassmorphism workspace, and a protected developer dashboard for admins.

## Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express + Socket.IO
- Database: MongoDB + Mongoose
- Auth: JWT + httpOnly cookie sessions + bcryptjs
- Styling: Tailwind CSS + Framer Motion
- Editor: Monaco Editor

## What Changed

### Backend

- Added `User` and enhanced `Room` models with creator tracking and member references
- Added JWT auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Added admin-only analytics and user management routes:
  - `GET /api/admin/users`
  - `GET /api/admin/users/:id`
  - `DELETE /api/admin/users/:id`
  - `GET /api/admin/stats`
- Added protected room routes and authenticated socket handshakes
- Added admin roles, role-aware middleware, secure cookie persistence, and socket-backed activity tracking
- Added centralized error handling and Express rate limiting
- Added validator-based input validation and sanitization helpers
- Kept backend logic inside controllers, middleware, models, and socket modules

### Frontend

- Added dedicated login and register pages with animated glass cards and floating labels
- Added global auth state with Context API and localStorage persistence
- Added protected routes for dashboard, room pages, and the admin dashboard
- Switched API and socket auth to cookie-backed session persistence
- Refined the Control Center UI with denser account details and quick actions
- Added a dark, animated admin dashboard with stats cards, user detail views, and guarded delete flows
- Refreshed dashboard and room UI with a modern dark gradient theme
- Added richer room feedback including presence alerts, typing indicators, copy-room feedback, and loading skeletons

## Project Structure

```text
root/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- styles/
|   |   `-- utils/
|   |-- .env.example
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- sockets/
|   |-- utils/
|   `-- server.js
`-- package.json
```

## Environment Setup

Create these files before starting the app.

### `server/.env`

Use [`server/.env.example`](./server/.env.example) as the base:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/codetmc
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=20
SOCKET_RATE_LIMIT_MAX_EVENTS=80
AUTH_COOKIE_NAME=codetmc_session
AUTH_COOKIE_MAX_AGE_MS=604800000
ADMIN_USERNAME=admin_owner
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123
```

### `client/.env`

Use [`client/.env.example`](./client/.env.example) as the base:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Installation

Install dependencies from the project root:

```bash
npm install
```

## Development

Run the frontend and backend together:

```bash
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Authentication Flow

1. Register or log in from the frontend auth pages.
2. The server signs a JWT and stores it in an httpOnly cookie.
3. The client restores the session by calling `GET /api/auth/me` on boot and keeps only non-sensitive user metadata in localStorage.
4. API requests and Socket.IO connections automatically reuse the authenticated cookie.
5. Logout clears the cookie, resets the local session cache, and disconnects the socket session.

## Admin Setup

Create the initial admin account from environment variables:

```bash
npm run create-admin -w server
```

Before running it, set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `server/.env`. The script validates the values, hashes the password with bcrypt, and promotes or creates the matching account with `role=admin`.

## Key API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Rooms

- `POST /api/rooms`
- `GET /api/rooms/:roomId`
- `POST /api/rooms/:roomId/join`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/stats`

## Socket Events

Client emits:

- `join-room`
- `leave-room`
- `code-change`
- `chat-message`
- `typing`
- `sync-code`

Server emits:

- `room-users`
- `user-joined`
- `user-left`
- `code-change`
- `chat-message`
- `typing`
- `sync-code`

## Verification

Verified in this workspace:

- Backend syntax checks passed with `node --check`
- Frontend production build completed successfully with Vite
