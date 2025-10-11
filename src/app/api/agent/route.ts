import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, articleContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      return NextResponse.json(
        { error: "ElevenLabs configuration missing" },
        { status: 500 }
      );
    }

    // Build the prompt with article context
    const contextPrompt = articleContext 
      ? `Context: The user is reading an article titled "${articleContext.title}". Here's a summary: ${articleContext.summary || articleContext.text.substring(0, 500)}`
      : "";

    const fullMessage = contextPrompt ? `${contextPrompt}\n\nUser Question: ${message}` : message;

    // Call ElevenLabs Conversational AI API
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
        text: fullMessage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI agent" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      response: data.text || data.output || "I'm here to help! Ask me anything about this article.",
      conversationId: data.conversation_id,
    });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

