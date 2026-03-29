import { describe, expect, it } from "vitest";
import { pickWebchatSessionReconciliation } from "./app-render.helpers.ts";

describe("pickWebchatSessionReconciliation", () => {
  const hello = { sessionDefaults: { mainSessionKey: "agent:main:main" } };

  it("prefers non-heartbeat ?session= over stuck heartbeat state", () => {
    expect(
      pickWebchatSessionReconciliation({
        tab: "chat",
        connected: true,
        sessionKey: "agent:main:main:heartbeat",
        urlSessionParam: "agent:main:main",
        helloSnapshot: hello,
      }),
    ).toBe("agent:main:main");
  });

  it("maps isolated heartbeat to gateway main when URL has no session param", () => {
    expect(
      pickWebchatSessionReconciliation({
        tab: "chat",
        connected: true,
        sessionKey: "agent:main:main:heartbeat",
        urlSessionParam: "",
        helloSnapshot: hello,
      }),
    ).toBe("agent:main:main");
  });

  it("does nothing when already on URL session", () => {
    expect(
      pickWebchatSessionReconciliation({
        tab: "chat",
        connected: true,
        sessionKey: "agent:main:main",
        urlSessionParam: "agent:main:main",
        helloSnapshot: hello,
      }),
    ).toBeNull();
  });

  it("skips when not on chat tab", () => {
    expect(
      pickWebchatSessionReconciliation({
        tab: "overview",
        connected: true,
        sessionKey: "agent:main:main:heartbeat",
        urlSessionParam: "agent:main:main",
        helloSnapshot: hello,
      }),
    ).toBeNull();
  });
});
