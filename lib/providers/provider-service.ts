"use server";

import { db } from "@/lib/db/db";
import { models, providers, userProviderConfig } from "@/lib/db/schema";
import type { Model, Provider } from "@/lib/types/providers";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

type DBProvider = InferSelectModel<typeof providers> & {
  models: Array<InferSelectModel<typeof models>>;
};

// Get all providers with their models
export async function getAllProviders(): Promise<Provider[]> {
  try {
    const dbProviders = (await db.query.providers.findMany({
      with: {
        models: true,
      },
    })) as unknown as DBProvider[];

    return dbProviders.map((provider) => ({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      icon: provider.icon,
      bgColor: provider.bgColor,
      enabled: provider.enabled ?? false,
      models: provider.models.map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        inputCost: Number(model.inputCost),
        outputCost: Number(model.outputCost),
        unitSize: model.unitSize,
        maxTokens: model.maxTokens ?? undefined,
        enabled: model.enabled ?? true,
        isImageModel: model.isImageModel ?? false,
      })),
    }));
  } catch (error) {
    console.error("Failed to get all providers from database:", error);
    throw error;
  }
}

// Get provider by ID
export async function getProviderById(
  id: string
): Promise<Provider | undefined> {
  try {
    const provider = (await db.query.providers.findFirst({
      where: eq(providers.id, id),
      with: {
        models: true,
      },
    })) as DBProvider | undefined;

    if (!provider) return undefined;

    return {
      ...provider,
      icon: provider.icon,
      enabled: provider.enabled ?? false,
      models: provider.models.map((model) => ({
        ...model,
        inputCost: Number(model.inputCost),
        outputCost: Number(model.outputCost),
        maxTokens: model.maxTokens || undefined,
        enabled: model.enabled ?? true,
        isImageModel: model.isImageModel ?? undefined,
      })),
    };
  } catch (error) {
    console.error("Failed to get provider by id from database");
    throw error;
  }
}

// Get enabled providers for a user
export async function getEnabledProviders(
  userId?: string
): Promise<Provider[]> {
  try {
    // Get all providers with their models
    const allProviders = await getAllProviders();

    if (!userId) {
      // Return globally enabled providers if no user ID
      return allProviders.filter((p) => p.enabled);
    }

    // Get user configuration
    const config = await db.query.userProviderConfig.findFirst({
      where: eq(userProviderConfig.userId, userId),
    });

    if (!config?.providerSettings) {
      // Return globally enabled providers if no user config
      return allProviders.filter((p) => p.enabled);
    }

    // Apply user provider settings
    return allProviders
      .map((provider) => {
        const userProviderSetting = config.providerSettings?.[provider.id];

        // If user has a setting for this provider, use it
        if (userProviderSetting) {
          return {
            ...provider,
            enabled: userProviderSetting.enabled,
            models: provider.models.map((model) => {
              const userModelSetting = config.modelSettings?.[model.id];

              if (userModelSetting) {
                return {
                  ...model,
                  enabled: userModelSetting.enabled,
                  inputCost:
                    userModelSetting.customInputCost ?? Number(model.inputCost),
                  outputCost:
                    userModelSetting.customOutputCost ??
                    Number(model.outputCost),
                  customCost:
                    !!userModelSetting.customInputCost ||
                    !!userModelSetting.customOutputCost,
                };
              }

              return model;
            }),
          };
        }

        // Otherwise use global setting
        return provider;
      })
      .filter((p) => p.enabled);
  } catch (error) {
    console.error("Failed to get enabled providers from database");
    throw error;
  }
}

// Get default provider for a user
export async function getDefaultProvider(
  userId?: string
): Promise<Provider | undefined> {
  try {
    if (userId) {
      // Get user configuration
      const config = await db.query.userProviderConfig.findFirst({
        where: eq(userProviderConfig.userId, userId),
      });

      if (config?.defaultProviderId) {
        return getProviderById(config.defaultProviderId);
      }
    }

    // Fall back to first enabled provider
    const enabledProviders = await getEnabledProviders(userId);
    return enabledProviders[0];
  } catch (error) {
    console.error("Failed to get default provider from database");
    throw error;
  }
}

// Get default model ID for a provider
export async function getDefaultModelId(
  userId: string,
  providerId: string
): Promise<string | undefined> {
  try {
    // Get user configuration
    const config = await db.query.userProviderConfig.findFirst({
      where: eq(userProviderConfig.userId, userId),
    });

    // Return user's default model for this provider if set
    if (config?.providerSettings?.[providerId]?.defaultModelId) {
      return config.providerSettings[providerId].defaultModelId;
    }

    // Otherwise return first enabled model for this provider
    const provider = await getProviderById(providerId);
    return provider?.models.find((m) => m.enabled)?.id;
  } catch (error) {
    console.error("Failed to get default model id from database");
    throw error;
  }
}

// Get all default models for a user
export async function getDefaultModels(
  userId: string
): Promise<Record<string, string>> {
  try {
    // Get user configuration
    const config = await db.query.userProviderConfig.findFirst({
      where: eq(userProviderConfig.userId, userId),
    });

    const providerSettings = config?.providerSettings;
    if (!providerSettings) {
      return {};
    }

    const defaultModels: Record<string, string> = {};

    // Extract default model IDs from provider settings
    Object.entries(providerSettings).forEach(([providerId, settings]) => {
      if (
        settings &&
        typeof settings === "object" &&
        "defaultModelId" in settings &&
        settings.defaultModelId
      ) {
        defaultModels[providerId] = settings.defaultModelId;
      }
    });

    return defaultModels;
  } catch (error) {
    console.error("Failed to get default models from database");
    throw error;
  }
}

