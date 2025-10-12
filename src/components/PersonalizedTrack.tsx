"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, TrendingUp, DollarSign, PiggyBank, Home, GraduationCap, Shield } from "lucide-react";

interface Article {
  title: string;
  description: string;
  icon: any;
  searchQuery: string;
}

const goalArticles: Record<string, Article[]> = {
  debt_payoff: [
    {
      title: "Understanding Debt Consolidation",
      description: "Learn how to combine multiple debts into one payment and save on interest",
      icon: DollarSign,
      searchQuery: "debt consolidation"
    },
    {
      title: "Debt Avalanche vs Snowball Method",
      description: "Compare the two most effective strategies for paying off debt faster",
      icon: TrendingUp,
      searchQuery: "debt repayment strategies"
    },
    {
      title: "Building Credit While Paying Off Debt",
      description: "Maintain and improve your credit score as you eliminate debt",
      icon: Shield,
      searchQuery: "credit score improvement"
    }
  ],
  emergency_fund: [
    {
      title: "How Much Should You Save?",
      description: "Calculate the right emergency fund size based on your expenses and situation",
      icon: PiggyBank,
      searchQuery: "emergency fund calculator"
    },
    {
      title: "Best High-Yield Savings Accounts",
      description: "Where to keep your emergency fund for maximum growth and accessibility",
      icon: TrendingUp,
      searchQuery: "high yield savings accounts"
    },
    {
      title: "Building Your Fund on a Budget",
      description: "Practical tips for saving money even when finances are tight",
      icon: DollarSign,
      searchQuery: "saving money tips"
    }
  ],
  retirement: [
    {
      title: "401(k) Basics and Employer Matching",
      description: "Maximize your retirement savings with employer contributions",
      icon: Shield,
      searchQuery: "401k employer match"
    },
    {
      title: "Roth IRA vs Traditional IRA",
      description: "Choose the right retirement account for your tax situation",
      icon: TrendingUp,
      searchQuery: "IRA comparison"
    },
    {
      title: "Retirement Planning by Age",
      description: "How much you should save at every life stage",
      icon: GraduationCap,
      searchQuery: "retirement savings by age"
    }
  ],
  home_purchase: [
    {
      title: "First-Time Homebuyer Programs",
      description: "Discover grants, tax credits, and low down payment options",
      icon: Home,
      searchQuery: "first time home buyer programs"
    },
    {
      title: "How Much House Can You Afford?",
      description: "Calculate your budget including mortgage, taxes, and insurance",
      icon: DollarSign,
      searchQuery: "home affordability calculator"
    },
    {
      title: "Understanding Mortgage Types",
      description: "Compare fixed-rate, ARM, FHA, and VA loan options",
      icon: BookOpen,
      searchQuery: "mortgage types explained"
    }
  ],
  wealth_building: [
    {
      title: "Introduction to Index Fund Investing",
      description: "Build wealth with low-cost, diversified investment strategies",
      icon: TrendingUp,
      searchQuery: "index fund investing"
    },
    {
      title: "Asset Allocation by Age",
      description: "Balance stocks, bonds, and other investments for your timeline",
      icon: Shield,
      searchQuery: "asset allocation strategy"
    },
    {
      title: "Tax-Efficient Investing",
      description: "Minimize taxes and maximize returns with smart account placement",
      icon: DollarSign,
      searchQuery: "tax efficient investing"
    }
  ],
  financial_security: [
    {
      title: "Building Multiple Income Streams",
      description: "Diversify your income for greater financial stability",
      icon: TrendingUp,
      searchQuery: "passive income ideas"
    },
    {
      title: "Insurance Coverage Essentials",
      description: "Protect yourself with the right health, life, and disability insurance",
      icon: Shield,
      searchQuery: "insurance coverage guide"
    },
    {
      title: "Creating a Financial Safety Net",
      description: "Combine savings, insurance, and investments for complete security",
      icon: PiggyBank,
      searchQuery: "financial safety net"
    }
  ],
  education: [
    {
      title: "529 College Savings Plans",
      description: "Tax-advantaged ways to save for education expenses",
      icon: GraduationCap,
      searchQuery: "529 college savings plan"
    },
    {
      title: "Student Loan Repayment Strategies",
      description: "Navigate federal programs and refinancing options",
      icon: BookOpen,
      searchQuery: "student loan repayment"
    },
    {
      title: "Education Tax Benefits",
      description: "Deductions and credits that reduce the cost of education",
      icon: DollarSign,
      searchQuery: "education tax credits"
    }
  ]
};

const defaultArticles: Article[] = [
  {
    title: "Personal Finance Basics",
    description: "Start your financial journey with essential money management concepts",
    icon: BookOpen,
    searchQuery: "personal finance basics"
  },
  {
    title: "Budgeting 101",
    description: "Create a budget that works for your lifestyle and goals",
    icon: PiggyBank,
    searchQuery: "budgeting guide"
  },
  {
    title: "Building Wealth Over Time",
    description: "Long-term strategies for growing your net worth",
    icon: TrendingUp,
    searchQuery: "wealth building strategies"
  }
];

export default function PersonalizedTrack({ userId, userGoal }: { userId: string; userGoal?: string }) {
  const [goal, setGoal] = useState<string>(userGoal || "");
  const [articles, setArticles] = useState<Article[]>(defaultArticles);

  useEffect(() => {
    if (userGoal) {
      setGoal(userGoal);
      const recommendedArticles = goalArticles[userGoal] || defaultArticles;
      setArticles(recommendedArticles);
    }
  }, [userGoal]);

  const handleArticleClick = (searchQuery: string) => {
    // Navigate to home page with search query
    window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
  };

  const goalTitles: Record<string, string> = {
    debt_payoff: "Pay Off Debt",
    emergency_fund: "Build Emergency Fund",
    retirement: "Plan for Retirement",
    home_purchase: "Save for Home",
    wealth_building: "Build Wealth",
    financial_security: "Achieve Financial Security",
    education: "Save for Education"
  };

  return (
    <div className="w-full">
      <div className="encarta-window">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">
            ✨ Your Personalized Financial Path
            {goal && ` - ${goalTitles[goal]}`}
          </span>
        </div>

        <div className="p-6 bg-white">
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  Recommended Articles for You
                </h3>
                <p className="text-sm text-gray-700">
                  Based on your goal{goal && ` to ${goalTitles[goal]?.toLowerCase()}`}, we've selected these articles to help you get started.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map((article, index) => {
              const Icon = article.icon;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleArticleClick(article.searchQuery)}
                  className="encarta-window text-left hover:shadow-lg transition-shadow"
                >
                  <div className="encarta-window-titlebar">
                    <span className="encarta-window-title flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      Article {index + 1}
                    </span>
                  </div>
                  <div className="p-4 bg-white">
                    <h4 className="font-bold text-sm mb-2 text-gray-900">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="mt-3 text-xs font-bold text-blue-600 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Read Article →
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 border-2 border-gray-300 rounded text-center">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Click any article card to start learning. You can always come back here for more recommendations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
