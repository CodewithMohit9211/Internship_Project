# InkSpace Backend

This folder contains the Node.js and Express.js application server for
InkSpace. It provides the REST API and serves the static frontend from
`../FRONT-END`.

## Start the application

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
npm install
Copy-Item .env.example .env
npm run dev
```

Open the full application at:

```text
http://localhost:5051
```

The API is available at:

```text
http://localhost:5051/api
```

There is no need to run a separate frontend server.

## Configuration

The `.env` file uses:

```env
PORT=5051
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5051
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-backend-only-secret
# New Supabase projects may use this name instead:
# SUPABASE_SECRET_KEY=your-backend-only-secret
```

The backend stores users and blogs in Supabase. Run `supabase-schema.sql` in
the Supabase SQL Editor before starting the server. Then enter your Project URL
and backend-only Service Role Key in `BACK-END/.env`. Do not put this key in
frontend files or commit it.

After starting the backend, verify the connection with:

```powershell
Invoke-RestMethod http://localhost:5051/api/health
```

If registration or blog requests report that `public.users` or `public.blogs`
does not exist, the schema has not been run in the correct Supabase project.
The backend-only `SUPABASE_SERVICE_ROLE_KEY` (or
`SUPABASE_SECRET_KEY`) is required because Row Level Security is enabled;
never put it in frontend files or commit it. `JWT_SECRET` is a separate long
random value used only to sign InkSpace login tokens; do not reuse a Supabase
key for it.
The repository `.gitignore` excludes `.env`, `node_modules`, logs, and common
local editor files. Keep real credentials only in your local `.env`.

Check JavaScript syntax before starting the server:

```powershell
node --check server.js
node --check src\routes\authRoutes.js
node --check src\routes\blogRoutes.js
node --check ..\FRONT-END\script.js
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Read the authenticated user |
| GET | `/api/blogs` | Read published blogs |
| GET | `/api/blogs/mine` | Read the authenticated user's blogs |
| POST | `/api/blogs` | Create a blog |
| PUT | `/api/blogs/:id` | Update an owned blog |
| DELETE | `/api/blogs/:id` | Delete an owned blog |

Protected endpoints require:

```text
Authorization: Bearer <jwt-token>
```

## Troubleshooting

If port `5051` is already in use, open the existing application at
`http://localhost:5051` or press `Ctrl + C` in the terminal running it.

To stop the port from PowerShell:

```powershell
$processId = (Get-NetTCPConnection -LocalPort 5051 -State Listen).OwningProcess
Stop-Process -Id $processId -Force
```

## Hinglish mein

Ye folder InkSpace ka Node.js aur Express.js backend hai. Ye API provide karta
hai, `../FRONT-END` folder ko directly serve karta hai, aur data Supabase mein
save karta hai.

### Run steps

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
npm install
Copy-Item .env.example .env
npm run dev
```

Browser mein ye address kholo:

```text
http://localhost:5051
```

Alag frontend server ki zaroorat nahi hai. Agar port busy ho, to existing
server use karo ya terminal mein `Ctrl + C` press karke server stop karo.
