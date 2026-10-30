const API_BASE = window.location.port === "5500"
  ? "http://localhost:5050/api"
  : "/api";

const $ = id => document.getElementById(id);

async function api(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  const token = localStorage.getItem("auth_token");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE + url, { ...options, headers });
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
    }

    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

async function currentUser() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  try {
    const data = await api("/auth/me");
    return data.user;
  } catch (error) {
    if (error.status !== 401) {
      console.error("Could not load the current user:", error);
    }
    return null;
  }
}

function showMessage(text) {
  const box = $("form-message");
  if (!box) return;
  box.textContent = text;
  box.hidden = false;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function setupLayout(user) {
  $("site-header").innerHTML = `
    <header class="site-header">
      <nav class="nav container">
        <a class="brand" href="index.html">ink<span>space.</span></a>
        <div class="nav-links">
          <a href="index.html">Home</a>
          ${user ? `
            <a href="dashboard.html">My stories</a>
            <a href="create-blog.html">Write</a>
            <button id="logout-btn" class="btn btn-outline" type="button">Log out</button>
          ` : `
            <a href="login.html">Log in</a>
            <a href="register.html" class="btn btn-primary">Join us</a>
          `}
        </div>
      </nav>
    </header>
  `;

  $("site-footer").innerHTML = `
    <footer class="site-footer">
      <p>InkSpace — a little space for big ideas.</p>
      <p>Made with care, one story at a time · © ${new Date().getFullYear()}</p>
    </footer>
  `;

  $("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("auth_token");
    location.href = "index.html";
  });
}

function register() {
  $("register-form").addEventListener("submit", async event => {
    event.preventDefault();

    const name = $("name").value.trim();
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;

    if (name.length < 2) {
      showMessage("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      showMessage("Your password needs at least 8 characters.");
      return;
    }

    if (password !== $("confirm-password").value) {
      showMessage("The passwords don't match. Try again.");
      return;
    }

    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      localStorage.setItem("auth_token", data.token);
      location.href = "dashboard.html";
    } catch (error) {
      showMessage(error.message || "Registration failed. Please try again.");
    }
  });
}

function login() {
  $("login-form").addEventListener("submit", async event => {
    event.preventDefault();

    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("auth_token", data.token);
      location.href = "dashboard.html";
    } catch (error) {
      showMessage(error.message || "Login failed. Please try again.");
    }
  });
}

async function showPosts() {
  const list = $("blog-list");

  async function render() {
    const search = $("search-posts").value.trim();
    const category = $("category-filter").value;
    const query = new URLSearchParams();

    if (search) query.set("search", search);
    if (category !== "All") query.set("category", category);

    try {
      const data = await api(`/blogs${query.toString() ? `?${query}` : ""}`);
      const visiblePosts = data.blogs || [];

      $("post-count").textContent =
        `${visiblePosts.length} ${visiblePosts.length === 1 ? "story" : "stories"}`;
      $("empty-state").hidden = visiblePosts.length > 0;
      list.innerHTML = visiblePosts.map(post => `
        <article class="blog-card">
          ${post.cover ? `
            <img class="blog-cover"
              src="${escapeHTML(post.cover)}"
              alt="Cover for ${escapeHTML(post.title)}"
              onerror="this.hidden=true">
          ` : `<div class="cover-placeholder">i.</div>`}
          <div class="blog-card-body">
            <span class="category">${escapeHTML(post.category)}</span>
            <h3>${escapeHTML(post.title)}</h3>
            <p>${escapeHTML(post.excerpt)}</p>
            <div class="blog-meta">
              <span>By ${escapeHTML(post.author)}</span>
              <span>${formatDate(post.updatedAt)}</span>
            </div>
          </div>
        </article>
      `).join("");
    } catch (error) {
      list.innerHTML = "";
      $("empty-state").hidden = false;
      showMessage(error.message || "Stories could not be loaded.");
    }
  }

  $("search-posts").addEventListener("input", render);
  $("category-filter").addEventListener("change", render);
  await render();
}

