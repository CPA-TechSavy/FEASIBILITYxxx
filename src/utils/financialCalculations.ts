import {
  FeasibilityProject,
  YearFinancials,
  LoanAmortizationRow,
  DepreciationRow,
  FeasibilityMetrics,
} from '../types';

/**
 * Calculates depreciation schedule for all fixed assets using the chosen method:
 * - Straight-Line (Default)
 * - Double Declining Balance (200% Accelerated)
 * - 150% Declining Balance
 * - Sum-of-the-Years'-Digits (SYD)
 */
export function calculateDepreciation(project: FeasibilityProject): DepreciationRow[] {
  return project.fixedAssets.map((asset) => {
    const cost = Math.max(0, asset.cost);
    const salvageValue = Math.max(0, Math.min(asset.salvageValue, cost));
    const usefulLife = Math.max(1, asset.usefulLifeYears);
    const depreciableBase = Math.max(0, cost - salvageValue);
    const method = asset.depreciationMethod || 'Straight-Line';

    let accum = 0;
    let currentBookValue = cost;
    const yearValues: {
      year: number;
      depreciation: number;
      accumulatedDepreciation: number;
      bookValue: number;
    }[] = [];

    // Sum of the years digits denominator: n(n+1)/2
    const sydDenominator = (usefulLife * (usefulLife + 1)) / 2;

    for (let yr = 1; yr <= 5; yr++) {
      let dep = 0;

      if (yr <= usefulLife && currentBookValue > salvageValue) {
        if (method === 'Straight-Line') {
          const straightLinePerYear = depreciableBase / usefulLife;
          dep = Math.min(straightLinePerYear, currentBookValue - salvageValue);
        } else if (method === 'Double Declining Balance') {
          const ddbRate = 2 / usefulLife;
          const tentativeDep = currentBookValue * ddbRate;
          dep = Math.min(tentativeDep, currentBookValue - salvageValue);
        } else if (method === '150% Declining Balance') {
          const db150Rate = 1.5 / usefulLife;
          const tentativeDep = currentBookValue * db150Rate;
          dep = Math.min(tentativeDep, currentBookValue - salvageValue);
        } else if (method === 'Sum-of-the-Years-Digits') {
          const remainingLife = usefulLife - yr + 1;
          const tentativeDep = depreciableBase * (remainingLife / sydDenominator);
          dep = Math.min(tentativeDep, currentBookValue - salvageValue);
        }
      }

      dep = Math.max(0, Math.round(dep * 100) / 100);
      accum += dep;
      currentBookValue = Math.max(salvageValue, cost - accum);

      yearValues.push({
        year: yr,
        depreciation: dep,
        accumulatedDepreciation: Math.round(accum * 100) / 100,
        bookValue: Math.round(currentBookValue * 100) / 100,
      });
    }

    const annualDepreciation = yearValues[0]?.depreciation || 0;

    return {
      assetId: asset.id,
      assetName: asset.name,
      cost,
      usefulLife,
      salvageValue,
      depreciationMethod: method,
      annualDepreciation,
      yearValues,
    };
  });
}

/**
 * Calculates loan amortization schedule using equal annual installment formula
 */
export function calculateLoanAmortization(project: FeasibilityProject): LoanAmortizationRow[] {
  const principal = project.financing.bankLoanAmount;
  const rate = project.financing.annualInterestRate / 100;
  const term = Math.max(1, project.financing.loanTermYears);

  if (principal <= 0 || rate <= 0) {
    return [1, 2, 3, 4, 5].map((year) => ({
      year,
      beginningBalance: 0,
      annualPayment: 0,
      principalRepayment: 0,
      interestExpense: 0,
      endingBalance: 0,
    }));
  }

  // Annuity payment formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const annualPayment =
    (principal * (rate * Math.pow(1 + rate, term))) / (Math.pow(1 + rate, term) - 1);

  const schedule: LoanAmortizationRow[] = [];
  let balance = principal;

  for (let yr = 1; yr <= 5; yr++) {
    const beginningBalance = balance;
    let interestExpense = 0;
    let principalRepayment = 0;
    let payment = 0;

    if (yr <= term && balance > 0.01) {
      interestExpense = balance * rate;
      payment = Math.min(annualPayment, balance + interestExpense);
      principalRepayment = payment - interestExpense;
      balance = Math.max(0, balance - principalRepayment);
    } else {
      balance = 0;
    }

    schedule.push({
      year: yr,
      beginningBalance,
      annualPayment: payment,
      principalRepayment,
      interestExpense,
      endingBalance: balance,
    });
  }

  return schedule;
}

