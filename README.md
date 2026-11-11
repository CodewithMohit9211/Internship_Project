# InkSpace

InkSpace is a full-stack blogging application. Users can create accounts,
write stories, save drafts, publish posts, and manage their own writing from a
dashboard.

The project is built for learning and internship practice. The Express server
serves both the frontend and backend, so the complete application runs from one
Node.js process.

## Features

- User registration and JWT login
- Protected user dashboard
- Create, edit, publish, unpublish, and delete stories
- Save stories as drafts
- Category selection and optional cover image
- Public search and category filtering
- Writing statistics for total stories, published stories, and drafts
- Supabase database storage

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express.js
- JWT authentication
- bcryptjs password hashing
- Supabase database storage

## Project structure

```text
Internship_Project/
├── FRONT-END/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── script.js
│   └── style.css
├── BACK-END/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── supabase-schema.sql
│   └── src/
│       ├── routes/
│       ├── middleware/
│       ├── dataStore.js
│       └── dataBlogStore.js
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm

MongoDB is not required. Run `BACK-END/supabase-schema.sql` in the Supabase
SQL Editor before starting the backend. Configure the Supabase Project URL and
backend-only Service Role Key in `BACK-END/.env`.

## Setup and run

Open PowerShell or a terminal and run:

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
npm install
Copy-Item .env.example .env
npm run dev
```

If you are using Command Prompt instead of PowerShell, copy the environment
file with:

```bat
copy .env.example .env
```

Open the application in your browser:

```text
http://localhost:5051
```

The same Express server provides the API:

```text
http://localhost:5051/api
```

No separate Live Server, Python server, or frontend command is required.

Open the application through `http://localhost:5051`, not by double-clicking
an HTML file. If the frontend is opened with `file://` or Live Server on port
`5500`, it will still try to connect to the backend at `http://localhost:5051`.

To confirm the backend is running:

```powershell
Invoke-RestMethod http://localhost:5051/api/health
```

If the API reports that `public.users` or `public.blogs` is missing, open the
Supabase SQL Editor for the project in `SUPABASE_URL` and run the complete
`BACK-END/supabase-schema.sql` file. The backend also requires the
backend-only `SUPABASE_SERVICE_ROLE_KEY`; never expose it in frontend code.

## Environment configuration

The `.env` file should contain:

```env
PORT=5051
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5051
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-backend-only-secret
# Or, for newer Supabase projects:
# SUPABASE_SECRET_KEY=your-backend-only-secret
```

Use a long, private value for `JWT_SECRET`. Do not commit `.env`, service-role
keys, JWT secrets, `node_modules`, or log files to source control. The project
`.gitignore` already excludes these files while keeping `.env.example`.
`JWT_SECRET` must be configured separately from the Supabase key.

The backend uses the Supabase Service Role or Secret Key only on the server. It
is never needed in frontend files and must never be exposed to browsers.

## API endpoints

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Check that the server is running |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in and receive a JWT |
| GET | `/api/auth/me` | Bearer token | Get the current user |
| GET | `/api/blogs` | No | List published stories |
| GET | `/api/blogs/:id` | No | View one published story |
| GET | `/api/blogs/mine` | Bearer token | List the current user's stories |
| POST | `/api/blogs` | Bearer token | Create a story |
| PUT | `/api/blogs/:id` | Bearer token | Update an owned story |
| DELETE | `/api/blogs/:id` | Bearer token | Delete an owned story |

Public stories support these query parameters:

```text
/api/blogs?search=college&category=College%20Life
```

Search checks the story title, introduction, full content, category, and
author. Published story cards link to their individual detail page.

## Validation

Check JavaScript syntax without starting the server:

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
node --check server.js
node --check src\routes\authRoutes.js
node --check src\routes\blogRoutes.js
cd ..\FRONT-END
node --check script.js
```

With valid Supabase settings and the backend running, execute the end-to-end
checks:

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
node e2e_test.js
```

The test checks health, registration, login, authentication, blog CRUD,
content filtering, and frontend serving.

## Common terminal problems

### Port already in use

If you see `EADDRINUSE`, the application is already running or another
program is using port `5051`. First open:

```text
http://localhost:5051
```

To stop the process using port `5051` in PowerShell:

```powershell
$processId = (Get-NetTCPConnection -LocalPort 5051 -State Listen).OwningProcess
Stop-Process -Id $processId -Force
```

You can also stop the server directly by pressing `Ctrl + C` in its terminal.

## Hinglish guide

### InkSpace kya hai?

InkSpace ek full-stack blogging application hai. Isme user account bana
sakta hai, login kar sakta hai, stories likh sakta hai, draft save kar sakta
hai aur published stories ko manage kar sakta hai.

Frontend aur backend dono Express server se run hote hain. Isliye alag se
Live Server ya Python server chalane ki zaroorat nahi hai.

### Run karne ke steps

PowerShell mein ye commands chalao:

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
npm install
Copy-Item .env.example .env
npm run dev
```

Phir browser mein open karo:

```text
http://localhost:5051
```

### Important points

- Backend aur frontend ek hi port `5051` par run hote hain.
- API ka address `http://localhost:5051/api` hai.
- User aur blog data Supabase database mein save hota hai.
- `.env` file, secrets, `node_modules`, aur log files GitHub par upload nahi
  karne chahiye. Ye files `.gitignore` mein already excluded hain.
- Agar `EADDRINUSE` error aaye, to pehle se chal rahe server ko `Ctrl + C`
  se stop karo ya port `5051` ko PowerShell command se free karo.
- Data reset karne ke liye `users.json` aur `blogs.json` mein `[]` save karo.

## Production note

Production deployment ke liye HTTPS, secure secret management, rate limiting,
stronger validation, and proper logging should be added.
