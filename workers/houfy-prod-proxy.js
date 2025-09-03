export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ✅ Serve sitemap.xml from KV
    if (url.pathname === "/sitemap.xml") {
      const sitemap = await env.SITEMAP_KV_PROD.get("sitemap.xml");
      if (!sitemap) {
        return new Response("⚠️ Sitemap not found in KV", { status: 404 });
      }
      return new Response(sitemap.trim(), {
        status: 200,
        headers: {
          "content-type": "application/xml; charset=UTF-8",
        },
      });
    }

    // ✅ Serve robots.txt directly
    if (url.pathname === "/robots.txt") {
      const robots = `
User-agent: *
Allow: /

Sitemap: https://skyforestgetaway.com/sitemap.xml
      `.trim();

      return new Response(robots, {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=UTF-8",
        },
      });
    }

    // ✅ Otherwise proxy to Houfy
    url.hostname = "skyforestgetaway.houfy.com";

    const upstreamResp = await fetch(url.toString(), {
      headers: {
        ...Object.fromEntries(request.headers),
        "Host": "skyforestgetaway.com",
      },
    });

    const contentType = upstreamResp.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return upstreamResp;
    }

    let body = await upstreamResp.text();

    // 🔹 Rewrite Houfy subdomain → your domain (SEO critical)
    body = body.replace(/https:\/\/skyforestgetaway\.houfy\.com/gi, "https://skyforestgetaway.com");

    // 🔹 Inject CSS + Fonts
    const injection = `
<link rel="stylesheet" href="${env.CDN_URL}css/houfy.css">

<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script>console.log("✅ Prod Worker running — CSS + Fonts injected, URLs rewritten for SEO");</script>
    `;

    //<script src="${env.CDN_URL}/js/bundle.<hash>.js" defer></script>

    body = body.replace(/<\/head\s*>/i, `${injection}\n</head>`);

    return new Response(body, {
      status: upstreamResp.status,
      headers: {
        ...Object.fromEntries(upstreamResp.headers),
        "content-type": "text/html; charset=UTF-8",
      },
    });
  },
};
