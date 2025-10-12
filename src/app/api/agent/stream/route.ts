import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { message, articleContext, image } = await request.json();

    console.log("[Agent Stream] Processing message:", message);
    console.log("[Agent Stream] Image provided:", image ? "Yes" : "No");

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    const articleExcerpt = articleContext?.text?.substring(0, 3000) || "";
    const textPrompt = image 
      ? `You are a friendly, knowledgeable financial education assistant helping someone understand an article about "${articleContext?.title}".

ARTICLE CONTEXT:
${articleExcerpt}

The user has uploaded an image and asked: ${message}

INSTRUCTIONS:
- Analyze the image in the context of the article
- If it's a financial chart, graph, or document, explain what you see
- Connect your analysis to the article topic when relevant
- Be conversational, warm, and encouraging
- Use simple language appropriate for someone learning about finance
- Don't use markdown or special formatting

Answer naturally as if speaking to a friend:`
      : `You are a friendly, knowledgeable financial education assistant helping someone understand an article about "${articleContext?.title}".

ARTICLE CONTEXT:
${articleExcerpt}

USER QUESTION: ${message}

INSTRUCTIONS:
- Answer based on the article content above
- Be conversational, warm, and encouraging
- Use simple language appropriate for someone learning about finance
- Don't use markdown or special formatting

Answer naturally as if speaking to a friend:`;

    // Try models in order
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
    ];

    let streamStarted = false;
    const stream = new ReadableStream({
      async start(controller) {
        for (const modelName of candidateModels) {
          try {
            console.log(`[Agent Stream] Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            });
            
            // Handle multimodal input
            let result;
            if (image) {
              result = await model.generateContentStream([
                { inlineData: { data: image, mimeType: "image/png" } },
                textPrompt
              ]);
            } else {
              result = await model.generateContentStream(textPrompt);
            }
            
            // Stream chunks to client
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
            }
            
            streamStarted = true;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            break;
          } catch (err: any) {
            console.error(`[Agent Stream] Model ${modelName} failed:`, err.message);
            if (candidateModels.indexOf(modelName) === candidateModels.length - 1) {
              // Last model failed
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                error: "All models failed. Please try again." 
              })}\n\n`));
            }
          }
        }
        
        if (!streamStarted) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            text: "I'm having trouble connecting right now. Please try again in a moment." 
          })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        }
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Agent Stream] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

