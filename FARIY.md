# FARIY 个人备忘

本文件记录在本仓库（fariy）上为个人使用而整理的操作与约定，便于日后查阅。

## 协作约定（个人仓库）

- 本仓库为**个人使用**，默认可**直接改源码**里的默认资源、主题、文案、dev 配置与迁移逻辑等；实现个人偏好时**不必每次先征求确认**（仍避免动 `CODEOWNERS` 等受限路径，除非维护者明确要求）。

## Fork 策略（已定案，不再反复讨论）

- **继续以本仓库（fariy）为主**：需求通过本工程内修改解决；**不承诺**与官方 OpenClaw 主线持续同步，合并上游仅在有需要时再做。
- **网关层尽量小改**：优先配置 → Skill → `ui/` → `extensions/`，再考虑 `src/`；**狭义网关**（`src/gateway/`）与核心回复链路视为高成本面，非必要不动。可选方案表见 `my-docs/OPENCLAW_CUSTOMIZATION_OPTIONS.md`。
- **迁回纯官方 OpenClaw**：仅作远期备选，**默认不考虑**；若将来要做再单独立项。
- **Cursor 规则**：`.cursor/rules/fariy-fork-strategy.mdc`（`alwaysApply: true`），助手默认按上述策略给建议。

## Web 控制面（开发）

- 目录：`ui/`
- 启动：`pnpm --dir ui dev` 或根目录若已配置则按项目脚本执行；默认开发地址一般为 `http://127.0.0.1:5173/`。
- 若 Vite 报网络接口错误，可显式指定：`pnpm vite --host 127.0.0.1 --dir ui`。

## Urban 样稿（U001）与实际控制面对齐

- **必须**在控制面 **设置 → 外观与主题** 里把主题选成 **Urban**（或 Urban + 浅色模式）。默认 **Claw** 是红/暗风格，**不会**出现样稿里的酸绿侧栏、蓝/浅聊天气泡、42px 圆头像。
- `ui/index.html` 里有一段读 localStorage 的脚本，用于首屏避免闪屏；若未包含 `urban`，即使你存了 Urban 也会先当成 Claw。仓库已补上 `urban` 解析（与 `theme.ts` 一致）。
- 样稿里的 **Fairy / 铃 / 哲** 头像是 `my-docs/assets` 本地预览用，**未打进产品**；助手显示名 **Fariy** 来自 dev 网关默认身份（`src/cli/gateway-cli/dev.ts`），可在网关配置/代理身份里改。

## 网关（dev 配置隔离）

- 脚本：`pnpm gateway:dev`（等价于带 `--dev` 的 gateway，状态目录在 `~/.openclaw-dev/`，配置文件为 `~/.openclaw-dev/openclaw.json`）。
- **会话键 `main` 与 agent id**：控制面若仍用旧会话键 **`main`**（非 `agent:…`），网关会把 agent 解析为 **`main`**。若 `agents.list` 里只有 **`id: "dev"`**，则 **`main` 没有 workspace 配置**，会落到 `~/.openclaw-dev/workspace-main`，**不会**用 `agents.defaults.workspace`。解决办法：把默认代理 **`id` 设为 `main`**（与 OpenClaw 默认 agent id 一致），或会话改用 **`agent:dev:main`**。见 `src/agents/agent-scope.ts` 中 `resolveAgentWorkspaceDir`。
- **默认 WebSocket 端口为 19001**（非 18789）。控制面里的「WebSocket URL」需与网关实际端口一致，例如 `ws://127.0.0.1:19001`。
- 插件 `stageRuntimeDependencies` 若导致启动失败，需用 pnpm 在对应 `extensions/*` 下安装依赖，或按仓库脚本 `pnpm stage:bundled-plugin-runtime-deps` 处理（个人环境以实际报错为准）。

## Dev 下免网关令牌（本机 loopback）

- 需求：个人本机使用，控制面不想每次填 `OPENCLAW_GATEWAY_TOKEN`。
- 做法：网关 `gateway.auth.mode` 设为 `none`，且 **`bind` 保持 loopback**，勿在公网/LAN 暴露下使用 `none`。
- **仓库已实现**：`src/cli/gateway-cli/dev.ts` 在 `--dev` 启动时，对**新建** dev 配置写入 `auth.mode: "none"`；对**已存在**的 `~/.openclaw-dev/openclaw.json`，若当前不是 `password` / `trusted-proxy`，会自动合并为 `auth.mode: "none"` 并写回（启动日志会提示一行说明）。
- 若需简单口令而非完全开放：配置 `gateway.auth.mode: "password"` 与 `gateway.auth.password`，控制面只填密码字段（协议侧无独立「用户名」）。

## 控制面与认证说明（简要）

- 界面上的「密码」是**网关认证密码**，不是传统账号系统的用户名+密码组合。
- 网关要求令牌而控制面未填时，会出现 `gateway token missing` 类错误；与 dev 免令牌方案配合后即可令牌留空连接（在 `auth.mode: none` 且端口一致的前提下）。

## 任务与自生成文档（可选）

- 个人任务与计划：`my-docs/TASKS.md`、`my-docs/PLANS.md`。
- 工程结构笔记：`my-docs/PROJECT_STRUCTURE.md`。
- 根目录 `TASKS.md` 为指向 `my-docs/` 的入口。
- **Cursor**：已设 `.cursor/rules/fariy-task-table.mdc`、`.cursor/rules/fariy-fork-strategy.mdc`（均为 `alwaysApply: true`）；任务表以 `my-docs/TASKS.md` 为准，Fork 策略见上一节与 `fariy-fork-strategy.mdc`。

---

_仅作个人备忘；与上游 OpenClaw 行为不一致时以官方文档为准：_ <https://docs.openclaw.ai/web/dashboard>
