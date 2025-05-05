import type { LucideIcon } from "lucide-react";

export interface Model {
  id: string;
  name: string;
  description: string;
  inputCost: number; // Cost per unit of tokens for input
  outputCost: number; // Cost per unit of tokens for output
  unitSize: number; // Typically 1000 tokens
  maxTokens?: number; // Maximum context length
  isImageModel?: boolean;
  customCost?: boolean; // Whether the cost has been customized by the user
  enabled?: boolean; // Whether the model is enabled
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  bgColor: string;
  models: Model[];
}

export interface TokenEstimate {
  inputTokens: number;
  totalCost: number;
  breakdown: {
    providerId: string;
    providerName: string;
    modelId: string;
    modelName: string;
    inputTokens: number;
    outputTokens: number; // Estimated based on a ratio
    inputCost: number;
    outputCost: number;
    totalCost: number;
  }[];
}

export interface TokenizationResult {
  text: string;
  tokenCount: number;
  estimatedCost: {
    [providerId: string]: {
      [modelId: string]: number;
    };
  };
}
