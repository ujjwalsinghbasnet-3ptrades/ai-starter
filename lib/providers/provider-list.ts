import type { Provider } from "@/lib/types";
import { Bot, BrainCircuit, CloudCog, Sparkle, Zap } from "lucide-react";
import { AI_PROVIDER_CONFIG_KEY } from "../constants";

export const providersList: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT models with varying capabilities and costs",
    icon: Sparkle,
    enabled: true,
    bgColor: "bg-emerald-600",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Most capable model for complex tasks",
        inputCost: 0.01,
        outputCost: 0.03,
        unitSize: 1000,
        maxTokens: 128000,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "Fast and powerful for most use cases",
        inputCost: 0.01,
        outputCost: 0.03,
        unitSize: 1000,
        maxTokens: 128000,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "Efficient model for many general tasks",
        inputCost: 0.0005,
        outputCost: 0.0015,
        unitSize: 1000,
        maxTokens: 16000,
      },
      {
        id: "dalle3",
        name: "DALL-E 3",
        description: "Image generation model",
        inputCost: 0.04,
        outputCost: 0.04,
        unitSize: 1,
        isImageModel: true,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude models known for safety and coherence",
    icon: Bot,
    enabled: true,
    bgColor: "bg-indigo-600",
    models: [
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        description: "Most capable Claude model",
        inputCost: 0.015,
        outputCost: 0.075,
        unitSize: 1000,
        maxTokens: 200000,
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        description: "Balanced performance and efficiency",
        inputCost: 0.003,
        outputCost: 0.015,
        unitSize: 1000,
        maxTokens: 200000,
      },
      {
        id: "claude-3-haiku",
        name: "Claude 3 Haiku",
        description: "Fast, efficient model for simple tasks",
        inputCost: 0.00025,
        outputCost: 0.00125,
        unitSize: 1000,
        maxTokens: 200000,
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    description: "Gemini models with strong reasoning capabilities",
    icon: CloudCog,
    enabled: false,
    bgColor: "bg-blue-600",
    models: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Flagship model for complex tasks",
        inputCost: 0.0025,
        outputCost: 0.0075,
        unitSize: 1000,
        maxTokens: 1000000,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "Fast and cost-effective model",
        inputCost: 0.0005,
        outputCost: 0.0015,
        unitSize: 1000,
        maxTokens: 1000000,
      },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok models with unique capabilities",
    icon: BrainCircuit,
    enabled: false,
    bgColor: "bg-rose-600",
    models: [
      {
        id: "grok-1",
        name: "Grok-1",
        description: "General purpose AI assistant",
        inputCost: 0.002,
        outputCost: 0.006,
        unitSize: 1000,
        maxTokens: 128000,
      },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Efficient models with strong performance",
    icon: Zap,
    enabled: false,
    bgColor: "bg-violet-600",
    models: [
      {
        id: "mistral-large",
        name: "Mistral Large",
        description: "Most powerful Mistral model",
        inputCost: 0.008,
        outputCost: 0.024,
        unitSize: 1000,
        maxTokens: 32000,
      },
      {
        id: "mistral-medium",
        name: "Mistral Medium",
        description: "Balanced performance model",
        inputCost: 0.0027,
        outputCost: 0.0081,
        unitSize: 1000,
        maxTokens: 32000,
      },
      {
        id: "mistral-small",
        name: "Mistral Small",
        description: "Efficient, cost-effective model",
        inputCost: 0.0007,
        outputCost: 0.0021,
        unitSize: 1000,
        maxTokens: 32000,
      },
    ],
  },
];

export function getProviderById(id: string): Provider | undefined {
  return providersList.find((provider) => provider.id === id);
}

export function getEnabledProviders(): Provider[] {
  if (typeof window !== "undefined") {
    const savedConfig = localStorage.getItem(AI_PROVIDER_CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.providers) {
          // Merge saved configuration with original providers to preserve icon references
          return providersList
            .map((originalProvider) => {
              const savedProvider = config.providers.find(
                (p: Provider) => p.id === originalProvider.id
              );
              if (savedProvider) {
                return {
                  ...originalProvider,
                  enabled: savedProvider.enabled,
                };
              }
              return originalProvider;
            })
            .filter((provider) => provider.enabled);
        }
      } catch (error) {
        console.error("Failed to parse saved configuration:", error);
      }
    }
  }

  // If no saved config, error, or on server, return original enabled providers
  return providersList.filter((provider) => provider.enabled);
}

export function getDefaultProvider(): Provider | undefined {
  const savedConfig = localStorage.getItem(AI_PROVIDER_CONFIG_KEY);
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      const defaultProviderId = config.defaultProvider;
      return providersList.find((p) => p.id === defaultProviderId && p.enabled);
    } catch (error) {
      console.error("Failed to parse saved configuration:", error);
    }
  }

  // Default to first enabled provider if no saved default
  return providersList.find((p) => p.enabled);
}
