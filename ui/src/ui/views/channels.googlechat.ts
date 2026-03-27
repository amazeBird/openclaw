import { html, nothing } from "lit";
import { t } from "../../i18n/index.ts";
import { formatRelativeTimestamp } from "../format.ts";
import type { GoogleChatStatus } from "../types.ts";
import { renderChannelConfigSection } from "./channels.config.ts";
import {
  formatNullableBoolean,
  renderSingleAccountChannelCard,
  resolveChannelConfigured,
} from "./channels.shared.ts";
import type { ChannelsProps } from "./channels.types.ts";

export function renderGoogleChatCard(params: {
  props: ChannelsProps;
  googleChat?: GoogleChatStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, googleChat, accountCountLabel } = params;
  const configured = resolveChannelConfigured("googlechat", props);

  return renderSingleAccountChannelCard({
    title: t("channels.googlechat.title"),
    subtitle: t("channels.googlechat.sub"),
    accountCountLabel,
    statusRows: [
      { label: t("channels.common.configured"), value: formatNullableBoolean(configured) },
      {
        label: t("channels.common.running"),
        value: googleChat
          ? googleChat.running
            ? t("channels.common.yes")
            : t("channels.common.no")
          : t("channels.common.nA"),
      },
      {
        label: t("channels.common.credential"),
        value: googleChat?.credentialSource ?? t("channels.common.nA"),
      },
      {
        label: t("channels.common.audience"),
        value: googleChat?.audienceType
          ? `${googleChat.audienceType}${googleChat.audience ? ` · ${googleChat.audience}` : ""}`
          : t("channels.common.nA"),
      },
      {
        label: t("channels.common.lastStart"),
        value: googleChat?.lastStartAt
          ? formatRelativeTimestamp(googleChat.lastStartAt)
          : t("channels.common.nA"),
      },
      {
        label: t("channels.common.lastProbe"),
        value: googleChat?.lastProbeAt
          ? formatRelativeTimestamp(googleChat.lastProbeAt)
          : t("channels.common.nA"),
      },
    ],
    lastError: googleChat?.lastError,
    secondaryCallout: googleChat?.probe
      ? html`<div class="callout" style="margin-top: 12px;">
          ${t("channels.common.probe")} ${googleChat.probe.ok ? t("channels.common.probeOk") : t("channels.common.probeFailed")} ·
          ${googleChat.probe.status ?? ""} ${googleChat.probe.error ?? ""}
        </div>`
      : nothing,
    configSection: renderChannelConfigSection({ channelId: "googlechat", props }),
    footer: html`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${() => props.onRefresh(true)}>
        ${t("channels.common.probe")}
      </button>
    </div>`,
  });
}
