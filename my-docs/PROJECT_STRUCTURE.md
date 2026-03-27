# OpenClaw 工程结构文档

本文档描述 OpenClaw 项目的整体架构、目录结构和核心模块功能。

> 本文档位于 `my-docs/` 目录，由任务 D001 生成。

---

## 1. 项目概述

**OpenClaw** 是个人 AI 助手，可在自有设备上运行。通过 WhatsApp、Telegram、Slack、Discord、Signal、iMessage 等多种渠道收发消息，支持 macOS/iOS/Android 语音，含 Gateway 控制面与 Canvas 等能力。

- **版本**: 2026.3.25
- **技术栈**: TypeScript (ESM), Node 22+, Swift, Kotlin
- **包管理**: pnpm 10.32.1
- **构建工具**: tsdown, Vite
- **测试框架**: Vitest

---

## 2. 根目录结构

```
openclaw/
├── src/                    # 核心 TypeScript 源码
├── ui/                     # Web 控制界面 (Lit + Vite)
├── apps/                   # 移动端应用 (iOS/macOS/Android)
├── extensions/             # 插件/通道扩展
├── packages/               # 共享 npm 包
├── scripts/                # 构建与工具脚本
├── docs/                   # 项目官方文档
├── my-docs/                # 本任务生成的文档
├── test/                   # 测试文件
├── assets/                 # 静态资源
├── Swabble/                # 语音/UI 共享库
├── vendor/                 # 第三方依赖
├── package.json            # 根包配置
├── pnpm-workspace.yaml     # pnpm 工作区配置
└── ...                     # 配置文件
```

---

## 3. 核心模块详解

### 3.1 src/ - 核心源代码

核心 TypeScript 源码主树，约 2000+ 文件。

| 目录          | 功能说明                                                                |
| ------------- | ----------------------------------------------------------------------- |
| `cli/`        | Commander 程序装配、各子命令注册、懒加载                                |
| `commands/`   | CLI 对应的业务逻辑实现 (doctor, configure, status, channels, agents 等) |
| `config/`     | 配置读写、schema、合并与校验                                            |
| `gateway/`    | WebSocket 网关实现                                                      |
| `channels/`   | 消息通道抽象与管理 (Telegram, Discord, WhatsApp 等)                     |
| `routing/`    | 消息路由系统                                                            |
| `pairing/`    | 设备配对与安全 DM 配对                                                  |
| `agents/`     | Agent 执行与管理工作流                                                  |
| `sessions/`   | 会话管理                                                                |
| `memory/`     | 记忆系统                                                                |
| `plugins/`    | 插件加载与注册                                                          |
| `plugin-sdk/` | 插件开发 SDK                                                            |
| `infra/`      | 基础设施 (环境、进程管理)                                               |
| `media/`      | 媒体处理管道                                                            |
| `browser/`    | Playwright 浏览器自动化                                                 |
| `cron/`       | 定时任务调度                                                            |
| `i18n/`       | 国际化支持                                                              |
| `security/`   | 安全工具与审计                                                          |
| `logging/`    | 日志系统                                                                |
| `terminal/`   | CLI 终端表格与格式化输出                                                |

#### 主要 CLI 命令

| 命令                 | 功能                            |
| -------------------- | ------------------------------- |
| `openclaw onboard`   | 交互式引导 (网关、工作区、技能) |
| `openclaw configure` | 交互式配置凭证、通道、网关      |
| `openclaw gateway`   | 运行、检查 WebSocket Gateway    |
| `openclaw channels`  | 管理已连接聊天通道              |
| `openclaw agents`    | 管理多 agent                    |
| `openclaw status`    | 通道健康与收件人摘要            |
| `openclaw doctor`    | 健康检查与快速修复              |
| `openclaw message`   | 发送、读取、管理消息            |
| `openclaw skills`    | 列出、搜索、安装、检查 skills   |

### 3.2 ui/ - Web 控制界面

基于 **Lit** 的 SPA，**Vite** 打包。

