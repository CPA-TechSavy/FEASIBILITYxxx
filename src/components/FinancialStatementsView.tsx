import { useState } from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import {
  FileText,
  DollarSign,
  PieChart,
  Scale,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface FinancialStatementsViewProps {
  project: FeasibilityProject;
  financials: YearFinancials[];
}

type StatementViewType = 'all' | 'income' | 'cashflow' | 'balance' | 'equity';

export default function FinancialStatementsView({
  project,
  financials,
}: FinancialStatementsViewProps) {
  const [selectedView, setSelectedView] = useState<StatementViewType>('all');
  const c = project.currency;

  const years5 = financials.slice(1); // Year 1 to 5
  const allYears = financials; // Year 0 to 5

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Control / View Switcher Header */}
      <div className="no-print bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Projected Financial Statements (5-Year Horizon)
          </h2>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setSelectedView('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              selectedView === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All Statements
          </button>
          <button
            onClick={() => setSelectedView('income')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              selectedView === 'income'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Income Statement
          </button>
          <button
            onClick={() => setSelectedView('cashflow')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              selectedView === 'cashflow'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cash Flows
          </button>
          <button
            onClick={() => setSelectedView('balance')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              selectedView === 'balance'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setSelectedView('equity')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              selectedView === 'equity'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Changes in Equity
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-10">
        {/* ========================================================================= */}
        {/* 1. PROJECTED STATEMENT OF COMPREHENSIVE INCOME */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'income') && (
          <div className="print-break-inside-avoid">
            <div className="text-center mb-4">
              <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                {project.title}
              </h3>
              <h4 className="text-sm font-semibold uppercase text-slate-700">
                Projected Statement of Comprehensive Income
              </h4>
              <p className="text-xs text-slate-500 italic">
                For the Years Ended 1 to 5 (Amounts in {c})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                    <th className="py-2 text-left w-1/3">Particulars</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {/* Revenue */}
                  <tr>
                    <td className="py-1.5 font-medium pl-1">Gross Sales Revenue</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.grossSales, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-4 text-slate-600">Less: Sales Discounts & Allowances</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                        {formatCurrency(-y.salesDiscounts, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/50">
                    <td className="py-1.5 pl-1">Net Sales</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.netSales, c)}
                      </td>
                    ))}
                  </tr>

                  {/* COGS breakdown */}
                  <tr>
                    <td className="py-1.5 font-medium pl-1 pt-3">Less: Cost of Goods Sold</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial"></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Direct Raw Materials</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.directMaterials, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Direct Labor</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.directLabor, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Factory / Service Overhead</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.factoryOverhead, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Depreciation - Machinery & Plant</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.factoryDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-medium">
                    <td className="py-1.5 pl-4 text-slate-700">Total Cost of Goods Sold</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-700">
                        {formatCurrency(-y.totalCOGS, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Gross Profit */}
                  <tr className="acc-subtotal font-semibold bg-indigo-50/30">
                    <td className="py-2 pl-1">Gross Profit</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-2 text-right font-financial text-indigo-950 font-bold">
                        {formatCurrency(y.grossProfit, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-xs text-slate-500 italic">
                    <td className="py-0.5 pl-4">Gross Profit Margin %</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-0.5 text-right font-financial">
                        {formatPercent(y.grossProfitMargin)}
                      </td>
                    ))}
                  </tr>

                  {/* Operating Expenses */}
                  <tr>
                    <td className="py-1.5 font-medium pl-1 pt-3">Less: Operating Expenses (SG&A)</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial"></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Administrative Expenses</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.adminExpenses, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Selling & Marketing Expenses</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.sellingExpenses, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Store / Office Rent & Utilities</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.utilitiesAndRent, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Other Operating / Regulatory Expenses</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.otherOpex, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Depreciation - Office & Fixtures</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.opexDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-medium">
                    <td className="py-1.5 pl-4 text-slate-700">Total Operating Expenses</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-700">
                        {formatCurrency(-y.totalOpex, c)}
                      </td>
                    ))}
                  </tr>

                  {/* EBIT */}
                  <tr className="acc-subtotal font-semibold bg-slate-50/50">
                    <td className="py-1.5 pl-1">Operating Income (EBIT)</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.ebit, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Finance Cost */}
                  <tr>
                    <td className="py-1.5 pl-4 text-slate-600">Less: Financing Cost (Bank Interest)</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                        {formatCurrency(-y.interestExpense, c)}
                      </td>
                    ))}
                  </tr>

                  {/* EBT */}
                  <tr className="acc-subtotal font-semibold">
                    <td className="py-1.5 pl-1">Earnings Before Taxes (EBT)</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.ebt, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Tax */}
                  <tr>
                    <td className="py-1.5 pl-4 text-slate-600">
                      Less: Provision for Income Tax ({project.taxRatePercent}%)
                    </td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                        {formatCurrency(-y.taxExpense, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Net Income */}
                  <tr className="acc-total font-bold bg-emerald-50/40 text-slate-900">
                    <td className="py-2.5 pl-1 uppercase font-bold tracking-wide">
                      Net Income After Tax
                    </td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-emerald-900">
                        {formatCurrency(y.netIncome, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-xs text-slate-500 italic">
                    <td className="py-1 pl-4">Net Profit Margin %</td>
                    {years5.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatPercent(y.netProfitMargin)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PROJECTED STATEMENT OF CASH FLOWS */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'cashflow') && (
          <div className="print-break-inside-avoid print-break-before pt-6 border-t border-slate-200">
            <div className="text-center mb-4">
              <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                {project.title}
              </h3>
              <h4 className="text-sm font-semibold uppercase text-slate-700">
                Projected Statement of Cash Flows
              </h4>
              <p className="text-xs text-slate-500 italic">
                From Pre-Operating Year 0 through Year 5 (Amounts in {c})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                    <th className="py-2 text-left w-1/3">Particulars</th>
                    <th className="py-2 text-right font-financial">Pre-Op (Yr 0)</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {/* Operating Cash Flow */}
                  <tr className="bg-slate-50/60 font-semibold">
                    <td colSpan={7} className="py-1.5 pl-1">
                      I. CASH FLOWS FROM OPERATING ACTIVITIES
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4">Net Income / (Pre-Operating Loss)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.netIncome, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Add: Non-Cash Depreciation Expense</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.year === 0 ? 0 : y.factoryDepreciation + y.opexDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">(Increase) / Decrease in Accounts Receivable</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : -(y.accountsReceivable - (allYears[y.year - 1]?.accountsReceivable || 0)),
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">(Increase) / Decrease in Inventories</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : -(y.inventory - (allYears[y.year - 1]?.inventory || 0)),
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Increase / (Decrease) in Accounts Payable</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : y.accountsPayable - (allYears[y.year - 1]?.accountsPayable || 0),
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Cash Provided by / (Used in) Operating Activities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.operatingCashFlow, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Investing Cash Flow */}
                  <tr className="bg-slate-50/60 font-semibold pt-2">
                    <td colSpan={7} className="py-1.5 pl-1">
                      II. CASH FLOWS FROM INVESTING ACTIVITIES
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Acquisition of Fixed Assets (CapEx)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.investingCashFlow, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Cash Provided by / (Used in) Investing Activities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.investingCashFlow, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Financing Cash Flow */}
                  <tr className="bg-slate-50/60 font-semibold pt-2">
                    <td colSpan={7} className="py-1.5 pl-1">
                      III. CASH FLOWS FROM FINANCING ACTIVITIES
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Equity Contribution by Owners</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.year === 0 ? project.financing.equityContribution : 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Proceeds from Bank Borrowing</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(y.year === 0 ? project.financing.bankLoanAmount : 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Bank Loan Principal Repayment</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(
                          y.year === 0
                            ? 0
                            : -y.currentPortionOfDebt,
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Dividend Distribution / Partner Drawings</td>
                    {allYears.map((y) => {
                      const div =
                        y.year > 0 && y.netIncome > 0
                          ? y.netIncome * (project.dividendPayoutPercent / 100)
                          : 0;
                      return (
                        <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                          {formatCurrency(-div, c)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Cash Provided by / (Used in) Financing Activities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.financingCashFlow, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Net Change in Cash */}
                  <tr className="acc-subtotal font-semibold bg-indigo-50/40">
                    <td className="py-2 pl-1">NET INCREASE / (DECREASE) IN CASH</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2 text-right font-financial font-bold">
                        {formatCurrency(y.netCashFlow, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-1">Add: Beginning Cash Balance</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.beginningCash, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-total font-bold bg-emerald-50/40">
                    <td className="py-2.5 pl-1 uppercase font-bold tracking-wide">
                      CASH BALANCE, END OF YEAR
                    </td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-emerald-950">
                        {formatCurrency(y.endingCash, c)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PROJECTED STATEMENT OF FINANCIAL POSITION (BALANCE SHEET) */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'balance') && (
          <div className="print-break-inside-avoid print-break-before pt-6 border-t border-slate-200">
            <div className="text-center mb-4">
              <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                {project.title}
              </h3>
              <h4 className="text-sm font-semibold uppercase text-slate-700">
                Projected Statement of Financial Position (Balance Sheet)
              </h4>
              <p className="text-xs text-slate-500 italic">
                As of Pre-Operating Year 0 through Year 5 (Amounts in {c})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                    <th className="py-2 text-left w-1/3">Particulars</th>
                    <th className="py-2 text-right font-financial">Pre-Op (Yr 0)</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {/* ASSETS */}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={7} className="py-1.5 pl-2 tracking-wide uppercase text-xs">
                      ASSETS
                    </td>
                  </tr>

                  {/* Current Assets */}
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Current Assets
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Cash and Cash Equivalents</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.cash, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Accounts Receivable (Net)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.accountsReceivable, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Inventories</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.inventory, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Total Current Assets</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.totalCurrentAssets, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Non-Current Assets */}
                  <tr className="bg-slate-50 font-semibold pt-2">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Non-Current Assets
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Property, Plant & Equipment (At Cost)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.grossPPE, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-600">Less: Accumulated Depreciation</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial text-slate-600">
                        {formatCurrency(-y.accumulatedDepreciation, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Net Property, Plant & Equipment</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.netPPE, c)}
                      </td>
                    ))}
                  </tr>

                  {/* TOTAL ASSETS */}
                  <tr className="acc-total font-bold bg-indigo-50/60 text-indigo-950">
                    <td className="py-2.5 pl-2 uppercase font-bold tracking-wide">TOTAL ASSETS</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-indigo-950">
                        {formatCurrency(y.totalAssets, c)}
                      </td>
                    ))}
                  </tr>

                  {/* LIABILITIES AND EQUITY */}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={7} className="py-1.5 pl-2 tracking-wide uppercase text-xs">
                      LIABILITIES AND EQUITY
                    </td>
                  </tr>

                  {/* Current Liabilities */}
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Current Liabilities
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Accounts Payable</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.accountsPayable, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Current Portion of Bank Loan</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.currentPortionOfDebt, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Total Current Liabilities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.totalCurrentLiabilities, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Non-Current Liabilities */}
                  <tr className="bg-slate-50 font-semibold pt-2">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Non-Current Liabilities
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Long-Term Bank Loan (Net of current)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.longTermDebt, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Total Liabilities</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.totalLiabilities, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Equity */}
                  <tr className="bg-slate-50 font-semibold pt-2">
                    <td colSpan={7} className="py-1 pl-2 text-slate-700">
                      Owner’s / Partners’ Equity
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Paid-In Capital</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.paidInCapital, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-slate-700">Retained Earnings</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1 text-right font-financial">
                        {formatCurrency(y.retainedEarnings, c)}
                      </td>
                    ))}
                  </tr>
                  <tr className="acc-subtotal font-semibold bg-slate-50/40">
                    <td className="py-1.5 pl-2">Total Equity</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                        {formatCurrency(y.totalEquity, c)}
                      </td>
                    ))}
                  </tr>

                  {/* TOTAL LIABILITIES AND EQUITY */}
                  <tr className="acc-total font-bold bg-indigo-50/60 text-indigo-950">
                    <td className="py-2.5 pl-2 uppercase font-bold tracking-wide">
                      TOTAL LIABILITIES & EQUITY
                    </td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-indigo-950">
                        {formatCurrency(y.totalLiabilitiesAndEquity, c)}
                      </td>
                    ))}
                  </tr>

                  {/* Balance Verification Row */}
                  <tr className="no-print bg-slate-50/90 text-xs">
                    <td className="py-1.5 pl-2 font-medium text-slate-500">
                      Balance Check [Assets - (Liab + Eq)]
                    </td>
                    {allYears.map((y) => (
                      <td
                        key={y.year}
                        className={`py-1.5 text-right font-financial font-bold ${
                          y.isBalanced ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {y.isBalanced ? '0 (Balanced)' : formatCurrency(y.balanceDifference, c)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. STATEMENT OF CHANGES IN EQUITY */}
        {/* ========================================================================= */}
        {(selectedView === 'all' || selectedView === 'equity') && (
          <div className="print-break-inside-avoid print-break-before pt-6 border-t border-slate-200">
            <div className="text-center mb-4">
              <h3 className="text-base sm:text-lg font-bold font-serif-title uppercase tracking-wider text-slate-900">
                {project.title}
              </h3>
              <h4 className="text-sm font-semibold uppercase text-slate-700">
                Projected Statement of Changes in Equity
              </h4>
              <p className="text-xs text-slate-500 italic">
                From Inception through Year 5 (Amounts in {c})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                    <th className="py-2 text-left w-1/3">Particulars</th>
                    <th className="py-2 text-right font-financial">Pre-Op (Yr 0)</th>
                    <th className="py-2 text-right font-financial">Year 1</th>
                    <th className="py-2 text-right font-financial">Year 2</th>
                    <th className="py-2 text-right font-financial">Year 3</th>
                    <th className="py-2 text-right font-financial">Year 4</th>
                    <th className="py-2 text-right font-financial">Year 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  <tr>
                    <td className="py-1.5 pl-1">Beginning Equity Balance</td>
                    {allYears.map((y) => {
                      const prevEquity = y.year === 0 ? 0 : allYears[y.year - 1].totalEquity;
                      return (
                        <td key={y.year} className="py-1.5 text-right font-financial">
                          {formatCurrency(prevEquity, c)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-1">Add: Owner / Partner Capital Contribution</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                        {formatCurrency(y.year === 0 ? project.financing.equityContribution : 0, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-1">Add / (Deduct): Net Income / (Pre-Operating Expenses)</td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-1.5 text-right font-financial">
                        {formatCurrency(y.netIncome, c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-1 text-slate-600">Less: Owner Drawings / Dividends Declared</td>
                    {allYears.map((y) => {
                      const div =
                        y.year > 0 && y.netIncome > 0
                          ? y.netIncome * (project.dividendPayoutPercent / 100)
                          : 0;
                      return (
                        <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                          {formatCurrency(-div, c)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="acc-total font-bold bg-emerald-50/40 text-slate-900">
                    <td className="py-2.5 pl-1 uppercase font-bold tracking-wide">
                      ENDING EQUITY BALANCE
                    </td>
                    {allYears.map((y) => (
                      <td key={y.year} className="py-2.5 text-right font-financial font-bold text-emerald-950">
                        {formatCurrency(y.totalEquity, c)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
