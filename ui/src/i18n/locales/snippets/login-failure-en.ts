/** English copy for `login.failure.*` (Control UI gateway login errors). */
export const loginFailureStrings = {
  rawError: "Raw error",
  docsAuth: "Control UI auth docs",
  docsInsecure: "Control UI insecure HTTP docs",
  docsPairing: "Device pairing docs",
  network: {
    title: "Can't connect to Gateway",
    summary:
      "No WebSocket connection could be established. Confirm the Gateway is running and the URL matches your install.",
    stepGateway: "Confirm the Gateway is running with openclaw status or openclaw gateway run.",
    stepUrl: "Check the WebSocket URL and use wss:// when the Gateway is behind HTTPS/Tailscale Serve.",
    stepDashboard:
      "Reopen the dashboard with openclaw dashboard --no-open to recopy the current URL and auth details.",
  },
  authRequired: {
    title: "Auth required",
    summary:
      "The Gateway is reachable, but it needs a matching token or password before this browser can connect.",
    stepPaste: "Paste the token from openclaw dashboard --no-open or enter the configured password.",
    stepGenerate: "If no token is configured, run openclaw doctor --generate-gateway-token on the gateway host.",
    stepConnect: "Click Connect again after updating the credential.",
  },
  authFailed: {
    title: "Authentication failed",
    summary:
      "The supplied credential was rejected. The most common cause is a stale token or a token copied from another Gateway URL.",
    stepDashboard: "Run openclaw dashboard --no-open and open the fresh URL or paste its token.",
    stepReplace: "Replace stale token/password values; do not reuse a token from another Gateway URL.",
    stepMode:
      "Use one matching auth mode at a time: gateway token for token mode, password for password mode.",
  },
  rateLimited: {
    title: "Too many failed attempts",
    summary:
      "The Gateway temporarily blocked authentication after repeated failures. Wait before retrying.",
    stepStop: "Stop retrying from this tab for a moment.",
    stepWait: "Wait for the auth limiter to cool down, then reconnect with the corrected credential.",
    stepCheckClients: "If this is a shared host, check other clients for repeated bad retries.",
  },
  pairing: {
    scopeTitle: "Scope upgrade pending",
    roleTitle: "Role upgrade pending",
    metadataTitle: "Metadata upgrade pending",
    title: "Device pairing required",
    summary: "This Gateway requires approving this browser before it can connect.",
    upgradeSummary:
      "This browser is already known, but the requested access changed and needs a fresh approval.",
    stepList: "Run openclaw devices list on the Gateway host.",
    stepApprove:
      "Approve the pending request on the Gateway host (pick the request id from openclaw devices list).",
    stepApproveId: "Approve this request: openclaw devices approve {requestId}.",
    stepReconnect: "Reconnect after the approval completes.",
  },
  insecure: {
    title: "Insecure connection",
    summary: "Device identity or browser security rules blocked this connection over plain HTTP.",
    stepHttps: "Use HTTPS/Tailscale Serve, or open http://127.0.0.1:18789 on the Gateway host.",
    stepLocalCompat: "For local token-only compatibility, set gateway.controlUi.allowInsecureAuth: true.",
    stepAvoidDisable: "Avoid disabling device auth for remote HTTP access.",
  },
  origin: {
    title: "Origin not allowed",
    summary: "The Gateway rejected this Control UI origin.",
    stepAllowedOrigins: "Add this browser origin to gateway.controlUi.allowedOrigins.",
    stepFullOrigin: "Use full origins such as http://localhost:5173, not wildcard patterns.",
    stepRestart: "Restart or reload the Gateway after changing allowed origins.",
  },
  protocol: {
    title: "Protocol mismatch",
    summary:
      "The served Control UI and the running Gateway do not agree on the supported connection protocol.",
    stepDashboard:
      "Reopen the served dashboard with openclaw dashboard so the UI and Gateway come from the same install.",
    stepDevUi: "If using pnpm ui:dev, rebuild or restart the dev UI against the current checkout.",
    stepRestart: "Restart the Gateway after updating OpenClaw so it serves the current protocol.",
  },
} as const;
