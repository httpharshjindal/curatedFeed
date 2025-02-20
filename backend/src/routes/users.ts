// src/routes/articles.ts
import { Hono } from 'hono';
import { db } from '../db/drizzle';
import { users, userInterests } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/authMiddleware';
import type { MiddlewareHandler } from 'hono';

// Define Clerk user type
interface ClerkUser {
  id: string;
  email:string
}

// Extend Hono's context
type Variables = {
  user: ClerkUser;
};

const usersRoute = new Hono<{ Variables: Variables }>();

// For the landing page: limited articles
usersRoute.get('/', async (c) => {
  return c.json({ message: 'Users route' });
});


usersRoute.post('/interests', authMiddleware, async (c) => {
  try {
    const clerkUser = c.get('user');
    const userId = clerkUser.id;
    const { interests } = await c.req.json();

    if (!Array.isArray(interests)) {
      return c.json({ error: 'Interests must be an array' }, 400);
    }

    // Delete existing interests
    await db
      .delete(userInterests)
      .where(eq(userInterests.userId, userId));

    // Insert new interests
    for (const category of interests) {
      await db.insert(userInterests).values({
        userId,
        category
      });
    }

    return c.json({ 
      message: 'Interests updated successfully',
      interests 
    });
  } catch (error) {
    console.error('Error updating interests:', error);
    return c.json({ error: 'Failed to update interests' }, 500);
  }
});

usersRoute.get('/interests', authMiddleware, async (c) => {
  try {
    const clerkUser = c.get('user');
    const userId = clerkUser.id;

    // Fetch user interests from database
    const userInterestsList = await db
      .select({ category: userInterests.category })
      .from(userInterests)
      .where(eq(userInterests.userId, userId));

    return c.json({ 
      success: true,
      interests: userInterestsList.map(interest => interest.category)
    });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    return c.json({ 
      success: false,
      error: 'Failed to fetch user interests' 
    }, 500);
  }
});

export default usersRoute;

