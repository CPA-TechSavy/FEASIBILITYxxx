import { FeasibilityProject } from '../types';

export const BLANK_PROJECT: FeasibilityProject = {
  id: 'feasibility-study',
  title: '',
  proponents: '',
  academicProgram: '',
  institution: '',
  academicYear: 'A.Y. 2026–2027',
  currency: '₱',
  taxRatePercent: 25,
  discountRatePercent: 12,
  inflationRatePercent: 4.0,
  dividendPayoutPercent: 0,

  preOperatingExpenses: [],
  fixedAssets: [],

  initialWorkingCapitalBuffer: 0,
  workingCapitalBufferDetails: {
    cashOnHand: 0,
    cashInBank: 0,
    bankName: '',
    bankInterestRatePercent: 0,
  },

  financing: {
    equityContribution: 0,
    bankLoanAmount: 0,
    annualInterestRate: 0,
    loanTermYears: 5,
  },

  products: [],
  directLabor: [],
  indirectLabor: [],
  productionUtilities: [],
  factoryDepreciationPercent: 50,
  factoryDepreciationMethod: 'percentage',
  factoryAssetIds: [],
  factorySupplies: [],
  productionLaborBenefits: [],
  includeLaborBenefitsInCOGS: true,
  factoryOverheadAnnual: 0,
  factoryOverheadGrowthRate: 0,
  nonManufacturingLabor: [],
  operatingExpenses: [],

  salesDiscountsPercent: 0,

  workingCapital: {
    accountsReceivablePercentOfSales: 0,
    inventoryPercentOfCOGS: 0,
    accountsPayablePercentOfPurchases: 0,
    minimumCashBalance: 0,
  },

  academicNotes:
    'Depreciation is computed using the Straight-Line Method over the estimated useful life of the assets. Income tax is calculated at statutory rate. Cash flows are discounted at the target hurdle rate representing the weighted average cost of capital.',
};

export const SAMPLE_PROJECTS: FeasibilityProject[] = [BLANK_PROJECT];
