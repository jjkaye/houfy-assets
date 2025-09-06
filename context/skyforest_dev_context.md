# SkyforestGetaway Houfy Proxy & Dev Workflow – Full Project Context

This document provides a full context dump of the **SkyforestGetaway Houfy Proxy & Dev Workflow project** so you can upload it into VSCode for reference during coding. It consolidates the conversations, configurations, goals, and current state of the project.

---

## 📌 Project Goal
- Build a **custom dev workflow** to proxy Houfy through Cloudflare Workers while enabling live BrowserSync injection for CSS/JS.
- Support **multiple environments** (dev, UAT, prod) with controlled asset routing.
- Allow flexible **local dev**, **UAT staging**, and **production deployment** via GitHub + Wrangler.
- Ensure **GA4/analytics tracking** works correctly across environments.

---

## ⚙️ Current Architecture

### Components
1. **Cloudflare Workers** – handle routing, proxying, and injection logic.
2. **BrowserSync** – provides live reload and local asset serving during development.
3. **Cloudflared Tunnel** – exposes local BrowserSync server to a public URL for Workers to fetch assets.
4. **Wrangler Configurations** – separate TOML files for `dev`, `uat`, and `prod` environments.
5. **GitHub Actions (deploy.yml)** – automates deploy pipeline.
6. **GitHub Repo: houfy-assets** – contains worker code, manifests, build scripts, and configs.

### Worker Logic
- **Dev Worker**:
  - Only applies to `dev.skyforestgetaway.com`.
  - Routes `/css/`, `/js/`, `/src/` to local BrowserSync.
  - Routes `/manifest.json` to local BrowserSync.
  - Proxies HTML requests to Houfy upstream with injected BrowserSync code.

- **UAT Worker**:
  - Routes `uat.skyforestgetaway.com/*` to Houfy, but swaps assets to CDN.
  - Uses `wrangler.uat.toml`.

- **Prod Worker**:
  - Routes `skyforestgetaway.com/*`.
  - Uses `wrangler.prod.toml`.

### Manifest Handling
- Bundle name (e.g., `bundle.js`) is looked up via `manifest.json`.
- UAT and Prod reference GitHub `manifest.json` (main branch).
- Dev fetches from local BrowserSync server.

```javascript
<script src="${env.CDN_URL}js/${bundleName}" defer></script>
```

This line dynamically loads the built bundle, where `bundleName` is resolved from the manifest.

---

## 📂 Repo Structure (houfy-assets)
```
houfy-assets/
  ├── workers/
  │   ├── houfy-dev-proxy.js
  │   ├── houfy-uat-proxy.js
  │   ├── houfy-prod-proxy.js
  ├── build-scripts/
  │   └── build-dev-manifest.js
  ├── public/
  │   └── js/
  │       └── manifest.json
  ├── wrangler.dev.toml
  ├── wrangler.uat.toml
  ├── wrangler.prod.toml
  ├── package.json
  └── deploy.yml (GitHub workflow)
```

---

## 📑 Key Configurations

### package.json (scripts excerpt)
```json
{
  "scripts": {
    "dev:manifest": "node build-scripts/build-dev-manifest.js",
    "dev": "npm run dev:manifest && concurrently --kill-others -n worker,bs,tunnel -c green,magenta,blue \"npm:worker:local\" \"npm:bs\" \"npm:tunnel\"",

    "worker:local": "wrangler dev --port=8787 --config wrangler.dev.toml",
    "bs": "browser-sync start --config bs-config.js",
    "tunnel": "cloudflared tunnel --config ~/.cloudflared/config.yml run dev",

    "deploy:uat": "wrangler deploy --config wrangler.uat.toml",
    "deploy:prod": "wrangler deploy --config wrangler.prod.toml",

    "tail:uat": "wrangler tail --config wrangler.uat.toml",
    "tail:prod": "wrangler tail --config wrangler.prod.toml"
  }
}
```

### wrangler.uat.toml
```toml
name = "houfy-uat-proxy"
main = "workers/houfy-uat-proxy.js"
compatibility_date = "2025-08-29"

account_id = "34c3d57ed1b72bfcee734c13ddbeedaa"
workers_dev = false

# Routes for UAT environment
routes = [
  { pattern = "uat.skyforestgetaway.com/*", zone_name = "skyforestgetaway.com" }
]

[observability.logs]
enabled = true

[vars]
ENVIRONMENT = "uat"
CDN_URL = "https://cdn.skyforestgetaway.com/public/"
MANIFEST_URL = "https://raw.githubusercontent.com/jjkaye/houfy-assets/main/public/js/manifest.json"
```

### deploy.yml (workflow overview)
- On push to `main` → deploys **prod**.
- On push to `uat` → deploys **uat**.
- Runs Wrangler commands for each environment.

---

## 🔄 Deployment Workflow

1. **Local Dev**
   ```bash
   npm run dev
   ```
   - Runs local worker, BrowserSync, and tunnel.

2. **Deploy to UAT**
   ```bash
   git checkout uat
   git add .
   git commit -m "Deploying changes to UAT"
   git push origin uat
   ```
   → GitHub Actions runs `deploy:uat`.

3. **Promote to Prod**
   ```bash
   git checkout main
   git merge uat
   git push origin main
   ```
   → GitHub Actions runs `deploy:prod`.

---

## 📊 GA4 Tracking
- Workers proxy ensures injected HTML still carries GTM/GA4 tags.
- Goal: ability to test GA events in **UAT** separately from **Prod**.
- Strategy:
  - Use environment variables (`ENVIRONMENT`) to conditionally set GA4 Measurement ID.
  - Track events such as booking flows, asset loads, and redirects.

---

## 🚧 Open Questions / Next Steps
1. **GA4 event verification** – confirm where injected GA events surface in UAT.
2. **Manifest fallback** – ensure bundle.js fallback works if `manifest.json` fetch fails.
3. **UAT routing** – confirm CDN is serving correct bundle versions.
4. **301 Redirects & Proxy rules** – handled via Cloudflare.
5. **Privacy Policy Proxy** – map `/privacy-policy` → external TermsFeed URL.

---

## ✅ Summary
- **Local Dev:** Worker + BrowserSync + Tunnel, live reload.
- **UAT:** Deployed via GitHub → Cloudflare Worker, serving from CDN.
- **Prod:** Stable worker on `skyforestgetaway.com`.
- **Deploy process:** Branch-based (uat → main).
- **Tracking:** GA4 per environment.
- **Next Steps:** Harden GA4 event tracking, finalize manifest handling, validate CDN routing.

---

**End of Context Dump**

