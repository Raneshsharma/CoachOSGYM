import React, { useEffect, useMemo, useState } from "react";

export type WorkoutExercise = {
  id: number;
  name: string;
  tag: string;
  sets: string;
  duration: string;
  advanced: string;
  bodyPart?: string;
  equipment?: string;
};

export type WorkoutWeekDay = {
  name: string;
  durationMinutes?: number | null;
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
  requestJson?: <T>(path: string, init?: RequestInit) => Promise<T>;
};

type DragState =
  | { source: "library"; exercise: WorkoutExercise }
  | { source: "timeline"; index: number }
  | null;

const workoutLibrary = [
  { id: 9001, name: "Goblet Squat", tag: "Legs", bodyPart: "Legs", equipment: "Dumbbells" },
  { id: 9002, name: "Bench Press", tag: "Push", bodyPart: "Chest", equipment: "Barbell" },
  { id: 9003, name: "Lat Pulldown", tag: "Pull", bodyPart: "Back", equipment: "Cable" },
];

const workoutTemplates: Record<string, WorkoutExercise[]> = {
  "Full Body": [
    { id: 1, name: "Goblet Squat", tag: "Legs", sets: "4 x 10", duration: "8 min", advanced: "", bodyPart: "Legs", equipment: "Dumbbells" },
    { id: 2, name: "Bench Press", tag: "Push", sets: "4 x 8", duration: "10 min", advanced: "", bodyPart: "Chest", equipment: "Barbell" },
    { id: 3, name: "Lat Pulldown", tag: "Pull", sets: "4 x 10", duration: "8 min", advanced: "", bodyPart: "Back", equipment: "Cable" },
  ],
  "Lower Body": [
    { id: 1, name: "Romanian Deadlift", tag: "Legs", sets: "4 x 8", duration: "10 min", advanced: "", bodyPart: "Hamstrings", equipment: "Barbell" },
    { id: 2, name: "Split Squat", tag: "Legs", sets: "3 x 10", duration: "8 min", advanced: "", bodyPart: "Quads", equipment: "Dumbbells" },
  ],
};

const workoutSwapPool: Record<string, WorkoutExercise[]> = {
  Legs: [
    { id: 101, name: "Reverse Lunge", tag: "Legs", sets: "3 x 10", duration: "8 min", advanced: "", bodyPart: "Legs", equipment: "Dumbbells" },
    { id: 102, name: "Leg Press", tag: "Legs", sets: "4 x 10", duration: "10 min", advanced: "", bodyPart: "Legs", equipment: "Machine" },
  ],
  Back: [
    { id: 103, name: "Seated Row", tag: "Back", sets: "4 x 10", duration: "8 min", advanced: "", bodyPart: "Back", equipment: "Cable" },
  ],
  Chest: [
    { id: 104, name: "Incline Dumbbell Press", tag: "Push", sets: "3 x 10", duration: "8 min", advanced: "", bodyPart: "Chest", equipment: "Dumbbells" },
  ],
};

function cloneWeek(week: WorkoutWeekDay[]) {
  return week.map((day) => ({
    ...day,
    exercises: day.exercises.map((exercise) => ({ ...exercise })),
  }));
}

function toLibraryExercise(exercise: typeof workoutLibrary[number]): WorkoutExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    tag: exercise.tag,
    sets: "3 x 10",
    duration: "8 min",
    advanced: "",
    bodyPart: exercise.bodyPart,
    equipment: exercise.equipment,
  };
}

function nextExerciseId(week: WorkoutWeekDay[]) {
  return week.flatMap((day) => day.exercises).reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function summarizeWorkout(exercises: WorkoutExercise[]) {
  const parseSetCount = (value: string) => {
    const normalized = value.trim();
    const match = normalized.match(/^(\d+)\s*(x|sets?)/i);
    return match ? Number(match[1]) : 0;
  };

  const parseDuration = (value: string) => {
    const match = value.match(/(\d+)/);
    if (!match) return { minutes: 0, isSeconds: false };
    const amount = Number(match[1]);
    if (/sec/i.test(value)) return { minutes: amount / 60, isSeconds: true };
    return { minutes: amount, isSeconds: false };
  };

  const totalSets = exercises.reduce((sum, ex) => sum + parseSetCount(ex.sets), 0);

  const estDuration = Math.ceil(
    exercises.reduce((sum, ex) => {
      const sets = Math.max(1, parseSetCount(ex.sets));
      const duration = parseDuration(ex.duration);
      return sum + (duration.isSeconds ? duration.minutes * sets : duration.minutes);
    }, 0),
  );

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
    insights.push("Rest periods and movement coverage look appropriate for today's session.");
  }

  return insights.slice(0, 3);
}

