export interface Tokenizer {
  encode(text: string): number[];
  decode(tokens: number[]): string;
  countTokens(text: string): Promise<number>;
}
