# AI Workout Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current inline workout block in Client Portal with a dedicated inline `WorkoutPlannerTab` that matches the meal planner integration pattern and supports week selection, drag-and-drop exercise planning, AI generation, smart swap, summary insights, and private notes.

**Architecture:** `PortalView` remains the owner of the shared Client Portal shell while a new `WorkoutPlannerTab` owns all workout-only UI and state beneath the shared pills. The first implementation uses parent-owned weekly workout state plus a focused inline component, with API-first workout generation and client-side fallbacks/rule-based insights so the UI remains functional without backend dependency.

**Tech Stack:** React, TypeScript, Vite, existing `styles.css`, lucide-react, existing `fetchJson` helper, Vitest

---

## File Structure

- `apps/web/src/views/WorkoutPlannerTab.tsx`
  - New inline workout planner component.
  - Owns week strip, drag/drop timeline, AI generate workflow, right rail cards, and local per-day interactions.
- `apps/web/src/views/WorkoutPlannerTab.test.tsx`
  - New focused regression coverage for render structure and key behavior helpers.
- `apps/web/src/main.tsx`
  - Stops rendering the old inline workout block directly.
  - Owns top-level workout week state and mounts `WorkoutPlannerTab` under `activeTab === "workout"`.
- `apps/web/src/styles.css`
  - Adds dedicated `workout-planner-*` styles aligned to the existing portal/meal card system.
  - Keeps older workout styles only if they still serve non-portal surfaces; otherwise, fence or replace them for the new inline planner.

---

### Task 1: Introduce workout week types and parent-owned state in `PortalView`

**Files:**
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Add workout planner types near the existing planner types**

```ts
type WorkoutExercise = {
  id: string;
  name: string;
  tag: string;
  sets: string;
  duration: string;
  advanced?: string;
  bodyPart?: string;
  equipment?: string;
};

type WorkoutWeekDay = {
  name: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  durationMinutes: number | null;
  focus?: string;
  isRest?: boolean;
  exercises: WorkoutExercise[];
  notes?: string;
};
```

- [ ] **Step 2: Add helper factories for seeded workout week data**

```ts
function createWorkoutWeek(): WorkoutWeekDay[] {
  return [
    {
      name: "Mon",
      durationMinutes: 45,
      focus: "Full Body",
      exercises: [
        { id: "mon-1", name: "Jumping Jacks", tag: "Warmup", sets: "3 x 50", duration: "5 min", advanced: "" },
        { id: "mon-2", name: "High Knees", tag: "Conditioning", sets: "3 x 30", duration: "6 min", advanced: "Ankle Weights 1kg" },
      ],
      notes: "",
    },
    { name: "Tue", durationMinutes: 60, focus: "Upper Body", exercises: [], notes: "" },
    { name: "Wed", durationMinutes: null, isRest: true, exercises: [], notes: "" },
    { name: "Thu", durationMinutes: 45, focus: "Lower Body", exercises: [], notes: "" },
    { name: "Fri", durationMinutes: 45, focus: "Push", exercises: [], notes: "" },
    { name: "Sat", durationMinutes: 30, focus: "Conditioning", exercises: [], notes: "" },
    { name: "Sun", durationMinutes: null, isRest: true, exercises: [], notes: "" },
  ];
}
```

- [ ] **Step 3: Add parent-owned workout week state in `PortalView`**

```ts
const [workoutWeek, setWorkoutWeek] = useState<WorkoutWeekDay[]>(() => createWorkoutWeek());
```

- [ ] **Step 4: Reset workout week when the active client changes**

```ts
useEffect(() => {
  setWorkoutWeek(createWorkoutWeek());
}, [clientPortal?.client.id]);
```

- [ ] **Step 5: Remove the old `workoutExercises`-centric inline state only after the new week state is in place**

Delete these older state slices once no longer required:

