import React, { useState, useMemo } from 'react';
import { FeasibilityProject, ProductItem } from '../types';
import {
  formatCurrency,
  calculateYear1FactoryOverhead,
} from '../utils/financialCalculations';
import {
  Calculator,
  Plus,
  TrendingUp,
  Tag,
  Users,
  Factory,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Percent,
  DollarSign,
  Package,
} from 'lucide-react';

interface CostingTabProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  onNavigateToTab?: (tab: any) => void;
}

export default function CostingTab({
  project,
  onUpdateProject,
  onNavigateToTab,
}: CostingTabProps) {
  const c = project.currency;
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Aggregates for benchmarks
  const totalDirectLaborAnnual = useMemo(() => {
    return project.directLabor.reduce(
      (sum, lab) =>
        sum + (lab.monthlyWage || 0) * (lab.monthsPerYear || 12) * (lab.headcount || 1),
      0
    );
  }, [project.directLabor]);

  const totalYear1Volume = useMemo(() => {
    return project.products.reduce((sum, p) => sum + (p.year1Volume || 0), 0);
  }, [project.products]);

  const volumeWeightedDlPerUnit = useMemo(() => {
    if (totalYear1Volume <= 0 || totalDirectLaborAnnual <= 0) return 0;
    return Math.round((totalDirectLaborAnnual / totalYear1Volume) * 100) / 100;
  }, [totalDirectLaborAnnual, totalYear1Volume]);

  const year1FohSummary = useMemo(() => {
    return calculateYear1FactoryOverhead(project);
  }, [project]);

  const totalFactoryOverheadAnnual = year1FohSummary.totalFactoryOverheadAnnual;

  const volumeWeightedFohPerUnit = useMemo(() => {
    if (totalYear1Volume <= 0 || totalFactoryOverheadAnnual <= 0) return 0;
    return Math.round((totalFactoryOverheadAnnual / totalYear1Volume) * 100) / 100;
  }, [totalFactoryOverheadAnnual, totalYear1Volume]);

  // Helpers to retrieve product components
  const getProductDm = (p: ProductItem): number => {
    if (p.rawMaterialsCostPerUnit !== undefined) {
      return p.rawMaterialsCostPerUnit;
    }
    return Math.max(
      0,
      p.unitCost - (p.directLaborCostPerUnit || 0) - (p.factoryOverheadCostPerUnit || 0)
    );
  };

  const getProductDl = (p: ProductItem): number => {
    if (p.directLaborCostPerUnit !== undefined) {
      return p.directLaborCostPerUnit;
    }
    return volumeWeightedDlPerUnit;
  };

  const getProductFoh = (p: ProductItem): number => {
    if (p.factoryOverheadCostPerUnit !== undefined) {
      return p.factoryOverheadCostPerUnit;
    }
    return volumeWeightedFohPerUnit;
  };

  // Update handlers
  const handleUpdateProductCost = (
    prodId: string,
    field: 'unitPrice' | 'rawMaterialsCostPerUnit' | 'directLaborCostPerUnit' | 'factoryOverheadCostPerUnit' | 'year1Volume' | 'annualGrowthRate',
    val: number
  ) => {
    const updated = project.products.map((p) => {
      if (p.id !== prodId) return p;
      const currentDm = getProductDm(p);
      const currentDl = getProductDl(p);
      const currentFoh = getProductFoh(p);

      let newDm = currentDm;
      let newDl = currentDl;
      let newFoh = currentFoh;
      let newPrice = p.unitPrice;
      let newVol = p.year1Volume;
      let newGrowth = p.annualGrowthRate;

      if (field === 'rawMaterialsCostPerUnit') newDm = Math.max(0, val);
      if (field === 'directLaborCostPerUnit') newDl = Math.max(0, val);
      if (field === 'factoryOverheadCostPerUnit') newFoh = Math.max(0, val);
      if (field === 'unitPrice') newPrice = Math.max(0, val);
      if (field === 'year1Volume') newVol = Math.max(0, Math.round(val));
      if (field === 'annualGrowthRate') newGrowth = val;

      const newUnitCost = Math.round((newDm + newDl + newFoh) * 100) / 100;

      return {
        ...p,
        unitPrice: newPrice,
        year1Volume: newVol,
        annualGrowthRate: newGrowth,
        rawMaterialsCostPerUnit: newDm,
        directLaborCostPerUnit: newDl,
        factoryOverheadCostPerUnit: newFoh,
        unitCost: newUnitCost,
      };
    });

    onUpdateProject({ ...project, products: updated });
  };

  const handleApplyDlToAll = () => {
    const updated = project.products.map((p) => {
      const dm = getProductDm(p);
      const foh = getProductFoh(p);
      const dl = volumeWeightedDlPerUnit;
      return {
        ...p,
        dlCostMode: 'volume_share' as const,
        directLaborCostPerUnit: dl,
        rawMaterialsCostPerUnit: dm,
        factoryOverheadCostPerUnit: foh,
        unitCost: Math.round((dm + dl + foh) * 100) / 100,
      };
    });
    onUpdateProject({ ...project, products: updated });
    showFeedback(`Applied volume-weighted DL (${formatCurrency(volumeWeightedDlPerUnit, c, 2)}/unit) to all products.`);
  };

  const handleApplyFohToAll = () => {
    const updated = project.products.map((p) => {
      const dm = getProductDm(p);
      const dl = getProductDl(p);
      const foh = volumeWeightedFohPerUnit;
      return {
        ...p,
        fohCostMode: 'volume_share' as const,
        factoryOverheadCostPerUnit: foh,
        directLaborCostPerUnit: dl,
        rawMaterialsCostPerUnit: dm,
        unitCost: Math.round((dm + dl + foh) * 100) / 100,
      };
    });
    onUpdateProject({ ...project, products: updated });
    showFeedback(`Applied volume-weighted FOH (${formatCurrency(volumeWeightedFohPerUnit, c, 2)}/unit) to all products.`);
  };

  const handleApplyFullAbsorption = () => {
    const updated = project.products.map((p) => {
      const dm = getProductDm(p);
      const dl = volumeWeightedDlPerUnit;
      const foh = volumeWeightedFohPerUnit;
      return {
        ...p,
        dlCostMode: 'volume_share' as const,
        fohCostMode: 'volume_share' as const,
        directLaborCostPerUnit: dl,
        factoryOverheadCostPerUnit: foh,
        rawMaterialsCostPerUnit: dm,
        unitCost: Math.round((dm + dl + foh) * 100) / 100,
      };
    });
    onUpdateProject({ ...project, products: updated });
    showFeedback(`Synchronized absorption costing (DL: ${formatCurrency(volumeWeightedDlPerUnit, c, 2)} + FOH: ${formatCurrency(volumeWeightedFohPerUnit, c, 2)}) across all products.`);
  };

  // 5-Year Revenue Computations
  const fiveYearSchedule = useMemo(() => {
    const productsSchedule = project.products.map((prod) => {
      const yearsData = [1, 2, 3, 4, 5].map((yr) => {
        const growthFactor = Math.pow(1 + prod.annualGrowthRate / 100, yr - 1);
        const volume = Math.round(prod.year1Volume * growthFactor);
        const sales = volume * prod.unitPrice;
        return {
          year: yr,
          volume,
          sales,
        };
      });

      const total5YrVolume = yearsData.reduce((acc, y) => acc + y.volume, 0);
      const total5YrSales = yearsData.reduce((acc, y) => acc + y.sales, 0);

      return {
        product: prod,
        years: yearsData,
        total5YrVolume,
        total5YrSales,
      };
    });

    const yearlyTotals = [1, 2, 3, 4, 5].map((yr, idx) => {
      const totalUnits = productsSchedule.reduce(
        (sum, item) => sum + (item.years[idx]?.volume || 0),
        0
      );
      const grossSales = productsSchedule.reduce(
        (sum, item) => sum + (item.years[idx]?.sales || 0),
        0
      );
      const discount = grossSales * ((project.salesDiscountsPercent || 0) / 100);
      const netSales = grossSales - discount;

      return {
        year: yr,
        totalUnits,
        grossSales,
        discount,
        netSales,
      };
    });

    const grandTotalVolume = yearlyTotals.reduce((sum, y) => sum + y.totalUnits, 0);
    const grandTotalGrossSales = yearlyTotals.reduce((sum, y) => sum + y.grossSales, 0);
    const grandTotalDiscounts = yearlyTotals.reduce((sum, y) => sum + y.discount, 0);
    const grandTotalNetSales = yearlyTotals.reduce((sum, y) => sum + y.netSales, 0);

    return {
      productsSchedule,
      yearlyTotals,
      grandTotalVolume,
      grandTotalGrossSales,
      grandTotalDiscounts,
      grandTotalNetSales,
    };
  }, [project.products, project.salesDiscountsPercent]);

  // Overall Top Summary Metrics
  const yr1GrossSales = fiveYearSchedule.yearlyTotals[0]?.grossSales || 0;
  const yr1NetSales = fiveYearSchedule.yearlyTotals[0]?.netSales || 0;
  const grand5YrNetSales = fiveYearSchedule.grandTotalNetSales;

  const totalYr1COGS = useMemo(() => {
    return project.products.reduce((sum, p) => {
      const dm = getProductDm(p);
      const dl = getProductDl(p);
      const foh = getProductFoh(p);
      return sum + (dm + dl + foh) * p.year1Volume;
    }, 0);
  }, [project.products, volumeWeightedDlPerUnit, volumeWeightedFohPerUnit]);

  const overallYr1Margin = yr1GrossSales - totalYr1COGS;
  const overallYr1MarginPct = yr1GrossSales > 0 ? (overallYr1Margin / yr1GrossSales) * 100 : 0;

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
              Costing (Unit Cost Breakdown & 5-Year Revenue Schedule)
            </h3>
          </div>
        </div>

        {/* Global Synchronization Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleApplyDlToAll}
            className="px-3 py-1.5 text-xs bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Distribute annual direct labor payroll evenly per unit across all products"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Apply DL to All ({formatCurrency(volumeWeightedDlPerUnit, c, 2)})</span>
          </button>

          <button
            type="button"
            onClick={handleApplyFohToAll}
            className="px-3 py-1.5 text-xs bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Distribute annual factory overhead budget evenly per unit across all products"
          >
            <Factory className="w-3.5 h-3.5 text-purple-600" />
            <span>Apply FOH to All ({formatCurrency(volumeWeightedFohPerUnit, c, 2)})</span>
          </button>

          <button
            type="button"
            onClick={handleApplyFullAbsorption}
            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Synchronize both Direct Labor and Factory Overhead absorption benchmarks to all products"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sync Full Costing (DL + FOH)</span>
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
      {/* TOP SUMMARY CARDS                                    */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Yr 1 Sales Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Year 1 Volume</span>
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
              <Package className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-financial text-slate-900">
            {totalYear1Volume.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">units</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Across {project.products.length} product{project.products.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Card 2: Year 1 Gross Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Year 1 Gross Sales</span>
            <span className="p-1 bg-emerald-50 text-emerald-700 rounded-md">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-financial text-emerald-700">
            {formatCurrency(yr1GrossSales, c)}
          </div>
          <p className="text-[11px] text-slate-500">
            Net: {formatCurrency(yr1NetSales, c)} (Yr 1)
          </p>
        </div>

        {/* Card 3: Year 1 Cost of Goods Sold */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Year 1 Total COGS</span>
            <span className="p-1 bg-amber-50 text-amber-700 rounded-md">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-financial text-slate-900">
            {formatCurrency(totalYr1COGS, c)}
          </div>
          <p className="text-[11px] text-slate-500">
            DM + DL + FOH production cost
          </p>
        </div>

        {/* Card 4: Overall Gross Margin % */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Gross Profit Margin</span>
            <span className="p-1 bg-indigo-50 text-indigo-700 rounded-md">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-financial text-indigo-700">
            {overallYr1MarginPct.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500">
            Gross Profit: {formatCurrency(overallYr1Margin, c)}
          </p>
        </div>

        {/* Card 5: 5-Year Cumulative Net Revenue */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-200 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">5-Yr Net Revenue</span>
            <span className="p-1 bg-indigo-800/60 text-indigo-200 rounded-md">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-financial text-emerald-400">
            {formatCurrency(grand5YrNetSales, c)}
          </div>
          <p className="text-[10px] text-indigo-200/80">
            5-Yr Total: {fiveYearSchedule.grandTotalVolume.toLocaleString()} units
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 1: SELLING PRICE & UNIT COST BREAKDOWN MATRIX */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <Tag className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                1. Selling Price & Unit Cost Breakdown (Full Absorption Costing)
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('directMaterials')}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Open Direct Materials tab to build itemized BOM for materials & packaging"
              >
                <Tag className="w-3.5 h-3.5" /> Direct Materials BOM →
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3 text-right">Selling Price ({c})</th>
                <th className="p-3 text-right">Direct Materials ({c})</th>
                <th className="p-3 text-right">Direct Labor ({c})</th>
                <th className="p-3 text-right">Factory Overhead ({c})</th>
                <th className="p-3 text-right font-bold text-slate-900">Total Unit Cost ({c})</th>
                <th className="p-3 text-right">Unit Margin ({c})</th>
                <th className="p-3 text-right">Margin %</th>
                <th className="p-3 text-center">Cost Share (DM / DL / FOH)</th>
                {onNavigateToTab && <th className="p-3 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.products.map((p) => {
                const dm = getProductDm(p);
                const dl = getProductDl(p);
                const foh = getProductFoh(p);
                const totalUnitCost = Math.round((dm + dl + foh) * 100) / 100;
                const unitMargin = p.unitPrice - totalUnitCost;
                const marginPct = p.unitPrice > 0 ? (unitMargin / p.unitPrice) * 100 : 0;

                const dmPct = totalUnitCost > 0 ? (dm / totalUnitCost) * 100 : 0;
                const dlPct = totalUnitCost > 0 ? (dl / totalUnitCost) * 100 : 0;
                const fohPct = totalUnitCost > 0 ? (foh / totalUnitCost) * 100 : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-semibold text-slate-900">
                      {p.name || 'Unnamed Product'}
                    </td>

                    {/* Selling Price */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-400 font-bold">{c}</span>
                        <input
                          type="number"
                          step="0.1"
                          value={p.unitPrice}
                          onChange={(e) =>
                            handleUpdateProductCost(
                              p.id,
                              'unitPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 font-financial font-bold text-right border border-slate-300 rounded px-1.5 py-0.5 text-slate-900 focus:outline-indigo-500 bg-white"
                        />
                      </div>
                    </td>

                    {/* Direct Materials */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-400 font-bold">{c}</span>
                        <input
                          type="number"
                          step="0.05"
                          value={dm}
                          onChange={(e) =>
                            handleUpdateProductCost(
                              p.id,
                              'rawMaterialsCostPerUnit',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 font-financial font-semibold text-right border border-amber-300 bg-amber-50/30 rounded px-1.5 py-0.5 text-amber-900 focus:outline-amber-500"
                        />
                      </div>
                    </td>

                    {/* Direct Labor */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-400 font-bold">{c}</span>
                        <input
                          type="number"
                          step="0.05"
                          value={dl}
                          onChange={(e) =>
                            handleUpdateProductCost(
                              p.id,
                              'directLaborCostPerUnit',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 font-financial font-semibold text-right border border-indigo-300 bg-indigo-50/30 rounded px-1.5 py-0.5 text-indigo-900 focus:outline-indigo-500"
                        />
                      </div>
                    </td>

                    {/* Factory Overhead */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-400 font-bold">{c}</span>
                        <input
                          type="number"
                          step="0.05"
                          value={foh}
                          onChange={(e) =>
                            handleUpdateProductCost(
                              p.id,
                              'factoryOverheadCostPerUnit',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 font-financial font-semibold text-right border border-purple-300 bg-purple-50/30 rounded px-1.5 py-0.5 text-purple-900 focus:outline-purple-500"
                        />
                      </div>
                    </td>

                    {/* Total Unit Cost (COGS) */}
                    <td className="p-3 text-right font-financial font-bold text-slate-900 bg-slate-50/50">
                      {formatCurrency(totalUnitCost, c, 2)}
                    </td>

                    {/* Unit Margin */}
                    <td
                      className={`p-3 text-right font-financial font-bold ${
                        unitMargin >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(unitMargin, c, 2)}
                    </td>

                    {/* Margin % */}
                    <td className="p-3 text-right font-financial text-slate-700 font-semibold">
                      {marginPct.toFixed(1)}%
                    </td>

                    {/* Cost Distribution Bar */}
                    <td className="p-3 text-center min-w-[140px]">
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex" title={`DM: ${dmPct.toFixed(0)}% | DL: ${dlPct.toFixed(0)}% | FOH: ${fohPct.toFixed(0)}%`}>
                        <div style={{ width: `${dmPct}%` }} className="bg-amber-400 h-full" />
                        <div style={{ width: `${dlPct}%` }} className="bg-indigo-500 h-full" />
                        <div style={{ width: `${fohPct}%` }} className="bg-purple-500 h-full" />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-financial">
                        <span className="text-amber-700 font-semibold">DM {dmPct.toFixed(0)}%</span>
                        <span className="text-indigo-700 font-semibold">DL {dlPct.toFixed(0)}%</span>
                        <span className="text-purple-700 font-semibold">FOH {fohPct.toFixed(0)}%</span>
                      </div>
                    </td>

                    {/* Action: Link to Direct Materials BOM */}
                    {onNavigateToTab && (
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => onNavigateToTab('directMaterials')}
                          className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-lg font-semibold transition cursor-pointer"
                        >
                          BOM Sheet
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900 text-xs">
              <tr>
                <td className="p-3">Summary / Weighted Totals:</td>
                <td className="p-3 text-right font-financial text-slate-800">
                  Avg {formatCurrency(
                    totalYear1Volume > 0 ? yr1GrossSales / totalYear1Volume : 0,
                    c,
                    2
                  )}
                </td>
                <td className="p-3 text-right font-financial text-amber-800">
                  {formatCurrency(
                    totalYear1Volume > 0
                      ? project.products.reduce((s, p) => s + getProductDm(p) * p.year1Volume, 0) /
                          totalYear1Volume
                      : 0,
                    c,
                    2
                  )}
                </td>
                <td className="p-3 text-right font-financial text-indigo-700">
                  {formatCurrency(
                    totalYear1Volume > 0
                      ? project.products.reduce((s, p) => s + getProductDl(p) * p.year1Volume, 0) /
                          totalYear1Volume
                      : 0,
                    c,
                    2
                  )}
                </td>
                <td className="p-3 text-right font-financial text-purple-700">
                  {formatCurrency(
                    totalYear1Volume > 0
                      ? project.products.reduce((s, p) => s + getProductFoh(p) * p.year1Volume, 0) /
                          totalYear1Volume
                      : 0,
                    c,
                    2
                  )}
                </td>
                <td className="p-3 text-right font-financial text-slate-900">
                  Avg {formatCurrency(
                    totalYear1Volume > 0 ? totalYr1COGS / totalYear1Volume : 0,
                    c,
                    2
                  )}
                </td>
                <td className="p-3 text-right font-financial text-emerald-700">
                  Avg {formatCurrency(
                    totalYear1Volume > 0 ? overallYr1Margin / totalYear1Volume : 0,
                    c,
                    2
                  )}
                </td>
                <td className="p-3 text-right font-financial text-indigo-700">
                  {overallYr1MarginPct.toFixed(1)}%
                </td>
                <td colSpan={onNavigateToTab ? 2 : 1}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2: 5-YEAR ANNUAL UNITS SOLD, SALES & REVENUE SCHEDULE      */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                2. 5-Year Projected Sales & Revenue Schedule (by Escalation Rate)
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sales Discounts:</span>
            <span className="text-xs font-bold font-financial bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {project.salesDiscountsPercent}%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3 text-right">Price ({c})</th>
                <th className="p-3 text-right">Escalation %</th>
                <th className="p-3 text-right bg-slate-100/50">Year 1 Units</th>
                <th className="p-3 text-right bg-slate-100/50">Year 1 Revenue ({c})</th>
                <th className="p-3 text-right">Year 2 Units</th>
                <th className="p-3 text-right">Year 2 Revenue ({c})</th>
                <th className="p-3 text-right bg-slate-100/50">Year 3 Units</th>
                <th className="p-3 text-right bg-slate-100/50">Year 3 Revenue ({c})</th>
                <th className="p-3 text-right">Year 4 Units</th>
                <th className="p-3 text-right">Year 4 Revenue ({c})</th>
                <th className="p-3 text-right bg-slate-100/50">Year 5 Units</th>
                <th className="p-3 text-right bg-slate-100/50">Year 5 Revenue ({c})</th>
                <th className="p-3 text-right font-bold text-slate-900 bg-indigo-50/50">5-Yr Total Volume</th>
                <th className="p-3 text-right font-bold text-slate-900 bg-indigo-50/50">5-Yr Total Revenue ({c})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fiveYearSchedule.productsSchedule.map((item) => {
                const p = item.product;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                      {p.name || 'Unnamed Product'}
                    </td>

                    {/* Unit Price */}
                    <td className="p-3 text-right font-financial text-slate-800">
                      {formatCurrency(p.unitPrice, c, 2)}
                    </td>

                    {/* Escalation Rate Input */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <input
                          type="number"
                          step="0.5"
                          value={p.annualGrowthRate}
                          onChange={(e) =>
                            handleUpdateProductCost(
                              p.id,
                              'annualGrowthRate',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-14 font-financial font-semibold text-right border border-slate-300 rounded px-1 py-0.5 text-slate-900 focus:outline-indigo-500 bg-white"
                        />
                        <span className="text-[11px] text-slate-500 font-bold">%</span>
                      </div>
                    </td>

                    {/* Year 1 Units */}
                    <td className="p-3 text-right bg-slate-100/30">
                      <input
                        type="number"
                        value={p.year1Volume}
                        onChange={(e) =>
                          handleUpdateProductCost(
                            p.id,
                            'year1Volume',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 font-financial font-semibold text-right border border-slate-300 rounded px-1.5 py-0.5 text-slate-900 focus:outline-indigo-500 bg-white"
                      />
                    </td>

                    {/* Year 1 Revenue */}
                    <td className="p-3 text-right font-financial font-bold text-slate-900 bg-slate-100/30 whitespace-nowrap">
                      {formatCurrency(item.years[0]?.sales || 0, c)}
                    </td>

                    {/* Year 2 */}
                    <td className="p-3 text-right font-financial text-slate-700">
                      {item.years[1]?.volume.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-financial font-semibold text-slate-800 whitespace-nowrap">
                      {formatCurrency(item.years[1]?.sales || 0, c)}
                    </td>

                    {/* Year 3 */}
                    <td className="p-3 text-right font-financial text-slate-700 bg-slate-100/30">
                      {item.years[2]?.volume.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-financial font-semibold text-slate-800 bg-slate-100/30 whitespace-nowrap">
                      {formatCurrency(item.years[2]?.sales || 0, c)}
                    </td>

                    {/* Year 4 */}
                    <td className="p-3 text-right font-financial text-slate-700">
                      {item.years[3]?.volume.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-financial font-semibold text-slate-800 whitespace-nowrap">
                      {formatCurrency(item.years[3]?.sales || 0, c)}
                    </td>

                    {/* Year 5 */}
                    <td className="p-3 text-right font-financial text-slate-700 bg-slate-100/30">
                      {item.years[4]?.volume.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-financial font-semibold text-slate-800 bg-slate-100/30 whitespace-nowrap">
                      {formatCurrency(item.years[4]?.sales || 0, c)}
                    </td>

                    {/* 5-Yr Cumulative Total */}
                    <td className="p-3 text-right font-financial font-bold text-indigo-900 bg-indigo-50/40">
                      {item.total5YrVolume.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-financial font-bold text-indigo-950 bg-indigo-50/40 whitespace-nowrap">
                      {formatCurrency(item.total5YrSales, c)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900 text-xs divide-y divide-slate-200">
              {/* Row 1: Total Units Sold */}
              <tr>
                <td colSpan={3} className="p-3 text-slate-800">
                  Total Annual Units Sold (Volume):
                </td>
                <td className="p-3 text-right font-financial bg-slate-100/50">
                  {fiveYearSchedule.yearlyTotals[0]?.totalUnits.toLocaleString()}
                </td>
                <td className="p-3 text-right font-financial bg-slate-100/50">-</td>
                <td className="p-3 text-right font-financial">
                  {fiveYearSchedule.yearlyTotals[1]?.totalUnits.toLocaleString()}
                </td>
                <td className="p-3 text-right font-financial">-</td>
                <td className="p-3 text-right font-financial bg-slate-100/50">
                  {fiveYearSchedule.yearlyTotals[2]?.totalUnits.toLocaleString()}
                </td>
                <td className="p-3 text-right font-financial bg-slate-100/50">-</td>
                <td className="p-3 text-right font-financial">
                  {fiveYearSchedule.yearlyTotals[3]?.totalUnits.toLocaleString()}
                </td>
                <td className="p-3 text-right font-financial">-</td>
                <td className="p-3 text-right font-financial bg-slate-100/50">
                  {fiveYearSchedule.yearlyTotals[4]?.totalUnits.toLocaleString()}
                </td>
                <td className="p-3 text-right font-financial bg-slate-100/50">-</td>
                <td className="p-3 text-right font-financial text-indigo-900 bg-indigo-50/50">
                  {fiveYearSchedule.grandTotalVolume.toLocaleString()}
                </td>
                <td className="p-3 text-right font-financial bg-indigo-50/50">-</td>
              </tr>

              {/* Row 2: Total Gross Sales */}
              <tr className="bg-slate-100/40">
                <td colSpan={3} className="p-3 text-slate-800">
                  Total Gross Sales / Revenue:
                </td>
                <td className="p-3 text-right font-financial bg-slate-100/60">-</td>
                <td className="p-3 text-right font-financial text-emerald-800 bg-slate-100/60 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[0]?.grossSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial">-</td>
                <td className="p-3 text-right font-financial text-emerald-800 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[1]?.grossSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial bg-slate-100/60">-</td>
                <td className="p-3 text-right font-financial text-emerald-800 bg-slate-100/60 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[2]?.grossSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial">-</td>
                <td className="p-3 text-right font-financial text-emerald-800 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[3]?.grossSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial bg-slate-100/60">-</td>
                <td className="p-3 text-right font-financial text-emerald-800 bg-slate-100/60 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[4]?.grossSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial bg-indigo-50/60">-</td>
                <td className="p-3 text-right font-financial text-emerald-900 bg-indigo-50/60 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.grandTotalGrossSales, c)}
                </td>
              </tr>

              {/* Row 3: Less Sales Discounts */}
              {(project.salesDiscountsPercent || 0) > 0 && (
                <tr className="text-slate-500 font-medium">
                  <td colSpan={3} className="p-2.5 text-slate-600">
                    Less: Sales Discounts & Allowances ({project.salesDiscountsPercent}%):
                  </td>
                  <td className="p-2.5 text-right font-financial bg-slate-100/60">-</td>
                  <td className="p-2.5 text-right font-financial text-rose-600 bg-slate-100/60 whitespace-nowrap">
                    ({formatCurrency(fiveYearSchedule.yearlyTotals[0]?.discount || 0, c)})
                  </td>
                  <td className="p-2.5 text-right font-financial">-</td>
                  <td className="p-2.5 text-right font-financial text-rose-600 whitespace-nowrap">
                    ({formatCurrency(fiveYearSchedule.yearlyTotals[1]?.discount || 0, c)})
                  </td>
                  <td className="p-2.5 text-right font-financial bg-slate-100/60">-</td>
                  <td className="p-2.5 text-right font-financial text-rose-600 bg-slate-100/60 whitespace-nowrap">
                    ({formatCurrency(fiveYearSchedule.yearlyTotals[2]?.discount || 0, c)})
                  </td>
                  <td className="p-2.5 text-right font-financial">-</td>
                  <td className="p-2.5 text-right font-financial text-rose-600 whitespace-nowrap">
                    ({formatCurrency(fiveYearSchedule.yearlyTotals[3]?.discount || 0, c)})
                  </td>
                  <td className="p-2.5 text-right font-financial bg-slate-100/60">-</td>
                  <td className="p-2.5 text-right font-financial text-rose-600 bg-slate-100/60 whitespace-nowrap">
                    ({formatCurrency(fiveYearSchedule.yearlyTotals[4]?.discount || 0, c)})
                  </td>
                  <td className="p-2.5 text-right font-financial bg-indigo-50/60">-</td>
                  <td className="p-2.5 text-right font-financial text-rose-700 bg-indigo-50/60 whitespace-nowrap">
                    ({formatCurrency(fiveYearSchedule.grandTotalDiscounts, c)})
                  </td>
                </tr>
              )}

              {/* Row 4: Total Net Sales / Revenue */}
              <tr className="bg-indigo-900 text-white font-bold text-sm">
                <td colSpan={3} className="p-3 text-white">
                  Total Projected Net Sales / Revenue:
                </td>
                <td className="p-3 text-right font-financial bg-indigo-950/70">-</td>
                <td className="p-3 text-right font-financial text-emerald-400 bg-indigo-950/70 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[0]?.netSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial">-</td>
                <td className="p-3 text-right font-financial text-emerald-400 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[1]?.netSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial bg-indigo-950/70">-</td>
                <td className="p-3 text-right font-financial text-emerald-400 bg-indigo-950/70 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[2]?.netSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial">-</td>
                <td className="p-3 text-right font-financial text-emerald-400 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[3]?.netSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial bg-indigo-950/70">-</td>
                <td className="p-3 text-right font-financial text-emerald-400 bg-indigo-950/70 whitespace-nowrap">
                  {formatCurrency(fiveYearSchedule.yearlyTotals[4]?.netSales || 0, c)}
                </td>
                <td className="p-3 text-right font-financial bg-indigo-950">-</td>
                <td className="p-3 text-right font-financial text-emerald-300 bg-indigo-950 whitespace-nowrap text-base">
                  {formatCurrency(fiveYearSchedule.grandTotalNetSales, c)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
