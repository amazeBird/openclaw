// Defaults for agent metadata when upstream does not supply them.
// Fariy fork: prefer DeepSeek when config omits `agents.defaults.model`; add Anthropic via config
// (`agents.defaults.model`, `models.providers`, auth) if you need Claude.
export const DEFAULT_PROVIDER = "deepseek";
export const DEFAULT_MODEL = "deepseek-chat";
// Conservative fallback used when model metadata is unavailable.
export const DEFAULT_CONTEXT_TOKENS = 200_000;
