CREATE TYPE "public"."shipment_status" AS ENUM('pending', 'in_transit', 'delivered', 'failed');--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"destination" text NOT NULL,
	"status" "shipment_status" DEFAULT 'pending' NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_order_id_unique" UNIQUE("order_id")
);
