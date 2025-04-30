import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { cookies } from "next/headers";
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from "../ai/models.test";
import { isTestEnvironment } from "../constants";
import { getDefaultProvider } from "./provider-list";

// Provider instances
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
});

const getSelectedProvider = async () => {
  try {
    const cookieStore = await cookies();
    const providerId = cookieStore.get("selected-provider")?.value;

    if (providerId) {
      switch (providerId) {
        case "google":
          return google("gemini-1.5-flash");
        case "xai":
          return xai("grok-2-text");
        case "anthropic":
          return anthropic("claude-3-5-sonnet");
        case "openai":
          return openai("gpt-4o");
      }
    }

    // If no provider selected in cookie, use default from settings
    const defaultProvider = getDefaultProvider();
    if (!defaultProvider) return google("gemini-1.5-flash");

    switch (defaultProvider.id) {
      case "google":
        return google("gemini-1.5-flash");
      case "xai":
        return xai("grok-2-text");
      case "anthropic":
        return anthropic("claude-3-5-sonnet");
      case "openai":
        return openai("gpt-4o");
      default:
        return google("gemini-1.5-flash");
    }
  } catch (err) {
    console.error("Error getting selected provider:", err);
    return google("gemini-1.5-flash");
  }
};

export const createProvider = async () => {
  const selectedModel = await getSelectedProvider();

  if (isTestEnvironment) {
    return customProvider({
      languageModels: {
        "chat-model": chatModel,
        "chat-model-reasoning": reasoningModel,
        "title-model": titleModel,
        "artifact-model": artifactModel,
      },
    });
  }

  return customProvider({
    languageModels: {
      "chat-model": selectedModel,
      "chat-model-reasoning": wrapLanguageModel({
        model: selectedModel,
        middleware: extractReasoningMiddleware({ tagName: "think" }),
      }),
      "title-model": selectedModel,
      "artifact-model": selectedModel,
    },
    imageModels: {
      "small-model": xai.image("grok-2-image"),
    },
  });
};
