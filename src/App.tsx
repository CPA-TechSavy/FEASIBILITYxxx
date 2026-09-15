import { useState, useMemo, useEffect } from 'react';
import { FeasibilityProject } from './types';
import { BLANK_PROJECT, SAMPLE_PROJECTS } from './data/sampleProjects';
import {
  calculate5YearFinancials,
  calculateFeasibilityMetrics,
} from './utils/financialCalculations';
import Header from './components/Header';
import ProjectInfoCard from './components/ProjectInfoCard';
import AssumptionsEditor from './components/AssumptionsEditor';
import FinancialStatementsView from './components/FinancialStatementsView';
import FeasibilityEvaluationView from './components/FeasibilityEvaluationView';
import SupportingSchedulesView from './components/SupportingSchedulesView';
import NotesAndDefenseNotes from './components/NotesAndDefenseNotes';
import CloudflareDeployModal from './components/CloudflareDeployModal';
import BankInterestAndLoanModal from './components/BankInterestAndLoanModal';
import CompanyAccountModal from './components/CompanyAccountModal';
import {
  FileText,
  BarChart3,
  Sliders,
  Table,
  BookOpen,
  Cloud,
  CheckCircle2,
  Landmark,
} from 'lucide-react';

const STORAGE_KEY = 'undergrad_feasibility_cleanslate_v1';

export default function App() {
  const [project, setProject] = useState<FeasibilityProject>(() => {
    try {
      // Clear out legacy sample pre-existing data
      localStorage.removeItem('undergrad_feasibility_project_v1');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'cafe-artisan' || parsed.id === 'eco-packaging') {
          return BLANK_PROJECT;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load project from localStorage', e);
    }
    return BLANK_PROJECT;
  });

  const [activeMainView, setActiveMainView] = useState<
    'statements' | 'evaluation' | 'assumptions' | 'schedules' | 'notes'
  >('statements');

  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [project]);

  // Reactive financial calculations
  const financials = useMemo(() => {
    return calculate5YearFinancials(project);
  }, [project]);

  const metrics = useMemo(() => {
    return calculateFeasibilityMetrics(project, financials);
  }, [project, financials]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Navigation Header */}
      <Header
        project={project}
        onUpdateProject={setProject}
        financials={financials}
        metrics={metrics}
        onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
        onOpenBankModal={() => setIsBankModalOpen(true)}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Header Info & Assumptions Quick Bar */}
        <ProjectInfoCard
          project={project}
          onUpdateProject={setProject}
          metrics={metrics}
          financials={financials}
          onOpenBankModal={() => setIsBankModalOpen(true)}
          onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        />

        {/* Navigation Section Tabs (Hidden on Print) */}
        <div className="no-print flex overflow-x-auto gap-2 mb-6 pb-1 border-b border-slate-200">
          <button
            onClick={() => setActiveMainView('statements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs ${
              activeMainView === 'statements'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Financial Statements</span>
          </button>

          <button
            onClick={() => setActiveMainView('evaluation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs ${
              activeMainView === 'evaluation'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Feasibility & Capital Budgeting (NPV / IRR / BEP)</span>
          </button>

          <button
            onClick={() => setActiveMainView('assumptions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs ${
              activeMainView === 'assumptions'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Assumptions & Schedules Input</span>
          </button>

          <button
            onClick={() => setActiveMainView('schedules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs ${
              activeMainView === 'schedules'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Loan & Depreciation Schedules</span>
          </button>

          <button
            onClick={() => setActiveMainView('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs ${
              activeMainView === 'notes'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Notes & Defense Talking Points</span>
          </button>

          {/* Dedicated Quick-Access Button for Bank Savings Interest & Loan Debt Breakdown */}
          <button
            onClick={() => setIsBankModalOpen(true)}
            title="Breakdown of interest received for bank savings and loan capital/interest to pay"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-2xs bg-gradient-to-r from-emerald-50 via-indigo-50 to-indigo-100 hover:from-emerald-100 hover:to-indigo-200 text-indigo-950 border border-indigo-200/90 cursor-pointer ml-auto"
          >
            <Landmark className="w-4 h-4 text-indigo-700 shrink-0" />
            <span>Bank Interest & Loan Breakdown</span>
          </button>
        </div>

        {/* Print Only Thesis Document Header */}
        <div className="print-only hidden mb-8 text-center pb-4 border-b border-black">
          <h1 className="text-xl font-bold font-serif-title uppercase">{project.title}</h1>
          <p className="text-xs font-semibold">{project.academicProgram} - {project.institution}</p>
          <p className="text-xs italic">{project.proponents} ({project.academicYear})</p>
          <p className="text-[10px] text-slate-600 mt-1">CHAPTER V: FINANCIAL FEASIBILITY & PROJECTED FINANCIAL STATEMENTS</p>
        </div>

        {/* Primary Views */}
        {activeMainView === 'statements' && (
          <FinancialStatementsView
            project={project}
            financials={financials}
            onOpenBankModal={() => setIsBankModalOpen(true)}
          />
        )}

        {activeMainView === 'evaluation' && (
          <FeasibilityEvaluationView
            project={project}
            financials={financials}
            metrics={metrics}
          />
        )}

        {activeMainView === 'assumptions' && (
          <AssumptionsEditor
            project={project}
            onUpdateProject={setProject}
            onOpenBankModal={() => setIsBankModalOpen(true)}
          />
        )}

        {activeMainView === 'schedules' && (
          <SupportingSchedulesView
            project={project}
            onOpenBankModal={() => setIsBankModalOpen(true)}
          />
        )}

        {activeMainView === 'notes' && (
          <NotesAndDefenseNotes
            project={project}
            onUpdateProject={setProject}
            metrics={metrics}
          />
        )}

        {/* When Printing: Also display the other core parts sequentially for the complete academic chapter! */}
        <div className="print-only hidden space-y-8">
          <FeasibilityEvaluationView
            project={project}
            financials={financials}
            metrics={metrics}
          />
          <SupportingSchedulesView project={project} />
          <NotesAndDefenseNotes
            project={project}
            onUpdateProject={setProject}
            metrics={metrics}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 text-xs text-slate-500 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Financial Statements Generator
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsCloudflareModalOpen(true)}
              className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
            >
              <Cloud className="w-3.5 h-3.5" /> Publish on Cloudflare
            </button>
            <span>•</span>
            <span>CPA-Standard Accounting Conventions</span>
          </div>
        </div>
      </footer>

      {/* Cloudflare Deploy Modal */}
      {isCloudflareModalOpen && (
        <CloudflareDeployModal
          isOpen={isCloudflareModalOpen}
          onClose={() => setIsCloudflareModalOpen(false)}
        />
      )}

      {/* Bank Savings Interest & Loan Debt Breakdown Modal */}
      {isBankModalOpen && (
        <BankInterestAndLoanModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          project={project}
          onUpdateProject={setProject}
          financials={financials}
        />
      )}

      {/* Company Account Setup Modal */}
      {isCompanyModalOpen && (
        <CompanyAccountModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          project={project}
          onUpdateProject={setProject}
        />
      )}
    </div>
  );
}
