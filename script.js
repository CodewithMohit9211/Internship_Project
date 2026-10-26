
const KEYS = {
  users: "inkspace_users",
  posts: "inkspace_posts",
  session: "inkspace_session"
};

const $ = id => document.getElementById(id);

const read = key => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const write = (key, data) =>
  localStorage.setItem(key, JSON.stringify(data));

const users = () => read(KEYS.users);
const posts = () => read(KEYS.posts);

function currentUser() {
  const session = read(KEYS.session);
  if (!session.email) return null;
  return users().find(user => user.email === session.email) || null;
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

function makeId() {
  return crypto.randomUUID();
}

// Shared header and footer
function setupLayout() {
  const user = currentUser();

  $("site-header").innerHTML = `
    <header class="site-header">
      <nav class="nav container">
        <a class="brand" href="index.html">ink<span>space.</span></a>
        <div class="nav-links">
          <a href="index.html">Home</a>
          ${user ? `
            <a href="dashboard.html">My stories</a>
            <a href="create-blog.html">Write</a>
            <button id="logout-btn" class="btn btn-outline">Log out</button>
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
    localStorage.removeItem(KEYS.session);
    location.href = "index.html";
  });
}

// Registration
function register() {
  $("register-form").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("name").value.trim();
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;

    if (name.length < 2) {
      return showMessage("Please enter your full name.");
    }

    if (password.length < 8) {
      return showMessage("Your password needs at least 8 characters.");
    }

    if (password !== $("confirm-password").value) {
      return showMessage("The passwords don't match. Try again.");
    }

    const allUsers = users();

    if (allUsers.some(user => user.email === email)) {
      return showMessage("This email already has an account. Try logging in.");
    }

    allUsers.push({
      id: makeId(),
      name,
      email,
      password
    });

    write(KEYS.users, allUsers);
    write(KEYS.session, { email });

    location.href = "dashboard.html";
  });
}

// Login
function login() {
  $("login-form").addEventListener("submit", event => {
    event.preventDefault();

    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;

    const user = users().find(item =>
      item.email === email && item.password === password
    );

    if (!user) {
      return showMessage("Email or password isn't correct. Please try again.");
    }

    write(KEYS.session, { email: user.email });
    location.href = "dashboard.html";
  });
}

// Home page: search and category filter
function showPosts() {
  const list = $("blog-list");

  function render() {
    const search = $("search-posts").value.toLowerCase().trim();
    const category = $("category-filter").value;

    const visiblePosts = posts()
      .filter(post => post.status === "published")
      .filter(post => category === "All" || post.category === category)
      .filter(post =>
        `${post.title} ${post.excerpt} ${post.category} ${post.author}`
          .toLowerCase().includes(search)
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

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
  }

  $("search-posts").addEventListener("input", render);
  $("category-filter").addEventListener("change", render);
  render();
}

// Dashboard: show and manage personal posts
function dashboard() {
  const user = currentUser();
  const list = $("dashboard-posts");

  $("welcome-message").textContent = `Hey, ${user.name}! Welcome back.`;

  function render() {
    const mine = posts().filter(post => post.authorEmail === user.email);
    const filter = $("dashboard-filter").value;

    $("stat-total").textContent = mine.length;
    $("stat-published").textContent =
      mine.filter(post => post.status === "published").length;
    $("stat-drafts").textContent =
      mine.filter(post => post.status === "draft").length;

    const visible = mine
      .filter(post => filter === "All" || post.status === filter)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    $("dashboard-empty").hidden = visible.length > 0;

    list.innerHTML = visible.map(post => `
      <article class="dashboard-post">
        <div>
          <h3>${escapeHTML(post.title)}</h3>
          <p>
            <span class="status ${post.status}">${post.status}</span>
            · ${escapeHTML(post.category)}
            · ${formatDate(post.updatedAt)}
          </p>
        </div>

        <div class="post-actions">
          <button class="btn btn-outline" data-action="edit"
            data-id="${escapeHTML(post.id)}">Edit</button>

          <button class="btn btn-outline" data-action="toggle"
            data-id="${escapeHTML(post.id)}">
            ${post.status === "published" ? "Unpublish" : "Publish"}
          </button>

          <button class="btn btn-outline" data-action="delete"
            data-id="${escapeHTML(post.id)}">Delete</button>
        </div>
      </article>
    `).join("");
  }

  $("dashboard-filter").addEventListener("change", render);

  list.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const allPosts = posts();
    const post = allPosts.find(item => item.id === button.dataset.id);

    if (!post || post.authorEmail !== user.email) return;

    if (button.dataset.action === "edit") {
      location.href = `create-blog.html?id=${encodeURIComponent(post.id)}`;
      return;
    }

    if (button.dataset.action === "delete") {
      if (!confirm("Delete this story? You won't be able to get it back.")) {
        return;
      }

      write(KEYS.posts, allPosts.filter(item => item.id !== post.id));
    }

    if (button.dataset.action === "toggle") {
      post.status = post.status === "published" ? "draft" : "published";
      post.updatedAt = new Date().toISOString();
      write(KEYS.posts, allPosts);
    }

    render();
  });

  render();
}

// Create and edit blog posts
function createBlog() {
  const user = currentUser();
  const form = $("blog-form");
  const params = new URLSearchParams(location.search);
  const editId = params.get("id");

  let oldPost = posts().find(post =>
    post.id === editId && post.authorEmail === user.email
  );

  if (editId && !oldPost) {
    alert("We couldn't find that story.");
    location.href = "dashboard.html";
    return;
  }

  if (oldPost) {
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

  function savePost(status) {
    if (!form.reportValidity()) return;

    const title = $("blog-title").value.trim();
    const category = $("blog-category").value;
    const cover = $("blog-cover").value.trim();
    const excerpt = $("blog-excerpt").value.trim();
    const content = $("blog-content").value.trim();

    if (!title || !excerpt || !content) {
      return showMessage("A title, introduction and story are needed.");
    }

    if (cover) {
      try {
        if (!["http:", "https:"].includes(new URL(cover).protocol)) {
          return showMessage("Please use an HTTP or HTTPS image URL.");
        }
      } catch {
        return showMessage("That image URL doesn't look right.");
      }
    }

    const allPosts = posts();
    const now = new Date().toISOString();

    const post = {
      id: oldPost ? oldPost.id : makeId(),
      title,
      category,
      cover,
      excerpt,
      content,
      author: user.name,
      authorEmail: user.email,
      status,
      createdAt: oldPost ? oldPost.createdAt : now,
      updatedAt: now
    };

    const index = allPosts.findIndex(item => item.id === post.id);

    if (index >= 0) {
      allPosts[index] = post;
    } else {
      allPosts.push(post);
    }

    write(KEYS.posts, allPosts);
    location.href = "dashboard.html";
  }

  $("save-draft").addEventListener("click", () => savePost("draft"));

  form.addEventListener("submit", event => {
    event.preventDefault();
    savePost("published");
  });
}

// Start the correct page
document.addEventListener("DOMContentLoaded", () => {
  setupLayout();

  const page = document.body.dataset.page;
  const user = currentUser();

  if (["dashboard", "create"].includes(page) && !user) {
    location.href = "login.html";
    return;
  }

  if (["login", "register"].includes(page) && user) {
    location.href = "dashboard.html";
    return;
  }

  if (page === "home") showPosts();
  if (page === "login") login();
  if (page === "register") register();
  if (page === "dashboard") dashboard();
  if (page === "create") createBlog();
});