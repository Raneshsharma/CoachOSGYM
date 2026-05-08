# Deployment Secrets

The GitHub Actions workflow (`.github/workflows/deploy.yml`) requires four secrets
to be set in the repository before deployments can succeed. Go to:

**GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Where to find it |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | vercel.com → Team/Account Settings → General → Team ID (or personal account ID) |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General → Project ID |
| `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com → My Profile → API Tokens → Create Token (use the "Edit Cloudflare Workers" template, scoped to the `coachos-api` worker) |

## Current status

All four secrets were added to `Raneshsharma/CoachOSGYM` on 2026-05-08.

## What each secret is used for

- **`VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`** — used by the
  `deploy-web` job (via `amondnet/vercel-action`) to authenticate and deploy
  the React/Vite frontend from `apps/web/dist` to Vercel with `--prod`.

- **`CLOUDFLARE_API_TOKEN`** — used by the `deploy-worker` job (via
  `cloudflare/wrangler-action`) to run `wrangler deploy` and publish the
  Cloudflare Worker defined in `apps/api/src/worker.ts` (`wrangler.toml`).

## Re-adding secrets after rotation

If any credential is rotated, generate a new value at the provider dashboard
above and update the GitHub secret with the same name. No code changes are
needed — the workflow reads secrets by name at runtime.
