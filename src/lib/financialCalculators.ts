// Financial Calculators for Gemini Function Calling

export const financialCalculators = {
  // Compound Interest Calculator
  calculateCompoundInterest: (params: {
    principal: number;
    rate: number;
    time: number;
    frequency?: number;
  }) => {
    const { principal, rate, time, frequency = 12 } = params;
    const amount = principal * Math.pow(1 + rate / 100 / frequency, frequency * time);
    const interest = amount - principal;
    
    return {
      finalAmount: Math.round(amount * 100) / 100,
      totalInterest: Math.round(interest * 100) / 100,
      principal,
      explanation: `With ${principal} invested at ${rate}% for ${time} years, you'll have $${Math.round(amount * 100) / 100} total. That's $${Math.round(interest * 100) / 100} in interest!`,
    };
  },

  // Simple Interest Calculator
  calculateSimpleInterest: (params: {
    principal: number;
    rate: number;
    time: number;
  }) => {
    const { principal, rate, time } = params;
    const interest = (principal * rate * time) / 100;
    const total = principal + interest;
    
    return {
      totalInterest: Math.round(interest * 100) / 100,
      finalAmount: Math.round(total * 100) / 100,
      explanation: `Simple interest of ${rate}% on $${principal} for ${time} years equals $${Math.round(interest * 100) / 100}.`,
    };
  },

  // Retirement Savings Calculator
  calculateRetirement: (params: {
    currentAge: number;
    retirementAge: number;
    monthlyContribution: number;
    currentSavings?: number;
    annualReturn?: number;
  }) => {
    const { 
      currentAge, 
      retirementAge, 
      monthlyContribution, 
      currentSavings = 0,
      annualReturn = 7 
    } = params;
    
    const years = retirementAge - currentAge;
    const months = years * 12;
    const monthlyRate = annualReturn / 100 / 12;
    
    // Future value of current savings
    const futureValueCurrent = currentSavings * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    const total = futureValueCurrent + futureValueContributions;
    
    return {
      estimatedTotal: Math.round(total),
      yearsUntilRetirement: years,
      totalContributions: monthlyContribution * months + currentSavings,
      gainFromInterest: Math.round(total - (monthlyContribution * months + currentSavings)),
      explanation: `Saving $${monthlyContribution}/month for ${years} years at ${annualReturn}% return will grow to approximately $${Math.round(total).toLocaleString()}.`,
    };
  },

  // Mortgage Payment Calculator
  calculateMortgage: (params: {
    loanAmount: number;
    interestRate: number;
    loanTermYears: number;
  }) => {
    const { loanAmount, interestRate, loanTermYears } = params;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalPaid = monthlyPayment * numPayments;
    const totalInterest = totalPaid - loanAmount;
    
    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      explanation: `For a $${loanAmount.toLocaleString()} loan at ${interestRate}% for ${loanTermYears} years, you'll pay $${Math.round(monthlyPayment * 100) / 100}/month.`,
    };
  },

  // Emergency Fund Calculator
  calculateEmergencyFund: (params: {
    monthlyExpenses: number;
    months?: number;
  }) => {
    const { monthlyExpenses, months = 6 } = params;
    const recommendedAmount = monthlyExpenses * months;
    
    return {
      recommendedAmount: Math.round(recommendedAmount),
      months,
      monthlyExpenses,
      explanation: `With $${monthlyExpenses}/month in expenses, aim for $${Math.round(recommendedAmount).toLocaleString()} in your emergency fund (${months} months).`,
    };
  },

  // Debt Payoff Calculator
  calculateDebtPayoff: (params: {
    principal: number;
    interestRate: number;
    monthlyPayment: number;
  }) => {
    const { principal, interestRate, monthlyPayment } = params;
    const monthlyRate = interestRate / 100 / 12;
    
    const months = Math.log(monthlyPayment / (monthlyPayment - principal * monthlyRate)) / 
                   Math.log(1 + monthlyRate);
    
    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;
    
    return {
      monthsToPayoff: Math.ceil(months),
      yearsToPayoff: Math.round((months / 12) * 10) / 10,
      totalInterestPaid: Math.round(totalInterest),
      explanation: `Paying $${monthlyPayment}/month on a $${principal} debt at ${interestRate}% will take ${Math.ceil(months)} months (${Math.round((months / 12) * 10) / 10} years).`,
    };
  },

  // Investment Return Calculator
  calculateInvestmentReturn: (params: {
    initialInvestment: number;
    finalValue: number;
    years: number;
  }) => {
    const { initialInvestment, finalValue, years } = params;
    const totalReturn = ((finalValue - initialInvestment) / initialInvestment) * 100;
    const annualReturn = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;
    
    return {
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualReturn: Math.round(annualReturn * 100) / 100,
      profit: Math.round(finalValue - initialInvestment),
      explanation: `Growing from $${initialInvestment} to $${finalValue} over ${years} years is a ${Math.round(annualReturn * 100) / 100}% annual return.`,
    };
  },
};

