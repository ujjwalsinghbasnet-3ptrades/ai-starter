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
import { isTestEnvironment } from "../../constants";
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from "../models.test";

type ProviderId = "google" | "xai" | "anthropic" | "openai";

// Provider instances
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
});

const selectedProvider = async () => {
  try {
    const cookieStore = await cookies();
    const providerId = cookieStore.get("selected-provider")
      ?.value as ProviderId;
    switch (providerId) {
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
  } catch (err) {}
};
export const MyProvider = async () => {
  const selectedModel = (await selectedProvider()) as any;
  const myProvider = isTestEnvironment
    ? customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      })
    : customProvider({
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
  return myProvider;
};

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        "chat-model": chatModel,
        "chat-model-reasoning": reasoningModel,
        "title-model": titleModel,
        "artifact-model": artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        "chat-model": google("gemini-1.5-flash"),
        "chat-model-reasoning": wrapLanguageModel({
          model: google("gemini-1.5-flash"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": google("gemini-1.5-flash"),
        "artifact-model": google("gemini-1.5-flash"),
      },
      imageModels: {
        "small-model": xai.image("grok-2-image"),
      },
    });
