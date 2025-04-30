import type { Tokenizer } from "@/lib/types/tokenizer";
import { GoogleGenAI } from "@google/genai";

// This is a server-side only tokenizer
export class GoogleTokenizer implements Tokenizer {
  private ai: GoogleGenAI;
  private model: string;

  constructor(modelHint: string) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set."
      );
    }

    this.ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    this.model = modelHint;
  }

  encode(text: string): number[] {
    // Since we can't get actual token IDs from Gemini API,
    // we'll synchronously return a placeholder array based on the text length
    const estimatedTokens = Math.ceil(text.length / 4); // Rough estimate
    return Array(estimatedTokens).fill(0);
  }

  decode(tokens: number[]): string {
    throw new Error("Decoding is not supported by the Gemini API.");
  }

  async countTokens(text: string): Promise<number> {
    const response = await this.ai.models.countTokens({
      model: this.model,
      contents: [
        {
          parts: [
            {
              text: text,
            },
          ],
        },
      ],
    });
    console.log(response);
    return response.totalTokens ?? 0;
  }
}
