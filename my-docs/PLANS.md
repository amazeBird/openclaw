# PLANS.md - 任务执行计划文档

本文档存放各任务的详细执行计划、技术方案和验收标准。

> 与 TASKS.md 的关系：TASKS.md 记录任务状态和结果，PLANS.md 记录详细执行方案。

---

## 计划 1: 视图层英文替换为中文

**关联任务**: L001（TASKS.md）
**创建时间**: 2026-03-27
**最后更新**: 2026-03-27

---

### 概述

将项目所有视图层代码中的英文界面文本替换为中文。

**涉及目录**:

- `ui/src/ui/views/` - Web UI 视图层（TypeScript，约 68 个文件）
- `apps/macos/Sources/OpenClaw/` - macOS SwiftUI 视图
- `apps/ios/Sources/` - iOS SwiftUI 视图
- `apps/android/app/src/main/java/ai/openclaw/app/ui/` - Android Kotlin UI

---

### Phase 1: Web UI 层（ui/src/ui/views/）

#### 步骤 1.1: 扫描并提取所有英文文本

- 遍历 `ui/src/ui/views/` 目录下的所有 `.ts` 文件
- 识别所有硬编码的英文字符串（按钮文本、标签、提示信息等）
- 整理成待翻译列表
- **预计耗时**: 3 小时

#### 步骤 1.2: 建立国际化（i18n）基础架构

- 评估现有项目是否已有 i18n 方案
- 如无，选择并集成 i18n 库（如 react-i18next 或自定义方案）
- 创建中文语言包文件
- **预计耗时**: 4 小时

#### 步骤 1.3: 替换英文为中文（分批进行）

按功能模块分批替换：

- [ ] channels 相关视图
- [ ] agents 相关视图
- [ ] chat 相关视图
- [ ] config 相关视图
- [ ] overview 相关视图
- [ ] usage/sessions/logs 等其他视图
- **预计耗时**: 6 小时

#### 步骤 1.4: 测试验证

- 运行 Web UI 测试确保无破坏
- 人工检查关键页面显示
- **预计耗时**: 2 小时

---

### Phase 2: macOS UI 层（apps/macos/Sources/OpenClaw/）

#### 步骤 2.1: 扫描并提取 SwiftUI 中的英文文本

- 识别 `.swift` 文件中的 `Text()`、`Button()` 等组件中的硬编码英文
- **预计耗时**: 2 小时

#### 步骤 2.2: 集成 iOS/macOS 国际化方案

- 创建 `Localizable.strings` 文件
- 使用 `NSLocalizedString` 或 SwiftUI `LocalizedStringKey`
- **预计耗时**: 2 小时

#### 步骤 2.3: 替换并测试

- **预计耗时**: 2 小时

---

### Phase 3: iOS UI 层（apps/ios/Sources/）

#### 步骤 3.1-3.3: 同 Phase 2 流程

- **预计耗时**: 4 小时

---

### Phase 4: Android UI 层（apps/android/）

#### 步骤 4.1-4.3: 同 Phase 2 流程

- 使用 Android 的 `strings.xml` 资源文件
- **预计耗时**: 3 小时

---

### 技术方案

#### 方案选择

推荐采用**运行时国际化（i18n）方案**，而非直接硬编码替换：

**原因**:

1. 便于后续维护和多语言扩展
2. 避免破坏现有英文用户的体验（可考虑支持语言切换）
3. 代码结构更清晰，文本集中管理

**技术选型**:

| 平台                | 推荐方案                                           |
| ------------------- | -------------------------------------------------- |
| Web UI (TypeScript) | 如已有方案沿用，如无则使用 react-i18next / i18next |
| macOS/iOS (Swift)   | 使用 `Localizable.strings` + `NSLocalizedString`   |
| Android (Kotlin)    | 使用 `res/values-zh/strings.xml`                   |

---

### 验收标准

- [ ] 所有用户可见的英文界面文本已替换为中文
- [ ] 代码通过 lint 检查（`pnpm check`）
- [ ] Web UI 测试通过（`pnpm test` 相关视图测试）
- [ ] 各平台应用可正常编译运行
- [ ] 关键页面人工检查无乱码或显示异常

---

### 执行记录

| 日期       | 步骤        | 状态     | 产出物                                                               | 备注                       |
| ---------- | ----------- | -------- | -------------------------------------------------------------------- | -------------------------- |
| 2026-03-27 | 计划 2 实施 | ✅已完成 | `config.*` i18n；`getConfigSectionMeta`；`config.fieldMeta`（zh-CN） | 见 `my-docs/TASKS.md` L002 |

---

## 计划 2: Web UI 配置页（Schema 表单）中英文化

**关联任务**: L002（`my-docs/TASKS.md`）  
**创建时间**: 2026-03-27

### 问题

配置页（`openclaw.json` 表单）在界面语言为简体中文时，区块标题、子标签、字段标题与说明仍为英文。

### 技术拆分

**A. 静态 UI（优先）**

- `ui/src/ui/views/config-form.render.ts`：`SECTION_META` 各 `label` / `description` 改为 `t("config.sections.*")`（键名在 `zh-CN.ts` / `en.ts` 定义）。
- `ui/src/ui/views/config.ts`：Settings / Environment / Authentication / Updates 等子标签同上。
- 同目录下其他固定英文（如工具栏 Form / Raw、No changes、Search settings…）逐项接入 i18n。

**B. Schema 动态字段（工作量较大）**

