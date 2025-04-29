import { TikTokenTokenizer } from '@/lib/tokenizers/tiktoken-tokenizer';
import type { Tokenizer } from '@/lib/types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TokenizerFactory {
  static create(tokenizerId?: string): Tokenizer {
    if (!tokenizerId) {
      throw new Error('Tokenizer ID must be provided');
    }

    const [type, modelHint] = tokenizerId.split(':');

    switch (type) {
      case 'tiktoken':
        return new TikTokenTokenizer(modelHint);
      // Future examples:
      // case "sentencepiece":
      //   return new SentencePieceTokenizer(modelHint);
      // case "llama":
      //   return new LlamaTokenizer(modelHint);
      default:
        throw new Error(`Unsupported tokenizer type: ${type}`);
    }
  }
}
