import { useState, useRef, useEffect } from 'react';
import {
  FeasibilityProject,
  PreOperatingExpenseItem,
  FixedAssetItem,
  ProductItem,
  DirectLaborItem,
  OperatingExpenseItem,
  DepreciationMethod,
  ProductCostComponent,
  CostComponentCategory,
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
  Layers,
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
  Copy,
  Box,
} from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculations';
import { LOCAL_BANKS, DEPRECIATION_METHODS } from '../data/bankList';

const COST_CATEGORIES: CostComponentCategory[] = [
  'Raw Materials & Ingredients',
  'Packaging & Containers',
  'Direct Consumables & Supplies',
  'Direct Labor Allocation',
  'Direct Overhead & Freight',
];

const COMMON_UNITS = [
  'pcs',
  'kg',
  'g',
  'L',
  'ml',
  'unit',
  'set',
  'pack',
  'dose',
  'serving',
  'portion',
  'lot',
  'roll',
  'box',
  'hrs',
];

const COMMON_PACKAGE_UNITS = [
  'box',
  'carton',
  'bag',
  'kg',
  'g',
  'L',
  'ml',
  'bottle',
  'can',
  'pack',
  'sleeve',
  'batch',
  'sack',
  'roll',
  'drum',
  'crate',
  'case',
  'tin',
  'jar',
  'tray',
  'pc',
];

interface AssumptionsEditorProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
}

type TabKey = 'capital' | 'sales' | 'directCosts' | 'opex' | 'workingCapital';

