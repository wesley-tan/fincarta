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
    "ira": [
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
        question: "What is the annual IRA contribution limit for 2024?",
        options: [
          "$7,000 (or $8,000 if 50+)",
          "$23,000",
          "$5,000",
          "No limit"
        ],
        correctAnswer: 0,
        explanation: "For 2024, you can contribute up to $7,000 to an IRA, or $8,000 if you're 50 or older (catch-up contribution)."
      }
    ],
    "retirement": [
      {
        question: "What percentage of gross income should you aim to save for retirement?",
        options: [
          "15-20%",
          "5-10%",
          "30-40%",
          "Whatever feels comfortable"
        ],
        correctAnswer: 0,
        explanation: "Financial experts recommend saving 15-20% of your gross income for retirement to maintain your lifestyle in retirement."
      },
      {
        question: "How does compound interest help retirement savings grow?",
        options: [
          "Your earnings generate their own earnings over time",
          "The bank gives you extra interest each year",
          "Your employer adds matching funds",
          "Government tax credits accumulate"
        ],
        correctAnswer: 0,
        explanation: "Compound interest means your investment returns earn returns themselves. Over decades, this compounding effect can turn small regular contributions into substantial retirement savings."
      },
      {
        question: "What is a pension?",
        options: [
          "A retirement fund paid by an employer based on years of service",
          "A government welfare program",
          "A type of savings account",
          "A short-term investment"
        ],
        correctAnswer: 0,
        explanation: "A pension is a defined benefit retirement plan where employers pay retirees a set amount based on salary and years of service. They're less common today than 401(k)s."
      }
    ],
    "insurance": [
      {
        question: "What is the primary purpose of term life insurance?",
        options: [
          "Provide income replacement if you die unexpectedly",
          "Build cash value as an investment",
          "Pay for medical expenses",
          "Cover property damage"
        ],
        correctAnswer: 0,
        explanation: "Term life insurance provides affordable death benefit protection for a specific period, ensuring your family has financial support if you pass away."
      },
      {
        question: "Which type of insurance protects your income if you can't work due to injury?",
        options: [
          "Disability insurance",
          "Health insurance",
          "Life insurance",
          "Unemployment insurance"
        ],
        correctAnswer: 0,
        explanation: "Disability insurance replaces a portion of your income (typically 50-70%) if you become unable to work due to illness or injury."
      },
      {
        question: "Why is health insurance considered essential financial protection?",
        options: [
          "Medical bills can bankrupt you without coverage",
          "It's required by law in all states",
          "It covers all types of insurance needs",
          "It provides retirement income"
        ],
        correctAnswer: 0,
        explanation: "Medical emergencies can cost hundreds of thousands of dollars. Health insurance protects you from catastrophic medical debt that could destroy your finances."
      }
    ],
    "hsa": [
      {
        question: "What is a Health Savings Account (HSA)?",
        options: [
          "A tax-advantaged account for medical expenses",
          "A type of health insurance plan",
          "A government healthcare program",
          "A medical credit card"
        ],
        correctAnswer: 0,
        explanation: "An HSA is a triple-tax-advantaged account (tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses) available with high-deductible health plans."
      },
      {
        question: "What is a 529 plan primarily used for?",
        options: [
          "Saving for education expenses",
          "Retirement savings",
          "Emergency fund storage",
          "Paying off student loans"
        ],
        correctAnswer: 0,
        explanation: "529 plans are tax-advantaged savings plans designed specifically for future education costs, with tax-free growth when used for qualified education expenses."
      },
      {
        question: "What makes HSAs unique compared to other retirement accounts?",
        options: [
          "Triple tax advantage (deduction, growth, and withdrawal)",
          "Unlimited contribution amounts",
          "Can be used for any expense after age 65",
          "Employer matching is guaranteed"
        ],
        correctAnswer: 0,
        explanation: "HSAs offer three tax benefits: tax-deductible contributions, tax-free investment growth, and tax-free withdrawals for medical expenses - making them even better than 401(k)s for healthcare savings."
      }
    ],
    "mortgage": [
      {
        question: "What is a down payment on a house?",
        options: [
          "Upfront cash payment toward the purchase price",
          "The first monthly mortgage payment",
          "Closing costs and fees",
          "Money held in escrow"
        ],
        correctAnswer: 0,
        explanation: "A down payment is the initial cash payment you make when buying a home, typically 3-20% of the purchase price, which reduces the amount you need to borrow."
      },
      {
        question: "What is PMI (Private Mortgage Insurance)?",
        options: [
          "Insurance required when you put down less than 20%",
          "Protection against property damage",
          "Coverage for mortgage payments if you lose your job",
          "Insurance that pays off your mortgage if you die"
        ],
        correctAnswer: 0,
        explanation: "PMI protects the lender if you default on your loan. It's required when your down payment is less than 20%, typically costing 0.5-1.5% of the loan annually."
      },
      {
        question: "What is the general rule for how much house you can afford?",
        options: [
          "Housing costs should be no more than 28-30% of gross income",
          "Buy the most expensive house the bank approves",
          "Spend 50% of your income on housing",
          "Your mortgage should equal your annual salary"
        ],
        correctAnswer: 0,
        explanation: "Financial experts recommend keeping housing costs (mortgage, taxes, insurance) below 28-30% of your gross monthly income to maintain financial stability."
      }
    ],
    "estate": [
      {
        question: "What is the primary purpose of a will?",
        options: [
          "Specify how your assets are distributed after death",
          "Avoid paying taxes",
          "Provide healthcare directives",
          "Manage finances while you're alive"
        ],
        correctAnswer: 0,
        explanation: "A will is a legal document that specifies who receives your assets after you die, names guardians for minor children, and designates an executor to manage your estate."
      },
      {
        question: "What is a beneficiary designation?",
        options: [
          "Who receives assets from accounts when you die",
          "Someone who inherits your debt",
          "A person who manages your healthcare decisions",
          "An executor of your will"
        ],
        correctAnswer: 0,
        explanation: "Beneficiary designations on accounts like 401(k)s, IRAs, and life insurance override your will and directly pass assets to named individuals."
      },
      {
        question: "What is a living trust?",
        options: [
          "A legal entity that holds assets and avoids probate",
          "A type of life insurance policy",
          "A retirement savings account",
          "A healthcare directive"
        ],
        correctAnswer: 0,
        explanation: "A living trust holds your assets during your lifetime and passes them to beneficiaries after death, avoiding the costly and time-consuming probate process."
      }
    ],
    "tax": [
      {
        question: "What is a backdoor Roth IRA?",
        options: [
          "Converting Traditional IRA contributions to Roth",
          "An illegal tax avoidance scheme",
          "A type of 401(k) plan",
          "A special account for high earners"
        ],
        correctAnswer: 0,
        explanation: "A backdoor Roth IRA is a legal strategy where you contribute to a Traditional IRA (which has no income limits) and immediately convert it to a Roth IRA, allowing high earners to access Roth benefits."
      },
      {
        question: "What are tax brackets?",
        options: [
          "Ranges of income taxed at different rates",
          "The total tax rate you pay on all income",
          "Deductions you can claim",
          "Categories of tax forms"
        ],
        correctAnswer: 0,
        explanation: "Tax brackets are progressive - only the income within each bracket is taxed at that rate. If you're in the 24% bracket, only the income in that range is taxed at 24%, not all your income."
      },
      {
        question: "What is tax-loss harvesting?",
        options: [
          "Selling losing investments to offset capital gains taxes",
          "Delaying income to a lower tax year",
          "Maximizing retirement contributions",
          "Claiming false deductions"
        ],
        correctAnswer: 0,
        explanation: "Tax-loss harvesting involves selling investments at a loss to offset capital gains, reducing your tax bill while maintaining your investment strategy."
      }
    ]
  };

  // Detect topic from title or text
  const titleLower = title.toLowerCase();
  const textLower = text.toLowerCase();
  
  let selectedQuestions: QuizQuestion[] = [];
  
  // Match quiz questions to step content based on Wikipedia topics covered
  if (titleLower.includes("budget") || titleLower.includes("cash flow") || textLower.includes("budget")) {
    selectedQuestions = quizBank["budgeting"];
  } else if (titleLower.includes("emergency") || titleLower.includes("build emergency") || textLower.includes("emergency fund")) {
    selectedQuestions = quizBank["emergency"];
  } else if (titleLower.includes("debt") || titleLower.includes("eliminate") || titleLower.includes("pay down")) {
    selectedQuestions = quizBank["debt"];
  } else if (titleLower.includes("401") || titleLower.includes("employer") && titleLower.includes("match")) {
    selectedQuestions = quizBank["401k"];
  } else if (titleLower.includes("individual retirement") || (titleLower.includes("ira") && !titleLower.includes("backdoor"))) {
    selectedQuestions = quizBank["ira"];
  } else if (titleLower.includes("insurance") || titleLower.includes("risk protection")) {
    selectedQuestions = quizBank["insurance"];
  } else if (titleLower.includes("maximize retirement") || titleLower.includes("retirement savings") && !titleLower.includes("ira")) {
    selectedQuestions = quizBank["retirement"];
  } else if (titleLower.includes("hsa") || titleLower.includes("529") || titleLower.includes("tax-advantaged")) {
    selectedQuestions = quizBank["hsa"];
  } else if (titleLower.includes("mortgage") || titleLower.includes("major financial goals")) {
    selectedQuestions = quizBank["mortgage"];
  } else if (titleLower.includes("estate") || titleLower.includes("will") || titleLower.includes("planning basics")) {
    selectedQuestions = quizBank["estate"];
  } else if (titleLower.includes("tax") || titleLower.includes("backdoor") || titleLower.includes("optimization")) {
    selectedQuestions = quizBank["tax"];
  } else {
    // Default to budgeting questions
    selectedQuestions = quizBank["budgeting"];
  }

  // Randomize the options for each question
  const randomizedQuestions = selectedQuestions.map(q => {
    const optionsWithIndex = q.options.map((option, index) => ({
      option,
      isCorrect: index === q.correctAnswer
    }));
    
    // Shuffle options using Fisher-Yates algorithm
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
    }
    
    // Find new correct answer index
    const newCorrectAnswer = optionsWithIndex.findIndex(o => o.isCorrect);
    
    return {
      ...q,
      options: optionsWithIndex.map(o => o.option),
      correctAnswer: newCorrectAnswer
    };
  });

  // Return 5 questions (or all available if less than 5)
  return randomizedQuestions.slice(0, Math.min(5, randomizedQuestions.length));
}
