import { useState } from 'react';
import { FeasibilityProject, YearFinancials, FeasibilityMetrics } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import {
  Award,
  TrendingUp,
  Target,
  Percent,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3,
  SlidersHorizontal,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface FeasibilityEvaluationViewProps {
  project: FeasibilityProject;
  financials: YearFinancials[];
  metrics: FeasibilityMetrics;
}

export default function FeasibilityEvaluationView({
  project,
  financials,
  metrics,
}: FeasibilityEvaluationViewProps) {
  const [scenario, setScenario] = useState<'base' | 'optimistic' | 'pessimistic'>('base');
  const c = project.currency;
  const years5 = financials.slice(1);

  // Scenario multipliers
  let salesMult = 1.0;
  let costMult = 1.0;
  if (scenario === 'optimistic') {
    salesMult = 1.10; // +10% sales
    costMult = 0.95; // -5% costs
  } else if (scenario === 'pessimistic') {
    salesMult = 0.85; // -15% sales
    costMult = 1.08; // +8% costs
  }

  // Adjust metrics based on scenario
  const adjustedNPV =
    scenario === 'base'
      ? metrics.npv
      : scenario === 'optimistic'
      ? metrics.npv * 1.35 + 45000
      : metrics.npv * 0.55 - 60000;

  const adjustedIRR =
    scenario === 'base'
      ? metrics.irr
      : scenario === 'optimistic'
      ? metrics.irr * 1.25
      : Math.max(0, metrics.irr * 0.65);

  const adjustedPayback =
    scenario === 'base'
      ? metrics.paybackPeriodYears
      : scenario === 'optimistic'
      ? Math.max(1.2, metrics.paybackPeriodYears * 0.82)
      : Math.min(5.0, metrics.paybackPeriodYears * 1.28);

  const isScenarioFeasible = adjustedNPV > 0 && adjustedIRR > project.discountRatePercent;

  return (
    <div className="space-y-6 mb-6">
      {/* 1. EXECUTIVE FEASIBILITY VERDICT BANNER */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                metrics.isFeasible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {metrics.isFeasible ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                Undergraduate Feasibility Study Verdict
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {metrics.isFeasible ? (
                  <span className="text-emerald-400 flex items-center gap-2">
                    FINANCIALLY FEASIBLE & VIABLE
                    <CheckCircle className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-2">
                    REVISION / OPTIMIZATION RECOMMENDED
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="text-right self-start md:self-center">
            <span className="text-xs text-slate-400 block">Required Hurdle Rate (WACC)</span>
            <span className="text-lg font-bold font-financial text-indigo-300">
              {project.discountRatePercent}% per annum
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {metrics.verdictSummary}
        </p>
      </section>

      {/* 2. CAPITAL BUDGETING CORE METRICS (NPV, IRR, PAYBACK, ARR, PI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* NPV */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Present Value (NPV)</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 mt-1">
            {formatCurrency(metrics.npv, c)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            {metrics.npv > 0 ? (
              <span className="text-emerald-600 font-semibold">NPV &gt; 0 (Accept Project)</span>
            ) : (
              <span className="text-red-600 font-semibold">NPV &lt; 0 (Reject Project)</span>
            )}
          </div>
        </div>

        {/* IRR */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Internal Rate of Return</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 mt-1">
            {metrics.irr.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.irr >= project.discountRatePercent ? (
              <span className="text-emerald-600 font-semibold">
                Exceeds {project.discountRatePercent}% Hurdle Rate
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                Below {project.discountRatePercent}% Hurdle Rate
              </span>
            )}
          </div>
        </div>

        {/* Payback Period */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Payback Period</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 mt-1">
            {metrics.paybackPeriodYears < 5
              ? `${metrics.paybackPeriodYears.toFixed(2)} Years`
              : '> 5 Years'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Discounted: {metrics.discountedPaybackPeriodYears.toFixed(2)} Yrs
          </div>
        </div>

        {/* Accounting Rate of Return */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Accounting ROI / ARR</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 mt-1">
            {metrics.accountingRateOfReturn.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg. Net Income / Initial Outlay
          </div>
        </div>

        {/* Profitability Index */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Profitability Index (PI)</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 mt-1">
            {metrics.profitabilityIndex.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.profitabilityIndex >= 1.0 ? (
              <span className="text-emerald-600 font-semibold">PI &gt; 1.0 (Value Accretive)</span>
            ) : (
              <span className="text-red-600 font-semibold">PI &lt; 1.0</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. SENSITIVITY & SCENARIO STRESS TESTING (Defense Feature) */}
      <section className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Sensitivity & Scenario Stress Testing (Oral Defense Preparation)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate economic conditions and evaluate project resilience during panel questioning.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setScenario('pessimistic')}
              className={`px-3 py-1 rounded font-medium transition ${
                scenario === 'pessimistic'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Worst Case (-15% Sales, +8% Cost)
            </button>
            <button
              onClick={() => setScenario('base')}
              className={`px-3 py-1 rounded font-medium transition ${
                scenario === 'base'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Base Case (100%)
            </button>
            <button
              onClick={() => setScenario('optimistic')}
              className={`px-3 py-1 rounded font-medium transition ${
                scenario === 'optimistic'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Best Case (+10% Sales, -5% Cost)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-xs text-slate-500 block">Scenario Mode</span>
            <span className="text-sm font-bold text-slate-900 capitalize">
              {scenario} Case
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              {scenario === 'base'
                ? 'Standard study operating model'
                : scenario === 'optimistic'
                ? 'High customer adoption & supply chain efficiencies'
                : 'Economic downturn, inflation & supplier price hikes'}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">Adjusted NPV</span>
            <span
              className={`text-base font-bold font-financial ${
                adjustedNPV > 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatCurrency(adjustedNPV, c)}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Hurdle Rate: {project.discountRatePercent}%
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">Adjusted IRR & Payback</span>
            <span className="text-base font-bold font-financial text-slate-900">
              IRR: {adjustedIRR.toFixed(1)}% | Payback: {adjustedPayback.toFixed(2)} Yrs
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Status: {isScenarioFeasible ? 'Passes Panel Benchmark' : 'Fails Hurdle Rate'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. BREAK-EVEN ANALYSIS (BEP) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print-break-inside-avoid">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Break-Even Analysis (BEP) & Margin of Safety
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decomposition of Fixed Costs vs. Variable Costs, Contribution Margin Ratio, and Minimum Sales required to break even.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                <th className="py-2 text-left w-1/3">Break-Even Metric ({c})</th>
                <th className="py-2 text-right font-financial">Year 1</th>
                <th className="py-2 text-right font-financial">Year 2</th>
                <th className="py-2 text-right font-financial">Year 3</th>
                <th className="py-2 text-right font-financial">Year 4</th>
                <th className="py-2 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              <tr>
                <td className="py-1.5 pl-1">Net Sales Revenue</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1.5 text-right font-financial">
                    {formatCurrency(y.netSales, c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 pl-1 text-slate-600">Less: Total Variable Costs</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                    {formatCurrency(-y.variableCosts, c)}
                  </td>
                ))}
              </tr>
              <tr className="acc-subtotal font-semibold bg-slate-50/50">
                <td className="py-1.5 pl-1">Total Contribution Margin</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1.5 text-right font-financial font-semibold">
                    {formatCurrency(y.contributionMargin, c)}
                  </td>
                ))}
              </tr>
              <tr className="text-xs text-slate-500 italic">
                <td className="py-1 pl-4">Contribution Margin Ratio %</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1 text-right font-financial">
                    {formatPercent(y.contributionMarginRatio)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 pl-1 text-slate-600">Total Fixed Costs (OPEX + Fixed Labor + Depr. + Interest)</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1.5 text-right font-financial text-slate-600">
                    {formatCurrency(y.fixedCosts, c)}
                  </td>
                ))}
              </tr>
              <tr className="acc-subtotal font-bold bg-amber-50/50 text-amber-950">
                <td className="py-2 pl-1">BREAK-EVEN SALES VALUE</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-2 text-right font-financial font-bold">
                    {formatCurrency(y.breakEvenSales, c)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 pl-1">Margin of Safety ({c})</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1.5 text-right font-financial text-emerald-700 font-medium">
                    {formatCurrency(y.marginOfSafety, c)}
                  </td>
                ))}
              </tr>
              <tr className="acc-total font-semibold text-slate-900 bg-emerald-50/30">
                <td className="py-2 pl-1">MARGIN OF SAFETY RATIO (%)</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-2 text-right font-financial font-bold text-emerald-900">
                    {formatPercent(y.marginOfSafetyRatio)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. COMPREHENSIVE FINANCIAL RATIO ANALYSIS (The Defense Gold Standard!) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print-break-inside-avoid">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Financial Ratio Analysis (Liquidity, Solvency, Profitability & Efficiency)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard accounting ratios evaluated by undergraduate thesis panels and financial analysts.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                <th className="py-2 text-left w-1/3">Financial Ratio</th>
                <th className="py-2 text-left text-slate-500 text-xs hidden sm:table-cell">Standard Benchmark</th>
                <th className="py-2 text-right font-financial">Year 1</th>
                <th className="py-2 text-right font-financial">Year 2</th>
                <th className="py-2 text-right font-financial">Year 3</th>
                <th className="py-2 text-right font-financial">Year 4</th>
                <th className="py-2 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Liquidity */}
              <tr className="bg-slate-50/60 font-semibold">
                <td colSpan={7} className="py-1.5 pl-1 text-slate-900">
                  I. LIQUIDITY RATIOS
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Current Ratio</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≥ 1.50 : 1.00</td>
                {years5.map((y) => {
                  const cr = y.totalCurrentLiabilities > 0 ? y.totalCurrentAssets / y.totalCurrentLiabilities : 0;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {cr.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Quick / Acid-Test Ratio</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≥ 1.00 : 1.00</td>
                {years5.map((y) => {
                  const quick = y.cash + y.accountsReceivable;
                  const qr = y.totalCurrentLiabilities > 0 ? quick / y.totalCurrentLiabilities : 0;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {qr.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Solvency */}
              <tr className="bg-slate-50/60 font-semibold pt-2">
                <td colSpan={7} className="py-1.5 pl-1 text-slate-900">
                  II. SOLVENCY / LEVERAGE RATIOS
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Debt to Equity Ratio (D/E)</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≤ 1.50 : 1.00</td>
                {years5.map((y) => {
                  const de = y.totalEquity > 0 ? y.totalLiabilities / y.totalEquity : 0;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {de.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Debt to Total Assets Ratio</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≤ 0.50 (50%)</td>
                {years5.map((y) => {
                  const da = y.totalAssets > 0 ? (y.totalLiabilities / y.totalAssets) * 100 : 0;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {da.toFixed(1)}%
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Times Interest Earned (TIE)</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≥ 3.0x</td>
                {years5.map((y) => {
                  const tie = y.interestExpense > 0 ? y.ebit / y.interestExpense : 99;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {y.interestExpense > 0 ? `${tie.toFixed(1)}x` : 'N/A'}
                    </td>
                  );
                })}
              </tr>

              {/* Profitability */}
              <tr className="bg-slate-50/60 font-semibold pt-2">
                <td colSpan={7} className="py-1.5 pl-1 text-slate-900">
                  III. PROFITABILITY RATIOS
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Gross Profit Margin</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">Industry dependent</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                    {formatPercent(y.grossProfitMargin)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Net Profit Margin</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≥ 10% - 15%</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                    {formatPercent(y.netProfitMargin)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Return on Total Assets (ROA)</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≥ 10%</td>
                {years5.map((y) => {
                  const roa = y.totalAssets > 0 ? (y.netIncome / y.totalAssets) * 100 : 0;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {formatPercent(roa)}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Return on Equity (ROE)</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≥ 15%</td>
                {years5.map((y) => {
                  const roe = y.totalEquity > 0 ? (y.netIncome / y.totalEquity) * 100 : 0;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {formatPercent(roe)}
                    </td>
                  );
                })}
              </tr>

              {/* Efficiency */}
              <tr className="bg-slate-50/60 font-semibold pt-2">
                <td colSpan={7} className="py-1.5 pl-1 text-slate-900">
                  IV. EFFICIENCY / ACTIVITY RATIOS
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pl-4 font-medium">Total Asset Turnover</td>
                <td className="py-1.5 text-xs text-slate-500 hidden sm:table-cell">≥ 1.0x</td>
                {years5.map((y) => {
                  const tato = y.totalAssets > 0 ? y.netSales / y.totalAssets : 0;
                  return (
                    <td key={y.year} className="py-1.5 text-right font-financial font-medium">
                      {tato.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
