ALTER TABLE "moteteam"."offline_metric" ADD COLUMN "target_omset" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "moteteam"."offline_metric" ADD COLUMN "number_of_bill" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "moteteam"."offline_metric" ADD COLUMN "page_view" integer;--> statement-breakpoint
ALTER TABLE "moteteam"."offline_metric" ADD COLUMN "click_ota" integer;