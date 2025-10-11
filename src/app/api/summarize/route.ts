import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    let prefix = "";
    
    switch (ageLevel) {
      case 12:
        prefix = "🎯 In simple terms: ";
        prompt = `Explain this financial topic in simple, fun language for a beginner (12-year-old level). Use everyday examples and avoid complex jargon. Keep it to 3-4 sentences:\n\n${text.substring(0, 1000)}`;
        break;
      case 20:
        prefix = "📚 College level: ";
        prompt = `Explain this financial topic clearly for a college student. Include key concepts and context. Keep it to 5-6 sentences:\n\n${text.substring(0, 1000)}`;
        break;
      case 40:
        prefix = "🎓 Professional summary: ";
        prompt = `Provide a comprehensive, professional summary of this financial topic with nuanced details. Keep it to 7-8 sentences:\n\n${text.substring(0, 1000)}`;
        break;
      default:
        prefix = "";
        prompt = `Summarize this financial text concisely in 5 sentences:\n\n${text.substring(0, 1000)}`;
    }

<<<<<<< HEAD
    // Use Gemini to generate summary with model fallback
    const candidateModels = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-pro",
    ];

    let summaryText = "";
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        summaryText = response.text();
        break;
      } catch (err) {
        // try next
      }
    }

    if (!summaryText) {
      const excerpt = text.substring(0, 600).replace(/\s+/g, ' ');
      const sentences = excerpt.split(/(?<=[.!?])\s/).slice(0, 3).join(' ');
      summaryText = sentences || excerpt || "Summary temporarily unavailable.";
    }
=======
    // Use Gemini to generate summary
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summaryText = response.text();
>>>>>>> efecb4d (Fix Gemini model name: use gemini-pro instead of gemini-1.5-flash)

    return NextResponse.json({
      summary: prefix + summaryText.trim(),
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
