import express from "express";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory posts store
let posts = [
  {
    id: uuidv4(),
    title: "Welcome to Inkwell",
    author: "The Editor",
    category: "Announcements",
    excerpt: "A place for thoughts, stories, and ideas worth sharing.",
    content:
      "Welcome to Inkwell — a minimal, beautiful space for your writing. This is a sample post to get you started. You can create new posts, edit existing ones, and delete what you no longer need.\n\nInkwell is built with Node.js, Express, and EJS. Posts live in memory for the duration of your session, so feel free to experiment without any permanent consequences.\n\nClick 'New Post' in the header to start writing your first story.",
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-01-15T10:00:00"),
  },
  {
    id: uuidv4(),
    title: "The Art of Slow Writing",
    author: "A. Wordsmith",
    category: "Craft",
    excerpt:
      "In a world that prizes speed, there is radical beauty in taking your time with words.",
    content:
      "There is a particular pleasure in writing slowly. Not lazily — slowly, deliberately, the way a craftsperson shapes wood or glass.\n\nWhen we rush, we reach for the first word that comes to mind. When we slow down, we find the right one.\n\nThis post is an invitation to pause. To reread. To delete three paragraphs and start again. The blank page is not your enemy; it is your collaborator.\n\nSlow writing is not about producing less. It is about producing better — sentences that surprise even their author, paragraphs that breathe.",
    createdAt: new Date("2024-01-20T14:30:00"),
    updatedAt: new Date("2024-01-20T14:30:00"),
  },
];

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Helper: format date
app.locals.formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

app.locals.formatDateShort = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// Home — list all posts
app.get("/", (req, res) => {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.render("index", { posts: sorted, title: "Inkwell" });
});

// New post form
app.get("/posts/new", (req, res) => {
  res.render("new", { title: "New Post — Inkwell" });
});

// Create post
app.post("/posts", (req, res) => {
  const { title, author, category, excerpt, content } = req.body;
  const now = new Date();
  const post = {
    id: uuidv4(),
    title: title.trim(),
    author: author.trim() || "Anonymous",
    category: category.trim() || "Uncategorized",
    excerpt:
      excerpt.trim() ||
      content.trim().substring(0, 120).replace(/\n/g, " ") + "…",
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(post);
  res.redirect("/");
});

// View single post
app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).render("404", { title: "Not Found" });
  res.render("post", { post, title: `${post.title} — Inkwell` });
});

// Edit form
app.get("/posts/:id/edit", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).render("404", { title: "Not Found" });
  res.render("edit", { post, title: `Edit — ${post.title}` });
});

// Update post
app.post("/posts/:id/update", (req, res) => {
  const index = posts.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).render("404", { title: "Not Found" });

  const { title, author, category, excerpt, content } = req.body;
  posts[index] = {
    ...posts[index],
    title: title.trim(),
    author: author.trim() || "Anonymous",
    category: category.trim() || "Uncategorized",
    excerpt:
      excerpt.trim() ||
      content.trim().substring(0, 120).replace(/\n/g, " ") + "…",
    content: content.trim(),
    updatedAt: new Date(),
  };
  res.redirect(`/posts/${req.params.id}`);
});

// Delete post
app.post("/posts/:id/delete", (req, res) => {
  posts = posts.filter((p) => p.id !== req.params.id);
  res.redirect("/");
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render("404", { title: "Not Found — Inkwell" });
});

app.listen(PORT, () => {
  console.log(`\n  ✦ Inkwell running at http://localhost:${PORT}\n`);
});
