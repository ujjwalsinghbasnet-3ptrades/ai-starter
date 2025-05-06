"use server";

import { generateText, type Message } from "ai";
import { cookies } from "next/headers";

import type { VisibilityType } from "@/components/visibility-selector";
import { providerRegistry } from "@/lib/ai/ai-config";
import { AI_PROVIDER_MODEL_COOKIE_NAME } from "@/lib/constants";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from "@/lib/db/queries";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
  providerId,
}: {
  message: Message;
  providerId: string;
}) {
  const myProvider = providerRegistry.languageModel(providerId as any);
  const { text: title } = await generateText({
    model: myProvider,
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function setProviderModelCookie(modelId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AI_PROVIDER_MODEL_COOKIE_NAME, modelId);
}

export async function setModelCookie(modelId: string) {
  const cookieStore = await cookies();
  cookieStore.set("ai-model", modelId);
}
