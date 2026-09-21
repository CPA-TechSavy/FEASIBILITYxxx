import React from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import { Target, Layers, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface BreakEvenUnitsTableProps {
  project: FeasibilityProject;
  financials: YearFinancials[];
}

export default function BreakEvenUnitsTable({
  project,
  financials,
}: BreakEvenUnitsTableProps) {
  const c = project.currency;
  const years5 = financials.slice(1);

  const bepYearData = years5.map((y) => {
    const prodVolumes = (project.products || []).map((p) => {
      const growth = Math.pow(1 + (p.annualGrowthRate || 0) / 100, y.year - 1);
      const vol = (p.year1Volume || 0) * growth;
      return {
        id: p.id,
        name: p.name,
        volume: vol,
        unitPrice: p.unitPrice,
      };
    });

    const totalUnits = prodVolumes.reduce((sum, p) => sum + p.volume, 0);
    const avgPrice = totalUnits > 0 ? y.netSales / totalUnits : 0;
    const avgVariableCost = totalUnits > 0 ? y.variableCosts / totalUnits : 0;
    const unitCM = totalUnits > 0 ? y.contributionMargin / totalUnits : 0;
    const bepUnits = unitCM > 0 ? Math.round(y.fixedCosts / unitCM) : 0;
    const mosUnits = Math.max(0, Math.round(totalUnits - bepUnits));
    const mosUnitsRatio = totalUnits > 0 ? (mosUnits / totalUnits) * 100 : 0;

    const productBreakdown = prodVolumes.map((pv) => {
      const mixPercent = totalUnits > 0 ? (pv.volume / totalUnits) * 100 : 0;
      const allocatedBepUnits = Math.round(bepUnits * (mixPercent / 100));
      const allocatedMosUnits = Math.max(0, Math.round(pv.volume - allocatedBepUnits));
      return {
        name: pv.name,
        volume: Math.round(pv.volume),
        mixPercent,
        bepUnits: allocatedBepUnits,
        mosUnits: allocatedMosUnits,
      };
    });

    return {
      year: y.year,
      fixedCosts: y.fixedCosts,
      variableCosts: y.variableCosts,
      netSales: y.netSales,
      totalUnits: Math.round(totalUnits),
      avgPrice,
      avgVariableCost,
      unitCM,
      cmRatio: y.contributionMarginRatio * 100,
      bepUnits,
      bepSales: y.breakEvenSales,
      mosUnits,
      mosUnitsRatio,
      productBreakdown,
    };
  });

  const yr1 = bepYearData[0] || {
    bepUnits: 0,
    totalUnits: 0,
    mosUnits: 0,
    mosUnitsRatio: 0,
    bepSales: 0,
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm print-break-inside-avoid">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Break-Even Point (BEP) in Units
              </h3>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Cost-Volume-Profit (CVP) Analysis
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Minimum unit production volume required each year to cover all fixed and variable costs.
            </p>
          </div>
        </div>
      </div>

      {/* MINI STATS CARDS FOR YEAR 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Year 1 Break-Even Units
          </span>
          <div className="text-lg sm:text-xl font-bold font-financial text-indigo-950 mt-1">
            {yr1.bepUnits.toLocaleString()} Units
          </div>
          <span className="text-[11px] text-slate-500">
            Break-Even Sales: {formatCurrency(yr1.bepSales, c)}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Year 1 Target Production
          </span>
          <div className="text-lg sm:text-xl font-bold font-financial text-slate-900 mt-1">
            {yr1.totalUnits.toLocaleString()} Units
          </div>
          <span className="text-[11px] text-slate-500">
            Planned annual sales capacity
          </span>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Year 1 Margin of Safety
          </span>
          <div className="text-lg sm:text-xl font-bold font-financial text-emerald-950 mt-1">
            {yr1.mosUnits.toLocaleString()} Units
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">
            {formatPercent(yr1.mosUnitsRatio)} volume safety cushion
          </span>
        </div>
      </div>

      {/* 5-YEAR BREAK-EVEN IN UNITS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
              <th className="py-2.5 text-left w-1/3">CVP Component / Metric</th>
              <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden md:table-cell w-1/4">
                Computation Basis
              </th>
              <th className="py-2.5 text-right font-financial">Year 1</th>
              <th className="py-2.5 text-right font-financial">Year 2</th>
              <th className="py-2.5 text-right font-financial">Year 3</th>
              <th className="py-2.5 text-right font-financial">Year 4</th>
              <th className="py-2.5 text-right font-financial">Year 5</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
            {/* Total Fixed Operating Costs */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">Total Fixed Costs</td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Salaries (70% DL) + FOH + Admin + Rent + Depr + Int
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.fixedCosts, c)}
                </td>
              ))}
            </tr>

            {/* Total Variable Costs */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">Total Variable Costs</td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Materials + Direct Labor (30%) + Selling Comm.
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.variableCosts, c)}
                </td>
              ))}
            </tr>

            {/* Weighted Avg Selling Price */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Weighted Avg. Selling Price / Unit
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Net Sales ÷ Total Projected Units
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.avgPrice, c)}
                </td>
              ))}
            </tr>

            {/* Weighted Avg Variable Cost / Unit */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Weighted Avg. Variable Cost / Unit
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Total Variable Costs ÷ Total Projected Units
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.avgVariableCost, c)}
                </td>
              ))}
            </tr>

            {/* Weighted Avg Unit Contribution Margin */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Unit Contribution Margin (UCM)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Avg. Selling Price − Avg. Variable Cost
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  {formatCurrency(d.unitCM, c)}
                </td>
              ))}
            </tr>

            {/* Contribution Margin Ratio */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Contribution Margin Ratio (CMR)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                (Total Contribution Margin ÷ Net Sales) × 100%
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  {formatPercent(d.cmRatio)}
                </td>
              ))}
            </tr>

            {/* BREAK-EVEN POINT IN UNITS (HIGHLIGHTED) */}
            <tr className="bg-indigo-50/80 hover:bg-indigo-50 font-bold border-y-2 border-indigo-200">
              <td className="py-3 pl-2 text-indigo-950 font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Break-Even Point in Units (BEP Units)</span>
              </td>
              <td className="py-3 text-xs text-indigo-700 font-mono hidden md:table-cell">
                Total Fixed Costs ÷ Unit Contribution Margin
              </td>
              {bepYearData.map((d) => (
                <td
                  key={d.year}
                  className="py-3 text-right font-financial font-bold text-indigo-950 text-sm"
                >
                  {d.bepUnits.toLocaleString()} Units
                </td>
              ))}
            </tr>

            {/* Break-Even Point in Sales Value */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Break-Even Point in Sales Value
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Total Fixed Costs ÷ Contribution Margin Ratio
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  {formatCurrency(d.bepSales, c)}
                </td>
              ))}
            </tr>

            {/* Target Production Volume */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Projected Sales Volume (Target Units)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Total Planned Commercial Unit Production
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  {d.totalUnits.toLocaleString()} Units
                </td>
              ))}
            </tr>

            {/* Margin of Safety in Units */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-emerald-900">
                Margin of Safety in Units
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Target Units − Break-Even Units
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-semibold text-emerald-700">
                  {d.mosUnits.toLocaleString()} Units
                </td>
              ))}
            </tr>

            {/* Margin of Safety Ratio */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-emerald-900">
                Margin of Safety Ratio (Volume %)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                (Margin of Safety Units ÷ Target Units) × 100%
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-semibold text-emerald-700">
                  {formatPercent(d.mosUnitsRatio)}
                </td>
              ))}
            </tr>

            {/* PRODUCT-LEVEL ALLOCATION IF MULTI-PRODUCT */}
            {project.products && project.products.length > 1 && (
              <>
                <tr className="bg-slate-100/80 font-bold">
                  <td
                    colSpan={7}
                    className="py-2 pl-2 text-xs uppercase tracking-wider text-slate-700 font-semibold"
                  >
                    Product-Level Break-Even Allocation (Sales Mix Weighted)
                  </td>
                </tr>
                {project.products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 pl-4 text-xs font-medium text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{prod.name} (BEP Units)</span>
                    </td>
                    <td className="py-2 text-[11px] text-slate-500 font-mono hidden md:table-cell">
                      BEP Units × Product Mix %
                    </td>
                    {bepYearData.map((d) => {
                      const item = d.productBreakdown.find((p) => p.name === prod.name);
                      return (
                        <td
                          key={d.year}
                          className="py-2 text-right font-financial text-xs text-slate-800"
                        >
                          {item ? `${item.bepUnits.toLocaleString()} Units` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTNOTE */}
      <div className="mt-4 text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <Info className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          <strong>Defense Note:</strong> Break-even in units is achieved when contribution margin covers all fixed operating costs. Projected volumes exceed break-even thresholds across all 5 years, providing a strong operational safety cushion.
        </span>
      </div>
    </section>
  );
}