- `ui/src/ui/views/config-form.node.ts`：`resolveFieldMeta` 当前使用 `schema.title`、`schema.description`。
- 可选路径：
  1. **路径映射表**：以 JSON Pointer 或 `path.join(".")` 为键，在 `zh-CN` 提供覆盖文案；
  2. **网关 `uiHints` 扩展**：按 `locale` 返回 `label`/`help`（需网关与协议约定）；
  3. **上游**：配置 schema 生成管道支持多语言（与 `src/config/schema.help` 等联动，影响面最大）。

建议先完成 A，再按优先级对 B 做「高频配置项」映射或分批全量。

### 验收

- 中文 locale 下配置页静态文案为中文；字段级至少有一致策略与样例段落（如 `update.*`）可演示。

---

## 计划 3: 全工程安全漏洞与风险排查

**关联任务**: S001（`my-docs/TASKS.md`）  
**创建时间**: 2026-03-27  
**产出文档**: `my-docs/SECURITY_AUDIT.md`（第一轮排查开始时创建；每阶段结束后追加修订记录）

### 目标

对当前仓库做一次**可复现、可分阶段**的安全与风险梳理，并把结论写入 `SECURITY_AUDIT.md`，便于后续迭代与对照上游 OpenClaw 安全策略。

### 原则

1. **只读优先**: 先盘点与记录，再按优先级提修复；不擅自修改 `CODEOWNERS` 等受控路径（见仓库 `AGENTS.md` / `CLAUDE.md`）。
2. **分阶段交付**: 每一阶段结束即可归档该段结论到 `SECURITY_AUDIT.md`，不必等全工程一次做完。
3. **与上游区分**: 本仓库若为 fork/定制，审计结论注明是否已同步上游修复；严重漏洞遵循官方披露流程，不单依赖本地文档。

### Phase 1 — 依赖与供应链

- 运行并记录：`pnpm audit`（及各 workspace 如有单独审计需求则注明）。
- 清点 `pnpm.patchedDependencies`、锁文件策略、可重复安装风险。
- **产出**: `SECURITY_AUDIT.md` 中「依赖」小节 + 命令与日期。

### Phase 2 — 密钥、凭证与敏感数据

- 规则扫描 + 抽样：环境变量名、日志、`docs/` / `README` 示例是否含真实形态秘密。
- 对照工程规范中的路径提示（如 `~/.openclaw/`）是否在错误输出中过度暴露。
- **产出**: 发现表（位置、类型、建议）。

### Phase 3 — 网关、控制面与 Agent 工具边界

- 梳理 `src/` 中与 gateway 绑定、鉴权、会话、工具执行相关的入口；记录信任边界与已知硬编码/默认行为风险。
- **产出**: 威胁模型简述（一两页内）+ 高风险点列表。

### Phase 4 — 消息通道与插件（`extensions/*` + 内置通道）

- 路由、配对、allowlist、命令门控；不可信消息输入的处理方式。
- **产出**: 按通道/插件列表示险点与缓解状态。

### Phase 5 — Web UI（`ui/`）

- 与网关的通信、敏感配置展示、XSS/注入面（按实际技术栈逐项勾选）。
- **产出**: UI 专项小节。

### Phase 6 — 移动端（`apps/macos`、`apps/ios`、`apps/android`）

- 凭证存储（Keychain/Keystore 等）、ATS/网络安全、深度链接若存在则纳入。
- **产出**: 客户端专项小节。

### Phase 7 — CI、脚本与发布链路（只读审计）

- `scripts/`、`.github/workflows`：秘密使用、权限最小化、第三方 Action 钉版本情况。
- **产出**: CI/脚本小节；若需改 workflow，单独列变更建议，不混在「记录」与「修复」之间。

### 验收（计划 3 / S001）

- [x] `my-docs/SECURITY_AUDIT.md` 已创建且包含 Phase 1–7 对应章节（可为「暂无发现」但需写明检查方法）。
- [x] 每阶段标注执行日期与主要命令或阅读范围。
- [x] `my-docs/TASKS.md` 中 S001 状态与产出链接已更新为完成或明确暂停原因。

### 执行记录（计划 3）

| 日期       | 阶段    | 状态     | 产出 / 备注                                                                                 |
| ---------- | ------- | -------- | ------------------------------------------------------------------------------------------- |
| 2026-03-27 | Phase 1 | ✅已记录 | `pnpm audit --json`：0 advisory；`SECURITY_AUDIT.md` §0 速查 + §1 结论；S001 状态改为进行中 |
| 2026-03-27 | Phase 2 | ✅已记录 | 静态密钥检索；§0.4 敏感数据速查；§2；S001-P2-01/02（CI/docs 与 detect-secrets 一致性）      |
| 2026-03-27 | Phase 3 | ✅已记录 | §0.5 网关速查；§3；S001-P3-01/02（loopback 回退、auth mode none）                           |
| 2026-03-27 | Phase 4 | ✅已记录 | §0.6 通道/插件速查；§4；S001-P4-01（useAccessGroups off + 默认 allow）                      |
| 2026-03-27 | Phase 5 | ✅已记录 | §0.7 Web UI 速查；§5；S001-P5-01/02（无 CSP、恶意网关 URL 钓鱼面）                          |
| 2026-03-27 | Phase 6 | ✅已记录 | §0.8 移动端速查；§6；S001-P6-01（cleartext + ATS Web 放宽）                                 |
| 2026-03-27 | Phase 7 | ✅已记录 | §0.9 CI/脚本速查；§7；S001-P7-01（curl main 脚本）；S001 **已完成**                         |

---

_文档版本_: v1.9
