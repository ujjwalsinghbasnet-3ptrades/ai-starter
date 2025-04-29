import type { Tokenizer } from "@/lib/types/tokenizer";
import { encodingForModel, getEncoding, type TiktokenModel } from "js-tiktoken";

export class TikTokenTokenizer implements Tokenizer {
  private encoder: ReturnType<typeof getEncoding>;

  constructor(modelHint: string) {
    try {
      // Try to get encoding specific to the model
      this.encoder = encodingForModel(modelHint as TiktokenModel);
    } catch (error) {
      console.warn(`Warning: No specific encoding for model "${modelHint}". Using cl100k_base fallback.`);
      // If model isn't recognized, use fallback
      this.encoder = getEncoding("cl100k_base");
    }
  }

  encode(text: string): number[] {
    return Array.from(this.encoder.encode(text));
  }

  decode(tokens: number[]): string {
   return this.encoder.decode(tokens);
  }

  countTokens(text: string): number {
    return this.encode(text).length;
  }
}
