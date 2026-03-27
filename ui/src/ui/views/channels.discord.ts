import { html, nothing } from "lit";
import { t } from "../../i18n/index.ts";
import { formatRelativeTimestamp } from "../format.ts";
import type { DiscordStatus } from "../types.ts";
import { renderChannelConfigSection } from "./channels.config.ts";
import {
  formatNullableBoolean,
  renderSingleAccountChannelCard,
  resolveChannelConfigured,
} from "./channels.shared.ts";
import type { ChannelsProps } from "./channels.types.ts";

export function renderDiscordCard(params: {
  props: ChannelsProps;
  discord?: DiscordStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, discord, accountCountLabel } = params;
  const configured = resolveChannelConfigured("discord", props);

  return renderSingleAccountChannelCard({
    title: t("channels.discord.title"),
    subtitle: t("channels.discord.sub"),
    accountCountLabel,
    statusRows: [
      { label: t("channels.common.configured"), value: formatNullableBoolean(configured) },
      {
        label: t("channels.common.running"),
        value: discord?.running ? t("channels.common.yes") : t("channels.common.no"),
      },
      {
        label: t("channels.common.lastStart"),
        value: discord?.lastStartAt
          ? formatRelativeTimestamp(discord.lastStartAt)
          : t("channels.common.nA"),
      },
      {
        label: t("channels.common.lastProbe"),
        value: discord?.lastProbeAt
          ? formatRelativeTimestamp(discord.lastProbeAt)
          : t("channels.common.nA"),
      },
    ],
    lastError: discord?.lastError,
    secondaryCallout: discord?.probe
      ? html`<div class="callout" style="margin-top: 12px;">
          ${t("channels.common.probe")} ${discord.probe.ok ? t("channels.common.probeOk") : t("channels.common.probeFailed")} ·
          ${discord.probe.status ?? ""} ${discord.probe.error ?? ""}
        </div>`
      : nothing,
    configSection: renderChannelConfigSection({ channelId: "discord", props }),
    footer: html`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${() => props.onRefresh(true)}>
        ${t("channels.common.probe")}
      </button>
    </div>`,
  });
}
