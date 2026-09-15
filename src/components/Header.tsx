import { useState, useRef, ChangeEvent } from 'react';
import {
  Calculator,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  Cloud,
  Layers,
  Check,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { CurrencySymbol, FeasibilityProject, YearFinancials, FeasibilityMetrics } from '../types';
import { BLANK_PROJECT } from '../data/sampleProjects';
import { exportProjectJSON, exportToExcel } from '../utils/exportHelpers';

interface HeaderProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  financials: YearFinancials[];
  metrics: FeasibilityMetrics;
  onOpenCloudflareModal: () => void;
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
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.title !== undefined && parsed.products) {
          onUpdateProject(parsed);
        } else {
          alert('Invalid feasibility project JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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

            {/* Clean Slate / Reset Button */}
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Reset to a clean slate? This will clear all current entries and set up a fresh, blank feasibility study.'
                  )
                ) {
                  onUpdateProject(JSON.parse(JSON.stringify(BLANK_PROJECT)));
                }
              }}
              title="Start a fresh, blank feasibility study"
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Clean Slate</span>
            </button>

            {/* Hidden JSON file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            {/* Save / Export JSON */}
            <button
              onClick={() => exportProjectJSON(project)}
              title="Save project model to .json file"
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Save</span>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Open / Import saved feasibility .json file"
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Open</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={() => exportToExcel(project, financials, metrics)}
              title="Export all financial statements to Excel (.xls)"
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-emerald-300 flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Print / Thesis PDF */}
            <button
              onClick={() => window.print()}
              title="Print CPA-standard financial statements or Save as PDF"
              className="px-2.5 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-white shadow flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Cloudflare Pages Guide Button */}
            <button
              onClick={onOpenCloudflareModal}
              title="How to publish this app to Cloudflare Pages for free"
              className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold shadow flex items-center gap-1.5 transition"
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
