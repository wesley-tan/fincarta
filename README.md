# FinCarta 💰

**Look it up fast. Learn it for good.**

FinCarta is an AI-powered financial education platform that combines encyclopedia-style reference content with an adaptive learning roadmap. Get instant answers to your financial questions or follow a personalized path with quizzes, streaks, and mastery tracking.

![FinCarta](https://img.shields.io/badge/Next.js-15.3.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Features

### 🔍 Reference Mode
- **Instant Search**: Look up any financial topic and get comprehensive, encyclopedia-style articles
- **AI-Powered Summaries**: Get key points extracted from Wikipedia articles
- **Trust Meter**: See credibility indicators for article sources
- **Concept Graph**: Visualize relationships between financial concepts
- **Interactive Quizzes**: Test your understanding of any topic

### 🎓 Learn Mode
- **Personalized Roadmap**: Follow a structured path through essential financial topics
- **Adaptive Quizzes**: Track your progress with knowledge assessments (80% pass threshold)
- **Progress Tracking**: Monitor your learning journey with streaks and completion stats
- **Recommendations**: Get personalized suggestions based on your progress and quiz results
- **Modular Learning**: Five core chapters covering fundamentals to advanced investing

### 🎨 Retro UI Experience
- Nostalgic 90s encyclopedia interface inspired by the golden age of educational software
- Smooth animations and transitions powered by Framer Motion
- Fully responsive design that works on desktop and mobile

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wesley-tan/fincarta.git
cd fincarta
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 📁 Project Structure

```
fincarta/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── search/        # Article search
│   │   │   ├── quiz/          # Quiz generation
│   │   │   ├── summarize/     # AI summarization
│   │   │   ├── trust-meter/   # Credibility scoring
│   │   │   └── recommendations/ # Personalized suggestions
│   │   ├── roadmap/           # Learn Mode pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home (Reference Mode)
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── ArticleDisplay.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FinancialRoadmap.tsx
│   │   └── ...
│   └── lib/                   # Utilities
├── public/                    # Static assets
└── package.json
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Source**: Wikipedia API
- **AI Integration**: Anthropic Claude (for summarization and recommendations)
- **3D Graphics**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

---

## 🎯 Core Learning Paths

FinCarta's Learn Mode covers five essential financial chapters:

1. **Money Basics** - Understanding income, expenses, and financial planning
2. **Banking & Saving** - Bank accounts, emergency funds, and saving strategies
3. **Budgeting** - The 50/30/20 rule and expense tracking
4. **Credit Basics** - Credit scores, cards, and building credit
5. **Investing Basics** - Stocks, bonds, diversification, and compound interest

---

## 📊 Metrics & Goals

- **Pass Threshold**: 80% correct answers to unlock next lesson
- **Target**: ≥70% of quizzes achieve ≥80% on first attempt
- **Progress Tracking**: Streaks, stars, and mastery scores
- **Adaptive Learning**: Content adjusts based on quiz performance

---

## 🔐 Privacy & Legal

- **Educational Content Only**: FinCarta provides general educational information, not personalized financial advice
- **Source Attribution**: All content is properly cited with sources and dates
- **Age Requirement**: Users must be 13+ (COPPA compliance)
- **Data Minimization**: Only essential data is stored; users can export/delete their data
- **WCAG 2.1 AA Compliant**: Accessible design with keyboard navigation and screen reader support

---

## 🌍 Roadmap

### Phase 1 (Current - MVP)
- ✅ Reference Mode with Wikipedia integration
- ✅ Core Track with 5 chapters
- ✅ Quiz system with 80% pass threshold
- ✅ Progress tracking and streaks
- ✅ Rule-based recommendations

### Phase 2 (Upcoming)
- 🔄 Advanced learning tracks
- 🔄 Fill-in-the-blank questions
- 🔄 Spaced repetition system
- 🔄 Country-specific content (401k, CPF, etc.)
- 🔄 Premium features and track branching

### Phase 3 (Future)
- 📅 ML-based personalization
- 📅 Leaderboards and community features
- 📅 Certification system
- 📅 Mobile app
- 📅 Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## ⚖️ Disclaimer

**FinCarta provides educational content only and is not financial advice.** The information provided through this platform is for general educational purposes and should not be considered as personalized investment, legal, or financial advice. Always consult with qualified financial professionals before making financial decisions.

---

## 🙏 Acknowledgments

- Wikipedia API for providing comprehensive financial knowledge
- Anthropic Claude for AI-powered summarization
- The open-source community for amazing tools and libraries
- Inspired by the educational excellence of classic encyclopedia software

---

Built with ❤️ for financial literacy

**Switch anytime between Reference and Learn modes. Look it up fast—or follow your personalized path with quizzes and streaks.**