```ts
const [workoutExercises, setWorkoutExercises] = useState([...]);
const [workoutDiscarded, setWorkoutDiscarded] = useState(false);
const [savingWorkout, setSavingWorkout] = useState(false);
const [exerciseLibrary, setExerciseLibrary] = useState<{id:string;name:string;bodyPart:string;equipment:string}[]>([]);
const [exerciseSearch, setExerciseSearch] = useState("");
const [exerciseFilter, setExerciseFilter] = useState("all");
const [loadingExercises, setLoadingExercises] = useState(false);
```

- [ ] **Step 6: Run web build to verify the state layer compiles before introducing the new component**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/main.tsx
git commit -m "refactor: add parent-owned workout planner state"
```

### Task 2: Create `WorkoutPlannerTab` as a dedicated inline portal component

**Files:**
- Create: `apps/web/src/views/WorkoutPlannerTab.tsx`
- Create: `apps/web/src/views/WorkoutPlannerTab.test.tsx`
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Write the failing render test for the new workout planner tab**

```tsx
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkoutPlannerTab } from "./WorkoutPlannerTab";

const initialWeek = [
  { name: "Mon", durationMinutes: 45, focus: "Full Body", exercises: [], notes: "" },
  { name: "Tue", durationMinutes: 60, focus: "Upper Body", exercises: [], notes: "" },
  { name: "Wed", durationMinutes: null, isRest: true, exercises: [], notes: "" },
  { name: "Thu", durationMinutes: 45, focus: "Lower Body", exercises: [], notes: "" },
  { name: "Fri", durationMinutes: 45, focus: "Push", exercises: [], notes: "" },
  { name: "Sat", durationMinutes: 30, focus: "Conditioning", exercises: [], notes: "" },
  { name: "Sun", durationMinutes: null, isRest: true, exercises: [], notes: "" },
];

