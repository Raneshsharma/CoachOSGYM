import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MealPlannerTab, resolveMealPlanSend } from "./MealPlannerTab";

const emptyMealObj = (slot: string) => ({
  slot,
  name: "-",
  timing: "",
  cal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  ingredients: [] as string[],
  steps: [] as string[],
  oilInstruction: "",
  portion: "",
  servings: "",
  note: "",
});

const fullWeek = [
  {
    name: "Mon",
    meals: [
      emptyMealObj("Breakfast"),
      emptyMealObj("Lunch"),
      emptyMealObj("Snacks"),
      emptyMealObj("Dinner"),
    ],
  },
  ...["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    name: day,
    meals: [
      emptyMealObj("Breakfast"),
      emptyMealObj("Lunch"),
      emptyMealObj("Snacks"),
      emptyMealObj("Dinner"),
    ],
  })),
];

const fullTargets = [
  { day: "Mon", calories: 1400, protein: 150, carbs: 210, fat: 58 },
  { day: "Tue", calories: 1700, protein: 150, carbs: 210, fat: 58 },
  { day: "Wed", calories: 1900, protein: 150, carbs: 210, fat: 58 },
  { day: "Thu", calories: 2100, protein: 150, carbs: 210, fat: 58 },
  { day: "Fri", calories: 2100, protein: 150, carbs: 210, fat: 58 },
  { day: "Sat", calories: 2200, protein: 150, carbs: 210, fat: 58 },
  { day: "Sun", calories: 2250, protein: 150, carbs: 210, fat: 58 },
];

describe("MealPlannerTab", () => {
  it("returns false when the send callback reports a failed save", async () => {
    await expect(resolveMealPlanSend(async () => false)).resolves.toBe(false);
  });

  it("returns true when the send callback reports a successful save", async () => {
    await expect(resolveMealPlanSend(async () => true)).resolves.toBe(true);
  });

  it("renders the inline meal planner panel for the AI Meals tab", () => {
    const markup = renderToStaticMarkup(
      <MealPlannerTab
        initialWeek={fullWeek}
        initialTargets={fullTargets}
        onWeekChange={vi.fn()}
        onTargetsChange={vi.fn()}
        onSaveStatus={vi.fn()}
        onSendPlan={vi.fn(async () => true)}
        pushToast={vi.fn()}
      />,
    );

    expect(markup).toContain("TARGETS FOR WEEK");
    expect(markup).toContain("AI Generate Day");
    expect(markup).toContain("Send to Client");
    expect(markup).toContain("Add Custom Meal Slot");
    expect(markup).toContain("Day Summary");
    expect(markup).toContain("AI Insights");
    expect(markup).toContain("Nutrition Quality");
    expect(markup).toContain("Private to coach");
    expect(markup).not.toContain("Sophie Patel");
    expect(markup).not.toContain("Adherence 84%");
    expect(markup).not.toContain("All Clients");
  });

  it("renders planner content without duplicating the shared portal pill row", () => {
    const markup = renderToStaticMarkup(
      <>
        <div className="portal-tab-row">
          <button type="button">Overview</button>
          <button type="button">AI Meal Planning</button>
          <button type="button">AI Workout Plan</button>
          <button type="button">Messages</button>
          <button type="button">History</button>
        </div>
        <MealPlannerTab
          initialWeek={fullWeek}
          initialTargets={fullTargets}
          onWeekChange={vi.fn()}
          onTargetsChange={vi.fn()}
          onSaveStatus={vi.fn()}
          onSendPlan={vi.fn(async () => true)}
          pushToast={vi.fn()}
        />
      </>,
    );

    expect(markup).toContain("portal-tab-row");
    expect(markup).toContain("AI Meal Planning");
    expect(markup).toContain("AI Workout Plan");
    expect(markup).toContain("AI Generate Day");
    expect(markup).toContain("TARGETS FOR WEEK");
    expect(markup).not.toContain("meal-tab-pills");
    expect(markup).not.toContain(">AI Meals<");
    expect(markup).not.toContain(">Workout<");
    expect(markup).toContain("Messages");
    expect(markup).toContain("History");
  });
});
