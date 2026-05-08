import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  Apple,
  GripVertical,
  Lock,
  Pencil,
  RefreshCcw,
  Send,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";

interface Meal {
  slot: string;
  name: string;
  timing: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  oilInstruction: string;
  portion: string;
  servings: string;
  note: string;
  optional?: boolean;
}

interface WeekDay {
  name: string;
  meals: Meal[];
}

interface DailyTarget {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlannerTabProps {
  initialWeek: WeekDay[];
  initialTargets: DailyTarget[];
  onWeekChange: (week: WeekDay[]) => void;
  onTargetsChange: (targets: DailyTarget[]) => void;
  onSaveStatus: (label: string) => void;
  onSendPlan: () => Promise<boolean>;
  pushToast: (msg: string, type?: "success" | "error" | "info") => void;
}

function emptyMeal(slot: string, optional = false): Meal {
  return {
    slot,
    name: "-",
    timing: "",
    cal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: [],
    steps: [],
    oilInstruction: "",
    portion: "",
    servings: "",
    note: "",
    optional,
  };
}

function getSlotIcon(slot: string): ReactNode {
  if (slot === "Breakfast") return <Apple size={14} strokeWidth={2.25} />;
  if (slot === "Lunch") return <UtensilsCrossed size={14} strokeWidth={2.25} />;
  if (slot === "Snacks") return <Apple size={14} strokeWidth={2.25} />;
  if (slot === "Dinner") return <UtensilsCrossed size={14} strokeWidth={2.25} />;
  return <UtensilsCrossed size={14} strokeWidth={2.25} />;
}

function statusClass(filledMeals: number, delta: number) {
  if (filledMeals === 0) return "meal-week-card--warn";
  if (Math.abs(delta) <= 150 && filledMeals >= 2) return "meal-week-card--good";
  return "meal-week-card--partial";
}

function splitLines(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export async function resolveMealPlanSend(onSendPlan: () => Promise<boolean>) {
  return onSendPlan();
}

export function MealPlannerTab({
  initialWeek,
  initialTargets,
  onWeekChange,
  onTargetsChange,
  onSaveStatus,
  onSendPlan,
  pushToast,
}: MealPlannerTabProps) {
  const [week, setWeek] = useState<WeekDay[]>(initialWeek);
  const [targets, setTargets] = useState<DailyTarget[]>(initialTargets);
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [copiedDay, setCopiedDay] = useState<WeekDay | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [sentPlan, setSentPlan] = useState(false);
  const [swapTarget, setSwapTarget] = useState<{ day: string; slot: string } | null>(null);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [showMacroSetup, setShowMacroSetup] = useState(false);
  const [macroDraft, setMacroDraft] = useState<DailyTarget[]>(initialTargets);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [dayNotes, setDayNotes] = useState<Record<string, string>>({});
  const [saveLabel, setSaveLabel] = useState("Last saved just now");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkDays, setBulkDays] = useState<string[]>([]);

  useEffect(() => {
    setWeek(initialWeek);
  }, [initialWeek]);

  useEffect(() => {
    setTargets(initialTargets);
    setMacroDraft(initialTargets);
  }, [initialTargets]);

  const updateWeek = useCallback((nextWeek: WeekDay[]) => {
    setWeek(nextWeek);
    onWeekChange(nextWeek);
    setSaveLabel("Last saved just now");
    onSaveStatus("Last saved just now");
  }, [onSaveStatus, onWeekChange]);

  const updateTargets = useCallback((nextTargets: DailyTarget[]) => {
    setTargets(nextTargets);
    onTargetsChange(nextTargets);
    setSaveLabel("Last saved just now");
    onSaveStatus("Last saved just now");
  }, [onSaveStatus, onTargetsChange]);

  const plannerDays = useMemo(() => {
    return week.map((day) => {
      const target = targets.find((item) => item.day === day.name) ?? targets[0];
      const actualMeals = day.meals.filter((meal) => meal.name !== "-");
      const actualCalories = actualMeals.reduce((sum, meal) => sum + meal.cal, 0);
      const actualProtein = actualMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const actualCarbs = actualMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const actualFat = actualMeals.reduce((sum, meal) => sum + meal.fat, 0);
      const delta = actualCalories - (target?.calories ?? 0);

      return {
        ...day,
        target,
        actualCalories,
        actualProtein,
        actualCarbs,
        actualFat,
        delta,
        filledMeals: actualMeals.length,
      };
    });
  }, [targets, week]);

  const selected = plannerDays.find((day) => day.name === selectedDay) ?? plannerDays[0];
  const normalMeals = selected.meals.filter((meal) => !meal.optional);
  const filledMeals = normalMeals.filter((meal) => meal.name !== "-");
  const emptyMeals = normalMeals.filter((meal) => meal.name === "-");
  const cheatMeal = selected.meals.find((meal) => meal.optional);
  const cheatEnabled = Boolean(cheatMeal);
  const noteValue = dayNotes[selected.name] ?? "";
  const averageCalories = Math.round(targets.reduce((sum, item) => sum + item.calories, 0) / Math.max(targets.length, 1));

  const qualityScore = useMemo(() => {
    if (filledMeals.length === 0) return 0;
    const calorieTarget = selected.target?.calories ?? 0;
    const calorieAccuracy = calorieTarget > 0 ? Math.max(0, 10 - Math.abs((selected.actualCalories - calorieTarget) / calorieTarget) * 10) : 5;
    const mealCoverage = Math.min(10, 4 + filledMeals.length * 1.5);
    const proteinTarget = selected.target?.protein ?? 0;
    const proteinAccuracy = proteinTarget > 0 ? Math.max(0, 10 - Math.abs((selected.actualProtein - proteinTarget) / proteinTarget) * 10) : 5;
    return Math.round((calorieAccuracy * 0.4 + mealCoverage * 0.3 + proteinAccuracy * 0.3) * 10) / 10;
  }, [filledMeals.length, selected.actualCalories, selected.actualProtein, selected.target?.calories, selected.target?.protein]);

  const statusText = filledMeals.length === 0
    ? "Needs meals"
    : Math.abs(selected.delta) <= 100
      ? "On Track!"
      : selected.delta > 0
        ? `Over by ${selected.delta} kcal`
        : `Under by ${Math.abs(selected.delta)} kcal`;

  const locked = previewMode || sentPlan;

  const editingMeal = editingSlot
    ? selected.meals.find((meal) => meal.slot === editingSlot) ?? null
    : null;

  const generateDay = useCallback(() => {
    const generatedMeals: Meal[] = [
      {
        slot: "Breakfast",
        name: "Greek Yogurt with Berries",
        timing: "7:30 AM",
        cal: 320,
        protein: 24,
        carbs: 35,
        fat: 8,
        ingredients: ["200g Greek yogurt", "60g mixed berries", "15g granola"],
        steps: ["Spoon yogurt into bowl", "Top with mixed berries", "Sprinkle granola to finish"],
        oilInstruction: "No oil required",
        portion: "1 bowl",
        servings: "1 serving",
        note: "High protein breakfast with antioxidant-rich berries. Use Greek yogurt for extra thickness.",
      },
      {
        slot: "Lunch",
        name: "Grilled Chicken Salad",
        timing: "1:00 PM",
        cal: 450,
        protein: 45,
        carbs: 28,
        fat: 15,
        ingredients: ["180g chicken breast", "80g mixed greens", "60g cherry tomatoes", "1 tsp olive oil", "Lemon juice"],
        steps: ["Season chicken with salt and pepper", "Grill 6–7 min each side until cooked through", "Toss greens and tomatoes, dress lightly with oil and lemon"],
        oilInstruction: "Use 1 tsp olive oil for dressing",
        portion: "1 large bowl",
        servings: "1 serving",
        note: "Lean protein with mixed greens and olive oil dressing.",
      },
      emptyMeal("Snacks"),
      emptyMeal("Dinner"),
    ];

    if (cheatEnabled) generatedMeals.push(emptyMeal("Cheat Meal", true));

    updateWeek(week.map((day) => day.name === selected.name ? { ...day, meals: generatedMeals } : day));
    pushToast(`AI meals generated for ${selected.name}.`, "success");
  }, [cheatEnabled, pushToast, selected.name, updateWeek, week]);

  const toggleCheatMeal = useCallback(() => {
    updateWeek(week.map((day) => {
      if (day.name !== selected.name) return day;
      const hasCheat = day.meals.some((meal) => meal.optional);
      return {
        ...day,
        meals: hasCheat ? day.meals.filter((meal) => !meal.optional) : [...day.meals, emptyMeal("Cheat Meal", true)],
      };
    }));
  }, [selected.name, updateWeek, week]);

  const copyDay = useCallback(() => {
    const day = week.find((item) => item.name === selected.name);
    if (!day) return;
    setCopiedDay(JSON.parse(JSON.stringify(day)) as WeekDay);
    pushToast(`${selected.name} copied.`, "success");
  }, [pushToast, selected.name, week]);

  const pasteDay = useCallback(() => {
    if (!copiedDay) return;
    const replace = selected.meals.every((meal) => meal.name === "-") || window.confirm(`${selected.name} already has meals. Replace them?`);
    updateWeek(week.map((day) => {
      if (day.name !== selected.name) return day;
      if (replace) return { ...day, meals: copiedDay.meals.map((meal) => ({ ...meal })) };
      return {
        ...day,
        meals: day.meals.map((meal) => {
          const source = copiedDay.meals.find((candidate) => candidate.slot === meal.slot);
          return meal.name === "-" && source ? { ...source } : meal;
        }),
      };
    }));
    pushToast(`Pasted into ${selected.name}.`, "success");
  }, [copiedDay, pushToast, selected.meals, selected.name, updateWeek, week]);

  const clearDay = useCallback(() => {
    if (!window.confirm(`Clear all meals for ${selected.name}?`)) return;
    updateWeek(week.map((day) => day.name === selected.name ? {
      ...day,
      meals: day.meals.map((meal) => meal.optional ? emptyMeal(meal.slot, true) : emptyMeal(meal.slot)),
    } : day));
    setEditingSlot(null);
    pushToast(`${selected.name} cleared.`, "info");
  }, [pushToast, selected.name, updateWeek, week]);

  const balanceWeek = useCallback(() => {
    const highest = [...plannerDays].sort((a, b) => (b.delta - a.delta))[0];
    const lowest = [...plannerDays].sort((a, b) => (a.delta - b.delta))[0];
    if (!highest || !lowest || highest.name === lowest.name) return;
    const shift = Math.min(150, Math.max(50, Math.round(Math.abs(highest.delta) / 50) * 50));

    updateWeek(week.map((day) => {
      if (day.name === highest.name) {
        return {
          ...day,
          meals: day.meals.map((meal, index) => index === 0 && meal.name !== "-" ? { ...meal, cal: Math.max(100, meal.cal - shift) } : meal),
        };
      }
      if (day.name === lowest.name) {
        return {
          ...day,
          meals: day.meals.map((meal, index) => index === 0 && meal.name !== "-" ? { ...meal, cal: meal.cal + shift } : meal),
        };
      }
      return day;
    }));

    pushToast(`Week balanced. ${lowest.name} +${shift} kcal, ${highest.name} -${shift} kcal.`, "success");
  }, [plannerDays, pushToast, updateWeek, week]);

  const addSlot = useCallback((slot: string, optional = false) => {
    updateWeek(week.map((day) => {
      if (day.name !== selected.name) return day;
      if (day.meals.some((meal) => meal.slot === slot)) return day;
      return { ...day, meals: [...day.meals, emptyMeal(slot, optional)] };
    }));
  }, [selected.name, updateWeek, week]);

  const deleteMeal = useCallback((slot: string) => {
    updateWeek(week.map((day) => day.name === selected.name ? {
      ...day,
      meals: day.meals.map((meal) => meal.slot === slot ? emptyMeal(slot, meal.optional) : meal),
    } : day));
    if (editingSlot === slot) setEditingSlot(null);
  }, [editingSlot, selected.name, updateWeek, week]);

  const toggleBulkDay = useCallback((dayName: string) => {
    setBulkDays((current) => current.includes(dayName) ? current.filter((item) => item !== dayName) : [...current, dayName]);
  }, []);

  const selectAllDays = useCallback(() => {
    setBulkDays((current) => current.length === plannerDays.length ? [] : plannerDays.map((day) => day.name));
  }, [plannerDays]);

  const addEmptySlot = useCallback((slot: string) => {
    pushToast(`${slot} can be populated from your recipe browser next.`, "info");
  }, [pushToast]);

  const updateMeal = useCallback((slot: string, patch: Partial<Meal>) => {
    updateWeek(week.map((day) => day.name === selected.name ? {
      ...day,
      meals: day.meals.map((meal) => meal.slot === slot ? { ...meal, ...patch } : meal),
    } : day));
  }, [selected.name, updateWeek, week]);

  const macroPercent = (actual: number, target: number) => {
    if (!target) return 0;
    return Math.max(0, Math.min(100, Math.round((actual / target) * 100)));
  };

  return (
    <div className={`meal-workspace meal-workspace--figma${previewMode ? " meal-workspace--preview" : ""}${sentPlan ? " meal-workspace--sent" : ""}`}>
      {previewMode ? <div className="meal-preview-banner">Client preview mode. Editing is hidden.</div> : null}
      {sentPlan ? <div className="meal-preview-banner meal-preview-banner--sent">Sent to client. This plan is locked.</div> : null}

      <button className="meal-targets-card" type="button" disabled={locked} onClick={() => { setMacroDraft(targets.map((item) => ({ ...item }))); setShowMacroSetup(true); }}>
        <div className="meal-targets-copy">
          <span className="meal-targets-eyebrow">TARGETS FOR WEEK</span>
          <div className="meal-targets-values">
            <strong>Avg: {averageCalories.toLocaleString()} kcal</strong>
            <b>P {targets[0]?.protein ?? 150}g</b>
            <b>C {targets[0]?.carbs ?? 210}g</b>
            <b>F {targets[0]?.fat ?? 58}g</b>
          </div>
        </div>
        <Pencil className="meal-target-edit" size={16} strokeWidth={2.25} />
      </button>

      <div className="meal-week-strip meal-week-strip--figma">
        {plannerDays.map((day) => (
          <button
            key={day.name}
            type="button"
            className={`meal-week-card ${day.name === selected.name ? "meal-week-card--active" : ""} ${statusClass(day.filledMeals, day.delta)} ${bulkDays.includes(day.name) ? "meal-week-card--selected-bulk" : ""}`}
            onClick={() => {
              setSelectedDay(day.name);
              setEditingSlot(null);
              if (bulkMode) toggleBulkDay(day.name);
            }}
          >
            <i />
            <span>{day.name}</span>
            <strong>{day.target?.calories.toLocaleString()}</strong>
          </button>
        ))}
      </div>

      <div className="meal-content-grid">
        <section className="meal-day-panel">
          <div className="meal-day-panel-header">
            <div>
              <span>{selected.name}</span>
              <h3>{selected.target?.calories.toLocaleString()} kcal</h3>
              <p>P {selected.target?.protein}g · C {selected.target?.carbs}g · F {selected.target?.fat}g</p>
            </div>
            <div className="meal-day-header-actions">
              <button className={`meal-cheat-toggle${cheatEnabled ? " meal-cheat-toggle--on" : ""}`} type="button" disabled={locked} onClick={toggleCheatMeal}>
                <span className="meal-cheat-switch"><i /></span>
                {cheatEnabled ? "Add Cheat Meal" : "Add Cheat Meal"}
              </button>
              <button className="meal-primary-action" type="button" disabled={locked} onClick={generateDay}>
                <Sparkles size={16} strokeWidth={2.25} />
                AI Generate Day
              </button>
            </div>
          </div>

          <div className="meal-detail-list">
            {filledMeals.map((meal) => {
              const noteKey = `${selected.name}-${meal.slot}`;
              const expanded = expandedNotes[noteKey] ?? false;
              const truncated = meal.note.length > 88 && !expanded ? `${meal.note.slice(0, 88)}...` : meal.note;
              const isEditing = editingSlot === meal.slot;
              return (
                <article
                  key={meal.slot}
                  className={`meal-detail-card meal-detail-card--filled${isEditing ? " meal-detail-card--editing" : ""}`}
                >
                  <div className="meal-detail-grip">
                    <GripVertical size={14} strokeWidth={2.25} />
                  </div>
                  <div className="meal-detail-main">
                    <div className="meal-detail-slot">
                      <span className="meal-slot-icon">{getSlotIcon(meal.slot)}</span>
                      <em>{meal.slot}</em>
                      {meal.timing ? <span className="meal-timing-badge">{meal.timing}</span> : null}
                    </div>
                    <h4>{meal.name}</h4>
                    <p>{meal.cal} kcal · {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F</p>
                    <small>
                      {truncated}
                      {meal.note.length > 88 ? (
                        <button className="meal-note-toggle" type="button" onClick={() => setExpandedNotes((current) => ({ ...current, [noteKey]: !current[noteKey] }))}>
                          {expanded ? "Show less" : "Show more"}
                        </button>
                      ) : null}
                    </small>
                    {meal.ingredients.length > 0 && !isEditing ? (
                      <div className="meal-card-pills">
                        {meal.ingredients.slice(0, 3).map((ing) => (
                          <span key={ing} className="meal-card-pill">{ing}</span>
                        ))}
                        {meal.ingredients.length > 3 ? <span className="meal-card-pill meal-card-pill--more">+{meal.ingredients.length - 3}</span> : null}
                      </div>
                    ) : null}
                  </div>
                  {!locked ? (
                    <div className="meal-detail-actions">
                      <button type="button" title="Edit meal details" onClick={() => setEditingSlot(isEditing ? null : meal.slot)}>
                        <Pencil size={15} strokeWidth={2.25} />
                      </button>
                      <button type="button" title="Smart Swap" onClick={() => setSwapTarget({ day: selected.name, slot: meal.slot })}>
                        <RefreshCcw size={15} strokeWidth={2.25} />
                      </button>
                      <button type="button" title="Delete" onClick={() => deleteMeal(meal.slot)}>
                        <Trash2 size={15} strokeWidth={2.25} />
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}

            {emptyMeals.map((meal) => (
              <button key={meal.slot} type="button" className="meal-add-row" disabled={locked} onClick={() => addEmptySlot(meal.slot)}>
                + Add {meal.slot}
              </button>
            ))}

            <button type="button" className="meal-add-row" disabled={locked} onClick={() => addSlot(`Custom Meal ${normalMeals.length + 1}`)}>
              + Add Custom Meal Slot
            </button>
          </div>

          <div className="meal-day-toolbar">
            <button type="button" disabled={locked} onClick={copyDay}>Copy Day</button>
            <button type="button" disabled={!copiedDay || locked} onClick={pasteDay}>Paste Day</button>
            <button type="button" disabled={locked} onClick={clearDay}>Clear Day</button>
          </div>

          {editingMeal ? (
            <div className="meal-detail-editor">
              <div className="meal-detail-editor-header">
                <div>
                  <span className="meal-detail-editor-eyebrow">Editing · {editingMeal.slot}</span>
                  <strong className="meal-detail-editor-title">{editingMeal.name === "-" ? "Empty meal" : editingMeal.name}</strong>
                </div>
                <button type="button" className="meal-detail-editor-close" onClick={() => setEditingSlot(null)}>
                  <X size={16} strokeWidth={2.25} />
                </button>
              </div>
              <div className="meal-detail-editor-grid">
                <label className="meal-detail-editor-full">
                  Meal name
                  <input
                    value={editingMeal.name === "-" ? "" : editingMeal.name}
                    disabled={locked}
                    placeholder="e.g. Greek Yogurt with Berries"
                    onChange={(event) => updateMeal(editingMeal.slot, { name: event.target.value || "-" })}
                  />
                </label>
                <label>
                  Timing
                  <input
                    value={editingMeal.timing}
                    disabled={locked}
                    placeholder="e.g. 7:30 AM"
                    onChange={(event) => updateMeal(editingMeal.slot, { timing: event.target.value })}
                  />
                </label>
                <label>
                  Portion size
                  <input
                    value={editingMeal.portion}
                    disabled={locked}
                    placeholder="e.g. 1 bowl"
                    onChange={(event) => updateMeal(editingMeal.slot, { portion: event.target.value })}
                  />
                </label>
                <label>
                  Serving quantity
                  <input
                    value={editingMeal.servings}
                    disabled={locked}
                    placeholder="e.g. 1 serving"
                    onChange={(event) => updateMeal(editingMeal.slot, { servings: event.target.value })}
                  />
                </label>
                <label>
                  Calories (kcal)
                  <input
                    type="number"
                    value={editingMeal.cal || ""}
                    disabled={locked}
                    placeholder="0"
                    onChange={(event) => updateMeal(editingMeal.slot, { cal: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Protein (g)
                  <input
                    type="number"
                    value={editingMeal.protein || ""}
                    disabled={locked}
                    placeholder="0"
                    onChange={(event) => updateMeal(editingMeal.slot, { protein: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Carbs (g)
                  <input
                    type="number"
                    value={editingMeal.carbs || ""}
                    disabled={locked}
                    placeholder="0"
                    onChange={(event) => updateMeal(editingMeal.slot, { carbs: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Fats (g)
                  <input
                    type="number"
                    value={editingMeal.fat || ""}
                    disabled={locked}
                    placeholder="0"
                    onChange={(event) => updateMeal(editingMeal.slot, { fat: Number(event.target.value) })}
                  />
                </label>
                <label className="meal-detail-editor-full">
                  Ingredients <span className="meal-detail-editor-hint">(one per line)</span>
                  <textarea
                    value={editingMeal.ingredients.join("\n")}
                    disabled={locked}
                    rows={4}
                    placeholder={"200g Greek yogurt\n60g mixed berries\n15g granola"}
                    onChange={(event) => updateMeal(editingMeal.slot, { ingredients: splitLines(event.target.value) })}
                  />
                </label>
                <label className="meal-detail-editor-full">
                  Cooking instructions <span className="meal-detail-editor-hint">(one step per line)</span>
                  <textarea
                    value={editingMeal.steps.join("\n")}
                    disabled={locked}
                    rows={4}
                    placeholder={"Season chicken with salt and pepper\nGrill 6–7 min each side\nRest 2 min before serving"}
                    onChange={(event) => updateMeal(editingMeal.slot, { steps: splitLines(event.target.value) })}
                  />
                </label>
                <label className="meal-detail-editor-full">
                  Oil &amp; fat instructions
                  <input
                    value={editingMeal.oilInstruction}
                    disabled={locked}
                    placeholder="e.g. Use 1 tsp olive oil for dressing"
                    onChange={(event) => updateMeal(editingMeal.slot, { oilInstruction: event.target.value })}
                  />
                </label>
                <label className="meal-detail-editor-full">
                  Coach notes
                  <textarea
                    value={editingMeal.note}
                    disabled={locked}
                    rows={3}
                    placeholder="Additional notes visible on the client plan…"
                    onChange={(event) => updateMeal(editingMeal.slot, { note: event.target.value })}
                  />
                </label>
              </div>
            </div>
          ) : null}

          <div className="meal-global-footer">
            <div className="meal-global-footer-left">
              <button type="button" disabled={locked} onClick={selectAllDays}>Select All</button>
              <button type="button" disabled={locked} onClick={() => setBulkMode((value) => !value)}>{bulkMode ? "Exit Bulk Select" : "Bulk Select"}</button>
              <button type="button" disabled={locked} onClick={balanceWeek} className="meal-balance-btn">
                <Sparkles size={16} strokeWidth={2.25} />
                AI Balance Week
              </button>
              <button type="button" onClick={() => setPreviewMode((value) => !value)}>{previewMode ? "Exit Preview" : "Preview as Client"}</button>
            </div>
            <div className="meal-global-footer-right">
              <span>{saveLabel}</span>
              <button
                className="meal-send-btn"
                type="button"
                disabled={sentPlan}
                onClick={async () => {
                  const wasSent = await resolveMealPlanSend(onSendPlan);
                  if (wasSent) {
                    setSentPlan(true);
                  }
                }}
              >
                <Send size={16} strokeWidth={2.25} />
                {sentPlan ? "Sent to Client" : "Send to Client"}
              </button>
            </div>
          </div>
        </section>

        <aside className="meal-right-panel meal-right-panel--figma">
          <section className="meal-side-card">
            <h3>Day Summary</h3>
            <div className="meal-summary-row">
              <div><span>Protein</span><b>{selected.actualProtein}g / {selected.target?.protein}g</b></div>
              <div className="meal-summary-bar meal-summary-bar--protein"><i style={{ width: `${macroPercent(selected.actualProtein, selected.target?.protein ?? 0)}%` }} /></div>
              <small>{macroPercent(selected.actualProtein, selected.target?.protein ?? 0)}%</small>
            </div>
            <div className="meal-summary-row">
              <div><span>Carbs</span><b>{selected.actualCarbs}g / {selected.target?.carbs}g</b></div>
              <div className="meal-summary-bar meal-summary-bar--carbs"><i style={{ width: `${macroPercent(selected.actualCarbs, selected.target?.carbs ?? 0)}%` }} /></div>
              <small>{macroPercent(selected.actualCarbs, selected.target?.carbs ?? 0)}%</small>
            </div>
            <div className="meal-summary-row">
              <div><span>Fats</span><b>{selected.actualFat}g / {selected.target?.fat}g</b></div>
              <div className="meal-summary-bar meal-summary-bar--fats"><i style={{ width: `${macroPercent(selected.actualFat, selected.target?.fat ?? 0)}%` }} /></div>
              <small>{macroPercent(selected.actualFat, selected.target?.fat ?? 0)}%</small>
            </div>
            <div className="meal-status-line meal-status-line--center">
              <strong>{statusText === "On Track!" ? "✓ On Track!" : statusText}</strong>
            </div>
          </section>

          <section className="meal-side-card">
            <h3>AI Insights</h3>
            <ul className="meal-insight-list">
              {filledMeals.length === 0 ? (
                <li>Add meals to generate insights.</li>
              ) : (
                <>
                  <li>Protein distribution is optimal across meals</li>
                  <li>Good micronutrient variety with berries and greens</li>
                  <li>Consider adding a healthy fat source at lunch</li>
                </>
              )}
            </ul>
          </section>

          <section className="meal-side-card meal-score-panel">
            <h3>Nutrition Quality</h3>
            <div className="meal-score-stack">
              <div className="meal-score-ring">
                <strong>{qualityScore.toFixed(1)}</strong>
              </div>
              <span className="meal-score-outof">out of 10</span>
              <div className="meal-score-tags">
                <span>High in protein</span>
                <span>Good variety</span>
              </div>
            </div>
          </section>

          <section className="meal-side-card">
            <div className="meal-private-lock">
              <Lock size={15} strokeWidth={2.25} />
              Private to coach - auto-saved
            </div>
            <textarea
              className="meal-private-notes"
              maxLength={250}
              placeholder="Add notes for this day"
              value={noteValue}
              onChange={(event) => {
                const value = event.target.value;
                setDayNotes((current) => ({ ...current, [selected.name]: value }));
                setSaveLabel("Last saved just now");
                onSaveStatus("Last saved just now");
              }}
            />
            <div className="meal-note-count">{noteValue.length} / 250</div>
          </section>
        </aside>
      </div>

      {swapTarget ? (
        <div className="meal-swap-popover">
          <div className="meal-swap-header">
            <div>
              <span>Smart Swap</span>
              <strong>{week.find((day) => day.name === swapTarget.day)?.meals.find((meal) => meal.slot === swapTarget.slot)?.name}</strong>
            </div>
            <button type="button" onClick={() => setSwapTarget(null)}>
              <X size={16} strokeWidth={2.25} />
            </button>
          </div>
          <div className="meal-swap-options">
            {[
              { name: "Cottage Cheese Bowl", cal: 310, protein: 33, carbs: 36, fat: 7, note: "Similar macros, different texture.", ingredients: ["250g cottage cheese", "50g berries", "10g chia seeds"], steps: ["Scoop cottage cheese into bowl", "Top with berries and chia seeds"], oilInstruction: "No oil required", portion: "1 bowl", servings: "1 serving" },
              { name: "Salmon & Asparagus", cal: 440, protein: 43, carbs: 26, fat: 16, note: "Rich in omega-3.", ingredients: ["180g salmon fillet", "100g asparagus", "1 tsp olive oil", "Lemon"], steps: ["Season salmon with lemon and pepper", "Pan-fry 4 min each side", "Steam asparagus 3–4 min"], oilInstruction: "Use 1 tsp olive oil for pan", portion: "1 plate", servings: "1 serving" },
              { name: "Turkey Wrap", cal: 460, protein: 46, carbs: 29, fat: 14, note: "High protein, easy to prep.", ingredients: ["160g ground turkey", "1 whole-wheat wrap", "Lettuce", "Tomato", "Mustard"], steps: ["Cook turkey with seasoning", "Layer onto wrap with salad", "Roll tightly and slice"], oilInstruction: "Use cooking spray or 0.5 tsp oil", portion: "1 wrap", servings: "1 serving" },
            ].map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => {
                  updateWeek(week.map((day) => day.name === swapTarget.day ? {
                    ...day,
                    meals: day.meals.map((meal) => meal.slot === swapTarget.slot ? {
                      ...meal,
                      name: option.name,
                      cal: option.cal,
                      protein: option.protein,
                      carbs: option.carbs,
                      fat: option.fat,
                      note: option.note,
                      ingredients: option.ingredients,
                      steps: option.steps,
                      oilInstruction: option.oilInstruction,
                      portion: option.portion,
                      servings: option.servings,
                    } : meal),
                  } : day));
                  setSwapTarget(null);
                  pushToast(`Swapped to ${option.name}.`, "success");
                }}
              >
                <strong>{option.name}</strong>
                <span>{option.cal} kcal · {option.protein}g P · {option.carbs}g C · {option.fat}g F</span>
                <small>{option.note}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showMacroSetup ? (
        <div className="modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) setShowMacroSetup(false); }}>
          <div className="modal-panel macro-setup-modal">
            <div className="macro-setup-header">
              <div>
                <p className="eyebrow">Macro Setup</p>
                <h2>Shape the week</h2>
              </div>
              <button className="modal-close-btn" type="button" onClick={() => setShowMacroSetup(false)}>
                <X size={16} strokeWidth={2.25} />
              </button>
            </div>
            <label className="macro-preset-label">
              Progression Preset
              <select onChange={(event) => {
                const value = event.target.value;
                if (value === "increase100") {
                  setMacroDraft((current) => current.map((item, index) => ({ ...item, calories: 1600 + index * 100 })));
                } else if (value === "reverse50") {
                  setMacroDraft((current) => current.map((item, index) => ({ ...item, calories: Math.max(1400, 2200 - index * 50) })));
                } else {
                  setMacroDraft((current) => current.map((item) => ({ ...item, calories: 1950 })));
                }
              }}>
                <option value="fixed">Fixed</option>
                <option value="increase100">Increase 100 kcal/day</option>
                <option value="reverse50">Reverse 50 kcal/week</option>
              </select>
            </label>
            <div className="macro-setup-chart">
              {macroDraft.map((item) => {
                const height = Math.max(18, Math.min(110, Math.round((item.calories / 2600) * 110)));
                return (
                  <div key={item.day}>
                    <span style={{ height }} />
                    <small>{item.day}</small>
                  </div>
                );
              })}
            </div>
            <div className="macro-table">
              <div className="macro-table-head"><span>Day</span><span>Calories</span><span>Protein</span><span>Carbs</span><span>Fat</span></div>
              {macroDraft.map((item) => (
                <div key={item.day} className="macro-table-row">
                  <strong>{item.day}</strong>
                  <input type="number" value={item.calories} onChange={(event) => setMacroDraft((current) => current.map((row) => row.day === item.day ? { ...row, calories: Number(event.target.value) } : row))} />
                  <input type="number" value={item.protein} onChange={(event) => setMacroDraft((current) => current.map((row) => row.day === item.day ? { ...row, protein: Number(event.target.value) } : row))} />
                  <input type="number" value={item.carbs} onChange={(event) => setMacroDraft((current) => current.map((row) => row.day === item.day ? { ...row, carbs: Number(event.target.value) } : row))} />
                  <input type="number" value={item.fat} onChange={(event) => setMacroDraft((current) => current.map((row) => row.day === item.day ? { ...row, fat: Number(event.target.value) } : row))} />
                </div>
              ))}
            </div>
            <div className="macro-setup-actions">
              <button className="btn-ghost" type="button" onClick={() => setShowMacroSetup(false)}>Cancel</button>
              <button className="btn-primary" type="button" onClick={() => { updateTargets(macroDraft); setShowMacroSetup(false); pushToast("Targets updated.", "success"); }}>Apply</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
