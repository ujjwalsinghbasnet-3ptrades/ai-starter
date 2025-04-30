"use server";

import type { Tokenizer } from "@/lib/types";
import { TokenizerFactory } from "@/services/tokenizer-factory";

export async function tokenizeText(
  text: string,
  providerId: string,
  modelHint?: string
): Promise<number> {
  if (!text) {
    throw new Error("Text is required");
  }

  let tokenizer: Tokenizer;
  try {
    switch (providerId) {
      case "google":
        tokenizer = TokenizerFactory.create(`google:${modelHint}`);
        break;
      default:
        tokenizer = TokenizerFactory.create(`tiktoken:${modelHint}`);
    }
  } catch (error) {
    console.error("Failed to create tokenizer:", error);
    throw new Error("Failed to create tokenizer");
  }

  return await tokenizer.countTokens(text);
}
