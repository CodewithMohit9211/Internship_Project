
const express = require("express");
const { randomUUID } = require("crypto");
const { readBlogs, writeBlogs } = require("../dataBlogStore");
const auth = require("../middleware/auth");

const router = express.Router();

const categories = [
  "College Life",
  "Technology",
  "Personal",
  "Stories",
  "Lifestyle"
];

function validateBlog(body) {
  const title = String(body.title || "").trim();
  const category = String(body.category || "");
  const cover = String(body.cover || "").trim();
  const excerpt = String(body.excerpt || "").trim();
  const content = String(body.content || "").trim();
  const status = body.status === "draft" ? "draft" : "published";

  if (!title || title.length > 120) {
    return { error: "Title is required and must be at most 120 characters." };
  }

  if (!categories.includes(category)) {
    return { error: "Choose a valid category." };
  }

  if (!excerpt || excerpt.length > 250) {
    return { error: "Introduction is required and must be at most 250 characters." };
  }

  if (!content) {
    return { error: "Story content is required." };
  }

  if (cover) {
    try {
      if (!["http:", "https:"].includes(new URL(cover).protocol)) {
        throw new Error();
      }
    } catch {
      return { error: "Cover must be a valid HTTP or HTTPS URL." };
    }
  }

  return {
    value: { title, category, cover, excerpt, content, status }
  };
}

// Public: published blogs, with optional search and category filters
router.get("/", (req, res, next) => {
  try {
    let blogs = readBlogs().filter(blog => blog.status === "published");

    if (req.query.category && req.query.category !== "All") {
      if (!categories.includes(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category."
        });
      }
      blogs = blogs.filter(blog => blog.category === req.query.category);
    }

    if (req.query.search) {
      const search = String(req.query.search).slice(0, 100).toLowerCase();

      blogs = blogs.filter(blog =>
        [blog.title, blog.excerpt, blog.category, blog.author]
          .some(value => String(value || "").toLowerCase().includes(search))
      );
    }

    blogs.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Hide full story content from the public listing.
    const publicBlogs = blogs.map(({ content, ...blog }) => blog);

    res.json({
      success: true,
      count: publicBlogs.length,
      blogs: publicBlogs
    });
  } catch (error) {
    next(error);
  }
});

// Current user's blogs, including drafts
router.get("/mine", auth, (req, res, next) => {
  try {
    let blogs = readBlogs().filter(blog => blog.authorId === req.user.id);

    if (["draft", "published"].includes(req.query.status)) {
      blogs = blogs.filter(blog => blog.status === req.query.status);
    }

    blogs.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    next(error);
  }
});

// Create a blog
router.post("/", auth, (req, res, next) => {
  try {
    const result = validateBlog(req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    const now = new Date().toISOString();

    const blog = {
      id: randomUUID(),
      ...result.value,
      author: req.user.name,
      authorEmail: req.user.email,
      authorId: req.user.id,
      createdAt: now,
      updatedAt: now
    };

    const blogs = readBlogs();
    blogs.push(blog);
    writeBlogs(blogs);

    res.status(201).json({
      success: true,
      message: "Story saved successfully.",
      blog
    });
  } catch (error) {
    next(error);
  }
});

// Edit your own blog
router.put("/:id", auth, (req, res, next) => {
  try {
    const result = validateBlog(req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    const blogs = readBlogs();
    const index = blogs.findIndex(
      blog => blog.id === req.params.id && blog.authorId === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Story not found."
      });
    }

    blogs[index] = {
      ...blogs[index],
      ...result.value,
      updatedAt: new Date().toISOString()
    };

    writeBlogs(blogs);

    res.json({
      success: true,
      message: "Story updated successfully.",
      blog: blogs[index]
    });
  } catch (error) {
    next(error);
  }
});

// Delete your own blog
router.delete("/:id", auth, (req, res, next) => {
  try {
    const blogs = readBlogs();
    const index = blogs.findIndex(
      blog => blog.id === req.params.id && blog.authorId === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Story not found."
      });
    }

    blogs.splice(index, 1);
    writeBlogs(blogs);

    res.json({
      success: true,
      message: "Story deleted successfully."
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;