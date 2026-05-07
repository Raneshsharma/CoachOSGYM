// apps/api/src/app.ts
import express from "express";
import cors from "cors";

// packages/domain/src/index.ts
import { z } from "zod";
var coachWorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  brandColor: z.string(),
  accentColor: z.string(),
  heroMessage: z.string(),
  stripeConnected: z.boolean(),
  parallelRunDaysLeft: z.number().int().nonnegative()
});
var coachUserSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  gender: z.enum(["male", "female"]).optional().default("male")
});
var clientProfileSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  fullName: z.string(),
  email: z.email(),
  goal: z.string(),
  status: z.enum(["active", "at_risk", "trial", "inactive"]),
  adherenceScore: z.number().min(0).max(100),
  currentPlanId: z.string().nullable(),
  monthlyPriceGbp: z.number().nonnegative(),
  nextRenewalDate: z.string(),
  lastCheckInDate: z.string().nullable(),
  // Extended profile fields
  healthConditions: z.array(z.object({ label: z.string(), note: z.string() })).default([]),
  dailyWaterTarget: z.number().int().nonnegative().default(3),
  dailyStepsTarget: z.number().int().nonnegative().default(1e4),
  supplements: z.array(z.string()).default([]),
  nutritionCalories: z.number().int().nonnegative().nullable().default(null),
  nutritionProteinG: z.number().int().nonnegative().nullable().default(null),
  nutritionFatG: z.number().int().nonnegative().nullable().default(null),
  nutritionCarbsG: z.number().int().nonnegative().nullable().default(null),
  nutritionCoachNote: z.string().default("")
});
var clientProfilePatchSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.email().optional(),
  goal: z.string().min(3).optional(),
  status: z.enum(["active", "at_risk", "trial", "inactive"]).optional(),
  monthlyPriceGbp: z.number().nonnegative().optional(),
  nextRenewalDate: z.string().optional(),
  healthConditions: z.array(z.object({ label: z.string(), note: z.string() })).optional(),
  dailyWaterTarget: z.number().int().nonnegative().optional(),
  dailyStepsTarget: z.number().int().nonnegative().optional(),
  supplements: z.array(z.string()).optional(),
  nutritionCalories: z.number().int().nonnegative().nullable().optional(),
  nutritionProteinG: z.number().int().nonnegative().nullable().optional(),
  nutritionFatG: z.number().int().nonnegative().nullable().optional(),
  nutritionCarbsG: z.number().int().nonnegative().nullable().optional(),
  nutritionCoachNote: z.string().optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one client field must be provided."
});
var progressMetricSchema = z.object({
  weightKg: z.number().nullable(),
  energyScore: z.number().min(1).max(10),
  steps: z.number().int().nonnegative(),
  waistCm: z.number().nullable(),
  adherenceScore: z.number().int().min(0).max(100).nullable(),
  notes: z.string()
});
var checkInSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  submittedAt: z.string(),
  progress: progressMetricSchema,
  photoCount: z.number().int().nonnegative()
});
var planVersionSchema = z.object({
  id: z.string(),
  planId: z.string(),
  versionNumber: z.number().int().positive(),
  status: z.enum(["draft", "approved"]),
  explanation: z.array(z.string()),
  workouts: z.array(z.string()),
  nutrition: z.array(z.string()),
  updatedAt: z.string()
});
var programPlanSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  coachId: z.string(),
  title: z.string(),
  latestVersion: planVersionSchema
});
var paymentSubscriptionSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  status: z.enum(["active", "past_due", "trialing", "cancelled"]),
  amountGbp: z.number().positive(),
  renewalDate: z.string()
});
var riskAlertSchema = z.object({
  clientId: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  reasons: z.array(z.string()),
  recommendedAction: z.string()
});
var proofCardSchema = z.object({
  clientId: z.string(),
  headline: z.string(),
  body: z.string(),
  stats: z.array(z.object({ label: z.string(), value: z.string() }))
});
var messageSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  coachId: z.string(),
  sender: z.enum(["coach", "client"]),
  content: z.string(),
  sentAt: z.string(),
  readAt: z.string().nullable()
});
var importRowSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  goal: z.string().min(3),
  monthlyPriceGbp: z.coerce.number().positive()
});
var groupProgramSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  title: z.string(),
  description: z.string(),
  goal: z.string(),
  memberIds: z.array(z.string()),
  monthlyPriceGbp: z.number().nonnegative(),
  status: z.enum(["active", "archived", "upcoming"]),
  createdAt: z.string()
});
var habitSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  title: z.string(),
  target: z.number().int().positive(),
  frequency: z.enum(["daily", "weekly"]),
  createdAt: z.string()
});
var habitCompletionSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(),
  completed: z.boolean()
});
var nutritionSwapSchema = z.object({
  id: z.string(),
  planId: z.string(),
  originalFood: z.object({
    name: z.string(),
    calories: z.number().int().nonnegative(),
    proteinG: z.number(),
    carbsG: z.number(),
    fatG: z.number(),
    portion: z.string()
  }),
  swapSuggestion: z.object({
    name: z.string(),
    calories: z.number().int().nonnegative(),
    proteinG: z.number(),
    carbsG: z.number(),
    fatG: z.number(),
    portion: z.string(),
    reasoning: z.string()
  }),
  appliedAt: z.string().nullable()
});
var analyticsEventSchema = z.object({
  name: z.enum([
    "coach_onboarded",
    "client_imported",
    "plan_generated",
    "plan_override_by_coach",
    "client_checkin_completed",
    "payment_processed",
    "morning_dashboard_opened",
    "proof_card_generated",
    "proof_card_shared",
    "plan_adapted",
    "churn_alert_triggered",
    "group_program_created"
  ]),
  actorId: z.string(),
  occurredAt: z.string(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
});
var demoStateSchema = z.object({
  workspace: coachWorkspaceSchema,
  coach: coachUserSchema,
  clients: z.array(clientProfileSchema),
  plans: z.array(programPlanSchema),
  checkIns: z.array(checkInSchema),
  subscriptions: z.array(paymentSubscriptionSchema),
  analytics: z.array(analyticsEventSchema),
  messages: z.array(messageSchema),
  groupPrograms: z.array(groupProgramSchema).optional(),
  nutritionSwaps: z.array(nutritionSwapSchema).optional(),
  habits: z.array(habitSchema).optional(),
  habitCompletions: z.array(habitCompletionSchema).optional()
});
var today = /* @__PURE__ */ new Date("2026-04-03T09:00:00.000Z");
function createSeedState() {
  const workspace = {
    id: "ws_uk_1",
    name: "Thrive by Jake",
    brandColor: "#123f2d",
    accentColor: "#ff8757",
    heroMessage: "Built for coaches who take their clients' results seriously.",
    stripeConnected: true,
    parallelRunDaysLeft: 5
  };
  const coach = {
    id: "coach_1",
    workspaceId: workspace.id,
    firstName: "Jake",
    lastName: "Morgan",
    email: "jake@coachos.demo",
    gender: "male"
  };
  const clients = [
    {
      id: "client_1",
      workspaceId: workspace.id,
      fullName: "Sophie Patel",
      email: "sophie@example.com",
      goal: "Lose 8kg while rebuilding training consistency",
      status: "active",
      adherenceScore: 84,
      currentPlanId: "plan_1",
      monthlyPriceGbp: 199,
      nextRenewalDate: "2026-04-10",
      lastCheckInDate: "2026-04-02",
      healthConditions: [{ label: "Previous knee injury", note: "Avoid deep squats" }],
      dailyWaterTarget: 3,
      dailyStepsTarget: 1e4,
      supplements: ["Vitamin D3", "Whey Protein"],
      nutritionCalories: 2150,
      nutritionProteinG: 160,
      nutritionFatG: 65,
      nutritionCarbsG: 260,
      nutritionCoachNote: "Prioritise protein at every meal to support muscle repair."
    },
    {
      id: "client_2",
      workspaceId: workspace.id,
      fullName: "Liam Carter",
      email: "liam@example.com",
      goal: "Drop body fat for summer while keeping strength",
      status: "at_risk",
      adherenceScore: 42,
      currentPlanId: "plan_2",
      monthlyPriceGbp: 149,
      nextRenewalDate: "2026-04-05",
      lastCheckInDate: "2026-03-29",
      healthConditions: [{ label: "Lower back stiffness", note: "Avoid deadlifts until cleared" }],
      dailyWaterTarget: 3,
      dailyStepsTarget: 8e3,
      supplements: ["Creatine", "Omega-3"],
      nutritionCalories: 2400,
      nutritionProteinG: 200,
      nutritionFatG: 80,
      nutritionCarbsG: 240,
      nutritionCoachNote: "Keep carbs around workouts only to support fat loss."
    },
    {
      id: "client_3",
      workspaceId: workspace.id,
      fullName: "Ava Thompson",
      email: "ava@example.com",
      goal: "Return to training after pregnancy with low-pressure routines",
      status: "trial",
      adherenceScore: 71,
      currentPlanId: null,
      monthlyPriceGbp: 129,
      nextRenewalDate: "2026-04-18",
      lastCheckInDate: null,
      healthConditions: [{ label: "Post-pregnancy", note: "Clearance needed for core-heavy work" }],
      dailyWaterTarget: 2,
      dailyStepsTarget: 6e3,
      supplements: ["Prenatal Multivitamin", "Iron"],
      nutritionCalories: 2e3,
      nutritionProteinG: 90,
      nutritionFatG: 65,
      nutritionCarbsG: 250,
      nutritionCoachNote: "Focus on nutrient-dense whole foods. No calorie deficit yet."
    }
  ];
  const plans = [
    {
      id: "plan_1",
      clientId: "client_1",
      coachId: coach.id,
      title: "Sophie Fat Loss Reset",
      latestVersion: {
        id: "plan_1_v2",
        planId: "plan_1",
        versionNumber: 2,
        status: "approved",
        explanation: [
          "Training volume stayed high because Sophie hit 5 of 6 sessions last week.",
          "Calories remain moderate deficit after energy score improved to 7/10."
        ],
        workouts: [
          "3 gym sessions focused on lower-body strength and upper-body pull volume",
          "2 incline-walk cardio blocks at 25 minutes",
          "Daily step target: 9,000"
        ],
        nutrition: [
          "Calories: 1,850 per day",
          "Protein: 135g minimum",
          "Weekend meal out: 1 flexible meal, no calorie banking"
        ],
        updatedAt: "2026-04-02T08:00:00.000Z"
      }
    },
    {
      id: "plan_2",
      clientId: "client_2",
      coachId: coach.id,
      title: "Liam Compliance Rescue",
      latestVersion: {
        id: "plan_2_v1",
        planId: "plan_2",
        versionNumber: 1,
        status: "draft",
        explanation: [
          "Risk score is high because Liam missed 2 check-ins and logged low energy.",
          "The draft lowers complexity to rebuild adherence before pushing intensity."
        ],
        workouts: [
          "2 full-body sessions instead of 4 split sessions",
          "10-minute daily walk after lunch",
          "1 optional weekend conditioning block"
        ],
        nutrition: [
          "Calories: 2,100 per day",
          "Protein: 160g minimum",
          "Replace two takeaway lunches with prepared wraps"
        ],
        updatedAt: "2026-04-03T07:45:00.000Z"
      }
    }
  ];
  const checkIns = [
    {
      id: "checkin_1",
      clientId: "client_1",
      submittedAt: "2026-04-02T07:30:00.000Z",
      progress: {
        weightKg: 73.4,
        energyScore: 7,
        steps: 10220,
        waistCm: 78,
        adherenceScore: 86,
        notes: "Felt good all week and hit every session."
      },
      photoCount: 2
    },
    {
      id: "checkin_2",
      clientId: "client_2",
      submittedAt: "2026-03-29T08:00:00.000Z",
      progress: {
        weightKg: 92.1,
        energyScore: 4,
        steps: 4100,
        waistCm: null,
        adherenceScore: 38,
        notes: "Travel week. Missed sessions and meals were messy."
      },
      photoCount: 0
    }
  ];
  const subscriptions = clients.map((client) => ({
    id: `sub_${client.id}`,
    clientId: client.id,
    status: client.id === "client_2" ? "past_due" : client.status === "trial" ? "trialing" : "active",
    amountGbp: client.monthlyPriceGbp,
    renewalDate: client.nextRenewalDate
  }));
  return {
    workspace,
    coach,
    clients,
    plans,
    checkIns,
    subscriptions,
    groupPrograms: [],
    nutritionSwaps: [],
    habits: [
      { id: "habit_1", clientId: "client_1", title: "Log meals in the app", target: 1, frequency: "daily", createdAt: "2026-04-01T00:00:00.000Z" },
      { id: "habit_2", clientId: "client_1", title: "Hit 8,000 steps", target: 8e3, frequency: "daily", createdAt: "2026-04-01T00:00:00.000Z" },
      { id: "habit_3", clientId: "client_1", title: "Complete weekly check-in", target: 1, frequency: "weekly", createdAt: "2026-04-01T00:00:00.000Z" },
      { id: "habit_4", clientId: "client_2", title: "Log meals in the app", target: 1, frequency: "daily", createdAt: "2026-04-01T00:00:00.000Z" },
      { id: "habit_5", clientId: "client_2", title: "Hit 5,000 steps", target: 5e3, frequency: "daily", createdAt: "2026-04-01T00:00:00.000Z" },
      { id: "habit_6", clientId: "client_2", title: "Submit check-in on Friday", target: 1, frequency: "weekly", createdAt: "2026-04-01T00:00:00.000Z" },
      { id: "habit_7", clientId: "client_3", title: "Log meals in the app", target: 1, frequency: "daily", createdAt: "2026-04-01T00:00:00.000Z" },
      { id: "habit_8", clientId: "client_3", title: "Complete a workout", target: 3, frequency: "weekly", createdAt: "2026-04-01T00:00:00.000Z" }
    ],
    habitCompletions: [
      // client_1 — mostly complete
      { id: "hc_1", habitId: "habit_1", date: "2026-04-01", completed: true },
      { id: "hc_2", habitId: "habit_2", date: "2026-04-01", completed: true },
      { id: "hc_3", habitId: "habit_1", date: "2026-04-02", completed: true },
      { id: "hc_4", habitId: "habit_2", date: "2026-04-02", completed: true },
      { id: "hc_5", habitId: "habit_1", date: "2026-04-03", completed: true },
      { id: "hc_6", habitId: "habit_2", date: "2026-04-03", completed: false },
      // client_2 — struggling
      { id: "hc_7", habitId: "habit_4", date: "2026-04-01", completed: false },
      { id: "hc_8", habitId: "habit_5", date: "2026-04-01", completed: true }
    ],
    messages: [
      {
        id: "msg_1",
        clientId: "client_1",
        coachId: coach.id,
        sender: "coach",
        content: "Hey Sophie, let's crush the nutrition goals this week!",
        sentAt: "2026-04-03T08:00:00.000Z",
        readAt: "2026-04-03T08:30:00.000Z"
      },
      {
        id: "msg_2",
        clientId: "client_1",
        coachId: coach.id,
        sender: "client",
        content: "On it! Just prepared my meals.",
        sentAt: "2026-04-03T08:45:00.000Z",
        readAt: "2026-04-03T09:00:00.000Z"
      }
    ],
    analytics: [
      {
        name: "coach_onboarded",
        actorId: coach.id,
        occurredAt: today.toISOString(),
        metadata: { workspace: workspace.name }
      }
    ]
  };
}
function scoreClientRisk(client, checkIn, subscription) {
  const reasons = [];
  if (!client.lastCheckInDate) {
    reasons.push("No client check-in received yet");
  } else {
    const daysSinceCheckIn = Math.floor(
      (today.getTime() - new Date(client.lastCheckInDate).getTime()) / (1e3 * 60 * 60 * 24)
    );
    if (daysSinceCheckIn >= 5) {
      reasons.push(`${daysSinceCheckIn} days since the last check-in`);
    }
  }
  if (client.adherenceScore < 50) {
    reasons.push(`Adherence score down to ${client.adherenceScore}%`);
  }
  if (checkIn && checkIn.progress.energyScore <= 4) {
    reasons.push(`Energy dropped to ${checkIn.progress.energyScore}/10`);
  }
  if (subscription?.status === "past_due") {
    reasons.push("Subscription payment needs attention");
  }
  if (!reasons.length) {
    return null;
  }
  return {
    clientId: client.id,
    severity: reasons.length >= 3 ? "high" : reasons.length === 2 ? "medium" : "low",
    reasons,
    recommendedAction: reasons.some((reason) => reason.includes("payment")) ? "Send a recovery message and trigger dunning follow-up." : "Send a one-tap encouragement nudge and simplify next week\u2019s plan."
  };
}
function summarizeMorningDashboard(state) {
  const riskAlerts = state.clients.map(
    (client) => scoreClientRisk(
      client,
      state.checkIns.find((checkIn) => checkIn.clientId === client.id),
      state.subscriptions.find((subscription) => subscription.clientId === client.id)
    )
  ).filter((alert) => Boolean(alert));
  return {
    date: today.toISOString(),
    activeClients: state.clients.filter((client) => client.status !== "trial").length,
    checkedInToday: state.checkIns.filter((checkIn) => checkIn.submittedAt.slice(0, 10) === "2026-04-03").length,
    dueRenewals: state.subscriptions.filter((subscription) => new Date(subscription.renewalDate) <= /* @__PURE__ */ new Date("2026-04-10")).length,
    atRiskClients: riskAlerts,
    revenueSnapshotGbp: state.subscriptions.filter((subscription) => subscription.status === "active").reduce((total, subscription) => total + subscription.amountGbp, 0)
  };
}
function previewImport(rows) {
  const parsed = rows.map((row, index) => {
    const result = importRowSchema.safeParse(row);
    return {
      row: index + 1,
      success: result.success,
      data: result.success ? result.data : null,
      issues: result.success ? [] : result.error.issues.map((issue) => issue.message)
    };
  });
  return {
    validRows: parsed.filter((row) => row.success).length,
    invalidRows: parsed.filter((row) => !row.success).length,
    parsed
  };
}
function createDraftPlan(client, coachId) {
  const riskLevel = client.adherenceScore < 50 ? "recovery" : "growth";
  const workouts = riskLevel === "recovery" ? [
    "2 simplified full-body sessions with 5 exercises each",
    "Daily 8,000-step target",
    "1 mobility recovery block on Sunday"
  ] : [
    "3 progressive overload strength sessions",
    "2 zone-2 cardio blocks",
    "Daily 9,000-step target"
  ];
  const nutrition = riskLevel === "recovery" ? [
    "Use a repeatable breakfast and lunch template for five days",
    "Protein floor: 150g",
    "One coached meal prep block each Sunday"
  ] : [
    "Moderate calorie deficit aligned to fat-loss phase",
    "Protein floor: 135g",
    "One flexible meal each weekend with no rebound restriction"
  ];
  return {
    id: `plan_${client.id}`,
    clientId: client.id,
    coachId,
    title: `${client.fullName.split(" ")[0]} Momentum Plan`,
    latestVersion: {
      id: `plan_${client.id}_v1`,
      planId: `plan_${client.id}`,
      versionNumber: 1,
      status: "draft",
      explanation: [
        `Draft built for ${client.goal.toLowerCase()}.`,
        riskLevel === "recovery" ? "Plan complexity reduced because adherence and/or check-ins have dropped." : "Plan keeps momentum high because the client is showing consistent adherence."
      ],
      workouts,
      nutrition,
      updatedAt: today.toISOString()
    }
  };
}
function approvePlan(plan) {
  return {
    ...plan,
    latestVersion: {
      ...plan.latestVersion,
      status: "approved",
      versionNumber: plan.latestVersion.versionNumber + 1,
      id: `${plan.id}_v${plan.latestVersion.versionNumber + 1}`,
      updatedAt: today.toISOString()
    }
  };
}
function createProofCard(client, latestCheckIn) {
  return {
    clientId: client.id,
    headline: `${client.fullName.split(" ")[0]} is rebuilding consistency with premium accountability`,
    body: latestCheckIn ? `Energy is ${latestCheckIn.progress.energyScore}/10, steps reached ${latestCheckIn.progress.steps.toLocaleString()}, and the coach now has a clean progress trail ready for sharing.` : "Client has been onboarded and is ready for the first measurable proof milestone.",
    stats: [
      { label: "Adherence", value: `${client.adherenceScore}%` },
      { label: "Monthly value", value: `\xA3${client.monthlyPriceGbp}` },
      { label: "Next review", value: client.nextRenewalDate }
    ]
  };
}

// apps/api/src/app.ts
function createApp(store) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "coachos-api" });
  });
  app.get("/api/runtime", (_req, res) => {
    res.json(store.getRuntimeInfo());
  });
  app.get("/api/session/coach", (_req, res) => {
    res.json(store.getCoachSession());
  });
  app.get("/api/session/client/:clientId", (req, res) => {
    const session = store.getClientSession(req.params.clientId);
    if (!session) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    res.json(session);
  });
  app.get("/api/clients", (req, res) => {
    res.json(
      store.listClients({
        status: typeof req.query.status === "string" ? req.query.status : void 0,
        search: typeof req.query.search === "string" ? req.query.search : void 0
      })
    );
  });
  app.post("/api/clients", async (req, res) => {
    const result = await store.createClient(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid client payload.", issues: result.issues });
      return;
    }
    res.status(201).json(result.client);
  });
  app.get("/api/clients/:clientId", (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    res.json(client);
  });
  app.patch("/api/clients/:clientId", async (req, res) => {
    const result = await store.updateClient(req.params.clientId, req.body);
    if (!result.success) {
      if ("notFound" in result && result.notFound) {
        res.status(404).json({ message: "Client not found." });
        return;
      }
      res.status(400).json({ message: "Invalid client patch.", issues: result.issues });
      return;
    }
    res.json(result.client);
  });
  app.get("/api/clients/:clientId/notes", (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    res.json(store.listClientNotes(req.params.clientId));
  });
  app.post("/api/clients/:clientId/notes", async (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    if (typeof req.body.content !== "string" || !req.body.content.trim()) {
      res.status(400).json({ message: "content is required." });
      return;
    }
    const note = await store.createClientNote(req.params.clientId, req.body.content);
    res.status(201).json(note);
  });
  app.delete("/api/clients/:clientId/notes/:noteId", async (req, res) => {
    const ok = await store.deleteClientNote(req.params.clientId, req.params.noteId);
    if (!ok) {
      res.status(404).json({ message: "Note not found." });
      return;
    }
    res.json({ ok: true });
  });
  app.get("/api/clients/:clientId/metrics", (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    res.json(store.listBodyMetrics(req.params.clientId));
  });
  app.post("/api/clients/:clientId/metrics", async (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    if (typeof req.body.date !== "string" || !req.body.date.trim()) {
      res.status(400).json({ message: "date is required." });
      return;
    }
    const metric = await store.saveBodyMetric(req.params.clientId, {
      date: req.body.date,
      weightKg: req.body.weightKg ?? null,
      bodyFatPct: req.body.bodyFatPct ?? null,
      waistCm: req.body.waistCm ?? null
    });
    res.status(201).json(metric);
  });
  app.post("/api/clients/:clientId/sessions", async (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    if (typeof req.body.date !== "string" || !req.body.date.trim()) {
      res.status(400).json({ message: "date is required." });
      return;
    }
    if (typeof req.body.duration !== "number" || req.body.duration <= 0) {
      res.status(400).json({ message: "duration must be a positive number." });
      return;
    }
    if (req.body.type !== "virtual" && req.body.type !== "in-person") {
      res.status(400).json({ message: "type must be 'virtual' or 'in-person'." });
      return;
    }
    const session = await store.createSession(req.params.clientId, {
      date: req.body.date,
      duration: req.body.duration,
      type: req.body.type,
      notes: typeof req.body.notes === "string" ? req.body.notes : void 0
    });
    res.status(201).json(session);
  });
  app.get("/api/plans", (req, res) => {
    res.json(
      store.listPlans({
        status: typeof req.query.status === "string" ? req.query.status : void 0,
        clientId: typeof req.query.clientId === "string" ? req.query.clientId : void 0
      })
    );
  });
  app.get("/api/check-ins", (req, res) => {
    res.json(
      store.listCheckIns({
        clientId: typeof req.query.clientId === "string" ? req.query.clientId : void 0
      })
    );
  });
  app.get("/api/messages/:clientId", (req, res) => {
    res.json(store.listMessages(req.params.clientId));
  });
  app.post("/api/messages", async (req, res) => {
    if (!req.body.clientId || !req.body.content || !req.body.sender) {
      res.status(400).json({ message: "Missing required message fields." });
      return;
    }
    const result = await store.sendMessage(req.body);
    res.json(result);
  });
  app.post("/api/onboarding", async (req, res) => {
    res.json(await store.updateWorkspace(req.body));
  });
  app.post("/api/onboarding/coach", async (req, res) => {
    const result = await store.createCoachWorkspace(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid coach onboarding payload.", issues: result.issues });
      return;
    }
    res.status(201).json(result);
  });
  app.post("/api/import/preview", (req, res) => {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    res.json(store.previewImport(rows));
  });
  app.post("/api/import/commit", async (req, res) => {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    res.json(await store.commitImport(rows));
  });
  app.get("/api/export", (_req, res) => {
    res.json(store.exportData());
  });
  app.post("/api/admin/state/import", async (req, res) => {
    const snapshot = req.body?.data ?? req.body;
    const result = await store.restoreData(snapshot);
    if (!result.success) {
      res.status(400).json({ message: "Invalid state snapshot.", issues: result.issues });
      return;
    }
    res.json({ ok: true, state: result.state });
  });
  app.post("/api/admin/state/reset", async (_req, res) => {
    res.json({ ok: true, session: await store.resetData() });
  });
  app.post("/api/plans/generate", async (req, res) => {
    const plan = await store.generatePlan(req.body.clientId);
    if (!plan) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    res.json(plan);
  });
  app.post("/api/plans/:planId/approve", async (req, res) => {
    const plan = await store.approvePlan(req.params.planId);
    if (!plan) {
      res.status(404).json({ message: "Plan not found." });
      return;
    }
    res.json(plan);
  });
  app.patch("/api/plans/:planId", async (req, res) => {
    const plan = await store.updatePlan(req.params.planId, req.body);
    if (!plan) {
      res.status(404).json({ message: "Plan not found." });
      return;
    }
    res.json(plan);
  });
  app.post("/api/check-ins", async (req, res) => {
    const result = await store.submitCheckIn(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid check-in payload.", issues: result.issues });
      return;
    }
    res.json(result);
  });
  app.post("/api/check-ins/:checkInId/photo", (_req, res) => {
    res.json({ ok: true });
  });
  app.get("/api/dashboard/morning", async (_req, res) => {
    res.json(await store.getMorningDashboard());
  });
  app.get("/api/billing", (_req, res) => {
    res.json(store.getBillingSummary());
  });
  app.post("/api/billing/webhooks/stripe", async (req, res) => {
    const { clientId, status } = req.body;
    if (!clientId || !status) {
      res.status(400).json({ message: "clientId and status are required." });
      return;
    }
    res.json(await store.updateBilling(clientId, status));
  });
  app.get("/api/proof-cards/:clientId", async (req, res) => {
    const proofCard = await store.getProofCard(req.params.clientId);
    if (!proofCard) {
      res.status(404).json({ message: "Client not found." });
      return;
    }
    res.json(proofCard);
  });
  app.get("/api/analytics", (_req, res) => {
    res.json(store.getAnalytics());
  });
  app.post("/api/analytics", async (req, res) => {
    const result = await store.recordAnalytics(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid analytics event.", issues: result.issues });
      return;
    }
    res.status(201).json(result.event);
  });
  app.get("/api/analytics/schema", (_req, res) => {
    res.json({ eventNames: analyticsEventSchema.shape.name.options });
  });
  app.get("/api/group-programs", (req, res) => {
    res.json(store.listGroupPrograms());
  });
  app.post("/api/group-programs", async (req, res) => {
    const result = await store.createGroupProgram(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid program payload." });
      return;
    }
    res.status(201).json(result.program);
  });
  app.patch("/api/group-programs/:programId", async (req, res) => {
    const result = await store.updateGroupProgram(req.params.programId, req.body);
    if (!result.success) {
      if ("notFound" in result && result.notFound) {
        res.status(404).json({ message: "Program not found." });
        return;
      }
      res.status(400).json({ message: "Invalid program patch." });
      return;
    }
    res.json(result.program);
  });
  app.delete("/api/group-programs/:programId", async (req, res) => {
    const ok = await store.archiveGroupProgram(req.params.programId);
    if (!ok) {
      res.status(404).json({ message: "Program not found." });
      return;
    }
    res.json({ ok: true });
  });
  app.post("/api/nutrition/swap", (req, res) => {
    res.json(store.suggestNutritionSwap(req.body));
  });
  app.post("/api/nutrition/swap/apply", async (req, res) => {
    const result = await store.applyNutritionSwap(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid swap application." });
      return;
    }
    res.json(result.swap);
  });
  app.get("/api/nutrition/swaps/:planId", (req, res) => {
    res.json(store.getNutritionSwaps(req.params.planId));
  });
  app.get("/api/exercises", (req, res) => {
    res.json(store.listExercises({
      search: typeof req.query.search === "string" ? req.query.search : void 0,
      bodyPart: typeof req.query.bodyPart === "string" ? req.query.bodyPart : void 0,
      equipment: typeof req.query.equipment === "string" ? req.query.equipment : void 0
    }));
  });
  app.get("/api/recipes", (req, res) => {
    const food = typeof req.query.food === "string" ? req.query.food : void 0;
    const search = typeof req.query.search === "string" ? req.query.search : void 0;
    res.json(food ? store.suggestRecipe(food) : store.listRecipes(search));
  });
  app.get("/api/habits", (req, res) => {
    res.json(store.listHabits(typeof req.query.clientId === "string" ? req.query.clientId : void 0));
  });
  app.get("/api/habits/summary", (req, res) => {
    const clientId = typeof req.query.clientId === "string" ? req.query.clientId : void 0;
    if (!clientId) {
      res.status(400).json({ message: "clientId is required." });
      return;
    }
    res.json(store.getHabitSummary(clientId));
  });
  app.post("/api/habits", async (req, res) => {
    if (!req.body.clientId || !req.body.title || req.body.target == null || !req.body.frequency) {
      res.status(400).json({ message: "clientId, title, target, and frequency are required." });
      return;
    }
    const result = await store.createHabit(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid habit payload." });
      return;
    }
    res.status(201).json(result.habit);
  });
  app.post("/api/habits/:habitId/complete", async (req, res) => {
    const date = typeof req.body.date === "string" ? req.body.date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const result = await store.toggleHabitCompletion(req.params.habitId, date);
    res.json(result.completion);
  });
  return app;
}

