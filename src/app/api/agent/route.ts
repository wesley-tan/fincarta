import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message, articleContext, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!elevenLabsKey || !geminiKey) {
      return NextResponse.json(
        { error: "API keys missing" },
        { status: 500 }
      );
    }

    // Use Gemini to generate intelligent response
    let responseText = "";
    
    if (articleContext) {
      const prompt = `You are a helpful financial education assistant. You're helping a user understand an article titled "${articleContext.title}".

Article context (first 1000 characters):
${articleContext.text.substring(0, 1000)}

User's question: ${message}

Provide a clear, helpful answer based on the article context. Keep your response conversational and under 3 sentences. If the question can't be fully answered from the article, acknowledge that and provide what information you can.`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text().trim();
    } else {
      responseText = "I'm here to help you understand this financial topic. What would you like to know?";
    }

    const client = new ElevenLabsClient({ apiKey: elevenLabsKey });

    // Use text-to-speech to generate voice response
    const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George voice - clear and professional
    
    // Generate audio response
    const audioStream = await client.textToSpeech.convert({
      voice_id: voiceId,
      text: responseText,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');

    return NextResponse.json({
      response: responseText,
      audio: audioBase64,
      conversationId: conversationId || `conv_${Date.now()}`,
    });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

