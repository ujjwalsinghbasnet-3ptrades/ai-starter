'use server'

import { cookies } from "next/headers";
import { aiProviders } from "./providers-config";

export async function getAvailableProviders() {
    const cookieStore = await cookies();
    const selectedProvider = cookieStore.get("selected-provider");
      return aiProviders.map(provider => ({
        id: provider.id,
        name: provider.name,
        description: provider.description,
        isConfigured: provider.isConfigured,
        selected: selectedProvider?.value === provider.id
      }));
    }