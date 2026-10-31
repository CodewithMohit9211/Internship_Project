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
- JSON file storage for local development

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express.js
- JWT authentication
- bcryptjs password hashing
- JSON file storage

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
│   ├── data/
│   │   ├── users.json
│   │   └── blogs.json
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

MongoDB is not required. The backend creates `BACK-END/data/users.json` and
`BACK-END/data/blogs.json` automatically.

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
http://localhost:5050
```

The same Express server provides the API:

```text
http://localhost:5050/api
```

No separate Live Server, Python server, or frontend command is required.

## Environment configuration

The `.env` file should contain:

```env
PORT=5050
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5050
```

Use a long, private value for `JWT_SECRET`. Do not commit real secrets to
source control.

## API endpoints

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Check that the server is running |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in and receive a JWT |
| GET | `/api/auth/me` | Bearer token | Get the current user |
| GET | `/api/blogs` | No | List published stories |
| GET | `/api/blogs/mine` | Bearer token | List the current user's stories |
| POST | `/api/blogs` | Bearer token | Create a story |
| PUT | `/api/blogs/:id` | Bearer token | Update an owned story |
| DELETE | `/api/blogs/:id` | Bearer token | Delete an owned story |

Public stories support these query parameters:

```text
/api/blogs?search=college&category=College%20Life
```

## Common terminal problems

### Port already in use

If you see `EADDRINUSE`, the application is already running or another
program is using port `5050`. First open:

```text
http://localhost:5050
```

To stop the process using port `5050` in PowerShell:

```powershell
$processId = (Get-NetTCPConnection -LocalPort 5050 -State Listen).OwningProcess
Stop-Process -Id $processId -Force
```

You can also stop the server directly by pressing `Ctrl + C` in its terminal.

### Reset local data

The following commands permanently remove all local accounts and stories while
keeping the JSON files:

```powershell
Set-Content .\data\users.json -Value '[]'
Set-Content .\data\blogs.json -Value '[]'
```

Run these commands from the `BACK-END` folder.

## Validation

With the backend running, execute:

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
node e2e_test.js
```

The test checks health, registration, login, authentication, blog CRUD, public
content filtering, and frontend serving.

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
http://localhost:5050
```

### Important points

- Backend aur frontend ek hi port `5050` par run hote hain.
- API ka address `http://localhost:5050/api` hai.
- User aur blog data `BACK-END/data` folder mein save hota hai.
- Agar `EADDRINUSE` error aaye, to pehle se chal rahe server ko `Ctrl + C`
  se stop karo ya port `5050` ko PowerShell command se free karo.
- Data reset karne ke liye `users.json` aur `blogs.json` mein `[]` save karo.

## Production note

JSON storage local learning ke liye suitable hai. Production deployment ke liye
database, HTTPS, secure secret management, validation hardening, and proper
logging should be added.
