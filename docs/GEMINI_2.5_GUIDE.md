# Gemini 2.5 API Guide for FinCarta

## Current Setup

Your FinCarta app is already using Gemini 2.5 models:
- **Search API**: `gemini-2.5-flash-lite` ✅
- **Agent API**: Updated to use `gemini-2.5-flash` (with fallbacks)

## Available Gemini 2.5 Models

| Model | Best For | Context Window | Speed |
|-------|----------|----------------|-------|
| `gemini-2.5-flash` | Most tasks, great balance | 1M tokens | Very Fast ⚡ |
| `gemini-2.5-flash-lite` | Quick validation, simple tasks | 1M tokens | Fastest 🚀 |
| `gemini-2.5-pro` | Complex reasoning, detailed analysis | 2M tokens | Moderate 🧠 |

## Advanced Features You Can Add

### 1. **Multimodal Input (Images/Screenshots)**

```typescript
// Example: Analyze financial charts/graphs
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// User uploads a stock chart image
async function analyzeChart(imageBase64: string) {
  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBase64,
        mimeType: "image/png"
      }
    },
    "Analyze this financial chart and explain the key trends in simple terms."
  ]);
  
  return result.response.text();
}
```

### 2. **Live API (Real-time Bidirectional Streaming)**

```typescript
// Example: Real-time financial Q&A with streaming
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function streamResponse(prompt: string) {
  const result = await model.generateContentStream(prompt);
  
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    // Send chunks to client via Server-Sent Events
    console.log(chunkText);
  }
}
```

### 3. **Context Caching (Save Money & Improve Speed)**

```typescript
// Cache article content for multiple questions
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function createCachedContext(articleText: string) {
  const cachedContent = await genAI.cacheManager.create({
    model: "gemini-2.5-flash",
    contents: [{
      role: "user",
      parts: [{
        text: `Article context:\n${articleText}\n\nYou are a helpful financial education assistant.`
      }]
    }],
    ttl: 3600 // Cache for 1 hour
  });
  
  return cachedContent.name; // Use this for subsequent requests
}

async function askWithCache(cacheId: string, question: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    cachedContent: cacheId
  });
  
  const result = await model.generateContent(question);
  return result.response.text();
}
```

### 4. **Function Calling (Structured Actions)**

```typescript
// Let Gemini decide which financial tools to use
const tools = [{
  functionDeclarations: [{
    name: "getStockPrice",
    description: "Get current stock price for a symbol",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol like AAPL" }
      },
      required: ["symbol"]
    }
  }, {
    name: "calculateCompoundInterest",
    description: "Calculate compound interest",
    parameters: {
      type: "object",
      properties: {
        principal: { type: "number" },
        rate: { type: "number" },
        time: { type: "number" }
      },
      required: ["principal", "rate", "time"]
    }
  }]
}];

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools
});

const chat = model.startChat();
const result = await chat.sendMessage("What's Apple's stock price and if I invest $1000 at 7% for 10 years?");

// Gemini will call your functions automatically!
```

### 5. **Screenshot Analysis ("Computer Use" Alternative)**

```typescript
// Analyze financial app screenshots or documents
async function analyzeFinancialDocument(screenshotBase64: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const result = await model.generateContent([
    {
      inlineData: {
        data: screenshotBase64,
        mimeType: "image/png"
      }
    },
    `Analyze this financial document/screenshot:
    1. Extract key numbers and metrics
    2. Identify any red flags or important notes
    3. Summarize in simple terms
    4. Suggest follow-up questions`
  ]);
  
  return result.response.text();
}
```

## Ideas for FinCarta

### 💡 Feature Ideas Using Gemini 2.5:

1. **Chart Analyzer**: Let users upload stock charts for AI analysis
2. **Receipt Scanner**: Upload receipts for budgeting insights
3. **Document Q&A**: Upload PDFs of financial statements
4. **Live Tutoring**: Real-time streaming for interactive lessons
5. **Smart Calculator**: Natural language financial calculations
6. **Portfolio Review**: Upload portfolio screenshots for AI analysis

### 🚀 Quick Win Implementation:

Add image upload to your AgentChat component:

```typescript
// In AgentChat.tsx
const handleImageUpload = async (file: File) => {
  const base64 = await fileToBase64(file);
  
  const response = await fetch("/api/agent", {
    method: "POST",
    body: JSON.stringify({
      message: "Analyze this financial image",
      image: base64,
      articleContext: { title, text }
    })
  });
};
```

Then update your agent route to handle images:

```typescript
// In /api/agent/route.ts
if (image) {
  const result = await model.generateContent([
    { inlineData: { data: image, mimeType: "image/png" } },
    prompt
  ]);
}
```

## Testing Gemini 2.5

Run this test to verify Gemini 2.5 is working:

```bash
# Create test file
cat > test-gemini-2.5.js << 'EOF'
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello in 5 words");
      const response = await result.response;
      console.log(`✓ ${modelName}: ${response.text()}`);
    } catch (err) {
      console.log(`✗ ${modelName}: ${err.message}`);
    }
  }
}

test();
EOF

# Run test
node test-gemini-2.5.js
```

## Resources

- 📚 [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- 🍳 [Gemini Cookbook](https://github.com/google-gemini/cookbook)
- 🔧 [API Reference](https://ai.google.dev/api/python/google/generativeai)
- 💬 [Community Discord](https://discord.gg/google-gemini)

## Current API Usage

Your current implementation:
- ✅ Text generation
- ✅ Safety settings
- ✅ Fallback models
- ✅ Error handling
- ⚠️ Audio (ElevenLabs - quota exceeded)

Ready to add:
- 🎯 Multimodal inputs (images)
- 🎯 Streaming responses
- 🎯 Context caching
- 🎯 Function calling
- 🎯 System instructions

---

**Note**: "Computer Use" (like Claude's feature) isn't available in Gemini, but you can achieve similar results with screenshot analysis and function calling!

