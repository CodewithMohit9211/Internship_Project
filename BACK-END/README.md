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
http://localhost:5050
```

The API is available at:

```text
http://localhost:5050/api
```

There is no need to run a separate frontend server.

## Configuration

The `.env` file uses:

```env
PORT=5050
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5050
```

The backend stores local data in:

- `data/users.json`
- `data/blogs.json`

These files are created automatically when the application starts.

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

If port `5050` is already in use, open the existing application at
`http://localhost:5050` or press `Ctrl + C` in the terminal running it.

To stop the port from PowerShell:

```powershell
$processId = (Get-NetTCPConnection -LocalPort 5050 -State Listen).OwningProcess
Stop-Process -Id $processId -Force
```

To clear local development data:

```powershell
Set-Content .\data\users.json -Value '[]'
Set-Content .\data\blogs.json -Value '[]'
```

## Hinglish mein

Ye folder InkSpace ka Node.js aur Express.js backend hai. Ye API provide karta
hai aur `../FRONT-END` folder ko directly serve karta hai.

### Run steps

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
npm install
Copy-Item .env.example .env
npm run dev
```

Browser mein ye address kholo:

```text
http://localhost:5050
```

Alag frontend server ki zaroorat nahi hai. Agar port busy ho, to existing
server use karo ya terminal mein `Ctrl + C` press karke server stop karo.
