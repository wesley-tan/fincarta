import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse AI response
    const recommendations = JSON.parse(content.text.trim());

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