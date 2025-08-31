# 🚀 Development Workflow (Dev → UAT → Prod)

## Branches

* **`main`** = Production (live site, auto-deploys to Prod)
* **`uat`** = Staging (UAT environment, auto-deploys to UAT domain)
* **feature branches** = temporary local branches for new changes

---

## 🔧 Local Development (Dev)

1. Run local dev with BrowserSync + Worker:

   ```sh
   npm run dev
   ```
2. Make changes in your local branch (usually `feature/my-change`).
3. Test changes in `https://dev.skyforestgetaway.com` (via tunnel).

---

## 🧪 Push to UAT

When your feature is ready for staging:

```sh
# Switch to uat branch
git checkout uat

# Merge your feature branch into uat
git merge feature/my-change

# Push uat to GitHub
git push origin uat
```

✅ GitHub Actions will detect the push to `uat` and deploy automatically to `uat.skyforestgetaway.com`.
Test it there with your team.

---

## 🚀 Promote to Prod

Once UAT looks good:

**Option A (preferred, safe)**: GitHub Pull Request

1. On GitHub, open a PR from `uat` → `main`.
2. Review changes, merge.
3. Merge triggers GitHub Actions → deploys to Prod (`skyforestgetaway.com`).

**Option B (local, fast)**:

```sh
git checkout main
git merge uat
git push origin main
```

---

## 🔒 Safeguards

* Never push directly to `main` unless it’s a hotfix.
* Always confirm UAT is working before promoting.
* Keep `main` history clean (use merge commits, not `--force`).

---

## 🔁 Quick Reference Commands

```sh
# Create a new feature branch
git checkout -b feature/my-change

# Push feature branch
git push origin feature/my-change

# Merge feature into UAT
git checkout uat
git merge feature/my-change
git push origin uat

# Merge UAT into Main
git checkout main
git merge uat
git push origin main
```

---

✅ With this workflow:

* Dev = local tunnel (`npm run dev`)
* UAT = `uat.skyforestgetaway.com` (branch = `uat`)
* Prod = `skyforestgetaway.com` (branch = `main`)
