import { resolveUserPath } from "../utils.js";
import { loadWorkspaceBootstrapFiles, type WorkspaceBootstrapFile } from "./workspace.js";

const cache = new Map<string, WorkspaceBootstrapFile[]>();

/** Separates resolved workspace dir from session key in cache entries (both may contain ":"). */
const BOOTSTRAP_CACHE_SEP = "\u001f";

function bootstrapCacheKey(workspaceDir: string, sessionKey: string): string {
  const dir = resolveUserPath(workspaceDir.trim());
  return `${dir}${BOOTSTRAP_CACHE_SEP}${sessionKey}`;
}

export async function getOrLoadBootstrapFiles(params: {
  workspaceDir: string;
  sessionKey: string;
}): Promise<WorkspaceBootstrapFile[]> {
  const key = bootstrapCacheKey(params.workspaceDir, params.sessionKey);
  const existing = cache.get(key);
  if (existing) {
    return existing;
  }

  const files = await loadWorkspaceBootstrapFiles(params.workspaceDir);
  cache.set(key, files);
  return files;
}

export function clearBootstrapSnapshot(sessionKey: string): void {
  const trimmed = sessionKey.trim();
  if (!trimmed) {
    return;
  }
  const suffix = `${BOOTSTRAP_CACHE_SEP}${trimmed}`;
  for (const key of cache.keys()) {
    if (key.endsWith(suffix)) {
      cache.delete(key);
    }
  }
}

export function clearBootstrapSnapshotOnSessionRollover(params: {
  sessionKey?: string;
  previousSessionId?: string;
}): void {
  if (!params.sessionKey || !params.previousSessionId) {
    return;
  }

  clearBootstrapSnapshot(params.sessionKey);
}

export function clearAllBootstrapSnapshots(): void {
  cache.clear();
}
