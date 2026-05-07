import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PostgresRelationalDemoStateRepository } from "./store";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const migrationsDir = path.join(rootDir, "supabase", "migrations");

function readMigration(nameIncludes: string) {
  const fileName = fs
    .readdirSync(migrationsDir)
    .find((name) => name.includes(nameIncludes) && name.endsWith(".sql"));

  expect(fileName).toBeDefined();
  return fs.readFileSync(path.join(migrationsDir, fileName!), "utf8");
}

describe("Supabase live infrastructure migrations", () => {
  it("defines the normalized live platform tables with indexes and RLS", () => {
    const sql = readMigration("live_infrastructure");

    for (const table of [
      "organizations",
      "profiles",
      "coaches",
      "clients",
      "coach_clients",
      "page_definitions",
      "page_widgets",
      "metric_definitions",
      "metric_values",
      "metric_daily_rollups",
      "form_templates",
      "external_connections",
      "audit_logs",
      "background_jobs"
    ]) {
      expect(sql).toContain(`create table if not exists ${table}`);
      expect(sql).toContain(`alter table ${table} enable row level security`);
    }

    expect(sql).toContain("create index if not exists idx_metric_values_client_recorded");
    expect(sql).toContain("create policy service_role_all_on_metric_values");
  });

  it("seeds the current CoachOS demo data idempotently", () => {
    const sql = readMigration("seed_demo_data");

    expect(sql).toContain("insert into organizations");
    expect(sql).toContain("'ws_uk_1'");
    expect(sql).toContain("'client_1'");
    expect(sql).toContain("'Sophie Patel'");
    expect(sql).toContain("on conflict");
  });
});

describe("Postgres relational repository runtime contract", () => {
  it("reports Supabase normalized relational storage", () => {
    const repository = new PostgresRelationalDemoStateRepository("postgresql://example");

    expect(repository.describe()).toEqual({
      storage: "SupabasePostgresRelationalRepository",
      stateFilePath: null
    });
  });
});
