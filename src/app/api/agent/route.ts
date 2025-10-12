import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message, articleContext, conversationId } = await request.json();

    console.log("[Agent] Processing message:", message);
    console.log("[Agent] Article context:", articleContext?.title || "None");

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!elevenLabsKey || !geminiKey) {
      console.error("[Agent] Missing API keys");
      return NextResponse.json(
        { error: "API keys missing" },
        { status: 500 }
      );
    }

    // Use Gemini to generate intelligent response with model fallback
    let responseText = "";
    if (articleContext) {
      const articleExcerpt = articleContext.text.substring(0, 3000);
      const prompt = `You are a friendly, knowledgeable financial education assistant helping someone understand an article about "${articleContext.title}".

ARTICLE CONTEXT:
${articleExcerpt}

USER QUESTION: ${message}

INSTRUCTIONS:
- Answer based on the article content above
- Be conversational, warm, and encouraging
- Keep response under 4 sentences for natural speech
- If the article doesn't cover it, say so briefly and offer what you know
- Use simple language appropriate for someone learning about finance
- Don't use markdown or special formatting

Answer naturally as if speaking to a friend:`;

      const candidateModels = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
      ];

      let generated = false;
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          responseText = response.text().trim();
          generated = true;
          console.log(`[Agent] Gemini response via ${modelName}:`, responseText.substring(0, 100) + "...");
          break;
        } catch (err) {
          console.warn(`[Agent] Model ${modelName} failed, trying next...`);
        }
      }

      if (!generated) {
        // Graceful fallback if Gemini is unavailable
        const fallback = articleExcerpt
          .replace(/\s+/g, ' ')
          .split(/(?<=[.!?])\s/)
          .slice(0, 2)
          .join(' ');
        responseText = fallback
          ? `Quick take: ${fallback}`
          : "I'm having trouble reaching the AI right now, but I can still help with high-level guidance.";
      }

      responseText = responseText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
    } else {
      responseText = "I'm here to help you understand this financial topic. What would you like to know?";
    }

    // Text-to-speech using ElevenLabs REST API to avoid SDK issues
    const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: responseText,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      }),
    });

    if (!ttsRes.ok) {
      console.error("[Agent] ElevenLabs TTS error:", await ttsRes.text());
    }
    const audioArrayBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");

    console.log("[Agent] Response generated successfully with audio");

    return NextResponse.json({
      response: responseText,
      audio: audioBase64,
      conversationId: conversationId || `conv_${Date.now()}`,
    });
  } catch (error) {
    console.error("[Agent] API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

