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

    // Use text-to-speech to generate voice greeting (optional - won't fail if TTS fails)
    let audioBase64 = "";
    try {
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
        const errorText = await ttsRes.text();
        console.error("[Greeting] ElevenLabs TTS error:", errorText);
      } else {
        const audioArrayBuffer = await ttsRes.arrayBuffer();
        audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
        console.log("[Greeting] Audio generated successfully");
      }
    } catch (audioError) {
      console.error("[Greeting] Failed to generate audio (non-fatal):", audioError);
    }

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

