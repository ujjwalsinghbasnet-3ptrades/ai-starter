import { providerRegistry } from "@/lib/ai/ai-config";
import { sheetPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { streamObject } from "ai";
import { z } from "zod";

export const sheetDocumentHandler = createDocumentHandler<"sheet">({
  kind: "sheet",
  onCreateDocument: async ({ title, dataStream, selectedProviderModel }) => {
    let draftContent = "";

    const myProvider = providerRegistry.languageModel(
      selectedProviderModel as any
    );

    const { fullStream } = streamObject({
      model: myProvider,
      system: sheetPrompt,
      prompt: title,
      schema: z.object({
        csv: z.string().describe("CSV data"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.writeData({
            type: "sheet-delta",
            content: csv,
          });

          draftContent = csv;
        }
      }
    }

    dataStream.writeData({
      type: "sheet-delta",
      content: draftContent,
    });

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
      system: updateDocumentPrompt(document.content, "sheet"),
      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.writeData({
            type: "sheet-delta",
            content: csv,
          });

          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});