// apps/api/src/config.ts
import { z as z2 } from "zod";
var configSchema = z2.object({
  nodeEnv: z2.enum(["development", "test", "production"]).default("development"),
  port: z2.coerce.number().int().positive().default(4e3),
  storageMode: z2.enum(["json", "postgres_snapshot", "postgres_relational"]).default("json"),
  stateFilePath: z2.string().default("/tmp/coachos-state.json"),
  databaseUrl: z2.string().optional(),
  aiProvider: z2.enum(["mock", "simulated-openai"]).default("mock"),
  billingProvider: z2.enum(["mock", "simulated-stripe"]).default("mock"),
  proofProvider: z2.enum(["mock", "simulated-proof"]).default("mock"),
  openAiModel: z2.string().default("gpt-4.1-mini"),
  stripeMode: z2.enum(["test", "live"]).default("test")
});
function loadConfig(env = process.env) {
  return configSchema.parse({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    storageMode: env.COACHOS_STORAGE_MODE,
    stateFilePath: env.COACHOS_STATE_FILE,
    databaseUrl: env.DATABASE_URL,
    aiProvider: env.COACHOS_AI_PROVIDER,
    billingProvider: env.COACHOS_BILLING_PROVIDER,
    proofProvider: env.COACHOS_PROOF_PROVIDER,
    openAiModel: env.OPENAI_MODEL,
    stripeMode: env.STRIPE_MODE
  });
}

