import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs/coach_dashboard_workflow");
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();

const palette = {
  navy: "#132238",
  teal: "#0F766E",
  green: "#16A34A",
  amber: "#D97706",
  red: "#DC2626",
  blue: "#2563EB",
  grayText: "#475569",
  light: "#F8FAFC",
  border: "#CBD5E1",
  header: "#E2E8F0",
};

function addSheet(name, title, subtitle, headers, rows, widths = []) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  sheet.getRange("A1:H1").merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format = {
    fill: palette.navy,
    font: { bold: true, color: "#FFFFFF", size: 16 },
  };
  sheet.getRange("A2:H2").merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2").format = {
    fill: palette.light,
    font: { color: palette.grayText, italic: true },
  };

  const colCount = headers.length;
  const headerRange = sheet.getRangeByIndexes(3, 0, 1, colCount);
  headerRange.values = [headers];
  headerRange.format = {
    fill: palette.teal,
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };

  const normalizedRows = rows.map(row => {
    const next = row.slice(0, colCount);
    while (next.length < colCount) next.push("");
    return next;
  });

  if (normalizedRows.length) {
    const dataRange = sheet.getRangeByIndexes(4, 0, normalizedRows.length, colCount);
    dataRange.values = normalizedRows;
    dataRange.format = {
      wrapText: true,
      border: { color: palette.border, style: "continuous" },
    };
  }

  sheet.freezePanes.freezeRows(4);
  for (let i = 0; i < widths.length; i++) {
    sheet.getRangeByIndexes(0, i, Math.max(normalizedRows.length + 5, 6), 1).format.columnWidthPx = widths[i];
  }
  const tableRange = sheet.getRangeByIndexes(3, 0, Math.max(normalizedRows.length + 1, 2), colCount);
  sheet.tables.add(tableRange, true, `${name.replace(/[^A-Za-z0-9]/g, "")}Table`);
  return sheet;
}

const executiveRows = [
  ["Scope", "Coach Dashboard first pass", "Analyzed the interactive frontend dashboard page, global sidebar, dashboard-specific popups, headings, cards, tiles, and navigation exits."],
  ["Primary user", "Coach / workspace owner", "Starts on Coach Dashboard and decides whether to review schedule, manage clients, create plans, log workout activity, message clients, or act on risk flags."],
  ["Main workflow pattern", "Dashboard as command center", "The page combines overview metrics, risk prioritization, upcoming renewals, and action buttons that route the coach into deeper operational pages."],
  ["Strongest journey", "Risk to outreach", "At-risk row send button simulates a recovery check-in; AI insight email opens a mailto draft for the most relevant client."],
  ["Weakest journey", "Add Client quick action", "Dashboard 'Add Client' navigates to All Clients instead of opening the Add New Client modal directly, so the label and behavior are not fully aligned."],
  ["Second friction point", "Schedule Session quick action", "Dashboard button routes to Calendar, but does not open a session booking form. It is more of a calendar navigation action than scheduling completion."],
  ["Data persistence note", "Mixed", "Client notes, messages, workout check-in logging, and simulated check-ins call API endpoints. Sidebar notification read state is local UI state."],
  ["Recommended next step", "Complete all pages in same structure", "Repeat this workbook pattern page-by-page: visible UI inventory, click outcome, data action, gaps, and proposed journey improvements."],
];

addSheet(
  "Executive Summary",
  "CoachOS Frontend Workflow Audit - Coach Dashboard",
  "High-level interpretation of the current dashboard user journey.",
  ["Area", "Finding", "Detail"],
  executiveRows,
  [190, 230, 700],
);

