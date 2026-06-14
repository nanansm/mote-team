CREATE TABLE "moteteam"."task_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"author_user_id" text,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moteteam"."task_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type_content" "moteteam"."type_content",
	"day_of_month" integer,
	"caption" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moteteam"."client" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "moteteam"."task_comment" ADD CONSTRAINT "task_comment_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "moteteam"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task_comment" ADD CONSTRAINT "task_comment_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "moteteam"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moteteam"."task_template" ADD CONSTRAINT "task_template_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "moteteam"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_comment_task_idx" ON "moteteam"."task_comment" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_template_client_idx" ON "moteteam"."task_template" USING btree ("client_id");