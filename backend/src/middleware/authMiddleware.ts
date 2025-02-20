// src/middleware/authMiddleware.ts
import type { MiddlewareHandler } from "hono";
import { verifyToken } from "@clerk/backend";
import "dotenv/config";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from '../db/drizzle';


export const authMiddleware: MiddlewareHandler = async (c, next) => {
  console.log("authMiddleware");
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized: No token provided" }, 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return c.json({ error: "Unauthorized: Invalid token format" }, 401);
  }
  console.log("token", token);

  try {
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    console.log("claims", claims);
    const response = await clerkClient.users.getUser(claims.sub);
    console.log("response", response.emailAddresses[0].emailAddress);
    const user = {
      id: claims.sub,
      email: response.emailAddresses[0].emailAddress,
    };
    console.log("user", user);
    c.set("user", user);

    const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (existingUser.length === 0) {
    // Create new user
    await db.insert(users).values({
      id: user.id,
      email: user.email,
    });
    return c.json({ 
      message: 'User created successfully',
      user: { id: user.id, email: user.email }
    });
  }
    return next();
  } catch (error) {
    console.error("Token verification error:", error);
    return c.json({ error: "Unauthorized: Token error" }, 401);
  }
};
