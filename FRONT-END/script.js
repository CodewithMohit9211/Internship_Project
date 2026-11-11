const API_BASE = window.location.protocol === "file:" ||
  window.location.port === "5500"
  ? "http://localhost:5051/api"
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

function setFormBusy(form, busy) {
  form.querySelectorAll("button").forEach(button => {
    button.disabled = busy;
    button.setAttribute("aria-busy", String(busy));
  });
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

function setupTheme() {
  const savedTheme = localStorage.getItem("inkspace_theme");
  const theme = savedTheme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;

  const themeButton = $("theme-toggle");
  if (!themeButton) return;

  const updateThemeButton = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    themeButton.textContent = isDark ? "Light mode" : "Dark mode";
    themeButton.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeButton.setAttribute("aria-pressed", String(isDark));
  };

  themeButton.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark"
      ? "light"
      : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("inkspace_theme", nextTheme);
    updateThemeButton();
  });
  updateThemeButton();
}

function showHeaderSkeleton() {
  const header = $("site-header");
  if (!header) return;

  header.innerHTML = `
    <header class="site-header skeleton-header" aria-label="Loading navigation">
      <nav class="nav container" aria-busy="true">
        <span class="skeleton skeleton-brand"></span>
        <div class="skeleton-nav-links">
          <span class="skeleton skeleton-nav-link"></span>
          <span class="skeleton skeleton-nav-link"></span>
          <span class="skeleton skeleton-nav-button"></span>
        </div>
      </nav>
    </header>
  `;
}

function showStorySkeletons() {
  const list = $("blog-list");
  if (!list) return;

  list.setAttribute("aria-busy", "true");
  list.setAttribute("aria-label", "Loading stories");
  list.innerHTML = Array.from({ length: 6 }, () => `
    <article class="blog-card skeleton-card" aria-hidden="true">
      <div class="skeleton skeleton-cover"></div>
      <div class="blog-card-body">
        <div class="skeleton skeleton-category"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-description"></div>
        <div class="skeleton skeleton-description skeleton-description-short"></div>
        <div class="skeleton-author">
          <span class="skeleton skeleton-avatar"></span>
          <span class="skeleton skeleton-author-name"></span>
        </div>
      </div>
    </article>
  `).join("");
}

function setupScrollExperience() {
  const revealItems = document.querySelectorAll(".scroll-reveal");
  const decorativeItems = document.querySelectorAll("[data-parallax]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  revealItems.forEach(item => item.classList.add("is-visible"));

  if (reduceMotion) return;

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => {
    item.classList.remove("is-visible");
    revealObserver.observe(item);
  });

  const observeNewCards = () => {
    document.querySelectorAll(".blog-card:not(.scroll-reveal)").forEach(card => {
      card.classList.add("scroll-reveal");
      revealObserver.observe(card);
    });
  };

  observeNewCards();
  const cardObserver = new MutationObserver(observeNewCards);
  const blogList = $("blog-list");
  if (blogList) cardObserver.observe(blogList, { childList: true });

  let frameRequested = false;
  const updateParallax = () => {
    const scrollPosition = window.scrollY;
    decorativeItems.forEach(item => {
      const speed = Number(item.dataset.parallax) || 0;
      item.style.setProperty("--parallax-offset", `${scrollPosition * speed}px`);
    });
    frameRequested = false;
  };

  window.addEventListener("scroll", () => {
    if (!frameRequested) {
      frameRequested = true;
      window.requestAnimationFrame(updateParallax);
    }
  }, { passive: true });
  updateParallax();
}

