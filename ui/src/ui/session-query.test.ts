import { describe, expect, it } from "vitest";
import { normalizeControlUiSessionKey } from "./session-query.ts";

describe("normalizeControlUiSessionKey", () => {
  it("fixes semicolon typo between agent scope segments", () => {
    expect(normalizeControlUiSessionKey("agent:main;main")).toBe("agent:main:main");
    expect(normalizeControlUiSessionKey("  agent:DEV;main  ")).toBe("agent:DEV:main");
  });

  it("leaves valid keys unchanged", () => {
    expect(normalizeControlUiSessionKey("agent:main:main")).toBe("agent:main:main");
    expect(normalizeControlUiSessionKey("main")).toBe("main");
  });
});
