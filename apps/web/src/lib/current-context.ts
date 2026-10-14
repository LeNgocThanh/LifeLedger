import "server-only";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { spaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ensurePersonalSpace } from "@/lib/personal-space";

export async function getCurrentContext() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const space = await ensurePersonalSpace(session.user);
  const membership = await getDatabase().query.spaceMembers.findFirst({
    where: and(
      eq(spaceMembers.spaceId, space.id),
      eq(spaceMembers.userId, session.user.id),
    ),
  });

  return { session, space, role: membership?.role ?? "viewer" };
}