function setupLayout(user) {
  const initials = user
    ? user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase()
    : "";

  $("site-header").innerHTML = `
    <header class="site-header">
      <nav class="nav container">
        <a class="brand" href="index.html">ink<span>space.</span></a>
        <div class="nav-links">
          <a href="index.html">Home</a>
          ${user ? `
            <a href="dashboard.html">My stories</a>
            <a href="create-blog.html">Write</a>
            <div class="profile" aria-label="Signed-in user">
              <a class="profile-link" href="dashboard.html">
                <span class="profile-avatar" aria-hidden="true">${escapeHTML(initials)}</span>
                <span class="profile-details">
                  <span class="profile-name">${escapeHTML(user.name)}</span>
                  <span class="profile-email">${escapeHTML(user.email)}</span>
                </span>
              </a>
            </div>
            <button id="logout-btn" class="btn btn-outline" type="button">Log out</button>
          ` : `
            <a href="login.html">Log in</a>
            <a href="register.html" class="btn btn-primary">Join us</a>
          `}
          <button id="theme-toggle" class="theme-toggle" type="button"
            aria-pressed="false">Dark mode</button>
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
  const form = $("register-form");
  const passwordInput = $("password");
  const confirmPasswordInput = $("confirm-password");
  const suggestButton = $("suggest-password");
  const copyButton = $("copy-password");
  const regenerateButton = $("regenerate-password");
  const toggleButton = $("toggle-password");
  const passwordStatus = $("password-status");

  function secureRandomInt(max) {
    if (!window.crypto?.getRandomValues) {
      throw new Error("Secure password suggestions are not supported in this browser.");
    }

    const values = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    do {
      window.crypto.getRandomValues(values);
    } while (values[0] >= limit);
    return values[0] % max;
  }

  function generatePassword() {
    const characterSets = [
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "abcdefghijklmnopqrstuvwxyz",
      "0123456789",
      "!@#$%^&*()-_=+[]{};:,.?"
    ];
    const allCharacters = characterSets.join("");
    const characters = characterSets.map(set => set[secureRandomInt(set.length)]);

    while (characters.length < 16) {
      characters.push(allCharacters[secureRandomInt(allCharacters.length)]);
    }

    for (let index = characters.length - 1; index > 0; index -= 1) {
      const swapIndex = secureRandomInt(index + 1);
      [characters[index], characters[swapIndex]] =
        [characters[swapIndex], characters[index]];
    }

    return characters.join("");
  }

  function suggestPassword() {
    try {
      const password = generatePassword();
      passwordInput.value = password;
      confirmPasswordInput.value = password;
      copyButton.disabled = false;
      regenerateButton.hidden = false;
      passwordStatus.textContent = "Strong password suggested. You can regenerate it anytime.";
    } catch (error) {
      passwordStatus.textContent = error.message;
    }
  }

  suggestButton.addEventListener("click", suggestPassword);
  regenerateButton.addEventListener("click", suggestPassword);

  toggleButton.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    toggleButton.textContent = isVisible ? "Show" : "Hide";
    toggleButton.setAttribute("aria-label", `${isVisible ? "Show" : "Hide"} password`);
    toggleButton.setAttribute("aria-pressed", String(!isVisible));
  });

  copyButton.addEventListener("click", async () => {
    if (!passwordInput.value) return;

    try {
      await navigator.clipboard.writeText(passwordInput.value);
      passwordStatus.textContent = "Password copied to your clipboard.";
    } catch {
      passwordStatus.textContent = "Could not copy the password. Please copy it manually.";
    }
  });

  form.addEventListener("submit", async event => {
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

    setFormBusy(form, true);

    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      localStorage.setItem("auth_token", data.token);
      location.href = "dashboard.html";
    } catch (error) {
      showMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setFormBusy(form, false);
    }
  });
}

function login() {
  const form = $("login-form");

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;

    setFormBusy(form, true);

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("auth_token", data.token);
      location.href = "dashboard.html";
    } catch (error) {
      showMessage(error.message || "Login failed. Please try again.");
    } finally {
      setFormBusy(form, false);
    }
  });
}

async function showPosts() {
  const list = $("blog-list");

  async function render() {
    showStorySkeletons();
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
            <h3><a href="blog.html?id=${encodeURIComponent(post.id)}">${escapeHTML(post.title)}</a></h3>
            <p>${escapeHTML(post.excerpt)}</p>
            <div class="blog-meta">
              <span>By ${escapeHTML(post.author)}</span>
              <span>${formatDate(post.updatedAt)}</span>
            </div>
          </div>
        </article>
      `).join("");
      list.removeAttribute("aria-busy");
      list.removeAttribute("aria-label");
    } catch (error) {
      list.innerHTML = "";
      list.removeAttribute("aria-busy");
      list.removeAttribute("aria-label");
      $("empty-state").hidden = false;
      showMessage(error.message || "Stories could not be loaded.");
    }
  }

  $("search-posts").addEventListener("input", render);
  $("category-filter").addEventListener("change", render);
  await render();
}

async function showBlog() {
  const article = $("blog-detail");
  const id = new URLSearchParams(location.search).get("id");

  if (!id) {
    article.innerHTML = "<p class=\"form-message\">That story could not be found.</p>";
    return;
  }

  try {
    const data = await api(`/blogs/${encodeURIComponent(id)}`);
    const post = data.blog;
    document.title = `${post.title} | InkSpace`;
    article.innerHTML = `
      <p class="eyebrow">${escapeHTML(post.category)}</p>
      <h1>${escapeHTML(post.title)}</h1>
      <div class="blog-detail-meta">
        <span>By ${escapeHTML(post.author)}</span>
        <span>${formatDate(post.updatedAt)}</span>
      </div>
      ${post.cover ? `
        <img class="blog-detail-cover" src="${escapeHTML(post.cover)}"
          alt="Cover for ${escapeHTML(post.title)}" onerror="this.hidden=true">
      ` : ""}
      <p class="blog-detail-excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="blog-content">${escapeHTML(post.content).replace(/\n/g, "<br>")}</div>
    `;
  } catch (error) {
    article.innerHTML = `<p class="form-message">${escapeHTML(error.message || "The story could not be loaded.")}</p>`;
  }
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

    setFormBusy(form, true);

    try {
      await api(editId ? `/blogs/${encodeURIComponent(editId)}` : "/blogs", {
        method: editId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      location.href = "dashboard.html";
    } catch (error) {
      showMessage(error.message || "The story could not be saved.");
    } finally {
      setFormBusy(form, false);
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
  showHeaderSkeleton();
  const user = await currentUser();
  setupLayout(user);
  setupTheme();

  if (["dashboard", "create"].includes(page) && !user) {
    location.href = "login.html";
    return;
  }

  if (["login", "register"].includes(page) && user) {
    location.href = "dashboard.html";
    return;
  }

  if (page === "home") {
    await showPosts();
    setupScrollExperience();
  }
  if (page === "blog") await showBlog();
  if (page === "login") login();
  if (page === "register") register();
  if (page === "dashboard") await dashboard(user);
  if (page === "create") await createBlog(user);
});
