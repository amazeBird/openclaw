# U001 迁移 — 文件 triage 清单

**执行方案**：`my-docs/X007_UPSTREAM_BASED_MIGRATION_PLAN.md`  
**迁移线分支**：`migrate/u001-from-upstream`（跟踪官方树）  
**冻结对照标签**：`archive/feat-u001-pre-upstream-20260430` → `feat/u001-urban-ui-theme` @ `c8b7dc4401`

---

## 1. 基线记录（阶段 A）

| 项 | 值 |
|----|-----|
| **迁移线 `HEAD`（官方）** | `cf772079c6` — `fix(browser): share control runtime state` |
| **`feat/u001-urban-ui-theme` tip** | `c8b7dc4401` — `fix(deepseek): match transcript provider deepseek-chat in pi-ai patch` |
| **本机 Node** | `v20.18.0`（**低于** 仓库 `engines` 与 `rolldown` 要求，见下） |
| **推荐工具链** | `package.json` → `packageManager`: **pnpm@10.33.2**；Node **>= 22.14.0**（或满足 `rolldown` 的 `^20.19.0 \|\| >=22.12.0`） |
| **`pnpm install`** | 已用 `npx pnpm@10.33.2 install` + 上游 `pnpm-lock.yaml` 完成安装 |
| **根目录 `pnpm test`** | **未跑**（建议 Node 升级后再跑） |
| **`pnpm --dir ui test`** | **当前失败**：`@rolldown/binding-darwin-arm64` 未安装；根因是 **Node 20.18 < 20.19**，可选原生绑定被跳过 |

### 阶段 A 未完成项（环境）

1. 将本机 Node 升到 **22.14+**（或至少 **20.19+**），在项目根执行：

   ```bash
   npx --yes pnpm@10.33.2 install
   npx --yes pnpm@10.33.2 --dir ui test
   npx --yes pnpm@10.33.2 test
   ```

2. 通过后把结果补记到本节（通过 / 失败日志路径）。

### 工作区说明

- 开始执行前，原 `feat/u001-urban-ui-theme` 上的未提交改动已 **`git stash`**（含未跟踪文件）；回到该分支后执行 **`git stash pop`** 取回。
- 当前检出：**`migrate/u001-from-upstream`**。

---

## 2. 阶段 B — `ui/` 相对官方的差异统计

**对比命令**：`git diff upstream/main feat/u001-urban-ui-theme --name-status -- ui/`

| 状态 | 数量 | 含义 |
|------|------|------|
| `M` | 187 | 同路径内容不同 → 需逐文件 port 或丢弃 |
| `D` | 175 | 官方有、旧 feature 侧无（或删除）→ **迁移线必须保留官方文件** |
| `A` | 18 | 旧 feature 相对官方新增 → 多为品牌/主题资源，评估 port |

**原始清单文件**（便于检索，勿手改）：

- `my-docs/_tmp_ui_diff_name_status.txt`
- `my-docs/_tmp_ui_paths.txt`

---

## 3. Urban 优先 port 表（手工填「动作」）

在下表 **`动作`** 列填写：`port` | `drop` | `upstream`（已由上游覆盖或替代）| `待定`。

| 路径（旧 `feat/` 参考） | 动作 | 备注 |
|-------------------------|------|------|
| `ui/src/styles/theme-urban.css` | | |
| `ui/src/styles/theme-urban-shell.css` | | |
| `ui/src/styles/theme-urban-chat.css` | | |
| `ui/src/styles/theme-urban-config.css` | | |
| `ui/src/ui/theme.ts` | | 与上游 `theme.ts` **合并**枚举，勿整文件覆盖 |
| `ui/src/styles.css` | | 仅追加 `@import` |
| `ui/index.html` | | 首屏主题 / `localStorage` 与 `theme.ts` 一致 |
| `ui/src/ui/storage.ts` | | 默认主题是否与上游对齐，再决定是否默认 Urban |
| `ui/src/ui/views/chat.ts` | | 按上游 DOM 对齐选择器 |
| `ui/src/ui/chat/grouped-render.ts` | | |
| `ui/src/ui/views/config.ts` | | 设置页主题选项 |
| `ui/src/ui/views/agents-utils.ts` | | 默认头像等 |
| `ui/src/ui/app-render.ts` / `app-render.helpers.ts` | | |
| `ui/src/ui/app-gateway.ts` | | **谨慎**：协议须与官方网关一致 |
| `ui/public/` 品牌资源 | | |

（其余路径以 `_tmp_ui_diff_name_status.txt` 为准逐行 triage。）

---

## 4. 下一步（阶段 C）

在 **§1 环境项通过** 后：

1. 在 `migrate/u001-from-upstream` 上从 §3 的 **四个 `theme-urban*.css`** 与 **`theme.ts`** 开始提交第一个 PR/commit。
2. 每步 **`pnpm --dir ui test`** 必须通过再合并下一阶段。

---

*本文档随迁移推进更新；临时 diff 文件可在 triage 完成后删除或移出仓库。*
