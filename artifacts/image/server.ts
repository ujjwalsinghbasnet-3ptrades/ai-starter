import { providerRegistry } from "@/lib/ai/ai-config";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { experimental_generateImage } from "ai";

export const imageDocumentHandler = createDocumentHandler<"image">({
  kind: "image",
  onCreateDocument: async ({ title, dataStream, selectedProviderModel }) => {
    let draftContent = "";

    const myProvider = providerRegistry.imageModel(
      selectedProviderModel as any
    );

    const { image } = await experimental_generateImage({
      model: myProvider,
      prompt: title,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: "image-delta",
      content: image.base64,
    });

    return draftContent;
  },
  onUpdateDocument: async ({
    description,
    dataStream,
    selectedProviderModel,
  }) => {
    let draftContent = "";

    const myProvider = providerRegistry.imageModel(
      selectedProviderModel as any
    );

    const { image } = await experimental_generateImage({
      model: myProvider,
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: "image-delta",
      content: image.base64,
    });

    return draftContent;
  },
});
