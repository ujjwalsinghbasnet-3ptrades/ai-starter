import { tokenizeText } from "@/lib/actions/tokenize";
import { AI_PROVIDER_CONFIG_KEY } from "../constants";

interface Provider {
  id: string;
  enabled: boolean;
  models: Array<{
    id: string;
    unitSize: number;
    inputCost: number;
    outputCost: number;
    isImageModel: boolean;
  }>;
}

export const estimateTokens = async (
  text: string,
  activeProviderIds: string[]
) => {
  // Get provider configuration
  const savedConfig = localStorage.getItem(AI_PROVIDER_CONFIG_KEY);
  let providers: Provider[] = [];

  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      if (config.providers) {
        providers = config.providers.filter(
          (p: Provider) => activeProviderIds.includes(p.id) && p.enabled
        );
      }
    } catch (error) {
      console.error("Failed to load saved configuration:", error);
    }
  }

  const estimatedCost: { [providerId: string]: { [modelId: string]: number } } =
    {};
  const tokenCounts: { [providerId: string]: number } = {};

  for (const provider of providers) {
    estimatedCost[provider.id] = {};
    tokenCounts[provider.id] = 0;

    // Get token count for this provider

    for (const model of provider.models) {
      const providerTokenCount = await tokenizeText(
        text,
        provider.id,
        model.id
      );
      tokenCounts[provider.id] = providerTokenCount;
      // Token cost is based on input tokens
      const inputCost = (providerTokenCount / model.unitSize) * model.inputCost;

      // Estimate output tokens (typically varies between models)
      const outputTokenCount = model.isImageModel
        ? 0
        : Math.round(providerTokenCount * 0.3);
      const outputCost = (outputTokenCount / model.unitSize) * model.outputCost;

      estimatedCost[provider.id][model.id] = inputCost + outputCost;
    }
  }

  return {
    text,
    tokenCounts,
    estimatedCost,
  };
};
