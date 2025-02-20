ALTER TABLE "user_interests" DROP CONSTRAINT "user_interests_user_id_category_pk";--> statement-breakpoint
ALTER TABLE "user_interests" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;