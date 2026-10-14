CREATE TYPE "public"."asset_status" AS ENUM('in_use', 'stored', 'loaned', 'maintenance', 'inactive', 'sold', 'transferred', 'lost', 'disposed');--> statement-breakpoint
CREATE TABLE "asset_owners" (
	"asset_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"ownership_percentage" numeric(5, 2),
	"started_at" date DEFAULT now() NOT NULL,
	"ended_at" date,
	CONSTRAINT "asset_owners_asset_id_user_id_pk" PRIMARY KEY("asset_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "asset_spaces" (
	"asset_id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"added_by_user_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "asset_spaces_asset_id_space_id_pk" PRIMARY KEY("asset_id","space_id")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"managing_space_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" varchar(120) DEFAULT 'Khác' NOT NULL,
	"status" "asset_status" DEFAULT 'in_use' NOT NULL,
	"brand" varchar(160),
	"model" varchar(160),
	"serial_number" varchar(200),
	"purchase_date" date,
	"purchase_price" numeric(18, 2),
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"location" varchar(200),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"purge_after" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "asset_owners" ADD CONSTRAINT "asset_owners_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_owners" ADD CONSTRAINT "asset_owners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_spaces" ADD CONSTRAINT "asset_spaces_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_spaces" ADD CONSTRAINT "asset_spaces_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_spaces" ADD CONSTRAINT "asset_spaces_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_managing_space_id_spaces_id_fk" FOREIGN KEY ("managing_space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_owners_user_index" ON "asset_owners" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "asset_spaces_space_index" ON "asset_spaces" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "assets_managing_space_index" ON "assets" USING btree ("managing_space_id");--> statement-breakpoint
CREATE INDEX "assets_created_by_index" ON "assets" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "assets_status_index" ON "assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assets_type_index" ON "assets" USING btree ("type");