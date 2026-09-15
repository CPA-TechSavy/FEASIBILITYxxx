import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FeasibilityProject,
  PreOperatingExpenseItem,
  FixedAssetItem,
  ProductItem,
  ProductCostComponent,
  DirectLaborItem,
  IndirectLaborItem,
  ProductionUtilityItem,
  NonManufacturingLaborItem,
  OperatingExpenseItem,
  DepreciationMethod,
  FactorySupplyItem,
  LaborBenefitItem,
  BenefitCalculationType,
  BenefitAppliesTo,
} from '../types';
import {
  Plus,
  Trash2,
  Coins,
  Package,
  Users,
  Briefcase,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Wallet,
  Building,
  Calculator,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  PieChart,
  Tag,
  AlertCircle,
  Layers,
  Box,
  Sparkles,
  Factory,
  Zap,
  UserCheck,
  Boxes,
  ShieldCheck,
  CheckSquare,
  Square,
  PackageCheck,
  HeartHandshake,
  Info,
  X,
} from 'lucide-react';
import { formatCurrency, calculateDepreciation } from '../utils/financialCalculations';
import { LOCAL_BANKS, DEPRECIATION_METHODS } from '../data/bankList';
import { SAMPLE_BOM_PRESETS } from '../data/bomPresets';
import ProductCostingTab from './ProductCostingTab';

interface AssumptionsEditorProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  onOpenBankModal?: () => void;
}

type TabKey =
  | 'capital'
  | 'sales'
  | 'costing'
  | 'directCosts'
  | 'factoryOverhead'
  | 'nonManufacturing'
  | 'opex'
  | 'workingCapital';

