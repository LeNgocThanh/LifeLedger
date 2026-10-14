import {
  boolean,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const spaceType = pgEnum("space_type", ["personal", "family"]);
export const spaceMemberRole = pgEnum("space_member_role", [
  "owner",
  "manager",
  "viewer",
]);
export const assetStatus = pgEnum("asset_status", [
  "in_use",
  "stored",
  "loaned",
  "maintenance",
  "inactive",
  "sold",
  "transferred",
  "lost",
  "disposed",
]);
export const expenseStatus = pgEnum("expense_status", [
  "completed",
  "partially_refunded",
  "refunded",
  "canceled",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    displayName: varchar("display_name", { length: 160 }).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const spaces = pgTable(
  "spaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    type: spaceType("type").notNull(),
    personalOwnerUserId: uuid("personal_owner_user_id").references(
      () => users.id,
      { onDelete: "cascade" },
    ),
    defaultCurrency: varchar("default_currency", { length: 3 })
      .default("VND")
      .notNull(),
    timezone: varchar("timezone", { length: 100 })
      .default("Asia/Bangkok")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("spaces_type_index").on(table.type),
    uniqueIndex("spaces_personal_owner_unique").on(table.personalOwnerUserId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("sessions_token_unique").on(table.token),
    index("sessions_user_index").on(table.userId),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("accounts_user_index").on(table.userId),
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("verifications_identifier_index").on(table.identifier)],
);

export const spaceMembers = pgTable(
  "space_members",
  {
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: spaceMemberRole("role").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.spaceId, table.userId] }),
    index("space_members_user_index").on(table.userId),
  ],
);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    managingSpaceId: uuid("managing_space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "restrict" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 200 }).notNull(),
    type: varchar("type", { length: 120 }).default("Khác").notNull(),
    status: assetStatus("status").default("in_use").notNull(),
    brand: varchar("brand", { length: 160 }),
    model: varchar("model", { length: 160 }),
    serialNumber: varchar("serial_number", { length: 200 }),
    purchaseDate: date("purchase_date"),
    purchasePrice: numeric("purchase_price", { precision: 18, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("VND").notNull(),
    purchasePlace: varchar("purchase_place", { length: 200 }),
    purchaseAddress: text("purchase_address"),
    sellerPhone: varchar("seller_phone", { length: 30 }),
    paymentMethod: varchar("payment_method", { length: 100 }),
    orderNumber: varchar("order_number", { length: 120 }),
    location: varchar("location", { length: 200 }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    purgeAfter: timestamp("purge_after", { withTimezone: true }),
  },
  (table) => [
    index("assets_managing_space_index").on(table.managingSpaceId),
    index("assets_created_by_index").on(table.createdByUserId),
    index("assets_status_index").on(table.status),
    index("assets_type_index").on(table.type),
  ],
);

export const assetDocuments = pgTable(
  "asset_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    documentType: varchar("document_type", { length: 100 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    bytes: numeric("bytes", { precision: 15, scale: 0 }).notNull(),
    cloudinaryPublicId: varchar("cloudinary_public_id", { length: 255 }).notNull(),
    cloudinaryResourceType: varchar("cloudinary_resource_type", { length: 20 }).notNull(),
    cloudinaryFormat: varchar("cloudinary_format", { length: 40 }).notNull(),
    cloudinaryVersion: numeric("cloudinary_version", { precision: 15, scale: 0 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("asset_documents_asset_index").on(table.assetId),
    uniqueIndex("asset_documents_cloudinary_public_id_unique").on(
      table.cloudinaryPublicId,
    ),
  ],
);

export const assetEvents = pgTable(
  "asset_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: varchar("type", { length: 100 }).notNull(),
    occurredAt: date("occurred_at").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    serviceProvider: varchar("service_provider", { length: 200 }),
    serviceLocation: text("service_location"),
    usageValue: numeric("usage_value", { precision: 15, scale: 2 }),
    usageUnit: varchar("usage_unit", { length: 30 }),
    laborCost: numeric("labor_cost", { precision: 18, scale: 2 }),
    otherCost: numeric("other_cost", { precision: 18, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("VND").notNull(),
    nextMaintenanceDate: date("next_maintenance_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("asset_events_asset_occurred_index").on(table.assetId, table.occurredAt),
    index("asset_events_created_by_index").on(table.createdByUserId),
  ],
);

export const catalogItems = pgTable(
  "catalog_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    category: varchar("category", { length: 120 }),
    brand: varchar("brand", { length: 160 }),
    partNumber: varchar("part_number", { length: 120 }),
    unit: varchar("unit", { length: 30 }),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("catalog_items_name_index").on(table.name),
    index("catalog_items_part_number_index").on(table.partNumber),
  ],
);

export const assetEventItems = pgTable(
  "asset_event_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => assetEvents.id, { onDelete: "cascade" }),
    catalogItemId: uuid("catalog_item_id").references(() => catalogItems.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 200 }).notNull(),
    partNumber: varchar("part_number", { length: 120 }),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    unit: varchar("unit", { length: 30 }),
    unitPrice: numeric("unit_price", { precision: 18, scale: 2 }),
    warrantyUntil: date("warranty_until"),
    notes: text("notes"),
  },
  (table) => [
    index("asset_event_items_event_index").on(table.eventId),
    index("asset_event_items_catalog_index").on(table.catalogItemId),
  ],
);

export const assetSpaces = pgTable(
  "asset_spaces",
  {
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    addedByUserId: uuid("added_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.assetId, table.spaceId] }),
    index("asset_spaces_space_index").on(table.spaceId),
  ],
);

export const assetOwners = pgTable(
  "asset_owners",
  {
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    ownershipPercentage: numeric("ownership_percentage", {
      precision: 5,
      scale: 2,
    }),
    startedAt: date("started_at").defaultNow().notNull(),
    endedAt: date("ended_at"),
  },
  (table) => [
    primaryKey({ columns: [table.assetId, table.userId] }),
    index("asset_owners_user_index").on(table.userId),
  ],
);

export const expenseTransactions = pgTable(
  "expense_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    spaceId: uuid("space_id").notNull().references(() => spaces.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    paidByUserId: uuid("paid_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    lastEditedByUserId: uuid("last_edited_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 200 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    merchantName: varchar("merchant_name", { length: 200 }),
    merchantAddress: text("merchant_address"),
    merchantPhone: varchar("merchant_phone", { length: 30 }),
    paymentMethod: varchar("payment_method", { length: 100 }),
    orderNumber: varchar("order_number", { length: 120 }),
    status: expenseStatus("status").default("completed").notNull(),
    currency: varchar("currency", { length: 3 }).default("VND").notNull(),
    subtotal: numeric("subtotal", { precision: 18, scale: 2 }).notNull(),
    itemDiscountAmount: numeric("item_discount_amount", { precision: 18, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 18, scale: 2 }).notNull(),
    feeAmount: numeric("fee_amount", { precision: 18, scale: 2 }).notNull(),
    expectedTotal: numeric("expected_total", { precision: 18, scale: 2 }).notNull(),
    actualPaidAmount: numeric("actual_paid_amount", { precision: 18, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    purgeAfter: timestamp("purge_after", { withTimezone: true }),
  },
  (table) => [
    index("expense_transactions_space_occurred_index").on(table.spaceId, table.occurredAt),
    index("expense_transactions_paid_by_index").on(table.paidByUserId),
    index("expense_transactions_deleted_index").on(table.deletedAt),
  ],
);

export const expenseItems = pgTable(
  "expense_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionId: uuid("transaction_id").notNull().references(() => expenseTransactions.id, { onDelete: "cascade" }),
    catalogItemId: uuid("catalog_item_id").references(() => catalogItems.id, { onDelete: "set null" }),
    linkedAssetId: uuid("linked_asset_id").references(() => assets.id, { onDelete: "set null" }),
    linkedAssetEventId: uuid("linked_asset_event_id").references(() => assetEvents.id, { onDelete: "set null" }),
    name: varchar("name", { length: 200 }).notNull(),
    category: varchar("category", { length: 120 }),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    unit: varchar("unit", { length: 30 }),
    unitPrice: numeric("unit_price", { precision: 18, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 18, scale: 2 }).notNull(),
    lineTotal: numeric("line_total", { precision: 18, scale: 2 }).notNull(),
    allocatedAmount: numeric("allocated_amount", { precision: 18, scale: 2 }).notNull(),
    notes: text("notes"),
  },
  (table) => [
    index("expense_items_transaction_index").on(table.transactionId),
    index("expense_items_catalog_index").on(table.catalogItemId),
    index("expense_items_asset_index").on(table.linkedAssetId),
    uniqueIndex("expense_items_linked_asset_unique").on(table.linkedAssetId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Space = typeof spaces.$inferSelect;
export type NewSpace = typeof spaces.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type AssetDocument = typeof assetDocuments.$inferSelect;
export type AssetEvent = typeof assetEvents.$inferSelect;
export type AssetEventItem = typeof assetEventItems.$inferSelect;
export type CatalogItem = typeof catalogItems.$inferSelect;
export type ExpenseTransaction = typeof expenseTransactions.$inferSelect;
export type ExpenseItem = typeof expenseItems.$inferSelect;
