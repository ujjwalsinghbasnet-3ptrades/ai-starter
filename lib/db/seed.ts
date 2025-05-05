import { db } from "./db";
import { models, providers } from "./schema";

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(models);
  await db.delete(providers);

  // Insert providers
  await db.insert(providers).values([
    {
      id: "openai",
      name: "OpenAI",
      description: "GPT models with varying capabilities and costs",
      icon: "Sparkle", // Store as string
      bgColor: "bg-emerald-600",
      enabled: true,
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description: "Claude models known for safety and coherence",
      icon: "Bot",
      bgColor: "bg-indigo-600",
      enabled: true,
    },
    {
      id: "google",
      name: "Google",
      description: "Gemini models with strong reasoning capabilities",
      icon: "CloudCog",
      bgColor: "bg-blue-600",
      enabled: false,
    },
    {
      id: "xai",
      name: "xAI",
      description: "Grok models with unique capabilities",
      icon: "BrainCircuit",
      bgColor: "bg-rose-600",
      enabled: false,
    },
    {
      id: "mistral",
      name: "Mistral AI",
      description: "Efficient models with strong performance",
      icon: "Zap",
      bgColor: "bg-violet-600",
      enabled: false,
    },
  ]);

  // Insert models
  await db.insert(models).values([
    // OpenAI models
    {
      id: "gpt-4o",
      providerId: "openai",
      name: "GPT-4o",
      description: "Most capable model for complex tasks",
      inputCost: "0.01",
      outputCost: "0.03",
      unitSize: 1000,
      maxTokens: 128000,
      enabled: true,
    },
    {
      id: "gpt-4-turbo",
      providerId: "openai",
      name: "GPT-4 Turbo",
      description: "Fast and powerful for most use cases",
      inputCost: "0.01",
      outputCost: "0.03",
      unitSize: 1000,
      maxTokens: 128000,
      enabled: true,
    },
    {
      id: "gpt-3.5-turbo",
      providerId: "openai",
      name: "GPT-3.5 Turbo",
      description: "Efficient model for many general tasks",
      inputCost: "0.0005",
      outputCost: "0.0015",
      unitSize: 1000,
      maxTokens: 16000,
      enabled: true,
    },
    {
      id: "dalle3",
      providerId: "openai",
      name: "DALL-E 3",
      description: "Image generation model",
      inputCost: "0.04",
      outputCost: "0.04",
      unitSize: 1,
      isImageModel: true,
      enabled: true,
    },

    // Anthropic models
    {
      id: "claude-3-opus",
      providerId: "anthropic",
      name: "Claude 3 Opus",
      description: "Most capable Claude model",
      inputCost: "0.015",
      outputCost: "0.075",
      unitSize: 1000,
      maxTokens: 200000,
      enabled: true,
    },
    {
      id: "claude-3-sonnet",
      providerId: "anthropic",
      name: "Claude 3 Sonnet",
      description: "Balanced performance and efficiency",
      inputCost: "0.003",
      outputCost: "0.015",
      unitSize: 1000,
      maxTokens: 200000,
      enabled: true,
    },
    {
      id: "claude-3-haiku",
      providerId: "anthropic",
      name: "Claude 3 Haiku",
      description: "Fast, efficient model for simple tasks",
      inputCost: "0.00025",
      outputCost: "0.00125",
      unitSize: 1000,
      maxTokens: 200000,
      enabled: true,
    },

    // Google models
    {
      id: "gemini-1.5-pro",
      providerId: "google",
      name: "Gemini 1.5 Pro",
      description: "Flagship model for complex tasks",
      inputCost: "0.0025",
      outputCost: "0.0075",
      unitSize: 1000,
      maxTokens: 1000000,
      enabled: true,
    },
    {
      id: "gemini-1.5-flash",
      providerId: "google",
      name: "Gemini 1.5 Flash",
      description: "Fast and cost-effective model",
      inputCost: "0.0005",
      outputCost: "0.0015",
      unitSize: 1000,
      maxTokens: 1000000,
      enabled: true,
    },

    // xAI models
    {
      id: "grok-1",
      providerId: "xai",
      name: "Grok-1",
      description: "General purpose AI assistant",
      inputCost: "0.002",
      outputCost: "0.006",
      unitSize: 1000,
      maxTokens: 128000,
      enabled: true,
    },

    // Mistral models
    {
      id: "mistral-large",
      providerId: "mistral",
      name: "Mistral Large",
      description: "Most powerful Mistral model",
      inputCost: "0.008",
      outputCost: "0.024",
      unitSize: 1000,
      maxTokens: 32000,
      enabled: true,
    },
    {
      id: "mistral-medium",
      providerId: "mistral",
      name: "Mistral Medium",
      description: "Balanced performance model",
      inputCost: "0.0027",
      outputCost: "0.0081",
      unitSize: 1000,
      maxTokens: 32000,
      enabled: true,
    },
    {
      id: "mistral-small",
      providerId: "mistral",
      name: "Mistral Small",
      description: "Efficient, cost-effective model",
      inputCost: "0.0007",
      outputCost: "0.0021",
      unitSize: 1000,
      maxTokens: 32000,
      enabled: true,
    },
  ]);

  console.log("✅ Database seeded successfully!");
}

main().catch((e) => {
  console.error("❌ Error seeding database:", e);
  process.exit(1);
});
