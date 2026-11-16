# InkSpace

> **Write. Share. Inspire.**

InkSpace is a full-stack blogging platform where users can create an account,
write stories, save drafts, publish posts, and manage their content from a
personal dashboard.

Built with simple web technologies for learning, internship practice, and
real-world deployment.

## Live Preview

| App | Link |
|---|---|
| **InkSpace Website** | [Open Live Website](https://internship-project-sali.onrender.com) |
| **Backend API** | [Check API Health](https://internship-project-sali.onrender.com/api/health) |
| **Source Code** | [View on GitHub](https://github.com/CodewithMohit9211/Internship_Project) |

> **Hinglish:** Website live hai. Upar diye gaye buttons par click karke direct
> project open ya API status check kar sakte ho.

## Features

- User registration and secure JWT login
- Create, edit, publish, unpublish, and delete blogs
- Save stories as drafts
- Personal dashboard with writing statistics
- Public blog search and category filtering
- Optional cover image for every blog
- Supabase database integration
- Responsive frontend with vanilla HTML, CSS, and JavaScript

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Authentication | JWT and bcryptjs |
| Database | Supabase |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

## Project Structure

```text
Internship_Project/
├── FRONT-END/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── config.js
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

## Run Locally

### Requirements

- Node.js 18 or newer
- npm
- Supabase project

### Installation

```powershell
cd D:\College_Project_Files\Internship_Project\BACK-END
npm install
Copy-Item .env.example .env
npm start
```

Open the app at [http://localhost:5051](http://localhost:5051).

> **Hinglish:** Local development ke liye sirf backend start karo. Express
> server frontend aur API dono serve karta hai, isliye Live Server ki zaroorat
> nahi hai.

## Environment Variables

Add these values to `BACK-END/.env`:

```env
PORT=5051
SUPABASE_URL=your-supabase-project-url
SUPABASE_SECRET_KEY=your-backend-only-secret-key
JWT_SECRET=your-long-random-jwt-secret
CLIENT_ORIGIN=http://localhost:5051
```

Run `BACK-END/supabase-schema.sql` in the Supabase SQL Editor before using the
database features.

Never commit `.env`, Supabase secret keys, or JWT secrets. Backend secrets
must never be added to frontend files.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API status |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/auth/me` | Get the logged-in user |
| GET | `/api/blogs` | List published blogs |
| GET | `/api/blogs/:id` | View one published blog |
| GET | `/api/blogs/mine` | List the user's blogs |
| POST | `/api/blogs` | Create a blog |
| PUT | `/api/blogs/:id` | Update a blog |
| DELETE | `/api/blogs/:id` | Delete a blog |

## Deployment

### Render Backend

Create a Render Web Service with:

- **Root Directory:** `BACK-END`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Add `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `JWT_SECRET`,
`CLIENT_ORIGIN`, and `NODE_ENV=production` in Render environment variables.

### Netlify Frontend

Create a Netlify site with:

- **Base Directory:** `FRONT-END`
- **Publish Directory:** `.`

The deployed Render API URL is configured in
[`FRONT-END/config.js`](FRONT-END/config.js).

> **Hinglish:** Frontend Netlify par aur backend Render par host hai. Agar
> Render URL change ho, to `config.js` mein API URL update karke redeploy karo.

## Validation

Check JavaScript syntax:

```powershell
cd D:\College_Project_Files\Internship_Project
node --check FRONT-END\script.js
node --check FRONT-END\config.js
node --check BACK-END\server.js
```

Check the deployed backend:

```powershell
Invoke-RestMethod https://internship-project-sali.onrender.com/api/health
```

## License

This project is created for educational and internship practice.
