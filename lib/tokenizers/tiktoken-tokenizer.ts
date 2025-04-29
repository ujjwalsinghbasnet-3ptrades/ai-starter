import type { Tokenizer } from "@/lib/types/tokenizer";
import { encoding_for_model, get_encoding, type TiktokenModel } from "tiktoken";

export class TikTokenTokenizer implements Tokenizer {
  private encoder: ReturnType<typeof get_encoding>;

  constructor(modelHint: string) {
    try {
      // Try to get encoding specific to the model
      this.encoder = encoding_for_model(modelHint as TiktokenModel);
    } catch (error) {
      console.warn(`Warning: No specific encoding for model "${modelHint}". Using cl100k_base fallback.`);
      // If model isn't recognized, use fallback
      this.encoder = get_encoding("cl100k_base");
    }
  }

  encode(text: string): number[] {
    return Array.from(this.encoder.encode(text));
  }

  decode(tokens: number[]): string {
    return new TextDecoder().decode(this.encoder.decode(new Uint32Array(tokens)));
  }

  countTokens(text: string): number {
    return this.encode(text).length;
  }
}
