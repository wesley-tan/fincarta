import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, ageLevel } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    // Create age-appropriate prompt
    let prompt = "";
    switch (ageLevel) {
      case 12:
        prompt = `Explain this topic in simple, fun language for a 12-year-old. Use everyday examples and avoid complex jargon:\n\n${text}`;
        break;
      case 20:
        prompt = `Explain this topic clearly for a college student. Include key concepts and context:\n\n${text}`;
        break;
      case 40:
        prompt = `Provide a comprehensive, professional explanation of this topic with nuanced details:\n\n${text}`;
        break;
      default:
        prompt = `Summarize this text concisely:\n\n${text}`;
    }

    // Use OpenAI-compatible endpoint (placeholder for now)
    // In production, you'd use actual OpenAI API or other LLM service
    
    // For demo purposes, create a mock summary based on age level
    const mockSummary = generateMockSummary(text, ageLevel);

    return NextResponse.json({
      summary: mockSummary,
      ageLevel,
    });
  } catch (error) {
    console.error("Summarize API error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

function generateMockSummary(text: string, ageLevel: number): string {
  // Simple mock implementation - extract first few sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const numSentences = ageLevel === 12 ? 3 : ageLevel === 20 ? 5 : 7;
  
  let summary = sentences.slice(0, numSentences).join(". ") + ".";
  
  // Add age-appropriate prefix
  if (ageLevel === 12) {
    summary = "🎯 In simple terms: " + summary;
  } else if (ageLevel === 20) {
    summary = "📚 College level: " + summary;
  } else {
    summary = "🎓 Professional summary: " + summary;
  }
  
  return summary;
}