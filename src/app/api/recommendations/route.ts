import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Fallback recommendations when AI fails
function getFallbackRecommendations(difficulty: string, completedSteps: number) {
  const beginnerTopics = [
    { topic: "Budget", reason: "Essential foundation for managing money", difficulty: "beginner", relevance: "Core personal finance skill" },
    { topic: "Emergency fund", reason: "Financial safety net for unexpected expenses", difficulty: "beginner", relevance: "Protects against financial emergencies" },
    { topic: "Compound interest", reason: "How money grows over time", difficulty: "beginner", relevance: "Key to building wealth" },
    { topic: "Credit score", reason: "Understanding credit and borrowing", difficulty: "beginner", relevance: "Affects loan rates and opportunities" },
    { topic: "Debt", reason: "Managing and eliminating debt", difficulty: "beginner", relevance: "Critical for financial freedom" }
  ];

  const intermediateTopics = [
    { topic: "401(k)", reason: "Employer-sponsored retirement savings", difficulty: "intermediate", relevance: "Maximize employer matching" },
    { topic: "Individual retirement account", reason: "Personal retirement savings options", difficulty: "intermediate", relevance: "Tax-advantaged retirement planning" },
    { topic: "Life insurance", reason: "Protecting family's financial future", difficulty: "intermediate", relevance: "Essential risk management" },
    { topic: "Health savings account", reason: "Tax-advantaged medical savings", difficulty: "intermediate", relevance: "Triple tax benefits" },
    { topic: "Mortgage loan", reason: "Home buying and financing", difficulty: "intermediate", relevance: "Major financial decision" }
  ];

  const advancedTopics = [
    { topic: "Backdoor Roth IRA", reason: "Advanced retirement strategy for high earners", difficulty: "advanced", relevance: "Tax optimization technique" },
    { topic: "Estate planning", reason: "Wealth transfer and inheritance planning", difficulty: "advanced", relevance: "Protect family wealth" },
    { topic: "Tax bracket", reason: "Understanding progressive tax system", difficulty: "advanced", relevance: "Tax planning optimization" },
    { topic: "Capital gains tax", reason: "Taxes on investment profits", difficulty: "advanced", relevance: "Investment tax strategy" },
    { topic: "529 plan", reason: "Education savings with tax benefits", difficulty: "advanced", relevance: "College funding strategy" }
  ];

  if (difficulty === "beginner" || completedSteps < 3) {
    return beginnerTopics.slice(0, 5);
  } else if (difficulty === "intermediate" || completedSteps < 7) {
    return intermediateTopics.slice(0, 5);
  } else {
    return advancedTopics.slice(0, 5);
  }
}

interface ProgressData {
  stepId: string;
  completed: boolean;
  stars: number;
  articlesRead: string[];
}

interface RecommendationRequest {
  currentStep: string;
  progress: Record<string, ProgressData>;
  articlesRead: string[];
  lastSearches: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { currentStep, progress, articlesRead, lastSearches }: RecommendationRequest = await request.json();

    // Calculate user's knowledge level
    const completedSteps = Object.values(progress).filter((p) => p.completed).length;
    const totalArticlesRead = articlesRead.length;
    const averageStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0) / Math.max(Object.keys(progress).length, 1);

    // Determine difficulty level
    let difficulty = "beginner";
    if (completedSteps >= 5 || averageStars >= 2.5) {
      difficulty = "advanced";
    } else if (completedSteps >= 3 || totalArticlesRead >= 10) {
      difficulty = "intermediate";
    }

    const prompt = `You are a personal finance education advisor. Analyze the user's learning progress and recommend 5 specific Wikipedia article topics they should read next.

User Progress:
- Current Step: ${currentStep}
- Completed Steps: ${completedSteps}/8
- Total Articles Read: ${totalArticlesRead}
- Average Quiz Performance: ${averageStars.toFixed(1)}/3 stars
- Recent Searches: ${lastSearches.join(", ") || "None"}
- Previously Read Articles: ${articlesRead.join(", ") || "None"}
- Recommended Difficulty: ${difficulty}

Based on this progress, recommend 5 Wikipedia article topics that:
1. Match their ${difficulty} level
2. Fill knowledge gaps for their current step
3. Build on what they've already learned
4. Avoid topics they've already covered
5. Follow the r/personalfinance roadmap progression

Return ONLY a JSON array of 5 objects with this structure:
[
  {
    "topic": "exact Wikipedia article title",
    "reason": "why this is recommended (1 sentence)",
    "difficulty": "beginner|intermediate|advanced",
    "relevance": "how it helps their current step (1 sentence)"
  }
]

Do not include any markdown, explanations, or text outside the JSON array.`;

    // Use Gemini with model fallback
    const candidateModels = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-pro",
    ];

    let text = "";
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        break;
      } catch (err) {
        // try next
      }
    }


    // Parse AI response with fallback
    let recommendations = [];
    
    try {
      // Clean up the response text
      const cleanedText = text.trim()
        .replace(/```json\n?/g, '')
        .replace(/\n?```/g, '')
        .trim();
      
      recommendations = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error("Invalid recommendations format");
      }
      
    } catch (parseError) {
      // Fallback recommendations based on user level
      recommendations = getFallbackRecommendations(difficulty, completedSteps);
    }

    return NextResponse.json({
      recommendations,
      userLevel: difficulty,
      progressSummary: {
        completedSteps,
        totalArticlesRead,
        averageStars: parseFloat(averageStars.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
