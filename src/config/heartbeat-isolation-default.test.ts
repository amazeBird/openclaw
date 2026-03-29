import { describe, expect, it } from "vitest";
import { applyHeartbeatIsolationDefault } from "./defaults.js";
import type { OpenClawConfig } from "./types.js";

describe("applyHeartbeatIsolationDefault", () => {
  it("sets isolatedSession true when heartbeat exists but isolatedSession is unset", () => {
    const cfg: OpenClawConfig = {
      agents: {
        defaults: {
          heartbeat: { every: "1h" },
        },
      },
    };
    const next = applyHeartbeatIsolationDefault(cfg);
    expect(next.agents?.defaults?.heartbeat?.isolatedSession).toBe(true);
    expect(next.agents?.defaults?.heartbeat?.every).toBe("1h");
  });

  it("does not override explicit isolatedSession: false", () => {
    const cfg: OpenClawConfig = {
      agents: {
        defaults: {
          heartbeat: { isolatedSession: false },
        },
      },
    };
    const next = applyHeartbeatIsolationDefault(cfg);
    expect(next.agents?.defaults?.heartbeat?.isolatedSession).toBe(false);
  });

  it("no-ops without agents.defaults", () => {
    const cfg: OpenClawConfig = { agents: { list: [{ id: "main" }] } };
    expect(applyHeartbeatIsolationDefault(cfg)).toBe(cfg);
  });
});
