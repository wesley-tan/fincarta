import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message, messages, articleContext, conversationId, image, images, pdfText, pdfName } = await request.json();

    // Support both single message and messages array
    const userMessage = message || (messages && messages[messages.length - 1]?.content);
    
    console.log("[Agent] Processing message:", userMessage);
    console.log("[Agent] Article context:", articleContext?.title || "None");
    console.log("[Agent] Image provided:", image ? "Yes" : "No");
    console.log("[Agent] Multiple images provided:", images ? `Yes (${images.length})` : "No");
    console.log("[Agent] PDF provided:", pdfText ? `Yes (${pdfName})` : "No");

    if (!userMessage) {
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
      
      // Build prompt based on what content is provided
      let textPrompt = `You are a friendly, knowledgeable financial education assistant helping someone understand an article about "${articleContext.title}".

CHAT CONTEXT:
${articleExcerpt}
`;

      // Add conversation history if available
      if (messages && messages.length > 1) {
        textPrompt += `\n\nCONVERSATION HISTORY:`;
        textPrompt += messages.slice(0, -1).reduce((acc: string, msg: any) => {
          const role = msg.role === "user" ? "User" : "Assistant";
          return acc + `\n${role}: ${msg.content}`;
        }, "");
      }

      // Handle multimodal input
      if (pdfText) {
        const pdfExcerpt = pdfText.substring(0, 5000);
        textPrompt += `\n\nThe user has uploaded a PDF document (${pdfName}). Here's the extracted text:\n\n${pdfExcerpt}${pdfText.length > 5000 ? '\n...(truncated)' : ''}\n\nUser's question: ${userMessage}\n\nINSTRUCTIONS:\n- Analyze the PDF content in the context of the article\n- Explain key financial information you find\n- Connect it to the article topic when relevant\n- Be conversational, warm, and encouraging\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
      } else if (images && images.length > 0) {
        textPrompt += `\n\nThe user has uploaded ${images.length} images and asked: ${userMessage}\n\nINSTRUCTIONS:\n- Analyze all ${images.length} images in the context of the article\n- Compare and contrast what you see across the images\n- If they're financial charts, graphs, or documents, explain what you see\n- Connect your analysis to the article topic when relevant\n- Be conversational, warm, and encouraging\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
      } else if (image) {
        textPrompt += `\n\nThe user has uploaded an image and asked: ${userMessage}\n\nINSTRUCTIONS:\n- Analyze the image in the context of the article\n- If it's a financial chart, graph, or document, explain what you see\n- Connect your analysis to the article topic when relevant\n- Be conversational, warm, and encouraging\n- Keep response under 5 sentences\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
      } else {
        textPrompt += `\n\nUSER QUESTION: ${userMessage}\n\nINSTRUCTIONS:\n- Answer based on the article content above\n- Be conversational, warm, and encouraging\n- Keep response under 4 sentences for natural speech\n- If the article doesn't cover it, say so briefly and offer what you know\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
      }

      // Use the latest available Gemini models (ordered by preference)
      const candidateModels = [
        "gemini-2.5-flash",          // Latest Gemini 2.5 (fastest, most capable)
        "gemini-2.0-flash-exp",      // Experimental 2.0 (working fallback)
        "gemini-1.5-flash",          // Stable fast model
        "gemini-1.5-pro",            // More capable model
        "gemini-pro",                // Legacy fallback
      ];

      let generated = false;
      let lastError: any = null;
      
      for (const modelName of candidateModels) {
        try {
          console.log(`[Agent] Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE",
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          });
          
          // Handle multimodal input (text + images/PDF) or text-only
          let result;
          if (images && images.length > 0) {
            console.log(`[Agent] Processing with ${images.length} images (multimodal)`);
            const content: any[] = [];
            // Add all images
            images.forEach((img: string, idx: number) => {
              content.push({
                inlineData: {
                  data: img,
                  mimeType: "image/png"
                }
              });
            });
            // Add text prompt
            content.push(textPrompt);
            result = await model.generateContent(content);
          } else if (image) {
            console.log(`[Agent] Processing with single image (multimodal)`);
            result = await model.generateContent([
              {
                inlineData: {
                  data: image,
                  mimeType: "image/png"
                }
              },
              textPrompt
            ]);
          } else {
            // PDF text is already included in textPrompt, so just send text
            result = await model.generateContent(textPrompt);
          }
          
          const response = await result.response;
          responseText = response.text().trim();
          generated = true;
          console.log(`[Agent] ✓ Success with ${modelName}:`, responseText.substring(0, 100) + "...");
          break;
        } catch (err: any) {
          lastError = err;
          console.error(`[Agent] ✗ Model ${modelName} failed:`, err.message || err);
          if (err.response) {
            console.error(`[Agent] Error details:`, await err.response.text().catch(() => 'Unable to parse error'));
          }
        }
      }
      
      if (!generated && lastError) {
        console.error(`[Agent] All models failed. Last error:`, lastError);
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

    // Text-to-speech using ElevenLabs REST API (optional - won't fail if TTS fails)
    let audioBase64 = "";
    try {
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
        const errorText = await ttsRes.text();
        console.error("[Agent] ElevenLabs TTS error:", errorText);
      } else {
        const audioArrayBuffer = await ttsRes.arrayBuffer();
        audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");
        console.log("[Agent] Audio generated successfully");
      }
    } catch (audioError) {
      console.error("[Agent] Failed to generate audio (non-fatal):", audioError);
    }

    console.log("[Agent] Response generated successfully", audioBase64 ? "with audio" : "without audio");

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

