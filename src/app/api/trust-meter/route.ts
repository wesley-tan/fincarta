import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { links } = await request.json();

    if (!links || !Array.isArray(links)) {
      return NextResponse.json(
        { error: "Links array is required" },
        { status: 400 }
      );
    }

    // Analyze each link for trustworthiness
    const analysis = links.map(link => analyzeTrustScore(link));

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Trust meter API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze trust scores" },
      { status: 500 }
    );
  }
}

interface TrustAnalysis {
  url: string;
  score: number;
  reliability: "high" | "medium" | "low";
  factors: string[];
  color: string;
}

function analyzeTrustScore(url: string): TrustAnalysis {
  let score = 50;
  const factors: string[] = [];

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // High trust domains
    const highTrustDomains = [".edu", ".gov", ".org"];
    if (highTrustDomains.some(d => domain.endsWith(d))) {
      score += 30;
      factors.push("Educational or government domain");
    }

    // Medium trust domains
    if (domain.includes("wikipedia") || domain.includes("britannica")) {
      score += 20;
      factors.push("Established encyclopedia");
    }

    // Check for HTTPS
    if (urlObj.protocol === "https:") {
      score += 10;
      factors.push("Secure connection (HTTPS)");
    }

    // Popular news sources
    const newsSources = ["bbc", "reuters", "nature", "science"];
    if (newsSources.some(s => domain.includes(s))) {
      score += 15;
      factors.push("Reputable news/academic source");
    }

  } catch (e) {
    score = 30;
    factors.push("Unable to verify URL");
  }

  // Determine reliability level
  let reliability: "high" | "medium" | "low";
  let color: string;
  
  if (score >= 70) {
    reliability = "high";
    color = "green";
  } else if (score >= 50) {
    reliability = "medium";
    color = "yellow";
  } else {
    reliability = "low";
    color = "red";
  }

  return {
    url,
    score: Math.min(100, score),
    reliability,
    factors,
    color,
  };
}