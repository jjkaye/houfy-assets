export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, ""); // strip leading slash

    // Decide branch based on hostname
    let branch = "main";
    if (url.hostname.startsWith("cdn-uat")) {
      branch = "uat";
    }

    const githubUrl = `https://raw.githubusercontent.com/jjkaye/houfy-assets/${branch}/${path}`;

    try {
      const response = await fetch(githubUrl, {
        headers: {
          "User-Agent": "Cloudflare-Worker-CDN",
          "Accept": "*/*"
        }
      });

      if (!response.ok) {
        return new Response(
          `/* Fallback: ${path} not found in ${branch} branch */`,
          {
            status: 200,
            headers: {
              "Content-Type": guessMime(path),
              "Cache-Control": "no-cache"
            }
          }
        );
      }

      return new Response(response.body, {
        status: 200,
        headers: {
          "Content-Type": guessMime(path),
          "Cache-Control": path.endsWith("manifest.json")
            ? "no-store, no-cache, must-revalidate, proxy-revalidate"
            : "public, max-age=31536000, immutable"
        }
      });
    } catch (err) {
      return new Response(
        `/* Fallback: error fetching ${path} (${err.message}) */`,
        {
          status: 200,
          headers: {
            "Content-Type": guessMime(path),
            "Cache-Control": "no-cache"
          }
        }
      );
    }
  }
};

function guessMime(path) {
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  return "text/plain; charset=utf-8";
}
