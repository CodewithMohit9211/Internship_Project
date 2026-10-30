# InkSpace Backend

A Node.js + Express REST API that stores users and blogs in JSON files and also serves the frontend.

## Requirements
- Node.js 18+
- No MongoDB is required. Data is persisted to `data/users.json` and
  `data/blogs.json` (created automatically on first run).

## Project layout
```
inkspace1/
├── package.json          # root project; `npm start` runs the Express server
├── backend/
│   ├── server.js         # Express server: API + static frontend serving + client routing
│   ├── src/
│   │   ├── routes/       # authRoutes.js, blogRoutes.js
│   │   ├── middleware/   # auth.js (JWT guard)
│   │   ├── dataStore.js  # JSON file store for users
│   │   ├── dataBlogStore.js  # JSON file store for blogs
│   │   └── .env          # local config (NOT committed)
│   ├── data/             # users.json / blogs.json (created at runtime)
│   └── node_modules/
└── frontend/             # static assets served by the backend
    ├── index.html, login.html, register.html, dashboard.html, create-blog.html
    ├── api.js            # InkSpaceAPI helper
    ├── script.js         # page handlers using the API
    ├── style.css
    └── README.md
```

## Setup
1. Open a terminal in `BACK-END` and run `npm install`.
2. Copy `.env.example` to `.env` and set `JWT_SECRET` to a long random value.
3. Start the combined app:
   ```bash
   npm run dev
   ```
   The Express server listens on port 5050 and serves both the REST API at
   `http://localhost:5050/api/*` and the frontend at
   `http://localhost:5050/`.

## API endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Log in and receive JWT |
| GET | `/api/auth/me` | Bearer token | Current user |
| GET | `/api/blogs` | No | Published blogs; supports `search` and `category` query |
| GET | `/api/blogs/mine` | Bearer token | Current user's blogs and drafts |
| POST | `/api/blogs` | Bearer token | Create a blog |
| PUT | `/api/blogs/:id` | Bearer token | Edit own blog |
| DELETE | `/api/blogs/:id` | Bearer token | Delete own blog |

## Example request bodies

Register:
```json
{ "name": "Aisha Shaikh", "email": "aisha@example.com", "password": "strongpassword" }
```

Login:
```json
{ "email": "aisha@example.com", "password": "strongpassword" }
```

Create blog:
```json
{
  "title": "My College Story",
  "category": "College Life",
  "cover": "",
  "excerpt": "A short preview of my story.",
  "content": "The full blog content goes here.",
  "status": "published"
}
```

Send this header to protected endpoints:
`Authorization: Bearer YOUR_JWT_TOKEN`

## Frontend integration
The Express server serves the `../FRONT-END` folder directly. No separate
frontend server or Live Server session is required.
