import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { message, articleContext, image, images, pdfText, pdfName } = await request.json();

    console.log("[Agent Stream] Processing message:", message);
    console.log("[Agent Stream] Image provided:", image ? "Yes" : "No");
    console.log("[Agent Stream] Multiple images provided:", images ? `Yes (${images.length})` : "No");
    console.log("[Agent Stream] PDF provided:", pdfText ? `Yes (${pdfName})` : "No");

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    const articleExcerpt = articleContext?.text?.substring(0, 3000) || "";
    
    // Build prompt based on content type
    let textPrompt = `You are a friendly, knowledgeable financial education assistant helping someone understand an article about "${articleContext?.title}".

ARTICLE CONTEXT:
${articleExcerpt}
`;

    if (pdfText) {
      const pdfExcerpt = pdfText.substring(0, 5000);
      textPrompt += `\nThe user has uploaded a PDF document (${pdfName}). Here's the extracted text:\n\n${pdfExcerpt}${pdfText.length > 5000 ? '\n...(truncated)' : ''}\n\nUser's question: ${message}\n\nINSTRUCTIONS:\n- Analyze the PDF content in the context of the article\n- Explain key financial information you find\n- Connect it to the article topic when relevant\n- Be conversational, warm, and encouraging\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
    } else if (images && images.length > 0) {
      textPrompt += `\nThe user has uploaded ${images.length} images and asked: ${message}\n\nINSTRUCTIONS:\n- Analyze all ${images.length} images in the context of the article\n- Compare and contrast what you see across the images\n- If they're financial charts, graphs, or documents, explain what you see\n- Connect your analysis to the article topic when relevant\n- Be conversational, warm, and encouraging\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
    } else if (image) {
      textPrompt += `\nThe user has uploaded an image and asked: ${message}\n\nINSTRUCTIONS:\n- Analyze the image in the context of the article\n- If it's a financial chart, graph, or document, explain what you see\n- Connect your analysis to the article topic when relevant\n- Be conversational, warm, and encouraging\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
    } else {
      textPrompt += `\nUSER QUESTION: ${message}\n\nINSTRUCTIONS:\n- Answer based on the article content above\n- Be conversational, warm, and encouraging\n- Use simple language appropriate for someone learning about finance\n- Don't use markdown or special formatting\n\nAnswer naturally as if speaking to a friend:`;
    }

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
            
            // Handle multimodal input (text + images/PDF) or text-only
            let result;
            if (images && images.length > 0) {
              console.log(`[Agent Stream] Processing with ${images.length} images (multimodal)`);
              const content: any[] = [];
              // Add all images
              images.forEach((img: string) => {
                content.push({
                  inlineData: {
                    data: img,
                    mimeType: "image/png"
                  }
                });
              });
              // Add text prompt
              content.push(textPrompt);
              result = await model.generateContentStream(content);
            } else if (image) {
              result = await model.generateContentStream([
                { inlineData: { data: image, mimeType: "image/png" } },
                textPrompt
              ]);
            } else {
              // PDF text is already included in textPrompt, so just send text
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

