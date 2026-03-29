import { describe, expect, it } from "vitest";
import {
  agentLogoUrl,
  defaultAssistantPortraitUrl,
  defaultToolPortraitUrl,
  defaultUserPortraitUrl,
  isBundledGatewayAgentAvatarUrl,
  resolveChatAssistantAvatarUrl,
  resolveConfiguredCronModelSuggestions,
  resolveAgentAvatarUrl,
  resolveEffectiveModelFallbacks,
  sortLocaleStrings,
} from "./agents-utils.ts";

describe("resolveEffectiveModelFallbacks", () => {
  it("inherits defaults when no entry fallbacks are configured", () => {
    const entryModel = undefined;
    const defaultModel = {
      primary: "openai/gpt-5-nano",
      fallbacks: ["google/gemini-2.0-flash"],
    };

    expect(resolveEffectiveModelFallbacks(entryModel, defaultModel)).toEqual([
      "google/gemini-2.0-flash",
    ]);
  });

  it("prefers entry fallbacks over defaults", () => {
    const entryModel = {
      primary: "openai/gpt-5-mini",
      fallbacks: ["openai/gpt-5-nano"],
    };
    const defaultModel = {
      primary: "openai/gpt-5",
      fallbacks: ["google/gemini-2.0-flash"],
    };

    expect(resolveEffectiveModelFallbacks(entryModel, defaultModel)).toEqual(["openai/gpt-5-nano"]);
  });

  it("keeps explicit empty entry fallback lists", () => {
    const entryModel = {
      primary: "openai/gpt-5-mini",
      fallbacks: [],
    };
    const defaultModel = {
      primary: "openai/gpt-5",
      fallbacks: ["google/gemini-2.0-flash"],
    };

    expect(resolveEffectiveModelFallbacks(entryModel, defaultModel)).toEqual([]);
  });
});

describe("resolveConfiguredCronModelSuggestions", () => {
  it("collects defaults primary/fallbacks, alias map keys, and per-agent model entries", () => {
    const result = resolveConfiguredCronModelSuggestions({
      agents: {
        defaults: {
          model: {
            primary: "openai/gpt-5.2",
            fallbacks: ["google/gemini-2.5-pro", "openai/gpt-5.2-mini"],
          },
          models: {
            "anthropic/claude-sonnet-4-5": { alias: "smart" },
            "openai/gpt-5.2": { alias: "main" },
          },
        },
        list: {
          writer: {
            model: { primary: "xai/grok-4", fallbacks: ["openai/gpt-5.2-mini"] },
          },
          planner: {
            model: "google/gemini-2.5-flash",
          },
        },
      },
    });

    expect(result).toEqual([
      "anthropic/claude-sonnet-4-5",
      "google/gemini-2.5-flash",
      "google/gemini-2.5-pro",
      "openai/gpt-5.2",
      "openai/gpt-5.2-mini",
      "xai/grok-4",
    ]);
  });

  it("returns empty array for invalid or missing config shape", () => {
    expect(resolveConfiguredCronModelSuggestions(null)).toEqual([]);
    expect(resolveConfiguredCronModelSuggestions({})).toEqual([]);
    expect(resolveConfiguredCronModelSuggestions({ agents: { defaults: { model: "" } } })).toEqual(
      [],
    );
  });
});

describe("sortLocaleStrings", () => {
  it("sorts values using localeCompare without relying on Array.prototype.toSorted", () => {
    expect(sortLocaleStrings(["z", "b", "a"])).toEqual(["a", "b", "z"]);
  });

  it("accepts any iterable input, including sets", () => {
    expect(sortLocaleStrings(new Set(["beta", "alpha"]))).toEqual(["alpha", "beta"]);
  });
});

describe("agentLogoUrl", () => {
  it("keeps base-mounted control UI logo paths absolute to the mount", () => {
    expect(agentLogoUrl("/ui")).toBe("/ui/zzz-brand-logo.png");
    expect(agentLogoUrl("/apps/openclaw/")).toBe("/apps/openclaw/zzz-brand-logo.png");
  });

  it("uses a route-relative fallback before basePath bootstrap finishes", () => {
    expect(agentLogoUrl("")).toBe("zzz-brand-logo.png");
  });
});

