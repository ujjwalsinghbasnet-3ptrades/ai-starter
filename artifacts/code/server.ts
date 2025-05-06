import { providerRegistry } from "@/lib/ai/ai-config";
import { codePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { streamObject } from "ai";
import { z } from "zod";

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  onCreateDocument: async ({ title, dataStream, selectedProviderModel }) => {
    let draftContent = "";

    const myProvider = providerRegistry.languageModel(
      selectedProviderModel as any
    );

    const { fullStream } = streamObject({
      model: myProvider,
      system: codePrompt,
      prompt: title,
      schema: z.object({
        code: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.writeData({
            type: "code-delta",
            content: code ?? "",
          });

          draftContent = code;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({
    document,
    description,
    dataStream,
    selectedProviderModel,
  }) => {
    let draftContent = "";
    const myProvider = providerRegistry.languageModel(
      selectedProviderModel as any
    );
    const { fullStream } = streamObject({
      model: myProvider,
      system: updateDocumentPrompt(document.content, "code"),
      prompt: description,
      schema: z.object({
        code: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.writeData({
            type: "code-delta",
            content: code ?? "",
          });

          draftContent = code;
        }
      }
    }

    return draftContent;
  },
});
