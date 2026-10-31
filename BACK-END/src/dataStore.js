
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
    const parsed = JSON.parse(contents);
    const users = Array.isArray(parsed) ? parsed : [parsed];

    if (users.some(user => !user || typeof user !== "object" || Array.isArray(user))) {
      throw new Error("users.json must contain user objects");
    }

    if (!Array.isArray(parsed)) {
      writeUsers(users);
    }

    return users;
  } catch (error) {
    throw new Error(`Unable to read users data from ${usersFile}: ${error.message}`);
  }
}

function writeUsers(users) {
  const normalizedUsers = Array.isArray(users) ? users : [users];
  const tempFile = `${usersFile}.tmp`;
  fs.writeFileSync(
    tempFile,
    JSON.stringify(normalizedUsers, null, 2) + "\n",
    "utf8"
  );
  fs.renameSync(tempFile, usersFile);
}

module.exports = { readUsers, writeUsers };