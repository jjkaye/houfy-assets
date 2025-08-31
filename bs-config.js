const path = require("path");

module.exports = {
  proxy: "http://localhost:8787",   // Worker handles HTML
  port: 3000,
  files: ["./public/**/*.css"],     // Watch all CSS in /public
  serveStatic: ["public"],          // Serve everything in /public as static
  routes: {
    "/houfy.css": path.join(__dirname, "public/houfy.css")
  },
  open: false,
  notify: true,
  ghostMode: false,
  socket: {
    domain: "dev.skyforestgetaway.com:443"
  },
  logLevel: "info",
  logConnections: true,
  logFileChanges: true
};
