import { useState } from 'react';
import { FeasibilityProject, FeasibilityMetrics } from '../types';
import { BookOpen, HelpCircle, FileCheck, Edit3, Check } from 'lucide-react';

interface NotesAndDefenseNotesProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
  metrics: FeasibilityMetrics;
}

export default function NotesAndDefenseNotes({
  project,
  onUpdateProject,
  metrics,
}: NotesAndDefenseNotesProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(project.academicNotes);

  const handleSaveNotes = () => {
    onUpdateProject({ ...project, academicNotes: notesText });
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-6 mb-8">
      {/* 1. NOTES TO FINANCIAL STATEMENTS (Thesis Chapter 5 Section) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm print-break-inside-avoid">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Notes to the Projected Financial Statements
            </h3>
          </div>

          <button
            onClick={() => {
              if (isEditingNotes) handleSaveNotes();
              else setIsEditingNotes(true);
            }}
            className="no-print text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            {isEditingNotes ? (
              <>
                <Check className="w-3.5 h-3.5" /> Save Notes
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" /> Edit Accounting Policy
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            <strong>Note 1 — General Information & Operational Basis:</strong> The feasibility study is
            prepared for <span className="font-semibold text-slate-800">{project.title}</span>,
            formulated by {project.proponents} under {project.academicProgram} of {project.institution}. The
            operational projections encompass a 5-year planning horizon under the assumption of a going concern.
          </p>

          <p>
            <strong>Note 2 — Summary of Significant Accounting Policies:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <em>Revenue Recognition:</em> Revenue from contracts with customers is recognized upon the
              transfer of promised goods or delivery of services, net of sales allowances ({project.salesDiscountsPercent}%).
            </li>
            <li>
              <em>Property, Plant and Equipment:</em> Measured at historical acquisition cost. Depreciation
              is computed on a straight-line basis over estimated useful lives with respective salvage values.
            </li>
            <li>
              <em>Income Taxes:</em> Current corporate income tax is provided at the statutory rate of{' '}
              {project.taxRatePercent}% on taxable operating profits.
            </li>
            <li>
              <em>Discount Rate & Hurdle Criteria:</em> Free cash flows are evaluated using a{' '}
              {project.discountRatePercent}% discount rate reflecting the weighted average cost of capital
              (WACC).
            </li>
          </ul>

          {isEditingNotes ? (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Academic / Specific Notes:
              </label>
              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-indigo-500 font-normal"
              />
            </div>
          ) : (
            <p className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 italic">
              "{project.academicNotes}"
            </p>
          )}
        </div>
      </section>

      {/* 2. PANEL DEFENSE CHEAT SHEET (Hidden on Print, invaluable for students) */}
      <section className="no-print bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-indigo-700" />
          <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wide">
            Undergraduate Panel Defense Guide & Common Question Preparation
          </h3>
        </div>
        <p className="text-xs text-indigo-900/80 mb-4">
          Key talking points to explain the financial chapter with confidence before the thesis defense panel:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Why is your project considered financially feasible?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              "The venture achieves a Net Present Value (NPV) of{' '}
              <strong>{project.currency}{Math.round(metrics.npv).toLocaleString()}</strong>, an Internal Rate of
              Return (IRR) of <strong>{metrics.irr.toFixed(1)}%</strong> exceeding our{' '}
              {project.discountRatePercent}% hurdle rate, and an estimated Payback Period of{' '}
              <strong>{metrics.paybackPeriodYears.toFixed(2)} years</strong>, well within our 5-year study horizon."
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              How did you balance the Balance Sheet?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              "Every year satisfies the fundamental accounting equation: Total Assets = Total Liabilities + Owner's
              Equity. Ending cash from the Statement of Cash Flows links directly into the Balance Sheet, while net
              income after dividends accumulates in Retained Earnings."
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              What is your Break-Even Point (BEP) in Year 1?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              "Our Year 1 fixed costs are covered at our break-even sales volume, providing a healthy Margin of Safety
              buffer ensuring that even if sales fluctuate in the early launch phase, the business remains solvent."
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                4
              </span>
              How resilient is the venture to inflation or cost increases?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              "Under our Sensitivity Analysis stress test (Worst Case with a 15% drop in sales volume and 8% cost
              inflation), our contribution margin remains positive and operations continue to generate sufficient
              debt service coverage."
            </p>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE BLOCK (Visible on Print for Thesis Submission) */}
      <section className="print-only hidden pt-8">
        <div className="text-xs text-slate-800 mb-6">
          <p className="font-semibold">PREPARED AND SUBMITTED BY:</p>
        </div>
        <div className="grid grid-cols-3 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-black pb-1 mb-1 font-bold">
              {project.proponents.split(',')[0] || 'Lead Proponent'}
            </div>
            <div>Student Proponent</div>
          </div>
          <div>
            <div className="border-b border-black pb-1 mb-1 font-bold">
              {project.proponents.split(',')[1] || 'Co-Proponent'}
            </div>
            <div>Student Proponent</div>
          </div>
          <div>
            <div className="border-b border-black pb-1 mb-1 font-bold">
              Feasibility Study Adviser / CPA
            </div>
            <div>Faculty Adviser</div>
          </div>
        </div>
      </section>
    </div>
  );
}
