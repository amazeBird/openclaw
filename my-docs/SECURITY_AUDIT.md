# 安全与风险排查记录（S001）

> **任务**: [S001 — 全工程安全漏洞与风险排查及文档化](TASKS.md#s001---全工程安全漏洞与风险排查及文档化)  
> **执行计划**: [PLANS.md — 计划 3](PLANS.md#计划-3-全工程安全漏洞与风险排查)  
> **说明**: 按 Phase 1–7 分阶段填写；每阶段结束后更新本文件。**第 0 节**汇总跨阶段速查信息，后续 Phase 开始前优先阅读，避免重复全盘检索。

| 字段     | 值                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 仓库快照 | `ec2dbcff9a`（2026-03-27，以执行机 `git rev-parse --short HEAD` 为准） |
| 最近更新 | 2026-03-27 — Phase 1–7 已记录（S001 文档闭环）                         |

---

## 0. 后续阶段参考速查（持续更新）

本节记录 **各 Phase 已确认的工程事实** 与 **后续 Phase 建议入口**，新会话或下一阶段审计时从这里开始即可。

### 0.1 工作区与安装模型（供应链上下文）

| 项             | 位置 / 值                                                                                                                                                                                                     | 安全含义（简要）                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace 成员 | [pnpm-workspace.yaml](../pnpm-workspace.yaml)：根包、`ui`、`packages/*`、`extensions/*`                                                                                                                       | 审计通道/插件时除根 `package.json` 外，需抽查 `extensions/<id>/package.json` 与 `packages/*` 的依赖面                                                             |
| 锁文件         | [pnpm-lock.yaml](../pnpm-lock.yaml)                                                                                                                                                                           | 可复现安装；与 `packageManager: pnpm@10.32.1` 对齐                                                                                                                |
| 链接策略       | [.npmrc](../.npmrc)：`node-linker=hoisted`                                                                                                                                                                    | **hoisted** `node_modules` 布局；与默认 isolated 相比解析/去重行为不同，排查「重复版本」时注意以 lockfile 为准                                                    |
| 注册源         | `.npmrc`：`registry=https://registry.npmjs.org/`                                                                                                                                                              | 默认官方源；若 CI/本地改用镜像，审计记录中注明                                                                                                                    |
| 构建脚本白名单 | 根 [package.json](../package.json) → `pnpm.onlyBuiltDependencies` + `ignoredBuiltDependencies`；与 [pnpm-workspace.yaml](../pnpm-workspace.yaml) 中 `onlyBuiltDependencies` / `ignoredBuiltDependencies` 一致 | 限制 **install/postinstall 脚本** 执行范围，降低依赖包生命周期脚本风险；当前允许构建的包含 native/加密相关（如 `esbuild`、`sharp`、`@whiskeysockets/baileys` 等） |
| 发布延迟       | `pnpm.minimumReleaseAge`: **2880** 分钟（48 小时）                                                                                                                                                            | 拉取 npm 新版本前有冷却，略降「刚发布被劫持」窗口；**不替代** `pnpm audit` 与版本钉扎                                                                             |
| 版本覆盖       | `pnpm.overrides` 钉住多项传递依赖（如 `tar`、`qs`、`hono`、`tough-cookie`、`minimatch` 等）                                                                                                                   | 多为历史 CVE/兼容性收敛；变更 overrides 时需回归构建与测试                                                                                                        |
| 补丁包         | 根 `package.json` **未**配置 `pnpm.patchedDependencies`；仓库内未发现 `patches/*.patch`                                                                                                                       | 当前无 pnpm patch 供应链；若日后引入，须按 [AGENTS.md](../AGENTS.md) 使用**精确版本**                                                                             |

### 0.2 按 Phase 的代码入口（减少重复「从哪里看」）

| Phase | 主题           | 建议入口（非穷尽）                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2     | 密钥与敏感数据 | 规范中的路径提示：[CLAUDE.md](../CLAUDE.md) / [AGENTS.md](../AGENTS.md)（`~/.openclaw/credentials/`、`~/.openclaw/sessions/` 等）；代码侧可结合 `rg`/`git grep` 搜 `token`、`secret`、`password`、`apiKey`（注意排除 lockfile 与大规模测试固件）                                                                                                                                                              |
| 3     | 网关与控制面   | 见 **§0.5**；主文件：[server-runtime-config.ts](../src/gateway/server-runtime-config.ts)、[gateway-cli/run.ts](../src/cli/gateway-cli/run.ts)、[auth.ts](../src/gateway/auth.ts)、[call.ts](../src/gateway/call.ts)、[net.ts](../src/gateway/net.ts)、[audit.ts](../src/security/audit.ts)（`collectGatewayConfigFindings`）                                                                                  |
| 4     | 通道与插件     | 见 **§0.6**；核心：[channels/](../src/channels/)、[pairing/](../src/pairing/)、[auto-reply/](../src/auto-reply/)、[plugin-sdk/direct-dm.ts](../src/plugin-sdk/direct-dm.ts)、[security/audit-channel.ts](../src/security/audit-channel.ts)                                                                                                                                                                    |
| 5     | Web UI         | 见 **§0.7**；[ui/src/ui/gateway.ts](../ui/src/ui/gateway.ts)、[storage.ts](../ui/src/ui/storage.ts)、[markdown.ts](../ui/src/ui/markdown.ts)、[grouped-render.ts](../ui/src/ui/chat/grouped-render.ts)、[index.html](../ui/index.html)                                                                                                                                                                        |
| 6     | 移动端         | 见 **§0.8**；[GatewaySettingsStore.swift](../apps/ios/Sources/Gateway/GatewaySettingsStore.swift)、[SecurePrefs.kt](../apps/android/app/src/main/java/ai/openclaw/app/SecurePrefs.kt)、[network_security_config.xml](../apps/android/app/src/main/res/xml/network_security_config.xml)、[Info.plist](../apps/ios/Sources/Info.plist)、[macOS Info.plist](../apps/macos/Sources/OpenClaw/Resources/Info.plist) |
| 7     | CI 与脚本      | 见 **§0.9**；[ci.yml](../.github/workflows/ci.yml)、[.pre-commit-config.yaml](../.pre-commit-config.yaml)、[docs/ci.md](../docs/ci.md)                                                                                                                                                                                                                                                                        |

### 0.4 敏感数据与密钥（Phase 2 已确认，供 Phase 3–5 引用）

| 项                       | 位置 / 行为                                                                                                                                                                                                   | 备注                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 运行时凭证目录（用户机） | 规范见 [CLAUDE.md](../CLAUDE.md)：如 `~/.openclaw/credentials/`、`~/.openclaw/sessions/`                                                                                                                      | 仓库内不应出现真实路径内容；分享日志前需脱敏（[docs/help/debugging.md](../docs/help/debugging.md)）                                                                                        |
| 日志脱敏                 | [src/logging/redact.ts](../src/logging/redact.ts)：`redactSensitiveText`、多类 token 正则（`sk-`、`ghp_`、`Bearer`、PEM、Telegram `bot<token>` 等）；默认模式见配置 `logging.redactSensitive`（默认 `tools`） | Phase 3 可对照「哪些路径仍绕过 redact」                                                                                                                                                    |
| 配置快照脱敏             | [src/config/redact-snapshot.ts](../src/config/redact-snapshot.ts)：`redactConfigObject`、schema 敏感路径 + `REDACTED` 占位                                                                                    | Web/CLI 展示配置时依赖此链路                                                                                                                                                               |
| `status` 类输出          | [src/commands/status-all/format.ts](../src/commands/status-all/format.ts)：`redactSecrets`                                                                                                                    | 与全局 redact 互补                                                                                                                                                                         |
| 仓库内私钥形态           | `BEGIN OPENSSH PRIVATE KEY` 仅见于 [src/agents/sandbox/ssh.test.ts](../src/agents/sandbox/ssh.test.ts)（测例占位）；`detect-private-key` pre-commit 排除 `*.test.ts`                                          | 无提交真实 PEM 的迹象（本次静态检索）                                                                                                                                                      |
| 高熵 token 样例          | `sk-…` 仅见于 `*.test.ts` 等测例（明显伪造字符串）                                                                                                                                                            | 未发现疑似生产密钥的随机串                                                                                                                                                                 |
| 密钥扫描（本地）         | [.pre-commit-config.yaml](../.pre-commit-config.yaml)：Yelp **detect-secrets** + [.secrets.baseline](../.secrets.baseline)；`pnpm-lock.yaml` 排除                                                             | 需本地 `pre-commit`/`prek`；本次环境未安装 pre-commit，**未**实测 hook 通过                                                                                                                |
| CI 安全快车道            | [.github/workflows/ci.yml](../.github/workflows/ci.yml) job **`security-fast`**：`detect-private-key`、`zizmor`（仅变更的 workflow）、`pnpm-audit-prod`                                                       | **未**在 CI 中调用 `detect-secrets` hook（与 pre-commit 全量配置不一致）；[docs/ci.md](../docs/ci.md) 表格仍写 `secrets` 作业名，与 workflow 实际 job 名略有不一致 → 见发现 **S001-P2-02** |
| Web 控制面 token 存放    | [ui/src/ui/storage.ts](../ui/src/ui/storage.ts)：网关 **token** 存 **sessionStorage**（键前缀 `openclaw.control.token.v1:`）；`PersistedUiSettings` 显式 **不**持久化 `token`                                 | 同源 XSS 可读取 sessionStorage（Phase 5 深入）；共享设备/未关标签需注意会话边界                                                                                                            |
| CLI 参数泄露             | [docs/cli/acp.md](../docs/cli/acp.md)：`--token`/`--password` 可能在进程列表中暴露；建议 file/env                                                                                                             | 与 `gateway run` 一致；见 §3                                                                                                                                                               |

### 0.5 网关与控制面（Phase 3 已确认，供 Phase 4–5 引用）

| 项                         | 位置 / 行为                                                                                                                                                                                                                                            | 安全含义（简要）                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 非 loopback 必须有共享凭据 | [server-runtime-config.ts](../src/gateway/server-runtime-config.ts)：`resolveGatewayRuntimeConfig` 在 `!isLoopbackHost(bindHost) && !hasSharedSecret && authMode !== "trusted-proxy"` 时抛错；[run.ts](../src/cli/gateway-cli/run.ts) 在启动前同类校验 | 防止「全网监听却无 token/password」的默认误配                                 |
| Tailscale Funnel           | 同上：`tailscaleMode === "funnel"` 强制 `authMode === "password"`；Tailscale serve/funnel 强制 `bind=loopback`                                                                                                                                         | 降低公网入口 + 弱鉴权组合                                                     |
| Control UI + 非 loopback   | 要求 `gateway.controlUi.allowedOrigins` 或 `dangerouslyAllowHostHeaderOriginFallback=true`（后者启动时 [server-runtime-state.ts](../src/gateway/server-runtime-state.ts) 打 **warn**）                                                                 | 限制基于 Origin 的控制面滥用；break-glass 选项有日志警示                      |
| 鉴权模式                   | [auth.ts](../src/gateway/auth.ts)：`authorizeGatewayConnect`；`mode=none` 时直接 `ok`（[run.ts](../src/cli/gateway-cli/run.ts) 会 **warn**）                                                                                                           | 显式 `none` 仅适用于强隔离环境                                                |
| 共享密钥校验               | [safeEqualSecret](../src/security/secret-equal.ts)（constant-time）用于 token/password 比对                                                                                                                                                            | 缓解时序旁路（在 Node 语义内）                                                |
| 暴力破解缓解               | [auth-rate-limit.ts](../src/gateway/auth-rate-limit.ts)：默认约 10 次/分钟失败 → 锁约 5 分钟；**缺省豁免 loopback**                                                                                                                                    | 内存态、单进程；多副本不共享计数                                              |
| Tailscale 头认证面         | `authSurface`：`http` **不**启用 Tailscale forwarded-header 路径；`ws-control-ui` **可**启用（见 `shouldAllowTailscaleHeaderAuth`）                                                                                                                    | HTTP API 与 WS 控制面威胁模型区分                                             |
| 受信反向代理               | `mode=trusted-proxy`：要求 `gateway.trustedProxies`、远端在允许列表、必填头与用户头；loopback 绑定时还要求代理含 loopback                                                                                                                              | 配错则拒绝启动或拒绝连接                                                      |
| URL 覆盖与凭据             | [call.ts](../src/gateway/call.ts)：`ensureExplicitGatewayAuth` — `OPENCLAW_GATEWAY_URL` / `--url` 覆盖时禁止静默复用隐式凭据（防指向恶意 WSS 时误带 token）                                                                                            | Phase 4 远程 CLI 仍应遵守                                                     |
| 配置级审计                 | [audit.ts](../src/security/audit.ts)：`collectGatewayConfigFindings`（如非 loopback 无 auth、`gateway.tools.allow` 恢复危险 HTTP tools、trustedProxies 缺失 warn 等）                                                                                  | 运维应定期：`openclaw security audit` / `--deep`                              |
| loopback 绑定回退          | [net.ts](../src/gateway/net.ts)：`bind=loopback` 时若无法绑定 `127.0.0.1` 则回退 **`0.0.0.0`**                                                                                                                                                         | 极端环境下面向「全网接口」；与操作者「仅本机」心理模型不一致 → **S001-P3-01** |

### 0.6 消息通道与插件（Phase 4 已确认，供 Phase 5/7 引用）

| 项                      | 位置 / 行为                                                                                                                                                                                                            | 安全含义（简要）                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 内置通道实现            | `src/telegram`、`src/discord`、`src/slack`、`src/signal`、`src/imessage`、`src/web`（WhatsApp 等）+ [channels/](../src/channels/)、[routing/](../src/routing/)                                                         | 入站统一走自动回复/命令管线；改一处策略需考虑全通道                                                       |
| 通道类扩展              | [extensions/](../extensions/) 中带 `"channels": [...]` 的 `openclaw.plugin.json`（当前约 **21** 个，如 slack、discord、telegram、matrix、nostr 等）                                                                    | 与核心共享 `plugin-sdk` 契约；仅应安装可信来源扩展（见 [AGENTS.md](../AGENTS.md) 插件边界）               |
| DM / 私聊策略           | [direct-dm.ts](../src/plugin-sdk/direct-dm.ts)：`dmPolicy`（如 `pairing` / `open` / `allowlist`）与 `allowFrom`、配对存储合并；[pairing-store.ts](../src/pairing/pairing-store.ts)：`readChannelAllowFromStore` 等     | `open` = 任意人可 DM → **高风险**；审计见下                                                               |
| 发送方白名单            | [allow-from.ts](../src/channels/allow-from.ts)：`isSenderIdAllowed`（含 `*` 通配）                                                                                                                                     | 空列表语义依赖 `allowWhenEmpty`；各通道调用点需一致                                                       |
| 群策略                  | [group-policy.ts](../src/config/group-policy.ts)：`resolveChannelGroupPolicy` 等                                                                                                                                       | `groupPolicy=open` 与开放 DM 类似，属扩大暴露面                                                           |
| 文本命令授权            | [command-gating.ts](../src/channels/command-gating.ts)：`commands.useAccessGroups`（默认倾向启用）；`useAccessGroups=false` 时 `modeWhenAccessGroupsOff` **默认 `allow`**                                              | 关闭 access groups 易误放宽 **控制类** 文本命令 → **S001-P4-01**                                          |
| 命令实现入口            | [commands-core.ts](../src/auto-reply/reply/commands-core.ts)：`handleCommands`；[command-auth.ts](../src/auto-reply/command-auth.ts)；[command-gates.ts](../src/auto-reply/reply/command-gates.ts)（内部通道 + scope） | `/config`、`/mcp` 等默认关闭，见 `CommandsConfig`（[types.messages.ts](../src/config/types.messages.ts)） |
| 跨会话/跨通道发送       | [outbound-policy.ts](../src/infra/outbound/outbound-policy.ts)：`enforceCrossContextPolicy`；可经 `tools.message.allowCrossContextSend` 或 `crossContext.*` 放宽                                                       | 默认限制 Agent 工具「串台」滥发；误配提高钓鱼/骚扰面                                                      |
| 通道配置安全审计        | [audit-channel.ts](../src/security/audit-channel.ts)：`collectChannelSecurityFindings` — 如 DM `open`、群 `open`、`allowFrom` 形态异常等多为 **critical/warn**                                                         | 与 `openclaw security audit` 集成；`classifyChannelWarningSeverity` 对 open DM 标 **critical**            |
| 出站 URL 与令牌（示例） | 如 [extensions/slack/src/monitor/media.ts](../extensions/slack/src/monitor/media.ts)：对非 Slack 域拒绝附带 bot token 的请求                                                                                           | 扩展层应自行防 SSRF/令牌泄露；新增通道宜对照                                                              |

### 0.7 Web 控制面 UI（Phase 5 已确认，供 Phase 6 对比）

| 项                | 位置 / 行为                                                                                                                                      | 安全含义（简要）                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 网关凭据存放      | [storage.ts](../ui/src/ui/storage.ts)：token **sessionStorage**；设置 JSON **不**含 token（§0.4）                                                | 同源脚本可读 sessionStorage；共享浏览器需注意                                                                                                                  |
| 网关连接          | [gateway.ts](../ui/src/ui/gateway.ts)：`GatewayBrowserClient`；[app-gateway.ts](../ui/src/ui/app-gateway.ts)：`connectGateway`                   | `resolveControlUiClientVersion` 仅在 **网关 URL 与页面同 host** 时附带 client version；`isTrustedRetryEndpoint` 限制设备令牌重试信任域（loopback 或同页 host） |
| 用户指定 WS URL   | [overview.ts](../ui/src/ui/views/overview.ts) 等：可编辑 `gatewayUrl`；改 URL 时常清空 token                                                     | **钓鱼面**：若用户被诱导连到恶意 WSS，可能主动提交 token/password → **S001-P5-02**                                                                             |
| HTML 注入 / XSS   | 聊天与侧栏 Markdown：`unsafeHTML` + [toSanitizedMarkdownHtml](../ui/src/ui/markdown.ts)（**marked** + **DOMPurify**，标签/属性白名单、长度上限） | 依赖 DOMPurify/marked 维护与配置；无浏览器 **CSP** 时深度防御略弱 → **S001-P5-01**                                                                             |
| 其他 `unsafeHTML` | [overview-cards.ts](../ui/src/ui/views/overview-cards.ts)：`blurDigits` 先 `&` `<` `>` 转义再包 span                                             | 静态模式，非用户富文本                                                                                                                                         |
| 删除确认弹层      | [grouped-render.ts](../ui/src/ui/chat/grouped-render.ts)：`innerHTML` 为 **固定英文模板**（非用户内容）                                          | 非 XSS 汇点                                                                                                                                                    |
| Agent 文件预览    | [agents-panels-status-files.ts](../ui/src/ui/views/agents-panels-status-files.ts)：`unsafeHTML` + `applyPreviewTheme` + **`DOMPurify.sanitize`** | 与聊天区一致走净化                                                                                                                                             |
| 静态壳            | [index.html](../ui/index.html)：**无** `Content-Security-Policy` meta/header                                                                     | 与 P5-01 一并考量；反向代理可补 CSP                                                                                                                            |
| 主题引导脚本      | `index.html` 内联脚本读 `localStorage` 设置 `data-theme`                                                                                         | 不解析外部输入；仅本地设置 JSON                                                                                                                                |

### 0.8 移动端（Phase 6 已确认，供 Phase 7 / 运维对照）

| 平台        | 凭证与敏感设置                                                                                                                                                                                                                      | 网络 / 传输                                                                                                                                                                                                         | WebView / 深链                                                                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **iOS**     | [GatewaySettingsStore](../apps/ios/Sources/Gateway/GatewaySettingsStore.swift)：网关 token/password/bootstrap → **Keychain**（`GenericPasswordKeychainStore`，service `ai.openclaw.gateway`）；部分偏好 **UserDefaults**            | [Info.plist](../apps/ios/Sources/Info.plist)：`NSAppTransportSecurity` → **`NSAllowsArbitraryLoadsInWebContent=true`**（Web 内容）                                                                                  | [WKWebView](../apps/ios/Sources/Screen/ScreenWebView.swift)（Canvas 等）；`openclaw://` URL scheme；[NodeAppModel.handleDeepLink](../apps/ios/Sources/Model/NodeAppModel.swift) 对 agent 链接有 **长度限制、网关已连接校验、无 key 时用户确认/速率限制** |
| **Android** | [SecurePrefs.kt](../apps/android/app/src/main/java/ai/openclaw/app/SecurePrefs.kt)：`gateway.token.*` / password / bootstrap / manual.token → **EncryptedSharedPreferences**；主机、端口、TLS 开关等在 **明文** `SharedPreferences` | [network_security_config.xml](../apps/android/app/src/main/res/xml/network_security_config.xml)：**`base-config cleartextTrafficPermitted=true`** + `openclaw.local` / `ts.net` 域配置（注释写明 tailnet/本地场景） | WebView 与网关事件交互（如 [MainViewModel](../apps/android/app/src/main/java/ai/openclaw/app/MainViewModel.kt)）；需与明文 HTTP 策略一并评估                                                                                                             |
| **macOS**   | 菜单栏应用通过 [GatewayEndpointStore](../apps/macos/Sources/OpenClaw/GatewayEndpointStore.swift) 等解析 **`~/.openclaw/openclaw.json`**、环境变量、LaunchAgent 快照中的 token/password（与桌面 CLI 一致，**非 Keychain 主路径**）   | [Info.plist](../apps/macos/Sources/OpenClaw/Resources/Info.plist)：`NSAllowsArbitraryLoadsInWebContent` + 特定 IP 域 **HTTP 例外**                                                                                  | [CanvasWindowController](../apps/macos/Sources/OpenClaw/CanvasWindowController.swift) 等 **WKWebView**                                                                                                                                                   |

**小结**：iOS/Android 对 **网关共享密钥** 倾向 **Keychain / EncryptedSharedPreferences**；**传输层**为本地与 tailnet 便利显著 **放宽 ATS / 明文** → **S001-P6-01**。macOS 与 Node 网关配置文件模型一致，依赖用户目录权限与磁盘加密。

### 0.9 CI 与脚本（Phase 7 已确认）

| 项             | 位置 / 行为                                                                                                                                                                                            | 安全含义（简要）                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 默认工作流权限 | [ci.yml](../.github/workflows/ci.yml) 顶层 `permissions: contents: read`                                                                                                                               | 降低 `GITHUB_TOKEN` 默认写权限；需写权限的 job 单独声明                                                        |
| 安全快车道     | 同文件 job **`security-fast`**：`detect-private-key`、变更 workflow 的 **zizmor**、`pnpm-audit-prod`（pre-commit）                                                                                     | PR 上对 `.pre-commit-config.yaml` 可用 **base ref 可信副本** 防投毒（见 workflow 内 `PRE_COMMIT_CONFIG_PATH`） |
| 密钥扫描缺口   | **未**在 CI 中调用 Yelp **`detect-secrets`**（与本地 pre-commit 不一致）                                                                                                                               | 与 **S001-P2-02**、`docs/ci.md` 中 `secrets` 作业命名漂移一并跟踪                                              |
| Checkout       | 多处 `actions/checkout@v6` + `persist-credentials: false`（如 `ci.yml`）                                                                                                                               | 降低 token 驻留                                                                                                |
| npm 发布       | [openclaw-npm-release.yml](../.github/workflows/openclaw-npm-release.yml)：`environment: npm-release`，`id-token: write` + 脚本发布                                                                    | **OIDC/可信发布** 向，减少长期 `NPM_TOKEN` 密文依赖（与 `scripts/openclaw-npm-publish.sh` 配合）               |
| CodeQL         | [codeql.yml](../.github/workflows/codeql.yml)：`security-events: write`，`contents: read`                                                                                                              | 常规定位                                                                                                       |
| 机器人工作流   | [labeler.yml](../.github/workflows/labeler.yml)、[auto-response.yml](../.github/workflows/auto-response.yml)、[stale.yml](../.github/workflows/stale.yml)：`secrets.GH_APP_PRIVATE_KEY`（及 fallback） | 预期使用 GitHub App 私钥；需保护 org/repo secret 面                                                            |
| 第三方 Action  | 如 `useblacksmith/build-push-action@v*`、`blacksmith-*` runner、`docker/setup-buildx-action@v4` 等                                                                                                     | **供应商信任边界**；版本多为 **major 钉**（`@v6`），非 commit SHA                                              |
| 运维脚本       | [scripts/k8s/deploy.sh](../scripts/k8s/deploy.sh) 等：可打印/写入网关 token（`SHOW_TOKEN`、kubectl secret）                                                                                            | **操作者本地/CI 秘密**，非仓库泄露；文档需防日志截图外泄                                                       |
| 远程拉取示例   | [clawdock-helpers.sh](../scripts/shell-helpers/clawdock-helpers.sh) 注释中 `curl …/main/...`                                                                                                           | 未钉 **commit SHA** 时有供应链替换面 → **S001-P7-01**                                                          |

### 0.3 可重复命令（Phase 1）

```bash
# 依赖漏洞（需联网刷新 advisory 数据库）
pnpm audit
# 结构化输出（便于归档）
pnpm audit --json
```

**Phase 2（密钥与敏感数据）** — 建议在安装 pre-commit 后执行：

```bash
pre-commit run detect-secrets --all-files
pre-commit run detect-private-key --all-files
```

**Phase 3（网关与控制面）** — 需在已安装 CLI / 可连网关的环境下执行：

```bash
openclaw security audit --json
openclaw security audit --deep          # 含尽力而为的在线探测
# 与 doctor 联动提示见 src/commands/doctor-security.ts
```

**Phase 4（消息通道与插件）**：`security audit` 会拉取 `collectChannelSecurityFindings`（与网关 findings 并列）；建议 `--json` 归档。

**Phase 5（Web UI）**：以代码审查为主；可选在浏览器中对已部署控制面检查响应头 CSP、及 Network 中 WSS 目标是否为预期网关。

**Phase 6（移动端）**：以代码 + plist/xml 审查为主；真机侧可验证 Keychain/加密偏好、以及在不可信网络下对 WS/WSS 的实际行为。

**Phase 7（CI/脚本）**：对照 workflow 权限与 `rg secrets\.`；本地可跑 `pre-commit run --all-files`（需安装 pre-commit）与 `actionlint`（若已配置）。

---

## 1. 依赖与供应链（Phase 1）

### 1.1 方法

- 在仓库根目录执行 `pnpm audit --json`（pnpm 10.x，与 `packageManager` 一致）。
- 对照根 `package.json` 中 `pnpm.overrides`、`onlyBuiltDependencies`、`minimumReleaseAge` 及 `pnpm-workspace.yaml`。

### 1.2 结果（快照：`ec2dbcff9a`，执行时间约 2026-03-27 UTC）

- **Advisory 数据库返回**: `actions: []`，`advisories: {}`。
- **聚合统计**: `metadata.vulnerabilities` 全为 **0**（info/low/moderate/high/critical）。
- **依赖计数**: `totalDependencies`: **1446**（`pnpm audit` JSON 中的统计字段）。

### 1.3 结论

- 当前 npm advisory 视角下**无已报告漏洞命中**该 lockfile 解析结果（以执行时数据库为准）。
- **残留风险**（需在后续 Phase 或定期复跑中覆盖）:
  - `pnpm audit` 不覆盖所有攻击面（逻辑漏洞、自研代码、供应链侧 typosquat 等）。
  - Advisory 有滞后；建议在发版/升级依赖周期重复执行并记录日期。
  - **Extensions / packages** 若单独安装（文档约定为 `npm install --omit=dev`）时，其依赖树可能与 workspace hoist 不同；若需严格一致，可对关键扩展目录单独审计。

### 1.4 发现清单引用

见文末表 — **S001-P1-01**。

---

## 2. 密钥与敏感数据（Phase 2）

### 2.1 方法

- **静态检索**（仓库内，排除 `node_modules`、`dist`）：环境变量名、常见密钥形态（`sk-`、`ghp_`、`BEGIN … PRIVATE KEY`、`xoxb-` 等）；文档中的占位符与示例。
- **对照**工程规范中的用户数据路径（`~/.openclaw/…`）是否被错误写入仓库。
- **代码路径**：日志/配置脱敏实现（`redact.ts`、`redact-snapshot.ts`）、Web UI 凭证存储（`ui/src/ui/storage.ts`）。
- **流程**：`.pre-commit-config.yaml` 中 `detect-secrets` / `detect-private-key`；`.github/workflows/ci.yml` 中 `security-fast` 实际步骤。
- **局限**：本次**未**在本地运行 `detect-secrets`（环境无 `pre-commit`）；CI 上是否另有密钥扫描以 Actions 为准。

### 2.2 结果（快照：`ec2dbcff9a`，2026-03-27 UTC）

- **嵌入式真实密钥**：未发现符合生产形态的硬编码密钥；测例与文档使用占位符或明显伪造串（如 `sk-abcdefghijklmnopqrstuvwxyz123456`）。
- **PEM / OpenSSH 块**：仅测试文件中的占位内容；与 pre-commit 对 `*.test.ts` 的排除策略一致。
- **文档与示例**：`docs/`、`README` 等多处出现 `OPENAI_API_KEY`、`DISCORD_BOT_TOKEN` 等 **名称**与占位值（`YOUR_*`、`change-me`），属预期文档行为；安装类文档提醒勿提交真实秘密。
- **日志与配置脱敏**：核心实现集中在 `src/logging/redact.ts`、`src/config/redact-snapshot.ts`；默认非 `off` 时对工具/配置类输出做掩码。残留风险为**新增日志点未走 redact** 或 **自定义 pattern 未覆盖的组织专有格式**（需持续 code review）。
- **Web UI**：网关 token 仅存 sessionStorage，且设置 JSON 不持久化 `token` 字段（见 §0.4）。
- **CI 与 pre-commit 一致性**：`detect-secrets` 在 pre-commit 中配置，但 `security-fast` 未单独跑该 hook；与 `docs/ci.md` 中 job 命名存在漂移。

### 2.3 结论

- 当前静态视角下，**仓库内容未发现明显已泄露的生产密钥**。
- **需持续关注**：本地/PR 前运行完整 pre-commit（含 `detect-secrets`）；缩小 CI 与文档、与 pre-commit 全量的差距，避免「以为 CI 已扫全库密钥」的误解。
- **后续 Phase**：Phase 5 复核 Web UI 同源策略与 XSS 面对 sessionStorage 的影响；进程列表中的 CLI 凭据见 §0.4 / §3。

### 2.4 发现清单引用

**S001-P2-01**、**S001-P2-02**（见文末表）。

## 3. 网关与控制面（Phase 3）

### 3.1 方法

- 阅读网关启动与运行时配置路径：`resolveGatewayRuntimeConfig`、`openclaw gateway run` 前置校验、HTTP/WS 鉴权入口。
- 对照 `authorizeGatewayConnect` 各模式（token、password、none、trusted-proxy、Tailscale）与 **authSurface** 差异。
- 查阅 `src/security/audit.ts` 中网关相关 findings 与 `openclaw security audit` CLI。
- **未**在本机运行 `openclaw security audit`（未验证运行时环境）；结论以静态代码为准。

### 3.2 结果（快照：`ec2dbcff9a`，2026-03-27 UTC）

- **绑定与鉴权耦合**：非 loopback 绑定在无共享密钥且非 `trusted-proxy` 时 **CLI 与运行时双处拒绝**，并强制非 loopback 控制面配置 `allowedOrigins`（或显式危险 fallback）。整体符合「暴露面扩大必须配套认证/来源约束」的预期。
- **显式无鉴权**：`gateway.auth.mode=none` 被允许但启动时 **warn**，适合文档化后的受控场景；误配会导致任意客户端等价于管理员能力（取决于上层能力模型）。
- **暴力破解**：共享密钥失败尝试受内存滑动窗口限制，且 loopback 默认不计入；攻击面主要在 **可从网络到达网关 IP** 的部署。
- **深度防御**：`ensureExplicitGatewayAuth` 阻断「只改 URL 不重显式传凭据」的会话建立方式，降低钓鱼/恶意网关 URL 风险。
- **运营工具**：`collectGatewayConfigFindings` 对危险 `gateway.tools.allow`、bind/auth 组合等有分级 findings，与 `security audit` 集成。

### 3.3 结论

- 网关控制面在代码层具备 **多层硬门槛**（启动校验 + 连接授权 + 可选配置审计），与文档中「非 loopback 必须 auth」叙述一致。
- **残留风险**：见 **S001-P3-01**（loopback 绑定极端回退）、**S001-P3-02**（`mode=none` 操作风险）；多实例网关的 rate limit 不共享属架构限制，非本次缺陷。

### 3.4 发现清单引用

**S001-P3-01**、**S001-P3-02**（见文末表）。

## 4. 消息通道与插件（Phase 4）

### 4.1 方法

- 梳理 **入站** 路径：DM/群策略、`allowFrom`、配对存储与插件 SDK 的 `resolveInboundDirectDmAccessWithRuntime`。
- 梳理 **命令**：`handleCommands` 与 `commands.*` 配置门控、`useAccessGroups` / `modeWhenAccessGroupsOff`。
- 梳理 **出站工具**：`enforceCrossContextPolicy` 默认值与显式放宽选项。
- 阅读 **`collectChannelSecurityFindings`** 对高危模式（开放 DM、开放群、错误 allowlist 等）的归类。
- **未**对 21 个通道扩展逐一做代码级深潜；结论以核心共享模块 + 审计模块为准。

### 4.2 结果（快照：`ec2dbcff9a`，2026-03-27 UTC）

- **默认倾向**：文档与实现均强调 **配对 / allowlist**；`dmPolicy=open` 等在安全审计中按 **critical** 级别提示（见 `audit-channel.ts`）。
- **命令面**：敏感子命令（`/config`、`/mcp`、`/plugins`、`/debug` 等）在类型层默认 **false**，需显式打开；配合 `commands.useAccessGroups` 与 per-provider `commands.allowFrom` 可收紧「谁能发控制命令」。
- **访问组关闭时的行为**：`useAccessGroups=false` 时，若未设置 `modeWhenAccessGroupsOff`，命令授权逻辑可退化为 **广泛允许**（与 `allow` 默认值一致）— 运维关闭 access groups 时需同步理解风险（**S001-P4-01**）。
- **工具跨上下文**：默认禁止跨上下文发送（除非配置放宽），降低多会话/多通道误用与滥用概率。
- **扩展通道**：实现分布在内置 `src/*` 与 `extensions/<id>`；共享逻辑在 `src/channels`、`src/plugin-sdk`；单通道特有风险（令牌随请求发往第三方 URL 等）依赖各扩展实现与评审。

### 4.3 结论

- 核心栈对 **开放入站面**（开放 DM/群）有 **显式审计与严重级别**，并辅以白名单、配对存储与命令门控的多层机制。
- **主要残留风险**来自 **配置组合**（开放策略、关闭 access groups、放宽 cross-context、启用危险 HTTP gateway tools 已在 Phase 3 覆盖）及 **第三方扩展代码质量**，而非单一遗漏检查函数。

### 4.4 发现清单引用

**S001-P4-01**（见文末表）。

## 5. Web UI（Phase 5）

### 5.1 方法

- 检索 `innerHTML`、`unsafeHTML`、Markdown 渲染链；对照 [markdown.ts](../ui/src/ui/markdown.ts) 中 DOMPurify 选项与缓存边界。
- 阅读 `GatewayBrowserClient` 与 `storage` 的凭据生命周期、信任端点判断。
- 查看 [index.html](../ui/index.html) 是否含 CSP 或其它硬编码策略。
- **未**做动态浏览器渗透或第三方漏洞扫描。

### 5.2 结果（快照：`ec2dbcff9a`，2026-03-27 UTC）

- **富文本**：助手/工具侧 Markdown 经 **marked → DOMPurify（受限标签/属性）→ unsafeHTML**；推理块同样走 `toSanitizedMarkdownHtml`。在实现正确的前提下可显著降低 XSS。
- **无 CSP**：静态入口未声明 CSP，若 DOMPurify 或某处 `unsafeHTML` 回归出错，浏览器缺少策略层兜底（**S001-P5-01**）。
- **凭据**：网关 token 存 sessionStorage；连接逻辑对「设备令牌重试」等限制可信 endpoint（loopback 或与页面同 host）。
- **钓鱼**：UI 允许用户输入任意网关 WebSocket URL；若误信恶意地址，用户可能主动把 token/password 交给对方（**S001-P5-02**，与社会工程相关，非纯代码缺陷）。

### 5.3 结论

- Web UI 对 **不可信内容（模型输出）** 的主路径有 **明确净化**；剩余风险为 **依赖库与配置错误**、**缺少 CSP**、以及 **用户被误导连接恶意网关**。
- 与 Phase 6（原生客户端）对比时，可重点对照：**凭证存储介质**、**WebView 若嵌入同一 UI 是否继承相同模型**。

### 5.4 发现清单引用

**S001-P5-01**、**S001-P5-02**（见文末表）。

## 6. 移动端（Phase 6）

### 6.1 方法

- 对照三端：**凭证落盘位置**（Keychain、EncryptedSharedPreferences、openclaw.json）、**ATS / Network Security Config**、**WKWebView 使用点**、**URL scheme / 深链处理**。
- **未**做真机渗透或应用商店隐私合规审计。

### 6.2 结果（快照：`ec2dbcff9a`，2026-03-27 UTC）

- **iOS**：网关凭据经 Keychain 存储；深链 `openclaw://` 走解析与分支，agent 类消息有确认与长度策略，降低「点链接即执行」风险。
- **Android**：网关 token/password/bootstrap 等写入 **EncryptedSharedPreferences**；同时 **全局允许明文流量**（含注释中的 tailnet/本地用途），在公共 Wi‑Fi 等场景 **MITM 可读 WS/HTTP 的风险高于严格 TLS-only 应用**。
- **iOS / macOS plist**：`NSAllowsArbitraryLoadsInWebContent` 使 **WebKit 内 Web 内容** 可加载任意 HTTP/HTTPS，需依赖页面来源与业务约束（Canvas 等）。
- **macOS**：网关密钥主要来自用户配置 JSON 与环境，与 OpenClaw 桌面模型一致；需依赖文件权限与设备物理安全。

### 6.3 结论

- 移动端对 **静态密钥** 的存储整体 **优于** 纯 Web sessionStorage（系统级加密容器）。
- **主要可记录风险**为 **为 tailnet/开发便利而放宽的网络栈**（**S001-P6-01**），需在用户文档中强调：**不可信网络下优先 TLS + VPN/tailnet，避免在咖啡厅 Wi‑Fi 上对明文 WS 做敏感操作**。

### 6.4 发现清单引用

**S001-P6-01**（见文末表）。

## 7. CI 与脚本（Phase 7）

### 7.1 方法

- 抽查 [.github/workflows/\*.yml](../.github/workflows/)：`permissions`、`secrets:` 引用、`actions/*` 与第三方 `uses` 钉版本方式、`checkout` 凭据选项。
- 对照 [docs/ci.md](../docs/ci.md) 与 [ci.yml](../.github/workflows/ci.yml) 中 job 实际名称（`security-fast` 等）。
- `rg` 检索 `scripts/` 中 `curl`/`wget`/`TOKEN` 等（非穷尽），识别运维脚本中的秘密处理模式。

### 7.2 结果（快照：`ec2dbcff9a`，2026-03-27 UTC）

- **权限基线**：主 CI 工作流默认 **`contents: read`**；CodeQL、npm release 等按需收紧/扩展（如 `id-token: write`、`security-events: write`）。
- **供应链与检查**：`security-fast` 覆盖私钥检测、（变更时）workflow 静态审计、生产依赖 audit；**与本地完整 pre-commit 相比仍缺 `detect-secrets`**（见 **S001-P2-02**）。
- **发布**：npm 发布路径使用 **GitHub Environment + OIDC** 倾向，优于在 workflow 中硬编码长期 npm token（具体以 `openclaw-npm-publish.sh` 为准）。
- **脚本**：未发现将生产密钥写入仓库；`scripts/e2e/*` 使用临时 token；`k8s/deploy.sh` 等由操作者管理密钥生命周期。
- **用户可复制命令**：部分文档/注释建议从 **`main` 分支 raw URL** 拉脚本 → **S001-P7-01**。

### 7.3 结论

- CI 侧 **默认只读 token、关闭 checkout 持久凭据、分区安全 job** 与 **发布环境隔离** 整体合理。
- **改进候选**：对齐 `docs/ci.md` 命名；评估是否增加 CI 内 `detect-secrets`（成本/误报）；对公开安装示例优先 **钉 commit** 或校验 checksum。

### 7.4 发现清单引用

**S001-P2-02**（CI 与 pre-commit 一致性，Phase 2 已立项）、**S001-P7-01**（见文末表）。

---

## 发现按危险等级与修复方向（速览）

> 下列等级仅针对本仓库 **S001-P\*** 已编号项；**不含**「配置误用」类由 `openclaw security audit` 动态标为 critical 的项（例如 `dmPolicy=open` 等），该类以 **`security audit` 输出与文档** 为准。

### 等级定义

| 等级     | 含义                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| **中危** | 在错误配置或典型攻击路径下，可明显扩大未授权访问或凭证泄露面；应优先在默认策略、文档或产品上收紧或强提示。 |
| **低危** | 纵深防御、流程或与极端环境相关；修复以迭代、文档澄清、可选加固为主。                                       |
| **信息** | 非漏洞结论，属持续观测、健康检查或正向结论摘要。                                                           |

### 中危

| ID             | 问题摘要                                                                                             | 简要修复方向                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S001-P3-02** | `gateway.auth.mode=none` 时网关连接无共享密钥鉴权。                                                  | **生产禁用**：保持默认 token/password 或 `trusted-proxy`；若必须 `none`，限制在隔离网络并监控；勿对公网暴露。                                               |
| **S001-P4-01** | `commands.useAccessGroups=false` 且未设 `modeWhenAccessGroupsOff` 时，默认可放宽控制类文本命令授权。 | **默认保持** `commands.useAccessGroups=true`；若关闭，显式设 `modeWhenAccessGroupsOff` 为 `deny` 或 `configured`；定期跑 `security audit` 看通道/命令策略。 |
| **S001-P5-02** | Web 控制面可填任意网关 URL，用户可能向恶意 WSS 提交 token/password。                                 | **运营侧**：文档与 UI 提示「仅连接信任的网关」；可选产品侧增加书签/已知主机校验或首次连接确认；继续依赖 `isTrustedRetryEndpoint` 等设备令牌逻辑。           |
| **S001-P6-01** | 移动端为 tailnet/本地便利放宽明文与 Web ATS，不可信网络上 MITM 面增大。                              | **用户文档**：强调敏感操作仅在 tailnet/TLS/可信网络；**工程可选**：发布变体或 build flavor 收紧 `network_security_config` / ATS（代价是本地 WS 体验变差）。 |

### 低危

| ID             | 问题摘要                                                          | 简要修复方向                                                                                                                   |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **S001-P2-01** | 静态检索未见硬编码生产密钥；未跑本地 `detect-secrets`。           | 维护者安装 `prek`/`pre-commit`，PR 前跑 `detect-secrets`；依赖与通道大改后复扫。                                               |
| **S001-P2-02** | `docs/ci.md` 与 workflow 作业名不一致；CI 未跑 `detect-secrets`。 | 更新 [docs/ci.md](../docs/ci.md) 表格（`security-fast` 等）；评估在 CI 增加 `pre-commit run detect-secrets`（权衡时长/误报）。 |
| **S001-P3-01** | `loopback` 绑定失败时回退 `0.0.0.0`，与「仅本机」预期可能不符。   | 日志/文档强调该回退；极端环境显式使用 `lan`/`custom` 并配好防火墙与 auth。                                                     |
| **S001-P5-01** | 控制面无浏览器 CSP。                                              | 在网关反代或静态资源响应加 **CSP**；跟进 **DOMPurify / marked** 安全更新；代码审查新增 `unsafeHTML` 路径。                     |
| **S001-P7-01** | 示例 `curl …/main/…` 未钉 commit。                                | 文档改为 **固定 tag/commit** 的 raw URL，或附 **checksum**；推荐用户保存后校验再执行。                                         |

### 信息

| ID             | 说明                                                        | 建议动作                                                          |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| **S001-P1-01** | 当前 `pnpm audit` 对 lockfile 无 advisory；依赖总数已记录。 | 发版/升级依赖后重复 `pnpm audit`；关注 overrides 变更后的传递面。 |

---

## 发现清单（汇总）

| ID         | 阶段 | 危险等级 | 描述                                                            | 简要修复方向                                      | 状态   |
| ---------- | ---- | -------- | --------------------------------------------------------------- | ------------------------------------------------- | ------ |
| S001-P1-01 | P1   | **信息** | `pnpm audit` 对当前 lockfile 未报告漏洞；totalDependencies=1446 | 升级依赖后复跑 audit                              | 已记录 |
| S001-P2-01 | P2   | **低危** | 静态检索未见生产形态硬编码密钥；未跑 detect-secrets             | 本地/PR 前 `detect-secrets`；大改后复扫           | 已记录 |
| S001-P2-02 | P2   | **低危** | `docs/ci.md` 与 `security-fast` 不一致；CI 未跑 detect-secrets  | 对齐文档；可选 CI 增加 detect-secrets             | 已记录 |
| S001-P3-01 | P3   | **低危** | `loopback` 无法绑定时回退 `0.0.0.0`                             | 文档与运维知晓；配 auth/防火墙                    | 已记录 |
| S001-P3-02 | P3   | **中危** | `gateway.auth.mode=none` 无共享密钥鉴权                         | 生产用 token/password；`none` 仅隔离环境          | 已记录 |
| S001-P4-01 | P4   | **中危** | `useAccessGroups=false` 时默认易放宽命令授权                    | 保持 useAccessGroups 或设 modeWhenAccessGroupsOff | 已记录 |
| S001-P5-01 | P5   | **低危** | 控制面无 CSP                                                    | 网关层 CSP + 依赖升级 + 审查 unsafeHTML           | 已记录 |
| S001-P5-02 | P5   | **中危** | 任意网关 URL 导致钓鱼式凭据提交                                 | 文档提示；可选 URL 信任列表/首次确认              | 已记录 |
| S001-P6-01 | P6   | **中危** | 移动端明文/ATS 放宽，不可信网络 MITM                            | 用户文档 tailnet/TLS；可选收紧构建变体            | 已记录 |
| S001-P7-01 | P7   | **低危** | curl main 脚本供应链                                            | 钉 commit/tag + checksum                          | 已记录 |

---

## 修订历史

| 日期       | 说明                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 2026-03-27 | 创建骨架                                                             |
| 2026-03-27 | 完成 Phase 1；新增 §0 速查；更新发现清单与快照                       |
| 2026-03-27 | 完成 Phase 2；新增 §0.4；扩充 §0.3 命令；发现 P2-01/P2-02            |
| 2026-03-27 | 完成 Phase 3；新增 §0.5；§3 方法与结论；发现 P3-01/P3-02             |
| 2026-03-27 | 完成 Phase 4；新增 §0.6；§4；发现 P4-01                              |
| 2026-03-27 | 完成 Phase 5；新增 §0.7；§5；发现 P5-01/P5-02                        |
| 2026-03-27 | 完成 Phase 6；新增 §0.8；§6；发现 P6-01                              |
| 2026-03-27 | 完成 Phase 7；新增 §0.9；§7；发现 P7-01；S001 七阶段文档闭环         |
| 2026-03-27 | 新增「发现按危险等级与修复方向」；发现清单表增加危险等级与修复方向列 |
