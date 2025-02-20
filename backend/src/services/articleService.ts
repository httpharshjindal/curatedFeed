// src/services/articleService.ts
import axios from "axios";
import "dotenv/config";
import { db } from "../db/drizzle";
import { articles, categoryEnum } from "../db/schema";
import { eq } from "drizzle-orm";

// Function to fetch articles from Serper API
export const fetchAndStoreArticles = async () => {
  try {
    // Get all categories from the enum
    const categories = categoryEnum.enumValues;

    for (const category of categories) {

        let data = JSON.stringify({
            "q": `latest ${category} articles`,
            "tbs": "qdr:h"
        });
        
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://google.serper.dev/search',
            headers: { 
            'X-API-KEY': process.env.SERPER_API_KEY, 
            'Content-Type': 'application/json'
            },
            data : data
        };  
      const response = await axios.request(config);
      const results = response.data.organic || [];

      for (const result of results) {
        // Check if article already exists
        const existingArticle = await db
          .select()
          .from(articles)
          .where(eq(articles.link, result.link))
          .limit(1);

        if (existingArticle.length === 0) {
          await db.insert(articles).values({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
            category: category,
            position: result.position,
            date: result.date
          });
          console.log(`Stored article: ${result.title}`);
        }
      }
      console.log(`Fetched and stored articles for ${category} category`);
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("All articles fetched and stored successfully");
  } catch (err) {
    console.error("Error fetching articles:", err);
  }
};
