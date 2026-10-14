import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const globalForDatabase = globalThis as typeof globalThis & {
  qltsDatabasePool?: Pool;
};

function getPoolSize() {
  const configuredValue = Number(process.env.DATABASE_POOL_MAX ?? "10");

  if (!Number.isInteger(configuredValue) || configuredValue < 1) {
    throw new Error("DATABASE_POOL_MAX phải là số nguyên lớn hơn 0.");
  }

  return configuredValue;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL chưa được cấu hình.");
  }

  return new Pool({
    connectionString,
    max: getPoolSize(),
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    allowExitOnIdle: true,
  });
}

export function getDatabasePool() {
  const pool = globalForDatabase.qltsDatabasePool ?? createPool();

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.qltsDatabasePool = pool;
  }

  return pool;
}

export function getDatabase() {
  return drizzle({ client: getDatabasePool(), schema });
}

export type Database = ReturnType<typeof getDatabase>;
