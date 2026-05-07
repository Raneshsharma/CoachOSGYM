import React from "react";
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateWorkoutDay,
  WorkoutPlannerTab,
  buildWorkoutInsights,
  insertExerciseAt,
  updateWorkoutDayNotes,
  replaceExerciseById,
  reorderExercises,
  summarizeWorkout,
  type WorkoutWeekDay,
} from "./WorkoutPlannerTab";

class FakeEvent {
  type: string;
  bubbles: boolean;
  target: FakeNode | null = null;
  currentTarget: FakeNode | null = null;
  defaultPrevented = false;
  private propagationStopped = false;

  constructor(type: string, init?: { bubbles?: boolean }) {
    this.type = type;
    this.bubbles = init?.bubbles ?? false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  stopPropagation() {
    this.propagationStopped = true;
  }

  get propagationCancelled() {
    return this.propagationStopped;
  }
}

class FakeNode {
  parentNode: FakeNode | null = null;
  childNodes: FakeNode[] = [];
  ownerDocument: FakeDocument | null = null;
  nodeType = 0;
  nodeName = "";
  private listeners = new Map<string, Array<(event: FakeEvent) => void>>();

  appendChild(child: FakeNode) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    this.childNodes.push(child);
    return child;
  }

  insertBefore(child: FakeNode, before: FakeNode | null) {
    if (before == null) return this.appendChild(child);
    if (child.parentNode) child.parentNode.removeChild(child);
    const index = this.childNodes.indexOf(before);
    if (index === -1) return this.appendChild(child);
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    this.childNodes.splice(index, 0, child);
    return child;
  }

  removeChild(child: FakeNode) {
    const index = this.childNodes.indexOf(child);
    if (index >= 0) {
      this.childNodes.splice(index, 1);
      child.parentNode = null;
    }
    return child;
  }

  addEventListener(type: string, listener: (event: FakeEvent) => void) {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  removeEventListener(type: string, listener: (event: FakeEvent) => void) {
    const existing = this.listeners.get(type) ?? [];
    this.listeners.set(type, existing.filter((entry) => entry !== listener));
  }

  dispatchEvent(event: FakeEvent) {
    if (!event.target) event.target = this;
    let current: FakeNode | null = this;
    while (current) {
      event.currentTarget = current;
      const listeners = current.listeners.get(event.type) ?? [];
      for (const listener of listeners) {
        listener(event);
        if (event.propagationCancelled) return !event.defaultPrevented;
      }
      current = event.bubbles ? current.parentNode : null;
    }
    return !event.defaultPrevented;
  }

  get textContent(): string {
    return this.childNodes.map((child) => child.textContent).join("");
  }

  set textContent(value: string) {
    this.childNodes = [];
    if (value) this.appendChild(this.ownerDocument!.createTextNode(value));
  }

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] ?? null;
  }

  contains(node: FakeNode | null): boolean {
    if (!node) return false;
    if (node === this) return true;
    return this.childNodes.some((child) => child.contains(node));
  }
}

class FakeTextNode extends FakeNode {
  data: string;

  constructor(ownerDocument: FakeDocument, data: string) {
    super();
    this.ownerDocument = ownerDocument;
    this.data = data;
    this.nodeType = 3;
    this.nodeName = "#text";
  }

  get textContent() {
    return this.data;
  }

  set textContent(value: string) {
    this.data = value;
  }

  get nodeValue() {
    return this.data;
  }

  set nodeValue(value: string | null) {
    this.data = value ?? "";
  }
}

class FakeCommentNode extends FakeNode {
  data: string;

  constructor(ownerDocument: FakeDocument, data: string) {
    super();
    this.ownerDocument = ownerDocument;
    this.data = data;
    this.nodeType = 8;
    this.nodeName = "#comment";
  }

  get textContent() {
    return "";
  }

  set textContent(_value: string) {}

  get nodeValue() {
    return this.data;
  }

  set nodeValue(value: string | null) {
    this.data = value ?? "";
  }
}

class FakeElement extends FakeNode {
  tagName: string;
  localName: string;
  namespaceURI = "http://www.w3.org/1999/xhtml";
  style: Record<string, string> = {};
  attributes = new Map<string, string>();
  value = "";
  className = "";
  id = "";
  disabled = false;

