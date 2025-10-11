import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, title } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    // Generate quiz questions based on the text
    // In production, this would use an LLM to generate contextual questions
    const questions = generateMockQuiz(text, title);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function generateMockQuiz(text: string, title: string): QuizQuestion[] {
  // Extract key sentences for question generation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  const questions: QuizQuestion[] = [];
  
  // Generate 3 questions
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const sentence = sentences[i].trim();
    
    questions.push({
      question: `Based on the article about ${title}, which statement is most accurate?`,
      options: [
        sentence.slice(0, 100) + "...",
        "This statement is completely fictional",
        "This relates to a different topic entirely",
        "This is a made-up fact for testing"
      ],
      correctAnswer: 0,
      explanation: `This is directly from the article text about ${title}.`
    });
  }
  
  // Add a general knowledge question
  questions.push({
    question: `What is the main topic of this article?`,
    options: [
      title,
      "General History",
      "Science Fiction",
      "Modern Technology"
    ],
    correctAnswer: 0,
    explanation: `The article is specifically about ${title}.`
  });

  return questions.slice(0, 3);
}