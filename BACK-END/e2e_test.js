const http = require("http");
const { randomUUID } = require("crypto");

const base = "http://localhost:5050";
let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log("PASS", name);
  } else {
    failed++;
    console.log("FAIL", name, "--", detail || "");
  }
}

function parse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return { raw: body };
  }
}

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    };
    if (token) headers.Authorization = "Bearer " + token;

    const requestUrl = new URL(base + path);
    const request = http.request(requestUrl, { method, headers }, response => {
      let responseBody = "";
      response.on("data", chunk => { responseBody += chunk; });
      response.on("end", () => resolve({
        status: response.statusCode,
        body: parse(responseBody)
      }));
    });
    request.on("error", reject);
    if (payload) request.write(payload);
    request.end();
  });
}

const get = (path, token) => request("GET", path, null, token);
const post = (path, body, token) => request("POST", path, body, token);
const put = (path, body, token) => request("PUT", path, body, token);
const del = (path, token) => request("DELETE", path, null, token);

(async () => {
  const email = `e2e_${randomUUID().slice(0, 8)}@example.com`;
  const health = await get("/api/health");
  check("GET /api/health -> 200 success",
    health.status === 200 && health.body.success === true,
    JSON.stringify(health));

  const registration = await post("/api/auth/register", {
    name: "E2E User",
    email,
    password: "password123"
  });
  check("POST /api/auth/register -> token + user",
    registration.status === 201 && registration.body.success &&
    registration.body.token && registration.body.user,
    JSON.stringify(registration));
  const token = registration.body.token;

  const login = await post("/api/auth/login", { email, password: "password123" });
  check("POST /api/auth/login -> token",
    login.status === 200 && login.body.success && login.body.token,
    JSON.stringify(login));

  const me = await get("/api/auth/me", token);
  check("GET /api/auth/me -> email matches",
    me.status === 200 && me.body.success && me.body.user.email === email,
    JSON.stringify(me));

  const unauthenticated = await post("/api/blogs", {
    title: "x", category: "Personal", excerpt: "x", content: "x"
  });
  check("POST /api/blogs without token -> 401",
    unauthenticated.status === 401, JSON.stringify(unauthenticated));

  const blog = await post("/api/blogs", {
    title: "E2E Story",
    category: "College Life",
    cover: "",
    excerpt: "A preview",
    content: "Full content here.",
    status: "published"
  }, token);
  check("POST /api/blogs -> created",
    blog.status === 201 && blog.body.success && blog.body.blog.id,
    JSON.stringify(blog));
  const blogId = blog.body.blog.id;

  const list = await get("/api/blogs");
  check("GET /api/blogs -> published content is hidden",
    list.status === 200 && list.body.success &&
    list.body.blogs.every(item => item.content === undefined),
    JSON.stringify(list));

  const mine = await get("/api/blogs/mine", token);
  check("GET /api/blogs/mine -> content included",
    mine.status === 200 && mine.body.success &&
    mine.body.blogs.some(item => item.id === blogId &&
      item.content === "Full content here."),
    JSON.stringify(mine));

  const update = await put(`/api/blogs/${encodeURIComponent(blogId)}`, {
    title: "E2E Story",
    category: "College Life",
    cover: "",
    excerpt: "A preview",
    content: "Full content here.",
    status: "draft"
  }, token);
  check("PUT /api/blogs/:id -> draft",
    update.status === 200 && update.body.success &&
    update.body.blog.status === "draft", JSON.stringify(update));

  const deletion = await del(`/api/blogs/${encodeURIComponent(blogId)}`, token);
  check("DELETE /api/blogs/:id -> success",
    deletion.status === 200 && deletion.body.success, JSON.stringify(deletion));

  const index = await get("/index.html");
  check("GET /index.html -> rendered",
    index.status === 200 && String(index.body.raw || "").includes("InkSpace"), "index");

  const api = await get("/api.js");
  check("GET /api.js -> API helper",
    api.status === 200 && String(api.body.raw || "").includes("InkSpaceAPI"), "api.js");

  console.log(`\n==== ${passed} passed, ${failed} failed ====`);
  process.exit(failed ? 1 : 0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