export default function AssumptionsEditor({
  project,
  onUpdateProject,
  onOpenBankModal,
}: AssumptionsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('capital');
  const [isExpanded, setIsExpanded] = useState(true);

  // Tab scrolling support
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabScroll = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkTabScroll();
    const el = tabScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkTabScroll, { passive: true });
    window.addEventListener('resize', checkTabScroll);
    return () => {
      el.removeEventListener('scroll', checkTabScroll);
      window.removeEventListener('resize', checkTabScroll);
    };
  }, [checkTabScroll]);

  // Auto-scroll active tab into view whenever activeTab changes or section is expanded
  useEffect(() => {
    if (!isExpanded || !tabScrollRef.current) return;
    const el = tabScrollRef.current;
    const activeBtn = el.querySelector<HTMLElement>(`[data-tab-key="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setTimeout(checkTabScroll, 350);
    }
  }, [activeTab, isExpanded, checkTabScroll]);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (!tabScrollRef.current) return;
    const el = tabScrollRef.current;
    const scrollDistance = Math.max(220, el.clientWidth * 0.6);
    el.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    });
    setTimeout(checkTabScroll, 350);
  };

  const handleTabWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = tabScrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
      checkTabScroll();
    }
  };

  const TAB_ITEMS: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'capital', label: '1. Capital Outlay & Debt', icon: Coins },
    { key: 'sales', label: '2. Products & Sales Volume', icon: Package },
    { key: 'costing', label: '3. Direct Materials Costing', icon: Calculator },
    { key: 'directCosts', label: '4. Direct Labor', icon: Users },
    { key: 'factoryOverhead', label: '5. Factory Overhead', icon: Factory },
    { key: 'nonManufacturing', label: '6. Non-Manufacturing', icon: UserCheck },
    { key: 'opex', label: '7. Operating Expenses (SG&A)', icon: Briefcase },
    { key: 'workingCapital', label: '8. Working Capital Policy', icon: Layers },
  ];

  const c = project.currency;

  // --- Helpers for updating state collections ---
  const updatePreOp = (newItems: PreOperatingExpenseItem[]) => {
    onUpdateProject({ ...project, preOperatingExpenses: newItems });
  };

  const updateFixedAssets = (newItems: FixedAssetItem[]) => {
    onUpdateProject({ ...project, fixedAssets: newItems });
  };

  const updateProducts = (newItems: ProductItem[]) => {
    onUpdateProject({ ...project, products: newItems });
  };

  const updateDirectLabor = (newItems: DirectLaborItem[]) => {
    onUpdateProject({ ...project, directLabor: newItems });
  };

  const updateIndirectLabor = (newItems: IndirectLaborItem[]) => {
    onUpdateProject({ ...project, indirectLabor: newItems });
  };

  const updateProductionUtilities = (newItems: ProductionUtilityItem[]) => {
    onUpdateProject({ ...project, productionUtilities: newItems });
  };

  const updateNonManufacturingLabor = (newItems: NonManufacturingLaborItem[]) => {
    onUpdateProject({ ...project, nonManufacturingLabor: newItems });
  };

  const updateFactoryDepreciationPercent = (pct: number) => {
    onUpdateProject({ ...project, factoryDepreciationPercent: Math.max(0, Math.min(100, pct)) });
  };

  const updateFactoryDepreciationMethod = (method: 'percentage' | 'specific_assets') => {
    onUpdateProject({ ...project, factoryDepreciationMethod: method });
  };

  const toggleFactoryAsset = (assetId: string) => {
    const current = project.factoryAssetIds || [];
    const updated = current.includes(assetId)
      ? current.filter((id) => id !== assetId)
      : [...current, assetId];
    onUpdateProject({ ...project, factoryAssetIds: updated });
  };

  const selectAllFactoryAssets = (select: boolean) => {
    onUpdateProject({
      ...project,
      factoryAssetIds: select ? project.fixedAssets.map((a) => a.id) : [],
    });
  };

  const updateFactorySupplies = (newSupplies: FactorySupplyItem[]) => {
    onUpdateProject({ ...project, factorySupplies: newSupplies });
  };

  const updateProductionLaborBenefits = (newBenefits: LaborBenefitItem[]) => {
    onUpdateProject({ ...project, productionLaborBenefits: newBenefits });
  };

  const toggleIncludeLaborBenefitsInCOGS = (include: boolean) => {
    onUpdateProject({ ...project, includeLaborBenefitsInCOGS: include });
  };

  const [showSuppliesModal, setShowSuppliesModal] = useState<boolean>(false);
  const [suppliesSyncFeedback, setSuppliesSyncFeedback] = useState<string | null>(null);
  const [benefitsFeedback, setBenefitsFeedback] = useState<string | null>(null);
  const [benefitsEmployeeFilter, setBenefitsEmployeeFilter] = useState<'factory_overhead' | 'direct_labor' | 'all'>('factory_overhead');
  const [showBenefitPolicyDetails, setShowBenefitPolicyDetails] = useState<boolean>(false);

  const addIndirectLaborRoleFromBenefits = () => {
    const newRole: IndirectLaborItem = {
      id: `idl-${Date.now()}`,
      role: 'Production Quality / Safety Inspector',
      headcount: 1,
      monthlyWage: 20000,
      monthsPerYear: 12,
    };
    updateIndirectLabor([...(project.indirectLabor || []), newRole]);
    setBenefitsFeedback('Added new Factory Overhead role.');
    setTimeout(() => setBenefitsFeedback(null), 3000);
  };

  const addDirectLaborRoleFromBenefits = () => {
    const newRole: DirectLaborItem = {
      id: `dl-${Date.now()}`,
      role: 'Line Operator / Worker',
      headcount: 1,
      monthlyWage: 17000,
      monthsPerYear: 12,
    };
    updateDirectLabor([...(project.directLabor || []), newRole]);
    setBenefitsFeedback('Added new Direct Labor role.');
    setTimeout(() => setBenefitsFeedback(null), 3000);
  };

  const loadStandardFactoryRoles = () => {
    const defaultRoles: IndirectLaborItem[] = [
      {
        id: `idl-${Date.now()}-1`,
        role: 'Plant / Production Supervisor',
        headcount: 1,
        monthlyWage: 28000,
        monthsPerYear: 12,
      },
      {
        id: `idl-${Date.now()}-2`,
        role: 'Quality Assurance / QC Inspector',
        headcount: 1,
        monthlyWage: 20000,
        monthsPerYear: 12,
      },
      {
        id: `idl-${Date.now()}-3`,
        role: 'Machine Maintenance Technician',
        headcount: 1,
        monthlyWage: 19000,
        monthsPerYear: 12,
      },
      {
        id: `idl-${Date.now()}-4`,
        role: 'Factory Sanitation & Utility Worker',
        headcount: 1,
        monthlyWage: 16000,
        monthsPerYear: 12,
      },
    ];
    updateIndirectLabor([...(project.indirectLabor || []), ...defaultRoles]);
    setBenefitsFeedback('Loaded standard Factory Overhead personnel roles!');
    setTimeout(() => setBenefitsFeedback(null), 3500);
  };

  const loadStandardLaborBenefitsPresets = () => {
    const presets: LaborBenefitItem[] = [
      {
        id: `ben-${Date.now()}-1`,
        name: 'SSS (Social Security System) - Employer Share',
        type: 'percentage',
        rateOrAmount: 9.5,
        appliesTo: 'both',
        notes: 'Statutory employer contribution (~9.5% of basic monthly salary)',
      },
      {
        id: `ben-${Date.now()}-2`,
        name: 'PhilHealth - Employer Share',
        type: 'percentage',
        rateOrAmount: 2.5,
        appliesTo: 'both',
        notes: '50% employer share of mandatory PhilHealth premium',
      },
      {
        id: `ben-${Date.now()}-3`,
        name: 'Pag-IBIG / HDMF - Employer Contribution',
        type: 'fixed_monthly_per_head',
        rateOrAmount: 200,
        appliesTo: 'both',
        notes: 'Mandatory standard employer contribution (₱200/month per employee)',
      },
      {
        id: `ben-${Date.now()}-4`,
        name: '13th Month Pay',
        type: 'percentage',
        rateOrAmount: 8.33,
        appliesTo: 'both',
        notes: 'Statutory 1/12th of annual basic pay (1 month basic salary)',
      },
      {
        id: `ben-${Date.now()}-5`,
        name: 'Other Benefits (Uniform, PPE & Welfare)',
        type: 'fixed_monthly_per_head',
        rateOrAmount: 250,
        appliesTo: 'both',
        notes: 'Protective gear, plant uniform allowance, safety attendance bonus',
      },
    ];
    updateProductionLaborBenefits(presets);
    setBenefitsFeedback('Loaded standard Philippine statutory benefits preset!');
    setTimeout(() => setBenefitsFeedback(null), 3500);
  };

  const adjustDirectLaborTo12Months = () => {
    const updated = project.directLabor.map((l) => ({
      ...l,
      monthsPerYear: 12,
    }));
    updateDirectLabor(updated);
    setBenefitsFeedback('Adjusted Tab 4 Direct Labor to 12 months/year to avoid 13th month duplication.');
    setTimeout(() => setBenefitsFeedback(null), 4000);
  };

  const updateOpex = (newItems: OperatingExpenseItem[]) => {
    onUpdateProject({ ...project, operatingExpenses: newItems });
  };

  // --- Product Cost Per Unit (Raw Materials & Packaging) State & Helpers ---
  const [selectedCostProductId, setSelectedCostProductId] = useState<string>('');
  const [autoSyncCost, setAutoSyncCost] = useState<boolean>(true);
  const [costFeedback, setCostFeedback] = useState<string | null>(null);

  // Active product for materials & packaging breakdown
  const activeCostProduct =
    project.products.find((p) => p.id === selectedCostProductId) ||
    project.products[0] ||
    null;

  // Helper to compute individual material cost
  const computeItemTotalCost = (item: Partial<ProductCostComponent>): number => {
    if (item.costMode === 'package_yield') {
      const pCost = Math.max(0, Number(item.purchaseCost) || 0);
      const pQty = Math.max(0.0001, Number(item.packageQuantity) || 1);
      const yUnits = Math.max(0.0001, Number(item.yieldUnits) || 1);
      return Math.round(((pCost * pQty) / yUnits) * 100) / 100;
    } else {
      const q = Math.max(0, Number(item.quantity) || 0);
      const u = Math.max(0, Number(item.unitCost) || 0);
      return Math.round(q * u * 100) / 100;
    }
  };

  // Update components for a product and optionally sync to unitCost
  const updateProductCostBreakdown = (
    productId: string,
    components: ProductCostComponent[],
    shouldSync: boolean = autoSyncCost
  ) => {
    const normalizedComps = components.map((c) => ({
      ...c,
      totalCost: computeItemTotalCost(c),
    }));

    const materialsAndPackagingTotal = Math.round(
      normalizedComps.reduce((s, c) => s + (c.totalCost || 0), 0) * 100
    ) / 100;

    const updatedProducts = project.products.map((p) => {
      if (p.id !== productId) return p;

      if (shouldSync) {
        const dl = p.directLaborCostPerUnit || 0;
        const combinedUnitCost = Math.round((materialsAndPackagingTotal + dl) * 100) / 100;
        return {
          ...p,
          costBreakdown: normalizedComps,
          rawMaterialsCostPerUnit: materialsAndPackagingTotal,
          unitCost: combinedUnitCost,
        };
      }

      return {
        ...p,
        costBreakdown: normalizedComps,
        rawMaterialsCostPerUnit: materialsAndPackagingTotal,
      };
    });

    updateProducts(updatedProducts);
  };

  // Apply Direct Materials & Packaging to product unit cost
  const applyMaterialsAndPackagingToUnitCost = (productId: string) => {
    const prod = project.products.find((p) => p.id === productId);
    if (!prod) return;
    const comps = prod.costBreakdown || [];
    const matTotal = Math.round(comps.reduce((s, c) => s + (c.totalCost || 0), 0) * 100) / 100;
    const dl = prod.directLaborCostPerUnit || 0;
    const combined = Math.round((matTotal + dl) * 100) / 100;

    const updatedProducts = project.products.map((p) => {
      if (p.id !== productId) return p;
      return {
        ...p,
        rawMaterialsCostPerUnit: matTotal,
        unitCost: combined,
      };
    });
    updateProducts(updatedProducts);
    setCostFeedback(
      `Updated ${prod.name || 'product'} cost to ${formatCurrency(combined, c)} (Materials & Pkg: ${formatCurrency(matTotal, c)}${dl > 0 ? ` + DL: ${formatCurrency(dl, c)}` : ''})`
    );
    setTimeout(() => setCostFeedback(null), 3500);
  };

  // Load a preset template into active product
  const loadPresetForProduct = (productId: string, presetKey: 'cafe' | 'food' | 'retail') => {
    const preset = SAMPLE_BOM_PRESETS[presetKey];
    if (!preset) return;
    updateProductCostBreakdown(productId, preset.components, true);
    setCostFeedback(`Loaded ${preset.label} preset!`);
    setTimeout(() => setCostFeedback(null), 3500);
  };

  // --- Direct Labor Cost per Unit Allocation & Helpers ---
  const [appliedDlFeedback, setAppliedDlFeedback] = useState<string | null>(null);

  // Total Direct Labor Headcount & Annual Cost
  const totalDirectLaborAnnual = project.directLabor.reduce(
    (sum, lab) => sum + (lab.monthlyWage || 0) * (lab.monthsPerYear || 12) * (lab.headcount || 1),
    0
  );
  const totalDirectLaborHeadcount = project.directLabor.reduce(
    (sum, lab) => sum + (lab.headcount || 0),
    0
  );

  // Total Indirect Labor Headcount & Annual Cost
  const totalIndirectLaborAnnual = (project.indirectLabor || []).reduce(
    (sum, lab) => sum + (lab.monthlyWage || 0) * (lab.monthsPerYear || 12) * (lab.headcount || 1),
    0
  );
  const totalIndirectLaborHeadcount = (project.indirectLabor || []).reduce(
    (sum, lab) => sum + (lab.headcount || 0),
    0
  );

  // Total Production Utilities Annual (Year 1)
  const totalProductionUtilitiesAnnual = (project.productionUtilities || []).reduce(
    (sum, util) => sum + (util.annualAmountYear1 || 0),
    0
  );

  // Depreciation Schedule & Production Depreciation
  const deprSchedule = calculateDepreciation(project);
  const totalYear1Depreciation = deprSchedule.reduce((sum, d) => {
    const yr1 = d.yearValues.find((y) => y.year === 1);
    return sum + (yr1 ? yr1.depreciation : d.annualDepreciation || 0);
  }, 0);
  const factoryDeprPercent = project.factoryDepreciationPercent !== undefined ? project.factoryDepreciationPercent : 50;
  const factoryDeprMethod = project.factoryDepreciationMethod || 'percentage';
  const factoryAssetIds = project.factoryAssetIds || [];

  let factoryDepreciationAmountYr1 = 0;
  let opexDepreciationAmountYr1 = 0;

  if (factoryDeprMethod === 'specific_assets') {
    deprSchedule.forEach((d) => {
      const yr1 = d.yearValues.find((y) => y.year === 1);
      const dep = yr1 ? yr1.depreciation : d.annualDepreciation || 0;
      if (factoryAssetIds.includes(d.assetId)) {
        factoryDepreciationAmountYr1 += dep;
      } else {
        opexDepreciationAmountYr1 += dep;
      }
    });
  } else {
    factoryDepreciationAmountYr1 = Math.round(totalYear1Depreciation * (factoryDeprPercent / 100));
    opexDepreciationAmountYr1 = Math.max(0, totalYear1Depreciation - factoryDepreciationAmountYr1);
  }

  // Direct & Indirect Labor Basic Pay Bases (12-month base for standard benefits calculation)
  const directLaborMonthlyWageTotal = project.directLabor.reduce(
    (sum, l) => sum + (l.monthlyWage || 0) * (l.headcount || 0),
    0
  );
  const directLaborAnnualBasic12M = directLaborMonthlyWageTotal * 12;

  const indirectLaborMonthlyWageTotal = (project.indirectLabor || []).reduce(
    (sum, l) => sum + (l.monthlyWage || 0) * (l.headcount || 0),
    0
  );
  const indirectLaborAnnualBasic12M = indirectLaborMonthlyWageTotal * 12;

  const directLaborHeadcount = totalDirectLaborHeadcount;
  const indirectLaborHeadcount = totalIndirectLaborHeadcount;

  // Benefits Calculation
  const laborBenefitsList = project.productionLaborBenefits || [];
  let totalDirectBenefitsAnnual = 0;
  let totalIndirectBenefitsAnnual = 0;

  laborBenefitsList.forEach((b) => {
    const appliesDirect = b.appliesTo === 'both' || b.appliesTo === 'direct_only';
    const appliesIndirect = b.appliesTo === 'both' || b.appliesTo === 'indirect_only';

    if (b.type === 'percentage') {
      const rate = (b.rateOrAmount || 0) / 100;
      if (appliesDirect) totalDirectBenefitsAnnual += directLaborAnnualBasic12M * rate;
      if (appliesIndirect) totalIndirectBenefitsAnnual += indirectLaborAnnualBasic12M * rate;
    } else if (b.type === 'fixed_monthly_per_head') {
      const monthly = b.rateOrAmount || 0;
      if (appliesDirect) totalDirectBenefitsAnnual += monthly * 12 * totalDirectLaborHeadcount;
      if (appliesIndirect) totalIndirectBenefitsAnnual += monthly * 12 * totalIndirectLaborHeadcount;
    } else if (b.type === 'fixed_annual') {
      const annualAmt = b.rateOrAmount || 0;
      const totalHead = (appliesDirect ? totalDirectLaborHeadcount : 0) + (appliesIndirect ? totalIndirectLaborHeadcount : 0);
      if (totalHead > 0) {
        if (appliesDirect && appliesIndirect) {
          totalDirectBenefitsAnnual += annualAmt * (totalDirectLaborHeadcount / totalHead);
          totalIndirectBenefitsAnnual += annualAmt * (totalIndirectLaborHeadcount / totalHead);
        } else if (appliesDirect) {
          totalDirectBenefitsAnnual += annualAmt;
        } else if (appliesIndirect) {
          totalIndirectBenefitsAnnual += annualAmt;
        }
      }
    }
  });

  const totalProductionLaborBenefitsAnnual = totalDirectBenefitsAnnual + totalIndirectBenefitsAnnual;
  const includeBenefitsInCOGS = project.includeLaborBenefitsInCOGS !== false;

  // Extraction of statutory benefit contribution policies for employee-level schedule
  const sssBenefitItem = laborBenefitsList.find(
    (b) => b.name.toLowerCase().includes('sss') || b.name.toLowerCase().includes('social security')
  );
  const sssRate = sssBenefitItem && sssBenefitItem.type === 'percentage'
    ? (sssBenefitItem.rateOrAmount || 0) / 100
    : 0.095;

  const philHealthBenefitItem = laborBenefitsList.find(
    (b) => b.name.toLowerCase().includes('philhealth')
  );
  const philHealthRate = philHealthBenefitItem && philHealthBenefitItem.type === 'percentage'
    ? (philHealthBenefitItem.rateOrAmount || 0) / 100
    : 0.025;

  const pagIbigBenefitItem = laborBenefitsList.find(
    (b) => b.name.toLowerCase().includes('pag-ibig') || b.name.toLowerCase().includes('hdmf')
  );
  const pagIbigMonthlyAmount = pagIbigBenefitItem && pagIbigBenefitItem.type === 'fixed_monthly_per_head'
    ? (pagIbigBenefitItem.rateOrAmount || 0)
    : 200;

  const thirteenthMonthBenefitItem = laborBenefitsList.find(
    (b) => b.name.toLowerCase().includes('13th')
  );
  const thirteenthMonthRate = thirteenthMonthBenefitItem && thirteenthMonthBenefitItem.type === 'percentage'
    ? (thirteenthMonthBenefitItem.rateOrAmount || 0) / 100
    : 1 / 12;

  const otherCustomBenefits = laborBenefitsList.filter((b) => {
    const n = b.name.toLowerCase();
    return (
      !n.includes('sss') &&
      !n.includes('social security') &&
      !n.includes('philhealth') &&
      !n.includes('pag-ibig') &&
      !n.includes('hdmf') &&
      !n.includes('13th')
    );
  });

  // Itemized Supplies
  const factorySuppliesList = project.factorySupplies || [];
  const totalItemizedSuppliesAnnual = factorySuppliesList.reduce((sum, s) => {
    return sum + (s.annualAmount !== undefined ? s.annualAmount : ((s.quantity || 0) * (s.unitCost || 0)));
  }, 0);

  // Total Factory Overhead (Year 1)
  const totalFactoryOverheadYr1 =
    totalIndirectLaborAnnual +
    totalProductionUtilitiesAnnual +
    factoryDepreciationAmountYr1 +
    (project.factoryOverheadAnnual || 0) +
    (includeBenefitsInCOGS ? totalProductionLaborBenefitsAnnual : 0);

  // Non-Manufacturing Personnel Metrics
  const nonMfgEmployees = project.nonManufacturingLabor || [];
  const totalNonMfgHeadcount = nonMfgEmployees.reduce((sum, e) => sum + (e.headcount || 0), 0);
  const totalNonMfgAdminAnnual = nonMfgEmployees
    .filter((e) => e.category !== 'Selling & Marketing')
    .reduce((sum, e) => sum + (e.monthlyWage || 0) * (e.monthsPerYear || 12) * (e.headcount || 1), 0);
  const totalNonMfgSellingAnnual = nonMfgEmployees
    .filter((e) => e.category === 'Selling & Marketing')
    .reduce((sum, e) => sum + (e.monthlyWage || 0) * (e.monthsPerYear || 12) * (e.headcount || 1), 0);
  const totalNonMfgAnnual = totalNonMfgAdminAnnual + totalNonMfgSellingAnnual;

  // Total Year 1 Production Volume
  const totalYear1Volume = project.products.reduce((sum, p) => sum + (p.year1Volume || 0), 0);

  // Function to compute DL cost per unit for products
  const computeDLCostPerUnit = (_prod?: ProductItem): number => {
    if (totalYear1Volume <= 0 || totalDirectLaborAnnual <= 0) return 0;
    return Math.round((totalDirectLaborAnnual / totalYear1Volume) * 100) / 100;
  };

  // Apply Direct Labor to ALL products in one click
  const applyDlToAllProducts = () => {
    if (project.products.length === 0) return;
    const updated = project.products.map((p) => {
      const dlUnit = computeDLCostPerUnit(p);
      const baseRaw = p.rawMaterialsCostPerUnit !== undefined
        ? p.rawMaterialsCostPerUnit
        : p.directLaborCostPerUnit !== undefined
          ? Math.max(0, p.unitCost - p.directLaborCostPerUnit)
          : p.unitCost;
      return {
        ...p,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: dlUnit,
        unitCost: Math.round((baseRaw + dlUnit) * 100) / 100,
      };
    });
    updateProducts(updated);
    setAppliedDlFeedback('Successfully applied Direct Labor Cost per unit to all products in Product & Sales Volume!');
    setTimeout(() => setAppliedDlFeedback(null), 3500);
  };

  // Reset ALL products to base raw materials
  const resetAllProductsDl = () => {
    const updated = project.products.map((p) => {
      const baseRaw = p.rawMaterialsCostPerUnit !== undefined
        ? p.rawMaterialsCostPerUnit
        : p.directLaborCostPerUnit !== undefined
          ? Math.max(0, p.unitCost - p.directLaborCostPerUnit)
          : p.unitCost;
      return {
        ...p,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: 0,
        unitCost: baseRaw,
      };
    });
    updateProducts(updated);
    setAppliedDlFeedback('Reset all products to base raw materials costs.');
    setTimeout(() => setAppliedDlFeedback(null), 3500);
  };

  // Working Capital Buffer decomposition (Cash on Hand & Cash in Bank)
  const wcDetails = project.workingCapitalBufferDetails || {
    cashOnHand: Math.round((project.initialWorkingCapitalBuffer || 0) * 0.2),
    cashInBank: Math.round((project.initialWorkingCapitalBuffer || 0) * 0.8),
    bankName: '',
    bankInterestRatePercent: 1.0,
  };

  const updateWorkingCapitalBuffer = (
    newCashOnHand: number,
    newCashInBank: number,
    newBankName?: string,
    newRate?: number
  ) => {
    const safeCashOnHand = Math.max(0, newCashOnHand);
    const safeCashInBank = Math.max(0, newCashInBank);
    const total = safeCashOnHand + safeCashInBank;
    onUpdateProject({
      ...project,
      initialWorkingCapitalBuffer: total,
      workingCapitalBufferDetails: {
        cashOnHand: safeCashOnHand,
        cashInBank: safeCashInBank,
        bankName: newBankName !== undefined ? newBankName : wcDetails.bankName,
        bankInterestRatePercent:
          newRate !== undefined ? newRate : wcDetails.bankInterestRatePercent,
      },
    });
  };

  // Capital sums
  const totalPreOp = project.preOperatingExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedAssets = project.fixedAssets.reduce((sum, item) => sum + item.cost, 0);
  const totalOutlay = totalPreOp + totalFixedAssets + project.initialWorkingCapitalBuffer;

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Tab Header Bar */}
      <div className="bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Feasibility Study Operating Assumptions & Schedules
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
          >
            <span>{isExpanded ? 'Collapse Inputs' : 'Expand Inputs'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Sub Navigation Tabs with Smooth Scrolling Controls */}
          <div className="relative border-b border-slate-200 bg-slate-50/80 select-none overflow-hidden">
            {/* Left Scroll Navigation Button */}
            <div
              className={`absolute left-0 top-0 bottom-0 z-20 flex items-center pr-4 pl-1.5 bg-gradient-to-r from-slate-100 via-slate-100/95 to-transparent transition-all duration-200 ${
                canScrollLeft ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-2 pointer-events-none'
              }`}
            >
              <button
                type="button"
                onClick={() => handleScrollTabs('left')}
                aria-label="Scroll tabs left"
                className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition flex items-center justify-center cursor-pointer"
                title="Scroll tabs left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Tab Strip */}
            <div
              ref={tabScrollRef}
              onWheel={handleTabWheel}
              className="flex overflow-x-auto scroll-smooth px-3 sm:px-6 scrollbar-none gap-1 py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    data-tab-key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition shrink-0 rounded-t-lg cursor-pointer ${
                      isActive
                        ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs -mb-1'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Navigation Button */}
            <div
              className={`absolute right-0 top-0 bottom-0 z-20 flex items-center pl-4 pr-1.5 bg-gradient-to-l from-slate-100 via-slate-100/95 to-transparent transition-all duration-200 ${
                canScrollRight ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-2 pointer-events-none'
              }`}
            >
              <button
                type="button"
                onClick={() => handleScrollTabs('right')}
                aria-label="Scroll tabs right"
                className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition flex items-center justify-center cursor-pointer"
                title="Scroll tabs right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* TAB 1: CAPITAL OUTLAY & FINANCING */}
            {activeTab === 'capital' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pre-Operating Expenses Table */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Pre-Operating Expenses (Year 0)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Permits, feasibility research, licenses, and trial operations.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updatePreOp([
                            ...project.preOperatingExpenses,
                            { id: `pre-${Date.now()}`, name: 'New Pre-operating Item', amount: 15000 },
                          ])
                        }
                        className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {project.preOperatingExpenses.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const copy = [...project.preOperatingExpenses];
                              copy[idx].name = e.target.value;
                              updatePreOp(copy);
                            }}
                            className="flex-1 text-xs text-slate-800 font-medium focus:outline-indigo-500"
                            placeholder="Expense name"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 font-financial">{c}</span>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => {
                                const copy = [...project.preOperatingExpenses];
                                copy[idx].amount = parseFloat(e.target.value) || 0;
                                updatePreOp(copy);
                              }}
                              className="w-24 text-xs font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 focus:outline-indigo-500"
                            />
                          </div>
                          <button
                            onClick={() => {
                              updatePreOp(project.preOperatingExpenses.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                      <span>Total Pre-Operating:</span>
                      <span className="font-financial">{formatCurrency(totalPreOp, c)}</span>
                    </div>
                  </div>

                  {/* Fixed Assets Table */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Property, Plant & Equipment (CapEx)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateFixedAssets([
                              ...project.fixedAssets,
                              {
                                id: `fa-${Date.now()}`,
                                name: 'Equipment / Fixture',
                                cost: 50000,
                                usefulLifeYears: 5,
                                salvageValue: 5000,
                                depreciationMethod: 'Straight-Line',
                              },
                            ])
                          }
                          className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3" /> Add Asset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {project.fixedAssets.map((asset, idx) => (
                        <div
                          key={asset.id}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={asset.name}
                              onChange={(e) => {
                                const copy = [...project.fixedAssets];
                                copy[idx].name = e.target.value;
                                updateFixedAssets(copy);
                              }}
                              className="flex-1 text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                              placeholder="Asset name"
                            />
                            <button
                              onClick={() => {
                                updateFixedAssets(project.fixedAssets.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-400 hover:text-red-600 p-0.5 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Cost ({c})</span>
                              <input
                                type="number"
                                value={asset.cost}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].cost = parseFloat(e.target.value) || 0;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block">Useful Life (Yrs)</span>
                              <input
                                type="number"
                                min="1"
                                max="25"
                                value={asset.usefulLifeYears}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].usefulLifeYears = parseInt(e.target.value) || 1;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block">Salvage Value ({c})</span>
                              <input
                                type="number"
                                value={asset.salvageValue}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].salvageValue = parseFloat(e.target.value) || 0;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">
                                Depreciation Method
                              </span>
                              <select
                                value={asset.depreciationMethod || 'Straight-Line'}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].depreciationMethod = e.target.value as DepreciationMethod;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full bg-slate-50 border border-indigo-200 rounded px-1.5 py-1 text-xs font-medium text-slate-800 focus:outline-indigo-500"
                              >
                                {DEPRECIATION_METHODS.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.id === 'Straight-Line'
                                      ? 'Straight-Line (Default)'
                                      : m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                      <span>Total PPE (CapEx):</span>
                      <span className="font-financial">{formatCurrency(totalFixedAssets, c)}</span>
                    </div>
                  </div>
                </div>

                {/* Capital Financing Mix & Working Capital Buffer */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-950 mb-0.5">
                        Financing Mix & Initial Working Capital Buffer
                      </h3>
                      <p className="text-xs text-slate-500">
                        Equity, bank debt financing, and liquidity buffer allocation between cash in vault and depository bank.
                      </p>
                    </div>

                    {onOpenBankModal && (
                      <button
                        onClick={onOpenBankModal}
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bank Interest & Loan Breakdown</span>
                      </button>
                    )}
                  </div>

                  {/* Breakdown of Initial Working Capital Buffer: Cash on Hand & Cash in Bank */}
                  <div className="bg-white border border-indigo-200/90 rounded-xl p-4 shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Initial Working Capital Buffer Breakdown
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Cash on Hand (physical register/petty cash) & Cash in Bank (interest-bearing depository account)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Buffer</span>
                        <span className="text-sm font-bold font-financial text-indigo-900">
                          {formatCurrency(project.initialWorkingCapitalBuffer, c)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Cash on Hand */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                          <span>Cash on Hand ({c})</span>
                          <span className="text-[10px] text-slate-400 font-normal">Petty / Float</span>
                        </label>
                        <input
                          type="number"
                          value={wcDetails.cashOnHand}
                          onChange={(e) =>
                            updateWorkingCapitalBuffer(
                              parseFloat(e.target.value) || 0,
                              wcDetails.cashInBank
                            )
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-financial font-bold text-slate-900 focus:outline-indigo-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Cash in Bank */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                          <span>Cash in Bank ({c})</span>
                          <span className="text-[10px] text-indigo-600 font-semibold">Depository</span>
                        </label>
                        <input
                          type="number"
                          value={wcDetails.cashInBank}
                          onChange={(e) =>
                            updateWorkingCapitalBuffer(
                              wcDetails.cashOnHand,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-financial font-bold text-slate-900 focus:outline-indigo-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Depository Local Bank Selector */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                            Depository Bank
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Local List</span>
                        </label>
                        <select
                          value={
                            LOCAL_BANKS.some((b) => b.name === wcDetails.bankName)
                              ? wcDetails.bankName
                              : 'Other'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                'Other Local Commercial Bank'
                              );
                            } else {
                              const found = LOCAL_BANKS.find((b) => b.name === val);
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                val,
                                wcDetails.bankInterestRatePercent > 0
                                  ? wcDetails.bankInterestRatePercent
                                  : (found?.benchmarkSavingsRate ?? 1.0)
                              );
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-indigo-500 truncate"
                        >
                          {LOCAL_BANKS.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                          <option value="Other">Other Local Commercial Bank / Thrift Bank</option>
                        </select>
                        {!LOCAL_BANKS.some((b) => b.name === wcDetails.bankName) && (
                          <input
                            type="text"
                            value={wcDetails.bankName}
                            onChange={(e) =>
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                e.target.value
                              )
                            }
                            placeholder="Specify custom bank name"
                            className="mt-1.5 w-full bg-white border border-indigo-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-indigo-500"
                          />
                        )}
                      </div>

                      {/* Bank Interest Rate (% p.a.) - Manually Encoded */}
                      <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-indigo-950 flex items-center justify-between mb-1">
                          <span>Bank Interest Rate (% p.a.)</span>
                          <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-1.5 py-0.5 rounded font-medium">
                            Manual
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="30"
                            value={wcDetails.bankInterestRatePercent}
                            onChange={(e) =>
                              updateWorkingCapitalBuffer(
                                wcDetails.cashOnHand,
                                wcDetails.cashInBank,
                                undefined,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white border border-indigo-300 rounded px-2.5 py-1.5 text-xs font-financial font-bold text-indigo-950 focus:outline-indigo-500 pr-7"
                            placeholder="1.0"
                          />
                          <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-medium mt-1 block">
                          Est. interest: {formatCurrency(Math.round(wcDetails.cashInBank * (wcDetails.bankInterestRatePercent / 100)), c)}/yr
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Summary Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-slate-600">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                          <strong>Cash on Hand:</strong> {formatCurrency(wcDetails.cashOnHand, c)} (
                          {project.initialWorkingCapitalBuffer > 0
                            ? Math.round((wcDetails.cashOnHand / project.initialWorkingCapitalBuffer) * 100)
                            : 0}%)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                          <strong>Cash in Bank:</strong> {formatCurrency(wcDetails.cashInBank, c)} (
                          {project.initialWorkingCapitalBuffer > 0
                            ? Math.round((wcDetails.cashInBank / project.initialWorkingCapitalBuffer) * 100)
                            : 0}%)
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-indigo-900">
                        Total Initial Working Capital Buffer: <span className="font-financial">{formatCurrency(project.initialWorkingCapitalBuffer, c)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Owners’ Equity Contribution ({c})
                      </label>
                      <input
                        type="number"
                        value={project.financing.equityContribution}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            financing: {
                              ...project.financing,
                              equityContribution: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Bank / Debt Financing ({c})
                      </label>
                      <input
                        type="number"
                        value={project.financing.bankLoanAmount}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            financing: {
                              ...project.financing,
                              bankLoanAmount: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">
                            Interest %
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={project.financing.annualInterestRate}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                financing: {
                                  ...project.financing,
                                  annualInterestRate: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">
                            Term (Yrs)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={project.financing.loanTermYears}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                financing: {
                                  ...project.financing,
                                  loanTermYears: parseInt(e.target.value) || 1,
                                },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto-match helper button */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-indigo-100">
                    <span className="text-slate-600">
                      Total Required: <strong className="font-financial">{formatCurrency(totalOutlay, c)}</strong> | Current Financing: <strong className="font-financial">{formatCurrency(project.financing.equityContribution + project.financing.bankLoanAmount, c)}</strong>
                    </span>
                    <button
                      onClick={() => {
                        const neededEquity = Math.max(0, totalOutlay - project.financing.bankLoanAmount);
                        onUpdateProject({
                          ...project,
                          financing: { ...project.financing, equityContribution: neededEquity },
                        });
                      }}
                      className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition"
                    >
                      Auto-Balance Equity to 100%
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS & SALES PROJECTIONS */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Revenue Streams & Product Assumptions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Selling prices, unit direct costs, Year 1 expected sales volume, and annual growth %.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('costing')}
                      className="px-2.5 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1 transition border border-indigo-200"
                      title="Open Tab 3 Direct Materials Costing to compute direct materials and packaging"
                    >
                      <Calculator className="w-3.5 h-3.5 text-indigo-600" /> Direct Materials Costing Sheet
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('directCosts')}
                      className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg font-medium flex items-center gap-1 transition border border-slate-200"
                      title="Navigate to Tab 4 to compute and allocate Direct Labor per unit"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> Allocate Direct Labor
                    </button>
                    <button
                      onClick={() =>
                        updateProducts([
                          ...project.products,
                          {
                            id: `p-${Date.now()}`,
                            name: 'New Product / Service',
                            unitPrice: 100,
                            year1Volume: 5000,
                            annualGrowthRate: 8,
                            unitCost: 35,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Product / Service
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Product / Service Name</th>
                        <th className="p-3 text-right">Selling Price ({c})</th>
                        <th className="p-3 text-right">Direct Cost / Unit ({c})</th>
                        <th className="p-3 text-right">Unit Margin</th>
                        <th className="p-3 text-right">Year 1 Volume</th>
                        <th className="p-3 text-right">Annual Growth %</th>
                        <th className="p-3 text-right">Year 1 Revenue</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.products.map((prod, idx) => {
                        const unitMargin = prod.unitPrice - prod.unitCost;
                        const marginPct = prod.unitPrice > 0 ? (unitMargin / prod.unitPrice) * 100 : 0;
                        const yr1Rev = prod.unitPrice * prod.year1Volume;

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={prod.name}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].name = e.target.value;
                                  updateProducts(copy);
                                }}
                                className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.unitPrice}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.unitCost}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  const val = parseFloat(e.target.value) || 0;
                                  copy[idx].unitCost = val;
                                  copy[idx].rawMaterialsCostPerUnit = Math.max(
                                    0,
                                    val - (copy[idx].directLaborCostPerUnit || 0)
                                  );
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                              {prod.directLaborCostPerUnit !== undefined && prod.directLaborCostPerUnit > 0 && (
                                <div
                                  className="text-[10px] text-indigo-600 font-semibold mt-0.5 whitespace-nowrap"
                                  title={`Raw Materials: ${formatCurrency(prod.rawMaterialsCostPerUnit ?? (prod.unitCost - prod.directLaborCostPerUnit), c)} | Direct Labor: ${formatCurrency(prod.directLaborCostPerUnit, c)}`}
                                >
                                  +{formatCurrency(prod.directLaborCostPerUnit, c)} DL
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-financial text-slate-600">
                              {formatCurrency(unitMargin, c)} ({marginPct.toFixed(0)}%)
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.year1Volume}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].year1Volume = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={prod.annualGrowthRate}
                                  onChange={(e) => {
                                    const copy = [...project.products];
                                    copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                    updateProducts(copy);
                                  }}
                                  className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                />
                                <span>%</span>
                              </div>
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                              {formatCurrency(yr1Rev, c)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => {
                                  updateProducts(project.products.filter((_, i) => i !== idx));
                                }}
                                className="text-slate-400 hover:text-red-600 p-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: COSTING (DIRECT MATERIALS & DIRECT LABOR PER UNIT) */}
            {activeTab === 'costing' && (
              <ProductCostingTab
                project={project}
                onUpdateProject={onUpdateProject}
                onNavigateToTab={setActiveTab}
              />
            )}

            {/* TAB 4: DIRECT LABOR */}
            {activeTab === 'directCosts' && (
              <div className="space-y-6">
                {/* ---------------------------------------------------- */}
                {/* 1. DIRECT LABOR TABLE                                */}
                {/* ---------------------------------------------------- */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg">
                          <Users className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Direct Labor Headcount & Compensation
                        </h3>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Direct Labor
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        updateDirectLabor([
                          ...project.directLabor,
                          {
                            id: `dl-${Date.now()}`,
                            role: 'Production Technician',
                            headcount: 1,
                            monthlyWage: 18000,
                            monthsPerYear: 13,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium flex items-center gap-1.5 transition shadow-2xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Direct Labor Role
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Position / Role</th>
                          <th className="p-3 text-right">Headcount</th>
                          <th className="p-3 text-right">Monthly Basic Wage ({c})</th>
                          <th className="p-3 text-right">Months / Year</th>
                          <th className="p-3 text-right">Total Annual Cost (Yr 1)</th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {project.directLabor.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-400">
                              No direct labor positions added yet. Click "Add Direct Labor Role" above.
                            </td>
                          </tr>
                        ) : (
                          project.directLabor.map((lab, idx) => {
                            const annual = lab.monthlyWage * lab.monthsPerYear * lab.headcount;
                            return (
                              <tr key={lab.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={lab.role}
                                    placeholder="e.g. Machine Operator, Assembly Crew"
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      copy[idx].role = e.target.value;
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="1"
                                    value={lab.headcount}
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      copy[idx].headcount = parseInt(e.target.value) || 1;
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    value={lab.monthlyWage}
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      copy[idx].monthlyWage = parseFloat(e.target.value) || 0;
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="12"
                                    max="14"
                                    value={lab.monthsPerYear}
                                    onChange={(e) => {
                                      const copy = [...project.directLabor];
                                      copy[idx].monthsPerYear = parseInt(e.target.value) || 12;
                                      updateDirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                  {formatCurrency(annual, c)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      updateDirectLabor(project.directLabor.filter((_, i) => i !== idx));
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {project.directLabor.length > 0 && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="p-2.5">Total Direct Labor</td>
                            <td className="p-2.5 text-right font-financial font-bold text-indigo-700">
                              {totalDirectLaborHeadcount} pax
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-slate-500">
                              Annual Total:
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-indigo-700 text-sm">
                              {formatCurrency(totalDirectLaborAnnual, c)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* ---------------------------------------------------------------------- */}
                {/* 2. DIRECT LABOR COST PER UNIT COMPUTATION & ALLOCATION                 */}
                {/* ---------------------------------------------------------------------- */}
                <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 border border-indigo-200/80 rounded-xl p-4 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs">
                          <Calculator className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Direct Labor Cost Per Unit Computation & Allocation
                        </h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Sync with Products
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={applyDlToAllProducts}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-2xs flex items-center gap-1"
                        title="Add calculated direct labor to all products in Product & Sales Volume"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Apply DL to All Products
                      </button>
                      <button
                        type="button"
                        onClick={resetAllProductsDl}
                        className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition shadow-2xs"
                        title="Reset all products to base raw materials cost"
                      >
                        Reset All
                      </button>
                    </div>
                  </div>

                  {/* High Level Key Metric Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Total Direct Labor (Year 1)
                      </span>
                      <span className="text-sm font-bold font-financial text-indigo-700">
                        {formatCurrency(totalDirectLaborAnnual, c)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {totalDirectLaborHeadcount} staff across {project.directLabor.length} positions
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Total Year 1 Production Volume
                      </span>
                      <span className="text-sm font-bold font-financial text-slate-900">
                        {totalYear1Volume.toLocaleString()} units
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Across {project.products.length} products defined
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Average DL Cost / Unit
                      </span>
                      <span className="text-sm font-bold font-financial text-emerald-700">
                        {formatCurrency(totalYear1Volume > 0 ? totalDirectLaborAnnual / totalYear1Volume : 0, c)}
                        <span className="text-xs font-normal text-slate-500"> / unit</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        = Total Direct Labor ÷ Total Volume
                      </span>
                    </div>
                  </div>

                  {/* Feedback Banner if an action was executed */}
                  {appliedDlFeedback && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{appliedDlFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: FACTORY OVERHEAD */}
            {activeTab === 'factoryOverhead' && (
              <div className="space-y-6">
                {/* Header & Master Badge */}
                <div className="bg-gradient-to-r from-amber-50/80 via-white to-slate-50 border border-amber-200/80 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-2xs">
                        <Factory className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Factory Overhead (FOH) Schedule
                      </h3>
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Manufacturing Overhead
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                      Indirect production costs capitalized into Cost of Goods Sold (COGS). Includes plant supervision & QA labor, production utilities (machine power & processing water), and factory machinery depreciation.
                    </p>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-2xs text-right shrink-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Total Year 1 FOH (COGS)
                    </span>
                    <span className="text-base font-bold font-financial text-amber-700">
                      {formatCurrency(totalFactoryOverheadYr1, c)}
                    </span>
                  </div>
                </div>

                {/* 1. INDIRECT LABOR TABLE */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-100 text-amber-700 rounded-lg">
                          <Users className="w-4 h-4" />
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          1. Indirect Labor Headcount & Compensation (Production Support)
                        </h4>
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Factory Support
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supervisors, quality control / assurance (QA/QC), plant maintenance, warehouse crew, and factory hygiene staff.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateIndirectLabor([
                          ...(project.indirectLabor || []),
                          {
                            id: `idl-${Date.now()}`,
                            role: 'Production Supervisor / QA',
                            headcount: 1,
                            monthlyWage: 22000,
                            monthsPerYear: 13,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-amber-700 text-white hover:bg-amber-800 rounded-lg font-medium flex items-center gap-1.5 transition shadow-2xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Indirect Labor Role
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Position / Role</th>
                          <th className="p-3 text-right">Headcount</th>
                          <th className="p-3 text-right">Monthly Basic Wage ({c})</th>
                          <th className="p-3 text-right">Months / Year</th>
                          <th className="p-3 text-right">Total Annual Cost (Yr 1)</th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!project.indirectLabor || project.indirectLabor.length === 0) ? (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-400">
                              No indirect labor positions added yet. Click "Add Indirect Labor Role" above.
                            </td>
                          </tr>
                        ) : (
                          project.indirectLabor.map((lab, idx) => {
                            const annual = lab.monthlyWage * lab.monthsPerYear * lab.headcount;
                            return (
                              <tr key={lab.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={lab.role}
                                    placeholder="e.g. Quality Control Inspector, Plant Custodian"
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      copy[idx].role = e.target.value;
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="1"
                                    value={lab.headcount}
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      copy[idx].headcount = parseInt(e.target.value) || 1;
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    value={lab.monthlyWage}
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      copy[idx].monthlyWage = parseFloat(e.target.value) || 0;
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="12"
                                    max="14"
                                    value={lab.monthsPerYear}
                                    onChange={(e) => {
                                      const copy = [...(project.indirectLabor || [])];
                                      copy[idx].monthsPerYear = parseInt(e.target.value) || 12;
                                      updateIndirectLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                  {formatCurrency(annual, c)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      updateIndirectLabor((project.indirectLabor || []).filter((_, i) => i !== idx));
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {(project.indirectLabor && project.indirectLabor.length > 0) && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="p-2.5">Total Indirect Labor</td>
                            <td className="p-2.5 text-right font-financial font-bold text-amber-700">
                              {totalIndirectLaborHeadcount} pax
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-slate-500">
                              Annual Total:
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-amber-700 text-sm">
                              {formatCurrency(totalIndirectLaborAnnual, c)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* 2. UTILITIES EXPENSE ATTRIBUTED TO PRODUCTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-100 text-amber-700 rounded-lg">
                          <Zap className="w-4 h-4" />
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          2. Utilities Expense Attributed to Production
                        </h4>
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Factory Utilities
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Electricity, power, water, steam, boiler fuel, and process utilities consumed directly on the factory floor or kitchen processing lines.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateProductionUtilities([
                            ...(project.productionUtilities || []),
                            {
                              id: `pu-${Date.now()}`,
                              name: 'Factory Electricity (Machinery & Plant Power)',
                              annualAmountYear1: 36000,
                              annualGrowthRate: 5,
                            },
                          ])
                        }
                        className="px-3 py-1.5 text-xs bg-amber-700 text-white hover:bg-amber-800 rounded-lg font-medium flex items-center gap-1.5 transition shadow-2xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Production Utility
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Production Utility Item</th>
                          <th className="p-3 text-right">Year 1 Annual Amount ({c})</th>
                          <th className="p-3 text-right">Annual Escalation Rate (%)</th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!project.productionUtilities || project.productionUtilities.length === 0) ? (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-slate-400">
                              No production utilities added yet. Click "Add Production Utility" above.
                            </td>
                          </tr>
                        ) : (
                          project.productionUtilities.map((util, idx) => (
                            <tr key={util.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={util.name}
                                  placeholder="e.g. Factory Electricity, Water for Food Processing, Plant Fuel"
                                  onChange={(e) => {
                                    const copy = [...(project.productionUtilities || [])];
                                    copy[idx].name = e.target.value;
                                    updateProductionUtilities(copy);
                                  }}
                                  className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  value={util.annualAmountYear1}
                                  onChange={(e) => {
                                    const copy = [...(project.productionUtilities || [])];
                                    copy[idx].annualAmountYear1 = parseFloat(e.target.value) || 0;
                                    updateProductionUtilities(copy);
                                  }}
                                  className="w-28 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={util.annualGrowthRate}
                                    onChange={(e) => {
                                      const copy = [...(project.productionUtilities || [])];
                                      copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                      updateProductionUtilities(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                  <span className="text-slate-400">%</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => {
                                    updateProductionUtilities(
                                      (project.productionUtilities || []).filter((_, i) => i !== idx)
                                    );
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-1 transition"
                                  title="Delete utility"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {(project.productionUtilities && project.productionUtilities.length > 0) && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td className="p-2.5">Total Production Utilities</td>
                            <td className="p-2.5 text-right font-financial font-bold text-amber-700 text-sm">
                              {formatCurrency(totalProductionUtilitiesAnnual, c)}
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-slate-400 text-[11px]">
                              Included in Factory Overhead (COGS)
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* 3. DEPRECIATION EXPENSE ATTRIBUTED TO PRODUCTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                        <Building className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          3. Depreciation Expense Attributed to Production
                        </h4>
                        <p className="text-xs text-slate-500">
                          Depreciation of manufacturing plant, heavy machinery, processing equipment, and production tools capitalized into Cost of Goods Sold.
                        </p>
                      </div>
                    </div>

                    {/* Attribution Mode Switcher */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateFactoryDepreciationMethod('percentage')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          factoryDeprMethod === 'percentage'
                            ? 'bg-white text-amber-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Global % Allocation
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFactoryDepreciationMethod('specific_assets')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                          factoryDeprMethod === 'specific_assets'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Specific Asset Selection
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Global Percentage */}
                  {factoryDeprMethod === 'percentage' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-200/70">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                          Total Fixed Assets Depreciation (Yr 1)
                        </span>
                        <span className="text-base font-bold font-financial text-slate-800">
                          {formatCurrency(totalYear1Depreciation, c)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Computed from {project.fixedAssets.length} asset(s) in Capital Outlay schedule
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] text-amber-900 uppercase tracking-wider font-bold block mb-1">
                          % Attributed to Factory / Production
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={factoryDeprPercent}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              updateFactoryDepreciationPercent(isNaN(val) ? 0 : val);
                            }}
                            className="w-24 font-financial font-bold text-right border border-amber-300 bg-white rounded-lg px-2.5 py-1.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <span className="text-sm font-bold text-amber-800">%</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Remaining {Math.max(0, 100 - factoryDeprPercent)}% is attributed to Office / SG&A OPEX
                        </span>
                      </div>

                      <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-amber-200/80 pt-2 sm:pt-0 sm:pl-4">
                        <div>
                          <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold block">
                            Factory Depreciation (COGS)
                          </span>
                          <span className="text-base font-bold font-financial text-amber-700">
                            {formatCurrency(factoryDepreciationAmountYr1, c)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Office / SG&A Depreciation (OPEX)
                          </span>
                          <span className="text-xs font-semibold font-financial text-slate-600">
                            {formatCurrency(opexDepreciationAmountYr1, c)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Specific Asset Selection */}
                  {factoryDeprMethod === 'specific_assets' && (
                    <div className="space-y-3 bg-amber-50/30 p-4 rounded-xl border border-amber-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                            Select Assets 100% Attributed to Factory / Production
                          </h5>
                          <p className="text-[11px] text-slate-600">
                            Checked assets are 100% capitalized into Factory Overhead (COGS). Unchecked assets are attributed to Office / SG&A OPEX.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => selectAllFactoryAssets(true)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 transition"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => selectAllFactoryAssets(false)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {project.fixedAssets.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-lg border border-dashed border-amber-200 text-slate-400 text-xs">
                          No fixed assets recorded yet. Add machinery, equipment, or plant fixtures in Tab 1 (Capital Outlay).
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-amber-200/80 rounded-xl bg-white shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-amber-100/60 text-amber-950 font-semibold border-b border-amber-200">
                              <tr>
                                <th className="p-2.5 text-center w-12">Factory</th>
                                <th className="p-2.5">Asset Particulars</th>
                                <th className="p-2.5">Depreciation Method</th>
                                <th className="p-2.5 text-right">Cost ({c})</th>
                                <th className="p-2.5 text-right">Life (Yrs)</th>
                                <th className="p-2.5 text-right">Year 1 Depreciation ({c})</th>
                                <th className="p-2.5 text-center">Cost Classification</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                              {project.fixedAssets.map((asset) => {
                                const isSelected = factoryAssetIds.includes(asset.id);
                                const deprItem = deprSchedule.find((d) => d.assetId === asset.id);
                                const yr1Depr = deprItem?.yearValues.find((y) => y.year === 1)?.depreciation ?? deprItem?.annualDepreciation ?? 0;

                                return (
                                  <tr
                                    key={asset.id}
                                    onClick={() => toggleFactoryAsset(asset.id)}
                                    className={`cursor-pointer transition ${
                                      isSelected ? 'bg-amber-50/70 hover:bg-amber-100/60' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleFactoryAsset(asset.id)}
                                        className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-2.5 font-medium text-slate-900">
                                      <div className="flex items-center gap-1.5">
                                        <span>{asset.name || 'Unnamed Asset'}</span>
                                        {isSelected && (
                                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-semibold">
                                            100% Factory
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-slate-600">
                                      <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                        {asset.depreciationMethod || 'Straight-Line'}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-right font-financial text-slate-700">
                                      {formatCurrency(asset.cost, c)}
                                    </td>
                                    <td className="p-2.5 text-right font-financial text-slate-600">
                                      {asset.usefulLifeYears} yrs
                                    </td>
                                    <td className="p-2.5 text-right font-financial font-semibold text-slate-900">
                                      {formatCurrency(yr1Depr, c)}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {isSelected ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                          <Factory className="w-3 h-3 text-amber-700" />
                                          Factory (COGS)
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                          Office (SG&A)
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Summary breakdown bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-amber-200">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Selected Factory Assets
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {factoryAssetIds.length} of {project.fixedAssets.length} Assets
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold block">
                            Factory Depreciation (Yr 1 COGS)
                          </span>
                          <span className="text-base font-bold font-financial text-amber-700">
                            {formatCurrency(factoryDepreciationAmountYr1, c)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Office / SG&A Depreciation (Yr 1 OPEX)
                          </span>
                          <span className="text-sm font-bold font-financial text-slate-700">
                            {formatCurrency(opexDepreciationAmountYr1, c)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. OTHER FACTORY SUPPLIES & MISCELLANEOUS OVERHEAD */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-indigo-600" />
                        Other Factory Supplies & Miscellaneous Overhead
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consumable plant items, lubricants, sanitizers, gloves, and minor manufacturing indirect expenses.
                      </p>
                    </div>

                    {/* Button to list/itemize indirect supplies */}
                    <button
                      type="button"
                      onClick={() => setShowSuppliesList(!showSuppliesList)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 flex items-center gap-1.5 shadow-2xs transition shrink-0"
                    >
                      <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{showSuppliesList ? 'Hide Supplies List' : 'List Indirect Supplies & Items'}</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {factorySuppliesList.length}
                      </span>
                    </button>
                  </div>

                  {/* Summary inputs: Annual Factory Overhead and Growth Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-700">
                          Other Annual Factory Overhead (Year 1) ({c})
                        </label>
                        {totalItemizedSuppliesAnnual > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProject({
                                ...project,
                                factoryOverheadAnnual: totalItemizedSuppliesAnnual,
                              });
                              setSuppliesSyncFeedback('Updated Annual Factory Overhead to match itemized supplies sum!');
                              setTimeout(() => setSuppliesSyncFeedback(null), 3500);
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                            title="Click to copy sum of itemized supplies"
                          >
                            Set to Itemized Total ({formatCurrency(totalItemizedSuppliesAnnual, c)})
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        value={project.factoryOverheadAnnual || 0}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadAnnual: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full font-financial font-semibold text-right border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                        placeholder="e.g. Plant maintenance supplies, cleaning & safety gear"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Annual Overhead Escalation Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={project.factoryOverheadGrowthRate || 0}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadGrowthRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full font-financial text-right border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {suppliesSyncFeedback && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {suppliesSyncFeedback}
                    </div>
                  )}

                  {/* Expandable Itemized Supplies Table */}
                  {showSuppliesList && (
                    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-indigo-200/70 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <PackageCheck className="w-4 h-4 text-indigo-600" />
                            Indirect Production Supplies & Consumables Breakdown
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            Specify auxiliary items indirect to production, their quantity, unit, and unit cost.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateFactorySupplies([
                              ...factorySuppliesList,
                              {
                                id: `sup-${Date.now()}`,
                                name: 'Sanitation Chemicals & Cleaning Agents',
                                quantity: 12,
                                unit: 'packs/year',
                                unitCost: 1500,
                                annualAmount: 18000,
                                notes: 'Plant hygiene and machine degreaser',
                              },
                            ])
                          }
                          className="px-3 py-1.5 text-xs bg-indigo-700 text-white hover:bg-indigo-800 rounded-lg font-semibold flex items-center gap-1.5 transition shadow-2xs shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Supply Item
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Indirect Supply / Item Particulars</th>
                              <th className="p-2.5 text-right w-24">Quantity</th>
                              <th className="p-2.5 w-28">Unit</th>
                              <th className="p-2.5 text-right w-28">Unit Cost ({c})</th>
                              <th className="p-2.5 text-right w-32">Annual Amount ({c})</th>
                              <th className="p-2.5">Purpose / Notes</th>
                              <th className="p-2.5 text-center w-12">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {factorySuppliesList.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                                  No itemized supplies added yet. Click "Add Supply Item" above to list indirect production supplies.
                                </td>
                              </tr>
                            ) : (
                              factorySuppliesList.map((sup, idx) => (
                                <tr key={sup.id} className="hover:bg-slate-50/50">
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={sup.name}
                                      placeholder="e.g. Machine Lubricant, Hairnets & Gloves, QC Vials"
                                      onChange={(e) => {
                                        const copy = [...factorySuppliesList];
                                        copy[idx].name = e.target.value;
                                        updateFactorySupplies(copy);
                                      }}
                                      className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                                    />
                                  </td>
                                  <td className="p-2 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      value={sup.quantity}
                                      onChange={(e) => {
                                        const copy = [...factorySuppliesList];
                                        const q = parseFloat(e.target.value) || 0;
                                        copy[idx].quantity = q;
                                        copy[idx].annualAmount = Math.round(q * (copy[idx].unitCost || 0));
                                        updateFactorySupplies(copy);
                                      }}
                                      className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={sup.unit}
                                      placeholder="e.g. boxes, liters"
                                      onChange={(e) => {
                                        const copy = [...factorySuppliesList];
                                        copy[idx].unit = e.target.value;
                                        updateFactorySupplies(copy);
                                      }}
                                      className="w-24 text-slate-600 border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                                    />
                                  </td>
                                  <td className="p-2 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      value={sup.unitCost}
                                      onChange={(e) => {
                                        const copy = [...factorySuppliesList];
                                        const u = parseFloat(e.target.value) || 0;
                                        copy[idx].unitCost = u;
                                        copy[idx].annualAmount = Math.round((copy[idx].quantity || 0) * u);
                                        updateFactorySupplies(copy);
                                      }}
                                      className="w-24 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                    />
                                  </td>
                                  <td className="p-2 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      value={sup.annualAmount}
                                      onChange={(e) => {
                                        const copy = [...factorySuppliesList];
                                        copy[idx].annualAmount = parseFloat(e.target.value) || 0;
                                        updateFactorySupplies(copy);
                                      }}
                                      className="w-28 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 text-indigo-950"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={sup.notes || ''}
                                      placeholder="e.g. For weekly machine sanitation"
                                      onChange={(e) => {
                                        const copy = [...factorySuppliesList];
                                        copy[idx].notes = e.target.value;
                                        updateFactorySupplies(copy);
                                      }}
                                      className="w-full text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none text-[11px]"
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateFactorySupplies(factorySuppliesList.filter((_, i) => i !== idx))
                                      }
                                      className="text-slate-400 hover:text-red-600 p-1 transition"
                                      title="Delete supply item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          {factorySuppliesList.length > 0 && (
                            <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                              <tr>
                                <td colSpan={4} className="p-2.5">
                                  Total Itemized Indirect Supplies & Consumables
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-indigo-950 text-sm">
                                  {formatCurrency(totalItemizedSuppliesAnnual, c)}
                                </td>
                                <td colSpan={2} className="p-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateProject({
                                        ...project,
                                        factoryOverheadAnnual: totalItemizedSuppliesAnnual,
                                      });
                                      setSuppliesSyncFeedback('Updated Annual Factory Overhead to match itemized supplies sum!');
                                      setTimeout(() => setSuppliesSyncFeedback(null), 3500);
                                    }}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                                  >
                                    Apply Total to Overhead
                                  </button>
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. DIRECT & INDIRECT EMPLOYEE BENEFITS SCHEDULE */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          5. Production Employee Benefits Schedule (Direct & Indirect Labor)
                        </h4>
                        <p className="text-xs text-slate-500">
                          Computes statutory employer contributions (SSS, PhilHealth, Pag-IBIG), 13th Month Pay, and fringe benefits for production workers.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={loadStandardLaborBenefitsPresets}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 transition shadow-2xs"
                        title="Load SSS 9.5%, PhilHealth 2.5%, Pag-IBIG ₱200/mo, 13th Month 8.33%, Other Benefits"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                        Load Standard PH Presets
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateProductionLaborBenefits([
                            ...laborBenefitsList,
                            {
                              id: `ben-${Date.now()}`,
                              name: 'Company Health & Safety Allowance',
                              type: 'fixed_monthly_per_head',
                              rateOrAmount: 300,
                              appliesTo: 'both',
                              notes: 'Monthly PPE & hygiene allowance',
                            },
                          ])
                        }
                        className="px-3 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Benefit Row
                      </button>
                    </div>
                  </div>

                  {benefitsFeedback && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {benefitsFeedback}
                    </div>
                  )}

                  {/* Production Workforce Wage & Headcount Reference Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Direct Labor (Tab 4)
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {directLaborHeadcount} Worker{directLaborHeadcount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5 font-financial">
                        Basic Pay: {formatCurrency(directLaborMonthlyWageTotal, c)}/mo ({formatCurrency(directLaborAnnualBasic12M, c)}/yr)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Indirect Labor (Tab 5)
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {indirectLaborHeadcount} Worker{indirectLaborHeadcount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5 font-financial">
                        Basic Pay: {formatCurrency(indirectLaborMonthlyWageTotal, c)}/mo ({formatCurrency(indirectLaborAnnualBasic12M, c)}/yr)
                      </span>
                    </div>

                    <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Combined Production Personnel
                      </span>
                      <span className="text-sm font-bold text-indigo-950">
                        {directLaborHeadcount + indirectLaborHeadcount} Total Staff
                      </span>
                      <span className="text-[11px] text-indigo-900 block mt-0.5 font-financial font-medium">
                        Combined Base: {formatCurrency(directLaborAnnualBasic12M + indirectLaborAnnualBasic12M, c)}/yr
                      </span>
                    </div>
                  </div>

                  {/* Interactive Benefits Calculation Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Benefit Particulars</th>
                          <th className="p-2.5 w-40">Calculation Mode</th>
                          <th className="p-2.5 text-right w-28">Rate / Amount</th>
                          <th className="p-2.5 w-36">Applies To</th>
                          <th className="p-2.5 text-right w-28">Direct Labor Share ({c})</th>
                          <th className="p-2.5 text-right w-28">Indirect Labor Share ({c})</th>
                          <th className="p-2.5 text-right w-32">Total Annual Cost ({c})</th>
                          <th className="p-2.5 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {laborBenefitsList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-slate-400">
                              <p className="font-medium text-slate-500">No employee benefits configured yet.</p>
                              <p className="text-[11px] mt-1">
                                Click "Load Standard PH Presets" above to auto-populate SSS, PhilHealth, Pag-IBIG, and 13th Month Pay.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          laborBenefitsList.map((b, idx) => {
                            const appliesDirect = b.appliesTo === 'both' || b.appliesTo === 'direct_only';
                            const appliesIndirect = b.appliesTo === 'both' || b.appliesTo === 'indirect_only';

                            let directShare = 0;
                            let indirectShare = 0;

                            if (b.type === 'percentage') {
                              const rate = (b.rateOrAmount || 0) / 100;
                              if (appliesDirect) directShare = directLaborAnnualBasic12M * rate;
                              if (appliesIndirect) indirectShare = indirectLaborAnnualBasic12M * rate;
                            } else if (b.type === 'fixed_monthly_per_head') {
                              const monthly = b.rateOrAmount || 0;
                              if (appliesDirect) directShare = monthly * 12 * directLaborHeadcount;
                              if (appliesIndirect) indirectShare = monthly * 12 * indirectLaborHeadcount;
                            } else if (b.type === 'fixed_annual') {
                              const annualAmt = b.rateOrAmount || 0;
                              const totalHead = (appliesDirect ? directLaborHeadcount : 0) + (appliesIndirect ? indirectLaborHeadcount : 0);
                              if (totalHead > 0) {
                                if (appliesDirect && appliesIndirect) {
                                  directShare = annualAmt * (directLaborHeadcount / totalHead);
                                  indirectShare = annualAmt * (indirectLaborHeadcount / totalHead);
                                } else if (appliesDirect) {
                                  directShare = annualAmt;
                                } else if (appliesIndirect) {
                                  indirectShare = annualAmt;
                                }
                              }
                            }

                            const rowTotal = directShare + indirectShare;

                            return (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={b.name}
                                    placeholder="Benefit Name (e.g. SSS, PhilHealth, Pag-IBIG)"
                                    onChange={(e) => {
                                      const copy = [...laborBenefitsList];
                                      copy[idx].name = e.target.value;
                                      updateProductionLaborBenefits(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                                  />
                                  {b.notes && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5">{b.notes}</span>
                                  )}
                                </td>

                                <td className="p-2">
                                  <select
                                    value={b.type}
                                    onChange={(e) => {
                                      const copy = [...laborBenefitsList];
                                      copy[idx].type = e.target.value as BenefitCalculationType;
                                      updateProductionLaborBenefits(copy);
                                    }}
                                    className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  >
                                    <option value="percentage">% of Basic Salary</option>
                                    <option value="fixed_monthly_per_head">Monthly Fixed / Head</option>
                                    <option value="fixed_annual">Annual Lump Sum</option>
                                  </select>
                                </td>

                                <td className="p-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <input
                                      type="number"
                                      step={b.type === 'percentage' ? '0.01' : '10'}
                                      min="0"
                                      value={b.rateOrAmount}
                                      onChange={(e) => {
                                        const copy = [...laborBenefitsList];
                                        copy[idx].rateOrAmount = parseFloat(e.target.value) || 0;
                                        updateProductionLaborBenefits(copy);
                                      }}
                                      className="w-20 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                    />
                                    <span className="text-[11px] text-slate-500">
                                      {b.type === 'percentage' ? '%' : b.type === 'fixed_monthly_per_head' ? '/mo' : c}
                                    </span>
                                  </div>
                                </td>

                                <td className="p-2">
                                  <select
                                    value={b.appliesTo}
                                    onChange={(e) => {
                                      const copy = [...laborBenefitsList];
                                      copy[idx].appliesTo = e.target.value as BenefitAppliesTo;
                                      updateProductionLaborBenefits(copy);
                                    }}
                                    className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  >
                                    <option value="both">Both (Direct & Indirect)</option>
                                    <option value="direct_only">Direct Labor Only</option>
                                    <option value="indirect_only">Indirect Labor Only</option>
                                  </select>
                                </td>

                                <td className="p-2 text-right font-financial text-slate-700">
                                  {formatCurrency(directShare, c)}
                                </td>

                                <td className="p-2 text-right font-financial text-slate-700">
                                  {formatCurrency(indirectShare, c)}
                                </td>

                                <td className="p-2 text-right font-financial font-bold text-emerald-900">
                                  {formatCurrency(rowTotal, c)}
                                </td>

                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateProductionLaborBenefits(laborBenefitsList.filter((_, i) => i !== idx))
                                    }
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete benefit item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {laborBenefitsList.length > 0 && (
                        <tfoot className="bg-emerald-50/50 border-t border-emerald-200 font-semibold text-slate-900">
                          <tr>
                            <td colSpan={4} className="p-2.5 font-bold text-emerald-950">
                              Total Production Labor Benefits (Year 1)
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-slate-800">
                              {formatCurrency(totalDirectBenefitsAnnual, c)}
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-slate-800">
                              {formatCurrency(totalIndirectBenefitsAnnual, c)}
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-emerald-950 text-sm">
                              {formatCurrency(totalProductionLaborBenefitsAnnual, c)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  {/* COGS Treatment & 13th Month Pay Advisory Note */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                      <input
                        type="checkbox"
                        checked={includeBenefitsInCOGS}
                        onChange={(e) => toggleIncludeLaborBenefitsInCOGS(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Include Production Labor Benefits in Factory Overhead (Cost of Goods Sold)</span>
                    </label>

                    <span className="text-[11px] text-slate-500 font-financial">
                      Status: {includeBenefitsInCOGS ? `+${formatCurrency(totalProductionLaborBenefitsAnnual, c)} capitalized into COGS` : 'Excluded from COGS'}
                    </span>
                  </div>

                  {/* 13th Month Double Counting Auditor Check */}
                  {project.directLabor.some((l) => (l.monthsPerYear || 12) >= 13) &&
                    laborBenefitsList.some((b) => b.name.toLowerCase().includes('13th') && (b.rateOrAmount || 0) > 0) && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">13th Month Pay Alignment Notice:</span>
                            Direct Labor roles in Tab 4 are configured with 13 months/year (which already embeds 13th Month Pay in base wages). To avoid double-counting, you may either set 13th Month Pay to 0% in this table, or adjust Tab 4 Direct Labor to 12 months.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={adjustDirectLaborTo12Months}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shrink-0 self-start sm:self-center"
                        >
                          Adjust Tab 4 to 12 Months
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* TAB 6: NON-MANUFACTURING */}
            {activeTab === 'nonManufacturing' && (
              <div className="space-y-6">
                {/* Header & Context */}
                <div className="bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border border-blue-200/70 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-2xs">
                        <UserCheck className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Non-Manufacturing Personnel (SG&A Staff)
                      </h3>
                      <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Operating Expenses
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateNonManufacturingLabor([
                        ...(project.nonManufacturingLabor || []),
                        {
                          id: `nml-${Date.now()}`,
                          role: 'Administrative Officer',
                          category: 'Administrative',
                          headcount: 1,
                          monthlyWage: 20000,
                          monthsPerYear: 13,
                        },
                      ])
                    }
                    className="px-3.5 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-1.5 transition shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Non-Manufacturing Employee
                  </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Total Headcount
                    </span>
                    <span className="text-base font-bold font-financial text-slate-800">
                      {totalNonMfgHeadcount} pax
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Administrative Payroll
                    </span>
                    <span className="text-base font-bold font-financial text-blue-700">
                      {formatCurrency(totalNonMfgAdminAnnual, c)}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Selling & Marketing Payroll
                    </span>
                    <span className="text-base font-bold font-financial text-emerald-700">
                      {formatCurrency(totalNonMfgSellingAnnual, c)}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold block">
                      Total Annual Payroll (Yr 1)
                    </span>
                    <span className="text-base font-bold font-financial text-blue-900">
                      {formatCurrency(totalNonMfgAnnual, c)}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Department / Category</th>
                          <th className="p-3">Position / Role Title</th>
                          <th className="p-3 text-right">Headcount</th>
                          <th className="p-3 text-right">Monthly Salary / Wage ({c})</th>
                          <th className="p-3 text-right">Months / Year</th>
                          <th className="p-3 text-right">Total Annual Cost (Yr 1)</th>
                          <th className="p-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!project.nonManufacturingLabor || project.nonManufacturingLabor.length === 0) ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400">
                              No non-manufacturing personnel added yet. Click "Add Non-Manufacturing Employee" above to add administrative or sales staff.
                            </td>
                          </tr>
                        ) : (
                          project.nonManufacturingLabor.map((emp, idx) => {
                            const annual = emp.monthlyWage * emp.monthsPerYear * emp.headcount;
                            return (
                              <tr key={emp.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <select
                                    value={emp.category}
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].category = e.target.value as 'Administrative' | 'Selling & Marketing';
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className={`text-xs rounded-lg px-2 py-1 font-semibold border ${
                                      emp.category === 'Selling & Marketing'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                    }`}
                                  >
                                    <option value="Administrative">Administrative</option>
                                    <option value="Selling & Marketing">Selling & Marketing</option>
                                  </select>
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={emp.role}
                                    placeholder="e.g. General Manager, Accountant, Sales Executive, Cashier"
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].role = e.target.value;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="1"
                                    value={emp.headcount}
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].headcount = parseInt(e.target.value) || 1;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    value={emp.monthlyWage}
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].monthlyWage = parseFloat(e.target.value) || 0;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right">
                                  <input
                                    type="number"
                                    min="12"
                                    max="14"
                                    value={emp.monthsPerYear}
                                    onChange={(e) => {
                                      const copy = [...(project.nonManufacturingLabor || [])];
                                      copy[idx].monthsPerYear = parseInt(e.target.value) || 12;
                                      updateNonManufacturingLabor(copy);
                                    }}
                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                  />
                                </td>
                                <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                  {formatCurrency(annual, c)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      updateNonManufacturingLabor(
                                        (project.nonManufacturingLabor || []).filter((_, i) => i !== idx)
                                      );
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition"
                                    title="Delete role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {(project.nonManufacturingLabor && project.nonManufacturingLabor.length > 0) && (
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td colSpan={2} className="p-2.5">
                              Total Non-Manufacturing Personnel
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-blue-700">
                              {totalNonMfgHeadcount} pax
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-slate-500">
                              Grand Total Annual Payroll:
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-blue-700 text-sm">
                              {formatCurrency(totalNonMfgAnnual, c)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    * Accounting note: Administrative salaries flow into Administrative Expenses; Selling & Marketing salaries flow into Selling & Marketing Expenses under Operating Expenses (SG&A).
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: OPERATING EXPENSES (SG&A) */}
            {activeTab === 'opex' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Selling, General & Administrative (SG&A) Expenses
                    </h3>
                    <p className="text-xs text-slate-500">
                      Management salaries, store/office rental, utilities, marketing campaigns, and licenses.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateOpex([
                        ...project.operatingExpenses,
                        {
                          id: `opex-${Date.now()}`,
                          category: 'Administrative',
                          name: 'New Operating Expense',
                          annualAmountYear1: 36000,
                          annualGrowthRate: 5,
                        },
                      ])
                    }
                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add OPEX Item
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Expense Name</th>
                        <th className="p-3 text-right">Year 1 Annual ({c})</th>
                        <th className="p-3 text-right">Annual Growth %</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.operatingExpenses.map((opex, idx) => (
                        <tr key={opex.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5">
                            <select
                              value={opex.category}
                              onChange={(e) => {
                                const copy = [...project.operatingExpenses];
                                copy[idx].category = e.target.value as any;
                                updateOpex(copy);
                              }}
                              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium text-slate-700"
                            >
                              <option value="Administrative">Administrative</option>
                              <option value="Selling & Marketing">Selling & Marketing</option>
                              <option value="Utilities & Rent">Utilities & Rent</option>
                              <option value="Other OPEX">Other OPEX</option>
                            </select>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={opex.name}
                              onChange={(e) => {
                                const copy = [...project.operatingExpenses];
                                copy[idx].name = e.target.value;
                                updateOpex(copy);
                              }}
                              className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <input
                              type="number"
                              value={opex.annualAmountYear1}
                              onChange={(e) => {
                                const copy = [...project.operatingExpenses];
                                copy[idx].annualAmountYear1 = parseFloat(e.target.value) || 0;
                                updateOpex(copy);
                              }}
                              className="w-28 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.5"
                                value={opex.annualGrowthRate}
                                onChange={(e) => {
                                  const copy = [...project.operatingExpenses];
                                  copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                  updateOpex(copy);
                                }}
                                className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                              <span>%</span>
                            </div>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                updateOpex(project.operatingExpenses.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: WORKING CAPITAL POLICY */}
            {activeTab === 'workingCapital' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Working Capital Policies & Cash Management
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Determines Accounts Receivable, Target Inventory, and Accounts Payable on the Balance Sheet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Accounts Receivable Policy
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Percentage of annual sales uncollected at year-end (credit sales).
                    </p>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.accountsReceivablePercentOfSales}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              accountsReceivablePercentOfSales: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-financial font-semibold"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of Net Sales</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Ending Inventory Policy
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Safety stock buffer maintained as a percentage of annual COGS.
                    </p>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.inventoryPercentOfCOGS}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              inventoryPercentOfCOGS: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-financial font-semibold"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of COGS</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Accounts Payable Policy
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Credit from raw material and direct inventory suppliers at year-end.
                    </p>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.accountsPayablePercentOfPurchases}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              accountsPayablePercentOfPurchases: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-financial font-semibold"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of Direct Materials</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