| 目录/文件              | 说明                            |
| ---------------------- | ------------------------------- |
| `src/main.ts`          | 应用入口                        |
| `src/ui/app.ts`        | Lit 根组件                      |
| `src/ui/app-render.ts` | 主渲染与按 tab 分支             |
| `src/ui/views/`        | 各页面视图 (~68 个文件)         |
| `src/ui/chat/`         | 会话与消息组件                  |
| `src/ui/controllers/`  | 与网关/配置交互的数据层         |
| `src/i18n/`            | 国际化支持 (含 zh-CN, zh-TW 等) |

#### 主要视图模块

| 视图                | 功能               |
| ------------------- | ------------------ |
| `views/chat.ts`     | 主聊天界面         |
| `views/overview.ts` | 总览仪表盘         |
| `views/channels.ts` | 各通道状态与配置   |
| `views/agents.ts`   | Agent 管理多面板   |
| `views/skills.ts`   | Skills 列表/分组   |
| `views/config.ts`   | 配置编辑界面       |
| `views/usage.ts`    | 用量/计费展示      |
| `views/cron.ts`     | 定时任务管理       |
| `views/sessions.ts` | 会话列表与管理     |
| `views/nodes.ts`    | 节点视图与设备管理 |
| `views/debug.ts`    | 调试信息           |
| `views/logs.ts`     | 日志查看           |

### 3.3 apps/ - 移动端应用

| 平台        | 目录                       | 技术栈                          | 说明                                          |
| ----------- | -------------------------- | ------------------------------- | --------------------------------------------- |
| **macOS**   | `apps/macos/`              | SwiftPM, Swift 6.2              | 菜单栏应用，产物: OpenClaw, openclaw-mac CLI  |
| **iOS**     | `apps/ios/`                | XcodeGen, Swift                 | iOS 主应用，需 `xcodegen generate` 生成工程   |
| **Android** | `apps/android/`            | Gradle, Kotlin, Jetpack Compose | Android 应用，productFlavors: play/thirdParty |
| **共享**    | `apps/shared/OpenClawKit/` | SwiftPM                         | 跨 Apple 平台共享 Swift 包                    |

#### macOS 架构

```
apps/macos/
├── Package.swift           # SwiftPM 配置
├── Sources/
│   ├── OpenClaw/          # 应用主体 (菜单栏)
│   ├── OpenClawIPC/       # 进程间通信
│   ├── OpenClawDiscovery/ # 网关发现
│   └── OpenClawMacCLI/    # CLI 入口
└── Tests/
```

#### iOS 架构

```
apps/ios/
├── project.yml             # XcodeGen 配置
├── Sources/
│   ├── Gateway/           # 网关会话
│   ├── Chat/              # 聊天界面
│   ├── Onboarding/        # 引导流程
│   ├── Settings/          # 设置界面
│   ├── Device/            # 设备管理
│   └── ...
├── ShareExtension/        # 分享扩展
├── ActivityWidget/        # 活动小组件
├── WatchApp/              # Watch 应用
└── Tests/
```

#### Android 架构

```
apps/android/
├── settings.gradle.kts
├── build.gradle.kts
├── app/
│   ├── build.gradle.kts
│   └── src/main/java/ai/openclaw/app/
│       ├── gateway/       # 网关会话、协议、TLS
│       ├── node/          # 能力 handler (相机、日历等)
│       ├── ui/            # Compose 界面
│       ├── chat/          # 聊天控制器
│       ├── protocol/      # 协议定义
│       └── voice/         # 语音/Talk
└── benchmark/             # 性能测试
```

### 3.4 extensions/ - 插件扩展

工作区插件目录，每个扩展是独立 npm 包。

```
extensions/
├── telegram/              # Telegram 通道插件
├── discord/               # Discord 通道插件
├── slack/                 # Slack 通道插件
├── whatsapp/              # WhatsApp 通道插件
├── signal/                # Signal 通道插件
├── imessage/              # iMessage 通道插件
├── zalo/                  # Zalo 通道插件
├── voice-call/            # 语音通话插件
├── ...
```

**插件结构**: 每个插件包含 `openclaw.plugin.json` 描述能力，`package.json` 中 `openclaw.*` 字段定义入口、通道配置等。

