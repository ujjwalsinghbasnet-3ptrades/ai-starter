import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as relations from "./relations";
import * as schema from "./schema";

config({
  path: ".env.local",
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const connectionString = process.env.POSTGRES_URL!;

const client = postgres(connectionString);
export const db = drizzle(client, { schema: { ...schema, ...relations } });
