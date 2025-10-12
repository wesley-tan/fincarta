# 💰 FinCarta

**BostonHacks 2025** | Theme: *Retro Remix* | Track: *Upgrade.exe* | Subtrack: *Capital One Best Financial Hack*

> *"Bringing the magic of Microsoft Encarta into the age of AI to revolutionize financial education"*

🌐 **Live at: [www.fincarta.wiki](https://www.fincarta.wiki)**

FinCarta is an AI-powered financial education platform that reimagines Microsoft Encarta for modern finance learning. Combining nostalgic 90s-style encyclopedia navigation with cutting-edge AI technology, FinCarta makes financial literacy accessible, engaging, and personalized.

## 🎯 The Problem

Financial literacy is critical for modern life, yet most educational resources are either:
- **Intimidating**: Filled with jargon that scares away beginners
- **Fragmented**: Scattered across multiple platforms with no clear learning path
- **Passive**: No interactive elements to test understanding or retain knowledge
- **One-size-fits-all**: Doesn't adapt to individual learning needs

## 💡 Our Solution

FinCarta bridges the gap between trusted encyclopedia-style content and modern AI-driven personalization:

### **🔍 Reference Mode**
Look up any financial topic instantly with:
- **Wikipedia Integration**: Comprehensive, trusted content
- **AI-Powered Summaries**: Get key points at 3 difficulty levels (beginner/intermediate/advanced) using Google Gemini 2.5 Flash
- **Voice AI Assistant**: Ask questions and get spoken responses with ElevenLabs voice synthesis
- **Concept Graph**: Visualize connections between financial topics with interactive 3D graphs
- **Interactive Quizzes**: AI-generated questions to test comprehension

### **🎓 Learn Mode**
A structured, gamified learning journey:
- **11-Step Roadmap**: Curated path from budgeting basics to advanced tax optimization
- **Progress Tracking**: Visual progress bars, completion stats, and star ratings
- **Adaptive Quizzes**: 80% pass threshold to unlock next level
- **AI Recommendations**: Personalized article suggestions based on your learning history
- **Multiple Tracks**: Personal Finance (active), with Investments and Cryptocurrency coming soon

### **✨ Retro Experience**
Authentic Microsoft Encarta-inspired UI:
- Windows 95-style window frames with working buttons
- Bubble background animations
- CD-ROM loading screens
- Retro typography and color schemes
- Nostalgic interactions that make learning fun

## 🌐 Try It Live

**Visit the live site:** [www.fincarta.wiki](https://www.fincarta.wiki)

All features are fully functional and ready to explore!

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js 18+** (or Bun runtime)
- **Required API Keys**:
  - **Google Gemini API Key** - Get free at [Google AI Studio](https://aistudio.google.com/app/apikey)
  - **ElevenLabs API Key** - Sign up at [ElevenLabs](https://elevenlabs.io/) (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/wesley-tan/fincarta.git
cd fincarta
```

2. **Install dependencies**
```bash
npm install
# or if you use Bun:
bun install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:
```bash
# Required: Google Gemini API for AI summaries, recommendations, and quiz generation
GEMINI_API_KEY=your_gemini_api_key_here

# Required: ElevenLabs API for voice synthesis in AI assistant
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

> **Note**: Both API keys are required for full functionality. The Wikipedia search works without them, but AI features (summaries, voice assistant, recommendations, quizzes) require these keys.

4. **Run the development server**
```bash
npm run dev
# or
bun dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + shadcn/ui |
| **Animations** | Framer Motion |
| **AI Models** | Google Gemini 2.5 Flash |
| **Voice AI** | ElevenLabs |
| **Data Source** | Wikipedia API |
| **3D Graphics** | Three.js + React Three Fiber |
| **Auth** | Supabase |

## 📦 Key Features Implemented

✅ **Real-time Wikipedia Search** with finance relevance detection  
✅ **AI Content Summarization** at 3 difficulty levels  
✅ **Voice AI Assistant** with speech-to-text and text-to-speech  
✅ **Interactive 3D Concept Graphs** for visualizing topic relationships  
✅ **Adaptive Learning Roadmap** with 11 progressive levels  
✅ **AI-Generated Quizzes** based on article content  
✅ **Personalized Recommendations** using learning history  
✅ **Progress Tracking** with localStorage persistence  
✅ **Retro UI** with authentic Windows 95 aesthetic  

## 🎨 Design Philosophy

**Nostalgia meets Innovation**: We took the beloved Microsoft Encarta experience that defined 90s/early 2000s education and upgraded it for 2025 with:
- Modern AI for personalization
- Voice interactions for accessibility
- 3D visualizations for engagement
- Mobile-responsive design
- Real-time content from Wikipedia

## 🏆 BostonHacks 2025

**Theme**: Retro Remix  
**Main Track**: Upgrade.exe - *"How can we reimagine old applications in the age of AI?"*  
**Subtrack**: Capital One Best Financial Hack - *"Reimagine fintech for a new era"*

FinCarta directly addresses the theme by taking Microsoft Encarta (discontinued in 2009) and giving it new life as a financial education platform enhanced with modern AI capabilities.

## 👥 Team

Built with ❤️ at BostonHacks 2025 by:

- **Riddhi Kathe**
- **Eugène Duvert**
- **Nikita Ostapenko**
- **Wesley Tan**

*Passionate developers who believe financial literacy should be accessible to everyone.*

## 📄 License

This project is open source under the MIT License.

## ⚠️ Disclaimer

**FinCarta provides educational content only and is not financial advice.** The information provided through this platform is for general educational purposes and should not be considered as personalized investment, legal, or financial advice. Always consult with qualified financial professionals before making financial decisions.

---

*Made with 💙 at BostonHacks 2025 🎓*
