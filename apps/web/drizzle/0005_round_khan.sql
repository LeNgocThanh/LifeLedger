CREATE TABLE "catalog_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(120),
	"brand" varchar(160),
	"part_number" varchar(120),
	"unit" varchar(30),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_event_items" ADD COLUMN "catalog_item_id" uuid;--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalog_items_name_index" ON "catalog_items" USING btree ("name");--> statement-breakpoint
CREATE INDEX "catalog_items_part_number_index" ON "catalog_items" USING btree ("part_number");--> statement-breakpoint
ALTER TABLE "asset_event_items" ADD CONSTRAINT "asset_event_items_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_event_items_catalog_index" ON "asset_event_items" USING btree ("catalog_item_id");