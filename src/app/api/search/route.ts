import { NextRequest, NextResponse } from "next/server";

// Wikipedia API base URL
const WIKI_API = "https://en.wikipedia.org/w/api.php";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch Wikipedia article
    const searchUrl = new URL(WIKI_API);
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", query);
    searchUrl.searchParams.set("origin", "*");

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.[0]) {
      return NextResponse.json(
        { error: "No results found" },
        { status: 404 }
      );
    }

    const pageTitle = searchData.query.search[0].title;
    const pageId = searchData.query.search[0].pageid;

    // Fetch full article content
    const contentUrl = new URL(WIKI_API);
    contentUrl.searchParams.set("action", "query");
    contentUrl.searchParams.set("format", "json");
    contentUrl.searchParams.set("prop", "extracts|links|categories|extlinks");
    contentUrl.searchParams.set("pageids", pageId.toString());
    contentUrl.searchParams.set("explaintext", "1");
    contentUrl.searchParams.set("exsectionformat", "plain");
    contentUrl.searchParams.set("pllimit", "20");
    contentUrl.searchParams.set("origin", "*");

    const contentResponse = await fetch(contentUrl.toString());
    const contentData = await contentResponse.json();

    const page = contentData.query.pages[pageId];
    const fullText = page.extract || "";
    
    // Split into sections (simple approach)
    const sections = fullText.split("\n\n\n").filter((s: string) => s.trim().length > 0);
    
    // Get related links
    const relatedLinks = page.links?.slice(0, 10).map((link: any) => link.title) || [];
    
    // Get external links
    const externalLinks = page.extlinks?.slice(0, 5).map((link: any) => link["*"]) || [];

    return NextResponse.json({
      title: pageTitle,
      pageId,
      fullText,
      sections: sections.slice(0, 5), // First 5 sections
      relatedLinks,
      externalLinks,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}