/**
 * Calculates 5-year Financial Statements & Balance Sheet with accounting balancing integrity
 */
export function calculate5YearFinancials(project: FeasibilityProject): YearFinancials[] {
  const depreciationSchedule = calculateDepreciation(project);
  const loanSchedule = calculateLoanAmortization(project);

  const totalCapex = project.fixedAssets.reduce((sum, a) => sum + a.cost, 0);
  const totalPreOperating = project.preOperatingExpenses.reduce((sum, p) => sum + p.amount, 0);
  
  // Year 0 Setup
  const year0Cash = project.initialWorkingCapitalBuffer;
  const year0PaidInCapital = project.financing.equityContribution;
  const year0Loan = project.financing.bankLoanAmount;

  const results: YearFinancials[] = [];

  // Year 0 Financials
  const year0: YearFinancials = {
    year: 0,
    grossSales: 0,
    salesDiscounts: 0,
    netSales: 0,
    directMaterials: 0,
    directLabor: 0,
    factoryOverhead: 0,
    factoryDepreciation: 0,
    totalCOGS: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    adminExpenses: totalPreOperating, // Expensed pre-operating in academic studies
    sellingExpenses: 0,
    utilitiesAndRent: 0,
    otherOpex: 0,
    opexDepreciation: 0,
    totalOpex: totalPreOperating,
    ebit: -totalPreOperating,
    interestIncome: 0,
    interestExpense: 0,
    ebt: -totalPreOperating,
    taxExpense: 0,
    netIncome: -totalPreOperating,
    netProfitMargin: 0,
    operatingCashFlow: -totalPreOperating,
    investingCashFlow: -totalCapex,
    financingCashFlow: year0PaidInCapital + year0Loan,
    netCashFlow: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    beginningCash: 0,
    endingCash: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    cash: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    accountsReceivable: 0,
    inventory: 0,
    totalCurrentAssets: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating,
    grossPPE: totalCapex,
    accumulatedDepreciation: 0,
    netPPE: totalCapex,
    totalAssets: year0PaidInCapital + year0Loan - totalCapex - totalPreOperating + totalCapex,
    accountsPayable: 0,
    currentPortionOfDebt: loanSchedule[0] ? loanSchedule[0].principalRepayment : 0,
    totalCurrentLiabilities: loanSchedule[0] ? loanSchedule[0].principalRepayment : 0,
    longTermDebt: Math.max(0, year0Loan - (loanSchedule[0] ? loanSchedule[0].principalRepayment : 0)),
    totalLiabilities: year0Loan,
    paidInCapital: year0PaidInCapital,
    retainedEarnings: -totalPreOperating,
    totalEquity: year0PaidInCapital - totalPreOperating,
    totalLiabilitiesAndEquity: year0Loan + (year0PaidInCapital - totalPreOperating),
    isBalanced: true,
    balanceDifference: 0,
    fixedCosts: totalPreOperating,
    variableCosts: 0,
    contributionMargin: 0,
    contributionMarginRatio: 0,
    breakEvenSales: 0,
    marginOfSafety: 0,
    marginOfSafetyRatio: 0,
  };
  results.push(year0);

  let prevCash = year0.endingCash;
  let prevAR = 0;
  let prevInventory = 0;
  let prevAP = 0;
  let cumulativeRetainedEarnings = year0.retainedEarnings;

  for (let yr = 1; yr <= 5; yr++) {
    // 1. Sales Calculation
    let grossSales = 0;
    let directMaterials = 0;

    project.products.forEach((prod) => {
      // Compound growth rate from Year 1
      const growthFactor = Math.pow(1 + prod.annualGrowthRate / 100, yr - 1);
      const volume = prod.year1Volume * growthFactor;
      const sales = volume * prod.unitPrice;
      const dm = volume * prod.unitCost;

      grossSales += sales;
      directMaterials += dm;
    });

    const salesDiscounts = grossSales * (project.salesDiscountsPercent / 100);
    const netSales = grossSales - salesDiscounts;

    // 2. Direct Labor
    let directLabor = 0;
    project.directLabor.forEach((lab) => {
      const inflationFactor = Math.pow(1 + project.inflationRatePercent / 100, yr - 1);
      const annualWage = lab.monthlyWage * lab.monthsPerYear * lab.headcount * inflationFactor;
      directLabor += annualWage;
    });

    // 3. Factory Overhead & Depreciation
    const factoryOverhead =
      project.factoryOverheadAnnual * Math.pow(1 + project.factoryOverheadGrowthRate / 100, yr - 1);

    // Total annual depreciation
    const totalYearDepreciation = depreciationSchedule.reduce((sum, d) => {
      const yrVal = d.yearValues.find((y) => y.year === yr);
      return sum + (yrVal ? yrVal.depreciation : 0);
    }, 0);

    // Attribute 50% of machinery/equipment depreciation to factory, rest to OPEX
    const factoryDepreciation = totalYearDepreciation * 0.4;
    const opexDepreciation = totalYearDepreciation * 0.6;

    const totalCOGS = directMaterials + directLabor + factoryOverhead + factoryDepreciation;
    const grossProfit = netSales - totalCOGS;
    const grossProfitMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    // 4. Operating Expenses
    let adminExpenses = 0;
    let sellingExpenses = 0;
    let utilitiesAndRent = 0;
    let otherOpex = 0;

    project.operatingExpenses.forEach((opex) => {
      const growth = Math.pow(1 + opex.annualGrowthRate / 100, yr - 1);
      const amount = opex.annualAmountYear1 * growth;
      if (opex.category === 'Administrative') adminExpenses += amount;
      else if (opex.category === 'Selling & Marketing') sellingExpenses += amount;
      else if (opex.category === 'Utilities & Rent') utilitiesAndRent += amount;
      else otherOpex += amount;
    });

    const totalOpex =
      adminExpenses + sellingExpenses + utilitiesAndRent + otherOpex + opexDepreciation;
    const ebit = grossProfit - totalOpex;

    // 5. Financing, Interest Income & Tax
    const initialBankDeposit =
      project.workingCapitalBufferDetails?.cashInBank ??
      (project.initialWorkingCapitalBuffer * 0.8);
    const bankInterestRate =
      (project.workingCapitalBufferDetails?.bankInterestRatePercent ?? 0) / 100;
    // Bank deposit generates interest income based on cash held in bank account
    const bankDepositBalance = Math.max(0, Math.min(prevCash, initialBankDeposit));
    const interestIncome = Math.round(bankDepositBalance * bankInterestRate);

    const loanRow = loanSchedule[yr - 1] || {
      interestExpense: 0,
      principalRepayment: 0,
      endingBalance: 0,
    };
    const interestExpense = loanRow.interestExpense;
    const ebt = ebit + interestIncome - interestExpense;
    const taxExpense = ebt > 0 ? ebt * (project.taxRatePercent / 100) : 0;
    const netIncome = ebt - taxExpense;
    const netProfitMargin = netSales > 0 ? (netIncome / netSales) * 100 : 0;

    // 6. Working Capital Requirements (Balance Sheet Drivers)
    const accountsReceivable = netSales * (project.workingCapital.accountsReceivablePercentOfSales / 100);
    const inventory = totalCOGS * (project.workingCapital.inventoryPercentOfCOGS / 100);
    const accountsPayable = directMaterials * (project.workingCapital.accountsPayablePercentOfPurchases / 100);

    const deltaAR = accountsReceivable - prevAR;
    const deltaInv = inventory - prevInventory;
    const deltaAP = accountsPayable - prevAP;

    // 7. Cash Flow Statement (Indirect Method)
    // Operating Cash Flow = Net Income + Non-cash Depreciation - ΔAR - ΔInventory + ΔAP
    const operatingCashFlow = netIncome + totalYearDepreciation - deltaAR - deltaInv + deltaAP;
    
    // Investing Cash Flow (Year 1-5 has 0 major capex in typical undergraduate base model)
    const investingCashFlow = 0;

    // Dividends / Drawings
    const dividendsPaid =
      netIncome > 0 ? netIncome * (project.dividendPayoutPercent / 100) : 0;

    // Financing Cash Flow = - Principal Repayment - Dividends
    const financingCashFlow = -loanRow.principalRepayment - dividendsPaid;
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
    const endingCash = prevCash + netCashFlow;

    // 8. Balance Sheet items
    const cash = endingCash;
    const totalCurrentAssets = cash + accountsReceivable + inventory;

    // Accumulated Depreciation up to year yr
    const totalAccumDepreciation = depreciationSchedule.reduce((sum, d) => {
      const yrVal = d.yearValues.find((y) => y.year === yr);
      return sum + (yrVal ? yrVal.accumulatedDepreciation : 0);
    }, 0);
    const grossPPE = totalCapex;
    const accumulatedDepreciation = totalAccumDepreciation;
    const netPPE = Math.max(0, grossPPE - accumulatedDepreciation);
    const totalAssets = totalCurrentAssets + netPPE;

    // Debt
    const nextLoanRow = loanSchedule[yr] || { principalRepayment: 0 };
    const currentPortionOfDebt = Math.min(loanRow.endingBalance, nextLoanRow.principalRepayment);
    const totalCurrentLiabilities = accountsPayable + currentPortionOfDebt;
    const longTermDebt = Math.max(0, loanRow.endingBalance - currentPortionOfDebt);
    const totalLiabilities = totalCurrentLiabilities + longTermDebt;

    // Equity
    cumulativeRetainedEarnings += netIncome - dividendsPaid;
    const paidInCapital = year0PaidInCapital;
    const retainedEarnings = cumulativeRetainedEarnings;
    const totalEquity = paidInCapital + retainedEarnings;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    const diff = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = diff < 1.0; // Rounding tolerance within 1 currency unit

    // 9. Break-Even Analysis
    // Fixed Costs = Salaries (DL fixed base 70%) + FOH + Admin + Rent/Utilities + Depreciation + Interest
    const fixedCosts =
      directLabor * 0.7 +
      factoryOverhead +
      adminExpenses +
      utilitiesAndRent +
      otherOpex +
      totalYearDepreciation +
      interestExpense;
    // Variable Costs = Direct Materials + Direct Labor variable (30%) + Selling commission/marketing
    const variableCosts = directMaterials + directLabor * 0.3 + sellingExpenses + salesDiscounts;
    const contributionMargin = netSales - variableCosts;
    const contributionMarginRatio = netSales > 0 ? contributionMargin / netSales : 0;
    const breakEvenSales =
      contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;
    const marginOfSafety = Math.max(0, netSales - breakEvenSales);
    const marginOfSafetyRatio = netSales > 0 ? (marginOfSafety / netSales) * 100 : 0;

    results.push({
      year: yr,
      grossSales,
      salesDiscounts,
      netSales,
      directMaterials,
      directLabor,
      factoryOverhead,
      factoryDepreciation,
      totalCOGS,
      grossProfit,
      grossProfitMargin,
      adminExpenses,
      sellingExpenses,
      utilitiesAndRent,
      otherOpex,
      opexDepreciation,
      totalOpex,
      ebit,
      interestIncome,
      interestExpense,
      ebt,
      taxExpense,
      netIncome,
      netProfitMargin,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      beginningCash: prevCash,
      endingCash,
      cash,
      accountsReceivable,
      inventory,
      totalCurrentAssets,
      grossPPE,
      accumulatedDepreciation,
      netPPE,
      totalAssets,
      accountsPayable,
      currentPortionOfDebt,
      totalCurrentLiabilities,
      longTermDebt,
      totalLiabilities,
      paidInCapital,
      retainedEarnings,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced,
      balanceDifference: totalAssets - totalLiabilitiesAndEquity,
      fixedCosts,
      variableCosts,
      contributionMargin,
      contributionMarginRatio: contributionMarginRatio * 100,
      breakEvenSales,
      marginOfSafety,
      marginOfSafetyRatio,
    });

    // Update state for next iteration
    prevCash = endingCash;
    prevAR = accountsReceivable;
    prevInventory = inventory;
    prevAP = accountsPayable;
  }

  return results;
}

