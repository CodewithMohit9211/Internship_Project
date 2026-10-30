
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const blogsFile = path.join(dataDir, "blogs.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(blogsFile)) {
  fs.writeFileSync(blogsFile, "[]", "utf8");
}

function readBlogs() {
  const contents = fs.readFileSync(blogsFile, "utf8").trim();
  if (!contents) {
    writeBlogs([]);
    return [];
  }

  try {
    const blogs = JSON.parse(contents);
    if (!Array.isArray(blogs)) {
      throw new Error("blogs.json must contain an array");
    }
    return blogs;
  } catch (error) {
    throw new Error(`Unable to read blogs data from ${blogsFile}: ${error.message}`);
  }
}

function writeBlogs(blogs) {
  const tempFile = `${blogsFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(blogs, null, 2) + "\n", "utf8");
  fs.renameSync(tempFile, blogsFile);
}

module.exports = { readBlogs, writeBlogs };