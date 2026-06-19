CREATE TYPE "moteteam"."approval_status" AS ENUM('pending', 'approved', 'revision');--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD COLUMN "approval_token" text;--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD COLUMN "approval_status" "moteteam"."approval_status";--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD COLUMN "approval_note" text;--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD CONSTRAINT "task_approval_token_unique" UNIQUE("approval_token");