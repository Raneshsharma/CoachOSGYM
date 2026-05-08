# Threat Model

## Project Overview

CoachOS is a monorepo SaaS application for online fitness coaches. It has a React/Vite frontend in `apps/web`, a Node/Express API in `apps/api/src/app.ts`, and a Cloudflare Worker API in `apps/api/src/worker.ts` backed by Supabase/Postgres. Current deployment config routes browser `/api/*` traffic to the Cloudflare Worker (`vercel.json`), so the worker is the authoritative production API surface for this scan.

Production assumptions for this repository:
- Only production-reachable code paths are in scope for vulnerability reporting.
- `NODE_ENV` is `production` in deployed environments.
- TLS is provided by the platform and is not a project responsibility.
- Mockup sandbox and clearly dev-only helpers are out of scope unless production reachability is demonstrated.

## Assets

- **Coach accounts and session context** — coach identity, session tokens, workspace identifiers, and any state that determines which organization is loaded. Compromise allows impersonation or tenant pivoting.
- **Client PII and coaching records** — names, emails, health conditions, notes, body metrics, messages, plans, subscriptions, habits, and proof-card data. This is sensitive personal and business data.
- **Billing state** — subscription status, renewal dates, MRR summaries, and payment-related workflow state. Unauthorized updates could disrupt revenue or trigger false churn/remediation flows.
- **Supabase credentials and service-role capabilities** — database-level credentials and any server-side access path that bypasses row-level restrictions. Exposure would allow broad database compromise.
- **Organization configuration and export/reset capabilities** — workspace branding, onboarding state, full data exports, and admin reset/import actions. Unauthorized use could destroy or exfiltrate tenant data.

## Trust Boundaries

- **Browser to production API** — all frontend requests cross from an untrusted client into the worker API. Every read and write must be authenticated and authorized server-side.
- **API to Supabase/Postgres** — the worker uses privileged server-side access to persist and read tenant data. Any flaw in request validation or tenant binding can become full database impact.
- **Public to authenticated coach boundary** — public pages and auth/bootstrap flows must be separated from protected coaching operations such as session loading, client management, exports, admin actions, and billing changes.
- **Tenant to tenant boundary** — one coach organization must never be selectable or accessible based on client-controlled identifiers alone.
- **Server to payment provider/webhook boundary** — billing updates originating from Stripe or similar providers must be authenticated as provider-generated events, not trusted from arbitrary internet requests.

## Scan Anchors

- **Production entry points:** `apps/web/src/main.tsx`, `apps/web/src/lib/api.ts`, `apps/api/src/worker.ts`, `vercel.json`, `wrangler.toml`
- **Highest-risk code areas:** worker route handling and tenant loading in `apps/api/src/worker.ts`; deployment routing in `vercel.json`; any server-side Supabase credential handling
- **Public vs authenticated vs admin surfaces:** public landing/auth UI in `apps/web`; worker currently handles coach session, client data, billing, export, onboarding, and admin-like actions
- **Usually ignore unless production reachability changes:** legacy/alternate API under `api/`; local JSON/in-memory storage paths used for development

## Threat Categories

### Spoofing

The production API must authenticate every request that returns or mutates coach or client data. Tenant identity must come from verified server-side session state, not from a client-controlled query parameter such as `coachId`. Billing webhook requests must be verified with a provider signature before they can update subscription state.

### Tampering

The worker exposes routes that change clients, plans, notes, metrics, sessions, subscriptions, habits, onboarding state, and admin-like reset/export behavior. These operations must reject unauthenticated callers, bind writes to the authenticated tenant, and validate that the caller is allowed to modify the target resource.

### Information Disclosure

Coach session responses, exports, analytics, proof cards, messages, notes, health-related metrics, and billing summaries contain sensitive business and personal data. These responses must only be available to the authenticated tenant and must never be returned based solely on public requests or client-supplied tenant identifiers.

### Elevation of Privilege

Any server-side credential with broad database privileges must remain in secrets storage and never be committed to source or exposed to the browser. The application must prevent attackers from escalating from public internet access to tenant-admin capabilities such as full session reads, exports, resets, subscription changes, or cross-tenant data access.

### Denial of Service

Publicly reachable state-mutating endpoints can be abused to reset tenant state, flood analytics/messages/check-ins, or create excessive onboarding records. Sensitive write paths should have authentication and, where appropriate, rate limiting or abuse controls.