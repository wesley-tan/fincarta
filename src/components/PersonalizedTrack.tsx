"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PiggyBank, Home, GraduationCap, Shield } from "lucide-react";

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
      icon: Home,
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
  just_learning: [
    {
      title: "Personal Finance Basics",
      description: "Start your financial journey with essential money management concepts",
      icon: GraduationCap,
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
  ]
};

export default function PersonalizedTrack({ userId }: { userId: string }) {
  const [goal, setGoal] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserGoal();
  }, [userId]);

  async function loadUserGoal() {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('primary_goal')
        .eq('id', userId)
        .single();

      if (profile?.primary_goal) {
        setGoal(profile.primary_goal);
        const recommendedArticles = goalArticles[profile.primary_goal] || goalArticles['just_learning'];
        setArticles(recommendedArticles);
      }
    } catch (error) {
      console.error('Error loading user goal:', error);
      setArticles(goalArticles['just_learning']);
    } finally {
      setLoading(false);
    }
  }

  const handleArticleClick = (searchQuery: string) => {
    window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
  };

  const goalTitles: Record<string, string> = {
    debt_payoff: "Pay Off Debt",
    emergency_fund: "Build Emergency Fund",
    retirement: "Plan for Retirement",
    home_purchase: "Save for Home",
    wealth_building: "Build Wealth",
    financial_security: "Achieve Financial Security",
    just_learning: "Learn Finance Basics"
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="encarta-window">
          <div className="encarta-window-titlebar">
            <span className="encarta-window-title">✨ YOUR PERSONALIZED PATH</span>
          </div>
          <div className="p-8 bg-white text-center">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-xs text-black">Loading your recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="encarta-window">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">
            ✨ YOUR PERSONALIZED PATH
            {goal && ` - ${goalTitles[goal]}`}
          </span>
        </div>

        <div className="p-6 bg-white">
          {/* Header */}
          <div className="mb-6 p-4 bg-[#DFDFDF] border-2 border-[#808080]">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📚</span>
              <div>
                <h3 className="font-bold text-sm mb-2 text-black">
                  Recommended Articles for You
                </h3>
                <p className="text-xs text-black">
                  Based on your goal{goal && ` to ${goalTitles[goal]?.toLowerCase()}`}, we've selected these articles to help you get started.
                </p>
              </div>
            </div>
          </div>

          {/* Article Cards */}
          <div className="space-y-4">
            {articles.map((article, index) => {
              const Icon = article.icon;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleArticleClick(article.searchQuery)}
                  className="w-full encarta-window text-left hover:shadow-lg transition-all"
                >
                  <div className="encarta-window-titlebar">
                    <span className="encarta-window-title flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {index + 1}. {article.title}
                    </span>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-xs text-black mb-3 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#0066CC]">
                      <span>📖</span>
                      Click to Read Article →
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 p-4 bg-[#DFDFDF] border-2 border-[#808080] text-center">
            <p className="text-xs text-black">
              💡 <strong>Tip:</strong> Click any article to start learning. Each article will open with full AI assistant support!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
