const categories = ["College Life", "Technology", "Personal", "Stories", "Lifestyle"];

const blogSchema = {
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: {
    type: String,
    required: true,
    enum: categories
  },
  cover: { type: String, default: "", trim: true, maxlength: 2048 },
  excerpt: { type: String, required: true, trim: true, maxlength: 250 },
  content: { type: String, required: true, trim: true },
  author: { type: String, required: true },
  authorEmail: { type: String, required: true, lowercase: true },
  authorId: { type: String, required: true },
  status: { type: String, enum: ["draft", "published"], default: "published" }
};

function createBlog(data) {
  return {
    id: null,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

module.exports = { blogSchema, categories, createBlog };
