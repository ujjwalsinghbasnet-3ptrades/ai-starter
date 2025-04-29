import { TokenizerFactory } from "@/services/tokenizer-factory";
import { AI_PROVIDER_CONFIG_KEY } from "../constants";


export const estimateTokens = async (
  text: string, 
  activeProviderIds: string[]
) => {
  const tokenizer = TokenizerFactory.create('tiktoken:gpt-3.5-turbo');
  const tokenCount = tokenizer.countTokens(text);
  console.log("tokenCount", tokenCount);
  // Get provider configuration
  const savedConfig = localStorage.getItem(AI_PROVIDER_CONFIG_KEY);
  let providers = [];
  
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      if (config.providers) {
        providers = config.providers.filter((p: any) => 
          activeProviderIds.includes(p.id) && p.enabled
        );
      }
    } catch (error) {
      console.error("Failed to load saved configuration:", error);
    }
  }
  
  const estimatedCost: { [providerId: string]: { [modelId: string]: number } } = {};
  
  for (const provider of providers) {
    estimatedCost[provider.id] = {};
    
    for (const model of provider.models) {
      // Token cost is based on input tokens
      const inputCost = (tokenCount / model.unitSize) * model.inputCost;
      
      // Estimate output tokens (typically varies between models)
      const outputTokenCount = model.isImageModel ? 0 : Math.round(tokenCount * 0.3);
      const outputCost = (outputTokenCount / model.unitSize) * model.outputCost;
      
      estimatedCost[provider.id][model.id] = inputCost + outputCost;
    }
  }
  
  return {
    text,
    tokenCount,
    estimatedCost
  };
};