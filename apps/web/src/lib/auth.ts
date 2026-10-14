import "server-only";

import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { getDatabase } from "@/db/client";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { ensurePersonalSpace } from "@/lib/personal-space";

export const auth = betterAuth({
  appName: "Gia Sản",
  database: drizzleAdapter(getDatabase(), {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  plugins: [expo()],
  trustedOrigins: [
    "giasan://",
    "giasan://*",
    ...(process.env.NODE_ENV === "development" ? ["exp://", "exp://**"] : []),
  ],
  user: {
    fields: {
      name: "displayName",
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await ensurePersonalSpace(user);
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
