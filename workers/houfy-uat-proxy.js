export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Guardrail — only allow UAT domain
    const hostHeader = request.headers.get("host");
    if (hostHeader !== "uat.skyforestgetaway.com") {
      return new Response("Forbidden: wrong domain", { status: 403 });
    }

    // Proxy everything → Houfy origin
    url.hostname = "skyforestgetaway.houfy.com";

    let upstreamResp;
    try {
      upstreamResp = await fetch(url.toString(), {
        headers: {
          ...Object.fromEntries(request.headers),
          "Host": "skyforestgetaway.com"
        }
      });
    } catch (err) {
      return new Response(`Upstream fetch failed: ${err.message}`, { status: 502 });
    }

    const contentType = upstreamResp.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      // passthrough for non-HTML (images, scripts, etc.)
      return upstreamResp;
    }

    // Read the HTML body
    let body;
    try {
      body = await upstreamResp.text();
    } catch (err) {
      return new Response(`Failed to read upstream HTML: ${err.message}`, { status: 500 });
    }

    let bundleName = "bundle.js"; // default fallback

    try {
      console.log("Fetching manifest from:", env.MANIFEST_URL);

      const manifestResp = await fetch(env.MANIFEST_URL, {
        cf: { cacheTtl: 0, cacheEverything: false }, // 🚫 no Cloudflare cache
        headers: { "Cache-Control": "no-cache" }     // 🚫 no browser cache
      });

      console.log("Manifest fetch status:", manifestResp.status);

      if (manifestResp.ok) {
        const manifestJson = await manifestResp.json();

        // Clone with headers that prevent caching
        const manifest = new Response(JSON.stringify(manifestJson), manifestResp);
        manifest.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        manifest.headers.set("Pragma", "no-cache");
        manifest.headers.set("Expires", "0");

        if (manifestJson.bundle) {
          bundleName = manifestJson.bundle;
          console.log("✅ Using bundle from manifest:", bundleName);
        } else {
          console.warn("⚠️ No bundle key found in manifest, using fallback.");
        }
      } else {
        console.error("❌ Manifest fetch failed with status:", manifestResp.status);
      }
    } catch (err) {
      console.error("⚠️ Error loading manifest.json:", err);
    }

    // Rewrite Houfy prod hostname → uat.skyforestgetaway.com
    body = body
    .replace(/https:\/\/skyforestgetaway\.houfy\.com/gi, "https://uat.skyforestgetaway.com")
    .replace(/https:\/\/skyforestgetaway\.com/gi, "https://uat.skyforestgetaway.com")
    .replace(/https:\/\/www\.skyforestgetaway\.com/gi, "https://uat.skyforestgetaway.com");

    // Inject CSS + Google Fonts
    const injection = `
<!-- UAT Worker Injection -->
<link rel="stylesheet" href="${env.CDN_URL}css/houfy.css">
<script src="${env.CDN_URL}js/${bundleName}?v=${Date.now()}" defer></script></body>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script>console.log("✅ UAT Worker running — CSS + Fonts injected, URLs rewritten for UAT");</script>
`;
    body = body.replace(/<\/head\s*>/i, `${injection}\n</head>`);

    return new Response(body, {
      status: upstreamResp.status,
      headers: {
        ...Object.fromEntries(upstreamResp.headers),
        "content-type": "text/html; charset=UTF-8"
      }
    });
  }
};
