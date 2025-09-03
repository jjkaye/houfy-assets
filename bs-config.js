const path = require("path");

module.exports = {
  proxy: "http://localhost:8787",  // Worker handles HTML
  port: 3000,

  // 🔄 Watch for changes
  files: [
    "./public/**/*.css",   // rebuild/reload on CSS changes
    "./src/**/*.js"        // reload on raw JS source edits
  ],

  // 📂 Serve both built and source assets
  serveStatic: [
    "public",  // built assets (bundle + manifest.json)
    "src"      // raw source files
  ],

  // 🔗 Route for houfy.css (always from public)
  routes: {
    "/houfy.css": path.join(__dirname, "public/houfy.css")
  },

  // UX
  open: false,
  notify: true,
  ghostMode: false,

  // Socket tunneling for Cloudflare
  socket: {
    domain: "dev.skyforestgetaway.com:443"
  },

  // Logging
  logLevel: "info",
  logConnections: true,
  logFileChanges: true
};
