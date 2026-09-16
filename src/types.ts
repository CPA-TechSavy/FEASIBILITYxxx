export type CurrencySymbol = '$' | '₱' | '€' | '£' | '¥' | '₹' | 'S$';

export type DepreciationMethod =
  | 'Straight-Line'
  | 'Double Declining Balance'
  | '150% Declining Balance'
  | 'Sum-of-the-Years-Digits';

export interface PreOperatingExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface FixedAssetItem {
  id: string;
  name: string;
  cost: number;
  usefulLifeYears: number; // For depreciation calculation
  salvageValue: number;
  depreciationMethod?: DepreciationMethod; // Defaults to Straight-Line
}

export type CostComponentCategory =
  | 'Raw Materials & Ingredients'
  | 'Packaging & Containers'
  | 'Direct Consumables & Supplies'
  | 'Direct Labor Allocation'
  | 'Direct Overhead & Freight';

export interface ProductCostComponent {
  id: string;
  category: CostComponentCategory;
  name: string;
  // Calculation mode: 'package_yield' (e.g., 1 box of Oat Milk at 120 PHP produces 10 Espressos -> 12 PHP/unit)
  // or 'direct_unit' (direct quantity * unit cost per finished unit)
  costMode?: 'package_yield' | 'direct_unit';
  purchaseCost?: number; // e.g. 120 PHP per package/box/bag
  packageUnit?: string; // e.g. 'box', 'carton', 'bag', 'kg', 'bottle', 'pack'
  packageQuantity?: number; // e.g. 1 (1 box)
  yieldUnits?: number; // e.g. 10 (produces 10 units of finished product per package)
  // Standard / direct unit fields (maintained for calculation & compatibility):
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number; // Cost per 1 finished unit of product
}

export interface ProductItem {
  id: string;
  name: string;
  unitPrice: number;
  year1Volume: number;
  annualGrowthRate: number; // In percent e.g. 8 for 8%
  unitCost: number; // Total Cost per unit (Direct Materials + Direct Labor + Factory Overhead)
  directLaborCostPerUnit?: number; // Direct Labor component per unit
  rawMaterialsCostPerUnit?: number; // Direct Materials component per unit
  factoryOverheadCostPerUnit?: number; // Factory Overhead component per unit
  fohCostMode?: 'volume_share' | 'custom'; // Mode for FOH allocation
  costBreakdown?: ProductCostComponent[];
  laborMinutesPerUnit?: number;
  laborHourlyRate?: number;
  dlCostMode?: 'volume_share' | 'custom' | 'hourly_time';
}

export interface DirectLaborItem {
  id: string;
  role: string;
  headcount: number;
  monthlyWage: number;
  monthsPerYear: number; // 13 for 13th month pay standard in many academic jurisdictions
}

export interface IndirectLaborItem {
  id: string;
  role: string;
  headcount: number;
  monthlyWage: number;
  monthsPerYear: number; // Factory supervisory, QA, maintenance, plant support
}

export interface ProductionUtilityItem {
  id: string;
  name: string;
  annualAmountYear1: number;
  annualGrowthRate: number;
}

export interface FactorySupplyItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  annualAmount: number;
  notes?: string;
}

export type BenefitCalculationType = 'percentage' | 'fixed_monthly_per_head' | 'fixed_annual';
export type BenefitAppliesTo = 'both' | 'direct_only' | 'indirect_only';

export interface LaborBenefitItem {
  id: string;
  name: string;
  type: BenefitCalculationType;
  rateOrAmount: number; // % rate e.g. 9.5 for SSS, or fixed monthly 200 for Pag-IBIG, or lump sum
  appliesTo: BenefitAppliesTo;
  notes?: string;
}

export interface NonManufacturingLaborItem {
  id: string;
  role: string;
  category: 'Administrative' | 'Selling & Marketing';
  headcount: number;
  monthlyWage: number;
  monthsPerYear: number;
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

export interface WorkingCapitalBufferDetails {
  cashOnHand: number;
  cashInBank: number;
  bankName: string;
  bankInterestRatePercent: number; // Manually encoded by the user (% p.a.)
}

export interface WorkingCapitalPolicy {
  accountsReceivablePercentOfSales: number; // e.g. 5% of sales
  inventoryPercentOfCOGS: number; // e.g. 8% of COGS
  accountsPayablePercentOfPurchases: number; // e.g. 6% of direct materials
  minimumCashBalance: number; // Buffer
}

export type EntityClassification = 'Sole Proprietorship' | 'Partnership' | 'Corporation';

export interface PartnerContribution {
  id: string;
  name: string;
  capitalContribution: number;
  profitSharePercent: number; // e.g. 50 for 50%
}

export interface SoleProprietorshipDetails {
  ownerName: string;
  ownerCapital: number;
  drawingsAnnual?: number;
}

export interface PartnershipDetails {
  partners: PartnerContribution[];
  totalPartnersCapital: number;
  partnershipAgreementSummary?: string;
}

export interface CorporationDetails {
  authorizedCapital: number; // Authorized Capital Stock
  paidUpCapital: number; // Paid-up Capital
  parValuePerShare: number; // Par Value per Share (e.g. 100)
  authorizedShares?: number; // Authorized shares count
  subscribedCapital?: number; // Subscribed Capital
  subscribedShares?: number;
  paidUpShares?: number; // Paid-up shares count
}

export interface CompanyAccount {
  entityName: string; // Name of the Entity
  classification: EntityClassification; // Sole Proprietorship | Partnership | Corporation
  natureOfCompany: string; // Nature of the Company (e.g. Manufacturing, Merchandising, Service, Food & Beverage)
  purposeOfEntity: string; // Purpose of the Entity
  soleProprietorship?: SoleProprietorshipDetails;
  partnership?: PartnershipDetails;
  corporation?: CorporationDetails;
  dateEstablished?: string;
}

export interface FeasibilityProject {
  id: string;
  title: string;
  companyAccount?: CompanyAccount;
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
  initialWorkingCapitalBuffer: number; // Sum of cashOnHand + cashInBank
  workingCapitalBufferDetails?: WorkingCapitalBufferDetails;
  financing: FinancingAssumptions;

  // Operating Projections
  products: ProductItem[];
  directLabor: DirectLaborItem[];
  indirectLabor?: IndirectLaborItem[];
  productionUtilities?: ProductionUtilityItem[];
  factoryDepreciationPercent?: number; // % of total fixed asset depreciation attributable to factory/production (default 50%)
  factoryDepreciationMethod?: 'percentage' | 'specific_assets'; // Mode: percentage or specific asset selection
  factoryAssetIds?: string[]; // Asset IDs fully attributed (100%) to factory/production
  factorySupplies?: FactorySupplyItem[]; // Itemized indirect supplies and consumables
  productionLaborBenefits?: LaborBenefitItem[]; // SSS, PhilHealth, Pag-IBIG, 13th month, other benefits
  includeLaborBenefitsInCOGS?: boolean; // Whether labor benefits flow into Factory Overhead / COGS (default true)
  factoryOverheadAnnual: number;
  factoryOverheadGrowthRate: number;
  nonManufacturingLabor?: NonManufacturingLaborItem[];
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
  factoryLaborBenefits?: number;
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
  interestIncome?: number; // Interest income from Cash in Bank deposits
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
  depreciationMethod: DepreciationMethod;
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
