import { FeasibilityProject } from '../types';
import {
  calculateLoanAmortization,
  calculateDepreciation,
  formatCurrency,
} from '../utils/financialCalculations';
import { Table, Calendar, Layers, Receipt, Calculator, Tag, Landmark, PiggyBank, Factory, ShieldCheck, Package } from 'lucide-react';

interface SupportingSchedulesViewProps {
  project: FeasibilityProject;
  onOpenBankModal?: () => void;
}

export default function SupportingSchedulesView({
  project,
  onOpenBankModal,
}: SupportingSchedulesViewProps) {
  const c = project.currency;
  const loanSchedule = calculateLoanAmortization(project);
  const depreciationSchedule = calculateDepreciation(project);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-5 sm:p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Feasibility Supporting Schedules (Notes & Audit Schedules)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed working papers for bank debt service amortization and straight-line depreciation of fixed assets.
          </p>
        </div>

        {onOpenBankModal && (
          <button
            onClick={onOpenBankModal}
            title="Open comprehensive interactive breakdown for bank savings interest and loan payments"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-50 to-emerald-50 hover:from-indigo-100 hover:to-emerald-100 text-indigo-950 border border-indigo-200 flex items-center gap-2 transition shadow-2xs cursor-pointer"
          >
            <Landmark className="w-4 h-4 text-indigo-600" />
            <span>Bank Savings Interest & Loan Debt Breakdown</span>
          </button>
        )}
      </div>

      {/* SCHEDULE 1: LOAN AMORTIZATION SCHEDULE */}
      <section className="print-break-inside-avoid">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule 1: Bank Debt Amortization Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Principal: {formatCurrency(project.financing.bankLoanAmount, c)} at {project.financing.annualInterestRate}% for {project.financing.loanTermYears} years.
            </p>
          </div>

          {onOpenBankModal && (
            <button
              onClick={onOpenBankModal}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-indigo-600" />
              <span>Capital & Interest Breakdown</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left">Period</th>
                <th className="py-2.5 px-3 text-right">Beginning Balance</th>
                <th className="py-2.5 px-3 text-right">Annual Debt Payment</th>
                <th className="py-2.5 px-3 text-right">Principal Repayment</th>
                <th className="py-2.5 px-3 text-right">Interest Expense</th>
                <th className="py-2.5 px-3 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loanSchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-medium text-slate-800">Year {row.year}</td>
                  <td className="py-2 px-3 text-right font-financial">
                    {formatCurrency(row.beginningBalance, c)}
                  </td>
                  <td className="py-2 px-3 text-right font-financial font-semibold text-indigo-950">
                    {formatCurrency(row.annualPayment, c)}
                  </td>
                  <td className="py-2 px-3 text-right font-financial text-slate-700">
                    {formatCurrency(row.principalRepayment, c)}
                  </td>
                  <td className="py-2 px-3 text-right font-financial text-amber-700">
                    {formatCurrency(row.interestExpense, c)}
                  </td>
                  <td className="py-2 px-3 text-right font-financial font-medium text-slate-900">
                    {formatCurrency(row.endingBalance, c)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SCHEDULE 2: FIXED ASSET DEPRECIATION SCHEDULE */}
      <section className="print-break-inside-avoid">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule 2: Fixed Asset Depreciation Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Supports Straight-Line (Default), Double Declining Balance, 150% DB, and Sum-of-the-Years&apos;-Digits.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left">Asset Description</th>
                <th className="py-2.5 px-3 text-left">Method</th>
                <th className="py-2.5 px-3 text-right">Acquisition Cost</th>
                <th className="py-2.5 px-3 text-right">Life (Yrs)</th>
                <th className="py-2.5 px-3 text-right">Salvage Value</th>
                <th className="py-2.5 px-3 text-right">Yr 1 Depr.</th>
                <th className="py-2.5 px-3 text-right">Yr 1 Book Val</th>
                <th className="py-2.5 px-3 text-right">Yr 3 Book Val</th>
                <th className="py-2.5 px-3 text-right">Yr 5 Book Val</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {depreciationSchedule.map((item) => {
                const yr1Depr = item.yearValues.find((y) => y.year === 1)?.depreciation || item.annualDepreciation;
                const yr1BV = item.yearValues.find((y) => y.year === 1)?.bookValue || 0;
                const yr3BV = item.yearValues.find((y) => y.year === 3)?.bookValue || 0;
                const yr5BV = item.yearValues.find((y) => y.year === 5)?.bookValue || 0;

                return (
                  <tr key={item.assetId} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">{item.assetName}</td>
                    <td className="py-2 px-3 text-slate-600">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                        {item.depreciationMethod || 'Straight-Line'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-financial">
                      {formatCurrency(item.cost, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial">{item.usefulLife}</td>
                    <td className="py-2 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(item.salvageValue, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                      {formatCurrency(yr1Depr, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial text-slate-700">
                      {formatCurrency(yr1BV, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial text-slate-700">
                      {formatCurrency(yr3BV, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial text-slate-700">
                      {formatCurrency(yr5BV, c)}
                    </td>
                  </tr>
                );
              })}
              {/* Grand Total Depreciation */}
              <tr className="acc-subtotal font-bold bg-slate-50/70">
                <td className="py-2.5 px-3 font-bold text-slate-900">Total Fixed Assets</td>
                <td className="py-2.5 px-3 text-slate-500 text-xs italic">Multi-Method</td>
                <td className="py-2.5 px-3 text-right font-financial font-bold">
                  {formatCurrency(
                    depreciationSchedule.reduce((s, d) => s + d.cost, 0),
                    c
                  )}
                </td>
                <td className="py-2.5 px-3 text-right">-</td>
                <td className="py-2.5 px-3 text-right font-financial">
                  {formatCurrency(
                    depreciationSchedule.reduce((s, d) => s + d.salvageValue, 0),
                    c
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950">
                  {formatCurrency(
                    depreciationSchedule.reduce(
                      (s, d) =>
                        s +
                        (d.yearValues.find((y) => y.year === 1)?.depreciation ||
                          d.annualDepreciation),
                      0
                    ),
                    c
                  )}
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-right text-xs text-slate-500 italic">
                  End of Useful Life Book Value = Salvage Value
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SCHEDULE 3: WORKING CAPITAL BUFFER & DEPOSITORY BANKING SCHEDULE */}
      <section className="print-break-inside-avoid">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule 3: Working Capital Buffer & Depository Cash Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of Day 1 initial liquidity into Cash on Hand and interest-bearing Cash in Bank.
            </p>
          </div>

          {onOpenBankModal && (
            <button
              onClick={onOpenBankModal}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
              <span>Savings Interest Breakdown</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left">Liquidity Component</th>
                <th className="py-2.5 px-3 text-left">Depository Institution / Channel</th>
                <th className="py-2.5 px-3 text-right">Initial Buffer ({c})</th>
                <th className="py-2.5 px-3 text-right">Share of Buffer %</th>
                <th className="py-2.5 px-3 text-right">Interest Rate (% p.a.)</th>
                <th className="py-2.5 px-3 text-right">Est. Annual Interest Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {(() => {
                const totalBuffer = project.initialWorkingCapitalBuffer || 1;
                const coh =
                  project.workingCapitalBufferDetails?.cashOnHand ??
                  Math.round(totalBuffer * 0.2);
                const cib =
                  project.workingCapitalBufferDetails?.cashInBank ??
                  Math.round(totalBuffer * 0.8);
                const bankName =
                  project.workingCapitalBufferDetails?.bankName || 'BDO Unibank, Inc.';
                const rate =
                  project.workingCapitalBufferDetails?.bankInterestRatePercent ?? 1.0;
                const annualInterest = Math.round(cib * (rate / 100));

                return (
                  <>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">Cash on Hand</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        Physical Vault & Register Cash Float (Petty Cash)
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial">
                        {formatCurrency(coh, c)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial text-slate-600">
                        {totalBuffer > 0 ? Math.round((coh / totalBuffer) * 100) : 0}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial text-slate-400">0.00%</td>
                      <td className="py-2.5 px-3 text-right font-financial text-slate-400">
                        {formatCurrency(0, c)}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">Cash in Bank</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {bankName} (Commercial Depository Account)
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial">
                        {formatCurrency(cib, c)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial text-slate-600">
                        {totalBuffer > 0 ? Math.round((cib / totalBuffer) * 100) : 0}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial font-semibold text-indigo-700">
                        {rate.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial font-semibold text-emerald-700">
                        {formatCurrency(annualInterest, c)}
                      </td>
                    </tr>
                    <tr className="acc-subtotal font-bold bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Total Working Capital Buffer</td>
                      <td className="py-2.5 px-3 text-slate-500 text-xs italic">
                        Combined Operational Liquidity Reserve
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950">
                        {formatCurrency(totalBuffer, c)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial font-bold">100%</td>
                      <td className="py-2.5 px-3 text-right font-financial">-</td>
                      <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-700">
                        {formatCurrency(annualInterest, c)}
                      </td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </section>

      {/* SCHEDULE 4: DIRECT MATERIALS & PRODUCT COST PER UNIT (BOM BREAKDOWN) */}
      <section className="print-break-inside-avoid">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule 4: Direct Materials & Product Cost Per Unit (Unit COGS Schedule)
            </h3>
            <p className="text-xs text-slate-500">
              Itemized direct cost decomposition, gross contribution margins, and markup rates per product sold.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left">Product Sold / Cost Components</th>
                <th className="py-2.5 px-3 text-left">Category / Unit</th>
                <th className="py-2.5 px-3 text-right">Selling Price ({c})</th>
                <th className="py-2.5 px-3 text-right">Unit Cost ({c})</th>
                <th className="py-2.5 px-3 text-right">Unit Margin ({c})</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-right">Yr 1 Volume</th>
                <th className="py-2.5 px-3 text-right">Yr 1 Direct Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {project.products.map((prod) => {
                const comps = prod.costBreakdown || [];
                const calcTotal = comps.reduce(
                  (s, item) => s + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
                  0
                );
                const effectiveCost = prod.unitCost > 0 ? prod.unitCost : calcTotal;
                const unitMargin = prod.unitPrice - effectiveCost;
                const marginPct = prod.unitPrice > 0 ? (unitMargin / prod.unitPrice) * 100 : 0;
                const yr1Total = effectiveCost * prod.year1Volume;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{prod.name}</span>
                      </div>
                      {comps.length > 0 && (
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5 pl-5">
                          {comps.map((item) => {
                            const isYield = item.costMode === 'package_yield' && item.purchaseCost && item.yieldUnits;
                            const formula = isYield
                              ? ` [${formatCurrency(item.purchaseCost, c)}/${item.packageUnit || 'pkg'} ÷ ${item.yieldUnits} units = ${formatCurrency(item.totalCost, c)}]`
                              : ` (${formatCurrency(item.totalCost, c)})`;
                            return `${item.name}${formula}`;
                          }).join(' • ')}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-xs">
                      {comps.length > 0 ? `${comps.length} components itemized` : 'Standard direct cost'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-financial font-medium text-slate-800">
                      {formatCurrency(prod.unitPrice, c)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950">
                      {formatCurrency(effectiveCost, c)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-financial font-semibold text-emerald-700">
                      {formatCurrency(unitMargin, c)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-financial">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                        {marginPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                      {prod.year1Volume.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                      {formatCurrency(yr1Total, c)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SCHEDULE 5: FACTORY OVERHEAD & PRODUCTION LABOR BENEFITS SCHEDULE */}
      <section className="print-break-inside-avoid">
        {(() => {
          const directHeadcount = (project.directLabor || []).reduce((s, l) => s + (l.headcount || 0), 0);
          const directBasicAnnual12M = (project.directLabor || []).reduce(
            (s, l) => s + (l.headcount || 0) * (l.monthlyWage || 0) * 12,
            0
          );
          const indirectHeadcount = (project.indirectLabor || []).reduce((s, l) => s + (l.headcount || 0), 0);
          const indirectLaborAnnual = (project.indirectLabor || []).reduce(
            (s, l) => s + (l.headcount || 0) * (l.monthlyWage || 0) * (l.monthsPerYear || 12),
            0
          );
          const indirectBasicAnnual12M = (project.indirectLabor || []).reduce(
            (s, l) => s + (l.headcount || 0) * (l.monthlyWage || 0) * 12,
            0
          );

          const utilitiesAnnual = (project.productionUtilities || []).reduce(
            (s, u) => s + (u.annualAmountYear1 || 0),
            0
          );
          const suppliesAnnual = project.factoryOverheadAnnual ?? 0;

          // Depreciation attribution
          let factoryDeprYr1 = 0;
          let factoryDeprMethodLabel = '';
          if (project.factoryDepreciationMethod === 'specific_assets') {
            const selectedSet = new Set(project.factoryAssetIds || []);
            const yr1FactoryAssets = depreciationSchedule.filter((d) => selectedSet.has(d.assetId));
            factoryDeprYr1 = yr1FactoryAssets.reduce(
              (s, d) => s + (d.yearValues.find((y) => y.year === 1)?.depreciation || d.annualDepreciation),
              0
            );
            factoryDeprMethodLabel = `Specific Factory Assets (${yr1FactoryAssets.length} of ${project.fixedAssets.length} assets)`;
          } else {
            const totalYr1Depr = depreciationSchedule.reduce(
              (s, d) => s + (d.yearValues.find((y) => y.year === 1)?.depreciation || d.annualDepreciation),
              0
            );
            const pct = project.factoryDepreciationPercent ?? 100;
            factoryDeprYr1 = totalYr1Depr * (pct / 100);
            factoryDeprMethodLabel = `Global Allocation (${pct}% of total depreciation)`;
          }

          // Benefits
          const benefits = project.productionLaborBenefits || [];
          let directBenefitsTotal = 0;
          let indirectBenefitsTotal = 0;

          benefits.forEach((b) => {
            const appliesDirect = b.appliesTo === 'both' || b.appliesTo === 'direct_only';
            const appliesIndirect = b.appliesTo === 'both' || b.appliesTo === 'indirect_only';

            if (b.type === 'percentage') {
              const rate = (b.rateOrAmount || 0) / 100;
              if (appliesDirect) directBenefitsTotal += directBasicAnnual12M * rate;
              if (appliesIndirect) indirectBenefitsTotal += indirectBasicAnnual12M * rate;
            } else if (b.type === 'fixed_monthly_per_head') {
              const monthly = b.rateOrAmount || 0;
              if (appliesDirect) directBenefitsTotal += monthly * 12 * directHeadcount;
              if (appliesIndirect) indirectBenefitsTotal += monthly * 12 * indirectHeadcount;
            } else if (b.type === 'fixed_annual') {
              const amt = b.rateOrAmount || 0;
              const totalHead = (appliesDirect ? directHeadcount : 0) + (appliesIndirect ? indirectHeadcount : 0);
              if (totalHead > 0) {
                if (appliesDirect && appliesIndirect) {
                  directBenefitsTotal += amt * (directHeadcount / totalHead);
                  indirectBenefitsTotal += amt * (indirectHeadcount / totalHead);
                } else if (appliesDirect) {
                  directBenefitsTotal += amt;
                } else if (appliesIndirect) {
                  indirectBenefitsTotal += amt;
                }
              }
            }
          });

          const totalLaborBenefitsYr1 = directBenefitsTotal + indirectBenefitsTotal;
          const includeBenefits = project.includeLaborBenefitsInCOGS !== false;

          const totalFOHCapitalizedYr1 =
            indirectLaborAnnual +
            utilitiesAnnual +
            suppliesAnnual +
            factoryDeprYr1 +
            (includeBenefits ? totalLaborBenefitsYr1 : 0);

          return (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Schedule 5: Factory Overhead & Production Labor Benefits Schedule
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Comprehensive audit schedule of all indirect manufacturing costs capitalized into Cost of Goods Sold.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl mb-4">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Overhead Component</th>
                      <th className="py-2.5 px-3 text-left">Basis / Method</th>
                      <th className="py-2.5 px-3 text-right">Headcount / Qty</th>
                      <th className="py-2.5 px-3 text-right">Year 1 Amount ({c})</th>
                      <th className="py-2.5 px-3 text-right">Accounting Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {/* Indirect Labor */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        Indirect Labor (Supervisors, QC, Maintenance)
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {project.indirectLabor?.length || 0} production support role(s)
                      </td>
                      <td className="py-2 px-3 text-right font-financial text-slate-700">
                        {indirectHeadcount} worker{indirectHeadcount !== 1 ? 's' : ''}
                      </td>
                      <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                        {formatCurrency(indirectLaborAnnual, c)}
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-indigo-700 font-medium">
                        Capitalized in FOH (COGS)
                      </td>
                    </tr>

                    {/* Production Utilities */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        Utilities Attributed to Production (Power, Water, Gas)
                      </td>
                      <td className="py-2 px-3 text-slate-600">Factory electricity & processing water</td>
                      <td className="py-2 px-3 text-right font-financial text-slate-700">12 mos</td>
                      <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                        {formatCurrency(utilitiesAnnual, c)}
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-indigo-700 font-medium">
                        Capitalized in FOH (COGS)
                      </td>
                    </tr>

                    {/* Indirect Supplies */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        Indirect Factory Supplies & Consumables
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {(project.factorySupplies || []).length > 0
                          ? `${(project.factorySupplies || []).length} itemized supplies & cleaning items`
                          : 'Factory lubricants, sanitation, small tools'}
                      </td>
                      <td className="py-2 px-3 text-right font-financial text-slate-700">
                        {(project.factorySupplies || []).length > 0 ? `${(project.factorySupplies || []).length} lines` : 'Annual'}
                      </td>
                      <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                        {formatCurrency(suppliesAnnual, c)}
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-indigo-700 font-medium">
                        Capitalized in FOH (COGS)
                      </td>
                    </tr>

                    {/* Factory Depreciation */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        Depreciation Attributed to Production
                      </td>
                      <td className="py-2 px-3 text-slate-600">{factoryDeprMethodLabel}</td>
                      <td className="py-2 px-3 text-right font-financial text-slate-700">-</td>
                      <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                        {formatCurrency(factoryDeprYr1, c)}
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-indigo-700 font-medium">
                        Capitalized in FOH (COGS)
                      </td>
                    </tr>

                    {/* Production Labor Benefits */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Production Labor Benefits (SSS, PhilHealth, Pag-IBIG, 13th Mo.)</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {benefits.length} benefit schedule(s) for {directHeadcount + indirectHeadcount} plant staff
                      </td>
                      <td className="py-2 px-3 text-right font-financial text-slate-700">
                        {directHeadcount + indirectHeadcount} staff
                      </td>
                      <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                        {formatCurrency(totalLaborBenefitsYr1, c)}
                      </td>
                      <td className="py-2 px-3 text-right text-xs">
                        {includeBenefits ? (
                          <span className="text-emerald-700 font-medium">Capitalized in FOH (COGS)</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Classified under SG&A (OPEX)</span>
                        )}
                      </td>
                    </tr>

                    {/* Subtotal Factory Overhead */}
                    <tr className="acc-subtotal font-bold bg-slate-50/70 border-t-2 border-slate-200">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        Total Factory Overhead Capitalized in COGS (Year 1)
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-xs italic">
                        Combined Indirect Manufacturing Cost
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                        {indirectHeadcount} indirect staff
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950 text-sm">
                        {formatCurrency(totalFOHCapitalizedYr1, c)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs font-bold text-indigo-950">
                        COGS Inclusion: Active
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Itemized Employee Benefits Breakdown if configured */}
              {benefits.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Production Employee Benefits Breakdown Detail:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {benefits.map((b) => (
                      <div key={b.id} className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800 block truncate">{b.name}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Mode:{' '}
                          {b.type === 'percentage'
                            ? `${b.rateOrAmount}% of basic`
                            : b.type === 'fixed_monthly_per_head'
                            ? `${formatCurrency(b.rateOrAmount, c)}/head/mo`
                            : `${formatCurrency(b.rateOrAmount, c)} lump sum`}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-medium block mt-0.5">
                          Applies to:{' '}
                          {b.appliesTo === 'both'
                            ? 'Direct & Indirect Staff'
                            : b.appliesTo === 'direct_only'
                            ? 'Direct Labor Only'
                            : 'Indirect Labor Only'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
