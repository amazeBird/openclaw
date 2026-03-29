import type { ModelCatalogEntry } from "../../agents/model-catalog.js";
import {
  buildAllowedModelSet,
  buildConfiguredModelCatalog,
  collectControlUiConfiguredModelKeys,
  modelKey,
  normalizeProviderId,
  resolveDefaultModelForAgent,
} from "../../agents/model-selection.js";
import type { OpenClawConfig } from "../../config/config.js";
import { loadConfig } from "../../config/config.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateModelsListParams,
} from "../protocol/index.js";
import type { GatewayRequestHandlers } from "./types.js";

function mergeModelCatalogByKey(
  base: ModelCatalogEntry[],
  extra: ModelCatalogEntry[],
): ModelCatalogEntry[] {
  const seen = new Set<string>();
  const out: ModelCatalogEntry[] = [];
  for (const entry of base) {
    const key = modelKey(entry.provider, entry.id);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(entry);
  }
  for (const entry of extra) {
    const key = modelKey(entry.provider, entry.id);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(entry);
  }
  return out;
}

/** When merge mode fills `models.providers` with many vendors, keep pickers on the default model's provider. */
function narrowCatalogToDefaultProvider(params: {
  cfg: OpenClawConfig;
  catalog: ModelCatalogEntry[];
}): ModelCatalogEntry[] {
  const { cfg, catalog } = params;
  if (catalog.length === 0) {
    return catalog;
  }
  const distinctProviders = new Set(catalog.map((entry) => normalizeProviderId(entry.provider)));
  if (distinctProviders.size <= 1) {
    return catalog;
  }
  const resolved = resolveDefaultModelForAgent({ cfg });
  const want = normalizeProviderId(resolved.provider);
  const narrowed = catalog.filter((entry) => normalizeProviderId(entry.provider) === want);
  return narrowed.length > 0 ? narrowed : catalog;
}

function ensureDefaultModelInCatalog(params: {
  cfg: OpenClawConfig;
  models: ModelCatalogEntry[];
}): ModelCatalogEntry[] {
  const resolved = resolveDefaultModelForAgent({ cfg: params.cfg });
  const key = modelKey(resolved.provider, resolved.model);
  if (params.models.some((e) => modelKey(e.provider, e.id) === key)) {
    return params.models;
  }
  return [
    ...params.models,
    {
      id: resolved.model,
      name: resolved.model,
      provider: resolved.provider,
    },
  ];
}

export const modelsHandlers: GatewayRequestHandlers = {
  "models.list": async ({ params, respond, context }) => {
    if (!validateModelsListParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid models.list params: ${formatValidationErrors(validateModelsListParams.errors)}`,
        ),
      );
      return;
    }
    try {
      const fullCatalog = await context.loadGatewayModelCatalog();
      const cfg = loadConfig();
      const configuredCatalog = buildConfiguredModelCatalog({ cfg });
      const useConfiguredCatalogOnly = configuredCatalog.length > 0;
      const modelsAllowlistEmpty = Object.keys(cfg.agents?.defaults?.models ?? {}).length === 0;
      // When the user defines `models.providers`, only expose those entries in Control UI /
      // model pickers instead of the full bundled catalog (Bedrock, Anthropic, etc.).
      // When using the Pi merge catalog, union in `models.providers` rows so configured
      // vendors (e.g. DeepSeek) are not dropped if the merge snapshot omits them.
      const baseCatalogRaw = useConfiguredCatalogOnly
        ? configuredCatalog
        : mergeModelCatalogByKey(fullCatalog, configuredCatalog);
      const configuredProviderCount = new Set(
        configuredCatalog.map((e) => normalizeProviderId(e.provider)),
      ).size;
      // Narrow multi-vendor `models.providers` blocks to the default primary (picker noise).
      // Skip narrow for a single configured vendor so a lone `deepseek` block is not collapsed
      // away when the merged Pi catalog still contains other providers.
      const shouldNarrowCatalog =
        modelsAllowlistEmpty && (configuredCatalog.length === 0 || configuredProviderCount > 1);
      const baseCatalog = shouldNarrowCatalog
        ? narrowCatalogToDefaultProvider({ cfg, catalog: baseCatalogRaw })
        : baseCatalogRaw;
      const resolvedDefault = resolveDefaultModelForAgent({ cfg });
      const { allowedCatalog } = buildAllowedModelSet({
        cfg,
        catalog: baseCatalog,
        defaultProvider: resolvedDefault.provider,
        defaultModel: `${resolvedDefault.provider}/${resolvedDefault.model}`,
      });
      let workingModels = allowedCatalog.length > 0 ? allowedCatalog : baseCatalog;
      const configuredKeys = collectControlUiConfiguredModelKeys(cfg);
      if (configuredKeys.size > 0) {
        workingModels = workingModels.filter((entry) =>
          configuredKeys.has(modelKey(entry.provider, entry.id)),
        );
      }
      const narrowedFromManyProviders =
        modelsAllowlistEmpty &&
        baseCatalogRaw.length > 0 &&
        baseCatalog.length < baseCatalogRaw.length;
      const models =
        useConfiguredCatalogOnly || narrowedFromManyProviders || configuredKeys.size > 0
          ? ensureDefaultModelInCatalog({ cfg, models: workingModels })
          : workingModels;
      respond(true, { models }, undefined);
    } catch (err) {
      respond(false, undefined, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
    }
  },
};
