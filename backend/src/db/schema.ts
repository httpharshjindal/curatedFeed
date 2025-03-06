import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  integer,
  boolean,
  pgEnum,
  json,
  uniqueIndex
} from "drizzle-orm/pg-core";

// Category enum
export const categoryEnum = pgEnum('category', [
  'technology',
  'ai',
  'business',
  'science',
  'health',
  'politics',
  'entertainment'
]);

// Users table (for Clerk integration)
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // Clerk user ID
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Articles table (updated)
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  link: text('link').notNull().unique(),
  snippet: text('snippet'),
  category: categoryEnum('category').notNull(),
  position: integer('position'),
  processed: boolean('processed').default(false),
  processingError: text('processing_error'),
  content:text('content'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Processed articles table
export const processedArticles = pgTable('processed_articles', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id),
  refinedTitle: text('refined_title').notNull(),
  refinedArticle: text('refined_article').notNull(),
  summary: text('summary').notNull(),
  keyTakeaways: json('key_takeaways').notNull(),
  originalContent: json('original_content'),
  processedAt: timestamp('processed_at').defaultNow()
});

// User Interests (Many-to-Many relationship with categories)
export const userInterests = pgTable('user_interests', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  category: categoryEnum('category').notNull(),
}, (table) => ({
  uniqueUserCategory: uniqueIndex('user_category_idx').on(table.userId, table.category)
}));

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  articleId: integer("article_id")
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserArticle: uniqueIndex('user_article_idx').on(table.userId, table.articleId)
}));
