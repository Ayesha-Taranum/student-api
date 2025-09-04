const express = require("express");
const validator = require("validator");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// In-memory storage
let students = [];
let idCounter = 1;

// --- Helper: Validation ---
function validateStudent(body, { partial = false } = {}) {
  const errors = [];

  let { name, email, age } = body;

  // Coerce types safely
  if (age !== undefined) {
    const parsed = Number(age);
    if (Number.isNaN(parsed)) errors.push("Age must be a number.");
    else age = parsed;
  }

  if (!partial) {
    if (!name || String(name).trim() === "") errors.push("Name is required.");
    if (!email || String(email).trim() === "") errors.push("Email is required.");
    if (age === undefined) errors.push("Age is required.");
  }

  if (email !== undefined && !validator.isEmail(String(email))) {
    errors.push("Invalid email format.");
  }
  if (age !== undefined && age < 10) {
    errors.push("Age must be at least 10.");
  }

  return { valid: errors.length === 0, errors, fixed: { name, email, age } };
}

// --- Routes ---

// POST /students → Add a student
app.post("/students", (req, res) => {
  const { valid, errors, fixed } = validateStudent(req.body, { partial: false });
  if (!valid) return res.status(400).json({ success: false, message: "Validation failed", errors });

  const newStudent = {
    id: idCounter++,
    name: fixed.name,
    email: fixed.email,
    age: fixed.age
  };
  students.push(newStudent);

  return res.status(201).json({
    success: true,
    message: "Student added successfully",
    data: newStudent
  });
});

// GET /students → List students
app.get("/students", (req, res) => {
  return res.json({ success: true, data: students });
});

// PUT /students/:id → Update student
app.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Student not found" });

  const { valid, errors, fixed } = validateStudent(req.body, { partial: true });
  if (!valid) return res.status(400).json({ success: false, message: "Validation failed", errors });

  const current = students[idx];
  students[idx] = {
    ...current,
    ...(fixed.name !== undefined ? { name: fixed.name } : {}),
    ...(fixed.email !== undefined ? { email: fixed.email } : {}),
    ...(fixed.age !== undefined ? { age: fixed.age } : {})
  };

  return res.json({
    success: true,
    message: "Student updated successfully",
    data: students[idx]
  });
});

// DELETE /students/:id → Remove student
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Student not found" });

  const removed = students.splice(idx, 1)[0];
  return res.json({ success: true, message: "Student deleted successfully", data: removed });
});

// Health check (optional)
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "student-api", endpoints: ["/students"] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
