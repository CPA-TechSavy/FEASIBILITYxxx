import { useState } from 'react';
import {
  FeasibilityProject,
  PreOperatingExpenseItem,
  FixedAssetItem,
  ProductItem,
  DirectLaborItem,
  IndirectLaborItem,
  OperatingExpenseItem,
  DepreciationMethod,
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
} from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculations';
import { LOCAL_BANKS, DEPRECIATION_METHODS } from '../data/bankList';

// Sample Bill of Materials & Packaging Presets for instant reference
const SAMPLE_BOM_PRESETS: Record<
  string,
  { label: string; description: string; components: ProductCostComponent[] }
> = {
  cafe: {
    label: 'Beverage / Coffee (Beans, Milk & Eco Packaging)',
    description: 'Arabica coffee beans, fresh milk, cups, sip lids, sleeves & labels with yield formulas',
    components: [
      {
        id: 'c1',
        category: 'Raw Materials & Ingredients',
        name: 'Arabica Coffee Beans (1kg Bag)',
        costMode: 'package_yield',
        purchaseCost: 650,
        packageUnit: '1kg bag',
        packageQuantity: 1,
        yieldUnits: 50,
        quantity: 0.02,
        unit: 'kg',
        unitCost: 650,
        totalCost: 13.0,
      },
      {
        id: 'c2',
        category: 'Raw Materials & Ingredients',
        name: 'Fresh Dairy Milk (1L Carton)',
        costMode: 'package_yield',
        purchaseCost: 95,
        packageUnit: '1L carton',
        packageQuantity: 1,
        yieldUnits: 5,
        quantity: 0.2,
        unit: 'L',
        unitCost: 95,
        totalCost: 19.0,
      },
      {
        id: 'c3',
        category: 'Packaging & Containers',
        name: 'Eco Paper Cup 16oz (Pack of 100)',
        costMode: 'package_yield',
        purchaseCost: 350,
        packageUnit: 'pack of 100',
        packageQuantity: 1,
        yieldUnits: 100,
        quantity: 1,
        unit: 'pc',
        unitCost: 3.5,
        totalCost: 3.5,
      },
      {
        id: 'c4',
        category: 'Packaging & Containers',
        name: 'Sip-through Lid & Thermal Sleeve',
        costMode: 'package_yield',
        purchaseCost: 180,
        packageUnit: 'pack of 100',
        packageQuantity: 1,
        yieldUnits: 100,
        quantity: 1,
        unit: 'set',
        unitCost: 1.8,
        totalCost: 1.8,
      },
      {
        id: 'c5',
        category: 'Packaging & Containers',
        name: 'Branded Label Sticker (Roll of 1,000)',
        costMode: 'package_yield',
        purchaseCost: 500,
        packageUnit: 'roll of 1000',
        packageQuantity: 1,
        yieldUnits: 1000,
        quantity: 1,
        unit: 'pc',
        unitCost: 0.5,
        totalCost: 0.5,
      },
      {
        id: 'c6',
        category: 'Direct Consumables & Supplies',
        name: 'Biodegradable Straw & Napkin',
        costMode: 'direct_unit',
        quantity: 1,
        unit: 'set',
        unitCost: 0.7,
        totalCost: 0.7,
      },
    ],
  },
  food: {
    label: 'Packaged Food / Bakery (Ingredients & Packaging)',
    description: 'Flour, butter, sugar mix, filling, window kraft boxes & parchment wrapping',
    components: [
      {
        id: 'f1',
        category: 'Raw Materials & Ingredients',
        name: 'Premium Flour, Butter & Sugar Mix (5kg)',
        costMode: 'package_yield',
        purchaseCost: 550,
        packageUnit: '5kg batch',
        packageQuantity: 1,
        yieldUnits: 40,
        quantity: 0.125,
        unit: 'kg',
        unitCost: 110,
        totalCost: 13.75,
      },
      {
        id: 'f2',
        category: 'Raw Materials & Ingredients',
        name: 'Specialty Filling / Chocolate Glaze (1kg)',
        costMode: 'package_yield',
        purchaseCost: 380,
        packageUnit: '1kg tub',
        packageQuantity: 1,
        yieldUnits: 40,
        quantity: 0.025,
        unit: 'kg',
        unitCost: 380,
        totalCost: 9.5,
      },
      {
        id: 'f3',
        category: 'Packaging & Containers',
        name: 'Windowed Kraft Pastry Box (Bundle of 50)',
        costMode: 'package_yield',
        purchaseCost: 375,
        packageUnit: 'bundle of 50',
        packageQuantity: 1,
        yieldUnits: 50,
        quantity: 1,
        unit: 'box',
        unitCost: 7.5,
        totalCost: 7.5,
      },
      {
        id: 'f4',
        category: 'Packaging & Containers',
        name: 'Greaseproof Liner & Tamper-Evident Sticker',
        costMode: 'direct_unit',
        quantity: 1,
        unit: 'set',
        unitCost: 1.5,
        totalCost: 1.5,
      },
    ],
  },
  retail: {
    label: 'Manufactured / Retail Good',
    description: 'Core fabricated material, corrugated shipping box & barcode labeling',
    components: [
      {
        id: 'r1',
        category: 'Raw Materials & Ingredients',
        name: 'Primary Fabric / Raw Material Stock',
        costMode: 'direct_unit',
        quantity: 1,
        unit: 'meter/unit',
        unitCost: 48.0,
        totalCost: 48.0,
      },
      {
        id: 'r2',
        category: 'Packaging & Containers',
        name: 'Custom Corrugated Product Box (Pack of 100)',
        costMode: 'package_yield',
        purchaseCost: 850,
        packageUnit: 'bundle of 100',
        packageQuantity: 1,
        yieldUnits: 100,
        quantity: 1,
        unit: 'box',
        unitCost: 8.5,
        totalCost: 8.5,
      },
      {
        id: 'r3',
        category: 'Packaging & Containers',
        name: 'Protective Polybag & Barcode Hangtag',
        costMode: 'direct_unit',
        quantity: 1,
        unit: 'set',
        unitCost: 2.2,
        totalCost: 2.2,
      },
    ],
  },
};

