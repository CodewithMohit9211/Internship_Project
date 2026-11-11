
const { supabase, runQuery } = require("./supabaseClient");

const blogColumns = [
  "id", "title", "category", "cover", "excerpt", "content", "status",
  "author", "author_email", "author_id", "created_at", "updated_at"
].join(", ");

function toBlog(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    cover: row.cover,
    excerpt: row.excerpt,
    content: row.content,
    status: row.status,
    author: row.author,
    authorEmail: row.author_email,
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function readBlogs() {
  return runQuery(supabase
    .from("blogs")
    .select(blogColumns)
    .order("updated_at", { ascending: false }))
    .then(data => data.map(toBlog));
}

async function readBlog(id) {
  const data = await runQuery(supabase
    .from("blogs")
    .select(blogColumns)
    .eq("id", id)
    .maybeSingle());
  return data ? toBlog(data) : null;
}

async function createBlog(blog) {
  const data = await runQuery(supabase
    .from("blogs")
    .insert({
      id: blog.id,
      title: blog.title,
      category: blog.category,
      cover: blog.cover,
      excerpt: blog.excerpt,
      content: blog.content,
      status: blog.status,
      author: blog.author,
      author_email: blog.authorEmail,
      author_id: blog.authorId,
      created_at: blog.createdAt,
      updated_at: blog.updatedAt
    })
    .select(blogColumns)
    .single());
  return toBlog(data);
}

async function updateBlog(id, authorId, values) {
  const data = await runQuery(supabase
    .from("blogs")
    .update({
      title: values.title,
      category: values.category,
      cover: values.cover,
      excerpt: values.excerpt,
      content: values.content,
      status: values.status,
      updated_at: values.updatedAt
    })
    .eq("id", id)
    .eq("author_id", authorId)
    .select(blogColumns)
    .maybeSingle());
  return data ? toBlog(data) : null;
}

async function deleteBlog(id, authorId) {
  const data = await runQuery(supabase
    .from("blogs")
    .delete()
    .eq("id", id)
    .eq("author_id", authorId)
    .select("id")
    .maybeSingle());
  return Boolean(data);
}

module.exports = { readBlogs, readBlog, createBlog, updateBlog, deleteBlog };