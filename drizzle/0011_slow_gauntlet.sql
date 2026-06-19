CREATE TYPE "moteteam"."kol_status" AS ENUM('belum_bales_dm', 'sudah_bales_dm', 'minta_rate_card', 'nego', 'deal', 'mau_datang_review', 'sudah_posting', 'sudah_review', 'cancel');--> statement-breakpoint
CREATE TABLE "moteteam"."kol_activation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"period" text NOT NULL,
	"status" "moteteam"."kol_status" DEFAULT 'belum_bales_dm' NOT NULL,
	"username" text NOT NULL,
	"ig_link" text,
	"ig_followers" integer,
	"ig_er" numeric,
	"tiktok_link" text,
	"tiktok_followers" integer,
	"tiktok_er" numeric,
	"placement" text,
	"link_post" text,
	"date_post" date,
	"fee" numeric DEFAULT '0' NOT NULL,
	"product_cost" numeric DEFAULT '0' NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moteteam"."kol_activation" ADD CONSTRAINT "kol_activation_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "moteteam"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kol_client_period_idx" ON "moteteam"."kol_activation" USING btree ("client_id","period");