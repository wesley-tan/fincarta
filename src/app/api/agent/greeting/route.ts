import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { articleTitle } = await request.json();

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key missing" },
        { status: 500 }
      );
    }

    // Generate welcoming greeting
    const greetingText = `Hi! I'm your AI assistant for this article about ${articleTitle}. I can answer any questions you have about the content. Just ask me anything, or use the microphone to speak your question!`;

    // Use text-to-speech to generate voice greeting
    const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George voice
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: greetingText,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      }),
    });

    if (!ttsRes.ok) {
      console.error("[Greeting] ElevenLabs TTS error:", await ttsRes.text());
    }
    const audioArrayBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');

    return NextResponse.json({
      text: greetingText,
      audio: audioBase64,
    });
  } catch (error) {
    console.error("Greeting API error:", error);
    return NextResponse.json(
      { error: "Failed to generate greeting" },
      { status: 500 }
    );
  }
}

