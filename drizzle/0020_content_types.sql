ALTER TYPE "moteteam"."type_content" RENAME TO "type_content_old";--> statement-breakpoint
CREATE TYPE "moteteam"."type_content" AS ENUM ('ig_post', 'ig_slide', 'reels', 'ig_story', 'tiktok', 'document', 'other');--> statement-breakpoint
ALTER TABLE "moteteam"."task" ALTER COLUMN "type_content" TYPE "moteteam"."type_content" USING (CASE "type_content"::text WHEN 'carousel' THEN 'ig_slide' ELSE "type_content"::text END::"moteteam"."type_content");--> statement-breakpoint
ALTER TABLE "moteteam"."task_template" ALTER COLUMN "type_content" TYPE "moteteam"."type_content" USING (CASE "type_content"::text WHEN 'carousel' THEN 'ig_slide' ELSE "type_content"::text END::"moteteam"."type_content");--> statement-breakpoint
DROP TYPE "moteteam"."type_content_old";