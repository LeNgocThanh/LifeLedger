CREATE TYPE "public"."expense_status" AS ENUM('completed', 'partially_refunded', 'refunded', 'canceled');--> statement-breakpoint
CREATE TABLE "expense_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"catalog_item_id" uuid,
	"linked_asset_id" uuid,
	"linked_asset_event_id" uuid,
	"name" varchar(200) NOT NULL,
	"category" varchar(120),
	"quantity" numeric(12, 3) NOT NULL,
	"unit" varchar(30),
	"unit_price" numeric(18, 2) NOT NULL,
	"discount_amount" numeric(18, 2) NOT NULL,
	"line_total" numeric(18, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "expense_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"paid_by_user_id" uuid NOT NULL,
	"last_edited_by_user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"merchant_name" varchar(200),
	"merchant_address" text,
	"merchant_phone" varchar(30),
	"payment_method" varchar(100),
	"order_number" varchar(120),
	"status" "expense_status" DEFAULT 'completed' NOT NULL,
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"subtotal" numeric(18, 2) NOT NULL,
	"item_discount_amount" numeric(18, 2) NOT NULL,
	"discount_amount" numeric(18, 2) NOT NULL,
	"fee_amount" numeric(18, 2) NOT NULL,
	"expected_total" numeric(18, 2) NOT NULL,
	"actual_paid_amount" numeric(18, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"purge_after" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_transaction_id_expense_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."expense_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_linked_asset_id_assets_id_fk" FOREIGN KEY ("linked_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_linked_asset_event_id_asset_events_id_fk" FOREIGN KEY ("linked_asset_event_id") REFERENCES "public"."asset_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_transactions" ADD CONSTRAINT "expense_transactions_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_transactions" ADD CONSTRAINT "expense_transactions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_transactions" ADD CONSTRAINT "expense_transactions_paid_by_user_id_users_id_fk" FOREIGN KEY ("paid_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_transactions" ADD CONSTRAINT "expense_transactions_last_edited_by_user_id_users_id_fk" FOREIGN KEY ("last_edited_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_items_transaction_index" ON "expense_items" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "expense_items_catalog_index" ON "expense_items" USING btree ("catalog_item_id");--> statement-breakpoint
CREATE INDEX "expense_items_asset_index" ON "expense_items" USING btree ("linked_asset_id");--> statement-breakpoint
CREATE INDEX "expense_transactions_space_occurred_index" ON "expense_transactions" USING btree ("space_id","occurred_at");--> statement-breakpoint
CREATE INDEX "expense_transactions_paid_by_index" ON "expense_transactions" USING btree ("paid_by_user_id");--> statement-breakpoint
CREATE INDEX "expense_transactions_deleted_index" ON "expense_transactions" USING btree ("deleted_at");