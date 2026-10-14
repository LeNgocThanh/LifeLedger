CREATE TABLE "asset_event_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"part_number" varchar(120),
	"quantity" numeric(12, 3) NOT NULL,
	"unit" varchar(30),
	"unit_price" numeric(18, 2),
	"warranty_until" date,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "asset_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"occurred_at" date NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"service_provider" varchar(200),
	"service_location" text,
	"usage_value" numeric(15, 2),
	"usage_unit" varchar(30),
	"labor_cost" numeric(18, 2),
	"other_cost" numeric(18, 2),
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"next_maintenance_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_event_items" ADD CONSTRAINT "asset_event_items_event_id_asset_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."asset_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_events" ADD CONSTRAINT "asset_events_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_events" ADD CONSTRAINT "asset_events_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_event_items_event_index" ON "asset_event_items" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "asset_events_asset_occurred_index" ON "asset_events" USING btree ("asset_id","occurred_at");--> statement-breakpoint
CREATE INDEX "asset_events_created_by_index" ON "asset_events" USING btree ("created_by_user_id");