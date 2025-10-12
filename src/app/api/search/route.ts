import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Wikipedia API base URL
const WIKI_API = "https://en.wikipedia.org/w/api.php";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check if query is finance-related using Gemini
    let isFinanceRelated = true;
    let financeMessage = "";
    
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY not found - finance validation disabled");
    } else {
      try {
        console.log(`🔍 Validating query with Gemini: "${query}"`);
        
        const validationPrompt = `You are a finance topic validator for FinCarta, a financial education platform.

Determine if the following search query is related to finance, economics, investing, personal finance, business, or money management.

Search query: "${query}"

Respond with ONLY a JSON object in this exact format:
{
  "isFinanceRelated": true or false,
  "message": "brief explanation (one sentence)"
}

Finance-related topics include: stocks, bonds, budgeting, investing, retirement, taxes, credit, debt, savings, banking, cryptocurrency, real estate investment, insurance, financial planning, accounting, economics, business finance, etc.

Non-finance topics include: history, science, sports, entertainment, technology (unless fintech), politics (unless economic policy), geography, etc.`;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: validationPrompt }] }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.3,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        });

        // Check if response was blocked or empty
        console.log("📦 Full result object:", JSON.stringify(result, null, 2));
        
        if (!result.response) {
          console.error("❌ No response object from Gemini");
          throw new Error("No response from Gemini");
        }

        // Check for prompt feedback (blocking)
        if (result.response.promptFeedback?.blockReason) {
          console.error("🚫 Response blocked:", result.response.promptFeedback.blockReason);
          throw new Error(`Gemini blocked response: ${result.response.promptFeedback.blockReason}`);
        }

        // Try to get text from candidates if text() method fails
        let responseText = "";
        try {
          responseText = result.response.text().trim();
        } catch (textError) {
          console.warn("⚠️ text() method failed, checking candidates manually");
          const candidates = result.response.candidates;
          if (candidates && candidates[0]?.content?.parts?.[0]?.text) {
            responseText = candidates[0].content.parts[0].text.trim();
          }
        }
        
        console.log("📝 Gemini raw response:", responseText);
        
        if (!responseText) {
          console.error("❌ Empty response text from Gemini");
          console.log("Response candidates:", JSON.stringify(result.response.candidates, null, 2));
          throw new Error("Empty response text from Gemini");
        }
        
        // Remove markdown code blocks if present
        const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
        const validation = JSON.parse(jsonText);
        
        isFinanceRelated = validation.isFinanceRelated;
        financeMessage = validation.message;
        
        console.log(`✅ Validation result: isFinanceRelated=${isFinanceRelated}, message="${financeMessage}"`);
      } catch (geminiError) {
        console.error("❌ Gemini validation error:", geminiError);
        // If Gemini fails, default to allowing the search
        isFinanceRelated = true;
        financeMessage = "";
      }
    }

    // Use Wikipedia's search engine directly - it's smart and handles edge cases
    console.log(`🔍 Searching Wikipedia for: "${query}"`);
    
    const searchUrl = new URL(WIKI_API);
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", query);
    searchUrl.searchParams.set("origin", "*");

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.[0]) {
      console.error(`❌ No search results found for "${query}"`);
      return NextResponse.json(
        { error: "No results found" },
        { status: 404 }
      );
    }

    // Get the best match from search results
    const pageTitle = searchData.query.search[0].title;
    const pageId = searchData.query.search[0].pageid;
    console.log(`📄 Found article: "${pageTitle}" (ID: ${pageId})`);

    // Fetch full article content
    const contentUrl = new URL(WIKI_API);
    contentUrl.searchParams.set("action", "query");
    contentUrl.searchParams.set("format", "json");
    contentUrl.searchParams.set("prop", "extracts|links|categories|extlinks");
    contentUrl.searchParams.set("pageids", pageId.toString());
    contentUrl.searchParams.set("explaintext", "1");
    contentUrl.searchParams.set("exsectionformat", "plain");
    contentUrl.searchParams.set("pllimit", "20");
    contentUrl.searchParams.set("ellimit", "max"); // Get all external links for full transparency
    contentUrl.searchParams.set("origin", "*");

    const contentResponse = await fetch(contentUrl.toString());
    const contentData = await contentResponse.json();

    // Handle both string and number keys
    let page = contentData.query?.pages?.[pageId.toString()];
    if (!page) {
      page = contentData.query?.pages?.[pageId];
    }

    if (!page) {
      console.error(`❌ Failed to fetch content for page ID: ${pageId}`);
      return NextResponse.json(
        { error: "Failed to fetch article content" },
        { status: 500 }
      );
    }

    const fullText = page.extract || "";
    
    if (!fullText) {
      console.error(`❌ Empty content for article: "${pageTitle}"`);
      return NextResponse.json(
        { error: "Article has no content" },
        { status: 500 }
      );
    }
    
    console.log(`✅ Successfully loaded: "${pageTitle}" (${fullText.length} chars)`);
    
    // Split into sections (simple approach)
    const sections = fullText.split("\n\n\n").filter((s: string) => s.trim().length > 0);
    
    // Get related links
    const relatedLinks = page.links?.slice(0, 10).map((link: any) => link.title) || [];
    
    // Get external links (all of them for full transparency)
    const externalLinks = page.extlinks?.map((link: any) => link["*"]) || [];

    return NextResponse.json({
      title: pageTitle,
      pageId,
      fullText,
      sections: sections.slice(0, 5), // First 5 sections
      relatedLinks,
      externalLinks,
      isFinanceRelated,
      financeMessage,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
