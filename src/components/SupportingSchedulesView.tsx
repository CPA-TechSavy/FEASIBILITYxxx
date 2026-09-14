import { FeasibilityProject } from '../types';
import {
  calculateLoanAmortization,
  calculateDepreciation,
  formatCurrency,
} from '../utils/financialCalculations';
import { Table, Calendar, Layers, Receipt, Calculator, Tag } from 'lucide-react';

interface SupportingSchedulesViewProps {
  project: FeasibilityProject;
}

export default function SupportingSchedulesView({ project }: SupportingSchedulesViewProps) {
  const c = project.currency;
  const loanSchedule = calculateLoanAmortization(project);
  const depreciationSchedule = calculateDepreciation(project);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-5 sm:p-6 space-y-8">
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

      {/* SCHEDULE 1: LOAN AMORTIZATION SCHEDULE */}
      <section className="print-break-inside-avoid">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule 1: Bank Debt Amortization Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Principal: {formatCurrency(project.financing.bankLoanAmount, c)} at {project.financing.annualInterestRate}% for {project.financing.loanTermYears} years.
            </p>
          </div>
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule 3: Working Capital Buffer & Depository Cash Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of Day 1 initial liquidity into Cash on Hand and interest-bearing Cash in Bank.
            </p>
          </div>
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
    </div>
  );
}
