# Client Portal Inline Planner Panels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Client Portal as a single page shell and render AI Meal Planning and AI Workout Plan as inline card panels under the pill tabs instead of full-page takeovers.

**Architecture:** `PortalView` remains the owner of the client header, client selector, adherence block, and tab pills. `MealPlannerTab` and the existing workout panel stay as separate units, but they render inside the normal portal content area and no longer change the global app shell or hide the sidebar.

**Tech Stack:** React, TypeScript, Vite, existing `styles.css`, Vitest, lucide-react

---

## File Structure

- `apps/web/src/main.tsx`
  - Owns `PortalView`, client header, tab switching, and inline panel composition.
  - Needs cleanup of duplicate header logic and removal of meal-specific shell takeover wiring.
- `apps/web/src/views/MealPlannerTab.tsx`
  - Stays a focused meal-planner component.
  - Must stop pretending to own page-level navigation and layout shell behavior.
- `apps/web/src/styles.css`
  - Holds both portal card styles and meal planner styles.
  - Needs inline-panel styling so meal cards visually match overview/workout cards under the portal tabs.
- `apps/web/src/views/MealPlannerTab.test.tsx`
  - Current regression coverage for the meal tab shell.
  - Needs assertions aligned with inline usage and removal of page-takeover behavior.

---

### Task 1: Remove portal shell takeover and restore one consistent Client Portal header

**Files:**
- Modify: `apps/web/src/main.tsx`
- Test: `apps/web/src/views/MealPlannerTab.test.tsx`

- [ ] **Step 1: Write the failing test expectation for inline usage**

```tsx
it("does not require a page takeover shell API for meal tab rendering", () => {
  const props = makeProps();
  render(<MealPlannerTab {...props} />);
  expect(screen.getByText("AI Meals")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify the current baseline still passes before refactor**

Run: `npm run test --workspace @coachos/web -- MealPlannerTab.test.tsx`
Expected: PASS with 1 test

- [ ] **Step 3: Remove `portalViewMode` shell-takeover state from `App`**

```tsx
const [portalViewMode, setPortalViewMode] = useState<"standard"|"meal">("standard");
```

Delete the state above and remove these usages:

```tsx
if (id !== "portal") setPortalViewMode("standard");
```

```tsx
<div className={`app-shell${activeNav === "portal" && portalViewMode === "meal" ? " app-shell--meal-focus" : ""}`}>
```

```tsx
{!(activeNav === "portal" && portalViewMode === "meal") ? <Sidebar ... /> : null}
```

```tsx
onViewModeChange={setPortalViewMode}
```

- [ ] **Step 4: Remove `onViewModeChange` from `PortalView` props and effect wiring**

Delete these signatures and effects from `apps/web/src/main.tsx`:

```tsx
onViewModeChange: (mode: "standard" | "meal") => void;
```

```tsx
useEffect(() => {
  onViewModeChange(activeTab === "meal" ? "meal" : "standard");
}, [activeTab, onViewModeChange]);
```

- [ ] **Step 5: Run web build to verify the portal compiles without shell-takeover wiring**

Run: `npm run build --workspace @coachos/web`
Expected: PASS and a generated `dist/assets/index-*.js`

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/main.tsx apps/web/src/views/MealPlannerTab.test.tsx
git commit -m "refactor: keep meal tab inside portal shell"
```

### Task 2: Make `MealPlannerTab` an inline panel component, not a page-level owner

**Files:**
- Modify: `apps/web/src/views/MealPlannerTab.tsx`
- Test: `apps/web/src/views/MealPlannerTab.test.tsx`

- [ ] **Step 1: Remove the page-ownership prop and effect from `MealPlannerTab`**

Delete from the prop type:

```tsx
onViewModeChange?: (mode: "meal" | "standard") => void;
```

Delete from the function params:

```tsx
onViewModeChange,
```

Delete the effect:

```tsx
useEffect(() => {
  onViewModeChange?.("meal");
  return () => onViewModeChange?.("standard");
}, [onViewModeChange]);
```

- [ ] **Step 2: Keep the tab pills but treat them as inline portal tabs only**

Preserve:

```tsx
<div className="meal-tab-pills">
  <button className="active" type="button" onClick={() => onNavigateTab?.("meal")}>AI Meals</button>
  <button type="button" onClick={() => onNavigateTab?.("workout")}>Workout</button>
  <button type="button" onClick={() => onNavigateTab?.("messages")}>Messages</button>
  <button type="button" onClick={() => onNavigateTab?.("history")}>History</button>
</div>
```

but do not add any shell behavior around them.

- [ ] **Step 3: Ensure the component root is a panel-sized container, not a full-page shell**

Keep the root simple:

```tsx
<div className={`meal-workspace meal-workspace--figma${previewMode ? " meal-workspace--preview" : ""}${sentPlan ? " meal-workspace--sent" : ""}`}>
```

and do not add page-level width management props or effects.

- [ ] **Step 4: Update the test to assert the meal tab still renders as an inline panel**

Add this assertion:

```tsx
expect(screen.getByText("TARGETS FOR WEEK")).toBeInTheDocument();
expect(screen.getByText("AI Generate Day")).toBeInTheDocument();
expect(screen.getByText("Day Summary")).toBeInTheDocument();
```

- [ ] **Step 5: Run the focused test**

Run: `npm run test --workspace @coachos/web -- MealPlannerTab.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/views/MealPlannerTab.tsx apps/web/src/views/MealPlannerTab.test.tsx
git commit -m "refactor: make meal planner an inline portal panel"
```