const pageMapRows = [
  ["Sidebar", "Coach Dashboard", "Overview", "Button", "activeNav = dashboard", "Loads DashboardView", "Shows at-risk badge count if any", "Current page"],
  ["Sidebar", "All Clients", "Clients", "Button", "activeNav = clients", "Loads ClientsView", "Can open client profiles and Add Client modal", "Core client management"],
  ["Sidebar", "Client Portal", "Clients", "Button", "activeNav = portal", "Loads PortalView", "If no selected client, portal state may be empty until client selected", "Client-specific workflow"],
  ["Sidebar", "Calendar", "Clients", "Button", "activeNav = calendar", "Loads CalendarView", "Calendar supports date selection, events, blocked date notes", "Scheduling workflow"],
  ["Sidebar", "AI Plans", "Clients", "Button", "activeNav = plans", "Loads PlansView", "Plan creation/approval workflow", "Plan generation"],
  ["Sidebar", "Habits", "Clients", "Button", "activeNav = habits", "Loads HabitsView", "Habit completion and nudges", "Habit coaching"],
  ["Sidebar", "Group Programs", "Clients", "Button", "activeNav = groups", "Loads GroupsView", "Group creation/edit/archive", "Group coaching"],
  ["Sidebar", "Exercise Library", "Preview", "Button", "activeNav = exercises", "Loads ExerciseLibraryView", "Search and body-part filters", "Reference library"],
  ["Sidebar", "Recipe Browser", "Preview", "Button", "activeNav = recipes", "Loads RecipeBrowserView", "Recipe search/detail modal", "Nutrition reference"],
  ["Sidebar", "Billing & MRR", "Business", "Button", "activeNav = billing", "Loads BillingView", "Revenue and VAT view", "Business workflow"],
  ["Sidebar", "Competitors", "Business", "Button", "activeNav = competitors", "Loads CompetitorsView", "Competitive comparison page", "Research / positioning"],
  ["Sidebar", "Migration", "Business", "Button", "activeNav = migration", "Loads MigrationView", "Import/export/reset workflows", "Data management"],
  ["Sidebar", "Workspace", "Business", "Button", "activeNav = settings", "Loads SettingsView", "Brand, notifications, availability", "Workspace setup"],
  ["Sidebar", "Notifications icon", "Global", "Button", "showNotifications toggle", "Opens/closes notification panel", "Unread count badge shown if unread notifications exist", "Global overlay"],
  ["Notification panel", "Mark all read", "Global", "Button", "setNotifications(read=true)", "Marks all notifications as read", "Local UI state only", "Global overlay"],
];

addSheet(
  "Navigation Map",
  "Global Navigation Map",
  "Every sidebar action visible while using Coach Dashboard and where it sends the user.",
  ["Surface", "Label", "Section", "Type", "Trigger", "Destination / Popup", "Conditions", "Journey Role"],
  pageMapRows,
  [160, 170, 130, 100, 230, 260, 330, 190],
);