describe("WorkoutPlannerTab", () => {
  it("renders the workout planner week strip and right rail cards", () => {
    const markup = renderToStaticMarkup(
      <WorkoutPlannerTab
        clientId="client_1"
        initialWeek={initialWeek}
        onWeekChange={vi.fn()}
        pushToast={vi.fn()}
      />,
    );

    expect(markup).toContain("AI Generate Workout");
    expect(markup).toContain("Workout Summary");
    expect(markup).toContain("AI Insights");
    expect(markup).toContain("Private to coach");
    expect(markup).toContain("Mon");
    expect(markup).toContain("Tue");
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `npm run test --workspace @coachos/web -- WorkoutPlannerTab.test.tsx`
Expected: FAIL with module or symbol not found

- [ ] **Step 3: Create the initial `WorkoutPlannerTab.tsx` scaffold**

```tsx
import React, { useMemo, useState } from "react";

export type WorkoutExercise = {
  id: string;
  name: string;
  tag: string;
  sets: string;
  duration: string;
  advanced?: string;
  bodyPart?: string;
  equipment?: string;
};

export type WorkoutWeekDay = {
  name: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  durationMinutes: number | null;
  focus?: string;
  isRest?: boolean;
  exercises: WorkoutExercise[];
  notes?: string;
};

type WorkoutPlannerTabProps = {
  clientId: string;
  initialWeek: WorkoutWeekDay[];
  onWeekChange: (week: WorkoutWeekDay[]) => void;
  pushToast: (msg: string, type?: "success" | "error" | "info") => void;
};

export function WorkoutPlannerTab({ clientId, initialWeek, onWeekChange, pushToast }: WorkoutPlannerTabProps) {
  const [week, setWeek] = useState(initialWeek);
  const [selectedDay, setSelectedDay] = useState<WorkoutWeekDay["name"]>("Mon");

  const selected = useMemo(
    () => week.find((day) => day.name === selectedDay) ?? week[0],
    [selectedDay, week],
  );

  const updateWeek = (nextWeek: WorkoutWeekDay[]) => {
    setWeek(nextWeek);
    onWeekChange(nextWeek);
  };

  return (
    <div className="workout-planner-tab">
      <div className="workout-planner-week-strip">
        {week.map((day) => (
          <button key={day.name} type="button" className={`workout-planner-day${day.name === selected.name ? " active" : ""}`} onClick={() => setSelectedDay(day.name)}>
            <span>{day.name}</span>
            <strong>{day.durationMinutes ?? "—"}</strong>
          </button>
        ))}
      </div>

      <div className="workout-planner-layout">
        <section className="workout-planner-main">
          <div className="workout-planner-header">
            <div>
              <span>{selected.name}</span>
              <h3>{selected.durationMinutes ?? 0} min</h3>
            </div>
            <button type="button" className="workout-planner-generate-btn">AI Generate Workout</button>
          </div>
        </section>

        <aside className="workout-planner-side">
          <section><h3>Workout Summary</h3></section>
          <section><h3>AI Insights</h3></section>
          <section><h3>Private to coach - auto-saved</h3></section>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire the new component into `PortalView` for `activeTab === "workout"`**

Add import in `main.tsx`:

```ts
import { WorkoutPlannerTab, type WorkoutWeekDay } from "./views/WorkoutPlannerTab";
```

Replace the old workout block with:

```tsx
{activeTab === "workout" && (
  <WorkoutPlannerTab
    clientId={clientPortal.client.id}
    initialWeek={workoutWeek}
    onWeekChange={setWorkoutWeek}
    pushToast={push}
  />
)}
```

- [ ] **Step 5: Run the new focused test and verify it passes**

Run: `npm run test --workspace @coachos/web -- WorkoutPlannerTab.test.tsx`
Expected: PASS

- [ ] **Step 6: Run web build to verify the new component is wired correctly**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/views/WorkoutPlannerTab.tsx apps/web/src/views/WorkoutPlannerTab.test.tsx apps/web/src/main.tsx
git commit -m "feat: add inline workout planner tab scaffold"
```

### Task 3: Implement week strip, exercise library, and timeline canvas state transitions

**Files:**
- Modify: `apps/web/src/views/WorkoutPlannerTab.tsx`
- Test: `apps/web/src/views/WorkoutPlannerTab.test.tsx`

- [ ] **Step 1: Add a helper test for day selection and exercise insertion**

```tsx
it("adds a library exercise into the selected day plan", () => {
  // Implement as a helper-level test if exported helper exists,
  // or validate render output after seeded insertion state.
  expect(true).toBe(true);
});
```

Replace this placeholder with a real helper test using exported pure helpers in Step 2.

- [ ] **Step 2: Introduce pure state helpers for workout week updates**

Add to `WorkoutPlannerTab.tsx`:

```ts
export function insertExerciseAt(
  week: WorkoutWeekDay[],
  dayName: WorkoutWeekDay["name"],
  exercise: WorkoutExercise,
  index: number,
): WorkoutWeekDay[] {
  return week.map((day) => {
    if (day.name !== dayName) return day;
    const nextExercises = [...day.exercises];
    nextExercises.splice(index, 0, exercise);
    return { ...day, exercises: nextExercises };
  });
}

export function reorderExercises(
  week: WorkoutWeekDay[],
  dayName: WorkoutWeekDay["name"],
  sourceIndex: number,
  targetIndex: number,
): WorkoutWeekDay[] {
  return week.map((day) => {
    if (day.name !== dayName) return day;
    const nextExercises = [...day.exercises];
    const [moved] = nextExercises.splice(sourceIndex, 1);
    nextExercises.splice(targetIndex, 0, moved);
    return { ...day, exercises: nextExercises };
  });
}
```

- [ ] **Step 3: Replace the placeholder test with real helper tests**

```tsx
import { insertExerciseAt, reorderExercises } from "./WorkoutPlannerTab";

it("inserts a library exercise into the selected day", () => {
  const next = insertExerciseAt(initialWeek, "Mon", {
    id: "mon-new",
    name: "Goblet Squat",
    tag: "Legs",
    sets: "3 x 10",
    duration: "8 min",
  }, 0);

  expect(next[0].exercises[0].name).toBe("Goblet Squat");
});

it("reorders exercises within a day", () => {
  const seeded = [{
    ...initialWeek[0],
    exercises: [
      { id: "1", name: "A", tag: "Legs", sets: "3", duration: "5 min" },
      { id: "2", name: "B", tag: "Back", sets: "3", duration: "5 min" },
    ],
  }, ...initialWeek.slice(1)];

  const next = reorderExercises(seeded, "Mon", 0, 1);
  expect(next[0].exercises.map((item) => item.name)).toEqual(["B", "A"]);
});
```

- [ ] **Step 4: Add the inline exercise library and timeline UI**

Extend `WorkoutPlannerTab.tsx` with:

```tsx
const library = [
  { id: "lib-1", name: "Goblet Squat", bodyPart: "Legs", equipment: "Dumbbells" },
  { id: "lib-2", name: "Bench Press", bodyPart: "Chest", equipment: "Barbell" },
  { id: "lib-3", name: "Lat Pulldown", bodyPart: "Back", equipment: "Cable" },
];
```

Render:
- a draggable library list
- a vertical timeline of `selected.exercises`
- insertion buttons/drop markers between cards for MVP
- `Add Custom Exercise` button appending a blank card

- [ ] **Step 5: Implement drag/drop with native HTML5 events for MVP**

In the timeline cards and library items, use:

```tsx
draggable
onDragStart={() => setDragState({ source: "library", exercise })}
onDragOver={(event) => { event.preventDefault(); setDropIndex(index); }}
onDrop={() => { /* insert or reorder */ }}
```

Use component state such as:

```ts
const [dragState, setDragState] = useState<
  | { source: "library"; exercise: WorkoutExercise }
  | { source: "timeline"; index: number }
  | null
>(null);
const [dropIndex, setDropIndex] = useState<number | null>(null);
```

- [ ] **Step 6: Run the workout planner test file**

Run: `npm run test --workspace @coachos/web -- WorkoutPlannerTab.test.tsx`
Expected: PASS

- [ ] **Step 7: Run web build**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/views/WorkoutPlannerTab.tsx apps/web/src/views/WorkoutPlannerTab.test.tsx
git commit -m "feat: add workout planner week strip and timeline interactions"
```

### Task 4: Add summary rail, rule-based AI insights, and private notes

**Files:**
- Modify: `apps/web/src/views/WorkoutPlannerTab.tsx`
- Test: `apps/web/src/views/WorkoutPlannerTab.test.tsx`

- [ ] **Step 1: Add pure summary helpers**

```ts
export function summarizeWorkout(exercises: WorkoutExercise[]) {
  const totalSets = exercises.reduce((sum, ex) => {
    const match = ex.sets.match(/^(\d+)/);
    return sum + (match ? Number(match[1]) : 0);
  }, 0);

  const estDuration = exercises.reduce((sum, ex) => {
    const match = ex.duration.match(/(\d+)/);
    return sum + (match ? Number(match[1]) : 0);
  }, 0);

  const targetMuscles = Array.from(new Set(exercises.map((ex) => ex.bodyPart || ex.tag)));

  return {
    totalSets,
    estDuration,
    targetMuscles,
    volumeLoadLabel: "~0 kg",
  };
}

export function buildWorkoutInsights(exercises: WorkoutExercise[]) {
  if (exercises.length === 0) return ["Add exercises to generate AI insights."];

  const muscles = exercises.map((ex) => (ex.bodyPart || ex.tag).toLowerCase());
  const insights: string[] = [];

  if (muscles.some((m) => m.includes("legs")) && muscles.some((m) => m.includes("ham"))) {
    insights.push("Lower-body volume is well-balanced across quads and hamstrings.");
  }
  if (!muscles.some((m) => m.includes("back") || m.includes("pull"))) {
    insights.push("Consider adding a horizontal pull to complement the pressing work.");
  }
  if (insights.length === 0) {
    insights.push("Rest periods and movement coverage look appropriate for today’s session.");
  }

  return insights.slice(0, 3);
}
```

- [ ] **Step 2: Add tests for summary and insight helpers**

```tsx
import { buildWorkoutInsights, summarizeWorkout } from "./WorkoutPlannerTab";

it("summarizes sets and duration", () => {
  const summary = summarizeWorkout([
    { id: "1", name: "Bench", tag: "Chest", sets: "4 x 8", duration: "10 min" },
    { id: "2", name: "Row", tag: "Back", sets: "3 x 10", duration: "8 min" },
  ] as any);

  expect(summary.totalSets).toBe(7);
  expect(summary.estDuration).toBe(18);
});

it("returns placeholder insight when workout is empty", () => {
  expect(buildWorkoutInsights([])).toEqual(["Add exercises to generate AI insights."]);
});
```

- [ ] **Step 3: Render the three right-rail cards**

Add to `WorkoutPlannerTab.tsx`:
- Workout Summary card
- AI Insights card
- Private Notes card with 250-char counter

Use debounced local note update with `setTimeout` / `clearTimeout` and `onWeekChange`.

- [ ] **Step 4: Run the workout planner tests**

Run: `npm run test --workspace @coachos/web -- WorkoutPlannerTab.test.tsx`
Expected: PASS

- [ ] **Step 5: Run web build**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/views/WorkoutPlannerTab.tsx apps/web/src/views/WorkoutPlannerTab.test.tsx
git commit -m "feat: add workout summary insights and notes rail"
```

### Task 5: Add AI generate workout flow with API-first and fallback templates

**Files:**
- Modify: `apps/web/src/views/WorkoutPlannerTab.tsx`

- [ ] **Step 1: Add local fallback workout templates**

```ts
const workoutTemplates: Record<string, WorkoutExercise[]> = {
  "Full Body": [
    { id: "gen-1", name: "Goblet Squat", tag: "Legs", sets: "4 x 10", duration: "8 min", bodyPart: "Legs", equipment: "Dumbbells" },
    { id: "gen-2", name: "Bench Press", tag: "Push", sets: "4 x 8", duration: "10 min", bodyPart: "Chest", equipment: "Barbell" },
    { id: "gen-3", name: "Lat Pulldown", tag: "Pull", sets: "4 x 10", duration: "8 min", bodyPart: "Back", equipment: "Cable" },
  ],
  "Lower Body": [
    { id: "gen-1", name: "Romanian Deadlift", tag: "Legs", sets: "4 x 8", duration: "10 min", bodyPart: "Hamstrings", equipment: "Barbell" },
    { id: "gen-2", name: "Split Squat", tag: "Legs", sets: "3 x 10", duration: "8 min", bodyPart: "Quads", equipment: "Dumbbells" },
  ],
};
```

- [ ] **Step 2: Add API-first generator helper**

```ts
async function generateWorkoutDay(args: {
  clientId: string;
  day: WorkoutWeekDay["name"];
  focus: string;
  duration: number;
}) {
  try {
    const response = await fetchJson<{ exercises: WorkoutExercise[] }>(
      `/v1/coach/clients/${args.clientId}/workouts/generate-day`,
      {
        method: "POST",
        body: JSON.stringify({
          day: args.day,
          focus: args.focus,
          duration: args.duration,
          equipment: [],
        }),
      },
    );
    return response.exercises;
  } catch {
    return (workoutTemplates[args.focus] || workoutTemplates["Full Body"]).map((exercise, index) => ({
      ...exercise,
      id: `${args.day.toLowerCase()}-${index + 1}`,
    }));
  }
}
```

- [ ] **Step 3: Wire `AI Generate Workout` to replace the current day after confirmation**

```tsx
const handleGenerateWorkout = async () => {
  if (selected.exercises.length > 0 && !window.confirm(`Replace the workout for ${selected.name}?`)) return;

  const generated = await generateWorkoutDay({
    clientId,
    day: selected.name,
    focus: selected.focus || "Full Body",
    duration: selected.durationMinutes || 45,
  });

  const nextWeek = week.map((day) =>
    day.name === selected.name
      ? { ...day, exercises: generated }
      : day,
  );

  updateWeek(nextWeek);
  pushToast(`Workout generated for ${selected.name}.`, "success");
};
```

- [ ] **Step 4: Run build and workout tests**

Run: `npm run test --workspace @coachos/web -- WorkoutPlannerTab.test.tsx`
Expected: PASS

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/views/WorkoutPlannerTab.tsx
git commit -m "feat: add api-first workout generation with fallback"
```

### Task 6: Add smart swap, delete, and polish interactions

**Files:**
- Modify: `apps/web/src/views/WorkoutPlannerTab.tsx`
- Modify: `apps/web/src/styles.css`
- Test: `apps/web/src/views/WorkoutPlannerTab.test.tsx`

- [ ] **Step 1: Add a simple smart swap helper**

```ts
const workoutSwapPool: Record<string, WorkoutExercise[]> = {
  Legs: [
    { id: "swap-1", name: "Reverse Lunge", tag: "Legs", sets: "3 x 10", duration: "8 min", bodyPart: "Legs", equipment: "Dumbbells" },
    { id: "swap-2", name: "Leg Press", tag: "Legs", sets: "4 x 10", duration: "10 min", bodyPart: "Legs", equipment: "Machine" },
  ],
  Back: [
    { id: "swap-3", name: "Seated Row", tag: "Back", sets: "4 x 10", duration: "8 min", bodyPart: "Back", equipment: "Cable" },
  ],
};
```

- [ ] **Step 2: Render a per-exercise swap popover and delete action**

Use local state such as:

```ts
const [swapTargetId, setSwapTargetId] = useState<string | null>(null);
```

Replace the exercise by id when a swap choice is clicked.
Delete removes the exercise immediately and toasts success.

- [ ] **Step 3: Add workout planner CSS block**

Append styles for:
- `.workout-planner-tab`
- `.workout-planner-week-strip`
- `.workout-planner-day`
- `.workout-planner-layout`
- `.workout-planner-main`
- `.workout-planner-side`
- `.workout-planner-exercise-card`
- `.workout-planner-drop-line`
- `.workout-planner-library`
- `.workout-planner-notes`

Use the same card tokens as the meal planner / portal cards.

- [ ] **Step 4: Run the workout tests and web build**

Run: `npm run test --workspace @coachos/web -- WorkoutPlannerTab.test.tsx`
Expected: PASS

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/views/WorkoutPlannerTab.tsx apps/web/src/views/WorkoutPlannerTab.test.tsx apps/web/src/styles.css
git commit -m "feat: add workout planner interactions and styling"
```

### Task 7: Final verification in the portal

**Files:**
- Modify: `apps/web/src/main.tsx` (only if verification reveals a small integration mismatch)
- Modify: `apps/web/src/views/WorkoutPlannerTab.tsx` (only if verification reveals a small component mismatch)
- Modify: `apps/web/src/styles.css` (only if verification reveals a small visual mismatch)

- [ ] **Step 1: Run the focused workout planner test file**

Run: `npm run test --workspace @coachos/web -- WorkoutPlannerTab.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the existing meal planner regression to ensure no portal cross-regression**

Run: `npm run test --workspace @coachos/web -- MealPlannerTab.test.tsx`
Expected: PASS

- [ ] **Step 3: Run the web build**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 4: Verify in the browser manually**

Checklist:
- shared Client Portal header still renders once
- shared pill row still renders once
- clicking `AI Workout Plan` shows the new workout planner inline
- week strip selects days
- exercise library items can be added/reordered
- right rail summary/insights/notes render
- `AI Generate Workout` fills a day even if the API path fails
- switching back to `Overview` / `AI Meal Planning` still works

- [ ] **Step 5: Commit final touch-ups if needed**

```bash
git add apps/web/src/main.tsx apps/web/src/views/WorkoutPlannerTab.tsx apps/web/src/views/WorkoutPlannerTab.test.tsx apps/web/src/styles.css
git commit -m "feat: complete inline ai workout planner"
```