### Task 3: Render AI Meal Planning and AI Workout Plan directly under the same portal header and pills

**Files:**
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Keep one shared header/action area for all portal tabs**

Retain the existing client identity/adherence/action shell and remove any meal-specific exclusion gates like:

```tsx
{activeTab !== "meal" && (
  <>
    {/* CLIENT HEADER */}
    ...
    {/* ACTION BAR */}
    ...
  </>
)}
```

Replace with unconditional shared rendering:

```tsx
<>
  {/* CLIENT HEADER */}
  ...
  {/* ACTION BAR */}
  ...
</>
```

- [ ] **Step 2: Keep one shared pill row for all portal tabs**

Retain this row as the only top-level tab switcher:

```tsx
<div className="portal-tab-row">
  {tabItems.map(t => (
    <button
      key={t.key}
      onClick={() => setActiveTab(t.key)}
      className={`portal-tab-btn${activeTab === t.key ? " portal-tab-btn--active" : ""}`}
    >
      {t.label}
      {t.badge ? <span className="portal-tab-badge">{t.badge}</span> : null}
    </button>
  ))}
</div>
```

- [ ] **Step 3: Render the meal planner in the normal content area, directly beneath the pills**

Keep the meal branch inline:

```tsx
{activeTab === "meal" && selectedPlannerDay && (
  <MealPlannerTab
    clientId={clientPortal.client.id}
    clientName={clientPortal.client.fullName}
    clientAdherence={clientPortal.client.adherenceScore}
    planId={clientPortal.plan?.id ?? null}
    initialWeek={mealWeek}
    initialTargets={macroTargets}
    onWeekChange={(w) => { setMealWeek(w); }}
    onTargetsChange={(t) => { setMacroTargets(t); }}
    onSaveStatus={() => setLastSavedAt(new Date())}
    onSendPlan={async () => {
      await saveMealPlan();
      setSentMealPlan(true);
    }}
    pushToast={push}
    onNavigateTab={(tab) => setActiveTab(tab)}
  />
)}
```

- [ ] **Step 4: Keep the workout branch inline as cards, not a separate page transition**

Use the existing `activeTab === "workout"` block, but make sure it stays under the same header and pill row instead of becoming a page takeover.

- [ ] **Step 5: Remove duplicate identity/adherence details from the header if repeated elsewhere in the tab content**

Specifically keep one copy only of:
- client name
- premium badge
- joined date / location
- adherence card
- submit check-in button

- [ ] **Step 6: Run web build to verify the portal compiles with inline meal and workout panels**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/main.tsx
git commit -m "feat: render meal and workout panels inline in portal"
```

### Task 4: Align meal planner visuals with the portal card system and keep the sidebar visible

**Files:**
- Modify: `apps/web/src/styles.css`

- [ ] **Step 1: Remove meal-specific app-shell takeover rules**

Delete or neutralize these rules:

```css
.app-shell--meal-focus {
  background: var(--bg-base);
}

.app-shell--meal-focus .page-content {
  margin-left: 0 !important;
  width: 100vw !important;
}

.app-shell--meal-focus .page-view {
  padding: 1.5rem 2rem 2rem !important;
}
```

- [ ] **Step 2: Constrain the meal planner to the same content width rhythm as overview cards**

Update the meal root to use the portal content column instead of a page-takeover width:

```css
.meal-workspace.meal-workspace--figma {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  gap: 0;
}
```

- [ ] **Step 3: Keep the meal cards visually consistent with portal cards**

Preserve the final override idea, but scope it to inline usage:

```css
.meal-workspace.meal-workspace--figma .meal-client-strip,
.meal-workspace.meal-workspace--figma .meal-targets-card,
.meal-workspace.meal-workspace--figma .meal-week-strip--figma,
.meal-workspace.meal-workspace--figma .meal-day-panel,
.meal-workspace.meal-workspace--figma .meal-side-card {
  border: 1px solid var(--outline-variant);
  border-radius: 24px;
  background: var(--surface-container-lowest);
  box-shadow: 0 8px 24px rgba(24, 28, 28, 0.05);
}
```

- [ ] **Step 4: Keep the right column as a portal subsection, not a detached page sidebar**

Use:

```css
.meal-workspace.meal-workspace--figma .meal-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 1rem;
  align-items: start;
}
```

and collapse to one column under 1180px.

- [ ] **Step 5: Run build to verify CSS compiles through Vite**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/styles.css
git commit -m "style: align inline meal planner with portal cards"
```

### Task 5: Final regression and browser verification

**Files:**
- Modify: `apps/web/src/views/MealPlannerTab.test.tsx` (only if extra assertions are needed)

- [ ] **Step 1: Run the focused meal tab test again**

Run: `npm run test --workspace @coachos/web -- MealPlannerTab.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the web build again**

Run: `npm run build --workspace @coachos/web`
Expected: PASS

- [ ] **Step 3: Verify the portal behavior manually in the browser**

Checklist:
- sidebar remains visible
- one client header only
- one adherence block only
- one submit check-in button only
- clicking `AI Meal Planning` shows meal cards directly under the pills
- clicking `AI Workout Plan` shows workout cards directly under the pills
- no full-page replacement occurs

- [ ] **Step 4: Commit final touch-ups if manual verification requires small fixes**

```bash
git add apps/web/src/main.tsx apps/web/src/views/MealPlannerTab.tsx apps/web/src/styles.css apps/web/src/views/MealPlannerTab.test.tsx
git commit -m "fix: inline portal planning panels"
```
