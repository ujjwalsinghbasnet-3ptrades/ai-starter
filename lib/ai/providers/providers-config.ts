
export interface AIProvider {
    id: string;
    name: string;
    description: string;
    isConfigured: boolean;
    selected?: boolean;
  }
  
  export const DEFAULT_PROVIDER = "google";
  
  export const aiProviders: Array<AIProvider> = [
    {
      id: "google",
      name: "Google AI",
      description: "Powered by Google's Gemini models",
      isConfigured: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    {
      id: "xai",
      name: "XAI",
      description: "Powered by XAI models",
      isConfigured: !!process.env.XAI_API_KEY,
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description: "Powered by Claude models",
      isConfigured: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "Powered by GPT models",
      isConfigured: !!process.env.OPENAI_API_KEY,
    },
  ];