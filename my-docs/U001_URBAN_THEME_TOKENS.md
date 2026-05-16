# U001 Phase 0 —「都市机能」设计 Token 与规范

**关联任务**: [U001](TASKS.md) · **计划**: [PLANS.md — 计划 4](PLANS.md#u001-urban-ui-theme)  
**状态**: Phase 0 定稿（实现文件：`ui/src/styles/theme-urban.css`）

本文档把参考界面中的**视觉意象**落实为可与现有 OpenClaw Web UI 变量体系对齐的 Token；**不**使用第三方游戏素材与商标。

---

## 1. 设计原则（执行时自检）

| 原则     | 说明                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 可访问性 | 正文以 `--text` / `--text-strong` 为主；酸绿、橙作**强调与边界**，避免大面积酸绿小字号正文。          |
| 共存     | 默认 `data-theme` 不变；仅当解析为 `urban` / `urban-light` 时加载本主题覆盖（见 `theme-urban.css`）。 |
| 粗描边   | 语义用 `--border-width-strong: 2px`（Phase 1+ 在聊天气泡、按钮上引用）。                              |

---

## 2. 颜色 Token 表（暗色 `urban`）

与 `ui/src/styles/base.css` 中现有变量**同名覆盖**，便于少改组件。

| Token                        | 参考值                     | 语义                                       |
| ---------------------------- | -------------------------- | ------------------------------------------ |
| `--bg`                       | `#09090b`                  | 页面最底层背景                             |
| `--bg-accent`                | `#0c0c0e`                  | 次级区块底                                 |
| `--bg-elevated`              | `#141418`                  | 卡片、浮层、气泡容器                       |
| `--bg-hover`                 | `#1c1c22`                  | 悬停抬升                                   |
| `--card`                     | `#121216`                  | 卡片面                                     |
| `--panel` / `--panel-strong` | `#09090b` / `#141418`      | 侧栏与强面板                               |
| `--text`                     | `#d4d4d8`                  | 正文                                       |
| `--text-strong`              | `#fafafa`                  | 标题、强调正文                             |
| `--muted`                    | `#71717a`                  | 次要说明、时间戳                           |
| `--border`                   | `#27272a`                  | 默认 1px 边框色                            |
| `--border-strong`            | `#3f3f46`                  | 强调分割、粗描边配合 `border-width`        |
| `--input`                    | `#27272a`                  | 输入框边框基准                             |
| `--accent`                   | `#b4d83a`                  | 主强调（酸绿，按钮面、主链接）             |
| `--accent-hover`             | `#c9e860`                  | 主强调悬停                                 |
| `--accent-subtle`            | `rgba(180, 216, 58, 0.14)` | 选中底、弱背景                             |
| `--accent-glow`              | `rgba(180, 216, 58, 0.22)` | 光晕                                       |
| `--primary-foreground`       | `#111114`                  | **置于酸绿按钮上的文字**（保证对比度）     |
| `--ring`                     | `#b4d83a`                  | 焦点环基准色                               |
| `--urban-orange`             | `#fb923c`                  | 次强调（徽章、次级 CTA、装饰条）           |
| `--urban-orange-subtle`      | `rgba(251, 146, 60, 0.15)` | 橙色弱底                                   |
| `--destructive` / `--danger` | `#ef4444`                  | 关闭、删除等危险操作（保持红语义）         |
| `--ok`                       | `#86efac`                  | 成功态在深色底上略提亮，避免与酸绿完全混淆 |

**说明**: 参考图中的酸绿约为 `#A6CE39`；实现中取略亮一档 `#b4d83a` 以便与近黑背景组合时更易做 AA 大按钮对比，若验收偏「更黄绿」可再回调到 `#a6ce39` 并复测对比度。

### 2.1 参考图衍生 Token（设计稿已用 · Phase 1+ 可落库）

以下**不**要求与 `base.css` 同名覆盖；先在 `my-docs/U001_REFERENCE_MOCK.html`、`U001_EXAMPLE_MAIN_UI.html`、`U001_EXAMPLE_CONFIG_UI.html` 中以局部变量演示。若产品聊天与配置需要与静态稿对齐，再在 `theme-urban.css` / `theme-urban-chat.css` 中**新增**同名变量并接线组件。

| Token（建议名）                   | 参考值                                                                      | 语义                                                              |
| --------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `--urban-interaction-blue`        | `#3b82f6`                                                                   | 交互蓝：己方发出气泡、蓝框「多选回复 / 决策」外描边与标签色       |
| `--urban-interaction-blue-subtle` | 建议 `color-mix(in srgb, var(--urban-interaction-blue) 6–10%, var(--card))` | 蓝框容器弱底                                                      |
| `--urban-msg-incoming-bg`         | `#f4f4f5`                                                                   | 对方 / 助手消息气泡浅底（深色壳上形成对比）                       |
| `--urban-msg-incoming-fg`         | `#0a0a0a`                                                                   | 浅底气泡上的正文                                                  |
| `--urban-msg-outgoing-fg`         | `#ffffff`                                                                   | 蓝底气泡上的正文（与 `--urban-interaction-blue` 配对）            |
| `--urban-notif`                   | 对齐 `--danger` / `#ef4444`                                                 | Tab、侧栏项、会话行上的**红点通知**（与危险操作红语义一致时复用） |

**可访问性**：浅底气泡上的小字须满足对比度；蓝底白字在大块按钮/气泡上已易达标。通知点仅图标、需配合 `aria-label` / 列表项说明，避免单靠颜色传达唯一信息。

**运用面**：

- **主界面 / 聊天**：进浅 / 出蓝气泡、居中分割文案、蓝框 Quick reply；侧栏红点、底栏「日常信息」折叠意象见 `U001_EXAMPLE_MAIN_UI.html`。
- **配置**：顶栏 Tab / 侧栏项红点；蓝框 **Decision** 用于合并策略、冲突解决、危险确认等（非 IM 专属）见 `U001_EXAMPLE_CONFIG_UI.html`。

---

## 3. 颜色 Token 表（亮色 `urban-light`）

| Token                          | 参考值                | 语义                             |
| ------------------------------ | --------------------- | -------------------------------- |
| `--bg`                         | `#f4f4f5`             | 页面底                           |
| `--bg-elevated`                | `#ffffff`             | 卡片                             |
| `--text`                       | `#27272a`             | 正文                             |
| `--text-strong`                | `#18181b`             | 标题                             |
| `--border` / `--border-strong` | `#e4e4e7` / `#d4d4d8` | 边框层级                         |
| `--accent`                     | `#6b8e23`             | 亮底上略压暗的酸绿，保证文字对比 |
| `--primary-foreground`         | `#ffffff`             | 主按钮字色                       |
| `--ring`                       | `#6b8e23`             | 焦点                             |

---

## 4. 圆角与描边

| Token                         | 值                                         | 用途                                         |
| ----------------------------- | ------------------------------------------ | -------------------------------------------- |
| `--radius-full`               | `9999px`                                   | Pill 按钮、会话条（与现有一致）              |
| `--radius-lg` / `--radius-xl` | Phase 1 仍跟随全局 `borderRadius` 档位缩放 | 「敦实」大块面                               |
| `--border-width-strong`       | `2px`                                      | 都市机能粗描边（**新增**，默认主题可不引用） |

现有 `applyBorderRadius` 继续作用于 `--radius-*`；urban 不单独改缩放公式，除非 Phase 4 增加「机能预设」档位。

---

## 5. 字体策略（不引入大体积 Webfont）

| 决策    | 内容                                                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| 字栈    | 保持以 `Inter` 为首；追加 `ui-sans-serif, system-ui` 靠前兜底，保证无 Inter 时系统 UI 字体仍偏现代无衬线。 |
| 字重    | Phase 1+ 对聊天标题、会话名使用 `font-weight: 600`；正文 `400–500`。                                       |
| Webfont | Phase 0 **不**新增 Google Fonts 请求；若将来要「更圆」可再评估单一可变字体并单独任务。                     |

实现：`theme-urban.css` 内覆盖 `--font-body` / `--font-display`（见该文件注释）。

### 5.1 搭配与运用（Urban 与现有 UI 共用一套无衬线）

**原则**：Urban 的「机能感」主要靠**字重、字号阶梯、字间距**，而不是再叠第二种标题字体（避免与「不引入大体积 Webfont」冲突）。`--font-body` 与 `--font-display` 在 urban 下**同源**，通过层级区分角色即可。

| 层级                 | 典型用途                                    | 建议                                                                                                           | 说明                                                        |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Display / 页内大标题 | 页面标题、空状态主标题                      | `font-family: var(--font-display)`，`font-weight: 650–800`，`letter-spacing: -0.02em ~ -0.03em`                | 略紧字距让大块字更「整」；与粗描边块面配套                  |
| UI 标题 / 卡片标题   | 配置区块标题、侧栏品牌名、气泡旁名称        | `font-weight: 600–700`，字号比正文大 1–2 档                                                                    | 与 OpenClaw 现有 `.page-title`、`.card-title` 档位对齐      |
| 正文与列表           | 聊天内容、表单说明、内嵌说明区              | `font-weight: 400–500`，`line-height: 1.5–1.6`                                                                 | 中文与英文混排时避免全文加粗；长文不要用酸绿作字色          |
| 次要 / 元信息        | 时间戳、版本号、`kbd`、表格次要列           | `font-weight: 400–500`，`color: var(--muted)`，可选 `font-size` 略小                                           | 与 `--text` / `--text-strong` 对比清晰即可                  |
| 全大写分组标签       | 侧栏 `nav-section` 类标签、设置分组 eyebrow | `text-transform: uppercase` 或保持中文小标题，`font-weight: 700`，`letter-spacing: 0.06em–0.1em`（英文更适用） | 中文不必硬 uppercase；用字重 + 小字号区分即可               |
| 按钮字               | 主按钮（酸绿底）                            | `font-weight: 600–700`，`color: var(--primary-foreground)`                                                     | 保证对比度；与 `theme-urban` 的 `--primary-foreground` 一致 |
| 等宽                 | 代码、Raw JSON、日志片段                    | 沿用全局等宽栈（若有）；**不要**用等宽做 UI 标题                                                               | 机能风不等于「全盘终端字体」                                |

**中文与系统字体**：无额外 Webfont 时，中文会由 `system-ui` / `-apple-system` 等回退到系统黑体（如 macOS 苹方、Windows 雅黑）。与 Inter 混排时，保持**同一 `font-family` 栈**即可，无需为 Urban 单独拆一套「中文字体变量」，除非后续任务要统一 CJK 度量。

**与参考 HTML 的关系**：`my-docs/U001_URBAN_BLOCKS_REFERENCE.html` 内有「字体层级」可视化样例，可与本节对照。

---

## 6. 组件映射（Phase 1+ 落地 checklist）

以下类名来自现有 `components.css` / `chat/*.css`，本阶段只约定**语义**，不强制改样式。

| 组件                                                | 目标效果                                                                | 主要选择器 / 变量                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 主按钮 `.btn.primary`                               | 酸绿面 + 深色字                                                         | `background: var(--accent)`, `color: var(--primary-foreground)`            |
| 幽灵按钮 `.btn--ghost`                              | 透明 + `--border-strong` 2px                                            | `border-width` + `urban` 下加粗                                            |
| 图标按钮 `.btn--icon` / `.chat-controls .btn--icon` | 选中态酸绿底/环                                                         | 已有 `.active`，Phase 1 提高对比                                           |
| 会话列表项                                          | 选中：左侧酸绿条或整行 `--accent-subtle` 底                             | `theme-urban-chat.css`（聊天侧栏）；应用主导航行见 `theme-urban-shell.css` |
| 输入框 `textarea` / `.field input`                  | 默认 `--border-strong`；`focus-visible` 用 `--ring`                     | `config.css` / `components.css`                                            |
| 通知点（Tab / 导航 / 会话行）                       | 圆角胶囊 + `--urban-notif`（或 `--danger`）描边隔离深色底               | 父级 `position: relative`；静态类名参考稿：`.notif-badge`                  |
| 对方 / 助手消息气泡                                 | 浅底 `--urban-msg-incoming-bg` + 深字 `--urban-msg-incoming-fg`         | `theme-urban-chat.css` 内气泡变体；与深灰「卡片气泡」二选一产品定调        |
| 己方消息气泡                                        | `--urban-interaction-blue` 底 + `--urban-msg-outgoing-fg`               | 与酸绿主按钮区分角色：蓝=会话内「我方」、绿=全局主 CTA                     |
| 蓝框多选区（Quick reply / Decision）                | 外框 `3px solid var(--urban-interaction-blue)`；选项钮浅底 + `2px` 蓝边 | 聊天用快捷回复；配置用决策条，共用同一套 Token                             |
| 线程分割（如「以上为最新」）                        | 居中、`color: var(--muted)`、小字号加字距                               | 可选；不替代时间戳，仅作滚动锚点或状态提示                                 |
| 侧栏底栏折叠入口（「日常信息」意象）                | 全宽 pill、近黑底、与 `sidebar-footer` 区隔                             | Shell 可选；配置与主界面可参考 `U001_EXAMPLE_*`                            |

---

## 7. 可选装饰（Phase 1 末尾）

| 装饰 | 实现思路                                                      | 默认 |
| ---- | ------------------------------------------------------------- | ---- |
| 斜纹 | `repeating-linear-gradient` 极低透明度铺在 `.agent-chat` 容器 | 关   |
| 网点 | `radial-gradient` 点阵 `background-size` 8–12px               | 关   |

通过 `--urban-decor-opacity: 0` 默认关闭，Phase 1 可接 `data-urban-decor="1"` 实验。

---

## 8. 如何预览（Phase 1 接线前）

在开发者工具将 `document.documentElement.dataset.theme` 设为 `urban` 或 `urban-light` 可预览 CSS；**注意**：应用若在运行中会按设置写回 `dataset.theme`，仅适合本地静态验证。正式切换需在 **Phase 1** 扩展 `ui/src/ui/theme.ts` 的 `ThemeName` / `ResolvedTheme` 与外观设置项。

**静态参考页（字体 + 布局 + 组件块）**：

- [U001_REFERENCE_MOCK.html](U001_REFERENCE_MOCK.html) — 单窗意象稿（含：红点 Tab/会话行、进浅/出蓝气泡、居中分割、蓝框 Reply、日常信息底栏）
- [U001_OPENCLAW_LAYOUT_MOCK.html](U001_OPENCLAW_LAYOUT_MOCK.html) — OpenClaw shell 效果图（聊天）
- [U001_EXAMPLE_MAIN_UI.html](U001_EXAMPLE_MAIN_UI.html) — **主界面示例（整合版**：Display 标题、chip 会话条、进浅/出蓝气泡、Quick reply 蓝框、侧栏红点与底栏）
- [U001_EXAMPLE_CONFIG_UI.html](U001_EXAMPLE_CONFIG_UI.html) — **配置页示例**（`config-layout` / `config-section-card`、顶栏/侧栏红点、Decision 蓝框、底栏意象）
- [U001_URBAN_BLOCKS_REFERENCE.html](U001_URBAN_BLOCKS_REFERENCE.html) — 机能块 + 字体层级样例

---

## 9. 验收（Phase 0）

- [x] Token 表、§2.1 参考图衍生 Token、§6 组件映射（含通知点、进浅/出蓝气泡、蓝框多选、线程分割、侧栏底栏）已写入本文档；衍生变量在 `theme-urban*.css` 落库归 Phase 1+。
- [x] `ui/src/styles/theme-urban.css` 实现 `urban` / `urban-light` 变量覆盖并已加入 `ui/src/styles.css` 引用链。
- [x] Phase 1：`theme.ts` 注册 `urban`；外观设置可选；`theme-urban-chat.css` 使用 `--border-width-strong` 等于粗描边。
- [x] Phase 2：`theme-urban-shell.css` 覆盖应用壳 `shell-nav` / `topbar` / 侧栏 `nav-item` 与移动端控制条，并已加入 `ui/src/styles.css` 引用链。

---

_文档版本_: v1.5 · 2025-03-27
