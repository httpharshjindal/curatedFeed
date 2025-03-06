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
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});


if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("Missing GOOGLE_AI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export const fetchArticleLinks = async () => {
  const newArticles = [];
  try {
    const categories = categoryEnum.enumValues;
    for (const category of categories) {
      let data = JSON.stringify({
        q: `latest ${category} articles`,
        tbs: "qdr:h",
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
        const existingArticle = await db
          .select()
          .from(articles)
          .where(eq(articles.link, result.link))
          .limit(1);

        if (existingArticle.length === 0) {
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
          const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/); 
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
        await db.insert(processedArticles).values({
          articleId: article.id,
          refinedTitle: processedContent.refinedTitle,
          refinedArticle: processedContent.refinedArticle,
          summary: processedContent.summary,
          keyTakeaways: processedContent.keyTakeaways,
          originalContent: document,
          processedAt: new Date(),
        });

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
        await db
          .update(articles)
          .set({
            processed: true,
            processingError:
              articleError.message || "Failed to process article",
          })
          .where(eq(articles.id, article.id));

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log("Finished processing batch of articles");
  } catch (err) {
    console.error("Error in article processing workflow:", err);
  }
};

export const runArticleProcessingWorkflow = async () => {
  console.log("Starting article processing workflow...");
    const newArticles = await fetchArticleLinks();
  console.log(`Fetched ${newArticles.length} new articles`);
  

  if (newArticles.length > 0) {
    const batchSize = 5;
    const numberOfBatches = Math.ceil(newArticles.length / batchSize);
    console.log(`Processing ${numberOfBatches} batches of up to ${batchSize} articles each`);
    
    for (let batch = 0; batch < numberOfBatches; batch++) {
      console.log(`Processing batch ${batch + 1} of ${numberOfBatches}`);
      await processUnprocessedArticles(batchSize);
      

      if (batch < numberOfBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log("Article processing workflow completed");
};