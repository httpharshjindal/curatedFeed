import axios from "axios";
import "dotenv/config";
import { db } from "../db/drizzle";
import { articles, processedArticles, categoryEnum } from "../db/schema";
import { eq } from "drizzle-orm";
import FirecrawlApp from "@mendable/firecrawl-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
const schema = z.object({
  title: z.string(),
  content: z.string(),
});

// Initialize Firecrawl client
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

// Initialize Google AI - updated model name
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("Missing GOOGLE_AI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
// Updated model name for gemini-1.5-pro or gemini-1.0-pro
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Step 1: Fetch article links from Serper API
export const fetchArticleLinks = async () => {
  const newArticles = [];
  try {
    // Get all categories from the enum
    const categories = categoryEnum.enumValues;
    for (const category of categories) {
      let data = JSON.stringify({
        q: `latest ${category} articles`,
        tbs: "qdr:h", // Last hour
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://google.serper.dev/search",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        data: data,
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
          // Store new article reference
          const [insertedArticle] = await db
            .insert(articles)
            .values({
              title: result.title,
              link: result.link,
              snippet: result.snippet,
              category: category,
              position: result.position,
              processed: false,
            })
            .returning();

          newArticles.push(insertedArticle);
          console.log(`Stored article reference: ${result.title}`);
        }
      }

      console.log(`Fetched article links for ${category} category`);
      // Add delay between categories
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return newArticles;
  } catch (err) {
    console.error("Error fetching article links:", err);
    return [];
  }
};

// Step 2: Process unprocessed articles - scrape and enhance with AI
export const processUnprocessedArticles = async (limit = 5) => {
  try {
    const unprocessedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.processed, false))
      .limit(limit);
    console.log(
      `Found ${unprocessedArticles.length} unprocessed articles to process`
    );

    for (const article of unprocessedArticles) {
      try {
        // Step 2a: Scrape article content using Firecrawl
        console.log(`Scraping content for: ${article.title}`);
        const crawlResponse: any = await firecrawl.extract([article.link], {
          prompt: `Fetch the title which starts with ${article.title} and the content of the article which starts with ${article.snippet} and the conent should be of atlest 100 lines long`,
          schema,
        });

        if (!crawlResponse.success) {
          throw new Error(`Failed to crawl: ${crawlResponse.error}`);
        }
        console.log(crawlResponse);

        const document = crawlResponse.data;
        console.log("documet", document);
        // Step 2b: Process with Google AI
        console.log(`Enhancing content with AI for: ${article.title}`);
        const prompt = `
              I have scraped an article about ${article.category}.
              Here is the scraped content:

              Title: ${article.title}
              Original snippet: ${article.snippet}
              Content: ${document.content || "No content available"}

              Please analyze this content and provide:
              1. An improved, SEO-friendly title (keep it accurate to the content)
              2. A well-structured article with proper formatting, paragraphs, and headers
              3. A concise summary (3-4 sentences)
              4. 5-7 key takeaways as bullet points
              5. and dont give html tags in the content just give simple text

              Format your response as valid JSON with these fields:
              {
                "refinedTitle": "string",
                "refinedArticle": "string",
                "summary": "string",
                "keyTakeaways": ["string", "string", ...]
              }
              `;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        let processedContent;
        try {
          const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/); // Improved regex with flexible whitespace
          if (jsonMatch && jsonMatch[1]) {
            try {
              processedContent = JSON.parse(jsonMatch[1].trim()); // Parse extracted JSON with trimming
              console.log(
                "processed content from code block",
                processedContent
              );
            } catch (jsonError: any) {
              console.error("Failed to parse extracted JSON:", jsonError);
              throw new Error(
                "Failed to parse AI response: " + jsonError.message
              );
            }
          } else {
            const possibleJsonMatch = aiResponse.match(/\{\s*"[^"]+"\s*:/);
            if (possibleJsonMatch) {
              try {
                // Try to find the full JSON object
                const startIndex = aiResponse.indexOf("{");
                const endIndex = aiResponse.lastIndexOf("}") + 1;
                if (startIndex >= 0 && endIndex > startIndex) {
                  const jsonContent = aiResponse.substring(
                    startIndex,
                    endIndex
                  );
                  processedContent = JSON.parse(jsonContent);
                  console.log(
                    "processed content from raw text",
                    processedContent
                  );
                } else {
                  throw new Error("Could not locate complete JSON object");
                }
              } catch (rawJsonError) {
                console.error("Failed to extract raw JSON:", rawJsonError);
                throw new Error("Failed to parse any JSON from AI response");
              }
            } else {
              throw new Error("No valid JSON found in AI response");
            }
          }
        } catch (e) {
          console.error("Error parsing AI response as JSON:", e);
        }
        // Step 3: Store processed content
        await db.insert(processedArticles).values({
          articleId: article.id,
          refinedTitle: processedContent.refinedTitle,
          refinedArticle: processedContent.refinedArticle,
          summary: processedContent.summary,
          keyTakeaways: processedContent.keyTakeaways,
          originalContent: document,
          processedAt: new Date(),
        });

        // Update the article as processed
        await db
          .update(articles)
          .set({ processed: true, content: document.content })
          .where(eq(articles.id, article.id));

        console.log(
          `Successfully processed article: ${processedContent.refinedTitle}`
        );

        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (articleError: any) {
        console.error(`Error processing article ${article.id}:`, articleError);
        // Mark as failed but don't stop the entire process
        await db
          .update(articles)
          .set({
            processed: true,
            processingError:
              articleError.message || "Failed to process article",
          })
          .where(eq(articles.id, article.id));

        // Add a longer delay after errors to let rate limits reset
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log("Finished processing batch of articles");
  } catch (err) {
    console.error("Error in article processing workflow:", err);
  }
};

// Main function to run in cron job
export const runArticleProcessingWorkflow = async () => {
  console.log("Starting article processing workflow...");

  // Step 1: Fetch new articles
  const newArticles = await fetchArticleLinks();
  console.log(`Fetched ${newArticles.length} new articles`);

  // Step 2: Process a batch of unprocessed articles (reduced limit to avoid rate limits)
  if (newArticles.length > 0 || true) {
    // Process even if no new articles found, but with smaller batch
    await processUnprocessedArticles(5); // Reduced from 10 to 5
  }

  console.log("Article processing workflow completed");
};
