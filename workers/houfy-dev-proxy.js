export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);

    // Rewrite to Houfy, preserve path + query
    const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, "https://skyforestgetaway.houfy.com");

    try {
      const upstreamResp = await fetch(upstreamUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Dev Proxy)",
          "Accept": "text/html,application/xhtml+xml"
        }
      });

      const contentType = upstreamResp.headers.get("content-type") || "";

      // If not HTML → return as-is
      if (!contentType.includes("text/html")) {
        return upstreamResp;
      }

      let body = await upstreamResp.text();

      // Inject CSS + Fonts
      const cssAndFonts = `
<!-- Dev Worker Injection -->
<link rel="stylesheet" href="/houfy.css">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
`;
      body = body.replace(/<\/head>/i, `${cssAndFonts}\n</head>`);

      // 🔑 Rewrite Houfy links → dev.skyforestgetaway.com
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
}