async function dashboard(user) {
  const list = $("dashboard-posts");
  let mine = [];

  $("welcome-message").textContent = `Hey, ${user.name}! Welcome back.`;

  async function render() {
    try {
      const data = await api("/blogs/mine");
      mine = data.blogs || [];
      const filter = $("dashboard-filter").value;

      $("stat-total").textContent = mine.length;
      $("stat-published").textContent =
        mine.filter(post => post.status === "published").length;
      $("stat-drafts").textContent =
        mine.filter(post => post.status === "draft").length;

      const visible = mine.filter(post =>
        filter === "All" || post.status === filter
      );

      $("dashboard-empty").hidden = visible.length > 0;
      list.innerHTML = visible.map(post => `
        <article class="dashboard-post">
          <div>
            <h3>${escapeHTML(post.title)}</h3>
            <p>
              <span class="status ${escapeHTML(post.status)}">${escapeHTML(post.status)}</span>
              · ${escapeHTML(post.category)}
              · ${formatDate(post.updatedAt)}
            </p>
          </div>
          <div class="post-actions">
            <button class="btn btn-outline" data-action="edit"
              data-id="${escapeHTML(post.id)}" type="button">Edit</button>
            <button class="btn btn-outline" data-action="toggle"
              data-id="${escapeHTML(post.id)}" type="button">
              ${post.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button class="btn btn-outline" data-action="delete"
              data-id="${escapeHTML(post.id)}" type="button">Delete</button>
          </div>
        </article>
      `).join("");
    } catch (error) {
      showMessage(error.message || "Your stories could not be loaded.");
    }
  }

  $("dashboard-filter").addEventListener("change", render);

  list.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const post = mine.find(item => item.id === button.dataset.id);
    if (!post) return;

    if (button.dataset.action === "edit") {
      location.href = `create-blog.html?id=${encodeURIComponent(post.id)}`;
      return;
    }

    try {
      if (button.dataset.action === "delete") {
        if (!confirm("Delete this story? You won't be able to get it back.")) {
          return;
        }
        await api(`/blogs/${encodeURIComponent(post.id)}`, { method: "DELETE" });
      } else if (button.dataset.action === "toggle") {
        await api(`/blogs/${encodeURIComponent(post.id)}`, {
          method: "PUT",
          body: JSON.stringify({ ...post, status: post.status === "published" ? "draft" : "published" })
        });
      }

      await render();
    } catch (error) {
      showMessage(error.message || "The story could not be updated.");
    }
  });

  await render();
}

async function createBlog(user) {
  const form = $("blog-form");
  const params = new URLSearchParams(location.search);
  const editId = params.get("id");
  let oldPost = null;

  if (editId) {
    try {
      const data = await api("/blogs/mine");
      oldPost = (data.blogs || []).find(post => post.id === editId);
    } catch (error) {
      showMessage(error.message || "The story could not be loaded.");
      return;
    }

    if (!oldPost) {
      alert("We couldn't find that story.");
      location.href = "dashboard.html";
      return;
    }

    $("editor-title").textContent = "Let's edit your story.";
    $("blog-title").value = oldPost.title;
    $("blog-category").value = oldPost.category;
    $("blog-cover").value = oldPost.cover || "";
    $("blog-excerpt").value = oldPost.excerpt;
    $("blog-content").value = oldPost.content;
  }

  function updateWordCount() {
    const text = $("blog-content").value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    $("word-count").textContent = `${count} words`;
  }

  $("blog-content").addEventListener("input", updateWordCount);
  updateWordCount();

  async function savePost(status) {
    if (!form.reportValidity()) return;

    const payload = {
      title: $("blog-title").value.trim(),
      category: $("blog-category").value,
      cover: $("blog-cover").value.trim(),
      excerpt: $("blog-excerpt").value.trim(),
      content: $("blog-content").value.trim(),
      status
    };

    if (!payload.title || !payload.excerpt || !payload.content) {
      showMessage("A title, introduction and story are needed.");
      return;
    }

    try {
      await api(editId ? `/blogs/${encodeURIComponent(editId)}` : "/blogs", {
        method: editId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      location.href = "dashboard.html";
    } catch (error) {
      showMessage(error.message || "The story could not be saved.");
    }
  }

  $("save-draft").addEventListener("click", () => savePost("draft"));
  form.addEventListener("submit", event => {
    event.preventDefault();
    savePost("published");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  const user = await currentUser();
  setupLayout(user);

  if (["dashboard", "create"].includes(page) && !user) {
    location.href = "login.html";
    return;
  }

  if (["login", "register"].includes(page) && user) {
    location.href = "dashboard.html";
    return;
  }

  if (page === "home") await showPosts();
  if (page === "login") login();
  if (page === "register") register();
  if (page === "dashboard") await dashboard(user);
  if (page === "create") await createBlog(user);
});