export function insertExerciseAt(
  week: WorkoutWeekDay[],
  dayName: WorkoutWeekDay["name"],
  exercise: WorkoutExercise,
  index: number,
): WorkoutWeekDay[] {
  return week.map((day) => {
    if (day.name !== dayName) return day;
    const nextExercises = [...day.exercises];
    nextExercises.splice(index, 0, { ...exercise });
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
    if (!moved) return day;
    nextExercises.splice(targetIndex, 0, moved);
    return { ...day, exercises: nextExercises };
  });
}

export function replaceExerciseById(
  week: WorkoutWeekDay[],
  dayName: WorkoutWeekDay["name"],
  exerciseId: number,
  replacement: WorkoutExercise,
): WorkoutWeekDay[] {
  return week.map((day) => {
    if (day.name !== dayName) return day;
    return {
      ...day,
      exercises: day.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...replacement } : exercise,
      ),
    };
  });
}

export function updateWorkoutDayNotes(
  week: WorkoutWeekDay[],
  dayName: WorkoutWeekDay["name"],
  notes: string,
): WorkoutWeekDay[] {
  return week.map((day) =>
    day.name === dayName ? { ...day, notes } : day,
  );
}

export async function generateWorkoutDay(
  args: {
    clientId: string;
    day: WorkoutWeekDay["name"];
    focus: string;
    duration: number;
  },
  fetcher?: <T>(path: string, init?: RequestInit) => Promise<T>,
) {
  try {
    const request: <T>(path: string, init?: RequestInit) => Promise<T> =
      fetcher ??
      (async (path: string, init?: RequestInit) => {
        const response = await fetch(path, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
          },
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json() as Promise<any>;
      });
    const response = await request<{ exercises: WorkoutExercise[] }>(
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
      id: index + 1,
    }));
  }
}

