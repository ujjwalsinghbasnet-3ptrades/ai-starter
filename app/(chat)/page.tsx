import { cookies } from "next/headers";

import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import {
  AI_PROVIDER_COOKIE_NAME,
  DEFAULT_PROVIDER_MODEL,
} from "@/lib/constants";
import { generateUUID } from "@/lib/utils";
export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const providerIdFromCookie = cookieStore.get(AI_PROVIDER_COOKIE_NAME);

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedProviderModel={
            providerIdFromCookie?.value || DEFAULT_PROVIDER_MODEL
          }
          selectedVisibilityType="private"
          isReadonly={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie.value}
        selectedProviderModel={
          providerIdFromCookie?.value || DEFAULT_PROVIDER_MODEL
        }
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
