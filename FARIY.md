# FARIY 个人备忘

本文件记录在本仓库（fariy）上为个人使用而整理的操作与约定，便于日后查阅。

## Web 控制面（开发）

- 目录：`ui/`
- 启动：`pnpm --dir ui dev` 或根目录若已配置则按项目脚本执行；默认开发地址一般为 `http://127.0.0.1:5173/`。
- 若 Vite 报网络接口错误，可显式指定：`pnpm vite --host 127.0.0.1 --dir ui`。

## 网关（dev 配置隔离）

- 脚本：`pnpm gateway:dev`（等价于带 `--dev` 的 gateway，状态目录在 `~/.openclaw-dev/`，配置文件为 `~/.openclaw-dev/openclaw.json`）。
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
- **Cursor**：已设 `.cursor/rules/fariy-task-table.mdc`（`alwaysApply: true`），助手在本会话仓库里会默认把任务表当作优先上下文；详表以 `my-docs/TASKS.md` 为准。

---

_仅作个人备忘；与上游 OpenClaw 行为不一致时以官方文档为准：_ <https://docs.openclaw.ai/web/dashboard>