const dashboardRows = [
  ["Hero", "Workspace/date eyebrow", "Heading metadata", "Text", "Not interactive", "Displays current weekday/date and workspace name", "Dashboard", "Dynamic from Date and session workspace", "Orientation", "Good"],
  ["Hero", "Good morning, {coach first name}.", "Main heading", "Text", "Not interactive", "Greets coach", "Dashboard", "Dynamic from session coach firstName", "Orientation", "Good"],
  ["Hero", "Workspace hero message", "Subheading", "Text", "Not interactive", "Displays workspace heroMessage", "Dashboard", "Editable in Workspace settings/onboarding", "Context", "Good"],
  ["Hero", "View Schedule", "Primary hero CTA", "Button", "onNav('calendar')", "Calendar page", "No modal; direct page switch", "Scheduling entry", "Good"],
  ["Hero", "Client Notes", "Secondary hero CTA", "Button", "onOpenClientNotes", "Client Notes & Chat modal", "Modal can close by X, overlay click, Escape", "Client communication entry", "Good"],
  ["Hero right", "Coach mascot", "Visual tile", "Graphic", "Not interactive", "Mascot changes by coach gender", "Dashboard", "Gender set in workspace settings/onboarding", "Brand/personality", "Good"],
  ["KPI grid", "Active Clients", "Card / tile", "Read-only card", "Not interactive", "Shows dashboard.activeClients and total clients", "Dashboard", "Uses activeClients + clients.length", "Business pulse", "Could be clickable to All Clients"],
  ["KPI grid", "Monthly Revenue", "Card / tile", "Read-only card", "Not interactive", "Shows active subscription total MRR and active subscription count", "Dashboard", "Filters active subscriptions", "Business pulse", "Could be clickable to Billing"],
  ["KPI grid", "At-Risk Flags", "Card / tile", "Read-only card", "Not interactive", "Shows count of dashboard.atRiskClients", "Dashboard", "Warning color if count > 0", "Risk pulse", "Could scroll/focus risk section"],
  ["KPI grid", "Checked In Today", "Card / tile", "Read-only card", "Not interactive", "Shows checkedInToday and pending count", "Dashboard", "Pending = clients.length - checkedInToday", "Engagement pulse", "Could link to check-in history"],
  ["Quick Actions", "Add Client", "Action button", "Button", "onNav('clients')", "All Clients page", "Does not open Add Client modal", "Client onboarding", "Label/action mismatch"],
  ["Quick Actions", "Log Workout", "Action button", "Button", "setShowWorkoutLogger(true)", "Log Workout Session modal", "Modal submits to /check-ins", "Coach activity logging", "Good"],
  ["Quick Actions", "Create Plan", "Action button", "Button", "onNav('plans')", "AI Plans page", "No modal", "Plan creation entry", "Good"],
  ["Quick Actions", "Schedule Session", "Action button", "Button", "onNav('calendar')", "Calendar page", "Does not open session booking modal", "Scheduling entry", "Label/action mismatch"],
  ["At-Risk Clients", "Section heading", "Heading", "Text", "Not interactive", "Labels client risk list", "Dashboard", "Shown above at-risk card", "Risk prioritization", "Good"],
  ["At-Risk Clients", "At-risk row", "List row", "Read-only row", "Not interactive except send icon", "Shows client initials, name, first reason, status badge", "Dashboard", "Only rendered if atRiskClients exists", "Risk prioritization", "Good"],
  ["At-Risk Clients", "Send nudge icon", "Inside row button", "Button", "onSimulateCheckIn(client.id)", "Stays on dashboard; toast appears", "Calls handleCheckIn then toast 'Check-in recovery simulated'", "Risk recovery", "Behavior is synthetic; label should clarify"],
  ["At-Risk Clients", "No at-risk clients today", "Empty state", "Text", "Not interactive", "Celebration empty state", "Dashboard", "Shown when atRiskClients.length === 0", "Positive feedback", "Good"],
  ["Upcoming", "Upcoming", "Card heading", "Text", "Not interactive", "Shows next 3 active/past_due subscription renewals", "Dashboard", "Sorted by renewalDate", "Renewal awareness", "Could link to Billing/client"],
  ["Upcoming", "Renewal item", "List item", "Read-only card", "Not interactive", "Shows renewal date, client name, goal", "Dashboard", "Hidden if client lookup fails", "Renewal awareness", "Could be clickable"],
  ["Upcoming", "No upcoming renewals", "Empty state", "Text", "Not interactive", "Fallback text", "Dashboard", "Shown when no matching renewal", "Renewal awareness", "Good"],
  ["Coach AI Insight", "Coach AI Insight", "Card heading", "Text", "Not interactive", "Labels recommendation card", "Dashboard", "Always visible", "Decision support", "Good"],
  ["Coach AI Insight", "Insight body", "Dynamic insight", "Text", "Not interactive", "Prioritizes at-risk, low adherence, no check-in, high revenue, else all-on-track", "Dashboard", "Computed client selection logic", "Decision support", "Good"],
  ["Coach AI Insight", "Send Email to Client", "Inside card CTA", "Button", "window.open(mailto...)", "External mail client compose window + success toast", "Requires browser/mail client support", "Client outreach", "Good but external dependency"],
];

addSheet(
  "Dashboard Inventory",
  "Coach Dashboard UI Inventory",
  "Headings, subheadings, cards, tiles, and every dashboard-specific interactive control.",
  ["Zone", "Visible Label", "UI Role", "Element Type", "Trigger / Handler", "Destination / Result", "Conditions / Data Source", "Journey Purpose", "UX Assessment"],
  dashboardRows,
  [150, 210, 160, 140, 240, 280, 340, 220, 250],
);

