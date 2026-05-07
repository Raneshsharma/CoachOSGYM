# CoachOS Project Structure

This file maps the project folders and files. Generated/vendor folders such as `node_modules`, `.git`, `.corepack`, `.npm-cache`, `.vercel`, `.worker-dist`, temporary worktrees, and build caches are intentionally omitted.

## Root Files

- `.gitignore` - Git ignore rules for local, build, dependency, and environment artifacts.
- `.local-api-server.mjs` - Local API server script used for development/testing.
- `.local-api.err.log` - Local API error log.
- `.local-api.log` - Local API output log.
- `.local-coachos-state.json` - Local JSON state store for CoachOS development data.
- `.local-web-server.mjs` - Local web server script used for serving the frontend.
- `.local-web.err.log` - Local web error log.
- `.local-web.log` - Local web output log.
- `add_plan_assignment.py` - Utility script for wiring plan assignment behavior.
- `add_plan_load.py` - Utility script for wiring plan loading behavior.
- `CoachOS_Feature_Audit_Report.pdf` - Feature audit/report document for the project.
- `package.json` - Root npm workspace manifest with shared scripts and dependencies.
- `package-lock.json` - Locked npm dependency graph.
- `README.md` - Project overview, setup, features, and usage documentation.
- `replace_nutrition_tab.py` - Utility script for replacing/updating the nutrition tab implementation.
- `replace_workout_tab.py` - Utility script for replacing/updating the workout tab implementation.
- `temp_modal.tsx` - Temporary React modal component/source artifact.
- `tsconfig.base.json` - Shared TypeScript compiler configuration.
- `Untitled.canvas` - Obsidian canvas file.
- `vercel.json` - Vercel deployment and routing configuration.
- `wire_meal_state.py` - Utility script for wiring meal state behavior.
- `wire_nutrition_builder.py` - Utility script for wiring the nutrition builder.
- `wire_workout_builder.py` - Utility script for wiring the workout builder.
- `wrangler.toml` - Cloudflare Wrangler configuration.

## `.claude`

- `.claude/settings.local.json` - Local Claude/Codex-style tool settings.

## `.obsidian`

- `.obsidian/app.json` - Obsidian app configuration.
- `.obsidian/appearance.json` - Obsidian appearance configuration.
- `.obsidian/core-plugins.json` - Enabled Obsidian core plugin configuration.
- `.obsidian/graph.json` - Obsidian graph view configuration.
- `.obsidian/workspace.json` - Obsidian workspace layout state.

## `api`

Cloudflare Worker API entrypoint/configuration.

- `api/.dev.vars` - Local Cloudflare Worker environment variables.
- `api/.wrangler/cache/cf.json` - Wrangler cache metadata.
- `api/src/index.ts` - Cloudflare Worker API entrypoint.
- `api/src/supabase.ts` - Supabase client/helper wiring for the Worker API.
- `api/worker-configuration.d.ts` - Generated Worker environment type declarations.
- `api/wrangler_err.txt` - Wrangler error output capture.
- `api/wrangler_out.txt` - Wrangler standard output capture.

## `apps/api`

Node/Express API workspace package.

- `apps/api/.env.example` - Example environment variables for local API configuration.
- `apps/api/package.json` - API package manifest and scripts.
- `apps/api/tsconfig.json` - TypeScript configuration for the API package.
- `apps/api/sql/001_coachos_app_state.sql` - SQL schema for app-state persistence.
- `apps/api/sql/002_coachos_relational.sql` - SQL schema for relational CoachOS data.
- `apps/api/src/app.test.ts` - Tests for API app/routes behavior.
- `apps/api/src/app.ts` - Express app construction and route registration.
- `apps/api/src/bootstrap.ts` - API bootstrap/setup helpers.
- `apps/api/src/config.test.ts` - Tests for environment/config parsing.
- `apps/api/src/config.ts` - Environment-driven API configuration.
- `apps/api/src/endpoints.test.ts` - Endpoint-level API tests.
- `apps/api/src/index.ts` - API package entrypoint/export surface.
- `apps/api/src/server.ts` - Local Node server startup.
- `apps/api/src/services.ts` - Service providers for AI, billing, proof, and integrations.
- `apps/api/src/store.test.ts` - Tests for store/state behavior.
- `apps/api/src/store.ts` - State storage, business operations, and persistence logic.
- `apps/api/src/supabase-infrastructure.test.ts` - Tests for Supabase infrastructure wiring.
- `apps/api/src/worker.ts` - Worker-compatible API entrypoint/adapter.

## `apps/web`

React/Vite frontend workspace package.

- `apps/web/.gitignore` - Frontend-specific Git ignore rules.
- `apps/web/index.html` - Vite HTML entrypoint.
- `apps/web/package.json` - Web package manifest and scripts.
- `apps/web/tsconfig.json` - TypeScript configuration for the web package.
- `apps/web/vite.config.ts` - Vite build/dev-server configuration.
- `apps/web/dist/index.html` - Built frontend HTML output.
- `apps/web/dist/assets/index-CJ2msy91.js` - Built frontend JavaScript bundle.
- `apps/web/dist/assets/index-pkFe6dKa.css` - Built frontend CSS bundle.
- `apps/web/src/main.tsx` - React app entrypoint and main UI composition.
- `apps/web/src/styles.css` - Global styling and design system CSS.
- `apps/web/src/views/CalendarView.tsx` - Calendar view component.
- `apps/web/src/views/CompetitorsView.tsx` - Competitors view component.
- `apps/web/src/views/ExerciseLibraryView.tsx` - Exercise library view component.
- `apps/web/src/views/GroupsView.tsx` - Groups view component.
- `apps/web/src/views/PortalView.tsx` - Client portal view component.
- `apps/web/src/views/RecipeBrowserView.tsx` - Recipe browser view component.
- `apps/web/src/views/SettingsView.tsx` - Settings view component.

## `packages/domain`

Shared domain model workspace package.

- `packages/domain/package.json` - Domain package manifest and exports.
- `packages/domain/tsconfig.json` - TypeScript configuration for the domain package.
- `packages/domain/src/index.test.ts` - Tests for shared domain schemas/logic.
- `packages/domain/src/index.ts` - Shared CoachOS types, schemas, and domain helpers.

## `packages/ui`

Shared UI workspace package.

- `packages/ui/package.json` - UI package manifest and exports.
- `packages/ui/tsconfig.json` - TypeScript configuration for the UI package.
- `packages/ui/src/index.tsx` - Shared React UI primitives/components.

## `supabase`

Supabase schema and migration files.

- `supabase/.temp/cli-latest` - Supabase CLI local metadata.
- `supabase/schema.sql` - Current consolidated Supabase schema.
- `supabase/migrations/20260504191400_preserve_legacy_tables.sql` - Migration preserving legacy tables.
- `supabase/migrations/20260504191500_live_infrastructure.sql` - Migration for live production infrastructure.
- `supabase/migrations/20260504191600_seed_demo_data.sql` - Migration seeding demo data.