// Function declarations for Gemini
export const financialFunctionDeclarations = [
  {
    name: "calculateCompoundInterest",
    description: "Calculate compound interest for an investment",
    parameters: {
      type: "object",
      properties: {
        principal: { type: "number", description: "Initial investment amount in dollars" },
        rate: { type: "number", description: "Annual interest rate as a percentage (e.g., 7 for 7%)" },
        time: { type: "number", description: "Time period in years" },
        frequency: { type: "number", description: "Compounding frequency per year (default: 12 for monthly)" },
      },
      required: ["principal", "rate", "time"],
    },
  },
  {
    name: "calculateSimpleInterest",
    description: "Calculate simple interest",
    parameters: {
      type: "object",
      properties: {
        principal: { type: "number", description: "Principal amount in dollars" },
        rate: { type: "number", description: "Annual interest rate as percentage" },
        time: { type: "number", description: "Time period in years" },
      },
      required: ["principal", "rate", "time"],
    },
  },
  {
    name: "calculateRetirement",
    description: "Calculate retirement savings projections",
    parameters: {
      type: "object",
      properties: {
        currentAge: { type: "number", description: "Current age" },
        retirementAge: { type: "number", description: "Target retirement age" },
        monthlyContribution: { type: "number", description: "Monthly savings amount" },
        currentSavings: { type: "number", description: "Current retirement savings" },
        annualReturn: { type: "number", description: "Expected annual return percentage (default: 7)" },
      },
      required: ["currentAge", "retirementAge", "monthlyContribution"],
    },
  },
  {
    name: "calculateMortgage",
    description: "Calculate monthly mortgage payments",
    parameters: {
      type: "object",
      properties: {
        loanAmount: { type: "number", description: "Total loan amount" },
        interestRate: { type: "number", description: "Annual interest rate percentage" },
        loanTermYears: { type: "number", description: "Loan term in years" },
      },
      required: ["loanAmount", "interestRate", "loanTermYears"],
    },
  },
  {
    name: "calculateEmergencyFund",
    description: "Calculate recommended emergency fund amount",
    parameters: {
      type: "object",
      properties: {
        monthlyExpenses: { type: "number", description: "Monthly expenses" },
        months: { type: "number", description: "Number of months to cover (default: 6)" },
      },
      required: ["monthlyExpenses"],
    },
  },
  {
    name: "calculateDebtPayoff",
    description: "Calculate how long it takes to pay off debt",
    parameters: {
      type: "object",
      properties: {
        principal: { type: "number", description: "Total debt amount" },
        interestRate: { type: "number", description: "Annual interest rate percentage" },
        monthlyPayment: { type: "number", description: "Monthly payment amount" },
      },
      required: ["principal", "interestRate", "monthlyPayment"],
    },
  },
  {
    name: "calculateInvestmentReturn",
    description: "Calculate investment return percentage",
    parameters: {
      type: "object",
      properties: {
        initialInvestment: { type: "number", description: "Initial investment amount" },
        finalValue: { type: "number", description: "Final investment value" },
        years: { type: "number", description: "Investment time period in years" },
      },
      required: ["initialInvestment", "finalValue", "years"],
    },
  },
];

