export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    // ✅ Only apply dev logic for dev.skyforestgetaway.com
    if (env.ENVIRONMENT !== "dev") {
      return fetch(request); // pass through untouched
    }

    // ✅ Serve manifest.json directly
    if (incomingUrl.pathname === "/manifest-dev.json") {
      return fetch("http://127.0.0.1:3000/js/manifest-dev.json", { headers: request.headers });
    }

    // Let BrowserSync serve static assets directly
    if (
      incomingUrl.pathname.startsWith("/css/") ||
      incomingUrl.pathname.startsWith("/js/") ||
      incomingUrl.pathname.startsWith("/src/") ||
      incomingUrl.pathname === "/houfy.css"
    ) {
      return fetch(`http://localhost:3000${incomingUrl.pathname}`, {
        headers: request.headers,
      });
    }

    // 🔁 Proxy Houfy HTML
    const upstreamUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      "https://skyforestgetaway.houfy.com"
    );

    try {
      const upstreamResp = await fetch(upstreamUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Dev Proxy)",
          "Accept": "text/html,application/xhtml+xml"
        }
      });

      const contentType = upstreamResp.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return upstreamResp;

      let body = await upstreamResp.text();

      // ✅ Fetch manifest.json and inject its scripts
      let scriptTags = "";
      try {
        const manifestResp = await fetch("http://127.0.0.1:3000/js/manifest-dev.json");
        const manifest = await manifestResp.json();
        scriptTags = manifest.scripts
          .map(file => `<script src="/js/${file}" defer></script>`)
          .join("\n");
      } catch (err) {
        scriptTags = "<!-- manifest.json load failed -->";
      }

      // Inject CSS, scripts, fonts
      const cssAndScripts = `
<!-- Dev Worker Injection -->
<link rel="stylesheet" href="/css/houfy.css">
${scriptTags}
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
`;

      body = body.replace(/<\/head>/i, `${cssAndScripts}\n</head>`);

      // Rewrite Houfy links → dev.skyforestgetaway.com
      body = body
        .replace(/https:\/\/skyforestgetaway\.houfy\.com/gi, "https://dev.skyforestgetaway.com")
        .replace(/https:\/\/skyforestgetaway\.com/gi, "https://dev.skyforestgetaway.com")
        .replace(/https:\/\/www\.skyforestgetaway\.com/gi, "https://dev.skyforestgetaway.com");

      return new Response(body, {
        status: upstreamResp.status,
        headers: { "content-type": "text/html; charset=UTF-8" }
      });
    } catch (err) {
      return new Response(`Fetch failed: ${err.message}`, { status: 502 });
    }
  }
};
