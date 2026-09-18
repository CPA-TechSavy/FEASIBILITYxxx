import { useState, useMemo } from 'react';
import {
  FeasibilityProject,
  ProductItem,
  ProductCostComponent,
  CostComponentCategory,
} from '../types';
import { formatCurrency, formatPercent, calculateDepreciation, calculateYear1FactoryOverhead } from '../utils/financialCalculations';
import { SAMPLE_BOM_PRESETS } from '../data/bomPresets';
import {
  Calculator,
  Plus,
  Trash2,
  Package,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  Layers,
  HelpCircle,
  RotateCcw,
  Check,
  Copy,
  X,
  Factory,
} from 'lucide-react';

interface ProductCostingTabProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  onNavigateToTab: (
    tab:
      | 'capital'
      | 'sales'
      | 'costing'
      | 'directCosts'
      | 'factoryOverhead'
      | 'nonManufacturing'
      | 'opex'
      | 'workingCapital'
  ) => void;
}

const COMPONENT_CATEGORIES: CostComponentCategory[] = [
  'Raw Materials & Ingredients',
  'Packaging & Containers',
  'Direct Consumables & Supplies',
  'Direct Overhead & Freight',
  'Direct Labor Allocation',
];

export default function ProductCostingTab({
  project,
  onUpdateProject,
  onNavigateToTab,
}: ProductCostingTabProps) {
  const c = project.currency;

  // Selected product ID for detailed costing
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    return project.products[0]?.id || '';
  });

  // Keep selectedProductId valid if products change
  const activeProduct: ProductItem | null = useMemo(() => {
    if (project.products.length === 0) return null;
    const found = project.products.find((p) => p.id === selectedProductId);
    return found || project.products[0];
  }, [project.products, selectedProductId]);

  // Feedback notifications
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Other available products in study to copy from (Requirement 2)
  const availableSourceProducts: ProductItem[] = useMemo(() => {
    if (!activeProduct) return [];
    return project.products.filter((p) => p.id !== activeProduct.id);
  }, [project.products, activeProduct]);

  // Copy modal states
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceProductId, setCopySourceProductId] = useState<string>('');
  const [copyMode, setCopyMode] = useState<'replace' | 'append'>('replace');

  // Selected source product for modal (can be ANY other product)
  const selectedSourceProduct: ProductItem | null = useMemo(() => {
    if (availableSourceProducts.length === 0) return null;
    const found = availableSourceProducts.find((p) => p.id === copySourceProductId);
    return found || availableSourceProducts[0];
  }, [availableSourceProducts, copySourceProductId]);

  // Helper to retrieve raw material & BOM components from any product
  const getSourceComponents = (sourceProd: ProductItem): ProductCostComponent[] => {
    if (sourceProd.costBreakdown && sourceProd.costBreakdown.length > 0) {
      return sourceProd.costBreakdown;
    }
    const flatCost =
      sourceProd.rawMaterialsCostPerUnit !== undefined
        ? sourceProd.rawMaterialsCostPerUnit
        : Math.max(
            0,
            sourceProd.unitCost -
              (sourceProd.directLaborCostPerUnit || 0) -
              (sourceProd.factoryOverheadCostPerUnit || 0)
          );
    if (flatCost > 0) {
      return [
        {
          id: `comp-flat-${sourceProd.id}`,
          category: 'Raw Materials & Ingredients',
          name: `${sourceProd.name} Direct Materials`,
          costMode: 'direct_unit',
          quantity: 1,
          unit: 'unit',
          unitCost: flatCost,
          totalCost: flatCost,
        },
      ];
    }
    return [];
  };

  const handleOpenCopyModal = (preselectedSourceId?: string) => {
    if (availableSourceProducts.length === 0) {
      showFeedback('No other products available in the study to copy from. Add another product first.');
      return;
    }
    const initialSourceId =
      preselectedSourceId ||
      (copySourceProductId && availableSourceProducts.some((p) => p.id === copySourceProductId)
        ? copySourceProductId
        : availableSourceProducts[0].id);

    setCopySourceProductId(initialSourceId);
    setCopyMode(activeMaterialsBreakdown.length > 0 ? 'replace' : 'replace');
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = () => {
    if (!activeProduct || !selectedSourceProduct) return;
    const sourceComps = getSourceComponents(selectedSourceProduct);
    if (sourceComps.length === 0) {
      showFeedback(`No components found to copy from "${selectedSourceProduct.name}".`);
      setIsCopyModalOpen(false);
      return;
    }

    const cloned: ProductCostComponent[] = sourceComps.map((comp) => ({
      ...comp,
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      totalCost: computeItemTotalCost(comp),
    }));

    const finalComponents =
      copyMode === 'append' ? [...activeMaterialsBreakdown, ...cloned] : cloned;

    handleUpdateComponents(finalComponents);
    setIsCopyModalOpen(false);
    showFeedback(
      copyMode === 'append'
        ? `Appended ${cloned.length} component(s) from "${selectedSourceProduct.name}"!`
        : `Copied ${cloned.length} raw material component(s) from "${selectedSourceProduct.name}"!`
    );
  };

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

  // Direct Labor aggregates from project
  const totalDirectLaborAnnual = useMemo(() => {
    return project.directLabor.reduce(
      (sum, lab) =>
        sum + (lab.monthlyWage || 0) * (lab.monthsPerYear || 12) * (lab.headcount || 1),
      0
    );
  }, [project.directLabor]);

  const totalDirectLaborHeadcount = useMemo(() => {
    return project.directLabor.reduce((sum, lab) => sum + (lab.headcount || 0), 0);
  }, [project.directLabor]);

  const totalYear1Volume = useMemo(() => {
    return project.products.reduce((sum, p) => sum + (p.year1Volume || 0), 0);
  }, [project.products]);

  // Average volume-weighted DL cost per unit
  const volumeWeightedDlPerUnit = useMemo(() => {
    if (totalYear1Volume <= 0 || totalDirectLaborAnnual <= 0) return 0;
    return Math.round((totalDirectLaborAnnual / totalYear1Volume) * 100) / 100;
  }, [totalDirectLaborAnnual, totalYear1Volume]);

  // Compute DL cost per unit for a specific product based on its mode
  const getProductDlPerUnit = (prod: ProductItem): number => {
    const mode = prod.dlCostMode || 'volume_share';
    if (mode === 'custom') {
      return prod.directLaborCostPerUnit !== undefined
        ? prod.directLaborCostPerUnit
        : volumeWeightedDlPerUnit;
    }
    if (mode === 'hourly_time') {
      const mins = Math.max(0, prod.laborMinutesPerUnit || 0);
      const rate = Math.max(0, prod.laborHourlyRate || 0);
      return Math.round(((mins / 60) * rate) * 100) / 100;
    }
    // Default to volume_share
    return volumeWeightedDlPerUnit;
  };

  // ------------------------------------------------------------------------
  // FACTORY OVERHEAD AGGREGATES & ALLOCATION (Requirement 1)
  // ------------------------------------------------------------------------
  const totalIndirectLaborAnnual = useMemo(() => {
    return (project.indirectLabor || []).reduce(
      (sum, lab) =>
        sum + (lab.monthlyWage || 0) * (lab.monthsPerYear || 12) * (lab.headcount || 1),
      0
    );
  }, [project.indirectLabor]);

  const totalProductionUtilitiesAnnual = useMemo(() => {
    return (project.productionUtilities || []).reduce(
      (sum, u) =>
        sum +
        (u.annualAmountYear1 !== undefined && u.annualAmountYear1 !== 0
          ? u.annualAmountYear1
          : (u.monthlyAmount ? u.monthlyAmount * 12 : 0)),
      0
    );
  }, [project.productionUtilities]);

  const totalFactorySuppliesAnnual = useMemo(() => {
    return (project.factorySupplies || []).reduce(
      (sum, s) =>
        sum +
        (s.annualAmount !== undefined
          ? s.annualAmount
          : (s.quantity || 0) * (s.unitCost || 0)),
      0
    );
  }, [project.factorySupplies]);

  const factoryDepreciationYr1 = useMemo(() => {
    const depreciationSchedule = calculateDepreciation(project);
    if (project.factoryDepreciationMethod === 'specific_assets' && project.factoryAssetIds) {
      return depreciationSchedule
        .filter((d) => project.factoryAssetIds?.includes(d.assetId))
        .reduce((sum, d) => sum + (d.yearValues[0]?.depreciation || d.annualDepreciation), 0);
    }
    const totalYr1Depr = depreciationSchedule.reduce(
      (sum, d) => sum + (d.yearValues[0]?.depreciation || d.annualDepreciation),
      0
    );
    const fohDeprPercent =
      project.factoryDepreciationPercent !== undefined
        ? project.factoryDepreciationPercent
        : 50;
    return totalYr1Depr * (fohDeprPercent / 100);
  }, [
    project.fixedAssets,
    project.factoryDepreciationMethod,
    project.factoryAssetIds,
    project.factoryDepreciationPercent,
  ]);

  const year1FohSummary = useMemo(() => {
    return calculateYear1FactoryOverhead(project);
  }, [project]);

  const totalProductionLaborBenefitsAnnual = year1FohSummary.factoryLaborBenefitsAnnual;
  const totalFactoryOverheadAnnual = year1FohSummary.totalFactoryOverheadAnnual;

  // Average volume-weighted FOH cost per unit
  const volumeWeightedFohPerUnit = useMemo(() => {
    if (totalYear1Volume <= 0 || totalFactoryOverheadAnnual <= 0) return 0;
    return Math.round((totalFactoryOverheadAnnual / totalYear1Volume) * 100) / 100;
  }, [totalFactoryOverheadAnnual, totalYear1Volume]);

  // Compute FOH cost per unit for a specific product based on its mode
  const getProductFohPerUnit = (prod: ProductItem): number => {
    const mode = prod.fohCostMode || 'volume_share';
    if (mode === 'custom') {
      return prod.factoryOverheadCostPerUnit !== undefined
        ? prod.factoryOverheadCostPerUnit
        : volumeWeightedFohPerUnit;
    }
    // Default to volume_share
    return volumeWeightedFohPerUnit;
  };

  // Compute Direct Materials cost for active product
  const activeMaterialsBreakdown: ProductCostComponent[] = useMemo(() => {
    if (!activeProduct) return [];
    return activeProduct.costBreakdown || [];
  }, [activeProduct]);

  const activeMaterialsSubtotal = useMemo(() => {
    if (!activeProduct) return 0;
    if (activeMaterialsBreakdown.length > 0) {
      return (
        Math.round(
          activeMaterialsBreakdown.reduce((sum, comp) => sum + (comp.totalCost || 0), 0) * 100
        ) / 100
      );
    }
    if (activeProduct.rawMaterialsCostPerUnit !== undefined) {
      return activeProduct.rawMaterialsCostPerUnit;
    }
    return Math.max(
      0,
      activeProduct.unitCost -
        (activeProduct.directLaborCostPerUnit || 0) -
        (activeProduct.factoryOverheadCostPerUnit || 0)
    );
  }, [activeProduct, activeMaterialsBreakdown]);

  // Compute Direct Labor for active product
  const activeLaborSubtotal = useMemo(() => {
    if (!activeProduct) return 0;
    return getProductDlPerUnit(activeProduct);
  }, [activeProduct, volumeWeightedDlPerUnit]);

  // Compute Factory Overhead for active product (Requirement 1)
  const activeFohSubtotal = useMemo(() => {
    if (!activeProduct) return 0;
    return getProductFohPerUnit(activeProduct);
  }, [activeProduct, volumeWeightedFohPerUnit]);

  // Total Unit Cost for active product: Full Absorption Costing (DM + DL + FOH)
  const activeTotalUnitCost = useMemo(() => {
    return (
      Math.round(
        (activeMaterialsSubtotal + activeLaborSubtotal + activeFohSubtotal) * 100
      ) / 100
    );
  }, [activeMaterialsSubtotal, activeLaborSubtotal, activeFohSubtotal]);

  // Active product margins
  const activeUnitPrice = activeProduct?.unitPrice || 0;
  const activeUnitMargin = activeUnitPrice - activeTotalUnitCost;
  const activeMarginPercent =
    activeUnitPrice > 0 ? (activeUnitMargin / activeUnitPrice) * 100 : 0;
  const activeMarkupPercent =
    activeTotalUnitCost > 0 ? (activeUnitMargin / activeTotalUnitCost) * 100 : 0;

  // --- Handlers ---

  // Update component breakdown for the active product
  const handleUpdateComponents = (newComponents: ProductCostComponent[]) => {
    if (!activeProduct) return;
    const normalized = newComponents.map((c) => ({
      ...c,
      totalCost: computeItemTotalCost(c),
    }));

    const matTotal =
      Math.round(normalized.reduce((s, c) => s + (c.totalCost || 0), 0) * 100) / 100;
    const dlCost = getProductDlPerUnit(activeProduct);
    const fohCost = getProductFohPerUnit(activeProduct);
    const combinedCost = Math.round((matTotal + dlCost + fohCost) * 100) / 100;

    const updated = project.products.map((p) => {
      if (p.id !== activeProduct.id) return p;
      return {
        ...p,
        costBreakdown: normalized,
        rawMaterialsCostPerUnit: matTotal,
        directLaborCostPerUnit: dlCost,
        factoryOverheadCostPerUnit: fohCost,
        unitCost: combinedCost,
      };
    });

    onUpdateProject({ ...project, products: updated });
  };

  // Add a new material component
  const handleAddComponent = () => {
    if (!activeProduct) return;
    const newComp: ProductCostComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Raw Materials & Ingredients',
      name: 'New Material / Ingredient',
      costMode: 'direct_unit',
      quantity: 1,
      unit: 'pc',
      unitCost: 5,
      totalCost: 5,
    };
    handleUpdateComponents([...activeMaterialsBreakdown, newComp]);
  };

  // Remove a material component
  const handleRemoveComponent = (id: string) => {
    handleUpdateComponents(activeMaterialsBreakdown.filter((c) => c.id !== id));
  };

  // Update a single component
  const handleEditComponent = (
    index: number,
    fieldUpdates: Partial<ProductCostComponent>
  ) => {
    const copy = [...activeMaterialsBreakdown];
    const updatedItem = { ...copy[index], ...fieldUpdates };
    updatedItem.totalCost = computeItemTotalCost(updatedItem);
    copy[index] = updatedItem;
    handleUpdateComponents(copy);
  };

  // Direct edit of raw materials per unit (quick flat mode)
  const handleSetFlatMaterialsCost = (val: number) => {
    if (!activeProduct) return;
    const safeVal = Math.max(0, val);
    const dlCost = getProductDlPerUnit(activeProduct);
    const fohCost = getProductFohPerUnit(activeProduct);
    const combined = Math.round((safeVal + dlCost + fohCost) * 100) / 100;

    const updated = project.products.map((p) => {
      if (p.id !== activeProduct.id) return p;
      return {
        ...p,
        rawMaterialsCostPerUnit: safeVal,
        directLaborCostPerUnit: dlCost,
        factoryOverheadCostPerUnit: fohCost,
        unitCost: combined,
      };
    });
    onUpdateProject({ ...project, products: updated });
  };

  // Update labor allocation settings for active product
  const handleUpdateLaborMode = (
    mode: 'volume_share' | 'custom' | 'hourly_time',
    customVal?: number,
    mins?: number,
    hourlyRate?: number
  ) => {
    if (!activeProduct) return;

    let dlCost = volumeWeightedDlPerUnit;
    if (mode === 'custom') {
      dlCost = customVal !== undefined ? customVal : activeLaborSubtotal;
    } else if (mode === 'hourly_time') {
      const m = mins !== undefined ? mins : activeProduct.laborMinutesPerUnit || 15;
      const r = hourlyRate !== undefined ? hourlyRate : activeProduct.laborHourlyRate || 65;
      dlCost = Math.round(((m / 60) * r) * 100) / 100;
    }

    const matTotal = activeMaterialsSubtotal;
    const fohCost = getProductFohPerUnit(activeProduct);
    const combined = Math.round((matTotal + dlCost + fohCost) * 100) / 100;

    const updated = project.products.map((p) => {
      if (p.id !== activeProduct.id) return p;
      return {
        ...p,
        dlCostMode: mode,
        directLaborCostPerUnit: dlCost,
        factoryOverheadCostPerUnit: fohCost,
        rawMaterialsCostPerUnit: matTotal,
        unitCost: combined,
        laborMinutesPerUnit:
          mins !== undefined ? mins : p.laborMinutesPerUnit,
        laborHourlyRate:
          hourlyRate !== undefined ? hourlyRate : p.laborHourlyRate,
      };
    });

    onUpdateProject({ ...project, products: updated });
    showFeedback(
      `Updated Direct Labor allocation for ${activeProduct.name}: ${formatCurrency(dlCost, c, 2)}/unit`
    );
  };

  // Update Factory Overhead allocation settings for active product (Requirement 1)
  const handleUpdateFohMode = (
    mode: 'volume_share' | 'custom',
    customVal?: number
  ) => {
    if (!activeProduct) return;

    let fohCost = volumeWeightedFohPerUnit;
    if (mode === 'custom') {
      fohCost = customVal !== undefined ? customVal : activeFohSubtotal;
    }

    const matTotal = activeMaterialsSubtotal;
    const dlCost = getProductDlPerUnit(activeProduct);
    const combined = Math.round((matTotal + dlCost + fohCost) * 100) / 100;

    const updated = project.products.map((p) => {
      if (p.id !== activeProduct.id) return p;
      return {
        ...p,
        fohCostMode: mode,
        factoryOverheadCostPerUnit: fohCost,
        directLaborCostPerUnit: dlCost,
        rawMaterialsCostPerUnit: matTotal,
        unitCost: combined,
      };
    });

    onUpdateProject({ ...project, products: updated });
    showFeedback(
      `Updated Factory Overhead allocation for ${activeProduct.name}: ${formatCurrency(fohCost, c, 2)}/unit`
    );
  };

  // Load a BOM preset
  const handleLoadPreset = (presetKey: string) => {
    if (!activeProduct) return;
    const preset = SAMPLE_BOM_PRESETS[presetKey];
    if (!preset) return;

    handleUpdateComponents(preset.components);
    showFeedback(`Loaded "${preset.label}" into ${activeProduct.name}!`);
  };

  // Apply computed DL to ALL products in one click
  const handleApplyDlToAllProducts = () => {
    if (project.products.length === 0) return;
    const updated = project.products.map((p) => {
      const dlUnit = volumeWeightedDlPerUnit;
      const fohUnit = getProductFohPerUnit(p);
      const baseRaw =
        p.rawMaterialsCostPerUnit !== undefined
          ? p.rawMaterialsCostPerUnit
          : Math.max(
              0,
              p.unitCost -
                (p.directLaborCostPerUnit || 0) -
                (p.factoryOverheadCostPerUnit || 0)
            );
      return {
        ...p,
        dlCostMode: 'volume_share' as const,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: dlUnit,
        factoryOverheadCostPerUnit: fohUnit,
        unitCost: Math.round((baseRaw + dlUnit + fohUnit) * 100) / 100,
      };
    });
    onUpdateProject({ ...project, products: updated });
    showFeedback(
      `Applied average Direct Labor (${formatCurrency(volumeWeightedDlPerUnit, c, 2)}/unit) to all products!`
    );
  };

  // Apply computed Factory Overhead to ALL products in one click (Requirement 1)
  const handleApplyFohToAllProducts = () => {
    if (project.products.length === 0) return;
    const fohUnit = volumeWeightedFohPerUnit;
    const updated = project.products.map((p) => {
      const dlUnit = getProductDlPerUnit(p);
      const baseRaw =
        p.rawMaterialsCostPerUnit !== undefined
          ? p.rawMaterialsCostPerUnit
          : Math.max(
              0,
              p.unitCost -
                (p.directLaborCostPerUnit || 0) -
                (p.factoryOverheadCostPerUnit || 0)
            );
      return {
        ...p,
        fohCostMode: 'volume_share' as const,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: dlUnit,
        factoryOverheadCostPerUnit: fohUnit,
        unitCost: Math.round((baseRaw + dlUnit + fohUnit) * 100) / 100,
      };
    });
    onUpdateProject({ ...project, products: updated });
    showFeedback(
      `Applied Factory Overhead (${formatCurrency(fohUnit, c, 2)}/unit) to all products!`
    );
  };

  // Apply full costing (DL + FOH) to ALL products in one click
  const handleApplyFullCostingToAllProducts = () => {
    if (project.products.length === 0) return;
    const dlUnit = volumeWeightedDlPerUnit;
    const fohUnit = volumeWeightedFohPerUnit;
    const updated = project.products.map((p) => {
      const baseRaw =
        p.rawMaterialsCostPerUnit !== undefined
          ? p.rawMaterialsCostPerUnit
          : Math.max(
              0,
              p.unitCost -
                (p.directLaborCostPerUnit || 0) -
                (p.factoryOverheadCostPerUnit || 0)
            );
      return {
        ...p,
        dlCostMode: 'volume_share' as const,
        fohCostMode: 'volume_share' as const,
        rawMaterialsCostPerUnit: baseRaw,
        directLaborCostPerUnit: dlUnit,
        factoryOverheadCostPerUnit: fohUnit,
        unitCost: Math.round((baseRaw + dlUnit + fohUnit) * 100) / 100,
      };
    });
    onUpdateProject({ ...project, products: updated });
    showFeedback(
      `Applied Full Costing (DL: ${formatCurrency(dlUnit, c, 2)} + FOH: ${formatCurrency(fohUnit, c, 2)}) to all products!`
    );
  };

  // Reset current product to base materials only
  const handleResetActiveLaborAndFoh = () => {
    if (!activeProduct) return;
    const updated = project.products.map((p) => {
      if (p.id !== activeProduct.id) return p;
      return {
        ...p,
        dlCostMode: 'custom' as const,
        fohCostMode: 'custom' as const,
        directLaborCostPerUnit: 0,
        factoryOverheadCostPerUnit: 0,
        unitCost: activeMaterialsSubtotal,
      };
    });
    onUpdateProject({ ...project, products: updated });
    showFeedback(`Reset ${activeProduct.name} to Direct Materials only.`);
  };

  // Add a new product directly from Costing tab
  const handleCreateProduct = () => {
    const dlInit = volumeWeightedDlPerUnit > 0 ? volumeWeightedDlPerUnit : 15;
    const fohInit = volumeWeightedFohPerUnit > 0 ? volumeWeightedFohPerUnit : 10;
    const rawInit = 35;
    const newProd: ProductItem = {
      id: `p-${Date.now()}`,
      name: `Product ${project.products.length + 1}`,
      unitPrice: 150,
      year1Volume: 3000,
      annualGrowthRate: 8,
      rawMaterialsCostPerUnit: rawInit,
      directLaborCostPerUnit: dlInit,
      factoryOverheadCostPerUnit: fohInit,
      unitCost: rawInit + dlInit + fohInit,
      costBreakdown: [],
    };
    onUpdateProject({
      ...project,
      products: [...project.products, newProd],
    });
    setSelectedProductId(newProd.id);
    showFeedback(`Created "${newProd.name}"! Now build its material, labor, and overhead costing.`);
  };

  // If no products exist yet
  if (project.products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Products or Services Defined Yet
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Costing computes the cost per unit starting from itemized Direct Materials (Bill of Materials) and Direct Labor wages. Add your first product to begin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCreateProduct}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create First Product
            </button>
            <button
              onClick={() => onNavigateToTab('sales')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Package className="w-4 h-4 text-slate-600" /> Go to Products & Sales Volume
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER & CONTEXTUAL INTRO                            */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-2xs">
              <Calculator className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Direct Materials Costing (Cost Per Unit Builder)
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleApplyDlToAllProducts}
            className="px-3 py-1.5 text-xs bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Automatically distribute Direct Labor payroll across all products based on volume"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Apply DL to All
          </button>
          <button
            type="button"
            onClick={handleApplyFohToAllProducts}
            className="px-3 py-1.5 text-xs bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Automatically distribute Factory Overhead across all products based on volume"
          >
            <Factory className="w-3.5 h-3.5 text-purple-600" /> Apply FOH to All
          </button>
          <button
            type="button"
            onClick={handleApplyFullCostingToAllProducts}
            className="px-3 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Apply both Direct Labor and Factory Overhead absorption costing to all products in one click"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Apply Full Costing (DL + FOH)
          </button>
          <button
            type="button"
            onClick={handleCreateProduct}
            className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PRODUCT SELECTOR TABS                                */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Select product to cost:</span>
          <span>
            {project.products.length} product{project.products.length > 1 ? 's' : ''} in study
          </span>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          {project.products.map((prod) => {
            const isSelected = activeProduct?.id === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => setSelectedProductId(prod.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
              >
                <Package className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                <span>{prod.name || 'Unnamed Product'}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-financial font-bold ${
                    isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {formatCurrency(prod.unitCost, c, 2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeProduct && (
        <>
          {/* ---------------------------------------------------- */}
          {/* TOP SUMMARY CARDS FOR ACTIVE PRODUCT (5 CARDS)       */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 1: Direct Materials */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">1. Direct Materials</span>
                <span className="p-1 bg-amber-50 text-amber-700 rounded-md">
                  <Tag className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-bold font-financial text-slate-900">
                {formatCurrency(activeMaterialsSubtotal, c, 2)}
              </div>
              <p className="text-[11px] text-slate-500">
                {activeMaterialsBreakdown.length > 0
                  ? `${activeMaterialsBreakdown.length} component${activeMaterialsBreakdown.length > 1 ? 's' : ''}`
                  : 'Direct base raw material'}
                {activeTotalUnitCost > 0 && (
                  <span className="text-amber-700 font-bold ml-1">
                    ({((activeMaterialsSubtotal / activeTotalUnitCost) * 100).toFixed(0)}%)
                  </span>
                )}
              </p>
            </div>

            {/* Card 2: Direct Labor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">2. Direct Labor</span>
                <span className="p-1 bg-indigo-50 text-indigo-700 rounded-md">
                  <Users className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-bold font-financial text-indigo-700">
                {formatCurrency(activeLaborSubtotal, c, 2)}
              </div>
              <p className="text-[11px] text-slate-500">
                {totalDirectLaborHeadcount} staff wages
                {activeTotalUnitCost > 0 && (
                  <span className="text-indigo-700 font-bold ml-1">
                    ({((activeLaborSubtotal / activeTotalUnitCost) * 100).toFixed(0)}%)
                  </span>
                )}
              </p>
            </div>

            {/* Card 3: Factory Overhead (Requirement 1) */}
            <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-purple-900">3. Factory Overhead</span>
                <span className="p-1 bg-purple-50 text-purple-700 rounded-md">
                  <Factory className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-bold font-financial text-purple-700">
                {formatCurrency(activeFohSubtotal, c, 2)}
              </div>
              <p className="text-[11px] text-slate-500">
                Indirect plant cost
                {activeTotalUnitCost > 0 && (
                  <span className="text-purple-700 font-bold ml-1">
                    ({((activeFohSubtotal / activeTotalUnitCost) * 100).toFixed(0)}%)
                  </span>
                )}
              </p>
            </div>

            {/* Card 4: Total Cost / Unit (COGS) */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-indigo-200 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Cost / Unit (COGS)</span>
                <span className="p-1 bg-indigo-800/60 text-indigo-200 rounded-md">
                  <Calculator className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold font-financial text-emerald-400">
                {formatCurrency(activeTotalUnitCost, c, 2)}
              </div>
              <p className="text-[10px] text-indigo-200/80">
                = DM + DL + FOH
              </p>
            </div>

            {/* Card 5: Selling Price & Margin */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Price & Margin</span>
                <span className="p-1 bg-emerald-50 text-emerald-700 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-bold font-financial text-slate-900 flex items-baseline gap-2">
                <span>{formatCurrency(activeUnitPrice, c, 2)}</span>
                <span
                  className={`text-xs font-bold font-financial ${
                    activeUnitMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  +{formatCurrency(activeUnitMargin, c, 2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Margin: <strong className="text-emerald-700">{activeMarginPercent.toFixed(1)}%</strong>
                {activeMarkupPercent > 0 && ` • Markup: ${activeMarkupPercent.toFixed(1)}%`}
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION A: DIRECT MATERIALS & PACKAGING BREAKDOWN    */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                    <Tag className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 1: Direct Materials & Packaging (Bill of Materials)
                  </h4>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {formatCurrency(activeMaterialsSubtotal, c, 2)} / unit
                  </span>
                </div>
              </div>

              {/* Add Component and Copy from Previous Product Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-add-material-component"
                  onClick={handleAddComponent}
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Material / Component
                </button>

                <button
                  type="button"
                  id="btn-copy-product-materials"
                  onClick={() => handleOpenCopyModal()}
                  disabled={availableSourceProducts.length === 0}
                  title={
                    availableSourceProducts.length > 0
                      ? 'Choose which product material costing you want to copy'
                      : 'No other products in the study to copy from'
                  }
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs ${
                    availableSourceProducts.length > 0
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 text-amber-700" />
                  <span>Copy Costing from Product...</span>
                </button>
              </div>
            </div>

            {/* If there are NO components yet, offer quick flat input OR table */}
            {activeMaterialsBreakdown.length === 0 ? (
              <div className="bg-slate-50/70 border border-dashed border-slate-300 rounded-xl p-5 text-center space-y-3">
                <p className="text-xs text-slate-600">
                  No itemized components listed yet for <strong>{activeProduct.name}</strong>. You can enter a flat material cost below or itemize individual ingredients & packaging above.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
                    <span className="text-xs font-medium text-slate-600">Flat Direct Materials / Unit:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-bold">{c}</span>
                      <input
                        type="number"
                        step="0.1"
                        value={activeMaterialsSubtotal}
                        onChange={(e) => handleSetFlatMaterialsCost(parseFloat(e.target.value) || 0)}
                        className="w-24 font-financial font-bold text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="px-3 py-1.5 text-xs bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl font-semibold flex items-center gap-1 transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Start Itemized BOM Table
                  </button>
                  {availableSourceProducts.length > 0 && (
                    <button
                      type="button"
                      id="btn-empty-state-copy-materials"
                      onClick={() => handleOpenCopyModal()}
                      className="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-700" /> Copy Costing from Product...
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Component / Material Description</th>
                      <th className="p-2.5 text-center">Cost Mode</th>
                      <th className="p-2.5">Calculation Parameters</th>
                      <th className="p-2.5 text-right font-bold text-slate-900">Cost / Unit ({c})</th>
                      <th className="p-2.5 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeMaterialsBreakdown.map((comp, idx) => {
                      const mode = comp.costMode || 'direct_unit';

                      return (
                        <tr key={comp.id} className="hover:bg-slate-50/50">
                          {/* Category */}
                          <td className="p-2.5 align-top">
                            <select
                              value={comp.category}
                              onChange={(e) =>
                                handleEditComponent(idx, {
                                  category: e.target.value as CostComponentCategory,
                                })
                              }
                              className="text-[11px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-indigo-500"
                            >
                              {COMPONENT_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Component Name */}
                          <td className="p-2.5 align-top">
                            <input
                              type="text"
                              value={comp.name}
                              placeholder="e.g. Arabica Coffee Beans, 16oz Paper Cup, Cardboard Box"
                              onChange={(e) => handleEditComponent(idx, { name: e.target.value })}
                              className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                            />
                          </td>

                          {/* Cost Mode */}
                          <td className="p-2.5 text-center align-top">
                            <button
                              type="button"
                              onClick={() =>
                                handleEditComponent(idx, {
                                  costMode: mode === 'package_yield' ? 'direct_unit' : 'package_yield',
                                })
                              }
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition ${
                                mode === 'package_yield'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}
                              title="Click to toggle between Bulk Package Yield and Direct Unit calculation"
                            >
                              {mode === 'package_yield' ? '📦 Bulk Yield' : '⚖️ Direct Unit'}
                            </button>
                          </td>

                          {/* Calculation Parameters */}
                          <td className="p-2.5 align-top">
                            {mode === 'package_yield' ? (
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span className="text-slate-500">Cost:</span>
                                <input
                                  type="number"
                                  value={comp.purchaseCost ?? 0}
                                  onChange={(e) =>
                                    handleEditComponent(idx, {
                                      purchaseCost: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-16 font-financial border border-slate-200 rounded px-1 py-0.5 text-right font-semibold"
                                  placeholder="650"
                                />
                                <span className="text-slate-400">per</span>
                                <input
                                  type="text"
                                  value={comp.packageUnit || 'bag'}
                                  onChange={(e) =>
                                    handleEditComponent(idx, { packageUnit: e.target.value })
                                  }
                                  className="w-16 border border-slate-200 rounded px-1 py-0.5 text-slate-700"
                                  placeholder="1kg bag"
                                />
                                <span className="text-slate-500">÷ Yields:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={comp.yieldUnits ?? 50}
                                  onChange={(e) =>
                                    handleEditComponent(idx, {
                                      yieldUnits: parseFloat(e.target.value) || 1,
                                    })
                                  }
                                  className="w-14 font-financial border border-slate-200 rounded px-1 py-0.5 text-right font-semibold text-indigo-700"
                                  placeholder="50"
                                />
                                <span className="text-slate-500">units</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span className="text-slate-500">Qty:</span>
                                <input
                                  type="number"
                                  step="0.001"
                                  value={comp.quantity}
                                  onChange={(e) =>
                                    handleEditComponent(idx, {
                                      quantity: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-16 font-financial border border-slate-200 rounded px-1 py-0.5 text-right font-semibold"
                                />
                                <input
                                  type="text"
                                  value={comp.unit}
                                  onChange={(e) => handleEditComponent(idx, { unit: e.target.value })}
                                  className="w-12 border border-slate-200 rounded px-1 py-0.5 text-slate-700"
                                  placeholder="pc"
                                />
                                <span className="text-slate-500">× Unit Cost:</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={comp.unitCost}
                                  onChange={(e) =>
                                    handleEditComponent(idx, {
                                      unitCost: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-16 font-financial border border-slate-200 rounded px-1 py-0.5 text-right font-semibold"
                                />
                              </div>
                            )}
                          </td>

                          {/* Computed Cost per Unit */}
                          <td className="p-2.5 text-right font-financial font-bold text-slate-900 align-top">
                            {formatCurrency(comp.totalCost || 0, c, 2)}
                          </td>

                          {/* Delete */}
                          <td className="p-2.5 text-center align-top">
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(comp.id)}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                              title="Delete component"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right">
                        Total Direct Materials & Packaging:
                      </td>
                      <td className="p-2.5 text-right font-financial font-bold text-amber-800 text-sm">
                        {formatCurrency(activeMaterialsSubtotal, c, 2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION B: DIRECT LABOR COST ALLOCATION              */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                    <Users className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 2: Direct Labor Cost Allocation
                  </h4>
                  <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {formatCurrency(activeLaborSubtotal, c, 2)} / unit
                  </span>
                </div>
              </div>

              {/* Quick Link to Tab 4 Direct Labor */}
              <button
                type="button"
                onClick={() => onNavigateToTab('directCosts')}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-medium flex items-center gap-1.5 transition self-start sm:self-auto"
              >
                <Users className="w-3.5 h-3.5" /> Manage Labor Roles & Wages in Tab 4 →
              </button>
            </div>

            {/* Direct Labor Source Information Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Direct Labor Payroll (Yr 1)
                </span>
                <span className="text-sm font-bold font-financial text-indigo-900">
                  {formatCurrency(totalDirectLaborAnnual, c)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {totalDirectLaborHeadcount} staff across {project.directLabor.length} positions
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Total Production Volume
                </span>
                <span className="text-sm font-bold font-financial text-slate-900">
                  {totalYear1Volume.toLocaleString()} units
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Across all {project.products.length} products
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Volume-Weighted DL Benchmark
                </span>
                <span className="text-sm font-bold font-financial text-emerald-700">
                  {formatCurrency(volumeWeightedDlPerUnit, c, 2)}
                  <span className="text-xs font-normal text-slate-500"> / unit</span>
                </span>
                <span className="text-[10px] text-slate-400 block">
                  = Total Direct Labor ÷ Total Volume
                </span>
              </div>
            </div>

            {/* Allocation Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Choose Direct Labor Allocation Method for {activeProduct.name}:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1: Volume Share */}
                <div
                  onClick={() => handleUpdateLaborMode('volume_share')}
                  className={`border rounded-xl p-3.5 cursor-pointer transition relative ${
                    (activeProduct.dlCostMode || 'volume_share') === 'volume_share'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Volume-Weighted Share
                    </span>
                    {(activeProduct.dlCostMode || 'volume_share') === 'volume_share' && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Distributes annual labor payroll evenly across all units produced. Standard method in undergraduate feasibility studies.
                  </p>
                  <div className="text-sm font-bold font-financial text-indigo-700">
                    {formatCurrency(volumeWeightedDlPerUnit, c, 2)} / unit
                  </div>
                </div>

                {/* Option 2: Custom Fixed Rate */}
                <div
                  onClick={() => handleUpdateLaborMode('custom', activeLaborSubtotal)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition relative ${
                    activeProduct.dlCostMode === 'custom'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      Custom Fixed Rate
                    </span>
                    {activeProduct.dlCostMode === 'custom' && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Specify an exact direct labor peso rate per unit for this specific product.
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-bold">{c}</span>
                    <input
                      type="number"
                      step="0.05"
                      value={activeProduct.directLaborCostPerUnit ?? activeLaborSubtotal}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleUpdateLaborMode('custom', val);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-24 font-financial font-bold text-xs text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:outline-indigo-500 bg-white"
                    />
                    <span className="text-xs text-slate-500">/ unit</span>
                  </div>
                </div>

                {/* Option 3: Time Study (Minutes x Hourly Rate) */}
                <div
                  onClick={() =>
                    handleUpdateLaborMode(
                      'hourly_time',
                      undefined,
                      activeProduct.laborMinutesPerUnit || 15,
                      activeProduct.laborHourlyRate || 65
                    )
                  }
                  className={`border rounded-xl p-3.5 cursor-pointer transition relative ${
                    activeProduct.dlCostMode === 'hourly_time'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Time Study (Mins × Wage)
                    </span>
                    {activeProduct.dlCostMode === 'hourly_time' && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Based on fabrication / preparation time (minutes) and labor hourly wage rate.
                  </p>
                  <div className="space-y-1.5 text-[11px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cycle Time:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="600"
                          value={activeProduct.laborMinutesPerUnit || 15}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 1;
                            handleUpdateLaborMode(
                              'hourly_time',
                              undefined,
                              val,
                              activeProduct.laborHourlyRate || 65
                            );
                          }}
                          className="w-14 font-financial text-right border border-slate-300 rounded px-1 py-0.5"
                        />
                        <span>mins</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hourly Rate:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          value={activeProduct.laborHourlyRate || 65}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleUpdateLaborMode(
                              'hourly_time',
                              undefined,
                              activeProduct.laborMinutesPerUnit || 15,
                              val
                            );
                          }}
                          className="w-14 font-financial text-right border border-slate-300 rounded px-1 py-0.5"
                        />
                        <span>{c}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* STEP 3: FACTORY OVERHEAD ALLOCATION (Requirement 1)  */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                    <Factory className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 3: Factory Overhead Allocation (COGS / Unit)
                  </h4>
                  <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {formatCurrency(activeFohSubtotal, c, 2)} / unit
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full Absorption Costing: Allocate indirect manufacturing overhead (utilities, plant supplies, indirect wages, plant depreciation) into finished goods unit cost.
                </p>
              </div>

              {/* Quick Link to Tab 5 Factory Overhead */}
              <button
                type="button"
                onClick={() => onNavigateToTab('factoryOverhead')}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-medium flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
              >
                <Factory className="w-3.5 h-3.5" /> Manage Plant Overhead & Utilities in Tab 5 →
              </button>
            </div>

            {/* Factory Overhead Source Information Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-50/40 border border-purple-100 rounded-xl p-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Factory Overhead Budget (Yr 1)
                </span>
                <span className="text-sm font-bold font-financial text-purple-900">
                  {formatCurrency(totalFactoryOverheadAnnual, c)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Indirect Labor, Utilities, Supplies & Plant Depreciation
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Total Production Volume
                </span>
                <span className="text-sm font-bold font-financial text-slate-900">
                  {totalYear1Volume.toLocaleString()} units
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Across all {project.products.length} products
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Volume-Weighted FOH Benchmark
                </span>
                <span className="text-sm font-bold font-financial text-purple-700">
                  {formatCurrency(volumeWeightedFohPerUnit, c, 2)}
                  <span className="text-xs font-normal text-slate-500"> / unit</span>
                </span>
                <span className="text-[10px] text-slate-400 block">
                  = Total Factory Overhead ÷ Total Volume
                </span>
              </div>
            </div>

            {/* Allocation Method Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Choose Factory Overhead Allocation Method for {activeProduct.name}:
                </label>
                <button
                  type="button"
                  onClick={handleApplyFohToAllProducts}
                  className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Apply this benchmark to all products
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Option 1: Volume Share */}
                <div
                  onClick={() => handleUpdateFohMode('volume_share')}
                  className={`border rounded-xl p-3.5 cursor-pointer transition relative ${
                    (activeProduct.fohCostMode || 'volume_share') === 'volume_share'
                      ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      Volume-Weighted Share (Standard Absorption Costing)
                    </span>
                    {(activeProduct.fohCostMode || 'volume_share') === 'volume_share' && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Distributes total annual plant overhead evenly across all units manufactured. Standard textbook methodology for feasibility defense.
                  </p>
                  <div className="text-sm font-bold font-financial text-purple-700">
                    {formatCurrency(volumeWeightedFohPerUnit, c, 2)} / unit
                  </div>
                </div>

                {/* Option 2: Custom Fixed Rate */}
                <div
                  onClick={() => handleUpdateFohMode('custom', activeFohSubtotal)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition relative ${
                    activeProduct.fohCostMode === 'custom'
                      ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-600" />
                      Custom Fixed FOH Rate
                    </span>
                    {activeProduct.fohCostMode === 'custom' && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Specify an exact factory overhead peso amount per finished unit for this product.
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-bold">{c}</span>
                    <input
                      type="number"
                      step="0.05"
                      value={activeProduct.factoryOverheadCostPerUnit ?? activeFohSubtotal}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleUpdateFohMode('custom', val);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-24 font-financial font-bold text-xs text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:outline-purple-500 bg-white"
                    />
                    <span className="text-xs text-slate-500">/ unit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION C: COST ROLLUP & UNIT ECONOMICS SHEET        */}
          {/* ---------------------------------------------------- */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  Unit Cost Synthesis: {activeProduct.name}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Academic Cost of Goods Sold (COGS) Schedule per finished unit under Full Absorption Costing (DM + DL + FOH).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showFeedback(`Synced ${activeProduct.name} unit cost to statements!`);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Synchronized with Financials
                </button>
              </div>
            </div>

            {/* Accounting Cost Sheet Table */}
            <div className="max-w-2xl bg-slate-800/60 border border-slate-700/80 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-800/90 text-slate-300 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3">Cost Element</th>
                    <th className="p-3 text-right">Cost per Unit</th>
                    <th className="p-3 text-right">% of Total Cost</th>
                    <th className="p-3 text-right">Annual (Yr 1)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  <tr>
                    <td className="p-3 font-medium text-slate-200">
                      1. Direct Materials & Packaging
                    </td>
                    <td className="p-3 text-right font-financial font-bold text-amber-300">
                      {formatCurrency(activeMaterialsSubtotal, c, 2)}
                    </td>
                    <td className="p-3 text-right font-financial text-slate-400">
                      {activeTotalUnitCost > 0
                        ? `${((activeMaterialsSubtotal / activeTotalUnitCost) * 100).toFixed(1)}%`
                        : '0%'}
                    </td>
                    <td className="p-3 text-right font-financial text-slate-300">
                      {formatCurrency(activeMaterialsSubtotal * activeProduct.year1Volume, c)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-200">
                      2. Direct Labor Cost
                    </td>
                    <td className="p-3 text-right font-financial font-bold text-indigo-300">
                      {formatCurrency(activeLaborSubtotal, c, 2)}
                    </td>
                    <td className="p-3 text-right font-financial text-slate-400">
                      {activeTotalUnitCost > 0
                        ? `${((activeLaborSubtotal / activeTotalUnitCost) * 100).toFixed(1)}%`
                        : '0%'}
                    </td>
                    <td className="p-3 text-right font-financial text-slate-300">
                      {formatCurrency(activeLaborSubtotal * activeProduct.year1Volume, c)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-200">
                      3. Factory Overhead (FOH)
                    </td>
                    <td className="p-3 text-right font-financial font-bold text-purple-300">
                      {formatCurrency(activeFohSubtotal, c, 2)}
                    </td>
                    <td className="p-3 text-right font-financial text-slate-400">
                      {activeTotalUnitCost > 0
                        ? `${((activeFohSubtotal / activeTotalUnitCost) * 100).toFixed(1)}%`
                        : '0%'}
                    </td>
                    <td className="p-3 text-right font-financial text-slate-300">
                      {formatCurrency(activeFohSubtotal * activeProduct.year1Volume, c)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-900 border-t-2 border-slate-600 font-bold">
                  <tr>
                    <td className="p-3 text-white">Total Cost of Goods Sold / Unit (COGS)</td>
                    <td className="p-3 text-right font-financial text-emerald-400 text-sm">
                      {formatCurrency(activeTotalUnitCost, c, 2)}
                    </td>
                    <td className="p-3 text-right font-financial text-emerald-400">100.0%</td>
                    <td className="p-3 text-right font-financial text-emerald-400 text-sm">
                      {formatCurrency(activeTotalUnitCost * activeProduct.year1Volume, c)}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-700/50 text-slate-300 font-normal">
                    <td className="p-3 text-slate-300">Target Selling Price per Unit</td>
                    <td className="p-3 text-right font-financial font-bold text-white">
                      {formatCurrency(activeUnitPrice, c, 2)}
                    </td>
                    <td colSpan={2} className="p-3 text-right text-[11px] text-slate-400">
                      Gross Margin: <strong className="text-emerald-400 font-financial">{formatCurrency(activeUnitMargin, c, 2)}</strong> ({activeMarginPercent.toFixed(1)}%)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION D: MASTER PRODUCT COSTING SUMMARY (ALL)      */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  All Products Costing & Margin Comparative Matrix
                </h4>
                <p className="text-xs text-slate-500">
                  Full absorption costing overview of all products in the study: Direct Materials + Direct Labor + Factory Overhead = Total Cost of Goods Sold.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('sales')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition self-start sm:self-auto cursor-pointer"
              >
                <span>Edit Selling Prices & Volumes in Tab 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-right">Direct Materials</th>
                    <th className="p-3 text-right">Direct Labor</th>
                    <th className="p-3 text-right">Factory Overhead</th>
                    <th className="p-3 text-right font-bold text-slate-900">Total Unit Cost</th>
                    <th className="p-3 text-right">Unit Margin</th>
                    <th className="p-3 text-right">Margin %</th>
                    <th className="p-3 text-right">Yr 1 Volume</th>
                    <th className="p-3 text-right font-bold text-slate-900">Yr 1 Total COGS</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.products.map((p) => {
                    const dl = getProductDlPerUnit(p);
                    const foh = getProductFohPerUnit(p);
                    const dm =
                      p.rawMaterialsCostPerUnit !== undefined
                        ? p.rawMaterialsCostPerUnit
                        : p.directLaborCostPerUnit !== undefined
                        ? Math.max(0, p.unitCost - p.directLaborCostPerUnit - (p.factoryOverheadCostPerUnit || 0))
                        : p.unitCost;
                    const totalCost = Math.round((dm + dl + foh) * 100) / 100;
                    const margin = p.unitPrice - totalCost;
                    const marginPct = p.unitPrice > 0 ? (margin / p.unitPrice) * 100 : 0;
                    const totalCogs = totalCost * p.year1Volume;
                    const isCurrent = activeProduct?.id === p.id;

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/70 transition ${
                          isCurrent ? 'bg-indigo-50/40 font-medium' : ''
                        }`}
                      >
                        <td className="p-3 font-semibold text-slate-900">
                          {p.name || 'Unnamed Product'}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-bold">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(p.unitPrice, c, 2)}
                        </td>
                        <td className="p-3 text-right font-financial text-amber-800">
                          {formatCurrency(dm, c, 2)}
                        </td>
                        <td className="p-3 text-right font-financial text-indigo-700">
                          {formatCurrency(dl, c, 2)}
                        </td>
                        <td className="p-3 text-right font-financial text-purple-700">
                          {formatCurrency(foh, c, 2)}
                        </td>
                        <td className="p-3 text-right font-financial font-bold text-slate-900">
                          {formatCurrency(totalCost, c, 2)}
                        </td>
                        <td
                          className={`p-3 text-right font-financial font-semibold ${
                            margin >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {formatCurrency(margin, c, 2)}
                        </td>
                        <td className="p-3 text-right font-financial text-slate-600">
                          {marginPct.toFixed(1)}%
                        </td>
                        <td className="p-3 text-right font-financial text-slate-600">
                          {p.year1Volume.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-financial font-bold text-slate-900">
                          {formatCurrency(totalCogs, c)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedProductId(p.id)}
                            className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-lg font-semibold transition cursor-pointer"
                          >
                            Cost Sheet
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* COPY RAW MATERIALS MODAL */}
      {isCopyModalOpen && selectedSourceProduct && activeProduct && (
        <div
          id="modal-copy-materials-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsCopyModalOpen(false)}
        >
          <div
            id="modal-copy-materials"
            className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Copy className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Copy Raw Material Components
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target Product: <strong className="text-indigo-600">{activeProduct.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-copy-modal"
                onClick={() => setIsCopyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Source Product Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select Source Product to Copy Costing From:
                </label>
                {availableSourceProducts.length > 1 ? (
                  <select
                    id="select-copy-source-product"
                    value={selectedSourceProduct.id}
                    onChange={(e) => setCopySourceProductId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  >
                    {availableSourceProducts.map((prod) => {
                      const comps = getSourceComponents(prod);
                      const matTotal = comps.reduce((sum, c) => sum + (c.totalCost || 0), 0);
                      return (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} — {comps.length} component(s) ({formatCurrency(matTotal, c, 2)} / unit)
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-800">
                        {selectedSourceProduct.name}
                      </span>
                    </div>
                    <span className="text-xs font-financial font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {getSourceComponents(selectedSourceProduct).length} component{getSourceComponents(selectedSourceProduct).length === 1 ? '' : 's'}
                    </span>
                  </div>
                )}
              </div>

              {/* Mode Selection if existing components exist */}
              {activeMaterialsBreakdown.length > 0 && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-indigo-950">
                    Existing Components in {activeProduct.name}:
                  </div>
                  <p className="text-[11px] text-indigo-900/80">
                    This product already has <strong className="text-indigo-950">{activeMaterialsBreakdown.length}</strong> component(s). How should copied components be applied?
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label
                      className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        copyMode === 'replace'
                          ? 'bg-white border-indigo-600 ring-1 ring-indigo-600 font-semibold text-indigo-950 shadow-2xs'
                          : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        id="radio-copy-mode-replace"
                        name="copyMode"
                        checked={copyMode === 'replace'}
                        onChange={() => setCopyMode('replace')}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div>Replace Existing</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Overwrite all {activeMaterialsBreakdown.length} current components
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        copyMode === 'append'
                          ? 'bg-white border-indigo-600 ring-1 ring-indigo-600 font-semibold text-indigo-950 shadow-2xs'
                          : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        id="radio-copy-mode-append"
                        name="copyMode"
                        checked={copyMode === 'append'}
                        onChange={() => setCopyMode('append')}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div>Append / Add</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Keep current items and add copied components
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Preview of components to be copied */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    Components to Copy ({getSourceComponents(selectedSourceProduct).length}):
                  </span>
                  <span className="text-xs font-bold font-financial text-slate-900">
                    Total: {formatCurrency(
                      getSourceComponents(selectedSourceProduct).reduce((sum, comp) => sum + (comp.totalCost || 0), 0),
                      c,
                      2
                    )} / unit
                  </span>
                </div>

                {getSourceComponents(selectedSourceProduct).length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-900 text-xs text-center">
                    "{selectedSourceProduct.name}" does not have any itemized raw materials or base material cost.
                  </div>
                ) : (
                  <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/40">
                    {getSourceComponents(selectedSourceProduct).map((item, i) => (
                      <div key={i} className="p-2.5 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.category} • {item.costMode === 'package_yield' ? `Bulk yield (${item.packageQuantity || 1} ${item.packageUnit || 'pkg'} ÷ ${item.yieldUnits || 1})` : `${item.quantity} ${item.unit} @ ${formatCurrency(item.unitCost, c, 2)}`}
                          </div>
                        </div>
                        <div className="font-financial font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(item.totalCost, c, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-cancel-copy-materials"
                onClick={() => setIsCopyModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-copy-materials"
                onClick={handleExecuteCopy}
                disabled={getSourceComponents(selectedSourceProduct).length === 0}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>
                  {copyMode === 'append' ? 'Append' : 'Copy'}{' '}
                  {getSourceComponents(selectedSourceProduct).length} Component
                  {getSourceComponents(selectedSourceProduct).length === 1 ? '' : 's'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