const modalRows = [
  ["Client Notes & Chat", "Open from Client Notes hero button", "Modal open", "onOpenClientNotes", "Displays modal with client selector and Notes tab", "Dashboard", "Global modal", "Good"],
  ["Client Notes & Chat", "X close", "Button", "onClose", "Closes modal", "Modal header", "Also overlay click and Escape close", "Good"],
  ["Client Notes & Chat", "Client selector", "Select", "setSelectedClientId", "Loads selected client's notes; chat loads when tab active", "Modal", "Required to scope notes/messages", "Good"],
  ["Client Notes & Chat", "Notes tab", "Tab button", "setActiveTab('notes')", "Shows notes list and add-note form", "Modal", "Default tab", "Good"],
  ["Client Notes & Chat", "Chat tab", "Tab button", "setActiveTab('chat')", "Fetches /messages/{clientId}; shows chat bubbles and send input", "Modal", "Loads on tab switch", "Good"],
  ["Client Notes & Chat", "Add a note...", "Textarea", "setNewNote", "Drafts note text", "Notes tab", "Submit disabled if blank", "Good"],
  ["Client Notes & Chat", "Add", "Submit button", "POST /clients/{clientId}/notes", "Adds note to top of notes list and shows success toast", "Notes tab", "Persists through API", "Good"],
  ["Client Notes & Chat", "Type a message...", "Input", "setNewMessage", "Drafts chat message", "Chat tab", "Submit disabled if blank", "Good"],
  ["Client Notes & Chat", "Send icon", "Submit button", "POST /messages", "Appends coach message to thread", "Chat tab", "Persists through API", "Good"],
  ["Log Workout Session", "Open from Log Workout quick action", "Modal open", "setShowWorkoutLogger(true)", "Displays workout logging form", "Dashboard", "Global modal", "Good"],
  ["Log Workout Session", "X close", "Button", "onClose", "Closes modal", "Modal header", "Also overlay click and Escape close", "Good"],
  ["Log Workout Session", "Client", "Select", "setSelectedClientId", "Chooses client receiving workout note", "Modal", "Defaults to first client", "Good"],
  ["Log Workout Session", "Date", "Date input", "setWorkoutDate", "Sets workout submittedAt date", "Modal", "Uses new Date(workoutDate).toISOString()", "Good"],
  ["Log Workout Session", "Session Type pills", "Button group", "setSessionType", "Selects strength/cardio/hiit/flexibility/other", "Modal", "Included in generated note text", "Good"],
  ["Log Workout Session", "+ Add", "Button", "addExercise", "Adds exercise input row", "Modal", "Can add multiple exercises", "Good"],
  ["Log Workout Session", "Exercise name / sets / reps / kg", "Inputs", "updateExercise", "Captures exercise details", "Modal", "Only rows with exercise name are submitted", "Good"],
  ["Log Workout Session", "Remove exercise X", "Button", "removeExercise", "Deletes exercise row", "Modal", "Only shown when more than one row", "Good"],
  ["Log Workout Session", "Cancel", "Button", "onClose", "Closes without saving", "Modal footer", "No confirmation", "Acceptable"],
  ["Log Workout Session", "Log Session", "Submit button", "POST /check-ins", "Creates check-in note containing workout details, closes modal, success toast", "Modal footer", "Disabled if submitting or no client", "Good"],
];

addSheet(
  "Dashboard Modals",
  "Dashboard Popups and Modal Workflows",
  "Detailed controls opened from Coach Dashboard hero and quick actions.",
  ["Popup", "Visible Label", "Element Type", "Trigger / Handler", "Result", "Location", "Conditions", "UX Assessment"],
  modalRows,
  [190, 220, 150, 240, 330, 150, 280, 210],
);

const journeyRows = [
  [1, "Coach lands on dashboard", "Read hero, KPIs, risk list, upcoming renewals, AI insight", "Dashboard", "Coach understands day status", "No action needed", "Keep"],
  [2, "Coach wants schedule", "Click View Schedule or Schedule Session", "Calendar page", "Calendar opens", "Schedule Session label does not complete booking", "Rename to View Calendar or open booking flow"],
  [3, "Coach wants to onboard client", "Click Add Client quick action", "All Clients page", "Coach must click another Add Client control there", "Extra step and label mismatch", "Open Add Client modal directly from dashboard"],
  [4, "Coach sees risk", "Review At-Risk Clients row", "Dashboard", "Risk reason and severity visible", "Row itself does not open profile", "Make row/client name clickable to portal profile"],
  [5, "Coach nudges at-risk client", "Click send icon", "Dashboard + toast", "handleCheckIn simulates recovery", "Synthetic action may be unclear", "Label as Simulate check-in or replace with actual message/nudge"],
  [6, "Coach follows AI insight", "Click Send Email to Client", "External mail client", "Mail draft opens with subject/body", "Depends on user's default mail setup", "Offer in-app message as primary option"],
  [7, "Coach reviews notes/messages", "Click Client Notes", "Client Notes & Chat modal", "Can switch client, add notes, send chat", "Modal is useful but not linked to specific at-risk row", "Allow opening modal scoped to clicked client"],
  [8, "Coach logs workout", "Click Log Workout", "Log Workout Session modal", "Can add exercises and save as check-in note", "No dedicated workout entity in UI; saved as check-in notes text", "Consider dedicated workout/session table display"],
  [9, "Coach wants renewal details", "Read Upcoming card", "Dashboard", "Renews are visible", "Items are not clickable", "Make renewal item open Billing or client profile"],
];

