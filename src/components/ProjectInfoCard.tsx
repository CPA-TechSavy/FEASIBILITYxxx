import { useState } from 'react';
import { FeasibilityProject, FeasibilityMetrics, YearFinancials } from '../types';
import {
  GraduationCap,
  Building2,
  Users,
  Percent,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculations';

interface ProjectInfoCardProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  metrics: FeasibilityMetrics;
  financials: YearFinancials[];
}

export default function ProjectInfoCard({
  project,
  onUpdateProject,
  metrics,
  financials,
}: ProjectInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Check balance sheet integrity across all years
  const allBalanced = financials.every((f) => f.isBalanced);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6 transition">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={project.title}
              onChange={(e) => onUpdateProject({ ...project, title: e.target.value })}
              className="text-xl font-bold text-slate-900 w-full border-b border-indigo-400 focus:outline-none pb-1"
              placeholder="Feasibility Study Title"
            />
          ) : (
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              {project.title}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              {isEditing ? (
                <input
                  type="text"
                  value={project.proponents}
                  onChange={(e) => onUpdateProject({ ...project, proponents: e.target.value })}
                  className="border-b border-slate-300 text-xs text-slate-700 focus:outline-none"
                  placeholder="Proponents / Authors"
                />
              ) : (
                <span>{project.proponents}</span>
              )}
            </span>

            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              {isEditing ? (
                <input
                  type="text"
                  value={project.academicProgram}
                  onChange={(e) => onUpdateProject({ ...project, academicProgram: e.target.value })}
                  className="border-b border-slate-300 text-xs text-slate-700 focus:outline-none"
                  placeholder="Degree Program"
                />
              ) : (
                <span>{project.academicProgram}</span>
              )}
            </span>

            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              {isEditing ? (
                <input
                  type="text"
                  value={project.institution}
                  onChange={(e) => onUpdateProject({ ...project, institution: e.target.value })}
                  className="border-b border-slate-300 text-xs text-slate-700 focus:outline-none"
                  placeholder="University / College"
                />
              ) : (
                <span>{project.institution} ({project.academicYear})</span>
              )}
            </span>
          </div>
        </div>

        {/* Action button & Balancing Pill */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {allBalanced ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              BS Balanced (A = L + E)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              BS Difference Detected
            </span>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 transition"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Done
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                Edit Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Academic Financial Assumptions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-1">
        {/* Total Project Cost */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Project Outlay
          </span>
          <span className="text-base font-bold text-slate-900 font-financial mt-0.5 block">
            {formatCurrency(metrics.totalInitialInvestment, project.currency)}
          </span>
          <span className="text-[10px] text-slate-500">
            Equity: {Math.round((metrics.equityContribution / Math.max(1, metrics.totalInitialInvestment)) * 100)}% | Debt: {Math.round((metrics.debtFinancing / Math.max(1, metrics.totalInitialInvestment)) * 100)}%
          </span>
        </div>

        {/* Corporate Tax Rate */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Income Tax Rate
          </label>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              min="0"
              max="60"
              value={project.taxRatePercent}
              onChange={(e) =>
                onUpdateProject({ ...project, taxRatePercent: parseFloat(e.target.value) || 0 })
              }
              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-sm font-semibold font-financial text-slate-900 focus:outline-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">Corporate tax rate</span>
        </div>

        {/* Hurdle / Discount Rate */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Hurdle Rate (WACC)
          </label>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              min="1"
              max="50"
              step="0.5"
              value={project.discountRatePercent}
              onChange={(e) =>
                onUpdateProject({ ...project, discountRatePercent: parseFloat(e.target.value) || 0 })
              }
              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-sm font-semibold font-financial text-slate-900 focus:outline-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">Used for NPV & Payback</span>
        </div>

        {/* Inflation Rate */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Inflation Escalation
          </label>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              value={project.inflationRatePercent}
              onChange={(e) =>
                onUpdateProject({ ...project, inflationRatePercent: parseFloat(e.target.value) || 0 })
              }
              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-sm font-semibold font-financial text-slate-900 focus:outline-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">Applied to annual wages</span>
        </div>

        {/* Dividend Payout % */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Dividend Payout
          </label>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              min="0"
              max="100"
              value={project.dividendPayoutPercent}
              onChange={(e) =>
                onUpdateProject({ ...project, dividendPayoutPercent: parseFloat(e.target.value) || 0 })
              }
              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-sm font-semibold font-financial text-slate-900 focus:outline-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">% of Net Income</span>
        </div>

        {/* Sales Discount / Returns */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Sales Discounts
          </label>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={project.salesDiscountsPercent}
              onChange={(e) =>
                onUpdateProject({ ...project, salesDiscountsPercent: parseFloat(e.target.value) || 0 })
              }
              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-sm font-semibold font-financial text-slate-900 focus:outline-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">Allowance on gross sales</span>
        </div>
      </div>
    </section>
  );
}
