CREATE TABLE "moteteam"."offline_metric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"period" text NOT NULL,
	"covers" integer DEFAULT 0 NOT NULL,
	"reservations" integer DEFAULT 0 NOT NULL,
	"walkins" integer DEFAULT 0 NOT NULL,
	"promo_redemptions" integer DEFAULT 0 NOT NULL,
	"revenue" numeric DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moteteam"."offline_metric" ADD CONSTRAINT "offline_metric_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "moteteam"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offline_client_period_idx" ON "moteteam"."offline_metric" USING btree ("client_id","period");