// Update user configuration
export async function updateUserConfig(
  userId: string,
  updates: {
    defaultProviderId?: string;
    providerSettings?: Record<
      string,
      { enabled: boolean; defaultModelId?: string }
    >;
    modelSettings?: Record<
      string,
      {
        enabled?: boolean;
        customInputCost?: number;
        customOutputCost?: number;
      }
    >;
  }
): Promise<void> {
  try {
    // Get current config
    const currentConfig = await db.query.userProviderConfig.findFirst({
      where: eq(userProviderConfig.userId, userId),
    });

    // Prepare the update data
    const updateData: any = { updatedAt: new Date() };

    if (updates.defaultProviderId) {
      updateData.defaultProviderId = updates.defaultProviderId;
    }

    if (updates.providerSettings) {
      updateData.providerSettings = currentConfig?.providerSettings
        ? { ...currentConfig.providerSettings, ...updates.providerSettings }
        : updates.providerSettings;
    }

    if (updates.modelSettings) {
      updateData.modelSettings = currentConfig?.modelSettings
        ? { ...currentConfig.modelSettings, ...updates.modelSettings }
        : updates.modelSettings;
    }

    // Insert or update the config
    await db
      .insert(userProviderConfig)
      .values({
        userId,
        ...updateData,
      })
      .onConflictDoUpdate({
        target: userProviderConfig.userId,
        set: updateData,
      });
  } catch (error) {
    console.error("Failed to update user config in database");
    throw error;
  }
}

// Update provider setting
export async function updateProviderSetting(
  userId: string,
  providerId: string,
  enabled: boolean,
  defaultModelId?: string
): Promise<void> {
  try {
    // Get current config
    const currentConfig = await db.query.userProviderConfig.findFirst({
      where: eq(userProviderConfig.userId, userId),
    });

    // Prepare provider settings update
    const providerSettings = currentConfig?.providerSettings || {};
    providerSettings[providerId] = {
      ...(providerSettings[providerId] || {}),
      enabled,
      ...(defaultModelId ? { defaultModelId } : {}),
    };

    // Update config
    await updateUserConfig(userId, { providerSettings });
  } catch (error) {
    console.error("Failed to update provider setting in database");
    throw error;
  }
}

// Update model setting
export async function updateModelSetting(
  userId: string,
  modelId: string,
  settings: {
    enabled?: boolean;
    customInputCost?: number;
    customOutputCost?: number;
    isDefault?: boolean;
  }
): Promise<void> {
  try {
    // Get current config
    const currentConfig = await db.query.userProviderConfig.findFirst({
      where: eq(userProviderConfig.userId, userId),
    });

    // Prepare model settings update
    const modelSettings = currentConfig?.modelSettings || {};
    modelSettings[modelId] = {
      ...(modelSettings[modelId] || {}),
      ...settings,
    };

    // Update config
    await updateUserConfig(userId, { modelSettings });
  } catch (error) {
    console.error("Failed to update model setting in database");
    throw error;
  }
}

// Set default model for a provider
export async function setDefaultModel(
  userId: string,
  providerId: string,
  modelId: string
): Promise<void> {
  try {
    // Get current config
    const currentConfig = await db.query.userProviderConfig.findFirst({
      where: eq(userProviderConfig.userId, userId),
    });

    // Prepare provider settings update
    const providerSettings = currentConfig?.providerSettings || {};
    providerSettings[providerId] = {
      ...(providerSettings[providerId] || {}),
      enabled: true,
      defaultModelId: modelId,
    };

    // Update config
    await updateUserConfig(userId, { providerSettings });
  } catch (error) {
    console.error("Failed to set default model in database");
    throw error;
  }
}

// Add custom model
export async function addCustomModel(
  providerId: string,
  model: Omit<Model, "id" | "providerId">
): Promise<string> {
  try {
    const modelId = `${providerId}-${model.name
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    // First check if model already exists
    const existingModel = await db.query.models.findFirst({
      where: (models, { eq, and }) =>
        and(eq(models.id, modelId), eq(models.providerId, providerId)),
    });

    if (existingModel) {
      throw new Error(
        "A model with this name already exists for this provider"
      );
    }

    await db.insert(models).values({
      id: modelId,
      providerId,
      name: model.name,
      description: model.description,
      inputCost: String(model.inputCost),
      outputCost: String(model.outputCost),
      unitSize: model.unitSize,
      maxTokens: model.maxTokens,
      isImageModel: model.isImageModel || false,
      enabled: true,
    });

    return modelId;
  } catch (error) {
    console.error("Failed to add custom model to database");
    throw error;
  }
}

// Delete model
export async function deleteModel(modelId: string): Promise<void> {
  try {
    await db.delete(models).where(eq(models.id, modelId));
  } catch (error) {
    console.error("Failed to delete model from database");
    throw error;
  }
}

export async function updateUserModelSettings(
  userId: string,
  modelId: string,
  settings: {
    enabled?: boolean;
    customInputCost?: number;
    customOutputCost?: number;
    isDefault?: boolean;
  }
) {}
