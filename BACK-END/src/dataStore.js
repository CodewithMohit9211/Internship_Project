
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const usersFile = path.join(dataDir, "users.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]", "utf8");
}

function readUsers() {
  const contents = fs.readFileSync(usersFile, "utf8").trim();
  if (!contents) {
    writeUsers([]);
    return [];
  }

  try {
    const users = JSON.parse(contents);
    if (!Array.isArray(users)) {
      throw new Error("users.json must contain an array");
    }
    return users;
  } catch (error) {
    throw new Error(`Unable to read users data from ${usersFile}: ${error.message}`);
  }
}

function writeUsers(users) {
  const tempFile = `${usersFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(users, null, 2) + "\n", "utf8");
  fs.renameSync(tempFile, usersFile);
}

module.exports = { readUsers, writeUsers };