"use server";

import { authOptions } from "@/app/(auth)/auth";
import {
  getEnabledProviders,
  updateProviderSetting,
} from "@/lib/providers/provider-service";
import { getServerSession } from "next-auth";

// Get all providers
export async function getProviders() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const enabledProviders = await getEnabledProviders(userId);
    return { data: enabledProviders };
  } catch (error) {
    console.error("Error fetching providers:", error);
    throw new Error("Failed to fetch providers");
  }
}

// Update provider settings
export async function updateProviderSettings({
  providerId,
  enabled,
}: {
  providerId: string;
  enabled: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!providerId) {
      throw new Error("Provider ID is required");
    }

    await updateProviderSetting(userId, providerId, enabled);
    return { success: true };
  } catch (error) {
    console.error("Error updating provider settings:", error);
    throw new Error("Failed to update provider settings");
  }
}
