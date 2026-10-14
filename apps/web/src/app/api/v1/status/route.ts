import type { ApiStatus } from "@qlts/domain";
import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";

export async function GET() {
  try {
    await getDatabase().execute(sql`select 1`);

    const response: ApiStatus = {
      service: "qlts-api",
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    };

    return Response.json(response);
  } catch {
    const response: ApiStatus = {
      service: "qlts-api",
      status: "degraded",
      database: "unavailable",
      timestamp: new Date().toISOString(),
    };

    return Response.json(response, { status: 503 });
  }
}
