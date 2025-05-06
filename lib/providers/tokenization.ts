import { getProviders } from "@/app/(chat)/actions/providers";
import { tokenizeText } from "@/lib/actions/tokenize";

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

export const estimateTokens = async (text: string) => {
  const { data: providers } = await getProviders();
  console.log({ providers });
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
