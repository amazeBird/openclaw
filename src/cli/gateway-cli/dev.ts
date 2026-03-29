import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveWorkspaceTemplateDir } from "../../agents/workspace-templates.js";
import { resolveDefaultAgentWorkspaceDir } from "../../agents/workspace.js";
import { handleReset } from "../../commands/onboard-helpers.js";
import { createConfigIO, writeConfigFile } from "../../config/config.js";
import type { OpenClawConfig } from "../../config/types.js";
import { resolveRequiredHomeDir } from "../../infra/home-dir.js";
import { defaultRuntime } from "../../runtime.js";
import { resolveUserPath, shortenHomePath } from "../../utils.js";

const DEV_IDENTITY_NAME = "Fairy";
const DEV_IDENTITY_THEME = "protocol droid";
const DEV_IDENTITY_EMOJI = "🤖";
const DEV_AGENT_WORKSPACE_SUFFIX = "dev";

/** Legacy dev defaults before rename; normalize spacing/dashes for comparison. */
function isLegacyDevAssistantDisplayName(name: string): boolean {
  const compact = name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  return compact === "c3po";
}

function shouldMigrateDevAssistantDisplayName(name: string): boolean {
  const t = name.trim();
  if (!t) {
    return false;
  }
  if (isLegacyDevAssistantDisplayName(t)) {
    return true;
  }
  return t.toLowerCase() === "fariy";
}

async function loadDevTemplate(name: string, fallback: string): Promise<string> {
  try {
    const templateDir = await resolveWorkspaceTemplateDir();
    const raw = await fs.promises.readFile(path.join(templateDir, name), "utf-8");
    if (!raw.startsWith("---")) {
      return raw;
    }
    const endIndex = raw.indexOf("\n---", 3);
    if (endIndex === -1) {
      return raw;
    }
    return raw.slice(endIndex + "\n---".length).replace(/^\s+/, "");
  } catch {
    return fallback;
  }
}

const resolveDevWorkspaceDir = (env: NodeJS.ProcessEnv = process.env): string => {
  /** Optional: keep dev workspace on a real project root across `gateway --dev --reset`. */
  const workspaceOverride = env.OPENCLAW_DEV_WORKSPACE?.trim();
  if (workspaceOverride) {
    return resolveUserPath(workspaceOverride, env, () => resolveRequiredHomeDir(env, os.homedir));
  }
  const baseDir = resolveDefaultAgentWorkspaceDir(env, os.homedir);
  const profile = env.OPENCLAW_PROFILE?.trim().toLowerCase();
  if (profile === "dev") {
    return baseDir;
  }
  return `${baseDir}-${DEV_AGENT_WORKSPACE_SUFFIX}`;
};

async function writeFileIfMissing(filePath: string, content: string) {
  try {
    await fs.promises.writeFile(filePath, content, {
      encoding: "utf-8",
      flag: "wx",
    });
  } catch (err) {
    const anyErr = err as { code?: string };
    if (anyErr.code !== "EEXIST") {
      throw err;
    }
  }
}

/**
 * Dev profile: prefer loopback without gateway token. Respect explicit password /
 * trusted-proxy auth if the user already configured it.
 */
async function ensureDevProfileGatewayAuthNone(
  io: ReturnType<typeof createConfigIO>,
): Promise<void> {
  const { snapshot, writeOptions } = await io.readConfigFileSnapshotForWrite();
  if (!snapshot.valid) {
    return;
  }
  const cfg = snapshot.config;
  const mode = cfg.gateway?.auth?.mode;
  if (mode === "password" || mode === "trusted-proxy") {
    return;
  }
  if (mode === "none") {
    return;
  }

  const next: OpenClawConfig = {
    ...cfg,
    gateway: {
      ...cfg.gateway,
      auth: {
        ...cfg.gateway?.auth,
        mode: "none",
      },
    },
  };
  await io.writeConfigFile(next, writeOptions);
  defaultRuntime.log(
    "Dev: gateway.auth.mode=none (Control UI can connect without token on loopback).",
  );
}

/**
 * One-time style migration: existing dev profiles still store the old default name in
 * `openclaw.json` and/or `IDENTITY.md`. Restarting the gateway does not rewrite those files.
 */
async function ensureDevProfileLegacyAssistantDisplayName(
  io: ReturnType<typeof createConfigIO>,
): Promise<void> {
  const { snapshot, writeOptions } = await io.readConfigFileSnapshotForWrite();
  if (!snapshot.valid) {
    return;
  }
  const cfg = snapshot.config;
  const list = cfg.agents?.list;
  let nextCfg: OpenClawConfig = cfg;
  let listChanged = false;

  if (Array.isArray(list)) {
    const nextList = list.map((entry) => {
      const raw = entry?.identity?.name?.trim();
      if (!raw || !shouldMigrateDevAssistantDisplayName(raw)) {
        return entry;
      }
      listChanged = true;
      return {
        ...entry,
        identity: {
          ...entry.identity,
          name: DEV_IDENTITY_NAME,
        },
      };
    });
    if (listChanged) {
      nextCfg = {
        ...cfg,
        agents: {
          ...cfg.agents,
          list: nextList,
        },
      };
      await io.writeConfigFile(nextCfg, writeOptions);
      defaultRuntime.log(
        `Dev: renamed legacy assistant display name to ${DEV_IDENTITY_NAME} in ${shortenHomePath(io.configPath)}.`,
      );
    }
  }

  await patchDevWorkspaceIdentityMarkdownLegacyName(nextCfg);
}