  constructor(ownerDocument: FakeDocument, tagName: string) {
    super();
    this.ownerDocument = ownerDocument;
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.localName = tagName.toLowerCase();
    this.nodeName = this.tagName;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "class" || name === "className") this.className = value;
    if (name === "id") this.id = value;
    if (name === "value") this.value = value;
  }

  getAttribute(name: string) {
    if (name === "class") return this.className || null;
    if (name === "id") return this.id || null;
    if (name === "value") return this.value || null;
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
    if (name === "class" || name === "className") this.className = "";
    if (name === "id") this.id = "";
    if (name === "value") this.value = "";
  }
}

class FakeDocument extends FakeNode {
  documentElement: FakeElement;
  body: FakeElement;
  defaultView: any;
  activeElement: FakeElement | null = null;

  constructor() {
    super();
    this.ownerDocument = this;
    this.nodeType = 9;
    this.nodeName = "#document";
    this.documentElement = new FakeElement(this, "html");
    this.body = new FakeElement(this, "body");
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }

  createElement(tagName: string) {
    return new FakeElement(this, tagName);
  }

  createElementNS(_namespace: string, tagName: string) {
    return this.createElement(tagName);
  }

  createTextNode(data: string) {
    return new FakeTextNode(this, data);
  }

  createComment(data: string) {
    return new FakeCommentNode(this, data);
  }

  createEvent(type: string) {
    return new FakeEvent(type);
  }
}

type RenderHandle = {
  container: FakeElement;
  root: Root;
  rerender: (ui: React.ReactElement) => Promise<void>;
};

const baseWeek = (): WorkoutWeekDay[] => [
  { name: "Mon", exercises: [{ id: 1, name: "Jumping Jacks", tag: "Warmup", sets: "3 x 20", duration: "5 min", advanced: "" }] },
  { name: "Tue", exercises: [] },
  { name: "Wed", exercises: [] },
  { name: "Thu", exercises: [] },
  { name: "Fri", exercises: [] },
  { name: "Sat", exercises: [] },
  { name: "Sun", exercises: [] },
];

let previousGlobals: Record<string, unknown> = {};
let previousDescriptors: Record<string, PropertyDescriptor | undefined> = {};

function setGlobal(key: string, value: unknown) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
}

function installFakeDom() {
  const document = new FakeDocument();
  const windowObject = {
    document,
    navigator: { userAgent: "fake-dom" },
    Element: FakeElement,
    HTMLElement: FakeElement,
    HTMLIFrameElement: FakeElement,
    HTMLInputElement: FakeElement,
    HTMLTextAreaElement: FakeElement,
    SVGElement: FakeElement,
    Node: FakeNode,
    Text: FakeTextNode,
    Document: FakeDocument,
    Event: FakeEvent,
    MouseEvent: FakeEvent,
    requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle: number) => clearTimeout(handle),
    getSelection: () => null,
  };

  document.defaultView = windowObject;
  document.activeElement = document.body;
  (document as any).hasFocus = () => true;
  previousGlobals = {
    window: (globalThis as any).window,
    document: (globalThis as any).document,
    navigator: (globalThis as any).navigator,
    Element: (globalThis as any).Element,
    HTMLElement: (globalThis as any).HTMLElement,
    HTMLIFrameElement: (globalThis as any).HTMLIFrameElement,
    HTMLInputElement: (globalThis as any).HTMLInputElement,
    HTMLTextAreaElement: (globalThis as any).HTMLTextAreaElement,
    SVGElement: (globalThis as any).SVGElement,
    Node: (globalThis as any).Node,
    Text: (globalThis as any).Text,
    Document: (globalThis as any).Document,
    Event: (globalThis as any).Event,
    MouseEvent: (globalThis as any).MouseEvent,
    IS_REACT_ACT_ENVIRONMENT: (globalThis as any).IS_REACT_ACT_ENVIRONMENT,
  };
  previousDescriptors = {
    window: Object.getOwnPropertyDescriptor(globalThis, "window"),
    document: Object.getOwnPropertyDescriptor(globalThis, "document"),
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    Element: Object.getOwnPropertyDescriptor(globalThis, "Element"),
    HTMLElement: Object.getOwnPropertyDescriptor(globalThis, "HTMLElement"),
    HTMLIFrameElement: Object.getOwnPropertyDescriptor(globalThis, "HTMLIFrameElement"),
    HTMLInputElement: Object.getOwnPropertyDescriptor(globalThis, "HTMLInputElement"),
    HTMLTextAreaElement: Object.getOwnPropertyDescriptor(globalThis, "HTMLTextAreaElement"),
    SVGElement: Object.getOwnPropertyDescriptor(globalThis, "SVGElement"),
    Node: Object.getOwnPropertyDescriptor(globalThis, "Node"),
    Text: Object.getOwnPropertyDescriptor(globalThis, "Text"),
    Document: Object.getOwnPropertyDescriptor(globalThis, "Document"),
    Event: Object.getOwnPropertyDescriptor(globalThis, "Event"),
    MouseEvent: Object.getOwnPropertyDescriptor(globalThis, "MouseEvent"),
    IS_REACT_ACT_ENVIRONMENT: Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT"),
  };

  setGlobal("window", windowObject);
  setGlobal("document", document);
  setGlobal("navigator", windowObject.navigator);
  setGlobal("Element", FakeElement);
  setGlobal("HTMLElement", FakeElement);
  setGlobal("HTMLIFrameElement", FakeElement);
  setGlobal("HTMLInputElement", FakeElement);
  setGlobal("HTMLTextAreaElement", FakeElement);
  setGlobal("SVGElement", FakeElement);
  setGlobal("Node", FakeNode);
  setGlobal("Text", FakeTextNode);
  setGlobal("Document", FakeDocument);
  setGlobal("Event", FakeEvent);
  setGlobal("MouseEvent", FakeEvent);
  setGlobal("IS_REACT_ACT_ENVIRONMENT", true);
}