// apps/api/src/store.ts
import { z as z3 } from "zod";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

// apps/api/src/services.ts
var MockPlanGenerationProvider = class {
  name = "mock-openai";
  generateDraft(client, coachId) {
    return createDraftPlan(client, coachId);
  }
};
var SimulatedOpenAIPlanGenerationProvider = class {
  constructor(model) {
    this.model = model;
    this.name = `simulated-openai:${model}`;
  }
  model;
  name;
  generateDraft(client, coachId) {
    const draft = createDraftPlan(client, coachId);
    return {
      ...draft,
      latestVersion: {
        ...draft.latestVersion,
        explanation: [
          `Simulated OpenAI provider using model ${this.model}.`,
          ...draft.latestVersion.explanation
        ]
      }
    };
  }
};
var MockProofCardProvider = class {
  name = "mock-proof-engine";
  build(client, latestCheckIn) {
    return createProofCard(client, latestCheckIn);
  }
};
var SimulatedProofCardProvider = class {
  name = "simulated-proof-engine";
  build(client, latestCheckIn) {
    const proof = createProofCard(client, latestCheckIn);
    return {
      ...proof,
      headline: `${proof.headline} [Simulated share-ready card]`
    };
  }
};
var MockBillingProvider = class {
  name = "mock-stripe";
  createImportedSubscription(client) {
    return {
      id: `sub_${client.id}`,
      clientId: client.id,
      status: "trialing",
      amountGbp: client.monthlyPriceGbp,
      renewalDate: client.nextRenewalDate
    };
  }
  applyWebhookUpdate(subscriptions, clientId, status) {
    return subscriptions.map(
      (subscription) => subscription.clientId === clientId ? { ...subscription, status } : subscription
    );
  }
  summarize(subscriptions) {
    return {
      subscriptions,
      mrrGbp: subscriptions.filter((subscription) => subscription.status === "active").reduce((sum, subscription) => sum + subscription.amountGbp, 0),
      churnRiskCount: subscriptions.filter((subscription) => subscription.status === "past_due").length
    };
  }
};
var SimulatedStripeBillingProvider = class {
  constructor(mode) {
    this.mode = mode;
    this.name = `simulated-stripe:${mode}`;
  }
  mode;
  name;
  createImportedSubscription(client) {
    return {
      id: `sim_sub_${client.id}`,
      clientId: client.id,
      status: "trialing",
      amountGbp: client.monthlyPriceGbp,
      renewalDate: client.nextRenewalDate
    };
  }
  applyWebhookUpdate(subscriptions, clientId, status) {
    return subscriptions.map(
      (subscription) => subscription.clientId === clientId ? { ...subscription, status } : subscription
    );
  }
  summarize(subscriptions) {
    return {
      subscriptions,
      mrrGbp: subscriptions.filter((subscription) => subscription.status === "active").reduce((sum, subscription) => sum + subscription.amountGbp, 0),
      churnRiskCount: subscriptions.filter((subscription) => subscription.status === "past_due").length
    };
  }
};
function createMockServiceAdapters() {
  return {
    planGeneration: new MockPlanGenerationProvider(),
    proofCards: new MockProofCardProvider(),
    billing: new MockBillingProvider()
  };
}
function createServiceAdapters(config2) {
  const aiProvider = process.env.COACHOS_AI_PROVIDER ?? config2.aiProvider;
  let planGeneration;
  if (aiProvider === "simulated-openai") {
    planGeneration = new SimulatedOpenAIPlanGenerationProvider(config2.openAiModel);
  } else {
    planGeneration = new MockPlanGenerationProvider();
  }
  return {
    planGeneration,
    proofCards: config2.proofProvider === "simulated-proof" ? new SimulatedProofCardProvider() : new MockProofCardProvider(),
    billing: config2.billingProvider === "simulated-stripe" ? new SimulatedStripeBillingProvider(config2.stripeMode) : new MockBillingProvider()
  };
}

