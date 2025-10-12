import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function POST(request: NextRequest) {
  try {
    const { text, ageLevel } = await request.json();
    const level = {1: "beginner", 2: "intermediate", 3: "advanced"}[ageLevel as 1 | 2 | 3] || "intermediate";
    if (!text) {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    // Create age-appropriate prompt
    let prompt = "";
    switch (ageLevel) {
      case 1:
        prompt = `Explained in simple, fun language for a 12-year-old. Use everyday examples and avoid complex jargon:\n\n${text}`;
        break;
      case 2:
        prompt = `Explained clearly for a college student. Include key concepts and context:\n\n${text}`;
        break;
      case 3:
        prompt = `Providing a comprehensive, professional explanation of this topic with nuanced details:\n\n${text}`;
        break;
      default:
        prompt = `Summarize this text concisely:\n\n${text}`;
    }

    let summary = "";

    try {
      
      const validationPrompt = `You are a summarizer for FinCarta, a financial education platform.

          Provide a clear, concise summary appropriate for a ${level} audience. 

          Do not talk about the identity of the person, but the text should be:
          ${prompt}

          This text should be raw text with no formatting. Do not inlcude any asterisks or hashtags
          
          This is the wikipedia article you should summarize: """${text}"""
          `;

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

      
      if (!result.response) {
        throw new Error("No response from Gemini");
      }

      // Check for prompt feedback (blocking)

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
      
      summary = responseText;      
      
    } catch (geminiError) {
      console.error("❌ Gemini validation error:", geminiError);
      // If Gemini fails, default to allowing the search
    }
 

    return NextResponse.json({
      summary,
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
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const numSentences = ageLevel === 1 ? 3 : ageLevel === 2 ? 5 : 7;

  const summaryBody = sentences.slice(0, numSentences).join(". ") + (sentences.length ? "." : "");

  // Add age-appropriate prefix
  if (ageLevel === 1) {
    return "🎯 In simple terms: " + summaryBody;
  } else if (ageLevel === 2) {
    return "📚 College level: " + summaryBody;
  } else {
    return "🎓 Professional summary: " + summaryBody;
  }
}

