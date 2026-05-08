import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, ChevronUp, Send, Sparkles } from "lucide-react";
import { fetchJson } from "../lib/api";

interface ClientProfile {
  fullName: string;
  goal: string;
  clientGender?: string;
  goalTimelineMonths?: number;
  healthConditions?: { label: string; note: string }[];
  supplements?: string[];
  nutritionCalories?: number | null;
  nutritionProteinG?: number | null;
  nutritionFatG?: number | null;
  nutritionCarbsG?: number | null;
  nutritionCoachNote?: string;
  dailyWaterTarget?: number;
  dailyStepsTarget?: number;
  adherenceScore?: number;
}

interface WeekDay {
  name: string;
  meals: { slot: string; name: string; cal: number; protein: number; carbs: number; fat: number }[];
}

interface ChatMessage {
  role: "coach" | "ai";
  content: string;
}

interface RecipeCard {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: string;
  timing: string;
  oilNote: string;
  ingredients: string[];
  steps: string[];
}

interface AINutritionChatProps {
  clientProfile: ClientProfile | null;
  mealWeek?: WeekDay[];
}

function buildSystemPrompt(profile: ClientProfile, mealWeek?: WeekDay[]): string {
  const lines: string[] = [
    "You are a specialist AI nutrition coach assistant working inside CoachOS, a professional fitness coaching platform.",
    "You are helping a coach manage the nutrition of one of their clients. Below is the full client profile:",
    "",
    `CLIENT NAME: ${profile.fullName}`,
    `GOAL: ${profile.goal}`,
    `GENDER: ${profile.clientGender ?? "not specified"}`,
    `GOAL TIMELINE: ${profile.goalTimelineMonths ?? "not set"} months`,
    `ADHERENCE SCORE: ${profile.adherenceScore ?? "N/A"}%`,
    "",
    "DAILY MACRO TARGETS:",
    `  Calories: ${profile.nutritionCalories ?? "not set"} kcal`,
    `  Protein:  ${profile.nutritionProteinG ?? "not set"} g`,
    `  Carbs:    ${profile.nutritionCarbsG ?? "not set"} g`,
    `  Fat:      ${profile.nutritionFatG ?? "not set"} g`,
    "",
    `DAILY WATER TARGET: ${profile.dailyWaterTarget ?? 3} L`,
    `DAILY STEPS TARGET: ${profile.dailyStepsTarget ?? 10000}`,
    "",
  ];

  if (profile.healthConditions && profile.healthConditions.length > 0) {
    lines.push("HEALTH CONDITIONS / RESTRICTIONS:");
    profile.healthConditions.forEach(c => lines.push(`  - ${c.label}${c.note ? `: ${c.note}` : ""}`));
    lines.push("");
  }

  if (profile.supplements && profile.supplements.length > 0) {
    lines.push(`SUPPLEMENTS: ${profile.supplements.join(", ")}`);
    lines.push("");
  }

  if (profile.nutritionCoachNote) {
    lines.push(`COACH NUTRITION NOTE: ${profile.nutritionCoachNote}`);
    lines.push("");
  }

  if (mealWeek && mealWeek.length > 0) {
    lines.push("CURRENT MEAL PLAN SUMMARY (this week):");
    mealWeek.forEach(day => {
      const filled = day.meals.filter(m => m.name !== "-");
      if (filled.length > 0) {
        const totalCal = filled.reduce((s, m) => s + m.cal, 0);
        const totalP = filled.reduce((s, m) => s + m.protein, 0);
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
    '  ```recipe',
    '  {',
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
    '  }',
    '  ```',
    "- For general nutrition questions, give concise, practical advice.",
    "- Be encouraging and professional. Keep responses focused and actionable.",
    "- Always respect the client's health conditions — never suggest anything contraindicated.",
  );

  return lines.join("\n");
}

function parseRecipeCard(content: string): { card: RecipeCard; before: string; after: string } | null {
  const match = content.match(/```recipe\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const card = JSON.parse(match[1].trim()) as RecipeCard;
    const idx = content.indexOf("```recipe");
    const endIdx = content.indexOf("```", idx + 9) + 3;
    return {
      card,
      before: content.slice(0, idx).trim(),
      after: content.slice(endIdx).trim(),
    };
  } catch {
    return null;
  }
}

function RecipeCardView({ card }: { card: RecipeCard }) {
  return (
    <div className="ai-chat-recipe-card">
      <div className="ai-chat-recipe-header">
        <div className="ai-chat-recipe-name">{card.name}</div>
        <div className="ai-chat-recipe-macros">
          <span className="ai-chat-recipe-macro ai-chat-recipe-macro--cal">{card.calories} kcal</span>
          <span className="ai-chat-recipe-macro ai-chat-recipe-macro--p">P {card.protein}g</span>
          <span className="ai-chat-recipe-macro ai-chat-recipe-macro--c">C {card.carbs}g</span>
          <span className="ai-chat-recipe-macro ai-chat-recipe-macro--f">F {card.fat}g</span>
        </div>
        <div className="ai-chat-recipe-meta">
          {card.servings && <span>{card.servings}</span>}
          {card.timing && <span>· {card.timing}</span>}
        </div>
      </div>

      {card.oilNote && (
        <div className="ai-chat-recipe-oil-note">
          <span className="ai-chat-recipe-oil-label">Oil / Fat note:</span> {card.oilNote}
        </div>
      )}

      {card.ingredients && card.ingredients.length > 0 && (
        <div className="ai-chat-recipe-section">
          <div className="ai-chat-recipe-section-title">Ingredients</div>
          <ul className="ai-chat-recipe-list">
            {card.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>
      )}

      {card.steps && card.steps.length > 0 && (
        <div className="ai-chat-recipe-section">
          <div className="ai-chat-recipe-section-title">Steps</div>
          <ol className="ai-chat-recipe-list ai-chat-recipe-list--steps">
            {card.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isCoach = msg.role === "coach";
  const parsed = isCoach ? null : parseRecipeCard(msg.content);

  return (
    <div className={`ai-chat-message ai-chat-message--${msg.role}`}>
      {isCoach ? (
        <div className="ai-chat-bubble ai-chat-bubble--coach">{msg.content}</div>
      ) : parsed ? (
        <div className="ai-chat-bubble ai-chat-bubble--ai">
          {parsed.before && <p className="ai-chat-text">{parsed.before}</p>}
          <RecipeCardView card={parsed.card} />
          {parsed.after && <p className="ai-chat-text ai-chat-text--after">{parsed.after}</p>}
        </div>
      ) : (
        <div className="ai-chat-bubble ai-chat-bubble--ai">
          {msg.content.split("\n").map((line, i) => (
            <p key={i} className="ai-chat-text">{line || <br />}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="ai-chat-message ai-chat-message--ai">
      <div className="ai-chat-bubble ai-chat-bubble--ai ai-chat-bubble--typing">
        <span className="ai-chat-dot" />
        <span className="ai-chat-dot" />
        <span className="ai-chat-dot" />
      </div>
    </div>
  );
}

const SUGGESTED_QUERIES = [
  "Give me a high-protein breakfast under 400 kcal",
  "Suggest a pre-workout meal for this client",
  "Create a Hummus Pita recipe with 50g protein",
  "What are 3 snack options under 200 kcal?",
];

export function AINutritionChat({ clientProfile, mealWeek }: AINutritionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [apiMissing, setApiMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([]);
    setApiMissing(false);
  }, [clientProfile?.fullName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !clientProfile) return;

    const newMsg: ChatMessage = { role: "coach", content: trimmed };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const openaiMessages = updated.map(m => ({
        role: m.role === "coach" ? "user" : "assistant",
        content: m.content,
      }));

      const data = await fetchJson<{ reply: string; error?: string }>("/ai/nutrition-chat", {
        method: "POST",
        body: JSON.stringify({
          messages: openaiMessages,
          systemPrompt: buildSystemPrompt(clientProfile, mealWeek),
        }),
      });

      if (data.error === "OPENAI_KEY_MISSING") {
        setApiMissing(true);
        setMessages(prev => prev.slice(0, -1));
        setInput(trimmed);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "ai",
        content: "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [clientProfile, loading, mealWeek, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }, [input, sendMessage]);

  if (!clientProfile) {
    return (
      <div className="ai-chat-empty">
        <Bot size={32} className="ai-chat-empty-icon" />
        <p>Select a client to start the AI nutrition assistant.</p>
      </div>
    );
  }

  if (apiMissing) {
    return (
      <div className="ai-chat-setup">
        <div className="ai-chat-setup-icon"><Sparkles size={28} /></div>
        <h3>OpenAI API key required</h3>
        <p>
          To use AI Nutrition Chat, add your <strong>OPENAI_API_KEY</strong> as a Replit secret,
          then restart the API Server workflow.
        </p>
        <ol className="ai-chat-setup-steps">
          <li>Open the <strong>Secrets</strong> panel in your Replit workspace (lock icon in the sidebar)</li>
          <li>Add a secret named <code>OPENAI_API_KEY</code> with your OpenAI API key</li>
          <li>Restart the <strong>API Server</strong> workflow</li>
        </ol>
        <button className="ai-chat-setup-retry" onClick={() => setApiMissing(false)}>
          Try again
        </button>
      </div>
    );
  }

  const hasConditions = (clientProfile.healthConditions ?? []).length > 0;
  const hasSupplements = (clientProfile.supplements ?? []).length > 0;

  return (
    <div className="ai-chat-layout">
      <div className="ai-chat-context-card">
        <button
          className="ai-chat-context-toggle"
          onClick={() => setContextOpen(o => !o)}
          type="button"
        >
          <span className="ai-chat-context-label">
            <Bot size={15} />
            AI context for <strong>{clientProfile.fullName}</strong>
          </span>
          {contextOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {contextOpen && (
          <div className="ai-chat-context-body">
            <div className="ai-chat-context-pills">
              <span className="ai-chat-ctx-pill ai-chat-ctx-pill--goal">{clientProfile.goal}</span>
              {clientProfile.nutritionCalories && (
                <span className="ai-chat-ctx-pill">{clientProfile.nutritionCalories} kcal/day</span>
              )}
              {clientProfile.nutritionProteinG && (
                <span className="ai-chat-ctx-pill">{clientProfile.nutritionProteinG}g protein</span>
              )}
              {clientProfile.nutritionCarbsG && (
                <span className="ai-chat-ctx-pill">{clientProfile.nutritionCarbsG}g carbs</span>
              )}
              {clientProfile.nutritionFatG && (
                <span className="ai-chat-ctx-pill">{clientProfile.nutritionFatG}g fat</span>
              )}
              {clientProfile.clientGender && (
                <span className="ai-chat-ctx-pill">{clientProfile.clientGender}</span>
              )}
              {clientProfile.goalTimelineMonths && (
                <span className="ai-chat-ctx-pill">{clientProfile.goalTimelineMonths}mo timeline</span>
              )}
            </div>
            {hasConditions && (
              <div className="ai-chat-context-row">
                <span className="ai-chat-context-rowlabel">Conditions:</span>
                {clientProfile.healthConditions!.map(c => (
                  <span key={c.label} className="ai-chat-ctx-pill ai-chat-ctx-pill--warn">{c.label}</span>
                ))}
              </div>
            )}
            {hasSupplements && (
              <div className="ai-chat-context-row">
                <span className="ai-chat-context-rowlabel">Supplements:</span>
                {clientProfile.supplements!.map(s => (
                  <span key={s} className="ai-chat-ctx-pill">{s}</span>
                ))}
              </div>
            )}
            {clientProfile.nutritionCoachNote && (
              <div className="ai-chat-context-note">
                <span className="ai-chat-context-rowlabel">Note:</span> {clientProfile.nutritionCoachNote}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ai-chat-messages">
        {messages.length === 0 && !loading && (
          <div className="ai-chat-welcome">
            <div className="ai-chat-welcome-icon"><Sparkles size={22} /></div>
            <p className="ai-chat-welcome-title">Ask anything about <strong>{clientProfile.fullName}</strong>'s nutrition</p>
            <p className="ai-chat-welcome-sub">Recipes, meal timing, macro breakdowns, pre/post-workout ideas — all personalised to their profile.</p>
            <div className="ai-chat-suggestions">
              {SUGGESTED_QUERIES.map(q => (
                <button key={q} className="ai-chat-suggestion-btn" onClick={() => void sendMessage(q)} type="button">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-row">
        <textarea
          ref={textareaRef}
          className="ai-chat-textarea"
          rows={1}
          placeholder="Ask about recipes, macros, meal timing…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="ai-chat-send-btn"
          onClick={() => void sendMessage(input)}
          disabled={!input.trim() || loading}
          type="button"
          aria-label="Send"
        >
          <Send size={16} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
