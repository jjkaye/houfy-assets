// server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files from project root (houfy-assets/)
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Local dev server running at http://localhost:${PORT}`);
});
