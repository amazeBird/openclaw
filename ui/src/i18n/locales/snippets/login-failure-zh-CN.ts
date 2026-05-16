/** Simplified Chinese for `login.failure.*`. */
export const loginFailureStringsZhCN = {
  rawError: "原始错误",
  docsAuth: "控制界面认证文档",
  docsInsecure: "控制界面不安全 HTTP 文档",
  docsPairing: "设备配对文档",
  network: {
    title: "无法连接到 Gateway",
    summary:
      "未能建立 WebSocket。请确认 Gateway 已启动，且地址与当前安装一致。",
    stepGateway: "用 openclaw status 或 openclaw gateway run 确认 Gateway 在运行。",
    stepUrl: "检查 WebSocket 地址；若 Gateway 在 HTTPS/Tailscale Serve 之后，请使用 wss://。",
    stepDashboard:
      "用 openclaw dashboard --no-open 重新打开仪表盘并复制当前 URL 与认证信息。",
  },
  authRequired: {
    title: "需要认证",
    summary: "Gateway 可达，但需要匹配的令牌或密码后本浏览器才能连接。",
    stepPaste: "粘贴 openclaw dashboard --no-open 中的令牌，或输入已配置的密码。",
    stepGenerate: "若未配置令牌，请在 Gateway 主机运行 openclaw doctor --generate-gateway-token。",
    stepConnect: "更新凭据后再次点击连接。",
  },
  authFailed: {
    title: "认证失败",
    summary:
      "凭据被拒绝。常见原因是令牌过期，或从其他 Gateway URL 复制了令牌。",
    stepDashboard: "运行 openclaw dashboard --no-open，打开新 URL 或粘贴其中的令牌。",
    stepReplace: "替换过期的令牌/密码；不要复用其他 Gateway URL 的令牌。",
    stepMode: "一次只使用一种匹配模式：令牌模式用 gateway token，密码模式用 password。",
  },
  rateLimited: {
    title: "失败次数过多",
    summary: "多次认证失败后 Gateway 暂时阻止登录，请稍候再试。",
    stepStop: "请暂时不要在本标签页继续重试。",
    stepWait: "等待限流恢复后，使用正确凭据重新连接。",
    stepCheckClients: "若是共享主机，请检查其他客户端是否在反复错误重试。",
  },
  pairing: {
    scopeTitle: "权限范围升级待批准",
    roleTitle: "角色升级待批准",
    metadataTitle: "设备元数据升级待批准",
    title: "需要设备配对",
    summary: "此 Gateway 需要先批准本浏览器才能连接。",
    upgradeSummary: "本浏览器已登记，但请求的访问范围已变更，需要重新批准。",
    stepList: "在 Gateway 主机运行 openclaw devices list。",
    stepApprove: "在 Gateway 主机批准待处理请求（从 openclaw devices list 获取 request id）。",
    stepApproveId: "批准此请求：openclaw devices approve {requestId}。",
    stepReconnect: "批准完成后重新连接。",
  },
  insecure: {
    title: "不安全连接",
    summary: "设备身份或浏览器安全策略阻止了通过明文 HTTP 的连接。",
    stepHttps: "使用 HTTPS/Tailscale Serve，或在 Gateway 主机打开 http://127.0.0.1:18789。",
    stepLocalCompat: "若仅需本地令牌兼容，可设置 gateway.controlUi.allowInsecureAuth: true。",
    stepAvoidDisable: "不要在远程 HTTP 访问场景下关闭设备认证。",
  },
  origin: {
    title: "来源不被允许",
    summary: "Gateway 拒绝了此控制界面的来源。",
    stepAllowedOrigins: "将本浏览器来源加入 gateway.controlUi.allowedOrigins。",
    stepFullOrigin: "使用完整来源，例如 http://localhost:5173，不要使用通配符。",
    stepRestart: "修改允许来源后重启或重载 Gateway。",
  },
  protocol: {
    title: "协议不匹配",
    summary: "当前提供的控制界面与运行中的 Gateway 在连接协议上不一致。",
    stepDashboard: "使用 openclaw dashboard 打开内置仪表盘，使 UI 与 Gateway 来自同一安装。",
    stepDevUi: "若使用 pnpm ui:dev，请针对当前 checkout 重新构建或重启开发 UI。",
    stepRestart: "升级 OpenClaw 后重启 Gateway，以提供当前协议。",
  },
} as const;
