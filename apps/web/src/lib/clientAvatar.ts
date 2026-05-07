export type ClientAvatarPrefs = {
  imageDataUrl: string | null;
  initialsOverride: string;
};

export function normalizeClientInitials(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 2);
}

export function deriveClientInitials(fullName: string, override?: string | null): string {
  const normalizedOverride = normalizeClientInitials(override ?? "");
  if (normalizedOverride) return normalizedOverride;

  return fullName
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 2);
}

export function sanitizeClientAvatarPrefs(value: unknown): ClientAvatarPrefs {
  const raw = (value && typeof value === "object") ? value as Record<string, unknown> : {};
  return {
    imageDataUrl: typeof raw.imageDataUrl === "string" && raw.imageDataUrl.trim() ? raw.imageDataUrl : null,
    initialsOverride: normalizeClientInitials(typeof raw.initialsOverride === "string" ? raw.initialsOverride : ""),
  };
}
