# TASKS.md - 任务驱动表

## 🎯 设计原则

1. **任务表驱动**：所有工作围绕任务展开
2. **上下文完整**：每个任务关联相关文档链接
3. **状态透明**：明确的任务状态流转
4. **按需加载**：只加载任务相关的文档
5. **分析为核心**：复杂任务需先制定方案再执行

---

## 📋 当前活跃任务

### 📚 文档建设

| 任务ID | 任务名称                       | 状态     | 优先级 | 截止时间   | 相关文档                                                                                                        | 负责人   |
| ------ | ------------------------------ | -------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| D001   | 工程目录结构与核心代码功能分析 | ✅已完成 | 中     | 2026-03-27 | [产物: PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) · [工程规范](../CLAUDE.md) · [package.json](../package.json) | OpenClaw |

### 🌐 国际化与本地化

| 任务ID | 任务名称                              | 状态     | 优先级 | 截止时间   | 相关文档                                                                                                                                                                                                                                                                                                                                                                                                                             | 负责人   |
| ------ | ------------------------------------- | -------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| L001   | 视图层英文替换为中文 - Web UI Phase 1 | ✅已完成 | 中     | 2026-03-27 | [计划: PLANS.md](PLANS.md#计划-1-视图层英文替换为中文) · [zh-CN.ts](../ui/src/i18n/locales/zh-CN.ts) · [channels 视图](../ui/src/ui/views/channels*.ts)                                                                                                                                                                                                                                                                              | OpenClaw |
| L002   | Web UI 配置页（Schema 表单）中英文化  | ✅已完成 | 中     | 2026-03-27 | [计划: PLANS.md](PLANS.md#计划-2-web-ui-配置页schema-表单中英文化) · [zh-CN config](../ui/src/i18n/locales/zh-CN.ts) · [config-form.render.ts](../ui/src/ui/views/config-form.render.ts) · [config.ts](../ui/src/ui/views/config.ts) · [config-form.node.ts](../ui/src/ui/views/config-form.node.ts)                                                                                                                                 | OpenClaw |
| L003   | Web UI 剩余视图国际化 - Phase 2       | ✅已完成 | 中     | 2026-03-28 | [计划: PLANS.md](PLANS.md#计划-3-web-ui-剩余视图国际化) · [zh-CN.ts](../ui/src/i18n/locales/zh-CN.ts) · [sessions.ts](../ui/src/ui/views/sessions.ts) · [instances.ts](../ui/src/ui/views/instances.ts) · [logs.ts](../ui/src/ui/views/logs.ts) · [skills.ts](../ui/src/ui/views/skills.ts) · [nodes.ts](../ui/src/ui/views/nodes.ts) · [debug.ts](../ui/src/ui/views/debug.ts) · [channels.\*.ts](../ui/src/ui/views/channels.*.ts) | OpenClaw |
| L004   | 配置表单内部元素国际化                | ✅已完成 | 中     | 2026-03-28 | [zh-CN.ts](../ui/src/i18n/locales/zh-CN.ts) · [config-form.node.ts](../ui/src/ui/views/config-form.node.ts)                                                                                                                                                                                                                                                                                                                          | OpenClaw |

### 🎨 UI / 视觉与体验

| 任务ID | 任务名称                                         | 状态     | 优先级 | 截止时间 | 相关文档                                                                                                                                                                                                                                                                                                        | 负责人   |
| ------ | ------------------------------------------------ | -------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| U001   | Web UI「都市机能」风格改造（绝区零聊天窗为参考） | 🔄进行中 | 中     | 待定     | [计划: PLANS.md](PLANS.md#u001-urban-ui-theme) · [规范](U001_URBAN_THEME_TOKENS.md) · [theme-urban.css](../ui/src/styles/theme-urban.css) · [theme-urban-chat.css](../ui/src/styles/theme-urban-chat.css) · [theme-urban-shell.css](../ui/src/styles/theme-urban-shell.css) · Phase 0–2 ✅ · Phase 3 配置页待做 | OpenClaw |

### 🔒 安全与风险

| 任务ID | 任务名称                                   | 状态     | 优先级 | 截止时间   | 相关文档                                                                                                                                                                                                                                                 | 负责人   |
| ------ | ------------------------------------------ | -------- | ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| S001   | 全工程安全漏洞与风险排查及文档化（分阶段） | ✅已完成 | 高     | 2026-03-27 | [计划: PLANS.md](PLANS.md#计划-3-全工程安全漏洞与风险排查) · [记录文档: SECURITY_AUDIT.md](SECURITY_AUDIT.md) · [工程规范](../CLAUDE.md) · [CODEOWNERS](../.github/CODEOWNERS) · 上游公开说明: [docs.openclaw.ai](https://docs.openclaw.ai/)（按需对照） | OpenClaw |

---

## 📁 任务上下文文档索引

### 工程文档

- **U001 都市机能主题 Token（Phase 0）**: [U001_URBAN_THEME_TOKENS.md](U001_URBAN_THEME_TOKENS.md)
- **工程结构**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **工程规范**: [CLAUDE.md](../CLAUDE.md) / [AGENTS.md](../AGENTS.md)
- **构建配置**: [package.json](../package.json)
- **构建命令**: `pnpm build`, `pnpm test`, `pnpm check`
- **安全审计记录（S001 产出）**: [SECURITY_AUDIT.md](SECURITY_AUDIT.md)（**§0 后续阶段速查**；Phase 1–7 已完成，**S001 已闭环**）

### 视图层代码位置

- **Web UI**: `ui/src/ui/views/` (TypeScript, ~68 个文件)
- **Web UI 样式与主题**: `ui/src/styles/`（含 `chat/`、`base.css`、`layout.css` 等）；U001 改造以 CSS 变量与主题层为主，避免一次性改遍所有视图
- **macOS UI**: `apps/macos/Sources/OpenClaw/` (SwiftUI)
- **iOS UI**: `apps/ios/Sources/` (SwiftUI)
- **Android UI**: `apps/android/app/src/main/java/ai/openclaw/app/ui/` (Kotlin)

---

## 🔄 任务状态流转规范

### 状态定义

- **📋待开始**: 任务已识别，等待开始
- **📝计划中**: 执行计划已制定，准备开始
- **🔄进行中**: 任务正在执行中
- **⏸️已暂停**: 任务暂时停止，有明确恢复条件
- **✅已完成**: 任务已完成，产出已交付
- **❌已取消**: 任务已取消，有取消原因记录

### 状态更新规则

1. **识别任务后**: 创建任务条目，状态为"📋待开始"
2. **较大/复杂任务**: 制定执行计划，状态改为"📝计划中"
3. **开始执行**: 更新状态为"🔄进行中"，记录开始时间
4. **遇到阻塞**: 更新状态为"⏸️已暂停"，记录阻塞原因和恢复条件
5. **任务完成**: 更新状态为"✅已完成"，记录完成时间和产出
6. **任务取消**: 更新状态为"❌已取消"，记录取消原因

### 产出记录要求

每个任务完成必须记录：

1. **产出物**: 代码、文档、配置等具体文件路径
2. **验证结果**: 如何验证任务完成（测试命令、检查清单）
3. **相关文档更新**: 哪些文档需要同步更新
4. **重要信息**: 遇到的问题、解决方案、经验教训

---

## 🚀 新会话工作流程

### 启动时（精简加载）

1. 读取 `my-docs/TASKS.md` - 了解当前任务状态（**Cursor**：`.cursor/rules/fariy-task-table.mdc` 已设为默认上下文，任务相关问题应优先对齐全文）
2. 按需加载 `my-docs/PLANS.md` - 查看详细执行计划
3. **按需加载** - 只加载当前任务相关的文档

### 任务执行时

1. 从 `TASKS.md` 选择任务
2. 如为较大/复杂任务，先查阅 `PLANS.md` 制定或确认方案
3. 执行任务，按规范更新状态
4. 完成后更新 `TASKS.md`，填写产出物和结果

---

## 📊 任务详细说明

### D001 - 工程目录结构与核心代码功能分析

**任务描述**: 扫描分析 OpenClaw 工程的整体目录结构，梳理核心代码模块的功能，生成工程结构文档。

**扫描范围**:

- 根目录结构与配置
- `src/` - 核心 TypeScript 源码 (~2000+ 文件)
- `ui/` - Web 控制界面 (~68 个视图文件)
- `apps/` - 移动端应用 (iOS/macOS/Android)
- `extensions/` - 插件扩展
- `packages/` - 共享 npm 包
- `scripts/` - 工具脚本

**核心发现**:

1. **架构特点**: 多平台统一架构 (Node.js 后端 + Web UI + 移动端)
2. **通道系统**: 内置 + 扩展支持多种消息通道 (Telegram/Discord/Slack/WhatsApp 等)
3. **Agent 系统**: 支持多 Agent 管理与工作流
4. **插件机制**: 通过 `extensions/` 和工作区插件实现可扩展性
5. **共享代码**: Apple 平台通过 `OpenClawKit` 共享 Swift 代码

**产出物**:

- 文档: `my-docs/PROJECT_STRUCTURE.md`

**重要信息**:

- 发现 UI 层已有 i18n 基础 (`ui/src/i18n/`)，含 `zh-CN` 等语言包
- Web UI 使用 Lit + Vite，移动端使用 Swift/Kotlin 原生开发
- CLI 基于 Commander，支持懒加载和子 CLI 架构

**相关提交**:

- 新建: `my-docs/PROJECT_STRUCTURE.md`

---

### S001 - 全工程安全漏洞与风险排查及文档化

**任务描述**: 对仓库进行系统性安全与风险排查（依赖供应链、密钥与敏感数据、网关与鉴权、消息通道与插件边界、Web/移动端暴露面、构建与发布链路），将发现项、风险等级、缓解措施与后续跟踪记录到 `my-docs/SECURITY_AUDIT.md`。工作量较大时**严格按 `PLANS.md` 计划 3 分阶段执行**，每阶段结束更新文档与任务状态。

**范围（全工程）**:

- **依赖与供应链**: 根与各 workspace 包（`pnpm audit` / 锁定文件策略、已知 CVE、补丁依赖）
- **密钥与配置**: 日志/错误信息是否泄露路径与令牌；示例与测试中的占位符规范（对照 `CLAUDE.md` 安全提示）
- **网关与控制面**: 本地/远程绑定、认证、会话与 Agent 工具执行边界（`src/` 相关模块）
- **通道与插件**: 内置通道 + `extensions/*` 的路由、配对、命令门控、不可信输入处理
- **Web UI**: `ui/` 中 XSS、敏感操作确认、与网关通信方式
- **客户端**: `apps/macos`、`apps/ios`、`apps/android` 中的凭证存储与网络安全配置
- **CI 与脚本**: `scripts/`、GitHub Actions 中的秘密与权限（只读审计，不擅自改 `CODEOWNERS` 等受控文件除非负责人要求）

**分阶段说明**: 详见 [PLANS.md — 计划 3](PLANS.md#计划-3-全工程安全漏洞与风险排查)。

**产出物**:

- 主文档: `my-docs/SECURITY_AUDIT.md`（建议结构：范围与方法、分阶段结论、发现清单表、已缓解/待办、参考命令与复现步骤）
- 可选: 对严重问题单独开 issue / 与上游 `openclaw` 安全披露流程对齐（不在本任务表替代官方 GHSA 流程）

**验收标准（任务完成时）**:

- [x] `SECURITY_AUDIT.md` 覆盖计划 3 所列各阶段，并标注日期与仓库快照（commit 或日期）
- [x] 高风险项有明确缓解状态（已修 / 已接受风险+理由 / 转跟踪项）— 见 [SECURITY_AUDIT.md](SECURITY_AUDIT.md) 发现清单与各 § 结论
- [x] 任务状态更新为 ✅已完成，并在本说明中记录验证方式

**当前状态**: ✅已完成（2026-03-27）。

**阶段进度**:

- [x] **Phase 1 — 依赖与供应链**（2026-03-27）: 已执行 `pnpm audit --json`；当前 advisory 0 条；`pnpm.overrides` / `onlyBuiltDependencies` / `minimumReleaseAge` / workspace 布局已记入 [SECURITY_AUDIT.md](SECURITY_AUDIT.md) **§0–§1**，供 Phase 2–7 直接引用。
- [x] **Phase 2 — 密钥与敏感数据**（2026-03-27）: 静态检索 + 脱敏/Web 存储/CI 与 pre-commit 对照；结论与 **§0.4**、**§2**、发现 **S001-P2-01/02** 已写入 [SECURITY_AUDIT.md](SECURITY_AUDIT.md)。
- [x] **Phase 3 — 网关与控制面**（2026-03-27）: 绑定/鉴权/审计代码路径静态审查；**§0.5**、**§3**；发现 **S001-P3-01/02**；建议运行 `openclaw security audit` 作运行时复核。
- [x] **Phase 4 — 消息通道与插件**（2026-03-27）: DM/allowlist/命令门控/cross-context/审计模块静态审查；**§0.6**、**§4**；发现 **S001-P4-01**；通道扩展约 21 个未逐文件深潜。
- [x] **Phase 5 — Web UI**（2026-03-27）: Markdown/DOMPurify、`unsafeHTML` 汇点、网关客户端与存储；**§0.7**、**§5**；发现 **S001-P5-01/02**；未做浏览器渗透。
- [x] **Phase 6 — 移动端**（2026-03-27）: iOS Keychain、Android EncryptedSharedPreferences、ATS/Network Security、WKWebView、深链；**§0.8**、**§6**；发现 **S001-P6-01**；未做真机渗透。
- [x] **Phase 7 — CI 与脚本**（2026-03-27）: workflow 权限/密钥引用/第三方 Action、`scripts/` 抽样；**§0.9**、**§7**；发现 **S001-P7-01**；交叉引用 **S001-P2-02**。

**验证结果（维护者建议例行）**:

- `pnpm audit` / `pnpm audit --json`（依赖升级后）
- 本地 `pre-commit run detect-secrets --all-files`（若已安装 pre-commit / `prek`）
- `openclaw security audit --deep`（有可连网关时）

---

### L001 - 视图层英文替换为中文 (Web UI Phase 1 - 已完成)

**问题描述**: 项目视图层代码中包含大量英文界面文本，需要本地化为中文以提升中文用户体验。

**涉及范围**:

- Web UI (`ui/src/ui/views/`): ~68 个 TypeScript 文件
- macOS UI (`apps/macos/Sources/OpenClaw/`): SwiftUI 视图
- iOS UI (`apps/ios/Sources/`): SwiftUI 视图
- Android UI (`apps/android/`): Kotlin UI

**采用方案**: 沿用并扩展现有 i18n 架构

- 项目已有 `ui/src/i18n/` 国际化基础架构
- 使用 `I18nManager` + `t()` 函数模式
- 支持懒加载多语言，默认英文、支持中文等语言

**已完成工作** (Web UI Phase 1):

1. **翻译文件补充** (`ui/src/i18n/locales/zh-CN.ts`)
   - 添加 `usage` 模块完整中文翻译（80+ 键）
   - 添加 `channels` 模块中文翻译
   - 添加 `channels.nostr` 相关翻译（名称、显示名称、关于等）

2. **视图文件国际化改造**
   - `ui/src/ui/views/channels.ts`: 通道健康、通道卡片标题/副标题、状态标签
   - `ui/src/ui/views/channels.telegram.ts`: 运行状态、配置状态、最后入站时间
   - `ui/src/ui/views/channels.nostr.ts`: 公钥、最后启动、个人资料字段
   - `ui/src/ui/views/channels.config.ts`: 配置架构加载、保存按钮

3. **新增翻译键**:
   - `channels.health.title` - 通道健康
   - `channels.status.running/configured/lastInbound/publicKey/lastStart` - 状态标签
   - `channels.nostr.profile.*` - 个人资料字段
   - `channels.nostr.noProfile/loadingSchema/saving/save` - Nostr 特定文本
   - `usage.*` - 使用情况页面完整翻译

**验证结果**:

- ✅ TypeScript 类型检查通过 (`pnpm tsgo`)
- ✅ Channels 相关测试通过 (48 tests passed)
- ✅ 无破坏现有英文用户界面

**产出物**:

- 修改: `ui/src/i18n/locales/zh-CN.ts` - 补充中文翻译
- 修改: `ui/src/ui/views/channels.ts` - i18n 化改造
- 修改: `ui/src/ui/views/channels.telegram.ts` - i18n 化改造
- 修改: `ui/src/ui/views/channels.nostr.ts` - i18n 化改造
- 修改: `ui/src/ui/views/channels.config.ts` - i18n 化改造

**后续阶段计划**:

- Phase 2: agents 视图、usage 视图、overview 视图
- Phase 3: cron 视图、chat 视图、其他视图
- Phase 4: macOS/iOS/Android 原生界面

**验收标准** (已完成 Phase 1):

- [x] 关键视图英文界面文本已替换为 i18n 调用
- [x] 代码通过类型检查 (`pnpm tsgo`)
- [x] Web UI 测试通过 (`pnpm test` channels.test.ts)
- [x] 中文翻译已补充到语言包

---

### L002 - Web UI 配置页（Schema 表单）中英文化（已完成）

**背景（2026-03-27 会话记录）**: 侧栏/主导航已用 `zh-CN` + `t()` 中文化，但 **设置 → 配置** 内仍为英文。用户可见「Updates」等子标签、区块标题及表单项标题/说明均为英文。

**已完成工作**（2026-03-27）:

1. **阶段 A — 静态 UI**
   - `ui/src/i18n/locales/en.ts` / `zh-CN.ts`：新增 `config.*`（分区 `sections`、顶栏 `tabs`、分类 `categories`、工具栏与空状态、外观页 `appearance`、`borderRadius` 等）。
   - `ui/src/ui/views/config-form.render.ts`：`SECTION_META` 改为 `getConfigSectionMeta()` + `t()`；空状态与危险提示走 i18n。
   - `ui/src/ui/views/config.ts`：`buildSectionCategories()` 在渲染时生成以支持切换语言；顶栏、表单/原始模式、搜索、差异面板、保存按钮等全部 `t()`。

2. **阶段 B — 字段级（样例 + 策略）**
   - `zh-CN.ts` 下 `config.fieldMeta` 嵌套路径（如 `update.channel`、`gateway.port`、`auth.profiles`）；`ui/src/ui/views/config-form.node.ts` 在 `locale === "zh-CN"` 时用 `t(config.fieldMeta.<path>.*)` 覆盖 `resolveFieldMeta` 的 label/help；敏感字段显隐按钮文案走 `config.*`。
   - 后续扩展：在 `config.fieldMeta` 中按 JSON 路径继续追加键即可，无需改网关。

**验证**:

- `pnpm tsgo` 通过；`pnpm test -- ui/src/ui/views/channels.test.ts` 通过（UI 测试集代表）。
- `pnpm check`：已对改动文件执行 `oxfmt --write`；若根目录另有未格式化文件（如 `TASKS.md`），与本次功能无关。

**产出物**:

- 修改：`ui/src/i18n/locales/en.ts`、`ui/src/i18n/locales/zh-CN.ts`
- 修改：`ui/src/ui/views/config-form.render.ts`、`ui/src/ui/views/config-form.ts`、`ui/src/ui/views/config.ts`、`ui/src/ui/views/config-form.node.ts`

---

## 📌 任务历史记录

> 已归档的已完成/取消任务将移动到此区域

---

_任务表版本_: v1.9
_最后更新_: 2026-03-27
_维护责任_: OpenClaw
