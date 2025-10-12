/**
 * Context Caching for Gemini 2.5
 * Caches article content to speed up repeated questions and reduce API costs
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface CachedContext {
  cachedContentId: string;
  articleTitle: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory cache (for serverless, you'd use Redis or similar)
const cache = new Map<string, CachedContext>();
const CACHE_DURATION = 3600; // 1 hour in seconds

/**
 * Get or create a cached context for an article
 */
export async function getCachedContext(
  articleTitle: string,
  articleText: string
): Promise<string | null> {
  try {
    const cacheKey = generateCacheKey(articleTitle);
    
    // Check if we have a valid cache entry
    const existing = cache.get(cacheKey);
    if (existing && existing.expiresAt > Date.now()) {
      console.log(`[Context Cache] Using cached context for: ${articleTitle}`);
      return existing.cachedContentId;
    }

    // Create new cached content
    console.log(`[Context Cache] Creating new cache for: ${articleTitle}`);
    const cachedContent = await genAI.cacheManager.create({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Article Title: ${articleTitle}\n\nArticle Content:\n${articleText}\n\nYou are a helpful financial education assistant. Use the above article context to answer user questions.`
            }
          ]
        }
      ],
      ttl: CACHE_DURATION, // Cache for 1 hour
    });

    const cacheEntry: CachedContext = {
      cachedContentId: cachedContent.name,
      articleTitle,
      createdAt: Date.now(),
      expiresAt: Date.now() + (CACHE_DURATION * 1000),
    };

    cache.set(cacheKey, cacheEntry);
    console.log(`[Context Cache] ✓ Cached context created: ${cachedContent.name}`);
    
    return cachedContent.name;
  } catch (error) {
    console.error("[Context Cache] Failed to create cache:", error);
    return null; // Fail gracefully - use without caching
  }
}

/**
 * Use a cached context to generate a response
 */
export async function generateWithCache(
  cachedContentId: string,
  message: string,
  options: {
    image?: string;
    images?: string[];
    pdfText?: string;
    pdfName?: string;
  } = {}
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      cachedContent: cachedContentId,
    });

    // Build the user message
    let userMessage = message;
    if (options.pdfText) {
      const pdfExcerpt = options.pdfText.substring(0, 5000);
      userMessage = `The user uploaded a PDF (${options.pdfName}):\n\n${pdfExcerpt}\n\n${message}`;
    }

    // Handle multimodal content
    if (options.images && options.images.length > 0) {
      const content: any[] = [];
      options.images.forEach(img => {
        content.push({
          inlineData: { data: img, mimeType: "image/png" }
        });
      });
      content.push(userMessage);
      
      const result = await model.generateContent(content);
      return result.response.text();
    } else if (options.image) {
      const result = await model.generateContent([
        { inlineData: { data: options.image, mimeType: "image/png" } },
        userMessage
      ]);
      return result.response.text();
    } else {
      const result = await model.generateContent(userMessage);
      return result.response.text();
    }
  } catch (error) {
    console.error("[Context Cache] Failed to generate with cache:", error);
    throw error;
  }
}

/**
 * Stream response using cached context
 */
export async function* streamWithCache(
  cachedContentId: string,
  message: string,
  options: {
    image?: string;
    images?: string[];
    pdfText?: string;
    pdfName?: string;
  } = {}
): AsyncGenerator<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      cachedContent: cachedContentId,
    });

    // Build the user message
    let userMessage = message;
    if (options.pdfText) {
      const pdfExcerpt = options.pdfText.substring(0, 5000);
      userMessage = `The user uploaded a PDF (${options.pdfName}):\n\n${pdfExcerpt}\n\n${message}`;
    }

    // Handle multimodal content
    let result;
    if (options.images && options.images.length > 0) {
      const content: any[] = [];
      options.images.forEach(img => {
        content.push({
          inlineData: { data: img, mimeType: "image/png" }
        });
      });
      content.push(userMessage);
      result = await model.generateContentStream(content);
    } else if (options.image) {
      result = await model.generateContentStream([
        { inlineData: { data: options.image, mimeType: "image/png" } },
        userMessage
      ]);
    } else {
      result = await model.generateContentStream(userMessage);
    }

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  } catch (error) {
    console.error("[Context Cache] Failed to stream with cache:", error);
    throw error;
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCaches() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
      console.log(`[Context Cache] Removed expired cache: ${entry.articleTitle}`);
    }
  }
}

/**
 * Generate a cache key from article title
 */
function generateCacheKey(articleTitle: string): string {
  return `article:${articleTitle.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}`;
}

// Clean up expired caches every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredCaches, 10 * 60 * 1000);
}

