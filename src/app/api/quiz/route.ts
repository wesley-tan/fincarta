import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, title } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    // Generate quiz questions based on the text
    // In production, this would use an LLM to generate contextual questions
    const questions = generateMockQuiz(text, title);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function generateMockQuiz(text: string, title: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Topic-specific quiz questions for financial education
  const quizBank: Record<string, QuizQuestion[]> = {
    "budgeting": [
      {
        question: "What is the 50/30/20 budgeting rule?",
        options: [
          "50% needs, 30% wants, 20% savings/debt",
          "50% savings, 30% needs, 20% wants",
          "50% wants, 30% savings, 20% needs",
          "50% debt, 30% needs, 20% wants"
        ],
        correctAnswer: 0,
        explanation: "The 50/30/20 rule allocates 50% of income to needs (housing, food), 30% to wants (entertainment), and 20% to savings and debt repayment."
      },
      {
        question: "Which expense category should you prioritize first in your budget?",
        options: [
          "Essential needs like housing and food",
          "Entertainment and dining out",
          "Luxury purchases",
          "Non-essential subscriptions"
        ],
        correctAnswer: 0,
        explanation: "Essential needs like housing, utilities, and food should always be prioritized to ensure basic living requirements are met."
      },
      {
        question: "What is a common mistake people make when creating their first budget?",
        options: [
          "Not tracking irregular expenses like car repairs",
          "Saving too much money",
          "Spending too little on necessities",
          "Having too many income sources"
        ],
        correctAnswer: 0,
        explanation: "Many first-time budgeters forget to account for irregular expenses like car maintenance, medical costs, or annual subscriptions, which can derail their budget."
      }
    ],
    "emergency": [
      {
        question: "How many months of expenses should a typical emergency fund cover?",
        options: [
          "3-6 months",
          "1-2 weeks",
          "12-24 months",
          "1 month"
        ],
        correctAnswer: 0,
        explanation: "Financial experts recommend saving 3-6 months of living expenses to handle unexpected job loss, medical emergencies, or major repairs."
      },
      {
        question: "Where is the best place to keep your emergency fund?",
        options: [
          "High-yield savings account",
          "Invested in stocks",
          "Under your mattress",
          "In a locked safe at home"
        ],
        correctAnswer: 0,
        explanation: "A high-yield savings account offers FDIC insurance, easy access, and earns interest while keeping your money safe and liquid."
      },
      {
        question: "What should NOT be considered an emergency fund expense?",
        options: [
          "Vacation travel",
          "Unexpected medical bills",
          "Car repairs after an accident",
          "Job loss covering rent"
        ],
        correctAnswer: 0,
        explanation: "Emergency funds are for true emergencies, not planned expenses like vacations. Those should be saved for separately."
      }
    ],
    "401k": [
      {
        question: "What is the main benefit of an employer 401(k) match?",
        options: [
          "Free money from your employer",
          "Lower taxes on all income",
          "Guaranteed investment returns",
          "No contribution limits"
        ],
        correctAnswer: 0,
        explanation: "Employer matching is essentially free money - if they match 50% of your contributions up to 6%, you're getting a 50% immediate return on that money."
      },
      {
        question: "At minimum, how much should you contribute to your 401(k)?",
        options: [
          "Enough to get the full employer match",
          "The maximum allowed by law",
          "Whatever amount feels comfortable",
          "Nothing until you're debt-free"
        ],
        correctAnswer: 0,
        explanation: "You should always contribute at least enough to get the full employer match, as it's an instant 50-100% return on your investment."
      },
      {
        question: "What happens if you withdraw from your 401(k) before age 59½?",
        options: [
          "10% penalty plus income taxes",
          "No penalties at all",
          "Only 5% penalty",
          "Only income taxes, no penalty"
        ],
        correctAnswer: 0,
        explanation: "Early withdrawals typically incur a 10% penalty plus you'll owe income taxes on the amount, significantly reducing your retirement savings."
      }
    ],
    "debt": [
      {
        question: "What is the 'debt avalanche' method?",
        options: [
          "Pay off highest interest rate debts first",
          "Pay off smallest debts first",
          "Pay equal amounts on all debts",
          "Only pay minimum payments"
        ],
        correctAnswer: 0,
        explanation: "The debt avalanche method focuses on paying off high-interest debt first, saving you the most money in interest over time."
      },
      {
        question: "Which type of debt should typically be paid off first?",
        options: [
          "High-interest credit card debt",
          "Low-interest mortgage",
          "Student loans with 3% interest",
          "Car loans with 4% interest"
        ],
        correctAnswer: 0,
        explanation: "High-interest credit card debt (often 15-25% APR) should be prioritized as it grows fastest and costs the most over time."
      },
      {
        question: "What is a balance transfer credit card used for?",
        options: [
          "Moving debt to a lower interest rate",
          "Increasing your credit limit",
          "Building credit history",
          "Earning more rewards points"
        ],
        correctAnswer: 0,
        explanation: "Balance transfer cards offer 0% APR periods (12-21 months) to help you pay down debt without accruing additional interest."
      }
    ],
    "retirement": [
      {
        question: "What is an IRA?",
        options: [
          "Individual Retirement Account",
          "International Revenue Account",
          "Income Reduction Agreement",
          "Investment Risk Assessment"
        ],
        correctAnswer: 0,
        explanation: "An IRA (Individual Retirement Account) is a tax-advantaged account you open independently to save for retirement."
      },
      {
        question: "What's the main difference between a Traditional and Roth IRA?",
        options: [
          "When you pay taxes on contributions",
          "The investment options available",
          "The account fees charged",
          "Who can contribute to them"
        ],
        correctAnswer: 0,
        explanation: "Traditional IRAs offer tax deductions now but you pay taxes in retirement, while Roth IRAs are funded with after-tax money but withdrawals are tax-free."
      },
      {
        question: "Why is starting retirement savings early so important?",
        options: [
          "Compound interest has more time to work",
          "Tax rates will definitely increase",
          "Employers match more for younger workers",
          "Investment fees are lower when you're young"
        ],
        correctAnswer: 0,
        explanation: "Compound interest means your money earns returns, and those returns earn returns. Starting at 25 vs 35 can result in hundreds of thousands more by retirement."
      }
    ]
  };

  // Detect topic from title or text
  const titleLower = title.toLowerCase();
  const textLower = text.toLowerCase();
  
  let selectedQuestions: QuizQuestion[] = [];
  
  if (titleLower.includes("budget") || textLower.includes("budget")) {
    selectedQuestions = quizBank["budgeting"];
  } else if (titleLower.includes("emergency") || textLower.includes("emergency fund")) {
    selectedQuestions = quizBank["emergency"];
  } else if (titleLower.includes("401") || titleLower.includes("employer match") || textLower.includes("401k")) {
    selectedQuestions = quizBank["401k"];
  } else if (titleLower.includes("debt") || textLower.includes("pay down")) {
    selectedQuestions = quizBank["debt"];
  } else if (titleLower.includes("ira") || titleLower.includes("retirement") || textLower.includes("roth")) {
    selectedQuestions = quizBank["retirement"];
  } else {
    // Default to budgeting questions
    selectedQuestions = quizBank["budgeting"];
  }

  // Return 5 questions (or all available if less than 5)
  return selectedQuestions.slice(0, Math.min(5, selectedQuestions.length));
}