async function patchDevWorkspaceIdentityMarkdownLegacyName(cfg: OpenClawConfig): Promise<void> {
  const dirs = new Set<string>();
  const def = cfg.agents?.defaults?.workspace;
  if (typeof def === "string" && def.trim()) {
    dirs.add(def.trim());
  }
  for (const entry of cfg.agents?.list ?? []) {
    const w = entry?.workspace;
    if (typeof w === "string" && w.trim()) {
      dirs.add(w.trim());
    }
  }

  for (const raw of dirs) {
    const dir = resolveUserPath(raw);
    const identityPath = path.join(dir, "IDENTITY.md");
    let content: string;
    try {
      content = await fs.promises.readFile(identityPath, "utf-8");
    } catch {
      continue;
    }
    let next = content;
    next = next.replace(
      /^(\s*[-*]?\s*Name:\s*)C3[\s_-]*PO\b(.*)$/gim,
      (_match, prefix: string, rest: string) => `${prefix}${DEV_IDENTITY_NAME}${rest}`,
    );
    next = next.replace(
      /^(\s*[-*]?\s*Name:\s*)Fariy\b(.*)$/gim,
      (_match, prefix: string, rest: string) => `${prefix}${DEV_IDENTITY_NAME}${rest}`,
    );
    if (next === content) {
      continue;
    }
    await fs.promises.writeFile(identityPath, next, "utf-8");
    defaultRuntime.log(
      `Dev: renamed legacy assistant display name to ${DEV_IDENTITY_NAME} in ${shortenHomePath(identityPath)}.`,
    );
  }
}

async function ensureDevWorkspace(dir: string) {
  const resolvedDir = resolveUserPath(dir);
  await fs.promises.mkdir(resolvedDir, { recursive: true });

  const [agents, soul, tools, identity, user] = await Promise.all([
    loadDevTemplate(
      "AGENTS.dev.md",
      `# AGENTS.md - OpenClaw Dev Workspace\n\nDefault dev workspace for openclaw gateway --dev.\n`,
    ),
    loadDevTemplate(
      "SOUL.dev.md",
      `# SOUL.md - Dev Persona\n\nProtocol droid for debugging and operations.\n`,
    ),
    loadDevTemplate(
      "TOOLS.dev.md",
      `# TOOLS.md - User Tool Notes (editable)\n\nAdd your local tool notes here.\n`,
    ),
    loadDevTemplate(
      "IDENTITY.dev.md",
      `# IDENTITY.md - Agent Identity\n\n- Name: ${DEV_IDENTITY_NAME}\n- Creature: protocol droid\n- Vibe: ${DEV_IDENTITY_THEME}\n- Emoji: ${DEV_IDENTITY_EMOJI}\n`,
    ),
    loadDevTemplate(
      "USER.dev.md",
      `# USER.md - User Profile\n\n- Name:\n- Preferred address:\n- Notes:\n`,
    ),
  ]);

  await writeFileIfMissing(path.join(resolvedDir, "AGENTS.md"), agents);
  await writeFileIfMissing(path.join(resolvedDir, "SOUL.md"), soul);
  await writeFileIfMissing(path.join(resolvedDir, "TOOLS.md"), tools);
  await writeFileIfMissing(path.join(resolvedDir, "IDENTITY.md"), identity);
  await writeFileIfMissing(path.join(resolvedDir, "USER.md"), user);
}

export async function ensureDevGatewayConfig(opts: { reset?: boolean }) {
  const workspace = resolveDevWorkspaceDir();
  if (opts.reset) {
    await handleReset("full", workspace, defaultRuntime);
  }

  const io = createConfigIO();
  const configPath = io.configPath;
  const configExists = fs.existsSync(configPath);
  if (!opts.reset && configExists) {
    await ensureDevProfileGatewayAuthNone(io);
    await ensureDevProfileLegacyAssistantDisplayName(io);
    return;
  }

  await writeConfigFile({
    gateway: {
      mode: "local",
      bind: "loopback",
      // Personal/dev: no token/password on loopback. Do not use auth.mode=none on LAN/Tailscale.
      auth: { mode: "none" },
    },
    agents: {
      defaults: {
        workspace,
        skipBootstrap: true,
      },
      list: [
        {
          /** Matches legacy Control UI session key `main` (see `resolveAgentWorkspaceDir`). */
          id: "main",
          default: true,
          workspace,
          identity: {
            name: DEV_IDENTITY_NAME,
            theme: DEV_IDENTITY_THEME,
            emoji: DEV_IDENTITY_EMOJI,
          },
        },
      ],
    },
  });
  await ensureDevWorkspace(workspace);
  defaultRuntime.log(`Dev config ready: ${shortenHomePath(configPath)}`);
  defaultRuntime.log(`Dev workspace ready: ${shortenHomePath(resolveUserPath(workspace))}`);
}
