import { FeasibilityProject } from '../types';
import {
  calculateLoanAmortization,
  calculateDepreciation,
  formatCurrency,
} from '../utils/financialCalculations';
import { Table, Calendar, Layers, Receipt } from 'lucide-react';

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

      {/* SCHEDULE 2: STRAIGHT-LINE DEPRECIATION SCHEDULE */}
      <section className="print-break-inside-avoid">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule 2: Straight-Line Fixed Asset Depreciation Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Depreciation Base = (Historical Cost - Estimated Salvage Value) / Estimated Useful Life.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left">Asset Description</th>
                <th className="py-2.5 px-3 text-right">Acquisition Cost</th>
                <th className="py-2.5 px-3 text-right">Life (Yrs)</th>
                <th className="py-2.5 px-3 text-right">Salvage Value</th>
                <th className="py-2.5 px-3 text-right">Annual Depr.</th>
                <th className="py-2.5 px-3 text-right">Yr 1 Book Val</th>
                <th className="py-2.5 px-3 text-right">Yr 3 Book Val</th>
                <th className="py-2.5 px-3 text-right">Yr 5 Book Val</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {depreciationSchedule.map((item) => {
                const yr1BV = item.yearValues.find((y) => y.year === 1)?.bookValue || 0;
                const yr3BV = item.yearValues.find((y) => y.year === 3)?.bookValue || 0;
                const yr5BV = item.yearValues.find((y) => y.year === 5)?.bookValue || 0;

                return (
                  <tr key={item.assetId} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">{item.assetName}</td>
                    <td className="py-2 px-3 text-right font-financial">
                      {formatCurrency(item.cost, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial">{item.usefulLife}</td>
                    <td className="py-2 px-3 text-right font-financial text-slate-600">
                      {formatCurrency(item.salvageValue, c)}
                    </td>
                    <td className="py-2 px-3 text-right font-financial font-semibold text-slate-900">
                      {formatCurrency(item.annualDepreciation, c)}
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
                    depreciationSchedule.reduce((s, d) => s + d.annualDepreciation, 0),
                    c
                  )}
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-right text-xs text-slate-500 italic">
                  Straight-Line Method
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
