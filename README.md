# FinCarta

FinCarta is an AI-powered financial education platform that combines encyclopedia-style reference content with an adaptive learning roadmap. Get instant answers to your financial questions or follow a personalized path with quizzes, streaks, and mastery tracking. Inspired by Encarta, reviving the multimedia encyclopedia experience

## Features

### Reference Mode
- **Instant Search**: Look up any financial topic and get comprehensive, encyclopedia-style articles
- **AI-Powered Summaries**: Get key points extracted from Wikipedia articles
- **Trust Meter**: See credibility indicators for article sources
- **Concept Graph**: Visualize relationships between financial concepts
- **Interactive Quizzes**: Test your understanding of any topic

### Learn Mode
- **Personalized Roadmap**: Follow a structured path through essential financial topics
- **Adaptive Quizzes**: Track your progress with knowledge assessments (80% pass threshold)
- **Progress Tracking**: Monitor your learning journey with streaks and completion stats
- **Recommendations**: Get personalized suggestions based on your progress and quiz results
- **Modular Learning**: Five core chapters covering fundamentals to advanced investing

### Retro UI Experience
- Inspired by Encarta, reviving the multimedia encyclopedia experience

---

## Getting Started

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

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Source**: Wikipedia API
- **AI Integration**: Anthropic Claude (for summarization and recommendations)
- **3D Graphics**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

**FinCarta provides educational content only and is not financial advice.** The information provided through this platform is for general educational purposes and should not be considered as personalized investment, legal, or financial advice. Always consult with qualified financial professionals before making financial decisions.
