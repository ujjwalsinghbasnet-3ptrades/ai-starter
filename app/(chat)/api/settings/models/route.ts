import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import {
  addCustomModel,
  deleteModel,
  updateModelSettings,
} from "@/lib/providers/provider-service";
import { NextResponse } from "next/server";

// Get models for a provider
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    if (!providerId) {
      return NextResponse.json(
        { error: "Provider ID is required" },
        { status: 400 }
      );
    }

    const providerModels = await db.query.models.findMany({
      where: (models, { eq }) => eq(models.providerId, providerId),
    });

    return NextResponse.json(providerModels);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

// Update model settings
export async function PUT(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { modelId, enabled, customInputCost, customOutputCost, isDefault } =
      await request.json();

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    await updateModelSettings(userId, modelId, {
      enabled,
      customInputCost,
      customOutputCost,
      isDefault,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating model settings:", error);
    return NextResponse.json(
      { error: "Failed to update model settings" },
      { status: 500 }
    );
  }
}

// Add custom model
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { providerId, model } = await request.json();

    if (!providerId || !model) {
      return NextResponse.json(
        { error: "Provider ID and model data are required" },
        { status: 400 }
      );
    }

    const modelId = await addCustomModel(providerId, model);

    // Set the model as enabled for the user
    await updateModelSettings(userId, modelId, { enabled: true });

    return NextResponse.json({ success: true, modelId });
  } catch (error) {
    console.error("Error adding custom model:", error);
    return NextResponse.json(
      { error: "Failed to add custom model" },
      { status: 500 }
    );
  }
}

// Delete model
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    await deleteModel(modelId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      { error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