interface AssumptionsEditorProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  onOpenBankModal?: () => void;
}

type TabKey = 'capital' | 'sales' | 'directCosts' | 'opex' | 'workingCapital';

export default function AssumptionsEditor({
  project,
  onUpdateProject,
  onOpenBankModal,
}: AssumptionsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('capital');
  const [isExpanded, setIsExpanded] = useState(true);

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
  const [dlAllocationMode, setDlAllocationMode] = useState<'volume_share' | 'custom'>('volume_share');
  const [customDlPerUnit, setCustomDlPerUnit] = useState<Record<string, number>>({});
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

  // Total Year 1 Production Volume
  const totalYear1Volume = project.products.reduce((sum, p) => sum + (p.year1Volume || 0), 0);

  // Function to compute DL cost per unit for a given product
  const computeDLCostPerUnit = (prod: ProductItem): number => {
    if (dlAllocationMode === 'custom' && customDlPerUnit[prod.id] !== undefined) {
      return customDlPerUnit[prod.id];
    }
    if (totalYear1Volume <= 0 || totalDirectLaborAnnual <= 0) return 0;
    return Math.round((totalDirectLaborAnnual / totalYear1Volume) * 100) / 100;
  };

  // Add Direct Labor cost to a specific product's cost in Product & Sales Volume
  const addDlToProductCost = (prodId: string) => {
    const target = project.products.find((p) => p.id === prodId);
    if (!target) return;
    const dlUnit = computeDLCostPerUnit(target);
    const baseRaw = target.rawMaterialsCostPerUnit !== undefined
      ? target.rawMaterialsCostPerUnit
      : target.directLaborCostPerUnit !== undefined
        ? Math.max(0, target.unitCost - target.directLaborCostPerUnit)
        : target.unitCost;

    const newUnitCost = Math.round((baseRaw + dlUnit) * 100) / 100;

    const updated = project.products.map((p) => {
      if (p.id !== prodId) return p;
      return {
        ...p,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: dlUnit,
        unitCost: newUnitCost,
      };
    });
    updateProducts(updated);
    setAppliedDlFeedback(`Added ${formatCurrency(dlUnit, c)} DL per unit to ${target.name || 'product'}!`);
    setTimeout(() => setAppliedDlFeedback(null), 3500);
  };

  // Remove / Reset DL cost from a specific product
  const removeDlFromProductCost = (prodId: string) => {
    const target = project.products.find((p) => p.id === prodId);
    if (!target) return;
    const baseRaw = target.rawMaterialsCostPerUnit !== undefined
      ? target.rawMaterialsCostPerUnit
      : target.directLaborCostPerUnit !== undefined
        ? Math.max(0, target.unitCost - target.directLaborCostPerUnit)
        : target.unitCost;

    const updated = project.products.map((p) => {
      if (p.id !== prodId) return p;
      return {
        ...p,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: 0,
        unitCost: baseRaw,
      };
    });
    updateProducts(updated);
    setAppliedDlFeedback(`Reset ${target.name || 'product'} to base materials (${formatCurrency(baseRaw, c)})`);
    setTimeout(() => setAppliedDlFeedback(null), 3500);
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
          {/* Sub Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 scrollbar-none">
            <button
              onClick={() => setActiveTab('capital')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'capital'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>1. Capital Outlay & Debt</span>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'sales'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>2. Products & Sales Volume</span>
            </button>

            <button
              onClick={() => setActiveTab('directCosts')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'directCosts'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. Direct Labor & Production</span>
            </button>

            <button
              onClick={() => setActiveTab('opex')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'opex'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>4. Operating Expenses (SG&A)</span>
            </button>

            <button
              onClick={() => setActiveTab('workingCapital')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'workingCapital'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5. Working Capital Policy</span>
            </button>
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
                      onClick={() => setActiveTab('directCosts')}
                      className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg font-medium flex items-center gap-1 transition border border-slate-200"
                      title="Navigate to Tab 3 to compute and allocate Direct Labor per unit"
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

            {/* TAB 3: DIRECT LABOR & PRODUCTION OVERHEAD */}
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
                      <p className="text-xs text-slate-500 mt-0.5">
                        Production technicians, assembly staff, baristas, or service crew directly fabricating products or delivering services.
                      </p>
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
                {/* 2. DIRECT LABOR COST PER UNIT COMPUTATION & ALLOCATION TO PRODUCTS    */}
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
                      <p className="text-xs text-slate-500 mt-1">
                        Compute the Direct Labor Cost per unit of product and add it to the product cost in Product & Sales Volume.
                      </p>
                    </div>

                    {/* Mode Switch: Volume-Weighted vs Custom */}
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setDlAllocationMode('volume_share')}
                        className={`px-3 py-1 font-medium rounded-md transition ${
                          dlAllocationMode === 'volume_share'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Average per Unit (Volume Weighted)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDlAllocationMode('custom')}
                        className={`px-3 py-1 font-medium rounded-md transition ${
                          dlAllocationMode === 'custom'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Custom Rate per Product
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

                  {/* Product Allocation Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Product Direct Labor Allocation Matrix
                      </h4>
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

                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Product Name</th>
                            <th className="p-2.5 text-right">Yr 1 Volume</th>
                            <th className="p-2.5 text-right">Volume Share</th>
                            <th className="p-2.5 text-right">Direct Labor Cost / Unit ({c})</th>
                            <th className="p-2.5 text-right">Base Materials ({c})</th>
                            <th className="p-2.5 text-right font-bold text-slate-900">Total Unit Cost ({c})</th>
                            <th className="p-2.5 text-center">Status in Table</th>
                            <th className="p-2.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {project.products.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-6 text-slate-400">
                                Please add products in "Product & Sales Volume" first.
                              </td>
                            </tr>
                          ) : (
                            project.products.map((prod) => {
                              const computedDl = computeDLCostPerUnit(prod);
                              const volShare = totalYear1Volume > 0 ? (prod.year1Volume / totalYear1Volume) * 100 : 0;
                              const baseRaw =
                                prod.rawMaterialsCostPerUnit !== undefined
                                  ? prod.rawMaterialsCostPerUnit
                                  : prod.directLaborCostPerUnit !== undefined
                                    ? Math.max(0, prod.unitCost - prod.directLaborCostPerUnit)
                                    : prod.unitCost;
                              const hasDlAdded =
                                prod.directLaborCostPerUnit !== undefined && prod.directLaborCostPerUnit > 0;
                              const currentDlValue = prod.directLaborCostPerUnit || 0;
                              const targetCombinedCost = Math.round((baseRaw + computedDl) * 100) / 100;

                              return (
                                <tr key={prod.id} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-semibold text-slate-800">
                                    {prod.name || 'Unnamed Product'}
                                  </td>
                                  <td className="p-2.5 text-right font-financial">
                                    {prod.year1Volume.toLocaleString()}
                                  </td>
                                  <td className="p-2.5 text-right font-financial text-slate-500">
                                    {volShare.toFixed(1)}%
                                  </td>
                                  <td className="p-2.5 text-right">
                                    {dlAllocationMode === 'custom' ? (
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={customDlPerUnit[prod.id] ?? computedDl}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setCustomDlPerUnit((prev) => ({
                                            ...prev,
                                            [prod.id]: val,
                                          }));
                                        }}
                                        className="w-20 font-financial text-right border border-indigo-300 rounded px-1.5 py-0.5 bg-indigo-50/40 text-indigo-900 font-bold"
                                      />
                                    ) : (
                                      <span className="font-financial font-bold text-indigo-700">
                                        {formatCurrency(computedDl, c)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-right font-financial text-slate-600">
                                    {formatCurrency(baseRaw, c)}
                                  </td>
                                  <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                    {formatCurrency(prod.unitCost, c)}
                                    {hasDlAdded && (
                                      <span className="block text-[9px] text-emerald-600 font-normal">
                                        includes {formatCurrency(currentDlValue, c)} DL
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-center">
                                    {hasDlAdded ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        DL Added
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                        Materials Only
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => addDlToProductCost(prod.id)}
                                        className="px-2 py-1 text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded transition"
                                        title={`Update unit cost in table to ${formatCurrency(targetCombinedCost, c)}`}
                                      >
                                        {hasDlAdded ? 'Re-add / Update' : '+ Add to Cost'}
                                      </button>
                                      {hasDlAdded && (
                                        <button
                                          type="button"
                                          onClick={() => removeDlFromProductCost(prod.id)}
                                          className="px-1.5 py-1 text-[11px] text-slate-400 hover:text-red-600 rounded transition"
                                          title="Reset to base raw materials only"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* 3. SEPARATE TABLE: INDIRECT LABOR                    */}
                {/* ---------------------------------------------------- */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-100 text-amber-700 rounded-lg">
                          <Briefcase className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Indirect Labor Headcount & Compensation (Production Support)
                        </h3>
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Factory Support
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supervisors, quality control / assurance (QA/QC), plant maintenance, warehouse crew, and factory hygiene staff.
                      </p>
                    </div>
                    <button
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

                  <p className="text-[11px] text-slate-400 italic">
                    * Accounting note: Indirect Labor is categorized as part of Factory Overhead and flows into Cost of Goods Sold (COGS).
                  </p>
                </div>

                {/* ---------------------------------------------------- */}
                {/* 4. FACTORY OVERHEAD (FOH) (General Plant Expenses)   */}
                {/* ---------------------------------------------------- */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Factory / Production Overhead (FOH)
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Indirect production materials, factory utilities, equipment repair & maintenance.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">
                        Year 1 Annual FOH ({c})
                      </label>
                      <input
                        type="number"
                        value={project.factoryOverheadAnnual}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadAnnual: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-financial font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">
                        Annual FOH Growth Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={project.factoryOverheadGrowthRate}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadGrowthRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-financial font-semibold"
                      />
                    </div>
                  </div>
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