/**
 * Calculates Capital Budgeting Feasibility Metrics: NPV, IRR, Payback, ARR
 */
export function calculateFeasibilityMetrics(
  project: FeasibilityProject,
  financials: YearFinancials[]
): FeasibilityMetrics {
  const totalCapex = project.fixedAssets.reduce((sum, a) => sum + a.cost, 0);
  const totalPreOp = project.preOperatingExpenses.reduce((sum, p) => sum + p.amount, 0);
  const initialWorkingCapital = project.initialWorkingCapitalBuffer;
  const totalInitialInvestment = totalCapex + totalPreOp + initialWorkingCapital;

  const r = project.discountRatePercent / 100;

  // Free Cash Flows from Year 1 to 5
  // For equity feasibility / project feasibility: we use Net Cash Flow from Operations + salvage value in yr 5
  // or Net Cash Flow. In academic studies, Net Operating Cash Flow (less any replacement Capex) is standard.
  const cashFlows = [
    -totalInitialInvestment,
    financials[1]?.operatingCashFlow || 0,
    financials[2]?.operatingCashFlow || 0,
    financials[3]?.operatingCashFlow || 0,
    financials[4]?.operatingCashFlow || 0,
    (financials[5]?.operatingCashFlow || 0) + (financials[5]?.netPPE || 0) * 0.5, // Terminal / residual value in yr 5
  ];

  // 1. Net Present Value (NPV)
  let npv = cashFlows[0];
  for (let t = 1; t <= 5; t++) {
    npv += cashFlows[t] / Math.pow(1 + r, t);
  }

  // 2. Internal Rate of Return (IRR) via numerical bisection
  let low = -0.5;
  let high = 2.0;
  let irr = 0;

  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    let npvMid = cashFlows[0];
    for (let t = 1; t <= 5; t++) {
      npvMid += cashFlows[t] / Math.pow(1 + mid, t);
    }

    if (Math.abs(npvMid) < 0.0001) {
      irr = mid;
      break;
    }

    let npvLow = cashFlows[0];
    for (let t = 1; t <= 5; t++) {
      npvLow += cashFlows[t] / Math.pow(1 + low, t);
    }

    if (npvLow * npvMid < 0) {
      high = mid;
    } else {
      low = mid;
    }
    irr = mid;
  }

  // 3. Payback Period
  let cumulative = 0;
  let paybackPeriodYears = 5;
  for (let t = 1; t <= 5; t++) {
    const cf = cashFlows[t];
    if (cumulative + cf >= totalInitialInvestment) {
      const remainingNeeded = totalInitialInvestment - cumulative;
      paybackPeriodYears = t - 1 + remainingNeeded / Math.max(0.01, cf);
      break;
    }
    cumulative += cf;
  }

  // 4. Discounted Payback Period
  let discCumulative = 0;
  let discountedPaybackPeriodYears = 5;
  for (let t = 1; t <= 5; t++) {
    const dcf = cashFlows[t] / Math.pow(1 + r, t);
    if (discCumulative + dcf >= totalInitialInvestment) {
      const remainingNeeded = totalInitialInvestment - discCumulative;
      discountedPaybackPeriodYears = t - 1 + remainingNeeded / Math.max(0.01, dcf);
      break;
    }
    discCumulative += dcf;
  }

  // 5. Accounting Rate of Return (ARR) = Average Net Income / Initial Investment
  const totalNetIncome = financials.slice(1).reduce((sum, f) => sum + f.netIncome, 0);
  const avgNetIncome = totalNetIncome / 5;
  const accountingRateOfReturn = (avgNetIncome / Math.max(1, totalInitialInvestment)) * 100;

  // 6. Profitability Index (PI) = PV of Future Cash Inflows / Initial Outlay
  const pvInflows = npv - cashFlows[0];
  const profitabilityIndex = pvInflows / Math.max(1, Math.abs(cashFlows[0]));

  const isFeasible = npv > 0 && irr > r && paybackPeriodYears <= 5;

  let verdictSummary = '';
  if (isFeasible) {
    verdictSummary = `FINANCIALLY FEASIBLE: The project yields a positive Net Present Value (NPV) of ${npv >= 0 ? '+' : ''}${Math.round(npv).toLocaleString()} at a ${project.discountRatePercent}% hurdle rate, with an Internal Rate of Return (IRR) of ${(irr * 100).toFixed(1)}% substantially exceeding the cost of capital, and an expected Payback Period of ${paybackPeriodYears.toFixed(2)} years.`;
  }

  // 5-Year Average Ratios
  const years = financials.slice(1);
  const avgCurrentRatio =
    years.reduce(
      (sum, y) =>
        sum + (y.totalCurrentLiabilities > 0 ? y.totalCurrentAssets / y.totalCurrentLiabilities : 1),
      0
    ) / 5;

  const avgNetProfitMargin = years.reduce((sum, y) => sum + y.netProfitMargin, 0) / 5;

  const avgROE =
    years.reduce((sum, y) => sum + (y.totalEquity > 0 ? (y.netIncome / y.totalEquity) * 100 : 0), 0) /
    5;

  const avgROA =
    years.reduce((sum, y) => sum + (y.totalAssets > 0 ? (y.netIncome / y.totalAssets) * 100 : 0), 0) /
    5;

  const avgDebtToEquity =
    years.reduce(
      (sum, y) => sum + (y.totalEquity > 0 ? y.totalLiabilities / y.totalEquity : 0),
      0
    ) / 5;

  return {
    totalInitialInvestment,
    equityContribution: project.financing.equityContribution,
    debtFinancing: project.financing.bankLoanAmount,
    npv,
    irr: irr * 100,
    paybackPeriodYears,
    discountedPaybackPeriodYears,
    accountingRateOfReturn,
    profitabilityIndex,
    isFeasible,
    verdictSummary,
    avgCurrentRatio,
    avgNetProfitMargin,
    avgROE,
    avgROA,
    avgDebtToEquity,
  };
}

/**
 * Format currency with commas and academic bracket formatting for negative numbers
 */
export function formatCurrency(
  value: number,
  currency: string = '₱',
  decimals: number = 0
): string {
  if (isNaN(value)) return `${currency}0`;
  const rounded = Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (value < -0.01) {
    return `(${currency}${rounded})`;
  }
  return `${currency}${rounded}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}
