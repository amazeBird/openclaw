/**
 * Normalize session keys from URL, localStorage, or manual entry (common typo: semicolons).
 */
export function normalizeControlUiSessionKey(raw: string): string {
  const s = raw.trim();
  if (!s) {
    return s;
  }
  // `agent:main;main` does not parse as an agent session key (needs `:` separators).
  const m = /^agent:([^:]+);(.+)$/i.exec(s);
  if (m) {
    return `agent:${m[1]}:${m[2]}`;
  }
  return s;
}