### 3.5 packages/ - 共享 npm 包

```
packages/
└── workspace-data/        # 多技能数据共享包
    ├── package.json
    ├── README.md
    └── src/
        ├── config-database.js
        ├── config-schema.sql
        └── workspace-store.js
```

### 3.6 docs/ - 项目官方文档

```
docs/
├── channels/              # 通道文档
├── gateway/               # 网关文档
├── help/                  # 帮助文档
├── install/               # 安装指南
├── plugins/               # 插件开发文档
└── zh-CN/                 # 中文翻译文档 (自动生成)
```

### 3.7 my-docs/ - 本任务生成的文档

```
my-docs/
├── TASKS.md               # 任务驱动表
├── PLANS.md               # 任务执行计划
└── PROJECT_STRUCTURE.md   # 本文件 - 工程结构文档
```

### 3.8 scripts/ - 工具脚本

```
scripts/
├── tsdown-build.mjs       # 构建脚本
├── test-parallel.mjs      # 并行测试
├── committer              # 提交工具
├── package-mac-app.sh     # macOS 打包
├── restart-mac.sh         # macOS 重启
└── clawlog.sh             # macOS 日志查询
```

---

## 4. 技术栈汇总

### 4.1 核心运行时

| 技术             | 用途         |
| ---------------- | ------------ |
| Node.js 22+      | 服务端运行时 |
| TypeScript (ESM) | 主要开发语言 |
| pnpm 10.32.1     | 包管理器     |

### 4.2 构建与开发

| 技术           | 用途             |
| -------------- | ---------------- |
| tsdown         | TypeScript 构建  |
| Vite           | Web UI 构建      |
| Vitest         | 测试框架         |
| Oxlint / Oxfmt | 代码检查与格式化 |

### 4.3 核心依赖

| 技术           | 用途         |
| -------------- | ------------ |
| Express / Hono | HTTP 服务    |
| Zod / Ajv      | Schema 校验  |
| Playwright     | 浏览器自动化 |
| ws             | WebSocket    |
| sharp          | 图像处理     |
| commander      | CLI 框架     |

### 4.4 AI 与 Agent

| 技术                        | 用途       |
| --------------------------- | ---------- |
| @mariozechner/pi-agent-core | Agent 核心 |
| @modelcontextprotocol/sdk   | MCP 协议   |
| @agentclientprotocol/sdk    | ACP 协议   |

### 4.5 移动端

| 平台      | 技术                                |
| --------- | ----------------------------------- |
| iOS/macOS | Swift 6.2, SwiftPM, XcodeGen        |
| Android   | Kotlin 2.2, Gradle, Jetpack Compose |

### 4.6 Web UI

| 技术      | 用途          |
| --------- | ------------- |
| Lit       | 组件框架      |
| Vite      | 构建工具      |
| marked    | Markdown 渲染 |
| DOMPurify | HTML 净化     |

---

## 5. 工作流程

### 5.1 开发工作流

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev              # 或 pnpm openclaw

# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm check
```

### 5.2 常用命令

```bash
# 网关开发
pnpm gateway:watch

# UI 开发
pnpm ui:dev
pnpm ui:build

# macOS 打包
scripts/package-mac-app.sh
```

---

## 6. 关键文件索引

### 项目官方文档

| 文件                      | 说明               |
| ------------------------- | ------------------ |
| `README.md`               | 项目简介与快速开始 |
| `CLAUDE.md` / `AGENTS.md` | 工程规范与代理指南 |
| `package.json`            | 根包配置与 scripts |
| `pnpm-workspace.yaml`     | 工作区配置         |
| `tsconfig.json`           | TypeScript 配置    |

### 本任务生成文档

| 文件                           | 说明         |
| ------------------------------ | ------------ |
| `my-docs/TASKS.md`             | 任务驱动表   |
| `my-docs/PLANS.md`             | 任务执行计划 |
| `my-docs/PROJECT_STRUCTURE.md` | 工程结构文档 |

---

_文档版本_: v1.0
_最后更新_: 2026-03-27
_生成任务_: D001
