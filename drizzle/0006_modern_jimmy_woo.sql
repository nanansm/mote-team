CREATE INDEX "task_client_idx" ON "moteteam"."task" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "moteteam"."task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_due_date_idx" ON "moteteam"."task" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "task_posting_date_idx" ON "moteteam"."task" USING btree ("posting_date");--> statement-breakpoint
CREATE INDEX "task_parent_idx" ON "moteteam"."task" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "task_assignee_member_idx" ON "moteteam"."task_assignee" USING btree ("team_member_id");