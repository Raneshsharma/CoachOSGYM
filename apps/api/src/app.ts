import express from "express";
import cors from "cors";
import { analyticsEventSchema, groupProgramSchema, nutritionSwapSchema } from "@coachos/domain";
import { DemoStore } from "./store";
import OpenAI from "openai";

export function createApp(store: DemoStore) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "coachos-api" });
  });

  // ── Auth routes (unprotected) ─────────────────────────────
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "email and password are required." });
      return;
    }
    const result = store.loginCoach(email.trim(), password);
    if (!result.success) {
      res.status(401).json({ message: result.error ?? "Invalid credentials." });
      return;
    }
    res.json({ token: result.token, coachId: result.coachId });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, firstName, lastName } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" ||
        typeof firstName !== "string" || typeof lastName !== "string") {
      res.status(400).json({ message: "email, password, firstName and lastName are required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters." });
      return;
    }
    const result = store.registerCoach(email.trim(), password, firstName.trim(), lastName.trim());
    if (!result.success) {
      res.status(409).json({ message: result.error ?? "Registration failed." });
      return;
    }
    res.status(201).json({ token: result.token, coachId: result.coachId });
  });

  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token) store.logoutCoach(token);
    res.json({ ok: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const coachId = token ? store.validateToken(token) : null;
    if (!coachId) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }
    res.json({ coachId });
  });

  // ── Auth middleware for all subsequent routes ─────────────
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token || !store.validateToken(token)) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return;
    }
    next();
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
        status: typeof req.query.status === "string" ? req.query.status : undefined,
        search: typeof req.query.search === "string" ? req.query.search : undefined
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

  // ── Client Notes ─────────────────────────────
  app.get("/api/clients/:clientId/notes", (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) { res.status(404).json({ message: "Client not found." }); return; }
    res.json(store.listClientNotes(req.params.clientId));
  });

  app.post("/api/clients/:clientId/notes", async (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) { res.status(404).json({ message: "Client not found." }); return; }
    if (typeof req.body.content !== "string" || !req.body.content.trim()) {
      res.status(400).json({ message: "content is required." }); return;
    }
    const note = await store.createClientNote(req.params.clientId, req.body.content);
    res.status(201).json(note);
  });

  app.delete("/api/clients/:clientId/notes/:noteId", async (req, res) => {
    const ok = await store.deleteClientNote(req.params.clientId, req.params.noteId);
    if (!ok) { res.status(404).json({ message: "Note not found." }); return; }
    res.json({ ok: true });
  });

  // ── Client Body Metrics ─────────────────────
  app.get("/api/clients/:clientId/metrics", (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) { res.status(404).json({ message: "Client not found." }); return; }
    res.json(store.listBodyMetrics(req.params.clientId));
  });

  app.post("/api/clients/:clientId/metrics", async (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) { res.status(404).json({ message: "Client not found." }); return; }
    if (typeof req.body.date !== "string" || !req.body.date.trim()) {
      res.status(400).json({ message: "date is required." }); return;
    }
    const metric = await store.saveBodyMetric(req.params.clientId, {
      date: req.body.date,
      weightKg: req.body.weightKg ?? null,
      bodyFatPct: req.body.bodyFatPct ?? null,
      waistCm: req.body.waistCm ?? null
    });
    res.status(201).json(metric);
  });

  // ── Session Booking ─────────────────────────
  app.post("/api/clients/:clientId/sessions", async (req, res) => {
    const client = store.listClients().find((item) => item.id === req.params.clientId);
    if (!client) { res.status(404).json({ message: "Client not found." }); return; }
    if (typeof req.body.date !== "string" || !req.body.date.trim()) {
      res.status(400).json({ message: "date is required." }); return;
    }
    if (typeof req.body.duration !== "number" || req.body.duration <= 0) {
      res.status(400).json({ message: "duration must be a positive number." }); return;
    }
    if (req.body.type !== "virtual" && req.body.type !== "in-person") {
      res.status(400).json({ message: "type must be 'virtual' or 'in-person'." }); return;
    }
    const session = await store.createSession(req.params.clientId, {
      date: req.body.date,
      duration: req.body.duration,
      type: req.body.type,
      notes: typeof req.body.notes === "string" ? req.body.notes : undefined
    });
    res.status(201).json(session);
  });

  app.get("/api/plans", (req, res) => {
    res.json(
      store.listPlans({
        status: typeof req.query.status === "string" ? req.query.status : undefined,
        clientId: typeof req.query.clientId === "string" ? req.query.clientId : undefined
      })
    );
  });

  app.get("/api/check-ins", (req, res) => {
    res.json(
      store.listCheckIns({
        clientId: typeof req.query.clientId === "string" ? req.query.clientId : undefined
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
    const { clientId, status } = req.body as { clientId?: string; status?: "active" | "past_due" | "cancelled" };
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

  // ── Group Programs ──────────────────────────
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
      if ("notFound" in result && result.notFound) { res.status(404).json({ message: "Program not found." }); return; }
      res.status(400).json({ message: "Invalid program patch." }); return;
    }
    res.json(result.program);
  });

  app.delete("/api/group-programs/:programId", async (req, res) => {
    const ok = await store.archiveGroupProgram(req.params.programId);
    if (!ok) { res.status(404).json({ message: "Program not found." }); return; }
    res.json({ ok: true });
  });

  // ── Nutrition Swap Agent ─────────────────────
  app.post("/api/nutrition/swap", (req, res) => {
    res.json(store.suggestNutritionSwap(req.body));
  });

  app.post("/api/nutrition/swap/apply", async (req, res) => {
    const result = await store.applyNutritionSwap(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid swap application." }); return;
    }
    res.json(result.swap);
  });

  app.get("/api/nutrition/swaps/:planId", (req, res) => {
    res.json(store.getNutritionSwaps(req.params.planId));
  });

  // ── Exercise Library ─────────────────────
  app.get("/api/exercises", (req, res) => {
    res.json(store.listExercises({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      bodyPart: typeof req.query.bodyPart === "string" ? req.query.bodyPart : undefined,
      equipment: typeof req.query.equipment === "string" ? req.query.equipment : undefined,
    }));
  });

  // ── Recipe Library ───────────────────────
  app.get("/api/recipes", (req, res) => {
    const food = typeof req.query.food === "string" ? req.query.food : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    res.json(food ? store.suggestRecipe(food) : store.listRecipes(search));
  });

  // ── Habit Tracking ────────────────────────
  app.get("/api/habits", (req, res) => {
    res.json(store.listHabits(typeof req.query.clientId === "string" ? req.query.clientId : undefined));
  });

  app.get("/api/habits/summary", (req, res) => {
    const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
    if (!clientId) { res.status(400).json({ message: "clientId is required." }); return; }
    res.json(store.getHabitSummary(clientId));
  });

  app.post("/api/habits", async (req, res) => {
    if (!req.body.clientId || !req.body.title || req.body.target == null || !req.body.frequency) {
      res.status(400).json({ message: "clientId, title, target, and frequency are required." }); return;
    }
    const result = await store.createHabit(req.body);
    if (!result.success) { res.status(400).json({ message: "Invalid habit payload." }); return; }
    res.status(201).json(result.habit);
  });

  app.post("/api/habits/:habitId/complete", async (req, res) => {
    const date = typeof req.body.date === "string" ? req.body.date : new Date().toISOString().slice(0, 10);
    const result = await store.toggleHabitCompletion(req.params.habitId, date);
    res.json(result.completion);
  });

  // ── AI Nutrition Chat ─────────────────────────────────────
  app.get("/api/ai/nutrition-status", (_req, res) => {
    res.json({ keyConfigured: Boolean(process.env.OPENAI_API_KEY) });
  });

  function buildNutritionSystemPrompt(profile: Record<string, unknown>, mealWeek?: Array<{ name: string; meals: Array<{ slot: string; name: string; cal: number; protein: number }> }>): string {
    const lines: string[] = [
      "You are a specialist AI nutrition coach assistant working inside CoachOS, a professional fitness coaching platform.",
      "You are helping a coach manage the nutrition of one of their clients. Below is the full client profile:",
      "",
      `CLIENT NAME: ${String(profile.fullName ?? "Unknown")}`,
      `GOAL: ${String(profile.goal ?? "not set")}`,
      `GENDER: ${String(profile.clientGender ?? "not specified")}`,
      `GOAL TIMELINE: ${String(profile.goalTimelineMonths ?? "not set")} months`,
      `ADHERENCE SCORE: ${String(profile.adherenceScore ?? "N/A")}%`,
      "",
      "DAILY MACRO TARGETS:",
      `  Calories: ${String(profile.nutritionCalories ?? "not set")} kcal`,
      `  Protein:  ${String(profile.nutritionProteinG ?? "not set")} g`,
      `  Carbs:    ${String(profile.nutritionCarbsG ?? "not set")} g`,
      `  Fat:      ${String(profile.nutritionFatG ?? "not set")} g`,
      "",
      `DAILY WATER TARGET: ${String(profile.dailyWaterTarget ?? 3)} L`,
      `DAILY STEPS TARGET: ${String(profile.dailyStepsTarget ?? 10000)}`,
      "",
    ];

    const conditions = profile.healthConditions as Array<{ label: string; note: string }> | undefined;
    if (conditions && conditions.length > 0) {
      lines.push("HEALTH CONDITIONS / RESTRICTIONS:");
      conditions.forEach(c => lines.push(`  - ${c.label}${c.note ? `: ${c.note}` : ""}`));
      lines.push("");
    }

    const supplements = profile.supplements as string[] | undefined;
    if (supplements && supplements.length > 0) {
      lines.push(`SUPPLEMENTS: ${supplements.join(", ")}`);
      lines.push("");
    }

    if (profile.nutritionCoachNote) {
      lines.push(`COACH NUTRITION NOTE: ${String(profile.nutritionCoachNote)}`);
      lines.push("");
    }

    if (mealWeek && mealWeek.length > 0) {
      lines.push("CURRENT MEAL PLAN SUMMARY (this week):");
      mealWeek.forEach(day => {
        const filled = day.meals.filter((m: { name: string }) => m.name !== "-");
        if (filled.length > 0) {
          const totalCal = filled.reduce((s, m) => s + (m.cal ?? 0), 0);
          const totalP = filled.reduce((s, m) => s + (m.protein ?? 0), 0);
          lines.push(`  ${day.name}: ${filled.map(m => m.name).join(", ")} — ${totalCal} kcal, ${totalP}g protein`);
        }
      });
      lines.push("");
    }

    lines.push(
      "INSTRUCTIONS:",
      "- Always personalise every response to this client's specific goals, macros, and health conditions.",
      "- When asked for a recipe, return a RECIPE_CARD JSON block followed by a brief explanation.",
      "  Format the recipe card exactly like this:",
      "  ```recipe",
      "  {",
      '    "name": "...",',
      '    "calories": 000,',
      '    "protein": 00,',
      '    "carbs": 00,',
      '    "fat": 00,',
      '    "servings": "1 serving",',
      '    "timing": "e.g. Post-workout / 6:00 PM",',
      '    "oilNote": "e.g. Use 1 tsp olive oil",',
      '    "ingredients": ["200g chicken breast", "..."],',
      '    "steps": ["Step 1", "Step 2", "..."]',
      "  }",
      "  ```",
      "- For general nutrition questions, give concise, practical advice.",
      "- Be encouraging and professional. Keep responses focused and actionable.",
      "- Always respect the client's health conditions — never suggest anything contraindicated.",
    );

    return lines.join("\n");
  }

  app.post("/api/ai/nutrition-chat", async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "OPENAI_KEY_MISSING", message: "Set OPENAI_API_KEY as a Replit secret." });
      return;
    }

    const { messages, clientProfile, mealWeek } = req.body ?? {};
    if (!Array.isArray(messages) || typeof clientProfile !== "object" || clientProfile === null) {
      res.status(400).json({ message: "messages (array) and clientProfile (object) are required." });
      return;
    }

    const systemPrompt = buildNutritionSystemPrompt(
      clientProfile as Record<string, unknown>,
      Array.isArray(mealWeek) ? mealWeek as Array<{ name: string; meals: Array<{ slot: string; name: string; cal: number; protein: number }> }> : undefined
    );

    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages as { role: "user" | "assistant"; content: string }[],
        ],
        max_tokens: 1200,
        temperature: 0.7,
      });
      const reply = completion.choices[0]?.message?.content ?? "";
      res.json({ reply });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OpenAI request failed";
      res.status(502).json({ message: msg });
    }
  });

  return app;
}
