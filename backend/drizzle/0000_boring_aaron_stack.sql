CREATE TYPE "public"."category" AS ENUM('technology', 'ai', 'business', 'science', 'health', 'politics', 'entertainment');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"snippet" text,
	"category" "category" NOT NULL,
	"position" integer,
	"processed" boolean DEFAULT false,
	"processing_error" text,
	CONSTRAINT "articles_link_unique" UNIQUE("link")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"article_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "processed_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer,
	"refined_title" text NOT NULL,
	"refined_article" text NOT NULL,
	"summary" text NOT NULL,
	"key_takeaways" json NOT NULL,
	"original_content" json,
	"processed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"category" "category" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_articles" ADD CONSTRAINT "processed_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_article_idx" ON "bookmarks" USING btree ("user_id","article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_category_idx" ON "user_interests" USING btree ("user_id","category");