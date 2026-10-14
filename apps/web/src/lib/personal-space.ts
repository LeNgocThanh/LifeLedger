import "server-only";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { spaceMembers, spaces } from "@/db/schema";

export async function ensurePersonalSpace(user: {
  id: string;
  name: string;
}) {
  const database = getDatabase();
  const existingSpace = await database.query.spaces.findFirst({
    where: eq(spaces.personalOwnerUserId, user.id),
  });

  if (existingSpace) {
    return existingSpace;
  }

  return database.transaction(async (transaction) => {
    const [createdSpace] = await transaction
      .insert(spaces)
      .values({
        name: `Không gian của ${user.name}`,
        type: "personal",
        personalOwnerUserId: user.id,
      })
      .onConflictDoNothing({ target: spaces.personalOwnerUserId })
      .returning();

    const personalSpace =
      createdSpace ??
      (await transaction.query.spaces.findFirst({
        where: eq(spaces.personalOwnerUserId, user.id),
      }));

    if (!personalSpace) {
      throw new Error("Không thể tạo không gian cá nhân.");
    }

    await transaction
      .insert(spaceMembers)
      .values({
        spaceId: personalSpace.id,
        userId: user.id,
        role: "owner",
      })
      .onConflictDoNothing();

    return personalSpace;
  });
}
