import {
  Calculator,
  Download,
  Cloud,
  Building2,
  PlusCircle,
} from 'lucide-react';
import { CurrencySymbol, FeasibilityProject, YearFinancials, FeasibilityMetrics } from '../types';
import { exportProjectJSON } from '../utils/exportHelpers';

interface HeaderProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  financials: YearFinancials[];
  metrics: FeasibilityMetrics;
  onOpenCloudflareModal: () => void;
  onOpenBankModal?: () => void;
  onOpenCompanyModal: () => void;
}

const CURRENCIES: { symbol: CurrencySymbol; label: string }[] = [
  { symbol: '₱', label: 'PHP (₱)' },
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '¥', label: 'JPY (¥)' },
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: 'S$', label: 'SGD (S$)' },
];

export default function Header({
  project,
  onUpdateProject,
  financials,
  metrics,
  onOpenCloudflareModal,
  onOpenBankModal,
  onOpenCompanyModal,
}: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* App Title & Branding */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-inner shrink-0">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  FeasiCalc
                </span>
                <button
                  type="button"
                  onClick={onOpenCompanyModal}
                  title={
                    project.companyAccount
                      ? `Edit Company Account: ${project.companyAccount.entityName} (${project.companyAccount.classification})`
                      : 'Add Company Account (Entity Name, Classification, Nature, Purpose & Capital)'
                  }
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    project.companyAccount
                      ? 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-500/60 text-indigo-100 shadow-xs'
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-sm'
                  }`}
                >
                  {project.companyAccount ? (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                      <span className="max-w-[120px] sm:max-w-[170px] truncate font-medium">
                        {project.companyAccount.entityName || 'Company Account'}
                      </span>
                      <span className="hidden sm:inline px-1.5 py-0.2 rounded text-[10px] bg-indigo-900/90 text-indigo-200 border border-indigo-700/50">
                        {project.companyAccount.classification === 'Sole Proprietorship'
                          ? 'Sole Pro'
                          : 'Partnership'}
                      </span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
                      <span>Add Company Account</span>
                    </>
                  )}
                </button>
              </div>
              {project.title && (
                <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                  {project.title}
                </p>
              )}
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/90 rounded-lg px-2 py-1 border border-slate-700">
              <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Currency:</span>
              <select
                aria-label="Currency"
                value={project.currency}
                onChange={(e) =>
                  onUpdateProject({ ...project, currency: e.target.value as CurrencySymbol })
                }
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol} className="bg-slate-800 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Save / Export JSON */}
            <button
              onClick={() => exportProjectJSON(project)}
              title="Save project model to .json file"
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Save</span>
            </button>

            {/* Cloudflare Pages Guide Button */}
            <button
              onClick={onOpenCloudflareModal}
              title="How to publish this app to Cloudflare Pages for free"
              className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold shadow flex items-center gap-1.5 transition cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