addSheet(
  "Journey Flow",
  "Coach Dashboard User Journey Flow",
  "Step-by-step interpretation of the dashboard workflow and recommended journey improvements.",
  ["Step", "Intent", "User Action", "Destination", "Current Outcome", "Friction / Gap", "Recommendation"],
  journeyRows,
  [70, 230, 260, 190, 290, 290, 330],
);

const gapRows = [
  ["High", "Add Client quick action", "Button says Add Client but only routes to All Clients page.", "Coach expects modal/form immediately.", "Change DashboardView prop to onAddClient and open AddClientModal directly."],
  ["High", "Schedule Session quick action", "Button says Schedule Session but only routes to Calendar.", "Coach expects booking flow or session creation.", "Either rename to View Calendar or open SessionBookingModal with selected/default client."],
  ["Medium", "At-risk rows", "Rows are informational; only send icon is clickable.", "Coach cannot open the affected client directly from row.", "Make row or client name open Client Portal for that client."],
  ["Medium", "Send nudge", "Action calls simulated check-in recovery rather than sending a real message/nudge.", "Could mislead operators about client communication.", "Rename as Simulate Recovery in demo or wire to message/nudge endpoint."],
  ["Medium", "AI email", "Uses mailto external client and shows toast after opening.", "If no mail client configured, action may silently fail outside app.", "Offer in-app Send Message alongside Email Draft."],
  ["Low", "KPI cards", "All KPI cards are read-only.", "Useful metrics but no drill-down.", "Make Active Clients -> Clients, MRR -> Billing, At-Risk -> risk list, Checked In -> check-in history."],
  ["Low", "Upcoming renewals", "Renewal cards are read-only.", "No next step for billing follow-up.", "Add click target to Billing subscription detail or client profile."],
  ["Low", "Notifications", "Mark all read is local UI state.", "Read state may not persist after reload.", "Persist notification read state if notifications become server-driven."],
];

addSheet(
  "UX Gaps",
  "Coach Dashboard UX Gaps and Fix Ideas",
  "Prioritized improvements based on the current frontend behavior.",
  ["Priority", "Area", "Observed Behavior", "Why It Matters", "Suggested Fix"],
  gapRows,
  [90, 210, 360, 330, 380],
);

const sourceRows = [
  ["apps/web/src/main.tsx", "Sidebar", "Lines ~398-490", "Global navigation and notifications"],
  ["apps/web/src/main.tsx", "DashboardView", "Lines ~620-887", "Hero, KPI grid, quick actions, at-risk clients, upcoming renewals, AI insight"],
  ["apps/web/src/main.tsx", "App render switch", "Lines ~5818-5920", "activeNav page routing and modal mounting"],
  ["apps/web/src/main.tsx", "WorkoutLoggerModal", "Lines ~3270-3375", "Dashboard Log Workout popup"],
  ["apps/web/src/main.tsx", "ClientNotesModal", "Lines ~3380-3570", "Dashboard Client Notes & Chat popup"],
];

addSheet(
  "Source Notes",
  "Source Notes",
  "Code locations used for this first-pass Coach Dashboard workflow audit.",
  ["File", "Component / Area", "Approx Lines", "Used For"],
  sourceRows,
  [280, 210, 160, 520],
);

for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange();
  used.format.wrapText = true;
  used.format.verticalAlignment = "top";
  sheet.getRange("A1").format.rowHeightPx = 32;
  sheet.getRange("A2").format.rowHeightPx = 38;
}

const overview = await workbook.inspect({
  kind: "sheet",
  include: "name",
  maxChars: 2000,
});
console.log(overview.ndjson);

const check = await workbook.inspect({
  kind: "table",
  range: "Dashboard Inventory!A4:I12",
  include: "values",
  tableMaxRows: 12,
  tableMaxCols: 9,
  maxChars: 4000,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of ["Executive Summary", "Dashboard Inventory", "Dashboard Modals", "Journey Flow", "UX Gaps"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replace(/[^A-Za-z0-9]/g, "_")}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "CoachOS_Coach_Dashboard_Workflow_Audit.xlsx");
await xlsx.save(outputPath);
console.log(outputPath);
