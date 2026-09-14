export type CurrencySymbol = '$' | '₱' | '€' | '£' | '¥' | '₹' | 'S$';

export interface PreOperatingExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface FixedAssetItem {
  id: string;
  name: string;
  cost: number;
  usefulLifeYears: number; // For straight-line depreciation
  salvageValue: number;
}

export interface ProductItem {
  id: string;
  name: string;
  unitPrice: number;
  year1Volume: number;
  annualGrowthRate: number; // In percent e.g. 8 for 8%
  unitCost: number; // Direct material/cost per unit
}

export interface DirectLaborItem {
  id: string;
  role: string;
  headcount: number;
  monthlyWage: number;
  monthsPerYear: number; // 13 for 13th month pay standard in many academic jurisdictions
}

export interface OperatingExpenseItem {
  id: string;
  category: 'Administrative' | 'Selling & Marketing' | 'Utilities & Rent' | 'Other OPEX';
  name: string;
  annualAmountYear1: number;
  annualGrowthRate: number; // In percent e.g. 5 for 5%
}

export interface FinancingAssumptions {
  equityContribution: number; // Owner's initial equity
  bankLoanAmount: number; // Borrowed capital
  annualInterestRate: number; // In percent e.g. 9 for 9%
  loanTermYears: number; // e.g. 3 or 5 years
}

export interface WorkingCapitalPolicy {
  accountsReceivablePercentOfSales: number; // e.g. 5% of sales
  inventoryPercentOfCOGS: number; // e.g. 8% of COGS
  accountsPayablePercentOfPurchases: number; // e.g. 6% of direct materials
  minimumCashBalance: number; // Buffer
}

export interface FeasibilityProject {
  id: string;
  title: string;
  proponents: string;
  academicProgram: string; // e.g. "BS in Accountancy" or "BS Business Administration"
  institution: string;
  academicYear: string;
  currency: CurrencySymbol;
  taxRatePercent: number; // e.g. 25% or 20%
  discountRatePercent: number; // Hurdle rate e.g. 10% or 12%
  inflationRatePercent: number;
  dividendPayoutPercent: number; // % of net income distributed to owners
  
  // Year 0 Setup
  preOperatingExpenses: PreOperatingExpenseItem[];
  fixedAssets: FixedAssetItem[];
  initialWorkingCapitalBuffer: number;
  financing: FinancingAssumptions;

  // Operating Projections
  products: ProductItem[];
  directLabor: DirectLaborItem[];
  factoryOverheadAnnual: number;
  factoryOverheadGrowthRate: number;
  operatingExpenses: OperatingExpenseItem[];
  salesDiscountsPercent: number; // % of gross sales

  // Policies
  workingCapital: WorkingCapitalPolicy;

  // Notes
  academicNotes: string;
}

export interface YearFinancials {
  year: number; // 0, 1, 2, 3, 4, 5
  // Revenue
  grossSales: number;
  salesDiscounts: number;
  netSales: number;
  
  // Cost of Goods Sold / Cost of Sales
  directMaterials: number;
  directLabor: number;
  factoryOverhead: number;
  factoryDepreciation: number;
  totalCOGS: number;
  grossProfit: number;
  grossProfitMargin: number;

  // Operating Expenses
  adminExpenses: number;
  sellingExpenses: number;
  utilitiesAndRent: number;
  otherOpex: number;
  opexDepreciation: number;
  totalOpex: number;

  // Earnings
  ebit: number; // Operating Income
  interestExpense: number;
  ebt: number; // Earnings before tax
  taxExpense: number;
  netIncome: number;
  netProfitMargin: number;

  // Cash Flow
  operatingCashFlow: number;
  investingCashFlow: number; // Capex (negative in yr 0)
  financingCashFlow: number; // Equity, loan in/out, dividends
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;

  // Balance Sheet Items
  cash: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  grossPPE: number;
  accumulatedDepreciation: number;
  netPPE: number;
  totalAssets: number;

  accountsPayable: number;
  currentPortionOfDebt: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalLiabilities: number;

  paidInCapital: number;
  retainedEarnings: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  balanceDifference: number;

  // Financial Metrics
  fixedCosts: number;
  variableCosts: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenSales: number;
  marginOfSafety: number;
  marginOfSafetyRatio: number;
}

export interface LoanAmortizationRow {
  year: number;
  beginningBalance: number;
  annualPayment: number;
  principalRepayment: number;
  interestExpense: number;
  endingBalance: number;
}

export interface DepreciationRow {
  assetId: string;
  assetName: string;
  cost: number;
  usefulLife: number;
  salvageValue: number;
  annualDepreciation: number;
  yearValues: {
    year: number;
    depreciation: number;
    accumulatedDepreciation: number;
    bookValue: number;
  }[];
}

export interface FeasibilityMetrics {
  totalInitialInvestment: number;
  equityContribution: number;
  debtFinancing: number;
  npv: number;
  irr: number;
  paybackPeriodYears: number;
  discountedPaybackPeriodYears: number;
  accountingRateOfReturn: number;
  profitabilityIndex: number;
  isFeasible: boolean;
  verdictSummary: string;
  
  // 5-year average ratios
  avgCurrentRatio: number;
  avgNetProfitMargin: number;
  avgROE: number;
  avgROA: number;
  avgDebtToEquity: number;
}
