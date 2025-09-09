// workers/lib/stagingGuard.js
// Lightweight helpers that don't take over your proxy logic.
// 1) preflight: blocks bots (Basic Auth), returns robots.txt, kills sitemaps
// 2) harden: adds noindex + security + no-cache headers, and injects meta robots on HTML

export async function stagingPreflight(request, env) {
  const url = new URL(request.url);

  // ---- Optional IP allowlist (exact IPs; add IPv6 if you need it) ----
  const list = (env.IP_ALLOWLIST || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (list.length) {
    const ip = request.headers.get("cf-connecting-ip") || "";
    if (!list.includes(ip)) return new Response("Forbidden", { status: 403 });
  }

  // ---- Basic Auth (default ON in staging) ----
  const requireAuth = (env.REQUIRE_AUTH ?? "true") === "true";
  if (requireAuth) {
    const user = env.BASIC_AUTH_USER || "";
    const pass = env.BASIC_AUTH_PASS || "";
    const expected = "Basic " + btoa(`${user}:${pass}`);
    const got = request.headers.get("authorization") || "";
    if (got !== expected) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Staging"' },
      });
    }
  }

  // ---- robots.txt ----
  const serveRobots = (env.SERVE_ROBOTS ?? "true") === "true";
  if (serveRobots && url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // ---- kill sitemaps on staging ----
  if (/\/sitemap(\.xml|\.txt)?$/i.test(url.pathname)) {
    return new Response("Not Found", { status: 404 });
  }

  return null; // continue with your normal logic
}

export async function stagingHarden(response, request, env) {
  // Clone headers so we can safely edit
  const h = new Headers(response.headers);

  // ---- Robots on ALL content types ----
  const forceNoindex = (env.FORCE_NOINDEX ?? "true") === "true";
  if (forceNoindex) {
    h.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate"
    );
  }

  // ---- No caching in staging ----
  h.set("Cache-Control", "private, no-store, no-cache, must-revalidate, max-age=0");
  h.set("Pragma", "no-cache");
  h.set("Expires", "0");

  // ---- Security hardening (adjust if you need iframes, etc.) ----
  h.set("Referrer-Policy", "no-referrer");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "DENY");
  h.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // If not HTML, just return with updated headers
  const ct = (h.get("content-type") || "").toLowerCase();
  if (!ct.includes("text/html")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: h,
    });
  }

  // For HTML, inject <meta name="robots"> and normalize canonical → prod
  const forceCanonicalBase =
    (env.CANONICAL_BASE || "https://skyforestgetaway.com").replace(/\/$/, "");
  const url = new URL(request.url);

  let html = await response.text();

  if (forceNoindex) {
    // Add meta robots (belt + suspenders)
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">`
    );
  }

  // Strip any existing canonical and set canonical to production host
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  const canonicalURL = forceCanonicalBase + url.pathname + (url.search || "");
  html = html.replace(
    /<head([^>]*)>/i,
    `<head$1><link rel="canonical" href="${canonicalURL}">`
  );

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: h,
  });
}
