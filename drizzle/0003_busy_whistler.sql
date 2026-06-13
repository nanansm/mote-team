ALTER TYPE "moteteam"."team_division" ADD VALUE 'growth';--> statement-breakpoint
ALTER TYPE "moteteam"."team_division" ADD VALUE 'business';--> statement-breakpoint
ALTER TABLE "moteteam"."client" ADD COLUMN "meta_ad_account_id" text;--> statement-breakpoint
ALTER TABLE "moteteam"."team_member" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "moteteam"."team_member" ADD COLUMN "reports_to" text;