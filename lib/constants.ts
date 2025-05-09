import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";

export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const DUMMY_PASSWORD = generateDummyPassword();
export const DEFAULT_PROVIDER_MODEL = "openai:gpt-4o";
export const AI_PROVIDER_CONFIG_KEY = "ai-provider-config";
export const AI_PROVIDER_MODEL_COOKIE_NAME = "selected-provider-model";
