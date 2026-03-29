import { describe, expect, it } from "vitest";
import { isIsolatedHeartbeatSessionKey } from "./session-key-utils.js";

describe("isIsolatedHeartbeatSessionKey", () => {
  it("detects isolated heartbeat suffix", () => {
    expect(isIsolatedHeartbeatSessionKey("agent:main:main:heartbeat")).toBe(true);
    expect(isIsolatedHeartbeatSessionKey("AGENT:DEV:MAIN:HEARTBEAT")).toBe(true);
  });

  it("returns false for main and unrelated keys", () => {
    expect(isIsolatedHeartbeatSessionKey("main")).toBe(false);
    expect(isIsolatedHeartbeatSessionKey("agent:main:main")).toBe(false);
    expect(isIsolatedHeartbeatSessionKey("agent:main:cron:job-1")).toBe(false);
    expect(isIsolatedHeartbeatSessionKey("")).toBe(false);
  });
});
