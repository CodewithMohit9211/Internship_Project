
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
    const parsed = JSON.parse(contents);
    const blogs = Array.isArray(parsed) ? parsed : [parsed];

    if (blogs.some(blog => !blog || typeof blog !== "object" || Array.isArray(blog))) {
      throw new Error("blogs.json must contain blog objects");
    }

    if (!Array.isArray(parsed)) {
      writeBlogs(blogs);
    }

    return blogs;
  } catch (error) {
    throw new Error(`Unable to read blogs data from ${blogsFile}: ${error.message}`);
  }
}

function writeBlogs(blogs) {
  const normalizedBlogs = Array.isArray(blogs) ? blogs : [blogs];
  const tempFile = `${blogsFile}.tmp`;
  fs.writeFileSync(
    tempFile,
    JSON.stringify(normalizedBlogs, null, 2) + "\n",
    "utf8"
  );
  fs.renameSync(tempFile, blogsFile);
}

module.exports = { readBlogs, writeBlogs };