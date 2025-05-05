import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import { createProviderRegistry } from "ai";

export const providerRegistry = createProviderRegistry({
  anthropic: createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  google: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }),
  xai: createXai({
    apiKey: process.env.XAI_API_KEY,
  }),
});
