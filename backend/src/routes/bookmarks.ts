import { Hono } from "hono";
import { db } from "../db/drizzle";
import { bookmarks, articles } from "../db/schema";
import { authMiddleware } from "../middleware/authMiddleware";
import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { create } from "domain";

// Define Clerk user type
interface ClerkUser {
  id: string;
  email: string;
}

// Extend Hono's context
type Variables = {
  user: ClerkUser;
};

const bookmarksRoute = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all routes
bookmarksRoute.use("*", authMiddleware);

// Add a bookmark
bookmarksRoute.post("/", async (c) => {
  const user = c.get("user");
  const { articleId } = await c.req.json();

  if (!articleId) {
    return c.json({ error: "Article ID is required" }, 400);
  }

  try {
    await db
      .insert(bookmarks)
      .values({
        userId: user.id,
        articleId: articleId,
      })
      .onConflictDoNothing({
        target: [bookmarks.userId, bookmarks.articleId],
      });

    return c.json({
      success: true,
      message: "Article bookmarked successfully",
    });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return c.json(
      {
        success: false,
        error: "Failed to bookmark article",
      },
      500
    );
  }
});

// Get all bookmarked articles for a user
bookmarksRoute.get("/", async (c) => {
  const user = c.get("user");
  const page = Number(c.req.query("page")) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    // Get bookmarked articles with related article data
    const bookmarkedArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        snippet: articles.snippet,
        link: articles.link,
        category: articles.category,
        position: articles.position,
        createdAt: articles.createdAt,
        bookmarkedAt: bookmarks.createdAt,
      })
      .from(bookmarks)
      .innerJoin(articles, eq(bookmarks.articleId, articles.id))
      .where(eq(bookmarks.userId, user.id))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(bookmarks)
      .where(eq(bookmarks.userId, user.id));
    console.log(bookmarkedArticles);
    return c.json({
      success: true,
      articles: bookmarkedArticles,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        hasMore: count > page * limit,
      },
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch bookmarked articles",
      },
      500
    );
  }
});

// Remove a bookmark
bookmarksRoute.delete("/:articleId", async (c) => {
  const user = c.get("user");
  const articleId = Number(c.req.param("articleId"));

  if (!articleId) {
    return c.json({ error: "Article ID is required" }, 400);
  }

  try {
    const result = await db
      .delete(bookmarks)
      .where(
        and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId))
      )
      .returning({ deletedId: bookmarks.id });

    if (!result.length) {
      return c.json(
        {
          success: false,
          error: "Bookmark not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return c.json(
      {
        success: false,
        error: "Failed to remove bookmark",
      },
      500
    );
  }
});

// Check if an article is bookmarked
bookmarksRoute.get("/:articleId", async (c) => {
  const user = c.get("user");
  const articleId = Number(c.req.param("articleId"));

  if (!articleId) {
    return c.json({ error: "Article ID is required" }, 400);
  }

  try {
    const bookmark = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId))
      )
      .limit(1);

    return c.json({
      success: true,
      isBookmarked: bookmark,
    });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return c.json(
      {
        success: false,
        error: "Failed to check bookmark status",
      },
      500
    );
  }
});

export default bookmarksRoute;