export default function AssumptionsEditor({ project, onUpdateProject }: AssumptionsEditorProps) {
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

  const updateOpex = (newItems: OperatingExpenseItem[]) => {
    onUpdateProject({ ...project, operatingExpenses: newItems });
  };

  // --- Product Cost Per Unit (BOM Breakdown) State & Helpers ---
  const [selectedCostProductId, setSelectedCostProductId] = useState<string>('');
  const [autoSyncCost, setAutoSyncCost] = useState<boolean>(true);
  const [costViewMode, setCostViewMode] = useState<'detail' | 'matrix'>('detail');

  // Horizontal Product Selection Carousel Scroll State & Ref
  const productScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkProductScroll = () => {
    if (productScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = productScrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkProductScroll();
    const el = productScrollRef.current;
    if (!el) return;
    const handleScroll = () => checkProductScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [project.products]);

  const scrollProducts = (direction: 'left' | 'right') => {
    if (productScrollRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      productScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkProductScroll, 250);
    }
  };

  const activeCostProduct =
    project.products.find((p) => p.id === selectedCostProductId) ||
    project.products[0];

  // Helper to compute unit cost from component settings
  const computeItemTotalCost = (c: Partial<ProductCostComponent>): number => {
    if (c.costMode === 'package_yield') {
      const pCost = Math.max(0, Number(c.purchaseCost) || 0);
      const pQty = Math.max(0.0001, Number(c.packageQuantity) || 1);
      const yUnits = Math.max(0.0001, Number(c.yieldUnits) || 1);
      return Math.round(((pCost * pQty) / yUnits) * 100) / 100;
    } else {
      const q = Math.max(0, Number(c.quantity) || 0);
      const u = Math.max(0, Number(c.unitCost) || 0);
      return Math.round(q * u * 100) / 100;
    }
  };

  const updateProductCostBreakdown = (
    productId: string,
    newComponents: ProductCostComponent[],
    forceSync: boolean = false
  ) => {
    const updatedProducts = project.products.map((prod) => {
      if (prod.id !== productId) return prod;
      const sumCost = newComponents.reduce(
        (acc, c) => acc + (c.totalCost !== undefined ? Number(c.totalCost) : computeItemTotalCost(c)),
        0
      );
      const roundedCost = Math.round(sumCost * 100) / 100;
      return {
        ...prod,
        costBreakdown: newComponents,
        unitCost: autoSyncCost || forceSync ? roundedCost : prod.unitCost,
      };
    });
    updateProducts(updatedProducts);
  };

  const addCostComponent = (
    productId: string,
    mode: 'package_yield' | 'direct_unit' = 'package_yield'
  ) => {
    const target = project.products.find((p) => p.id === productId);
    if (!target) return;
    const existing = target.costBreakdown || [];

    const newComponent: ProductCostComponent =
      mode === 'package_yield'
        ? {
            id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            category: 'Raw Materials & Ingredients',
            name: '',
            costMode: 'package_yield',
            purchaseCost: 0,
            packageUnit: 'unit',
            packageQuantity: 1,
            yieldUnits: 1,
            quantity: 1,
            unit: 'unit',
            unitCost: 0,
            totalCost: 0,
          }
        : {
            id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            category: 'Raw Materials & Ingredients',
            name: '',
            costMode: 'direct_unit',
            quantity: 1,
            unit: 'unit',
            unitCost: 0,
            totalCost: 0,
          };

    updateProductCostBreakdown(productId, [...existing, newComponent]);
  };

  const duplicateCostComponent = (productId: string, compIndex: number) => {
    const target = project.products.find((p) => p.id === productId);
    if (!target) return;
    const existing = [...(target.costBreakdown || [])];
    if (!existing[compIndex]) return;
    const orig = existing[compIndex];
    const dup: ProductCostComponent = {
      ...orig,
      id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: `${orig.name} (Copy)`,
    };
    existing.splice(compIndex + 1, 0, dup);
    updateProductCostBreakdown(productId, existing);
  };

  const editCostComponent = (
    productId: string,
    compIndex: number,
    field: keyof ProductCostComponent,
    value: any
  ) => {
    const target = project.products.find((p) => p.id === productId);
    if (!target) return;
    const existing = [...(target.costBreakdown || [])];
    if (!existing[compIndex]) return;

    const item = { ...existing[compIndex] };

    if (field === 'costMode') {
      const mode = value as 'package_yield' | 'direct_unit';
      item.costMode = mode;
      if (mode === 'package_yield') {
        if (!item.purchaseCost) item.purchaseCost = item.unitCost || 120;
        if (!item.yieldUnits) item.yieldUnits = 10;
        if (!item.packageQuantity) item.packageQuantity = 1;
        if (!item.packageUnit) item.packageUnit = item.unit || 'box';
        item.totalCost = computeItemTotalCost(item);
        item.quantity = Math.round(((item.packageQuantity || 1) / (item.yieldUnits || 1)) * 1000) / 1000;
        item.unitCost = item.purchaseCost;
      } else {
        item.quantity = item.quantity || 1;
        item.unit = item.unit || 'pc';
        item.unitCost = item.totalCost || item.purchaseCost || 10;
        item.totalCost = computeItemTotalCost(item);
      }
    } else {
      (item as any)[field] = value;
      if (
        field === 'purchaseCost' ||
        field === 'packageQuantity' ||
        field === 'yieldUnits' ||
        field === 'quantity' ||
        field === 'unitCost'
      ) {
        if (item.costMode === 'package_yield') {
          const pCost = Math.max(0, parseFloat(item.purchaseCost as any) || 0);
          const pQty = Math.max(0.0001, parseFloat(item.packageQuantity as any) || 1);
          const yUnits = Math.max(0.0001, parseFloat(item.yieldUnits as any) || 1);
          const computed = Math.round(((pCost * pQty) / yUnits) * 100) / 100;
          item.purchaseCost = pCost;
          item.packageQuantity = pQty;
          item.yieldUnits = yUnits;
          item.totalCost = computed;
          item.quantity = Math.round((pQty / yUnits) * 10000) / 10000;
          item.unitCost = pCost;
        } else {
          const q = Math.max(0, parseFloat(item.quantity as any) || 0);
          const u = Math.max(0, parseFloat(item.unitCost as any) || 0);
          item.quantity = q;
          item.unitCost = u;
          item.totalCost = Math.round(q * u * 100) / 100;
        }
      }
    }

    existing[compIndex] = item;
    updateProductCostBreakdown(productId, existing);
  };

  const deleteCostComponent = (productId: string, compIndex: number) => {
    const target = project.products.find((p) => p.id === productId);
    if (!target) return;
    const existing = (target.costBreakdown || []).filter((_, i) => i !== compIndex);
    updateProductCostBreakdown(productId, existing);
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

                    {/* Batch Method Selector */}
                    {project.fixedAssets.length > 1 && (
                      <div className="mb-2.5 px-3 py-1.5 bg-slate-100/80 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                        <span className="font-medium">Quick set all assets method:</span>
                        <div className="flex flex-wrap items-center gap-1">
                          {DEPRECIATION_METHODS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                const copy = project.fixedAssets.map((a) => ({
                                  ...a,
                                  depreciationMethod: m.id as DepreciationMethod,
                                }));
                                updateFixedAssets(copy);
                              }}
                              className="px-2 py-0.5 rounded bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition"
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

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
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950 mb-1">
                      Financing Mix & Initial Working Capital Buffer
                    </h3>
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
                                  copy[idx].unitCost = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
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

                {/* -------------------------------------------------------------------------------- */}
                {/* PORTION: PRODUCT UNIT COST BREAKDOWN & BILL OF MATERIALS (BOM) CALCULATOR         */}
                {/* -------------------------------------------------------------------------------- */}
                <div className="mt-8 pt-6 border-t border-slate-200/90 space-y-4">
                  {/* Portion Header & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                          <Calculator className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Cost Per Unit Analysis & Breakdown (Products Sold)
                        </h3>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Unit COGS
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Deconstruct and determine the exact Cost per Unit of different products sold from raw materials, packaging, direct supplies, and direct overhead.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Mode Toggle: Itemized Breakdown vs Comparison Matrix */}
                      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
                        <button
                          onClick={() => setCostViewMode('detail')}
                          className={`px-3 py-1 font-medium rounded-md transition ${
                            costViewMode === 'detail'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Itemized Calculator
                        </button>
                        <button
                          onClick={() => setCostViewMode('matrix')}
                          className={`px-3 py-1 font-medium rounded-md transition ${
                            costViewMode === 'matrix'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All Products Matrix
                        </button>
                      </div>

                      {/* Auto-sync Toggle */}
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:border-indigo-300 transition">
                        <input
                          type="checkbox"
                          checked={autoSyncCost}
                          onChange={(e) => setAutoSyncCost(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="text-[11px] font-medium">Auto-sync with Table</span>
                      </label>
                    </div>
                  </div>

                  {project.products.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Please add at least one product above to calculate its cost per unit.
                    </div>
                  ) : costViewMode === 'matrix' ? (
                    /* ALL PRODUCTS COST MATRIX VIEW */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Unit Cost Structure & Margin Summary Matrix
                        </h4>
                        <span className="text-xs text-slate-500">
                          {project.products.length} Products Defined
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Product Name</th>
                              <th className="p-3 text-right">Selling Price ({c})</th>
                              <th className="p-3 text-right">Raw Materials</th>
                              <th className="p-3 text-right">Packaging</th>
                              <th className="p-3 text-right">Supplies & Other</th>
                              <th className="p-3 text-right font-bold text-slate-900">Total Unit Cost ({c})</th>
                              <th className="p-3 text-right">Unit Margin ({c})</th>
                              <th className="p-3 text-right">Gross Margin %</th>
                              <th className="p-3 text-right">Markup %</th>
                              <th className="p-3 text-right">Year 1 Volume</th>
                              <th className="p-3 text-right">Yr 1 Direct Cost</th>
                              <th className="p-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {project.products.map((p) => {
                              const comps = p.costBreakdown || [];
                              const getCompVal = (item: ProductCostComponent) =>
                                item.totalCost !== undefined ? Number(item.totalCost) || 0 : computeItemTotalCost(item);

                              const rmCost = comps
                                .filter((item) => item.category === 'Raw Materials & Ingredients')
                                .reduce((s, item) => s + getCompVal(item), 0);
                              const packCost = comps
                                .filter((item) => item.category === 'Packaging & Containers')
                                .reduce((s, item) => s + getCompVal(item), 0);
                              const otherCost = comps
                                .filter(
                                  (item) =>
                                    item.category !== 'Raw Materials & Ingredients' &&
                                    item.category !== 'Packaging & Containers'
                                )
                                .reduce((s, item) => s + getCompVal(item), 0);

                              const computedCost =
                                comps.length > 0
                                  ? Math.round((rmCost + packCost + otherCost) * 100) / 100
                                  : p.unitCost;
                              const effectiveCost = p.unitCost > 0 ? p.unitCost : computedCost;
                              const unitMargin = p.unitPrice - effectiveCost;
                              const marginPct = p.unitPrice > 0 ? (unitMargin / p.unitPrice) * 100 : 0;
                              const markupPct = effectiveCost > 0 ? (unitMargin / effectiveCost) * 100 : 0;
                              const yr1TotalDirectCost = effectiveCost * p.year1Volume;

                              return (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-semibold text-slate-800">
                                    <div className="flex items-center gap-1.5">
                                      <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <span>{p.name}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right font-financial font-medium text-slate-900">
                                    {formatCurrency(p.unitPrice, c)}
                                  </td>
                                  <td className="p-3 text-right font-financial text-slate-600">
                                    {comps.length > 0 ? formatCurrency(rmCost, c) : '-'}
                                  </td>
                                  <td className="p-3 text-right font-financial text-slate-600">
                                    {comps.length > 0 ? formatCurrency(packCost, c) : '-'}
                                  </td>
                                  <td className="p-3 text-right font-financial text-slate-600">
                                    {comps.length > 0 ? formatCurrency(otherCost, c) : '-'}
                                  </td>
                                  <td className="p-3 text-right font-financial font-bold text-indigo-950">
                                    {formatCurrency(effectiveCost, c)}
                                  </td>
                                  <td className="p-3 text-right font-financial text-emerald-700 font-semibold">
                                    {formatCurrency(unitMargin, c)}
                                  </td>
                                  <td className="p-3 text-right font-financial font-medium">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                        marginPct >= 50
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : marginPct >= 25
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}
                                    >
                                      {marginPct.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-financial text-slate-600">
                                    {markupPct.toFixed(1)}%
                                  </td>
                                  <td className="p-3 text-right font-financial text-slate-700">
                                    {p.year1Volume.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-right font-financial font-bold text-slate-900">
                                    {formatCurrency(yr1TotalDirectCost, c)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => {
                                        setSelectedCostProductId(p.id);
                                        setCostViewMode('detail');
                                      }}
                                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-medium transition inline-flex items-center gap-1"
                                    >
                                      Edit Cost <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* ITEMIZED BREAKDOWN CALCULATOR VIEW */
                    <div className="space-y-4">
                      {project.products.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                          <Box className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <h4 className="text-sm font-semibold text-slate-700">No Products Added Yet</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Add a product in the Sales Volume &amp; Revenue Streams table above to start itemizing raw materials and direct unit costs.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Product Selector with Horizontal Scroll & Navigation Controls */}
                          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                              <Box className="w-3.5 h-3.5 text-indigo-600" />
                              Select Product to Cost ({project.products.length})
                            </span>
                            <span className="text-[11px] text-slate-400">
                              • Scroll horizontally or use arrows
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Quick Jump Dropdown */}
                            <select
                              value={activeCostProduct?.id || ''}
                              onChange={(e) => {
                                setSelectedCostProductId(e.target.value);
                                const targetBtn = document.getElementById(`prod-chip-${e.target.value}`);
                                targetBtn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                              }}
                              className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-medium focus:outline-indigo-500"
                            >
                              {project.products.map((p, idx) => (
                                <option key={p.id} value={p.id}>
                                  #{idx + 1}: {p.name} ({formatCurrency(p.unitPrice, c)})
                                </option>
                              ))}
                            </select>

                            {/* Scroll Navigation Buttons */}
                            <div className="flex items-center gap-1 border border-slate-200 rounded-md bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() => scrollProducts('left')}
                                disabled={!canScrollLeft}
                                title="Scroll products left"
                                className={`p-1 rounded transition ${
                                  canScrollLeft
                                    ? 'text-slate-700 hover:bg-slate-100'
                                    : 'text-slate-300 cursor-not-allowed'
                                }`}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => scrollProducts('right')}
                                disabled={!canScrollRight}
                                title="Scroll products right"
                                className={`p-1 rounded transition ${
                                  canScrollRight
                                    ? 'text-slate-700 hover:bg-slate-100'
                                    : 'text-slate-300 cursor-not-allowed'
                                }`}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Product Chips Carousel */}
                        <div
                          ref={productScrollRef}
                          onWheel={(e) => {
                            if (e.deltaY !== 0 && productScrollRef.current) {
                              productScrollRef.current.scrollLeft += e.deltaY;
                            }
                          }}
                          className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                          style={{ scrollbarWidth: 'thin' }}
                        >
                          {project.products.map((prod) => {
                            const isSelected = prod.id === (activeCostProduct?.id || project.products[0]?.id);
                            const comps = prod.costBreakdown || [];
                            const calcTotal = comps.reduce(
                              (s, item) =>
                                s +
                                (item.totalCost !== undefined
                                  ? Number(item.totalCost) || 0
                                  : computeItemTotalCost(item)),
                              0
                            );
                            const effectiveCost = Math.round(calcTotal * 100) / 100;
                            const isDiff = comps.length > 0 && Math.abs(prod.unitCost - effectiveCost) > 0.01;

                            return (
                              <button
                                key={prod.id}
                                id={`prod-chip-${prod.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedCostProductId(prod.id);
                                  const targetBtn = document.getElementById(`prod-chip-${prod.id}`);
                                  targetBtn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                }}
                                className={`group px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition border shrink-0 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                              >
                                <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                <span className="font-bold">{prod.name}</span>
                                <div className="flex items-center gap-1 text-[10px]">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-financial ${
                                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    Price: {formatCurrency(prod.unitPrice, c)}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-financial font-bold ${
                                      isSelected
                                        ? 'bg-indigo-800 text-white'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                    }`}
                                  >
                                    Cost: {formatCurrency(effectiveCost > 0 ? effectiveCost : prod.unitCost, c)}
                                  </span>
                                </div>
                                {isDiff && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-amber-400"
                                    title="Calculated breakdown differs from table cost"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {activeCostProduct && (() => {
                        const comps = activeCostProduct.costBreakdown || [];
                        const calcTotal = comps.reduce(
                          (s, item) =>
                            s +
                            (item.totalCost !== undefined
                              ? Number(item.totalCost) || 0
                              : computeItemTotalCost(item)),
                          0
                        );
                        const effectiveCalcCost = Math.round(calcTotal * 100) / 100;
                        const isDiff = comps.length > 0 && Math.abs(activeCostProduct.unitCost - effectiveCalcCost) > 0.01;
                        const unitMargin = activeCostProduct.unitPrice - (comps.length > 0 ? effectiveCalcCost : activeCostProduct.unitCost);
                        const marginPct =
                          activeCostProduct.unitPrice > 0
                            ? (unitMargin / activeCostProduct.unitPrice) * 100
                            : 0;
                        const activeCostBase = comps.length > 0 ? effectiveCalcCost : activeCostProduct.unitCost;
                        const costToPrice =
                          activeCostProduct.unitPrice > 0
                            ? (activeCostBase / activeCostProduct.unitPrice) * 100
                            : 0;
                        const markupPct =
                          activeCostBase > 0 ? (unitMargin / activeCostBase) * 100 : 0;

                        // Category subtotals
                        const catSubtotals = COST_CATEGORIES.map((cat) => {
                          const total = comps
                            .filter((item) => item.category === cat)
                            .reduce(
                              (s, item) =>
                                s +
                                (item.totalCost !== undefined
                                  ? Number(item.totalCost) || 0
                                  : computeItemTotalCost(item)),
                              0
                            );
                          return {
                            category: cat,
                            total: Math.round(total * 100) / 100,
                            pct: effectiveCalcCost > 0 ? (total / effectiveCalcCost) * 100 : 0,
                          };
                        }).filter((cat) => cat.total > 0);

                        return (
                          <div className="bg-white border border-indigo-200/80 rounded-xl p-4 shadow-2xs space-y-4">
                            {/* Selected Product Title Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-50 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {activeCostProduct.name}
                                  </h4>
                                  <span className="text-[11px] font-medium text-slate-500">
                                    (Expected Volume: {activeCostProduct.year1Volume.toLocaleString()} units/yr)
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Raw materials, package yield, containers, packaging, and direct supplies required per unit of finished product sold.
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => addCostComponent(activeCostProduct.id, 'package_yield')}
                                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1 transition shadow-xs"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Raw Material (Yield)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => addCostComponent(activeCostProduct.id, 'direct_unit')}
                                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Direct Item
                                </button>
                              </div>
                            </div>

                            {/* 4 Key Metric Cards for Unit Cost Analysis */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              {/* Card 1: Selling Price */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                                  Selling Price / Unit
                                </span>
                                <div className="text-lg font-bold font-financial text-slate-900 mt-0.5">
                                  {formatCurrency(activeCostProduct.unitPrice, c)}
                                </div>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  From Revenue Table
                                </span>
                              </div>

                              {/* Card 2: Derived Total Cost Per Unit */}
                              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3">
                                <span className="text-[11px] font-semibold text-indigo-900 block uppercase flex items-center justify-between">
                                  <span>Calculated Cost / Unit</span>
                                  {comps.length > 0 && !isDiff && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Synced
                                    </span>
                                  )}
                                </span>
                                <div className="text-lg font-bold font-financial text-indigo-950 mt-0.5">
                                  {comps.length > 0
                                    ? formatCurrency(effectiveCalcCost, c)
                                    : formatCurrency(activeCostProduct.unitCost, c)}
                                </div>
                                <span className="text-[10px] text-indigo-700/80 block mt-0.5 font-medium">
                                  {comps.length > 0
                                    ? `${comps.length} raw materials & items`
                                    : 'Single lumped estimate'}
                                </span>
                              </div>

                              {/* Card 3: Unit Gross Profit (Margin) */}
                              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                                <span className="text-[11px] font-semibold text-emerald-900 block uppercase">
                                  Unit Gross Profit (Margin)
                                </span>
                                <div className="text-lg font-bold font-financial text-emerald-800 mt-0.5">
                                  {formatCurrency(unitMargin, c)}
                                </div>
                                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                                  {marginPct.toFixed(1)}% Gross Margin
                                </span>
                              </div>

                              {/* Card 4: Markup & Cost Ratio */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                                  Cost Ratio & Markup
                                </span>
                                <div className="text-lg font-bold font-financial text-slate-800 mt-0.5">
                                  {costToPrice.toFixed(1)}% <span className="text-xs font-normal text-slate-500 font-sans">of price</span>
                                </div>
                                <span className="text-[10px] text-slate-600 block mt-0.5 font-medium">
                                  Markup: {markupPct.toFixed(1)}% on cost
                                </span>
                              </div>
                            </div>


                            {/* Discrepancy / Sync Alert Banner */}
                            {isDiff && (
                              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>
                                    The Revenue Streams table currently uses{' '}
                                    <strong>{formatCurrency(activeCostProduct.unitCost, c)}</strong>, while
                                    this itemized breakdown totals{' '}
                                    <strong>{formatCurrency(effectiveCalcCost, c)}</strong>.
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateProductCostBreakdown(activeCostProduct.id, comps, true)
                                  }
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition shadow-2xs"
                                >
                                  <RefreshCw className="w-3 h-3" /> Sync {formatCurrency(effectiveCalcCost, c)} to Product Direct Cost
                                </button>
                              </div>
                            )}

                            {/* Itemized Raw Materials & Cost Components Table */}
                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                  <tr>
                                    <th className="p-2.5 w-44">Category</th>
                                    <th className="p-2.5 min-w-[180px]">Raw Material / Component Description</th>
                                    <th className="p-2.5 w-36 text-center">Costing Method</th>
                                    <th className="p-2.5 min-w-[280px]">Purchase Cost, Yield & Formula</th>
                                    <th className="p-2.5 text-right font-bold text-slate-900 w-36">
                                      Cost / Unit Sold ({c})
                                    </th>
                                    <th className="p-2.5 text-right w-24">Share %</th>
                                    <th className="p-2.5 text-center w-20">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {comps.length === 0 ? (
                                    <tr>
                                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                        <div className="max-w-md mx-auto space-y-2">
                                          <Box className="w-8 h-8 text-slate-300 mx-auto" />
                                          <p className="text-slate-600 font-medium">No raw materials or components defined for {activeCostProduct.name || 'this product'}.</p>
                                          <p className="text-[11px] text-slate-400">
                                            Click &ldquo;Add Raw Material (Yield)&rdquo; or &ldquo;Add Direct Item&rdquo; to calculate the exact cost per unit.
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                                    comps.map((comp, cIdx) => {
                                      const isYieldMode = comp.costMode === 'package_yield';
                                      const totalItemCost =
                                        comp.totalCost !== undefined
                                          ? Number(comp.totalCost) || 0
                                          : computeItemTotalCost(comp);
                                      const sharePct =
                                        effectiveCalcCost > 0
                                          ? (totalItemCost / effectiveCalcCost) * 100
                                          : 0;

                                      return (
                                        <tr key={comp.id || cIdx} className="hover:bg-slate-50/70 transition">
                                          {/* Category Selection */}
                                          <td className="p-2.5 align-top">
                                            <select
                                              value={comp.category}
                                              onChange={(e) =>
                                                editCostComponent(
                                                  activeCostProduct.id,
                                                  cIdx,
                                                  'category',
                                                  e.target.value as CostComponentCategory
                                                )
                                              }
                                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-indigo-500"
                                            >
                                              {COST_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>
                                                  {cat}
                                                </option>
                                              ))}
                                            </select>
                                          </td>

                                          {/* Name / Description */}
                                          <td className="p-2.5 align-top">
                                            <input
                                              type="text"
                                              value={comp.name}
                                              onChange={(e) =>
                                                editCostComponent(
                                                  activeCostProduct.id,
                                                  cIdx,
                                                  'name',
                                                  e.target.value
                                                )
                                              }
                                              className="w-full font-medium text-slate-800 border border-slate-200 hover:border-slate-300 rounded-md px-2 py-1.5 focus:border-indigo-500 focus:outline-none"
                                              placeholder="e.g. Raw Material, Packaging, Ingredient, Supplies..."
                                            />
                                          </td>

                                          {/* Costing Method Toggle */}
                                          <td className="p-2.5 align-top text-center">
                                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  editCostComponent(
                                                    activeCostProduct.id,
                                                    cIdx,
                                                    'costMode',
                                                    'package_yield'
                                                  )
                                                }
                                                className={`px-2 py-1 font-semibold rounded-md transition ${
                                                  isYieldMode
                                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                                    : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                                title="Package / Bulk purchase divided by units produced (e.g. 1 box yields 10 units)"
                                              >
                                                📦 Package Yield
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  editCostComponent(
                                                    activeCostProduct.id,
                                                    cIdx,
                                                    'costMode',
                                                    'direct_unit'
                                                  )
                                                }
                                                className={`px-2 py-1 font-semibold rounded-md transition ${
                                                  !isYieldMode
                                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                                    : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                                title="Direct cost per single unit consumed"
                                              >
                                                📏 Direct Unit
                                              </button>
                                            </div>
                                          </td>

                                          {/* Pricing & Yield Inputs */}
                                          <td className="p-2.5 align-top">
                                            {isYieldMode ? (
                                              <div className="space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
                                                  {/* Package Purchase Cost */}
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-[11px] text-slate-500 font-medium">Cost:</span>
                                                    <div className="relative">
                                                      <span className="absolute left-1.5 top-1.5 text-[11px] text-slate-400 font-financial">
                                                        {c}
                                                      </span>
                                                      <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        value={comp.purchaseCost ?? comp.unitCost ?? 120}
                                                        onChange={(e) =>
                                                          editCostComponent(
                                                            activeCostProduct.id,
                                                            cIdx,
                                                            'purchaseCost',
                                                            e.target.value
                                                          )
                                                        }
                                                        className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-1 pl-4 text-xs font-semibold text-slate-900 focus:outline-indigo-500"
                                                        placeholder="120"
                                                        title="Purchase cost of the bulk container/package"
                                                      />
                                                    </div>
                                                  </div>

                                                  {/* Package Unit */}
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-[11px] text-slate-500">per</span>
                                                    <input
                                                      type="text"
                                                      list={`pkg-units-${activeCostProduct.id}`}
                                                      value={comp.packageUnit || comp.unit || 'box'}
                                                      onChange={(e) =>
                                                        editCostComponent(
                                                          activeCostProduct.id,
                                                          cIdx,
                                                          'packageUnit',
                                                          e.target.value
                                                        )
                                                      }
                                                      className="w-16 text-center border border-slate-200 rounded px-1 py-1 text-xs text-slate-700 font-medium"
                                                      placeholder="box"
                                                      title="Packaging unit (e.g. box, bag, carton, bottle, kg)"
                                                    />
                                                    <datalist id={`pkg-units-${activeCostProduct.id}`}>
                                                      {COMMON_PACKAGE_UNITS.map((u) => (
                                                        <option key={u} value={u} />
                                                      ))}
                                                    </datalist>
                                                  </div>

                                                  {/* Yield in Finished Units */}
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-[11px] text-slate-500">produces</span>
                                                    <input
                                                      type="number"
                                                      step="any"
                                                      min="0.0001"
                                                      value={comp.yieldUnits || 10}
                                                      onChange={(e) =>
                                                        editCostComponent(
                                                          activeCostProduct.id,
                                                          cIdx,
                                                          'yieldUnits',
                                                          e.target.value
                                                        )
                                                      }
                                                      className="w-16 font-financial text-center border border-slate-200 rounded px-1 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50/50 focus:outline-indigo-500"
                                                      placeholder="10"
                                                      title="How many units of the finished product 1 package produces"
                                                    />
                                                    <span className="text-[11px] text-slate-600 font-medium">units</span>
                                                  </div>
                                                </div>

                                                {/* Live Formula Display Pill */}
                                                <div className="flex items-center gap-1.5 text-[11px] text-indigo-900 bg-indigo-50/70 border border-indigo-100 rounded px-2 py-0.5 w-fit font-mono">
                                                  <span>
                                                    {formatCurrency(comp.purchaseCost ?? comp.unitCost ?? 120, c)} ÷ {comp.yieldUnits || 10} =
                                                  </span>
                                                  <span className="font-bold text-indigo-950">
                                                    {formatCurrency(totalItemCost, c)} / unit
                                                  </span>
                                                </div>
                                              </div>
                                            ) : (
                                              /* Direct Unit Input Mode */
                                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[11px] text-slate-500">Qty:</span>
                                                  <input
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    value={comp.quantity}
                                                    onChange={(e) =>
                                                      editCostComponent(
                                                        activeCostProduct.id,
                                                        cIdx,
                                                        'quantity',
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-1 text-xs"
                                                  />
                                                </div>

                                                <div className="flex items-center gap-1">
                                                  <input
                                                    type="text"
                                                    list={`units-list-${activeCostProduct.id}`}
                                                    value={comp.unit}
                                                    onChange={(e) =>
                                                      editCostComponent(
                                                        activeCostProduct.id,
                                                        cIdx,
                                                        'unit',
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-14 text-center border border-slate-200 rounded px-1 py-1 text-xs text-slate-700"
                                                    placeholder="pc"
                                                  />
                                                  <datalist id={`units-list-${activeCostProduct.id}`}>
                                                    {COMMON_UNITS.map((u) => (
                                                      <option key={u} value={u} />
                                                    ))}
                                                  </datalist>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                  <span className="text-[11px] text-slate-500">@</span>
                                                  <div className="relative">
                                                    <span className="absolute left-1.5 top-1.5 text-[11px] text-slate-400 font-financial">
                                                      {c}
                                                    </span>
                                                    <input
                                                      type="number"
                                                      step="any"
                                                      min="0"
                                                      value={comp.unitCost}
                                                      onChange={(e) =>
                                                        editCostComponent(
                                                          activeCostProduct.id,
                                                          cIdx,
                                                          'unitCost',
                                                          e.target.value
                                                        )
                                                      }
                                                      className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-1 pl-4 text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </td>

                                          {/* Calculated Total Cost per Finished Unit */}
                                          <td className="p-2.5 text-right font-financial font-bold text-slate-900 text-sm align-top">
                                            <div className="bg-slate-50 border border-slate-200/80 rounded px-2 py-1 text-right inline-block">
                                              {formatCurrency(totalItemCost, c)}
                                            </div>
                                          </td>

                                          {/* Share % */}
                                          <td className="p-2.5 text-right font-financial text-slate-500 align-top">
                                            <div className="flex items-center justify-end gap-1.5 pt-1">
                                              <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                  className="bg-indigo-600 h-1.5 rounded-full"
                                                  style={{ width: `${Math.min(100, Math.max(0, sharePct))}%` }}
                                                />
                                              </div>
                                              <span className="w-9 text-right text-[11px] font-medium">
                                                {sharePct.toFixed(0)}%
                                              </span>
                                            </div>
                                          </td>

                                          {/* Actions */}
                                          <td className="p-2.5 text-center align-top">
                                            <div className="flex items-center justify-center gap-1 pt-0.5">
                                              <button
                                                type="button"
                                                onClick={() => duplicateCostComponent(activeCostProduct.id, cIdx)}
                                                className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition"
                                                title="Duplicate raw material"
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => deleteCostComponent(activeCostProduct.id, cIdx)}
                                                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition"
                                                title="Delete raw material"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>

                                {/* Subtotals & Category Summary Footer */}
                                {comps.length > 0 && (
                                  <tfoot className="bg-slate-50/90 font-semibold border-t border-slate-200">
                                    <tr className="acc-subtotal">
                                      <td colSpan={4} className="p-3 font-bold text-slate-900">
                                        <div className="flex items-center justify-between">
                                          <span>Total Direct Cost per Unit Sold ({activeCostProduct.name})</span>
                                          <span className="text-xs font-normal text-slate-500">
                                            Sum of all raw materials, packaging & direct supplies
                                          </span>
                                        </div>
                                      </td>
                                      <td className="p-3 text-right font-financial font-bold text-indigo-950 text-base">
                                        {formatCurrency(effectiveCalcCost, c)}
                                      </td>
                                      <td className="p-3 text-right font-financial font-bold text-indigo-950">
                                        100%
                                      </td>
                                      <td className="p-3"></td>
                                    </tr>
                                  </tfoot>
                                )}
                              </table>
                            </div>

                            {/* Action Bar Below Table */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => addCostComponent(activeCostProduct.id, 'package_yield')}
                                  className="px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold flex items-center gap-1.5 transition"
                                >
                                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                  Add Raw Material (Package Yield)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => addCostComponent(activeCostProduct.id, 'direct_unit')}
                                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Direct Cost Item (Unit Usage)
                                </button>

                              </div>

                              <div className="text-xs text-slate-500 font-medium">
                                Direct Margin:{' '}
                                <strong className="text-emerald-700 font-financial">
                                  {formatCurrency(unitMargin, c)}
                                </strong>{' '}
                                ({marginPct.toFixed(1)}%)
                              </div>
                            </div>

                            {/* Category Distribution Pills Footer */}
                            {catSubtotals.length > 0 && (
                              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="font-semibold text-slate-700">Cost Breakdown by Category:</span>
                                  {catSubtotals.map((cat) => (
                                    <span key={cat.category} className="inline-flex items-center gap-1 text-[11px]">
                                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                                      <strong>{cat.category}:</strong> {formatCurrency(cat.total, c)} ({cat.pct.toFixed(0)}%)
                                    </span>
                                  ))}
                                </div>
                                <div className="text-[11px] font-bold text-indigo-900">
                                  Annual Yr 1 Direct Cost:{' '}
                                  <span className="font-financial">
                                    {formatCurrency(effectiveCalcCost * activeCostProduct.year1Volume, c)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
                </div>
              </div>
            )}

            {/* TAB 3: DIRECT LABOR & PRODUCTION OVERHEAD */}
            {activeTab === 'directCosts' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Direct Labor Headcount & Compensation
                      </h3>
                      <p className="text-xs text-slate-500">
                        Production or service staff directly involved in delivering the goods/services.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        updateDirectLabor([
                          ...project.directLabor,
                          {
                            id: `dl-${Date.now()}`,
                            role: 'Technician / Crew',
                            headcount: 1,
                            monthlyWage: 18000,
                            monthsPerYear: 13,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Staff Role
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
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {project.directLabor.map((lab, idx) => {
                          const annual = lab.monthlyWage * lab.monthsPerYear * lab.headcount;
                          return (
                            <tr key={lab.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={lab.role}
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

                {/* Factory Overhead */}
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
