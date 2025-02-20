CREATE UNIQUE INDEX "user_article_idx" ON "bookmarks" USING btree ("user_id","article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_category_idx" ON "user_interests" USING btree ("user_id","category");--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_link_unique" UNIQUE("link");