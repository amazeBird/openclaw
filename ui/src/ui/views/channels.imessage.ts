import { html, nothing } from "lit";
import { t } from "../../i18n/index.ts";
import { formatRelativeTimestamp } from "../format.ts";
import type { IMessageStatus } from "../types.ts";
import { renderChannelConfigSection } from "./channels.config.ts";
import {
  formatNullableBoolean,
  renderSingleAccountChannelCard,
  resolveChannelConfigured,
} from "./channels.shared.ts";
import type { ChannelsProps } from "./channels.types.ts";

export function renderIMessageCard(params: {
  props: ChannelsProps;
  imessage?: IMessageStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, imessage, accountCountLabel } = params;
  const configured = resolveChannelConfigured("imessage", props);

  return renderSingleAccountChannelCard({
    title: t("channels.imessage.title"),
    subtitle: t("channels.imessage.sub"),
    accountCountLabel,
    statusRows: [
      { label: t("channels.common.configured"), value: formatNullableBoolean(configured) },
      {
        label: t("channels.common.running"),
        value: imessage?.running ? t("channels.common.yes") : t("channels.common.no"),
      },
      {
        label: t("channels.common.lastStart"),
        value: imessage?.lastStartAt
          ? formatRelativeTimestamp(imessage.lastStartAt)
          : t("channels.common.nA"),
      },
      {
        label: t("channels.common.lastProbe"),
        value: imessage?.lastProbeAt
          ? formatRelativeTimestamp(imessage.lastProbeAt)
          : t("channels.common.nA"),
      },
    ],
    lastError: imessage?.lastError,
    secondaryCallout: imessage?.probe
      ? html`<div class="callout" style="margin-top: 12px;">
          ${t("channels.common.probe")} ${imessage.probe.ok ? t("channels.common.probeOk") : t("channels.common.probeFailed")} ·
          ${imessage.probe.error ?? ""}
        </div>`
      : nothing,
    configSection: renderChannelConfigSection({ channelId: "imessage", props }),
    footer: html`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${() => props.onRefresh(true)}>
        ${t("channels.common.probe")}
      </button>
    </div>`,
  });
}