// apps/api/src/store.ts
var clientNoteSchema = z3.object({
  id: z3.string(),
  clientId: z3.string(),
  content: z3.string(),
  createdAt: z3.string()
});
var bodyMetricSchema = z3.object({
  id: z3.string(),
  clientId: z3.string(),
  date: z3.string(),
  weightKg: z3.number().nullable().default(null),
  bodyFatPct: z3.number().nullable().default(null),
  waistCm: z3.number().nullable().default(null)
});
var sessionSchema = z3.object({
  id: z3.string(),
  clientId: z3.string(),
  date: z3.string(),
  duration: z3.number().int().positive(),
  type: z3.enum(["virtual", "in-person"]),
  notes: z3.string().nullable().default(null),
  createdAt: z3.string()
});
var coachOnboardingSchema = z3.object({
  workspaceName: z3.string().trim().min(1),
  heroMessage: z3.string().trim().optional().default(""),
  brandColor: z3.string().trim().min(1).default("#123f2d"),
  accentColor: z3.string().trim().min(1).default("#ff8757"),
  stripeConnected: z3.boolean().optional().default(false),
  coachFirstName: z3.string().trim().min(1),
  coachLastName: z3.string().trim().min(1),
  coachEmail: z3.email(),
  coachGender: z3.enum(["male", "female"]).optional().default("male"),
  coachTypes: z3.array(z3.string()).optional().default([])
});
function addDaysIsoDate(days) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
var InMemoryDemoStateRepository = class {
  state;
  constructor(initialState = createSeedState()) {
    this.state = initialState;
  }
  async load() {
    return this.state;
  }
  async save(state) {
    this.state = state;
  }
  createSeedState() {
    return createSeedState();
  }
  describe() {
    return {
      storage: "InMemoryDemoStateRepository",
      stateFilePath: null
    };
  }
};
var JsonFileDemoStateRepository = class {
  constructor(filePath, seedFactory = createSeedState) {
    this.filePath = filePath;
    this.seedFactory = seedFactory;
  }
  filePath;
  seedFactory;
  async load() {
    if (!fs.existsSync(this.filePath)) {
      const seeded = this.seedFactory();
      await this.save(seeded);
      return seeded;
    }
    const raw = fs.readFileSync(this.filePath, "utf8");
    return JSON.parse(raw);
  }
  async save(state) {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), "utf8");
  }
  createSeedState() {
    return this.seedFactory();
  }
  describe() {
    return {
      storage: "JsonFileDemoStateRepository",
      stateFilePath: this.filePath
    };
  }
};
var PostgresDemoStateRepository = class {
  constructor(connectionString, seedFactory = createSeedState) {
    this.connectionString = connectionString;
    this.seedFactory = seedFactory;
  }
  connectionString;
  seedFactory;
  createPool() {
    return new Pool({
      connectionString: this.connectionString,
      max: 1
    });
  }
  async ensureSchema(pool) {
    await pool.query(`
      create table if not exists coachos_app_state (
        id text primary key,
        snapshot jsonb not null,
        updated_at timestamptz not null default now()
      )
    `);
  }
  async load() {
    const pool = this.createPool();
    try {
      await this.ensureSchema(pool);
      const result = await pool.query(
        "select snapshot from coachos_app_state where id = $1",
        ["singleton"]
      );
      if (result.rowCount && result.rows[0]?.snapshot) {
        return demoStateSchema.parse(result.rows[0].snapshot);
      }
      const seeded = this.seedFactory();
      await this.save(seeded);
      return seeded;
    } finally {
      await pool.end();
    }
  }
  async save(state) {
    const pool = this.createPool();
    try {
      await this.ensureSchema(pool);
      await pool.query(
        `
          insert into coachos_app_state (id, snapshot, updated_at)
          values ($1, $2::jsonb, now())
          on conflict (id) do update
          set snapshot = excluded.snapshot,
              updated_at = excluded.updated_at
        `,
        ["singleton", JSON.stringify(state)]
      );
    } finally {
      await pool.end();
    }
  }
  createSeedState() {
    return this.seedFactory();
  }
  describe() {
    return {
      storage: "PostgresDemoStateRepository",
      stateFilePath: null
    };
  }
};
var PostgresRelationalDemoStateRepository = class {
  constructor(connectionString, seedFactory = createSeedState) {
    this.connectionString = connectionString;
    this.seedFactory = seedFactory;
  }
  connectionString;
  seedFactory;
  createPool() {
    return new Pool({
      connectionString: this.connectionString,
      max: 1
    });
  }
  async ensureSchema(pool) {
    await pool.query(`
      create extension if not exists "pgcrypto";

      create table if not exists organizations (
        id text primary key,
        name text not null,
        brand_color text not null,
        accent_color text not null,
        hero_message text not null,
        stripe_connected boolean not null,
        parallel_run_days_left integer not null,
        plan text not null default 'demo',
        status text not null default 'active',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists profiles (
        id text primary key,
        organization_id text references organizations(id) on delete cascade,
        auth_user_id uuid unique,
        display_name text not null,
        email text not null,
        role text not null,
        status text not null default 'active',
        created_at timestamptz not null default now()
      );

      create table if not exists coaches (
        id text primary key,
        organization_id text not null references organizations(id) on delete cascade,
        profile_id text references profiles(id) on delete set null,
        first_name text not null,
        last_name text not null,
        email text not null,
        gender text not null default 'male',
        timezone text not null default 'UTC',
        created_at timestamptz not null default now()
      );

      create table if not exists clients (
        id text primary key,
        organization_id text not null references organizations(id) on delete cascade,
        profile_id text references profiles(id) on delete set null,
        full_name text not null,
        email text not null,
        goal text not null,
        status text not null,
        adherence_score integer not null,
        current_plan_id text null,
        monthly_price_gbp numeric not null,
        next_renewal_date text not null,
        last_checkin_date text null,
        health_conditions jsonb not null default '[]',
        daily_water_target integer not null default 3,
        daily_steps_target integer not null default 10000,
        supplements jsonb not null default '[]',
        nutrition_calories integer,
        nutrition_protein_g integer,
        nutrition_fat_g integer,
        nutrition_carbs_g integer,
        nutrition_coach_note text not null default '',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists coach_clients (
        id text primary key default 'cc_' || gen_random_uuid()::text,
        coach_id text not null references coaches(id) on delete cascade,
        client_id text not null references clients(id) on delete cascade,
        relationship_status text not null default 'active',
        started_at timestamptz not null default now(),
        unique (coach_id, client_id)
      );

      create table if not exists plans (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        coach_id text not null references coaches(id) on delete cascade,
        title text not null,
        latest_version jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists check_ins (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        submitted_at text not null,
        progress jsonb not null,
        photo_count integer not null,
        created_at timestamptz not null default now()
      );

      create table if not exists subscriptions (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        status text not null,
        amount_gbp numeric not null,
        renewal_date text not null,
        updated_at timestamptz not null default now()
      );

      create table if not exists messages (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        coach_id text not null references coaches(id) on delete cascade,
        sender text not null,
        content text not null,
        sent_at text not null,
        read_at text,
        created_at timestamptz not null default now()
      );

      create table if not exists client_notes (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        coach_id text references coaches(id) on delete set null,
        content text not null,
        created_at text not null,
        updated_at timestamptz not null default now()
      );

      create table if not exists body_metrics (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        date text not null,
        weight_kg numeric,
        body_fat_pct numeric,
        waist_cm numeric,
        created_at timestamptz not null default now()
      );

      create table if not exists sessions (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        coach_id text references coaches(id) on delete set null,
        date text not null,
        duration integer not null,
        type text not null,
        notes text,
        created_at text not null
      );

      create table if not exists group_programs (
        id text primary key,
        organization_id text not null references organizations(id) on delete cascade,
        coach_id text not null references coaches(id) on delete cascade,
        title text not null,
        description text not null,
        goal text not null,
        member_ids jsonb not null default '[]',
        monthly_price_gbp numeric not null default 0,
        status text not null,
        created_at text not null
      );

      create table if not exists nutrition_swaps (
        id text primary key,
        plan_id text not null references plans(id) on delete cascade,
        original_food jsonb not null,
        swap_suggestion jsonb not null,
        applied_at text
      );

      create table if not exists habits (
        id text primary key,
        client_id text not null references clients(id) on delete cascade,
        title text not null,
        target integer not null,
        frequency text not null,
        created_at text not null
      );

      create table if not exists habit_completions (
        id text primary key,
        habit_id text not null references habits(id) on delete cascade,
        date text not null,
        completed boolean not null default true,
        unique (habit_id, date)
      );

      create table if not exists analytics_events (
        event_id bigserial primary key,
        name text not null,
        actor_id text not null,
        occurred_at text not null,
        metadata jsonb not null
      );
    `);
  }
  async load() {
    const pool = this.createPool();
    try {
      await this.ensureSchema(pool);
      const workspaceResult = await pool.query("select * from organizations order by created_at asc limit 1");
      if (!workspaceResult.rowCount) {
        const seeded = this.seedFactory();
        await this.save(seeded);
        return seeded;
      }
      const workspaceRow = workspaceResult.rows[0];
      const organizationId = workspaceRow.id;
      const coachRow = (await pool.query("select * from coaches where organization_id = $1 order by created_at asc limit 1", [organizationId])).rows[0];
      const clientRows = (await pool.query("select * from clients where organization_id = $1 order by full_name asc", [organizationId])).rows;
      const clientIds = clientRows.map((row) => row.id);
      const planRows = (await pool.query("select * from plans where client_id = any($1::text[]) order by id asc", [clientIds])).rows;
      const checkInRows = (await pool.query("select * from check_ins where client_id = any($1::text[]) order by submitted_at desc", [clientIds])).rows;
      const subscriptionRows = (await pool.query("select * from subscriptions where client_id = any($1::text[]) order by id asc", [clientIds])).rows;
      const messageRows = (await pool.query("select * from messages where client_id = any($1::text[]) order by sent_at asc", [clientIds])).rows;
      const groupProgramRows = (await pool.query("select * from group_programs where organization_id = $1 order by created_at asc", [organizationId])).rows;
      const habitRows = (await pool.query("select * from habits where client_id = any($1::text[]) order by created_at asc", [clientIds])).rows;
      const habitIds = habitRows.map((row) => row.id);
      const habitCompletionRows = (await pool.query("select * from habit_completions where habit_id = any($1::text[]) order by date asc", [habitIds])).rows;
      const nutritionSwapRows = (await pool.query("select ns.* from nutrition_swaps ns join plans p on p.id = ns.plan_id where p.client_id = any($1::text[]) order by ns.id asc", [clientIds])).rows;
      const analyticsRows = (await pool.query("select name, actor_id, occurred_at, metadata from analytics_events order by event_id asc")).rows;
      const clientNoteRows = (await pool.query("select * from client_notes where client_id = any($1::text[]) order by created_at desc", [clientIds])).rows;
      const bodyMetricRows = (await pool.query("select * from body_metrics where client_id = any($1::text[]) order by date desc", [clientIds])).rows;
      const sessionRows = (await pool.query("select * from sessions where client_id = any($1::text[]) order by date asc", [clientIds])).rows;
      const baseState = demoStateSchema.parse({
        workspace: {
          id: workspaceRow.id,
          name: workspaceRow.name,
          brandColor: workspaceRow.brand_color,
          accentColor: workspaceRow.accent_color,
          heroMessage: workspaceRow.hero_message,
          stripeConnected: workspaceRow.stripe_connected,
          parallelRunDaysLeft: workspaceRow.parallel_run_days_left
        },
        coach: {
          id: coachRow.id,
          workspaceId: coachRow.organization_id,
          firstName: coachRow.first_name,
          lastName: coachRow.last_name,
          email: coachRow.email,
          gender: coachRow.gender
        },
        clients: clientRows.map((row) => ({
          id: row.id,
          workspaceId: row.organization_id,
          fullName: row.full_name,
          email: row.email,
          goal: row.goal,
          status: row.status,
          adherenceScore: row.adherence_score,
          currentPlanId: row.current_plan_id,
          monthlyPriceGbp: Number(row.monthly_price_gbp),
          nextRenewalDate: row.next_renewal_date,
          lastCheckInDate: row.last_checkin_date,
          healthConditions: row.health_conditions ?? [],
          dailyWaterTarget: row.daily_water_target,
          dailyStepsTarget: row.daily_steps_target,
          supplements: row.supplements ?? [],
          nutritionCalories: row.nutrition_calories,
          nutritionProteinG: row.nutrition_protein_g,
          nutritionFatG: row.nutrition_fat_g,
          nutritionCarbsG: row.nutrition_carbs_g,
          nutritionCoachNote: row.nutrition_coach_note
        })),
        plans: planRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          coachId: row.coach_id,
          title: row.title,
          latestVersion: row.latest_version
        })),
        checkIns: checkInRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          submittedAt: row.submitted_at,
          progress: row.progress,
          photoCount: row.photo_count
        })),
        subscriptions: subscriptionRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          status: row.status,
          amountGbp: Number(row.amount_gbp),
          renewalDate: row.renewal_date
        })),
        messages: messageRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          coachId: row.coach_id,
          sender: row.sender,
          content: row.content,
          sentAt: row.sent_at,
          readAt: row.read_at
        })),
        groupPrograms: groupProgramRows.map((row) => ({
          id: row.id,
          coachId: row.coach_id,
          title: row.title,
          description: row.description,
          goal: row.goal,
          memberIds: row.member_ids ?? [],
          monthlyPriceGbp: Number(row.monthly_price_gbp),
          status: row.status,
          createdAt: row.created_at
        })),
        nutritionSwaps: nutritionSwapRows.map((row) => ({
          id: row.id,
          planId: row.plan_id,
          originalFood: row.original_food,
          swapSuggestion: row.swap_suggestion,
          appliedAt: row.applied_at
        })),
        habits: habitRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          title: row.title,
          target: row.target,
          frequency: row.frequency,
          createdAt: row.created_at
        })),
        habitCompletions: habitCompletionRows.map((row) => ({
          id: row.id,
          habitId: row.habit_id,
          date: row.date,
          completed: row.completed
        })),
        analytics: analyticsRows.map((row) => ({
          name: row.name,
          actorId: row.actor_id,
          occurredAt: row.occurred_at,
          metadata: row.metadata
        }))
      });
      return {
        ...baseState,
        clientNotes: clientNoteRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          content: row.content,
          createdAt: row.created_at
        })),
        bodyMetrics: bodyMetricRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          date: row.date,
          weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
          bodyFatPct: row.body_fat_pct == null ? null : Number(row.body_fat_pct),
          waistCm: row.waist_cm == null ? null : Number(row.waist_cm)
        })),
        sessions: sessionRows.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          date: row.date,
          duration: row.duration,
          type: row.type,
          notes: row.notes,
          createdAt: row.created_at
        }))
      };
    } finally {
      await pool.end();
    }
  }
  async save(state) {
    const extendedState = state;
    const pool = this.createPool();
    try {
      await this.ensureSchema(pool);
      await pool.query("begin");
      const clientIds = state.clients.map((client) => client.id);
      const planIds = state.plans.map((plan) => plan.id);
      const habitIds = state.habits?.map((habit) => habit.id) ?? [];
      await pool.query("delete from nutrition_swaps where plan_id = any($1::text[])", [planIds]);
      await pool.query("delete from habit_completions where habit_id = any($1::text[])", [habitIds]);
      await pool.query("delete from habits where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from group_programs where organization_id = $1", [state.workspace.id]);
      await pool.query("delete from sessions where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from body_metrics where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from client_notes where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from messages where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from subscriptions where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from check_ins where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from plans where client_id = any($1::text[])", [clientIds]);
      await pool.query("delete from coach_clients where coach_id = $1 or client_id = any($2::text[])", [state.coach.id, clientIds]);
      await pool.query("delete from clients where organization_id = $1", [state.workspace.id]);
      await pool.query("delete from coaches where organization_id = $1", [state.workspace.id]);
      await pool.query("delete from profiles where organization_id = $1", [state.workspace.id]);
      await pool.query("delete from analytics_events");
      await pool.query("delete from organizations where id = $1", [state.workspace.id]);
      await pool.query(
        `
          insert into organizations
            (id, name, brand_color, accent_color, hero_message, stripe_connected, parallel_run_days_left)
          values ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          state.workspace.id,
          state.workspace.name,
          state.workspace.brandColor,
          state.workspace.accentColor,
          state.workspace.heroMessage,
          state.workspace.stripeConnected,
          state.workspace.parallelRunDaysLeft
        ]
      );
      await pool.query(
        `
          insert into profiles
            (id, organization_id, display_name, email, role, status)
          values ($1, $2, $3, $4, 'coach', 'active')
        `,
        [
          `profile_${state.coach.id}`,
          state.workspace.id,
          `${state.coach.firstName} ${state.coach.lastName}`,
          state.coach.email
        ]
      );
      await pool.query(
        `
          insert into coaches
            (id, organization_id, profile_id, first_name, last_name, email, gender)
          values ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          state.coach.id,
          state.coach.workspaceId,
          `profile_${state.coach.id}`,
          state.coach.firstName,
          state.coach.lastName,
          state.coach.email,
          state.coach.gender ?? "male"
        ]
      );
      for (const client of state.clients) {
        await pool.query(
          `
            insert into profiles
              (id, organization_id, display_name, email, role, status)
            values ($1, $2, $3, $4, 'client', 'active')
          `,
          [`profile_${client.id}`, client.workspaceId, client.fullName, client.email]
        );
        await pool.query(
          `
            insert into clients
              (
                id, organization_id, profile_id, full_name, email, goal, status, adherence_score,
                current_plan_id, monthly_price_gbp, next_renewal_date, last_checkin_date,
                health_conditions, daily_water_target, daily_steps_target, supplements,
                nutrition_calories, nutrition_protein_g, nutrition_fat_g, nutrition_carbs_g,
                nutrition_coach_note
              )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15, $16::jsonb, $17, $18, $19, $20, $21)
          `,
          [
            client.id,
            client.workspaceId,
            `profile_${client.id}`,
            client.fullName,
            client.email,
            client.goal,
            client.status,
            client.adherenceScore,
            client.currentPlanId,
            client.monthlyPriceGbp,
            client.nextRenewalDate,
            client.lastCheckInDate,
            JSON.stringify(client.healthConditions ?? []),
            client.dailyWaterTarget ?? 3,
            client.dailyStepsTarget ?? 1e4,
            JSON.stringify(client.supplements ?? []),
            client.nutritionCalories,
            client.nutritionProteinG,
            client.nutritionFatG,
            client.nutritionCarbsG,
            client.nutritionCoachNote ?? ""
          ]
        );
        await pool.query(
          "insert into coach_clients (coach_id, client_id) values ($1, $2) on conflict (coach_id, client_id) do nothing",
          [state.coach.id, client.id]
        );
      }
      for (const plan of state.plans) {
        await pool.query(
          `
            insert into plans
              (id, client_id, coach_id, title, latest_version)
            values ($1, $2, $3, $4, $5::jsonb)
          `,
          [plan.id, plan.clientId, plan.coachId, plan.title, JSON.stringify(plan.latestVersion)]
        );
      }
      for (const checkIn of state.checkIns) {
        await pool.query(
          `
            insert into check_ins
              (id, client_id, submitted_at, progress, photo_count)
            values ($1, $2, $3, $4::jsonb, $5)
          `,
          [checkIn.id, checkIn.clientId, checkIn.submittedAt, JSON.stringify(checkIn.progress), checkIn.photoCount]
        );
      }
      for (const subscription of state.subscriptions) {
        await pool.query(
          `
            insert into subscriptions
              (id, client_id, status, amount_gbp, renewal_date)
            values ($1, $2, $3, $4, $5)
          `,
          [subscription.id, subscription.clientId, subscription.status, subscription.amountGbp, subscription.renewalDate]
        );
      }
      for (const event of state.analytics) {
        await pool.query(
          `
            insert into analytics_events
              (name, actor_id, occurred_at, metadata)
            values ($1, $2, $3, $4::jsonb)
          `,
          [event.name, event.actorId, event.occurredAt, JSON.stringify(event.metadata)]
        );
      }
      for (const message of state.messages ?? []) {
        await pool.query(
          `
            insert into messages
              (id, client_id, coach_id, sender, content, sent_at, read_at)
            values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [message.id, message.clientId, message.coachId, message.sender, message.content, message.sentAt, message.readAt]
        );
      }
      for (const note of extendedState.clientNotes ?? []) {
        await pool.query(
          `
            insert into client_notes
              (id, client_id, coach_id, content, created_at)
            values ($1, $2, $3, $4, $5)
          `,
          [note.id, note.clientId, state.coach.id, note.content, note.createdAt]
        );
      }
      for (const metric of extendedState.bodyMetrics ?? []) {
        await pool.query(
          `
            insert into body_metrics
              (id, client_id, date, weight_kg, body_fat_pct, waist_cm)
            values ($1, $2, $3, $4, $5, $6)
          `,
          [metric.id, metric.clientId, metric.date, metric.weightKg, metric.bodyFatPct, metric.waistCm]
        );
      }
      for (const session of extendedState.sessions ?? []) {
        await pool.query(
          `
            insert into sessions
              (id, client_id, coach_id, date, duration, type, notes, created_at)
            values ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [session.id, session.clientId, state.coach.id, session.date, session.duration, session.type, session.notes, session.createdAt]
        );
      }
      for (const program of state.groupPrograms ?? []) {
        await pool.query(
          `
            insert into group_programs
              (id, organization_id, coach_id, title, description, goal, member_ids, monthly_price_gbp, status, created_at)
            values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
          `,
          [
            program.id,
            state.workspace.id,
            program.coachId,
            program.title,
            program.description,
            program.goal,
            JSON.stringify(program.memberIds),
            program.monthlyPriceGbp,
            program.status,
            program.createdAt
          ]
        );
      }
      for (const habit of state.habits ?? []) {
        await pool.query(
          `
            insert into habits
              (id, client_id, title, target, frequency, created_at)
            values ($1, $2, $3, $4, $5, $6)
          `,
          [habit.id, habit.clientId, habit.title, habit.target, habit.frequency, habit.createdAt]
        );
      }
      for (const completion of state.habitCompletions ?? []) {
        await pool.query(
          `
            insert into habit_completions
              (id, habit_id, date, completed)
            values ($1, $2, $3, $4)
          `,
          [completion.id, completion.habitId, completion.date, completion.completed]
        );
      }
      for (const swap of state.nutritionSwaps ?? []) {
        await pool.query(
          `
            insert into nutrition_swaps
              (id, plan_id, original_food, swap_suggestion, applied_at)
            values ($1, $2, $3::jsonb, $4::jsonb, $5)
          `,
          [swap.id, swap.planId, JSON.stringify(swap.originalFood), JSON.stringify(swap.swapSuggestion), swap.appliedAt]
        );
      }
      await pool.query("commit");
    } catch (error) {
      await pool.query("rollback");
      throw error;
    } finally {
      await pool.end();
    }
  }
  createSeedState() {
    return this.seedFactory();
  }
  describe() {
    return {
      storage: "SupabasePostgresRelationalRepository",
      stateFilePath: null
    };
  }
};
var DemoStore = class _DemoStore {
  constructor(repository = new InMemoryDemoStateRepository(), adapters = createMockServiceAdapters(), initialState) {
    this.repository = repository;
    this.adapters = adapters;
    this.state = initialState ?? createSeedState();
  }
  repository;
  adapters;
  state;
  static async create(repository = new InMemoryDemoStateRepository(), adapters = createMockServiceAdapters()) {
    const initialState = await repository.load();
    return new _DemoStore(repository, adapters, initialState);
  }
  getState() {
    return this.state;
  }
  getRuntimeInfo() {
    return {
      ...this.repository.describe(),
      services: {
        planGeneration: this.adapters.planGeneration.name,
        proofCards: this.adapters.proofCards.name,
        billing: this.adapters.billing.name
      }
    };
  }
  async commit() {
    await this.repository.save(this.state);
  }
  async track(name, actorId, metadata) {
    this.state.analytics.push({
      name,
      actorId,
      occurredAt: (/* @__PURE__ */ new Date()).toISOString(),
      metadata
    });
    await this.commit();
  }
  async updateWorkspace(payload) {
    this.state.workspace = {
      ...this.state.workspace,
      ...payload,
      stripeConnected: Boolean(payload.stripeConnected ?? this.state.workspace.stripeConnected)
    };
    await this.track("coach_onboarded", this.state.coach.id, { updated: true });
    return this.state.workspace;
  }
  async createCoachWorkspace(payload) {
    const parsed = coachOnboardingSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }
    const timestamp = Date.now();
    const workspaceId = `ws_${timestamp}`;
    const coachId = `coach_${timestamp}`;
    const data = parsed.data;
    this.state = {
      workspace: {
        id: workspaceId,
        name: data.workspaceName,
        brandColor: data.brandColor,
        accentColor: data.accentColor,
        heroMessage: data.heroMessage || "Built for coaches who take their clients' results seriously.",
        stripeConnected: data.stripeConnected,
        parallelRunDaysLeft: 14
      },
      coach: {
        id: coachId,
        workspaceId,
        firstName: data.coachFirstName,
        lastName: data.coachLastName,
        email: data.coachEmail,
        gender: data.coachGender
      },
      clients: [],
      plans: [],
      checkIns: [],
      subscriptions: [],
      messages: [],
      analytics: [],
      groupPrograms: [],
      nutritionSwaps: [],
      habits: [],
      habitCompletions: []
    };
    await this.track("coach_onboarded", coachId, {
      workspaceId,
      coachTypeCount: data.coachTypes.length,
      freshWorkspace: true
    });
    return {
      success: true,
      coachId,
      workspaceId,
      session: this.getCoachSession()
    };
  }
  previewImport(rows) {
    return previewImport(rows);
  }
  async commitImport(rows) {
    const preview = this.previewImport(rows);
    const imported = preview.parsed.filter((row) => row.success && row.data).map(
      (row, index) => clientProfileSchema.parse({
        id: `client_import_${this.state.clients.length + index + 1}`,
        workspaceId: this.state.workspace.id,
        fullName: row.data.name,
        email: row.data.email,
        goal: row.data.goal,
        status: "trial",
        adherenceScore: 60,
        currentPlanId: null,
        monthlyPriceGbp: row.data.monthlyPriceGbp,
        nextRenewalDate: "2026-04-24",
        lastCheckInDate: null
      })
    );
    this.state.clients = [...this.state.clients, ...imported];
    this.state.subscriptions = [
      ...this.state.subscriptions,
      ...imported.map((client) => this.adapters.billing.createImportedSubscription(client))
    ];
    await this.track("client_imported", this.state.coach.id, { count: imported.length });
    return { importedCount: imported.length, imported, preview };
  }
  exportData() {
    return {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      parallelRunDaysLeft: this.state.workspace.parallelRunDaysLeft,
      data: this.state
    };
  }
  async restoreData(snapshot) {
    const parsed = demoStateSchema.safeParse(snapshot);
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }
    this.state = parsed.data;
    await this.commit();
    await this.track("coach_onboarded", this.state.coach.id, { restored: true });
    return { success: true, state: this.state };
  }
  async resetData() {
    this.state = this.repository.createSeedState();
    await this.commit();
    await this.track("coach_onboarded", this.state.coach.id, { reset: true });
    return this.getCoachSession();
  }
  async generatePlan(clientId) {
    const client = this.state.clients.find((item) => item.id === clientId);
    if (!client) {
      return null;
    }
    const plan = await this.adapters.planGeneration.generateDraft(client, this.state.coach.id);
    this.state.plans = [...this.state.plans.filter((item) => item.clientId !== client.id), plan];
    this.state.clients = this.state.clients.map(
      (item) => item.id === client.id ? { ...item, currentPlanId: plan.id } : item
    );
    await this.track("plan_generated", this.state.coach.id, { clientId: client.id });
    return plan;
  }
  async approvePlan(planId) {
    const plan = this.state.plans.find((item) => item.id === planId);
    if (!plan) {
      return null;
    }
    const approved = approvePlan(plan);
    this.state.plans = this.state.plans.map((item) => item.id === approved.id ? approved : item);
    await this.track("plan_override_by_coach", this.state.coach.id, { planId: approved.id, manualApproval: true });
    return approved;
  }
  async updatePlan(planId, patch) {
    const raw = typeof patch === "object" && patch !== null ? patch : {};
    const plan = this.state.plans.find((item) => item.id === planId);
    if (!plan) {
      return null;
    }
    const nextVersion = {
      ...plan.latestVersion,
      workouts: Array.isArray(raw.workouts) ? raw.workouts.filter((item) => typeof item === "string") : plan.latestVersion.workouts,
      nutrition: Array.isArray(raw.nutrition) ? raw.nutrition.filter((item) => typeof item === "string") : plan.latestVersion.nutrition,
      explanation: Array.isArray(raw.explanation) ? raw.explanation.filter((item) => typeof item === "string") : plan.latestVersion.explanation,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updated = {
      ...plan,
      title: typeof raw.title === "string" && raw.title.trim() ? raw.title : plan.title,
      latestVersion: nextVersion
    };
    this.state.plans = this.state.plans.map((item) => item.id === planId ? updated : item);
    await this.commit();
    await this.track("plan_adapted", this.state.coach.id, { planId });
    return updated;
  }
  async submitCheckIn(payload) {
    const parsed = checkInSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }
    this.state.checkIns = [parsed.data, ...this.state.checkIns.filter((item) => item.id !== parsed.data.id)];
    this.state.clients = this.state.clients.map(
      (client) => client.id === parsed.data.clientId ? {
        ...client,
        lastCheckInDate: parsed.data.submittedAt.slice(0, 10),
        adherenceScore: Math.min(100, Math.max(35, parsed.data.progress.steps >= 8e3 ? client.adherenceScore + 4 : client.adherenceScore - 6)),
        status: parsed.data.progress.energyScore <= 4 ? "at_risk" : "active"
      } : client
    );
    await this.track("client_checkin_completed", parsed.data.clientId, { photos: parsed.data.photoCount });
    return {
      success: true,
      id: parsed.data.id,
      checkIn: parsed.data,
      dashboard: summarizeMorningDashboard(this.state)
    };
  }
  getCoachSession() {
    return {
      workspace: this.state.workspace,
      coach: this.state.coach,
      clients: this.state.clients,
      plans: this.state.plans,
      subscriptions: this.state.subscriptions,
      dashboard: summarizeMorningDashboard(this.state)
    };
  }
  listClients(filters) {
    const status = filters?.status?.trim().toLowerCase();
    const search = filters?.search?.trim().toLowerCase();
    return this.state.clients.filter((client) => {
      const statusMatch = status ? client.status === status : true;
      const searchMatch = search ? [client.fullName, client.email, client.goal].some((value) => value.toLowerCase().includes(search)) : true;
      return statusMatch && searchMatch;
    });
  }
  listPlans(filters) {
    const status = filters?.status?.trim().toLowerCase();
    const clientId = filters?.clientId?.trim();
    return this.state.plans.filter((plan) => {
      const statusMatch = status ? plan.latestVersion.status === status : true;
      const clientMatch = clientId ? plan.clientId === clientId : true;
      return statusMatch && clientMatch;
    });
  }
  listCheckIns(filters) {
    const clientId = filters?.clientId?.trim();
    return this.state.checkIns.filter((checkIn) => clientId ? checkIn.clientId === clientId : true);
  }
  listMessages(clientId) {
    if (!this.state.messages) this.state.messages = [];
    return this.state.messages.filter((msg) => msg.clientId === clientId).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }
  async sendMessage(payload) {
    if (!this.state.messages) this.state.messages = [];
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      clientId: payload.clientId,
      coachId: this.state.coach.id,
      sender: payload.sender,
      content: payload.content,
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      readAt: null
    };
    this.state.messages.push(message);
    await this.commit();
    return { success: true, message };
  }
  // ── Client CRUD ─────────────────────────────────────────────────────────────
  async createClient(payload) {
    const raw = typeof payload === "object" && payload !== null ? payload : {};
    const normalizedPayload = {
      ...raw,
      workspaceId: typeof raw.workspaceId === "string" && raw.workspaceId.trim() ? raw.workspaceId : this.state.workspace.id,
      status: raw.status === "trialing" ? "trial" : raw.status ?? "trial",
      adherenceScore: typeof raw.adherenceScore === "number" ? raw.adherenceScore : 60,
      currentPlanId: raw.currentPlanId ?? null,
      nextRenewalDate: typeof raw.nextRenewalDate === "string" && raw.nextRenewalDate.trim() ? raw.nextRenewalDate : addDaysIsoDate(30),
      lastCheckInDate: raw.lastCheckInDate ?? null
    };
    const parsed = clientProfileSchema.omit({ id: true }).safeParse(normalizedPayload);
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }
    const client = {
      ...parsed.data,
      id: `client_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
    this.state.clients = [...this.state.clients, client];
    this.state.subscriptions = [
      ...this.state.subscriptions,
      this.adapters.billing.createImportedSubscription(client)
    ];
    await this.commit();
    await this.track("coach_onboarded", this.state.coach.id, { clientCreated: client.id });
    return { success: true, client };
  }
  // ── Client Notes ────────────────────────────────────────────────────────────
  listClientNotes(clientId) {
    if (!this.state.clientNotes) this.state.clientNotes = [];
    return this.state.clientNotes.filter((n) => n.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createClientNote(clientId, content) {
    if (!this.state.clientNotes) this.state.clientNotes = [];
    const note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      clientId,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.state.clientNotes = [...this.state.clientNotes, note];
    await this.commit();
    await this.track("coach_onboarded", this.state.coach.id, { noteCreated: note.id });
    return note;
  }
  async deleteClientNote(clientId, noteId) {
    if (!this.state.clientNotes) return false;
    const existing = this.state.clientNotes.find((n) => n.id === noteId && n.clientId === clientId);
    if (!existing) return false;
    this.state.clientNotes = this.state.clientNotes.filter((n) => n.id !== noteId);
    await this.commit();
    return true;
  }
  // ── Client Body Metrics ──────────────────────────────────────────────────────
  listBodyMetrics(clientId) {
    if (!this.state.bodyMetrics) this.state.bodyMetrics = [];
    return this.state.bodyMetrics.filter((m) => m.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  async saveBodyMetric(clientId, payload) {
    if (!this.state.bodyMetrics) this.state.bodyMetrics = [];
    const metric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      clientId,
      date: payload.date,
      weightKg: payload.weightKg ?? null,
      bodyFatPct: payload.bodyFatPct ?? null,
      waistCm: payload.waistCm ?? null
    };
    this.state.bodyMetrics = [...this.state.bodyMetrics, metric];
    await this.commit();
    return metric;
  }
  // ── Session Booking ────────────────────────────────────────────────────────
  async createSession(clientId, payload) {
    if (!this.state.sessions) this.state.sessions = [];
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      clientId,
      date: payload.date,
      duration: payload.duration,
      type: payload.type,
      notes: payload.notes ?? null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.state.sessions = [...this.state.sessions, session];
    await this.commit();
    await this.track("coach_onboarded", this.state.coach.id, { sessionCreated: session.id });
    return session;
  }
  async updateClient(clientId, patch) {
    const parsed = clientProfilePatchSchema.safeParse(patch);
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }
    const existing = this.state.clients.find((client) => client.id === clientId);
    if (!existing) {
      return { success: false, notFound: true };
    }
    const updated = clientProfileSchema.parse({
      ...existing,
      ...parsed.data
    });
    this.state.clients = this.state.clients.map((client) => client.id === clientId ? updated : client);
    this.state.subscriptions = this.state.subscriptions.map(
      (subscription) => subscription.clientId === clientId ? {
        ...subscription,
        amountGbp: updated.monthlyPriceGbp,
        renewalDate: updated.nextRenewalDate
      } : subscription
    );
    await this.commit();
    await this.track("coach_onboarded", this.state.coach.id, { clientUpdated: clientId });
    return { success: true, client: updated };
  }
  getClientSession(clientId) {
    const client = this.state.clients.find((item) => item.id === clientId);
    if (!client) {
      return null;
    }
    return {
      client,
      plan: this.state.plans.find((plan) => plan.clientId === client.id) ?? null,
      latestCheckIn: this.state.checkIns.find((checkIn) => checkIn.clientId === client.id) ?? null,
      proofCard: this.adapters.proofCards.build(client, this.state.checkIns.find((checkIn) => checkIn.clientId === client.id)),
      messages: this.listMessages(client.id)
    };
  }
  async getMorningDashboard() {
    await this.track("morning_dashboard_opened", this.state.coach.id, { source: "web" });
    return summarizeMorningDashboard(this.state);
  }
  getBillingSummary() {
    return this.adapters.billing.summarize(this.state.subscriptions);
  }
  async updateBilling(clientId, status) {
    this.state.subscriptions = this.adapters.billing.applyWebhookUpdate(this.state.subscriptions, clientId, status);
    await this.track("payment_processed", clientId, { status });
    return { ok: true, subscriptions: this.state.subscriptions };
  }
  async getProofCard(clientId) {
    const client = this.state.clients.find((item) => item.id === clientId);
    if (!client) {
      return null;
    }
    const proofCard = this.adapters.proofCards.build(
      client,
      this.state.checkIns.find((checkIn) => checkIn.clientId === client.id)
    );
    await this.track("proof_card_generated", this.state.coach.id, { clientId: client.id });
    return proofCard;
  }
  getAnalytics() {
    return { events: this.state.analytics, summary: summarizeAnalytics(this.state.analytics) };
  }
  async recordAnalytics(event) {
    const parsed = analyticsEventSchema.safeParse(event);
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }
    this.state.analytics.push(parsed.data);
    await this.commit();
    return { success: true, event: parsed.data };
  }
  // ── Group Programs ────────────────────────────────────────────────────
  listGroupPrograms() {
    if (!this.state.groupPrograms) this.state.groupPrograms = [];
    return this.state.groupPrograms;
  }
  async createGroupProgram(payload) {
    const parsed = groupProgramSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }
    if (!this.state.groupPrograms) this.state.groupPrograms = [];
    this.state.groupPrograms = [...this.state.groupPrograms, parsed.data];
    await this.track("group_program_created", parsed.data.coachId, { programId: parsed.data.id, title: parsed.data.title });
    return { success: true, program: parsed.data };
  }
  async updateGroupProgram(programId, patch) {
    if (!this.state.groupPrograms) this.state.groupPrograms = [];
    const existing = this.state.groupPrograms.find((p) => p.id === programId);
    if (!existing) return { success: false, notFound: true };
    const merged = groupProgramSchema.safeParse({ ...existing, ...patch });
    if (!merged.success) return { success: false, issues: merged.error.issues };
    this.state.groupPrograms = this.state.groupPrograms.map((p) => p.id === programId ? merged.data : p);
    await this.commit();
    return { success: true, program: merged.data };
  }
  async archiveGroupProgram(programId) {
    if (!this.state.groupPrograms) return false;
    const existing = this.state.groupPrograms.find((p) => p.id === programId);
    if (!existing) return false;
    this.state.groupPrograms = this.state.groupPrograms.map((p) => p.id === programId ? { ...p, status: "archived" } : p);
    await this.commit();
    return true;
  }
  // ── Nutrition Swap Agent ─────────────────────────────────────────────
  SWAP_LIBRARY = [
    { name: "Grilled chicken breast (150g)", calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, portion: "150g", tags: ["chicken", "protein", "lean"] },
    { name: "Salmon fillet (150g)", calories: 280, proteinG: 30, carbsG: 0, fatG: 17, portion: "150g", tags: ["fish", "omega3", "protein"] },
    { name: "Greek yoghurt (150g)", calories: 100, proteinG: 17, carbsG: 6, fatG: 0, portion: "150g", tags: ["dairy", "protein", "probiotic"] },
    { name: "Oats with berries (80g)", calories: 290, proteinG: 9, carbsG: 52, fatG: 5, portion: "80g dry", tags: ["carbs", "fibre", "breakfast"] },
    { name: "Brown rice (200g cooked)", calories: 220, proteinG: 5, carbsG: 46, fatG: 1.8, portion: "200g cooked", tags: ["carbs", "wholegrain", "rice"] },
    { name: "Sweet potato (200g)", calories: 172, proteinG: 3, carbsG: 40, fatG: 0.4, portion: "200g", tags: ["carbs", "fibre", "vegetable"] },
    { name: "Egg white omelette (4 eggs)", calories: 68, proteinG: 14, carbsG: 1, fatG: 0.8, portion: "4 egg whites", tags: ["egg", "protein", "lowfat"] },
    { name: "Turkey mince (150g)", calories: 135, proteinG: 27, carbsG: 0, fatG: 2, portion: "150g", tags: ["meat", "protein", "lean"] },
    { name: "Cottage cheese (150g)", calories: 98, proteinG: 11, carbsG: 3.4, fatG: 4.3, portion: "150g", tags: ["dairy", "protein", "lowcal"] },
    { name: "Avocado (half)", calories: 160, proteinG: 2, carbsG: 9, fatG: 15, portion: "half", tags: ["fat", "creamy", "vegetable"] },
    { name: "Quinoa (200g cooked)", calories: 222, proteinG: 8, carbsG: 39, fatG: 3.6, portion: "200g cooked", tags: ["carbs", "protein", "wholegrain"] },
    { name: "Protein shake (whey, 30g)", calories: 120, proteinG: 24, carbsG: 3, fatG: 1, portion: "30g scoop", tags: ["protein", "supplement", "shake"] }
  ];
  suggestNutritionSwap(payload) {
    const { originalFood } = payload;
    const targetCalories = originalFood.calories;
    const targetProtein = originalFood.proteinG;
    const scored = this.SWAP_LIBRARY.map((item) => {
      const calorieDiff = Math.abs(item.calories - targetCalories);
      const proteinDiff = Math.abs(item.proteinG - targetProtein);
      const score = (calorieDiff <= 50 ? 10 - calorieDiff / 10 : 0) + (proteinDiff <= 10 ? 5 - proteinDiff / 3 : 0);
      return { item, score };
    }).sort((a, b) => b.score - a.score);
    const best = scored[0]?.item;
    if (!best) return { original: originalFood, suggestion: null };
    return {
      original: originalFood,
      suggestion: {
        ...best,
        reasoning: best.proteinG > originalFood.proteinG ? `Swap for ${best.name} \u2014 ${best.proteinG}g protein (vs ${originalFood.proteinG}g) with similar calories.` : `Swap for ${best.name} \u2014 similar calories with better macro balance.`
      }
    };
  }
  async applyNutritionSwap(payload) {
    const swap = {
      id: `swap_${Date.now()}`,
      planId: payload.planId,
      originalFood: payload.originalFood,
      swapSuggestion: payload.suggestion,
      appliedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (!this.state.nutritionSwaps) this.state.nutritionSwaps = [];
    this.state.nutritionSwaps = [...this.state.nutritionSwaps, swap];
    await this.commit();
    return { success: true, swap };
  }
  getNutritionSwaps(planId) {
    if (!this.state.nutritionSwaps) return [];
    return this.state.nutritionSwaps.filter((s) => s.planId === planId);
  }
  // ── Exercise Library ────────────────────────────────────────────────
  EXERCISE_LIBRARY = [
    { id: "ex_1", name: "Barbell Bench Press", bodyPart: "Chest", equipment: "Barbell", goal: "Strength", difficulty: "intermediate", instructions: "Lie flat on bench, lower bar to mid-chest, press up to full extension." },
    { id: "ex_2", name: "Deadlift", bodyPart: "Back", equipment: "Barbell", goal: "Strength", difficulty: "intermediate", instructions: "Hip-hinge, bar close to shins, drive through heels to stand." },
    { id: "ex_3", name: "Barbell Back Squat", bodyPart: "Legs", equipment: "Barbell", goal: "Hypertrophy", difficulty: "intermediate", instructions: "Bar on traps, squat to parallel or below, knees track toes." },
    { id: "ex_4", name: "Romanian Deadlift", bodyPart: "Legs", equipment: "Barbell", goal: "Strength", difficulty: "intermediate", instructions: "Slight knee bend, hinge at hips, feel hamstring stretch." },
    { id: "ex_5", name: "Overhead Press", bodyPart: "Shoulders", equipment: "Barbell", goal: "Strength", difficulty: "intermediate", instructions: "Bar at clavicles, press overhead to lockout, engage core." },
    { id: "ex_6", name: "Pull-Up", bodyPart: "Back", equipment: "Bodyweight", goal: "Strength", difficulty: "intermediate", instructions: "Hang with overhand grip, pull chest to bar, lower with control." },
    { id: "ex_7", name: "Dumbbell Row", bodyPart: "Back", equipment: "Dumbbell", goal: "Hypertrophy", difficulty: "beginner", instructions: "One hand on bench, row dumbbell to hip, squeeze lat." },
    { id: "ex_8", name: "Leg Press", bodyPart: "Legs", equipment: "Machine", goal: "Hypertrophy", difficulty: "beginner", instructions: "Feet shoulder-width on platform, lower to 90\xB0, press to near-lockout." },
    { id: "ex_9", name: "Romanian Push-Up", bodyPart: "Chest", equipment: "Bodyweight", goal: "Hypertrophy", difficulty: "beginner", instructions: "Push-up with hips raised high throughout \u2014 emphasize upper chest." },
    { id: "ex_10", name: "Lateral Raise", bodyPart: "Shoulders", equipment: "Dumbbell", goal: "Hypertrophy", difficulty: "beginner", instructions: "Slight elbow bend, raise arms to shoulder height." },
    { id: "ex_11", name: "Bicep Curl", bodyPart: "Arms", equipment: "Dumbbell", goal: "Hypertrophy", difficulty: "beginner", instructions: "Curl from full extension to top contraction, squeeze at top." },
    { id: "ex_12", name: "Tricep Dip", bodyPart: "Arms", equipment: "Bodyweight", goal: "Hypertrophy", difficulty: "intermediate", instructions: "Hands on bench, lower until upper arms parallel to floor." },
    { id: "ex_13", name: "Plank", bodyPart: "Core", equipment: "Bodyweight", goal: "Endurance", difficulty: "beginner", instructions: "Forearms on floor, body straight line from head to heels, hold." },
    { id: "ex_14", name: "Russian Twist", bodyPart: "Core", equipment: "Bodyweight", goal: "Hypertrophy", difficulty: "beginner", instructions: "Seated, lean back slightly, rotate torso side to side." },
    { id: "ex_15", name: "Battle Ropes", bodyPart: "Cardio", equipment: "Ropes", goal: "Endurance", difficulty: "intermediate", instructions: "Alternate or double-arm waves \u2014 30-sec intervals." },
    { id: "ex_16", name: "Rowing Machine", bodyPart: "Cardio", equipment: "Machine", goal: "Endurance", difficulty: "beginner", instructions: "Push with legs, then lean back, then pull handle to lower chest." },
    { id: "ex_17", name: "Box Jump", bodyPart: "Legs", equipment: "Bodyweight", goal: "Power", difficulty: "intermediate", instructions: "Slight squat, jump onto box, step down, reset." },
    { id: "ex_18", name: "Turkish Get-Up", bodyPart: "Core", equipment: "Kettlebell", goal: "Mobility", difficulty: "advanced", instructions: "From lying to standing while pressing kettlebell overhead." },
    { id: "ex_19", name: "Goblet Squat", bodyPart: "Legs", equipment: "Kettlebell", goal: "Hypertrophy", difficulty: "beginner", instructions: "Hold kettlebell at chest, squat deep, keep chest upright." },
    { id: "ex_20", name: "Face Pull", bodyPart: "Shoulders", equipment: "Cable", goal: "Strength", difficulty: "beginner", instructions: "High cable attachment, pull rope to face level, squeeze rear delts." }
  ];
  listExercises(filters) {
    const search = filters?.search?.trim().toLowerCase();
    const bodyPart = filters?.bodyPart?.trim();
    const equipment = filters?.equipment?.trim();
    return this.EXERCISE_LIBRARY.filter((ex) => {
      const searchMatch = !search || ex.name.toLowerCase().includes(search) || ex.instructions.toLowerCase().includes(search);
      const bodyMatch = !bodyPart || bodyPart === "all" || ex.bodyPart.toLowerCase() === bodyPart.toLowerCase();
      const equipMatch = !equipment || equipment === "all" || ex.equipment.toLowerCase() === equipment.toLowerCase();
      return searchMatch && bodyMatch && equipMatch;
    });
  }
  // ── Recipe Library ─────────────────────────────────────────────────
  RECIPE_LIBRARY = [
    {
      id: "rec_1",
      name: "High-Protein Overnight Oats",
      tags: ["breakfast", "meal-prep"],
      ingredients: ["80g rolled oats", "150g Greek yoghurt", "1 scoop whey protein (30g)", "150ml almond milk", "50g mixed berries", "1 tsp honey"],
      steps: ["Mix oats, yoghurt, protein powder, and milk in a jar.", "Refrigerate overnight (or at least 4 hours).", "Top with berries and honey before serving."],
      calories: 520,
      proteinG: 42,
      carbsG: 55,
      fatG: 12,
      prepTime: 5,
      cookTime: 0
    },
    {
      id: "rec_2",
      name: "Grilled Chicken & Sweet Potato Bowl",
      tags: ["lunch", "dinner", "high-protein"],
      ingredients: ["180g chicken breast", "200g sweet potato", "100g broccoli", "1 tbsp olive oil", "Salt, pepper, paprika"],
      steps: ["Season chicken with paprika, salt, pepper.", "Bake chicken at 200\xB0C for 20\u201325 min.", "Cube sweet potato and roast alongside chicken.", "Steam broccoli, drizzle with olive oil."],
      calories: 480,
      proteinG: 48,
      carbsG: 42,
      fatG: 12,
      prepTime: 10,
      cookTime: 30
    },
    {
      id: "rec_3",
      name: "Salmon with Quinoa & Greens",
      tags: ["dinner", "omega-3", "high-protein"],
      ingredients: ["160g salmon fillet", "80g quinoa", "100g spinach", "1 tbsp olive oil", "Lemon wedge", "Salt & pepper"],
      steps: ["Rinse quinoa and cook in 2x volume water for 15 min.", "Pan-sear salmon skin-side down 4 min per side.", "Wilt spinach in same pan with olive oil.", "Serve quinoa with salmon and greens, squeeze lemon."],
      calories: 580,
      proteinG: 45,
      carbsG: 38,
      fatG: 28,
      prepTime: 5,
      cookTime: 20
    },
    {
      id: "rec_4",
      name: "Turkey Mince & Brown Rice Stir-Fry",
      tags: ["lunch", "dinner", "high-protein"],
      ingredients: ["150g turkey mince", "100g cooked brown rice", "100g mixed peppers", "50g edamame", "1 tbsp soy sauce", "1 tsp sesame oil"],
      steps: ["Brown turkey mince in a hot pan.", "Add sliced peppers and stir-fry 3 min.", "Add rice and edamame, season with soy sauce.", "Finish with sesame oil."],
      calories: 450,
      proteinG: 40,
      carbsG: 40,
      fatG: 12,
      prepTime: 10,
      cookTime: 15
    },
    {
      id: "rec_5",
      name: "Protein Pancakes",
      tags: ["breakfast", "high-protein"],
      ingredients: ["80g oats blended", "1 scoop vanilla protein powder (30g)", "1 whole egg + 2 whites", "100ml almond milk", "1 tsp baking powder"],
      steps: ["Blend all ingredients into a smooth batter.", "Cook on medium heat with light oil spray.", "Flip when bubbles appear, cook 2 min per side."],
      calories: 420,
      proteinG: 38,
      carbsG: 45,
      fatG: 8,
      prepTime: 5,
      cookTime: 10
    },
    {
      id: "rec_6",
      name: "Greek Yoghurt & Avocado Power Bowl",
      tags: ["breakfast", "snack"],
      ingredients: ["200g Greek yoghurt", "Half avocado", "30g granola", "50g banana slices", "1 tsp chia seeds"],
      steps: ["Spoon yoghurt into a bowl.", "Slice avocado and layer on top.", "Add granola, banana, and chia seeds."],
      calories: 460,
      proteinG: 28,
      carbsG: 42,
      fatG: 20,
      prepTime: 5,
      cookTime: 0
    },
    {
      id: "rec_7",
      name: "Cottage Cheese & Fruit Snack Plate",
      tags: ["snack", "high-protein"],
      ingredients: ["200g cottage cheese", "1 small apple", "20g almonds", "Cinnamon"],
      steps: ["Spoon cottage cheese into a bowl.", "Slice apple, dust with cinnamon.", "Serve with almonds."],
      calories: 320,
      proteinG: 28,
      carbsG: 25,
      fatG: 12,
      prepTime: 3,
      cookTime: 0
    },
    {
      id: "rec_8",
      name: "Egg White Omelette with Veg",
      tags: ["breakfast", "low-fat"],
      ingredients: ["6 egg whites", "50g spinach", "50g mushrooms", "30g feta cheese", "Salt, pepper, herbs"],
      steps: ["Whisk egg whites with salt and pepper.", "Pour into non-stick pan over medium heat.", "Add spinach, mushrooms, and feta.", "Fold and serve when set."],
      calories: 180,
      proteinG: 24,
      carbsG: 5,
      fatG: 6,
      prepTime: 5,
      cookTime: 8
    },
    {
      id: "rec_9",
      name: "Chicken & Quinoa Meal Prep Boxes",
      tags: ["meal-prep", "lunch", "high-protein"],
      ingredients: ["160g chicken breast", "80g quinoa", "80g roasted vegetables", "100g mixed leaf", "1 tbsp tahini dressing"],
      steps: ["Cook quinoa (2:1 water, 15 min).", "Grill chicken with herbs.", "Roast vegetables at 200\xB0C for 20 min.", "Divide into containers with leafy greens. Drizzle tahini."],
      calories: 520,
      proteinG: 50,
      carbsG: 40,
      fatG: 15,
      prepTime: 15,
      cookTime: 25
    },
    {
      id: "rec_10",
      name: "Protein Shake Smoothie",
      tags: ["post-workout", "snack"],
      ingredients: ["1 scoop whey protein (30g)", "250ml semi-skimmed milk", "1 banana", "30g oats", "1 tbsp peanut butter"],
      steps: ["Add all ingredients to a blender.", "Blend until smooth.", "Drink within 30 minutes of training."],
      calories: 450,
      proteinG: 38,
      carbsG: 50,
      fatG: 12,
      prepTime: 3,
      cookTime: 0
    }
  ];
  suggestRecipe(foodName) {
    if (!foodName) return this.RECIPE_LIBRARY[0];
    const foodLower = foodName.toLowerCase();
    const scored = this.RECIPE_LIBRARY.map((recipe) => {
      const nameMatch = recipe.name.toLowerCase().includes(foodLower) ? 3 : 0;
      const tagMatch = recipe.tags.some((tag) => foodLower.includes(tag) || tag.includes(foodLower)) ? 2 : 0;
      const ingredientMatch = recipe.ingredients.some((ing) => foodLower.includes(ing.split(" ")[1] ?? "") || ing.toLowerCase().includes(foodLower)) ? 1 : 0;
      return { recipe, score: nameMatch + tagMatch + ingredientMatch };
    }).sort((a, b) => b.score - a.score);
    return scored[0]?.recipe ?? this.RECIPE_LIBRARY[0];
  }
  listRecipes(searchTerm) {
    const search = searchTerm?.trim().toLowerCase();
    if (!search) return this.RECIPE_LIBRARY;
    return this.RECIPE_LIBRARY.filter(
      (recipe) => recipe.name.toLowerCase().includes(search) || recipe.tags.some((tag) => tag.toLowerCase().includes(search)) || recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(search))
    );
  }
  // ── Habit Tracking ─────────────────────────────────────────────────
  listHabits(clientId) {
    if (!this.state.habits) this.state.habits = [];
    if (!clientId) return this.state.habits;
    return this.state.habits.filter((h) => h.clientId === clientId);
  }
  async createHabit(payload) {
    if (!this.state.habits) this.state.habits = [];
    const habit = {
      id: `habit_${Date.now()}`,
      clientId: payload.clientId,
      title: payload.title,
      target: payload.target,
      frequency: payload.frequency,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.state.habits = [...this.state.habits, habit];
    await this.commit();
    return { success: true, habit };
  }
  async toggleHabitCompletion(habitId, date) {
    if (!this.state.habitCompletions) this.state.habitCompletions = [];
    const existing = this.state.habitCompletions.find((hc) => hc.habitId === habitId && hc.date === date);
    if (existing) {
      this.state.habitCompletions = this.state.habitCompletions.map(
        (hc) => hc.id === existing.id ? { ...hc, completed: !hc.completed } : hc
      );
      const updated = this.state.habitCompletions.find((hc) => hc.id === existing.id);
      await this.commit();
      return { success: true, completion: updated };
    } else {
      const completion = {
        id: `hc_${Date.now()}`,
        habitId,
        date,
        completed: true
      };
      this.state.habitCompletions = [...this.state.habitCompletions, completion];
      await this.commit();
      return { success: true, completion };
    }
  }
  getHabitSummary(clientId) {
    const today2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const habits = this.listHabits(clientId);
    if (!this.state.habitCompletions) this.state.habitCompletions = [];
    return habits.map((habit) => {
      const completions = this.state.habitCompletions.filter((hc) => hc.habitId === habit.id && hc.completed);
      let streak = 0;
      const date = new Date(today2);
      while (true) {
        const dateStr = date.toISOString().slice(0, 10);
        const hasCompletion = this.state.habitCompletions.some((hc) => hc.habitId === habit.id && hc.date === dateStr && hc.completed);
        if (!hasCompletion) break;
        streak++;
        date.setDate(date.getDate() - 1);
      }
      const todayDone = this.state.habitCompletions.some((hc) => hc.habitId === habit.id && hc.date === today2 && hc.completed);
      return { habit, streak, todayDone, totalCompletions: completions.length };
    });
  }
};
function summarizeAnalytics(events) {
  const counts = events.reduce((acc, event) => {
    acc[event.name] = (acc[event.name] ?? 0) + 1;
    return acc;
  }, {});
  return {
    totalEvents: events.length,
    topEvents: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    lastEventAt: events.at(-1)?.occurredAt ?? null
  };
}

// apps/api/src/bootstrap.ts
async function createPersistentStore(env = process.env) {
  const config2 = loadConfig(env);
  const isServerless = config2.nodeEnv === "production" && !config2.databaseUrl && config2.storageMode === "json";
  const repository = config2.storageMode === "postgres_snapshot" && config2.databaseUrl ? new PostgresDemoStateRepository(config2.databaseUrl) : config2.storageMode === "postgres_relational" && config2.databaseUrl ? new PostgresRelationalDemoStateRepository(config2.databaseUrl) : isServerless ? new InMemoryDemoStateRepository() : new JsonFileDemoStateRepository(config2.stateFilePath);
  return DemoStore.create(repository, createServiceAdapters(config2));
}

// apps/api/src/server.ts
var config = loadConfig();
async function main() {
  const store = await createPersistentStore(process.env);
  const app = createApp(store);
  app.listen(config.port, () => {
    console.log(`CoachOS API running on http://localhost:${config.port}`);
  });
}
void main();
