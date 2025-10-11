import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function POST(request: NextRequest) {
  try {
    const { message, articleContext, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key missing" },
        { status: 500 }
      );
    }

    const client = new ElevenLabsClient({ apiKey });

    // Generate a conversational response (using simple logic for now)
    // In production, you'd use a proper LLM here
    let responseText = "";
    
    if (articleContext) {
      const articleTitle = articleContext.title;
      const questionLower = message.toLowerCase();
      
      // Simple pattern matching for common questions
      if (questionLower.includes("what is") || questionLower.includes("explain")) {
        responseText = `Based on the article about ${articleTitle}, let me explain. ${articleContext.text.substring(0, 200)}... Would you like me to elaborate on any specific aspect?`;
      } else if (questionLower.includes("how") || questionLower.includes("work")) {
        responseText = `Great question about ${articleTitle}! ${articleContext.text.substring(0, 200)}... Feel free to ask for more details about any part.`;
      } else if (questionLower.includes("why") || questionLower.includes("benefit")) {
        responseText = `That's an important question regarding ${articleTitle}. ${articleContext.text.substring(0, 200)}... Would you like to know more?`;
      } else {
        responseText = `Regarding your question about ${articleTitle}: ${articleContext.text.substring(0, 250)}... Ask me anything else you'd like to know!`;
      }
    } else {
      responseText = "I'm here to help you understand this financial topic. What would you like to know?";
    }

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

