# InkSpace

### A small, friendly space for sharing big ideas

InkSpace is a simple blogging website where people can write down their thoughts,
share stories, and keep track of their writing. I built this project as part of
my internship to practise creating a complete, interactive web experience from
scratch.

The idea is straightforward: sometimes a thought is worth saving, and sometimes
it is worth sharing. InkSpace gives both kinds of thoughts a home.

## What you can do

- Create an account and log in
- Write and publish blog posts
- Save unfinished posts as drafts
- Add a category, short introduction, and optional cover image
- Search published stories by keyword
- Filter stories by category
- View, edit, publish, unpublish, or delete your own stories
- See your writing statistics from the dashboard

## Built with

- HTML5 for the page structure
- CSS3 for the responsive layout and visual design
- Vanilla JavaScript for the interactions and application logic
- Node.js, Express, JWT and JSON files for users, sessions and posts

## How to run it

1. Open a terminal in `BACK-END` and run `npm install`.
2. Copy `.env.example` to `.env` and set a long `JWT_SECRET`.
3. Start the combined frontend and API server with `npm start`
   (or `npm run dev`).
4. Open `http://localhost:5050`.

Express serves the `FRONT-END` folder and the API from the same origin. The
backend creates its `data/users.json` and `data/blogs.json` files automatically.

## A quick note

Authentication and blog data are handled by the Express backend. The JSON
storage is suitable for local learning and demonstration, but a database and
production secret management should be used before deployment.

---

## Hinglish mein

### InkSpace kya hai?

InkSpace ek simple aur friendly blogging website hai jahan aap apne thoughts,
stories aur experiences likh sakte ho. Ye project maine apni internship ke
dauraan banaya, taaki ek complete interactive website banane ki practice ho
aur front-end concepts ko achhe se samajh sakun.

Kabhi-kabhi koi thought bas save karne layak hota hai, aur kabhi use duniya ke
saath share karna achha lagta hai. InkSpace dono ke liye ek chhoti si jagah
provide karta hai.

## Isme kya kar sakte ho?

- Apna account bana kar login kar sakte ho
- Nayi stories ya blog posts likh sakte ho
- Adhoori stories ko draft ke roop mein save kar sakte ho
- Category, short introduction aur optional cover image add kar sakte ho
- Keywords se published stories search kar sakte ho
- Category ke hisaab se stories filter kar sakte ho
- Apni stories ko edit, publish, unpublish ya delete kar sakte ho
- Dashboard par apni writing statistics dekh sakte ho

## Kaise run karein?

1. Project ko download ya clone karo.
2. `Internship_Project` folder open karo.
3. `BACK-END` mein `npm install` chalao aur `.env.example` se `.env` banao.
4. `npm start` se backend chalao.
5. `FRONT-END` ko Live Server jaise static server se serve karke
   `http://127.0.0.1:5500/index.html` kholo.

Frontend backend API (`http://localhost:5050/api`) se connected hai. Backend
users aur blogs ko `BACK-END/data` mein JSON files mein save karta hai.

## Project ke baare mein ek important baat

Ye ab frontend aur backend dono ka learning project hai. Local JSON storage
development ke liye theek hai, lekin production ke liye database aur secure
secret management zaroori honge.
