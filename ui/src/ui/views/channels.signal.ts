import { html, nothing } from "lit";
import { t } from "../../i18n/index.ts";
import { formatRelativeTimestamp } from "../format.ts";
import type { SignalStatus } from "../types.ts";
import { renderChannelConfigSection } from "./channels.config.ts";
import {
  formatNullableBoolean,
  renderSingleAccountChannelCard,
  resolveChannelConfigured,
} from "./channels.shared.ts";
import type { ChannelsProps } from "./channels.types.ts";

export function renderSignalCard(params: {
  props: ChannelsProps;
  signal?: SignalStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, signal, accountCountLabel } = params;
  const configured = resolveChannelConfigured("signal", props);

  return renderSingleAccountChannelCard({
    title: t("channels.signal.title"),
    subtitle: t("channels.signal.sub"),
    accountCountLabel,
    statusRows: [
      { label: t("channels.common.configured"), value: formatNullableBoolean(configured) },
      {
        label: t("channels.common.running"),
        value: signal?.running ? t("channels.common.yes") : t("channels.common.no"),
      },
      { label: t("channels.common.baseUrl"), value: signal?.baseUrl ?? t("channels.common.nA") },
      {
        label: t("channels.common.lastStart"),
        value: signal?.lastStartAt
          ? formatRelativeTimestamp(signal.lastStartAt)
          : t("channels.common.nA"),
      },
      {
        label: t("channels.common.lastProbe"),
        value: signal?.lastProbeAt
          ? formatRelativeTimestamp(signal.lastProbeAt)
          : t("channels.common.nA"),
      },
    ],
    lastError: signal?.lastError,
    secondaryCallout: signal?.probe
      ? html`<div class="callout" style="margin-top: 12px;">
          ${t("channels.common.probe")} ${signal.probe.ok ? t("channels.common.probeOk") : t("channels.common.probeFailed")} ·
          ${signal.probe.status ?? ""} ${signal.probe.error ?? ""}
        </div>`
      : nothing,
    configSection: renderChannelConfigSection({ channelId: "signal", props }),
    footer: html`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${() => props.onRefresh(true)}>
        ${t("channels.common.probe")}
      </button>
    </div>`,
  });
}
