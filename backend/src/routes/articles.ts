// src/routes/articles.ts
import { Hono } from "hono";
import { db } from "../db/drizzle";
import { articles } from "../db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/authMiddleware";
import { userInterests } from "../db/schema";

// Define Clerk user type
interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
}

type Variables = {
  user: ClerkUser;
};

const articlesRoute = new Hono<{ Variables: Variables }>();

// For the landing page: limited articles
articlesRoute.get("/", async (c) => {
  try {
    const landingArticles = await db
      .select()
      .from(articles)
      .orderBy(sql`RANDOM() * EXTRACT(EPOCH FROM NOW() - created_at)`)
      .limit(10);
    return c.json({
      success: true,
      articles: landingArticles,
    });
  } catch (err) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch articles",
      },
      500
    );
  }
});

// Get all articles with their categories
articlesRoute.get("/discover", authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // Get total count
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(articles);

    // Fetch paginated articles
    const allArticles = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(pageSize)
      .offset(offset);

    return c.json({
      success: true,
      articles: allArticles,
      total: totalCount[0].count
    });
  } catch (err) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch articles",
      },
      500
    );
  }
});

articlesRoute.get("/intrest", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const userId = user.id;
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // Get user interests
    const userInterestsList = await db
      .select({ category: userInterests.category })
      .from(userInterests)
      .where(eq(userInterests.userId, userId));

    if (userInterestsList.length === 0) {
      return c.json({ 
        success: false,
        message: "No interests found",
        articles: [],
        total: 0
      });
    }

    // Extract categories from user interests
    const categories = userInterestsList.map(interest => interest.category);

    // Get total count
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(articles)
      .where(inArray(articles.category, categories));

    // Fetch paginated articles
    const interestArticles = await db
      .select()
      .from(articles)
      .where(inArray(articles.category, categories))
      .orderBy(desc(articles.createdAt))
      .limit(pageSize)
      .offset(offset);

    return c.json({
      success: true,
      articles: interestArticles,
      total: totalCount[0].count
    });
  } catch (error) {
    console.error('Error fetching interest articles:', error);
    return c.json({ 
      success: false,
      error: "Failed to fetch interest articles" 
    }, 500);
  }
});
export default articlesRoute;
