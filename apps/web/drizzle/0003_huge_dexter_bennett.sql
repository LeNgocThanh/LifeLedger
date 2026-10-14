CREATE TABLE "asset_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"uploaded_by_user_id" uuid NOT NULL,
	"document_type" varchar(100) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"bytes" numeric(15, 0) NOT NULL,
	"cloudinary_public_id" varchar(255) NOT NULL,
	"cloudinary_resource_type" varchar(20) NOT NULL,
	"cloudinary_format" varchar(40) NOT NULL,
	"cloudinary_version" numeric(15, 0) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "purchase_place" varchar(200);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "purchase_address" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "seller_phone" varchar(30);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "payment_method" varchar(100);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "order_number" varchar(120);--> statement-breakpoint
ALTER TABLE "asset_documents" ADD CONSTRAINT "asset_documents_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_documents" ADD CONSTRAINT "asset_documents_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_documents_asset_index" ON "asset_documents" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "asset_documents_cloudinary_public_id_unique" ON "asset_documents" USING btree ("cloudinary_public_id");