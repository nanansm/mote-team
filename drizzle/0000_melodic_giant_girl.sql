CREATE SCHEMA "moteteam";
--> statement-breakpoint
CREATE TYPE "moteteam"."client_status" AS ENUM('active', 'on_hold', 'offboarding');--> statement-breakpoint
CREATE TYPE "moteteam"."task_status" AS ENUM('not_started', 'in_progress', 'done', 'ready', 'scheduled', 'published');--> statement-breakpoint
CREATE TYPE "moteteam"."team_division" AS ENUM('performance', 'creative');--> statement-breakpoint
CREATE TYPE "moteteam"."type_content" AS ENUM('carousel', 'reels');--> statement-breakpoint
CREATE TABLE "moteteam"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moteteam"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "moteteam"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "moteteam"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moteteam"."client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" "moteteam"."client_status" DEFAULT 'active' NOT NULL,
	"contract_end" date,
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moteteam"."invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"token" text NOT NULL,
	"invited_by" text,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "moteteam"."monthly_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text NOT NULL,
	"team_member_id" uuid,
	"score_initiative" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moteteam"."okr" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"objective" text NOT NULL,
	"key_result" text,
	"target" numeric,
	"progress" numeric,
	"period" text,
	"client_id" uuid,
	"team_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moteteam"."task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"status" "moteteam"."task_status" DEFAULT 'not_started' NOT NULL,
	"client_id" uuid NOT NULL,
	"parent_id" uuid,
	"due_date" date,
	"posting_date" date,
	"type_content" "moteteam"."type_content",
	"caption" text,
	"link_materi" text,
	"link_output" text,
	"link_ig" text,
	"link_tiktok" text,
	"media_url" text,
	"monthly_performance_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moteteam"."task_assignee" (
	"task_id" uuid NOT NULL,
	"team_member_id" uuid NOT NULL,
	CONSTRAINT "task_assignee_task_id_team_member_id_pk" PRIMARY KEY("task_id","team_member_id")
);
--> statement-breakpoint
CREATE TABLE "moteteam"."team_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text,
	"name" text NOT NULL,
	"role" text,
	"division" "moteteam"."team_division",
	"active" boolean DEFAULT true NOT NULL,
	"grade" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moteteam"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "moteteam"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "moteteam"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."invitation" ADD CONSTRAINT "invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "moteteam"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."monthly_performance" ADD CONSTRAINT "monthly_performance_team_member_id_team_member_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "moteteam"."team_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."okr" ADD CONSTRAINT "okr_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "moteteam"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."okr" ADD CONSTRAINT "okr_team_member_id_team_member_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "moteteam"."team_member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD CONSTRAINT "task_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "moteteam"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD CONSTRAINT "task_parent_id_task_id_fk" FOREIGN KEY ("parent_id") REFERENCES "moteteam"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD CONSTRAINT "task_monthly_performance_id_monthly_performance_id_fk" FOREIGN KEY ("monthly_performance_id") REFERENCES "moteteam"."monthly_performance"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task" ADD CONSTRAINT "task_created_by_team_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "moteteam"."team_member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task_assignee" ADD CONSTRAINT "task_assignee_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "moteteam"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task_assignee" ADD CONSTRAINT "task_assignee_team_member_id_team_member_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "moteteam"."team_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."team_member" ADD CONSTRAINT "team_member_auth_user_id_user_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "moteteam"."user"("id") ON DELETE set null ON UPDATE no action;