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
  let score = 50; // Base score
  const factors: string[] = [];
  let domainType = "Unknown";
  let securityStatus = "Not secured";

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // Category 1: Domain Authority (+30 points)
    // High trust institutional domains
    const highTrustDomains = [".edu", ".gov", ".org"];
    if (highTrustDomains.some(d => domain.endsWith(d))) {
      score += 30;
      const domainTypeMatch = highTrustDomains.find(d => domain.endsWith(d));
      if (domainTypeMatch === ".edu") {
        domainType = "Educational Institution";
        factors.push("✓ Domain Type: Educational (.edu) - Academic institution (+30 pts)");
      } else if (domainTypeMatch === ".gov") {
        domainType = "Government";
        factors.push("✓ Domain Type: Government (.gov) - Official government source (+30 pts)");
      } else if (domainTypeMatch === ".org") {
        domainType = "Organization";
        factors.push("✓ Domain Type: Organization (.org) - Non-profit/established org (+30 pts)");
      }
    } else {
      domainType = "Commercial (.com/.net) or Other";
      factors.push("○ Domain Type: Commercial/Other - Standard web domain (+0 pts)");
    }

    // Category 2: Established Reference Sources (+20 points)
    if (domain.includes("wikipedia") || domain.includes("britannica")) {
      score += 20;
      factors.push("✓ Source Type: Established encyclopedia with editorial oversight (+20 pts)");
    }

    // Category 3: Transport Security (+10 points)
    if (urlObj.protocol === "https:") {
      score += 10;
      securityStatus = "HTTPS secured";
      factors.push("✓ Security: HTTPS encryption verified - data integrity protected (+10 pts)");
    } else {
      securityStatus = "HTTP only (not secured)";
      factors.push("✗ Security: No HTTPS - unencrypted connection (-10 pts security risk)");
      score -= 10;
    }

    // Category 4: Reputable Publishers (+15 points)
    const reputableSources: { [key: string]: string } = {
      "bbc": "BBC - Established news organization",
      "reuters": "Reuters - International news agency",
      "nature": "Nature - Peer-reviewed scientific journal",
      "science": "Science - Peer-reviewed scientific journal",
      "nytimes": "New York Times - Major newspaper",
      "wsj": "Wall Street Journal - Financial newspaper",
      "economist": "The Economist - Business/economics publication",
      "forbes": "Forbes - Business publication",
      "investopedia": "Investopedia - Financial education resource"
    };
    
    const matchedSource = Object.entries(reputableSources).find(([key]) => domain.includes(key));
    if (matchedSource) {
      score += 15;
      factors.push(`✓ Publisher: ${matchedSource[1]} - Known reputable source (+15 pts)`);
    }

    // Category 5: URL Structure Quality (+5 points)
    if (urlObj.pathname && urlObj.pathname.length > 1) {
      score += 5;
      factors.push("✓ URL Structure: Deep link to specific content (+5 pts)");
    } else {
      factors.push("○ URL Structure: Homepage link - less specific (+0 pts)");
    }

  } catch (e) {
    score = 30;
    factors.push("✗ ERROR: Malformed or invalid URL - cannot verify trustworthiness");
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