function restoreFakeDom() {
  for (const [key, descriptor] of Object.entries(previousDescriptors)) {
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      delete (globalThis as any)[key];
    }
  }
  for (const [key, value] of Object.entries(previousGlobals)) {
    if (value !== undefined) {
      setGlobal(key, value);
    } else if (!previousDescriptors[key]) {
      delete (globalThis as any)[key];
    }
  }
  previousDescriptors = {};
  previousGlobals = {};
}

async function render(ui: React.ReactElement): Promise<RenderHandle> {
  const container = document.createElement("div") as unknown as FakeElement;
  (document.body as any).appendChild(container);
  const root = createRoot(container as unknown as Element);
  await act(async () => {
    root.render(ui);
  });

  return {
    container,
    root,
    rerender: async (nextUi: React.ReactElement) => {
      await act(async () => {
        root.render(nextUi);
      });
    },
  };
}

function walk(node: FakeNode, visit: (node: FakeNode) => boolean | void): FakeNode | null {
  const shouldStop = visit(node);
  if (shouldStop) return node;
  for (const child of node.childNodes) {
    const found = walk(child, visit);
    if (found) return found;
  }
  return null;
}

function findElementByTagAndText(container: FakeElement, tagName: string, text: string) {
  return walk(container, (node) => {
    return node instanceof FakeElement &&
      node.tagName === tagName.toUpperCase() &&
      node.textContent.includes(text);
  }) as FakeElement | null;
}

function findHeading(container: FakeElement, text: string) {
  return findElementByTagAndText(container, "h3", text);
}

async function click(element: FakeElement | null) {
  expect(element).not.toBeNull();
  await act(async () => {
    const ownKeys = Object.getOwnPropertyNames(element as object);
    const reactPropsKey = ownKeys.find((key) => key.startsWith("__reactProps"));
    const reactClick = reactPropsKey ? (element as any)[reactPropsKey]?.onClick : null;
    if (typeof reactClick === "function") {
      reactClick({ preventDefault() {}, stopPropagation() {} });
      return;
    }
    if (!reactPropsKey) {
      throw new Error(`Missing react props on button: ${ownKeys.join(",")}`);
    }
    element!.dispatchEvent(new FakeEvent("click", { bubbles: true }));
  });
}

