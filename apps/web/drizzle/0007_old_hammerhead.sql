ALTER TABLE "expense_items" ADD COLUMN "allocated_amount" numeric(18, 2);--> statement-breakpoint
WITH "weighted" AS (
	SELECT
		"expense_items"."id",
		"expense_items"."transaction_id",
		"expense_items"."line_total",
		"expense_transactions"."actual_paid_amount",
		SUM("expense_items"."line_total") OVER (PARTITION BY "expense_items"."transaction_id") AS "total_weight",
		COUNT(*) OVER (PARTITION BY "expense_items"."transaction_id") AS "item_count",
		ROW_NUMBER() OVER (PARTITION BY "expense_items"."transaction_id" ORDER BY "expense_items"."id" DESC) AS "reverse_position"
	FROM "expense_items"
	INNER JOIN "expense_transactions" ON "expense_transactions"."id" = "expense_items"."transaction_id"
), "provisional" AS (
	SELECT *, FLOOR("actual_paid_amount" * CASE WHEN "total_weight" > 0 THEN "line_total" / "total_weight" ELSE 1.0 / "item_count" END * 100) / 100 AS "provisional_amount"
	FROM "weighted"
), "allocated" AS (
	SELECT "id", CASE WHEN "reverse_position" = 1 THEN "actual_paid_amount" - SUM(CASE WHEN "reverse_position" <> 1 THEN "provisional_amount" ELSE 0 END) OVER (PARTITION BY "transaction_id") ELSE "provisional_amount" END AS "allocated_amount"
	FROM "provisional"
)
UPDATE "expense_items" SET "allocated_amount" = "allocated"."allocated_amount" FROM "allocated" WHERE "expense_items"."id" = "allocated"."id";--> statement-breakpoint
ALTER TABLE "expense_items" ALTER COLUMN "allocated_amount" SET NOT NULL;--> statement-breakpoint
UPDATE "assets" SET
	"purchase_date" = ("expense_transactions"."occurred_at" AT TIME ZONE 'UTC')::date,
	"purchase_price" = "expense_items"."allocated_amount",
	"currency" = "expense_transactions"."currency",
	"purchase_place" = "expense_transactions"."merchant_name",
	"purchase_address" = "expense_transactions"."merchant_address",
	"seller_phone" = "expense_transactions"."merchant_phone",
	"payment_method" = "expense_transactions"."payment_method",
	"order_number" = "expense_transactions"."order_number",
	"updated_at" = now()
FROM "expense_items"
INNER JOIN "expense_transactions" ON "expense_transactions"."id" = "expense_items"."transaction_id"
WHERE "expense_items"."linked_asset_id" = "assets"."id";--> statement-breakpoint
CREATE UNIQUE INDEX "expense_items_linked_asset_unique" ON "expense_items" USING btree ("linked_asset_id");
