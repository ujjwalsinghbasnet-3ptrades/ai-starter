"use server";

import { authOptions } from "@/app/(auth)/auth";
import { db } from "@/lib/db/db";
import {
  addCustomModel,
  deleteModel,
  updateModelSetting,
} from "@/lib/providers/provider-service";
import { getServerSession } from "next-auth";

// Get models for a provider
export async function getProviderModels(providerId: string) {
  try {
    if (!providerId) {
      throw new Error("Provider ID is required");
    }

    const providerModels = await db.query.models.findMany({
      where: (models, { eq }) => eq(models.providerId, providerId),
    });

    return { data: providerModels };
  } catch (error) {
    console.error("Error fetching models:", error);
    throw new Error("Failed to fetch models");
  }
}

// Update model settings
export async function updateModelSettings({
  modelId,
  enabled,
  customInputCost,
  customOutputCost,
  isDefault,
}: {
  modelId: string;
  enabled?: boolean;
  customInputCost?: number;
  customOutputCost?: number;
  isDefault?: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!modelId) {
      throw new Error("Model ID is required");
    }

    await updateModelSetting(userId, modelId, {
      enabled,
      customInputCost,
      customOutputCost,
      isDefault,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating model settings:", error);
    throw new Error("Failed to update model settings");
  }
}

// Add custom model
export async function addCustomModelAction({
  providerId,
  model,
}: {
  providerId: string;
  model: any;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!providerId || !model) {
      throw new Error("Provider ID and model data are required");
    }

    const modelId = await addCustomModel(providerId, model);
    await updateModelSetting(userId, modelId, { enabled: true });

    return { success: true, modelId };
  } catch (error) {
    console.error("Error adding custom model:", error);
    throw new Error("Failed to add custom model");
  }
}

// Delete model
export async function deleteModelAction(modelId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!modelId) {
      throw new Error("Model ID is required");
    }

    await deleteModel(modelId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting model:", error);
    throw new Error("Failed to delete model");
  }
}
