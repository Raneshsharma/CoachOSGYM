import { describe, expect, it } from "vitest";
import {
  approvePlan,
  calculateAdherenceMetrics,
  createDraftPlan,
  createProofCard,
  createSeedState,
  previewImport,
  scoreClientRisk,
  summarizeMorningDashboard
} from "./index";

describe("CoachOS domain model", () => {
  it("flags at-risk clients based on adherence and payment issues", () => {
    const state = createSeedState();
    const liam = state.clients.find((client) => client.id === "client_2");
    const checkIn = state.checkIns.find((item) => item.clientId === "client_2");
    const subscription = state.subscriptions.find((item) => item.clientId === "client_2");

    expect(liam).toBeDefined();
    const risk = scoreClientRisk(liam!, checkIn, subscription);

    expect(risk?.severity).toBe("high");
    expect(risk?.reasons.some((reason) => reason.includes("payment"))).toBe(true);
  });

  it("previews imports and separates valid from invalid rows", () => {
    const result = previewImport([
      { name: "Amy", email: "amy@example.com", goal: "Lose fat", monthlyPriceGbp: 149 },
      { name: "", email: "broken-email", goal: "x", monthlyPriceGbp: -1 }
    ]);

    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(1);
  });

  it("creates and approves AI drafts with version bumping", () => {
    const state = createSeedState();
    const draft = createDraftPlan(state.clients[0], state.coach.id);
    const approved = approvePlan(draft);

    expect(draft.latestVersion.status).toBe("draft");
    expect(approved.latestVersion.status).toBe("approved");
    expect(approved.latestVersion.versionNumber).toBe(2);
  });

  it("summarizes the morning dashboard and proof card", () => {
    const state = createSeedState();
    const dashboard = summarizeMorningDashboard(state);
    const proof = createProofCard(state.clients[0], state.checkIns[0]);

    expect(dashboard.atRiskClients.length).toBeGreaterThan(0);
    expect(proof.stats[0].label).toBe("Adherence");
  });

  it("calculates weighted adherence scores from signal inputs", () => {
    const metrics = calculateAdherenceMetrics({
      workoutScore: 90,
      nutritionScore: 80,
      checkInScore: 100,
      stepsScore: 70,
      waterScore: 60,
      habitScore: 75,
      responsivenessScore: 50,
      previousScore: 72
    });

    expect(metrics.score).toBe(82);
    expect(metrics.deltaWeek).toBe(10);
    expect(metrics.trendDirection).toBe("up");
  });

  it("derives adherence metrics from seeded client activity", () => {
    const state = createSeedState();
    const metrics = calculateAdherenceMetrics(state, "client_1");

    expect(metrics.score).toBeGreaterThan(0);
    expect(metrics.score).toBeLessThanOrEqual(100);
    expect(metrics.breakdown.workoutScore).toBeGreaterThanOrEqual(0);
    expect(metrics.breakdown.nutritionScore).toBeGreaterThanOrEqual(0);
    expect(metrics.trendLabel).toMatch(/^[↑↓→]/);
  });
});
