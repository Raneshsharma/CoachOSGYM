import { describe, expect, it } from "vitest";
import {
  deriveClientInitials,
  normalizeClientInitials,
  sanitizeClientAvatarPrefs,
} from "./clientAvatar";

describe("clientAvatar helpers", () => {
  it("derives initials from the client full name by default", () => {
    expect(deriveClientInitials("Ranesh Sharma")).toBe("RS");
    expect(deriveClientInitials("Sophie Patel")).toBe("SP");
  });

  it("prefers a custom initials fallback when provided", () => {
    expect(deriveClientInitials("Ranesh Sharma", "rx")).toBe("RX");
    expect(deriveClientInitials("Ranesh Sharma", "  z  ")).toBe("Z");
  });

  it("normalizes custom initials to compact uppercase text", () => {
    expect(normalizeClientInitials("a b")).toBe("AB");
    expect(normalizeClientInitials("12abc")).toBe("12");
    expect(normalizeClientInitials("")).toBe("");
  });

  it("sanitizes avatar preferences from arbitrary stored input", () => {
    expect(
      sanitizeClientAvatarPrefs({
        imageDataUrl: "data:image/png;base64,xyz",
        initialsOverride: " qa ",
      }),
    ).toEqual({
      imageDataUrl: "data:image/png;base64,xyz",
      initialsOverride: "QA",
    });

    expect(
      sanitizeClientAvatarPrefs({
        imageDataUrl: 123,
        initialsOverride: null,
      }),
    ).toEqual({
      imageDataUrl: null,
      initialsOverride: "",
    });
  });
});
