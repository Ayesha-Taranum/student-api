const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory contacts
let contacts = [];

app.get("/", (req, res) => {
  res.send("Welcome to Contacts API 🚀 Use /contacts to manage contacts");
});


// POST /contacts → Add a new contact
app.post("/contacts", (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }
  if (!/^[0-9]+$/.test(phone)) {
    return res.status(400).json({ error: "Phone must contain only numbers" });
  }

  const newContact = { id: contacts.length + 1, name, phone };
  contacts.push(newContact);

  res.status(201).json(newContact);
});

// GET /contacts → Get all or search contacts
app.get("/contacts", (req, res) => {
  const search = req.query.search;

  if (search) {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(search.toLowerCase())
    );
    return res.json(filtered);
  }

  res.json(contacts);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