describe("WorkoutPlannerTab", () => {
  beforeEach(() => {
    installFakeDom();
  });

  afterEach(() => {
    restoreFakeDom();
  });

  it("changes the selected day header when a week-strip day is clicked", async () => {
    const view = await render(
      <WorkoutPlannerTab
        clientId="client_1"
        initialWeek={baseWeek()}
        onWeekChange={vi.fn()}
        pushToast={vi.fn()}
      />,
    );

    expect(findHeading(view.container, "Mon")).not.toBeNull();
    await click(findElementByTagAndText(view.container, "button", "Tue"));
    expect(findHeading(view.container, "Tue")).not.toBeNull();
  });

  it("synchronizes local week state when initialWeek changes", async () => {
    const onWeekChange = vi.fn();
    const pushToast = vi.fn();
    const firstWeek = baseWeek();
    const nextWeek = [
      { ...firstWeek[0], exercises: [] },
      { ...firstWeek[1], exercises: [{ id: 2, name: "Rows", tag: "Back", sets: "4 x 10", duration: "12 min", advanced: "" }] },
      ...firstWeek.slice(2),
    ];

    const view = await render(
      <WorkoutPlannerTab
        clientId="client_1"
        initialWeek={firstWeek}
        onWeekChange={onWeekChange}
        pushToast={pushToast}
      />,
    );

    await click(findElementByTagAndText(view.container, "button", "Tue"));
    expect(view.container.textContent).toContain("No exercises planned for Tue yet.");

    await view.rerender(
      <WorkoutPlannerTab
        clientId="client_1"
        initialWeek={nextWeek}
        onWeekChange={onWeekChange}
        pushToast={pushToast}
      />,
    );

    expect(view.container.textContent).toContain("1 exercises planned for Tue.");
  });

  it("inserts a library exercise into the selected day", () => {
    const next = insertExerciseAt(baseWeek(), "Mon", {
      id: 99,
      name: "Goblet Squat",
      tag: "Legs",
      sets: "3 x 10",
      duration: "8 min",
      advanced: "",
    }, 0);

    expect(next[0].exercises[0].name).toBe("Goblet Squat");
    expect(next[0].exercises).toHaveLength(2);
  });

  it("reorders exercises within a day", () => {
    const seeded = [
      {
        ...baseWeek()[0],
        exercises: [
          { id: 1, name: "A", tag: "Legs", sets: "3", duration: "5 min", advanced: "" },
          { id: 2, name: "B", tag: "Back", sets: "3", duration: "5 min", advanced: "" },
        ],
      },
      ...baseWeek().slice(1),
    ];

    const next = reorderExercises(seeded, "Mon", 0, 1);
    expect(next[0].exercises.map((item) => item.name)).toEqual(["B", "A"]);
  });

  it("summarizes sets and duration", () => {
    const summary = summarizeWorkout([
      { id: 1, name: "Bench", tag: "Chest", sets: "4 x 8", duration: "10 min", advanced: "" },
      { id: 2, name: "Row", tag: "Back", sets: "3 x 10", duration: "8 min", advanced: "" },
    ]);

    expect(summary.totalSets).toBe(7);
    expect(summary.estDuration).toBe(18);
  });

  it("normalizes second-based durations instead of summing raw numbers", () => {
    const summary = summarizeWorkout([
      { id: 1, name: "Jumping Jacks", tag: "Metabolic / Plyometric", sets: "3 Sets of 50", duration: "60 Seconds", advanced: "" },
      { id: 2, name: "High Knees", tag: "Agility / Power", sets: "Per Set: 30", duration: "45 Seconds", advanced: "Ankle Weights 1kg" },
      { id: 3, name: "Butt Kicks", tag: "Metabolic / Warmup", sets: "Fixed: 40", duration: "30 Seconds", advanced: "" },
    ]);

    expect(summary.totalSets).toBe(3);
    expect(summary.estDuration).toBe(5);
  });

  it("returns placeholder insight when workout is empty", () => {
    expect(buildWorkoutInsights([])).toEqual(["Add exercises to generate AI insights."]);
  });

  it("falls back to local generated exercises when the workout API fails", async () => {
    const exercises = await generateWorkoutDay(
      {
        clientId: "client_1",
        day: "Mon",
        focus: "Full Body",
        duration: 45,
      },
      async () => {
        throw new Error("offline");
      },
    );

    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises[0].id).toBe(1);
  });

  it("replaces an exercise with a smart-swap alternative", () => {
    const next = replaceExerciseById(baseWeek(), "Mon", 1, {
      id: 7,
      name: "Reverse Lunge",
      tag: "Legs",
      sets: "3 x 10",
      duration: "8 min",
      advanced: "",
    });

    expect(next[0].exercises[0].name).toBe("Reverse Lunge");
  });

  it("updates notes for a specific workout day", () => {
    const next = updateWorkoutDayNotes(baseWeek(), "Tue", "Coach note");
    expect(next[1].notes).toBe("Coach note");
    expect(next[0].notes).toBeUndefined();
  });
});