describe("defaultAssistantPortraitUrl", () => {
  it("mirrors base path rules for the default assistant portrait asset", () => {
    expect(defaultAssistantPortraitUrl("/ui")).toBe("/ui/fariy-assistant.jpg");
    expect(defaultAssistantPortraitUrl("/apps/openclaw/")).toBe(
      "/apps/openclaw/fariy-assistant.jpg",
    );
    expect(defaultAssistantPortraitUrl("")).toBe("fariy-assistant.jpg");
  });
});

describe("defaultUserPortraitUrl", () => {
  it("mirrors base path rules for the default user portrait asset", () => {
    expect(defaultUserPortraitUrl("/ui")).toBe("/ui/zzz-proxy-avatar.png");
    expect(defaultUserPortraitUrl("")).toBe("zzz-proxy-avatar.png");
  });
});

describe("defaultToolPortraitUrl", () => {
  it("mirrors base path rules for the default tool portrait asset", () => {
    expect(defaultToolPortraitUrl("/ui")).toBe("/ui/ze-assistant.jpg");
    expect(defaultToolPortraitUrl("/apps/openclaw/")).toBe("/apps/openclaw/ze-assistant.jpg");
    expect(defaultToolPortraitUrl("")).toBe("ze-assistant.jpg");
  });
});

describe("isBundledGatewayAgentAvatarUrl", () => {
  it("detects control-UI /avatar/<id> routes with or without mount prefix", () => {
    expect(isBundledGatewayAgentAvatarUrl("/avatar/main", "")).toBe(true);
    expect(isBundledGatewayAgentAvatarUrl("/openclaw/avatar/main", "/openclaw")).toBe(true);
    expect(isBundledGatewayAgentAvatarUrl("/openclaw/avatar/main", "/openclaw/")).toBe(true);
    expect(
      isBundledGatewayAgentAvatarUrl("https://x.example/openclaw/avatar/main", "/openclaw"),
    ).toBe(true);
  });

  it("does not flag arbitrary paths or remote assets", () => {
    expect(isBundledGatewayAgentAvatarUrl("/ui/fariy-assistant.jpg", "/ui")).toBe(false);
    expect(isBundledGatewayAgentAvatarUrl("https://cdn.example/a.png", "")).toBe(false);
    expect(isBundledGatewayAgentAvatarUrl("/avatar/main/extra", "")).toBe(false);
  });
});

describe("resolveChatAssistantAvatarUrl", () => {
  it("falls back to static art when only gateway placeholder URLs are present", () => {
    expect(
      resolveChatAssistantAvatarUrl({
        basePath: "/ui",
        identityAvatar: "/ui/avatar/main",
        gatewayMetaAvatar: "/ui/avatar/main",
      }),
    ).toBe("/ui/fariy-assistant.jpg");
  });

  it("prefers a non-placeholder identity URL", () => {
    expect(
      resolveChatAssistantAvatarUrl({
        basePath: "/ui",
        identityAvatar: "https://example.com/me.png",
        gatewayMetaAvatar: "/ui/avatar/main",
      }),
    ).toBe("https://example.com/me.png");
  });

  it("uses gateway URL when it is not the bundled avatar route", () => {
    expect(
      resolveChatAssistantAvatarUrl({
        basePath: "/ui",
        identityAvatar: null,
        gatewayMetaAvatar: "https://files.example/portrait.jpg",
      }),
    ).toBe("https://files.example/portrait.jpg");
  });
});

describe("resolveAgentAvatarUrl", () => {
  it("prefers a runtime avatar URL over non-URL identity avatars", () => {
    expect(
      resolveAgentAvatarUrl(
        { identity: { avatar: "A", avatarUrl: "/avatar/main" } },
        {
          agentId: "main",
          avatar: "A",
          name: "Main",
        },
      ),
    ).toBe("/avatar/main");
  });

  it("returns null for initials or emoji avatar values without a URL", () => {
    expect(resolveAgentAvatarUrl({ identity: { avatar: "A" } })).toBeNull();
    expect(resolveAgentAvatarUrl({ identity: { avatar: "🦞" } })).toBeNull();
  });
});
