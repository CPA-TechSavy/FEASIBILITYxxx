import { FeasibilityProject } from '../types';

export const SAMPLE_PROJECTS: FeasibilityProject[] = [
  {
    id: 'cafe-artisan',
    title: 'Cafe Aurora Artisan Coffee & Pastry Studio',
    proponents: 'J. Dela Cruz, M. Santos, R. Tan (BSBA Financial Management)',
    academicProgram: 'Bachelor of Science in Business Administration',
    institution: 'University College of Business & Accountancy',
    academicYear: 'A.Y. 2026–2027',
    currency: '₱',
    taxRatePercent: 25,
    discountRatePercent: 12,
    inflationRatePercent: 4.5,
    dividendPayoutPercent: 20,

    preOperatingExpenses: [
      { id: 'pre-1', name: 'Business Registration & SEC/DTI Filing', amount: 35000 },
      { id: 'pre-2', name: 'Mayor’s Permit, Sanitary & Fire Clearance', amount: 28000 },
      { id: 'pre-3', name: 'Feasibility Research & Market Survey', amount: 20000 },
      { id: 'pre-4', name: 'Staff Barista Training & Recipe Formulation', amount: 35000 },
      { id: 'pre-5', name: 'Initial Marketing & Grand Opening Launch', amount: 45000 },
      { id: 'pre-6', name: 'Lease Security Deposit (3 Months)', amount: 90000 },
    ],

    fixedAssets: [
      { id: 'fa-1', name: 'Commercial 2-Group Espresso Machine & Grinders', cost: 320000, usefulLifeYears: 5, salvageValue: 32000, depreciationMethod: 'Straight-Line' },
      { id: 'fa-2', name: 'Baking Ovens, Refrigeration & Freezers', cost: 240000, usefulLifeYears: 5, salvageValue: 24000, depreciationMethod: 'Straight-Line' },
      { id: 'fa-3', name: 'Cafe Dining Tables, Chairs & Bar Counter', cost: 180000, usefulLifeYears: 5, salvageValue: 18000, depreciationMethod: 'Straight-Line' },
      { id: 'fa-4', name: 'Leasehold Architectural Improvements & Lighting', cost: 280000, usefulLifeYears: 5, salvageValue: 0, depreciationMethod: 'Straight-Line' },
      { id: 'fa-5', name: 'POS Hardware, Sound System & Security Cameras', cost: 85000, usefulLifeYears: 4, salvageValue: 8500, depreciationMethod: 'Straight-Line' },
    ],

    initialWorkingCapitalBuffer: 250000,
    workingCapitalBufferDetails: {
      cashOnHand: 50000,
      cashInBank: 200000,
      bankName: 'BDO Unibank, Inc.',
      bankInterestRatePercent: 1.25,
    },

    financing: {
      equityContribution: 1103000,
      bankLoanAmount: 450000,
      annualInterestRate: 8.5,
      loanTermYears: 5,
    },

    products: [
      {
        id: 'p-1',
        name: 'Specialty Espresso Beverages (16oz)',
        unitPrice: 160,
        year1Volume: 22000,
        annualGrowthRate: 10,
        unitCost: 48,
        costBreakdown: [
          {
            id: 'cb-1-1',
            category: 'Raw Materials & Ingredients',
            name: 'Arabica Specialty Coffee Beans (1kg Bag)',
            costMode: 'package_yield',
            purchaseCost: 850,
            packageUnit: 'bag',
            packageQuantity: 1,
            yieldUnits: 50,
            quantity: 0.02,
            unit: 'bag',
            unitCost: 850,
            totalCost: 17.0,
          },
          {
            id: 'cb-1-2',
            category: 'Raw Materials & Ingredients',
            name: 'Barista Oat Milk (1L Carton / Box)',
            costMode: 'package_yield',
            purchaseCost: 120,
            packageUnit: 'box',
            packageQuantity: 1,
            yieldUnits: 10,
            quantity: 0.1,
            unit: 'box',
            unitCost: 120,
            totalCost: 12.0,
          },
          {
            id: 'cb-1-3',
            category: 'Packaging & Containers',
            name: 'PLA-Lined Hot Cup, Sip Lid & Insulated Sleeve (Sleeve of 50)',
            costMode: 'package_yield',
            purchaseCost: 375,
            packageUnit: 'sleeve',
            packageQuantity: 1,
            yieldUnits: 50,
            quantity: 0.02,
            unit: 'sleeve',
            unitCost: 375,
            totalCost: 7.5,
          },
          {
            id: 'cb-1-4',
            category: 'Direct Consumables & Supplies',
            name: 'Artisan Flavored Syrups & Specialty Sweetener (Bottle of 50 Servings)',
            costMode: 'package_yield',
            purchaseCost: 325,
            packageUnit: 'bottle',
            packageQuantity: 1,
            yieldUnits: 50,
            quantity: 0.02,
            unit: 'bottle',
            unitCost: 325,
            totalCost: 6.5,
          },
          {
            id: 'cb-1-5',
            category: 'Packaging & Containers',
            name: 'Biodegradable Straw, Stirrer & Paper Napkin (Pack of 100)',
            costMode: 'package_yield',
            purchaseCost: 500,
            packageUnit: 'pack',
            packageQuantity: 1,
            yieldUnits: 100,
            quantity: 0.01,
            unit: 'pack',
            unitCost: 500,
            totalCost: 5.0,
          },
        ],
      },
      {
        id: 'p-2',
        name: 'Cold Brew & Nitro Teas (16oz)',
        unitPrice: 175,
        year1Volume: 14000,
        annualGrowthRate: 12,
        unitCost: 45,
        costBreakdown: [
          { id: 'cb-2-1', category: 'Raw Materials & Ingredients', name: 'Single-Origin Steeped Grounds / Tea Leaf Blend', quantity: 1, unit: 'dose', unitCost: 18, totalCost: 18 },
          { id: 'cb-2-2', category: 'Raw Materials & Ingredients', name: 'Nitrogen Micro-Infusion & Fruit Extracts', quantity: 1, unit: 'serving', unitCost: 9, totalCost: 9 },
          { id: 'cb-2-3', category: 'Packaging & Containers', name: 'Custom Embossed Cold Cup, Dome Lid & Label', quantity: 1, unit: 'set', unitCost: 11.5, totalCost: 11.5 },
          { id: 'cb-2-4', category: 'Direct Consumables & Supplies', name: 'Filtered Mineral Ice & Compostable Straw', quantity: 1, unit: 'set', unitCost: 6.5, totalCost: 6.5 },
        ],
      },
      {
        id: 'p-3',
        name: 'Artisan Pastries & Croissants',
        unitPrice: 130,
        year1Volume: 18000,
        annualGrowthRate: 8,
        unitCost: 38,
        costBreakdown: [
          { id: 'cb-3-1', category: 'Raw Materials & Ingredients', name: 'French High-Fat Butter & Unbleached Flour', quantity: 1, unit: 'portion', unitCost: 18.5, totalCost: 18.5 },
          { id: 'cb-3-2', category: 'Raw Materials & Ingredients', name: 'Chocolate Batons / Fruit Fillings & Fresh Eggs', quantity: 1, unit: 'portion', unitCost: 11, totalCost: 11 },
          { id: 'cb-3-3', category: 'Packaging & Containers', name: 'Glassine Lined Bakery Bag & Seal Sticker', quantity: 1, unit: 'set', unitCost: 8.5, totalCost: 8.5 },
        ],
      },
      {
        id: 'p-4',
        name: 'Savory Brunch Bowls & Sandwiches',
        unitPrice: 220,
        year1Volume: 9500,
        annualGrowthRate: 10,
        unitCost: 75,
        costBreakdown: [
          { id: 'cb-4-1', category: 'Raw Materials & Ingredients', name: 'Premium Protein / Smoked Meats / Eggs', quantity: 1, unit: 'portion', unitCost: 38, totalCost: 38 },
          { id: 'cb-4-2', category: 'Raw Materials & Ingredients', name: 'Artisan Sourdough / Multigrain Base', quantity: 1, unit: 'portion', unitCost: 16, totalCost: 16 },
          { id: 'cb-4-3', category: 'Raw Materials & Ingredients', name: 'Organic Greens, Microgreens & Dressings', quantity: 1, unit: 'portion', unitCost: 11, totalCost: 11 },
          { id: 'cb-4-4', category: 'Packaging & Containers', name: 'Kraft Takeout Bowl, Lid & Compostable Cutlery', quantity: 1, unit: 'set', unitCost: 10, totalCost: 10 },
        ],
      },
    ],

    directLabor: [
      { id: 'dl-1', role: 'Head Barista & Roaster', headcount: 1, monthlyWage: 22000, monthsPerYear: 13 },
      { id: 'dl-2', role: 'Assistant Baristas / Service Crew', headcount: 3, monthlyWage: 16000, monthsPerYear: 13 },
      { id: 'dl-3', role: 'Pastry Baker', headcount: 1, monthlyWage: 20000, monthsPerYear: 13 },
    ],

    factoryOverheadAnnual: 120000,
    factoryOverheadGrowthRate: 4,

    operatingExpenses: [
      { id: 'opex-1', category: 'Administrative', name: 'General Manager / Bookkeeper Allowance', annualAmountYear1: 300000, annualGrowthRate: 5 },
      { id: 'opex-2', category: 'Utilities & Rent', name: 'Commercial Store Rental', annualAmountYear1: 360000, annualGrowthRate: 5 },
      { id: 'opex-3', category: 'Utilities & Rent', name: 'Electricity, Water & Fiber Internet', annualAmountYear1: 180000, annualGrowthRate: 4 },
      { id: 'opex-4', category: 'Selling & Marketing', name: 'Social Media Ads & Influencer Promotions', annualAmountYear1: 96000, annualGrowthRate: 5 },
      { id: 'opex-5', category: 'Administrative', name: 'Accounting, Audit & Annual Legal Retainers', annualAmountYear1: 48000, annualGrowthRate: 3 },
      { id: 'opex-6', category: 'Other OPEX', name: 'Store Supplies, Cleaning & Waste Management', annualAmountYear1: 60000, annualGrowthRate: 4 },
      { id: 'opex-7', category: 'Other OPEX', name: 'Annual Local Tax & Sanitary Permit Renewals', annualAmountYear1: 30000, annualGrowthRate: 3 },
    ],

    salesDiscountsPercent: 2.0,

    workingCapital: {
      accountsReceivablePercentOfSales: 2.0, // High cash/card ratio for cafe
      inventoryPercentOfCOGS: 8.0,
      accountsPayablePercentOfPurchases: 6.0,
      minimumCashBalance: 100000,
    },

    academicNotes:
      'Depreciation is computed using the Straight-Line Method over the estimated useful life of 5 years with a 10% scrap value on equipment. Income tax is calculated at a statutory rate of 25% under the Corporate Recovery and Tax Incentives Act. Free cash flows are discounted at 12% representing the weighted average cost of capital (WACC).',
  },
  {
    id: 'eco-packaging',
    title: 'VerdeKraft Biodegradable Cassava Packaging Facility',
    proponents: 'A. Ramirez, K. Lee, C. Gomez (BS Industrial Engineering & Accountancy)',
    academicProgram: 'BS Industrial Engineering / Management Accounting',
    institution: 'Technological University Institute',
    academicYear: 'A.Y. 2026–2027',
    currency: '$',
    taxRatePercent: 21,
    discountRatePercent: 10,
    inflationRatePercent: 3.5,
    dividendPayoutPercent: 25,

    preOperatingExpenses: [
      { id: 'pre-1', name: 'Environmental Compliance Certificate & Permitting', amount: 12000 },
      { id: 'pre-2', name: 'Pilot Testing & Materials Certification', amount: 9500 },
      { id: 'pre-3', name: 'Facility Lease Deposit & Site Survey', amount: 18000 },
      { id: 'pre-4', name: 'Machine Operator Safety & ISO Training', amount: 6500 },
    ],

    fixedAssets: [
      { id: 'fa-1', name: 'Bio-Polymer Extrusion Line Machine', cost: 85000, usefulLifeYears: 5, salvageValue: 8500, depreciationMethod: 'Straight-Line' },
      { id: 'fa-2', name: 'Thermoforming & High-Speed Die Cutters', cost: 42000, usefulLifeYears: 5, salvageValue: 4200, depreciationMethod: 'Straight-Line' },
      { id: 'fa-3', name: 'Industrial Warehouse Racking & Forklift', cost: 24000, usefulLifeYears: 5, salvageValue: 2400, depreciationMethod: 'Straight-Line' },
      { id: 'fa-4', name: 'Power Backup Generator & Electrical Subpanel', cost: 18000, usefulLifeYears: 5, salvageValue: 1800, depreciationMethod: 'Straight-Line' },
    ],

    initialWorkingCapitalBuffer: 50000,
    workingCapitalBufferDetails: {
      cashOnHand: 15000,
      cashInBank: 35000,
      bankName: 'Metropolitan Bank & Trust Company (Metrobank)',
      bankInterestRatePercent: 1.0,
    },

    financing: {
      equityContribution: 175000,
      bankLoanAmount: 90000,
      annualInterestRate: 7.0,
      loanTermYears: 5,
    },

    products: [
      {
        id: 'p-1',
        name: 'Cassava Bio-Takeout Containers (Pack of 100)',
        unitPrice: 28,
        year1Volume: 9000,
        annualGrowthRate: 15,
        unitCost: 11,
        costBreakdown: [
          { id: 'cb-21-1', category: 'Raw Materials & Ingredients', name: 'Cassava Starch Polymer Resin Pellets (1.8kg)', quantity: 1.8, unit: 'kg', unitCost: 3.5, totalCost: 6.3 },
          { id: 'cb-21-2', category: 'Raw Materials & Ingredients', name: 'Food-Grade Bio Coating & Additives', quantity: 1, unit: 'batch', unitCost: 1.5, totalCost: 1.5 },
          { id: 'cb-21-3', category: 'Packaging & Containers', name: 'Recycled Kraft Outer Sleeve & Bundle Banding', quantity: 1, unit: 'pack', unitCost: 1.7, totalCost: 1.7 },
          { id: 'cb-21-4', category: 'Direct Overhead & Freight', name: 'Direct Thermoforming Energy & Mold Consumables', quantity: 1, unit: 'lot', unitCost: 1.5, totalCost: 1.5 },
        ],
      },
      {
        id: 'p-2',
        name: 'Bio-Foil Shopping Bags (Carton of 500)',
        unitPrice: 45,
        year1Volume: 6500,
        annualGrowthRate: 18,
        unitCost: 18,
        costBreakdown: [
          { id: 'cb-22-1', category: 'Raw Materials & Ingredients', name: 'Cornstarch & PBAT Bio-Compound (4.2kg)', quantity: 4.2, unit: 'kg', unitCost: 2.5, totalCost: 10.5 },
          { id: 'cb-22-2', category: 'Direct Consumables & Supplies', name: 'Soy-Based Flexographic Printing Ink', quantity: 1, unit: 'set', unitCost: 2.5, totalCost: 2.5 },
          { id: 'cb-22-3', category: 'Packaging & Containers', name: 'Corrugated Shipping Box & Moisture Liner', quantity: 1, unit: 'box', unitCost: 2.2, totalCost: 2.2 },
          { id: 'cb-22-4', category: 'Direct Overhead & Freight', name: 'Extrusion Line Power & Heat Seal Consumables', quantity: 1, unit: 'batch', unitCost: 2.8, totalCost: 2.8 },
        ],
      },
      {
        id: 'p-3',
        name: 'Industrial Compostable Pallet Wrap (Roll)',
        unitPrice: 38,
        year1Volume: 4000,
        annualGrowthRate: 20,
        unitCost: 15,
        costBreakdown: [
          { id: 'cb-23-1', category: 'Raw Materials & Ingredients', name: 'Cast Film Biodegradable Copolymer (3.5kg)', quantity: 3.5, unit: 'kg', unitCost: 2.7, totalCost: 9.45 },
          { id: 'cb-23-2', category: 'Packaging & Containers', name: 'Heavy-Duty Recycled Kraft Paper Core Spool', quantity: 1, unit: 'pc', unitCost: 2.05, totalCost: 2.05 },
          { id: 'cb-23-3', category: 'Packaging & Containers', name: 'Protective End Caps & Shrink Poly Sleeve', quantity: 1, unit: 'set', unitCost: 1.5, totalCost: 1.5 },
          { id: 'cb-23-4', category: 'Direct Overhead & Freight', name: 'High-Tension Slitting & Winding Energy', quantity: 1, unit: 'roll', unitCost: 2.0, totalCost: 2.0 },
        ],
      },
    ],

    directLabor: [
      { id: 'dl-1', role: 'Extrusion Plant Technicians', headcount: 3, monthlyWage: 2800, monthsPerYear: 12 },
      { id: 'dl-2', role: 'Die-Cutter & Quality Control Team', headcount: 2, monthlyWage: 2400, monthsPerYear: 12 },
    ],

    factoryOverheadAnnual: 22000,
    factoryOverheadGrowthRate: 3.5,

    operatingExpenses: [
      { id: 'opex-1', category: 'Administrative', name: 'Plant Operations & Accounting Manager', annualAmountYear1: 45000, annualGrowthRate: 4 },
      { id: 'opex-2', category: 'Utilities & Rent', name: 'Industrial Warehouse Rent', annualAmountYear1: 36000, annualGrowthRate: 3 },
      { id: 'opex-3', category: 'Utilities & Rent', name: 'Industrial Three-Phase Electricity & Water', annualAmountYear1: 28000, annualGrowthRate: 4 },
      { id: 'opex-4', category: 'Selling & Marketing', name: 'B2B Trade Exhibitions & Sales Rep Commissions', annualAmountYear1: 18000, annualGrowthRate: 6 },
      { id: 'opex-5', category: 'Other OPEX', name: 'Plant Insurance & Environmental Audits', annualAmountYear1: 9000, annualGrowthRate: 3 },
    ],

    salesDiscountsPercent: 3.0,

    workingCapital: {
      accountsReceivablePercentOfSales: 12.0, // Commercial B2B net 30 terms
      inventoryPercentOfCOGS: 10.0,
      accountsPayablePercentOfPurchases: 10.0,
      minimumCashBalance: 25000,
    },

    academicNotes:
      'The manufacturing feasibility study assumes an operational capacity of 65% in Year 1 scaling to 90% by Year 5. All biological raw materials are locally sourced. Valuation utilizes discounted cash flows with 10% cost of capital reflecting green bond financing benefits.',
  },
];
