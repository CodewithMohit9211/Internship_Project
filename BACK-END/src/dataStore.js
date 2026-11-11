
const { supabase, runQuery } = require("./supabaseClient");

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash
  };
}

async function findUsers() {
  const data = await runQuery(supabase
    .from("users")
    .select("id, name, email, password_hash"));
  return data.map(toUser);
}

async function findUserByEmail(email) {
  const data = await runQuery(supabase
    .from("users")
    .select("id, name, email, password_hash")
    .eq("email", email)
    .maybeSingle());
  return data ? toUser(data) : null;
}

async function findUserById(id) {
  const data = await runQuery(supabase
    .from("users")
    .select("id, name, email, password_hash")
    .eq("id", id)
    .maybeSingle());
  return data ? toUser(data) : null;
}

async function createUser(user) {
  const data = await runQuery(supabase
    .from("users")
    .insert({
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash
    })
    .select("id, name, email, password_hash")
    .single());
  return toUser(data);
}

module.exports = { findUsers, findUserByEmail, findUserById, createUser };