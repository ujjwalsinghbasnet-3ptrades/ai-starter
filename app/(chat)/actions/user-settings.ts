"use server";
import { authOptions } from "@/app/(auth)/auth";
import { db } from "@/lib/db/db";
import { userProviderConfig } from "@/lib/db/schema";
import { getAllProviders } from "@/lib/providers/provider-service";
import type { Provider } from "@/lib/types"; // Make sure this matches your frontend type
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

type UserSettings = Omit<InferSelectModel<typeof userProviderConfig>, "id">;

export async function getUserSettings(): Promise<{
  providers: Provider[];
  defaultProviderId: string;
}> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const userSettings = await db.query.userProviderConfig.findFirst({
    where: eq(userProviderConfig.userId, userId),
  });

  const providers = await getAllProviders();

  if (!userSettings)
    return {
      providers,
      defaultProviderId: providers[0].id,
    };

  const providerSettings = userSettings.providerSettings ?? {};
  const modelSettings = userSettings.modelSettings ?? {};

  // Merge overrides
  const customizedProviders = providers.map((provider) => {
    const providerOverride = providerSettings[provider.id];
    const enabledProvider = providerOverride?.enabled ?? provider.enabled;

    const customizedModels = provider.models.map((model) => {
      const modelOverride = modelSettings[model.id];
      return {
        ...model,
        enabled: modelOverride?.enabled ?? model.enabled,
        inputCost: modelOverride?.customInputCost ?? model.inputCost,
        outputCost: modelOverride?.customOutputCost ?? model.outputCost,
      };
    });

    return {
      ...provider,
      enabled: enabledProvider,
      models: customizedModels,
    };
  });
  return {
    providers: customizedProviders,
    defaultProviderId: userSettings.defaultProviderId ?? providers[0].id,
  };
}

// Update user settings
export async function updateUserSettings(settings: UserSettings) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingSettings = await db.query.userProviderConfig.findFirst({
    where: eq(userProviderConfig.userId, userId),
  });

  if (existingSettings) {
    await db
      .update(userProviderConfig)
      .set(settings)
      .where(eq(userProviderConfig.userId, userId));
  } else {
    await db.insert(userProviderConfig).values(settings);
  }
}
