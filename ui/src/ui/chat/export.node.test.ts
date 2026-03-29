import { describe, expect, it } from "vitest";
import { buildChatMarkdown } from "./export.ts";

describe("chat export", () => {
  it("returns null for empty history", () => {
    expect(buildChatMarkdown([], "Bot")).toBeNull();
  });

  it("renders markdown headings and strips assistant thinking tags", () => {
    const markdown = buildChatMarkdown(
      [
        {
          role: "assistant",
          content: "<thinking>scratchpad</thinking>Final answer",
          timestamp: Date.UTC(2026, 2, 11, 12, 0, 0),
        },
      ],
      "Bot",
    );

    expect(markdown).toContain("# Chat with Bot");
    expect(markdown).toContain("## Bot (2026-03-11T12:00:00.000Z)");
    expect(markdown).toContain("Final answer");
    expect(markdown).not.toContain("scratchpad");
  });

  it("uses custom user sender label in markdown", () => {
    const markdown = buildChatMarkdown(
      [{ role: "user", content: "hi", timestamp: Date.UTC(2026, 2, 11, 12, 0, 0) }],
      "Bot",
      "绳匠",
    );
    expect(markdown).toContain("## 绳匠 (2026-03-11T12:00:00.000Z)");
    expect(markdown).not.toContain("## You ");
  });
});
