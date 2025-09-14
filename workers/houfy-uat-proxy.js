// houfy-uat-proxy.js
import { stagingPreflight, stagingHarden } from "./lib/stagingGuard.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Guardrail — only allow UAT domain
    const hostHeader = request.headers.get("host");
    if (hostHeader !== "uat.skyforestgetaway.com") {
      return new Response("Forbidden: wrong domain", { status: 403 });
    }

    // 🔒 Staging guard preflight (blocks bots via Basic Auth, serves robots.txt, kills sitemaps, optional IP allowlist)
    const pre = await stagingPreflight(request, env);
    if (pre) return pre;

    // Proxy everything → Houfy origin
    url.hostname = "skyforestgetaway.houfy.com";

    let upstreamResp;
    try {
      upstreamResp = await fetch(url.toString(), {
        headers: {
          ...Object.fromEntries(request.headers),
          "Host": "skyforestgetaway.com",
        },
      });
    } catch (err) {
      return stagingHarden(
        new Response(`Upstream fetch failed: ${err.message}`, { status: 502 }),
        request,
        env
      );
    }

    const contentType = upstreamResp.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      // Passthrough for non-HTML, but still harden (noindex, no-cache, security headers)
      return stagingHarden(upstreamResp, request, env);
    }

    let body;
    try {
      body = await upstreamResp.text();
    } catch (err) {
      return stagingHarden(
        new Response(`Failed to read upstream HTML: ${err.message}`, { status: 500 }),
        request,
        env
      );
    }

    let bundleName = "bundle.js"; // fallback

    try {
      console.log("Fetching manifest from:", env.MANIFEST_URL);

      const manifestResp = await fetch(env.MANIFEST_URL, {
        cf: { cacheTtl: 0, cacheEverything: false }, // bypass Cloudflare cache
        headers: { "Cache-Control": "no-cache" },    // bypass browser cache
      });

      if (manifestResp.ok) {
        const manifestJson = await manifestResp.json();
        if (manifestJson.bundle) {
          bundleName = manifestJson.bundle;
          console.log("✅ Using bundle from manifest:", bundleName);
        } else {
          console.warn("⚠️ No bundle key in manifest, using fallback.");
        }
      } else {
        console.error("❌ Manifest fetch failed:", manifestResp.status);
      }
    } catch (err) {
      console.error("⚠️ Error loading manifest.json:", err);
    }

    // Rewrite Houfy prod hostname → UAT domain
    body = body
      .replace(/https:\/\/skyforestgetaway\.houfy\.com/gi, "https://uat.skyforestgetaway.com")
      .replace(/https:\/\/skyforestgetaway\.com/gi, "https://uat.skyforestgetaway.com")
      .replace(/https:\/\/www\.skyforestgetaway\.com/gi, "https://uat.skyforestgetaway.com");

    // Inject CSS + bundle + fonts
    const injection = `
<!-- UAT Worker Injection -->
<link rel="stylesheet" href="${env.CDN_URL}css/houfy.css">
<script src="${env.CDN_URL}js/${bundleName}?v=${Date.now()}" defer></script>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script>console.log("✅ UAT Worker running — CSS + Fonts + Bundle injected, URLs rewritten for UAT");</script>
<script>
  window.CDN_URL = "${env.CDN_URL}";
  console.log("✅ CDN_URL available to client:", window.CDN_URL);
</script>
`;
    body = body.replace(/<\/head\s*>/i, `${injection}\n</head>`);

    // Return HTML and let the guard add noindex/security/canonical headers + meta
    const htmlResp = new Response(body, {
      status: upstreamResp.status,
      headers: {
        ...Object.fromEntries(upstreamResp.headers),
        "content-type": "text/html; charset=UTF-8",
      },
    });

    return stagingHarden(htmlResp, request, env);
  },
};