export function WorkoutPlannerTab({
  clientId,
  initialWeek,
  onWeekChange,
  pushToast,
  requestJson,
}: WorkoutPlannerTabProps) {
  const [week, setWeek] = useState<WorkoutWeekDay[]>(() => cloneWeek(initialWeek));
  const [selectedDay, setSelectedDay] = useState<WorkoutWeekDay["name"]>("Mon");
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({});
  const [dragState, setDragState] = useState<DragState>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [swapTargetId, setSwapTargetId] = useState<number | null>(null);

  useEffect(() => {
    setWeek(cloneWeek(initialWeek));
  }, [initialWeek]);

  useEffect(() => {
    const notesMap = Object.fromEntries(
      initialWeek.map((day) => [day.name, day.notes ?? ""]),
    );
    setPrivateNotes(notesMap);
  }, [initialWeek]);

  const selectedWorkoutDay = useMemo(
    () => week.find((day) => day.name === selectedDay) ?? week[0],
    [selectedDay, week],
  );
  const selectedExercises = selectedWorkoutDay?.exercises ?? [];
  const workoutSummary = summarizeWorkout(selectedExercises);
  const workoutInsights = buildWorkoutInsights(selectedExercises);

  const totalExercises = week.reduce((sum, day) => sum + day.exercises.length, 0);
  const activeDays = week.filter((day) => day.exercises.length > 0).length;

  const updateWeek = (nextWeek: WorkoutWeekDay[]) => {
    const cloned = cloneWeek(nextWeek);
    setWeek(cloned);
    onWeekChange(cloned);
  };

  const commitDrop = (index: number) => {
    if (!selectedWorkoutDay || !dragState) return;

    let nextWeek = week;
    if (dragState.source === "library") {
      const newExercise = { ...dragState.exercise, id: nextExerciseId(week) };
      nextWeek = insertExerciseAt(week, selectedWorkoutDay.name, newExercise, index);
      pushToast(`Added ${newExercise.name} to ${selectedWorkoutDay.name}.`, "success");
    } else {
      nextWeek = reorderExercises(week, selectedWorkoutDay.name, dragState.index, index);
      pushToast(`Reordered workout for ${selectedWorkoutDay.name}.`, "info");
    }

    updateWeek(nextWeek);
    setDragState(null);
    setDropIndex(null);
  };

  const appendCustomExercise = () => {
    if (!selectedWorkoutDay) return;
    const customExercise: WorkoutExercise = {
      id: nextExerciseId(week),
      name: "Custom Exercise",
      tag: "Custom",
      sets: "3 x 10",
      duration: "8 min",
      advanced: "",
    };

    updateWeek(insertExerciseAt(week, selectedWorkoutDay.name, customExercise, selectedExercises.length));
    pushToast(`Added a custom exercise to ${selectedWorkoutDay.name}.`, "success");
  };

  const handleDeleteExercise = (exerciseId: number, exerciseName: string) => {
    if (!selectedWorkoutDay) return;
    const nextWeek = week.map((day) =>
      day.name === selectedWorkoutDay.name
        ? { ...day, exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId) }
        : day,
    );
    updateWeek(nextWeek);
    pushToast(`Removed ${exerciseName} from ${selectedWorkoutDay.name}.`, "success");
  };

  const handleSwapExercise = (exerciseId: number, replacement: WorkoutExercise) => {
    if (!selectedWorkoutDay) return;
    const nextWeek = replaceExerciseById(week, selectedWorkoutDay.name, exerciseId, {
      ...replacement,
      id: exerciseId,
    });
    updateWeek(nextWeek);
    setSwapTargetId(null);
    pushToast(`Swapped in ${replacement.name}.`, "success");
  };

  const handleGenerateWorkout = () => {
    if (!selectedWorkoutDay) return;

    void (async () => {
      if (selectedExercises.length > 0 && !window.confirm(`Replace the workout for ${selectedWorkoutDay.name}?`)) {
        return;
      }

      const generated = await generateWorkoutDay({
        clientId,
        day: selectedWorkoutDay.name,
        focus: selectedWorkoutDay.focus || "Full Body",
        duration: selectedWorkoutDay.durationMinutes || 45,
      }, requestJson);

      const nextWeek = week.map((day) =>
        day.name === selectedWorkoutDay.name
          ? { ...day, exercises: generated }
          : day,
      );

      updateWeek(nextWeek);
      pushToast(`Workout generated for ${selectedWorkoutDay.name}.`, "success");
    })();
  };

  return (
    <div className="workout-planner-tab">
      <div className="workout-planner-week-strip">
        {week.map((day) => {
          const isActive = day.name === selectedWorkoutDay?.name;
          const hasExercises = day.exercises.length > 0;
          return (
            <button
              key={day.name}
              type="button"
              className={`workout-planner-day${isActive ? " workout-planner-day--active" : ""}${!hasExercises ? " workout-planner-day--empty" : ""}`}
              onClick={() => setSelectedDay(day.name)}
            >
              <span>{day.name}</span>
              <strong>{day.durationMinutes ?? (day.isRest ? "--" : day.exercises.length)}</strong>
            </button>
          );
        })}
      </div>

      <div className="workout-planner-layout">
        <section className="workout-planner-main">
          <div className="workout-planner-header">
            <div>
              <span className="workout-planner-label">Selected Day</span>
              <h3>{selectedWorkoutDay?.name ?? "Mon"}</h3>
              <p className="workout-planner-copy">
                {selectedWorkoutDay?.focus
                  ? `${selectedWorkoutDay.focus} - ${selectedWorkoutDay.durationMinutes ?? 45} min`
                  : `${selectedWorkoutDay?.durationMinutes ?? 45} min planned`}
              </p>
            </div>
            <button
              type="button"
              className="workout-planner-generate-btn"
              onClick={handleGenerateWorkout}
            >
              AI Generate Workout
            </button>
          </div>

          <div className="workout-planner-canvas">
            <aside className="workout-planner-library">
              <div className="workout-planner-section-title">Exercise Library</div>
              <div className="workout-planner-library-list">
                {workoutLibrary.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    className="workout-planner-library-item"
                    draggable
                    onDragStart={() => setDragState({ source: "library", exercise: toLibraryExercise(exercise) })}
                    onClick={() => {
                      if (!selectedWorkoutDay) return;
                      const next = insertExerciseAt(
                        week,
                        selectedWorkoutDay.name,
                        { ...toLibraryExercise(exercise), id: nextExerciseId(week) },
                        selectedExercises.length,
                      );
                      updateWeek(next);
                      pushToast(`Added ${exercise.name} to ${selectedWorkoutDay.name}.`, "success");
                    }}
                  >
                    <strong>{exercise.name}</strong>
                    <span>{exercise.bodyPart} - {exercise.equipment}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="workout-planner-timeline">
              <div className="workout-planner-section-title">Current Session</div>
              <p className="workout-planner-copy">
                {selectedExercises.length
                  ? `${selectedWorkoutDay.exercises.length} exercises planned for ${selectedWorkoutDay.name}.`
                  : `No exercises planned for ${selectedWorkoutDay?.name ?? "Mon"} yet.`}
              </p>

              <div className="workout-planner-exercise-list">
                <button
                  type="button"
                  className={`workout-planner-drop-zone${dropIndex === 0 ? " workout-planner-drop-zone--active" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropIndex(0);
                  }}
                  onDrop={() => commitDrop(0)}
                >
                  Drop here
                </button>

                {selectedExercises.map((exercise, index) => (
                  <React.Fragment key={exercise.id}>
                    <article
                      className="workout-planner-exercise-card"
                      draggable
                      onDragStart={() => setDragState({ source: "timeline", index })}
                    >
                      <div className="workout-planner-exercise-header">
                        <div>
                          <strong>{exercise.name}</strong>
                          <span>{exercise.tag}</span>
                        </div>
                        <div className="workout-planner-exercise-actions">
                          <button type="button" onClick={() => setSwapTargetId((current) => current === exercise.id ? null : exercise.id)}>
                            Swap
                          </button>
                          <button type="button" onClick={() => handleDeleteExercise(exercise.id, exercise.name)}>
                            Delete
                          </button>
                        </div>
                      </div>
                      <p>{exercise.sets} - {exercise.duration}</p>
                      {exercise.advanced ? <p>{exercise.advanced}</p> : null}
                      {swapTargetId === exercise.id ? (
                        <div className="workout-planner-swap-menu">
                          {(workoutSwapPool[exercise.bodyPart || exercise.tag] || []).map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleSwapExercise(exercise.id, option)}
                            >
                              {option.name}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </article>

                    <button
                      type="button"
                      className={`workout-planner-drop-zone${dropIndex === index + 1 ? " workout-planner-drop-zone--active" : ""}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDropIndex(index + 1);
                      }}
                      onDrop={() => commitDrop(index + 1)}
                    >
                      Drop here
                    </button>
                  </React.Fragment>
                ))}
              </div>

              <button
                type="button"
                className="workout-planner-custom-btn"
                onClick={appendCustomExercise}
              >
                Add Custom Exercise
              </button>
            </div>
          </div>
        </section>

        <aside className="workout-planner-side">
          <section className="workout-planner-rail-card">
            <h3>Workout Summary</h3>
            <p>{workoutSummary.totalSets} sets</p>
            <p>{workoutSummary.estDuration} min estimated</p>
            <p>{workoutSummary.volumeLoadLabel} volume load</p>
            <p>{workoutSummary.targetMuscles.join(", ") || "No workout planned"}</p>
            <p>{activeDays} active days this week</p>
            <p>{totalExercises} total exercises planned</p>
          </section>

          <section className="workout-planner-rail-card">
            <h3>AI Insights</h3>
            <ul>
              {workoutInsights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </section>

          <section className="workout-planner-rail-card">
            <h3>Private to coach - auto-saved</h3>
            <textarea
              value={privateNotes[selectedWorkoutDay?.name ?? "Mon"] ?? ""}
              onChange={(event) => {
                const dayName = selectedWorkoutDay?.name ?? "Mon";
                const notes = event.target.value.slice(0, 250);
                setPrivateNotes((prev) => ({
                  ...prev,
                  [dayName]: notes,
                }));
                updateWeek(updateWorkoutDayNotes(week, dayName, notes));
              }}
              placeholder="Add coaching notes for this workout day..."
            />
            <p>{(privateNotes[selectedWorkoutDay?.name ?? "Mon"] ?? "").length} / 250</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
