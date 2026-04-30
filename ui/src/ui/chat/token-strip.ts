import { html, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { t } from "../../i18n/index.ts";
import type { GatewaySessionRow } from "../types.ts";
import { formatTokensCompact } from "./context-notice.ts";

/** Sum of input+output on the latest assistant message that carries usage (one turn). */
function getLastTurnTokenDelta(messages: unknown[]): number | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i] as Record<string, unknown>;
    const role = typeof m.role === "string" ? m.role : "";
    if (role.toLowerCase() !== "assistant") {
      continue;
    }
    const usage = m.usage as Record<string, number> | undefined;
    if (!usage) {
      continue;
    }
    const input = Number(usage.input ?? usage.inputTokens ?? 0) || 0;
    const output = Number(usage.output ?? usage.outputTokens ?? 0) || 0;
    const sum = input + output;
    if (sum > 0) {
      return sum;
    }
  }
  return null;
}

export function renderChatTokenStrip(
  activeSession: GatewaySessionRow | undefined,
  defaultContextTokens: number | null,
  messages: unknown[],
  connected: boolean,
  sessionsLoaded: boolean,
): TemplateResult | typeof nothing {
  if (!connected || !sessionsLoaded) {
    return nothing;
  }

  const fresh = activeSession?.totalTokensFresh !== false;
  const limit = activeSession?.contextTokens ?? defaultContextTokens ?? null;
  const inputTok = activeSession?.inputTokens ?? 0;
  const outputTok = activeSession?.outputTokens ?? 0;
  const totalTok =
    typeof activeSession?.totalTokens === "number"
      ? activeSession.totalTokens
      : inputTok + outputTok;
  const lastTurn = getLastTurnTokenDelta(messages);

  const stale = Boolean(activeSession) && !fresh;
  const displayIn = stale ? "—" : formatTokensCompact(inputTok);
  const displayOut = stale ? "—" : formatTokensCompact(outputTok);
  const displayTotal = stale ? "—" : formatTokensCompact(totalTok);

  const effectiveUsed = stale ? 0 : totalTok;
  const barPct =
    limit && limit > 0 && effectiveUsed > 0 ? Math.min(100, (effectiveUsed / limit) * 100) : 0;
  const contextPctRounded =
    limit && limit > 0 && effectiveUsed > 0
      ? Math.min(100, Math.round((effectiveUsed / limit) * 100))
      : null;

  const metaParts: string[] = [];
  if (stale) {
    metaParts.push(t("chat.tokenStrip.stale"));
  }
  if (contextPctRounded !== null) {
    metaParts.push(t("chat.tokenStrip.contextShort", { pct: String(contextPctRounded) }));
  }
  if (lastTurn !== null && lastTurn > 0) {
    metaParts.push(t("chat.tokenStrip.lastShort", { tokens: formatTokensCompact(lastTurn) }));
  }
  const metaText = metaParts.length > 0 ? metaParts.join(` ${t("chat.tokenStrip.metaSep")} `) : "—";

  const titleBits: string[] = [];
  if (!stale) {
    titleBits.push(
      `${t("chat.tokenStrip.titleIn")} ${inputTok.toLocaleString()} · ${t("chat.tokenStrip.titleOut")} ${outputTok.toLocaleString()} · ${t("chat.tokenStrip.titleTotal")} ${totalTok.toLocaleString()}`,
    );
  }
  if (limit && limit > 0) {
    titleBits.push(
      t("chat.tokenStrip.titleLimit", {
        limit: limit.toLocaleString(),
        pct: String(contextPctRounded ?? 0),
      }),
    );
  }
  if (lastTurn !== null && lastTurn > 0) {
    titleBits.push(t("chat.tokenStrip.titleLast", { tokens: lastTurn.toLocaleString() }));
  }
  const titleAttr =
    titleBits.length > 0 ? titleBits.join(` ${t("chat.tokenStrip.metaSep")} `) : undefined;

  const ariaDetail = metaText === "—" ? t("chat.tokenStrip.ariaNoDetail") : metaText;
  const ariaLabel = t("chat.tokenStrip.aria", {
    total: displayTotal,
    input: displayIn,
    output: displayOut,
    detail: ariaDetail,
  });

  return html`
    <div
      class="chat-token-strip"
      role="status"
      title=${ifDefined(titleAttr)}
      aria-label=${ariaLabel}
    >
      <span class="chat-token-strip__label">${t("chat.tokenStrip.label")}</span>
      <span class="chat-token-strip__nums">
        ${t("chat.tokenStrip.in")} <strong>${displayIn}</strong> · ${t("chat.tokenStrip.out")}
        <strong>${displayOut}</strong> · ${t("chat.tokenStrip.total")} <strong>${displayTotal}</strong>
      </span>
      ${
        limit && limit > 0
          ? html`
              <span class="chat-token-strip__bar" aria-hidden="true">
                <span style="width:${barPct}%"></span>
              </span>
            `
          : html`
              <span class="chat-token-strip__bar chat-token-strip__bar--placeholder" aria-hidden="true"></span>
            `
      }
      <span class="chat-token-strip__meta">${metaText}</span>
    </div>
  `;
}
