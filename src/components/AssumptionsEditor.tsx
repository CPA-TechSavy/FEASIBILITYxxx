import { useState } from 'react';
import {
  FeasibilityProject,
  PreOperatingExpenseItem,
  FixedAssetItem,
  ProductItem,
  DirectLaborItem,
  OperatingExpenseItem,
} from '../types';
import {
  Plus,
  Trash2,
  Coins,
  Package,
  Users,
  Briefcase,
  Sliders,
  DollarSign,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculations';

interface AssumptionsEditorProps {
  project: FeasibilityProject;
  onUpdateProject: (p: FeasibilityProject) => void;
}

type TabKey = 'capital' | 'sales' | 'directCosts' | 'opex' | 'workingCapital';

export default function AssumptionsEditor({ project, onUpdateProject }: AssumptionsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('capital');
  const [isExpanded, setIsExpanded] = useState(true);

  const c = project.currency;

  // --- Helpers for updating state collections ---
  const updatePreOp = (newItems: PreOperatingExpenseItem[]) => {
    onUpdateProject({ ...project, preOperatingExpenses: newItems });
  };

  const updateFixedAssets = (newItems: FixedAssetItem[]) => {
    onUpdateProject({ ...project, fixedAssets: newItems });
  };

  const updateProducts = (newItems: ProductItem[]) => {
    onUpdateProject({ ...project, products: newItems });
  };

  const updateDirectLabor = (newItems: DirectLaborItem[]) => {
    onUpdateProject({ ...project, directLabor: newItems });
  };

  const updateOpex = (newItems: OperatingExpenseItem[]) => {
    onUpdateProject({ ...project, operatingExpenses: newItems });
  };

  // Capital sums
  const totalPreOp = project.preOperatingExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedAssets = project.fixedAssets.reduce((sum, item) => sum + item.cost, 0);
  const totalOutlay = totalPreOp + totalFixedAssets + project.initialWorkingCapitalBuffer;

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Tab Header Bar */}
      <div className="bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Feasibility Study Operating Assumptions & Schedules
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
          >
            <span>{isExpanded ? 'Collapse Inputs' : 'Expand Inputs'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Sub Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 scrollbar-none">
            <button
              onClick={() => setActiveTab('capital')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'capital'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>1. Capital Outlay & Debt</span>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'sales'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>2. Products & Sales Volume</span>
            </button>

            <button
              onClick={() => setActiveTab('directCosts')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'directCosts'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. Direct Labor & Production</span>
            </button>

            <button
              onClick={() => setActiveTab('opex')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'opex'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>4. Operating Expenses (SG&A)</span>
            </button>

            <button
              onClick={() => setActiveTab('workingCapital')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'workingCapital'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5. Working Capital Policy</span>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* TAB 1: CAPITAL OUTLAY & FINANCING */}
            {activeTab === 'capital' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pre-Operating Expenses Table */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Pre-Operating Expenses (Year 0)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Permits, feasibility research, licenses, and trial operations.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updatePreOp([
                            ...project.preOperatingExpenses,
                            { id: `pre-${Date.now()}`, name: 'New Pre-operating Item', amount: 15000 },
                          ])
                        }
                        className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {project.preOperatingExpenses.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const copy = [...project.preOperatingExpenses];
                              copy[idx].name = e.target.value;
                              updatePreOp(copy);
                            }}
                            className="flex-1 text-xs text-slate-800 font-medium focus:outline-indigo-500"
                            placeholder="Expense name"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 font-financial">{c}</span>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => {
                                const copy = [...project.preOperatingExpenses];
                                copy[idx].amount = parseFloat(e.target.value) || 0;
                                updatePreOp(copy);
                              }}
                              className="w-24 text-xs font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5 focus:outline-indigo-500"
                            />
                          </div>
                          <button
                            onClick={() => {
                              updatePreOp(project.preOperatingExpenses.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                      <span>Total Pre-Operating:</span>
                      <span className="font-financial">{formatCurrency(totalPreOp, c)}</span>
                    </div>
                  </div>

                  {/* Fixed Assets Table */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Property, Plant & Equipment (CapEx)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Depreciated via Straight-Line Method over estimated useful life.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updateFixedAssets([
                            ...project.fixedAssets,
                            {
                              id: `fa-${Date.now()}`,
                              name: 'Equipment / Fixture',
                              cost: 50000,
                              usefulLifeYears: 5,
                              salvageValue: 5000,
                            },
                          ])
                        }
                        className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" /> Add Asset
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {project.fixedAssets.map((asset, idx) => (
                        <div
                          key={asset.id}
                          className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={asset.name}
                              onChange={(e) => {
                                const copy = [...project.fixedAssets];
                                copy[idx].name = e.target.value;
                                updateFixedAssets(copy);
                              }}
                              className="flex-1 text-xs font-medium text-slate-800 focus:outline-indigo-500"
                              placeholder="Asset name"
                            />
                            <button
                              onClick={() => {
                                updateFixedAssets(project.fixedAssets.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-400 hover:text-red-600 p-0.5 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Cost ({c})</span>
                              <input
                                type="number"
                                value={asset.cost}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].cost = parseFloat(e.target.value) || 0;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block">Life (Yrs)</span>
                              <input
                                type="number"
                                min="1"
                                max="25"
                                value={asset.usefulLifeYears}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].usefulLifeYears = parseInt(e.target.value) || 1;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block">Salvage Value</span>
                              <input
                                type="number"
                                value={asset.salvageValue}
                                onChange={(e) => {
                                  const copy = [...project.fixedAssets];
                                  copy[idx].salvageValue = parseFloat(e.target.value) || 0;
                                  updateFixedAssets(copy);
                                }}
                                className="w-full font-financial border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                      <span>Total PPE (CapEx):</span>
                      <span className="font-financial">{formatCurrency(totalFixedAssets, c)}</span>
                    </div>
                  </div>
                </div>

                {/* Capital Financing Mix & Working Capital Buffer */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-indigo-950 mb-1">
                    Financing Mix & Initial Cash Buffer
                  </h3>
                  <p className="text-xs text-indigo-700/80 mb-4">
                    Balance check: Total Project Outlay = Equity Contribution + Bank Loan.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Initial Working Capital Buffer ({c})
                      </label>
                      <input
                        type="number"
                        value={project.initialWorkingCapitalBuffer}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            initialWorkingCapitalBuffer: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Cash reserve at Day 1
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Owners’ Equity Contribution ({c})
                      </label>
                      <input
                        type="number"
                        value={project.financing.equityContribution}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            financing: {
                              ...project.financing,
                              equityContribution: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Paid-in capital by partners
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Bank / Debt Financing ({c})
                      </label>
                      <input
                        type="number"
                        value={project.financing.bankLoanAmount}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            financing: {
                              ...project.financing,
                              bankLoanAmount: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Borrowed capital for Year 0
                      </span>
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">
                            Interest %
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={project.financing.annualInterestRate}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                financing: {
                                  ...project.financing,
                                  annualInterestRate: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">
                            Term (Yrs)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={project.financing.loanTermYears}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                financing: {
                                  ...project.financing,
                                  loanTermYears: parseInt(e.target.value) || 1,
                                },
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-financial font-semibold text-slate-900 focus:outline-indigo-500"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Annual amortization terms
                      </span>
                    </div>
                  </div>

                  {/* Auto-match helper button */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-indigo-100">
                    <span className="text-slate-600">
                      Total Required: <strong className="font-financial">{formatCurrency(totalOutlay, c)}</strong> | Current Financing: <strong className="font-financial">{formatCurrency(project.financing.equityContribution + project.financing.bankLoanAmount, c)}</strong>
                    </span>
                    <button
                      onClick={() => {
                        const neededEquity = Math.max(0, totalOutlay - project.financing.bankLoanAmount);
                        onUpdateProject({
                          ...project,
                          financing: { ...project.financing, equityContribution: neededEquity },
                        });
                      }}
                      className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition"
                    >
                      Auto-Balance Equity to 100%
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS & SALES PROJECTIONS */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Revenue Streams & Product Assumptions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Selling prices, unit direct costs, Year 1 expected sales volume, and annual growth %.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateProducts([
                        ...project.products,
                        {
                          id: `p-${Date.now()}`,
                          name: 'New Product / Service',
                          unitPrice: 100,
                          year1Volume: 5000,
                          annualGrowthRate: 8,
                          unitCost: 35,
                        },
                      ])
                    }
                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product / Service
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Product / Service Name</th>
                        <th className="p-3 text-right">Selling Price ({c})</th>
                        <th className="p-3 text-right">Direct Cost / Unit ({c})</th>
                        <th className="p-3 text-right">Unit Margin</th>
                        <th className="p-3 text-right">Year 1 Volume</th>
                        <th className="p-3 text-right">Annual Growth %</th>
                        <th className="p-3 text-right">Year 1 Revenue</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.products.map((prod, idx) => {
                        const unitMargin = prod.unitPrice - prod.unitCost;
                        const marginPct = prod.unitPrice > 0 ? (unitMargin / prod.unitPrice) * 100 : 0;
                        const yr1Rev = prod.unitPrice * prod.year1Volume;

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={prod.name}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].name = e.target.value;
                                  updateProducts(copy);
                                }}
                                className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.unitPrice}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.unitCost}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].unitCost = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-right font-financial text-slate-600">
                              {formatCurrency(unitMargin, c)} ({marginPct.toFixed(0)}%)
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={prod.year1Volume}
                                onChange={(e) => {
                                  const copy = [...project.products];
                                  copy[idx].year1Volume = parseFloat(e.target.value) || 0;
                                  updateProducts(copy);
                                }}
                                className="w-20 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={prod.annualGrowthRate}
                                  onChange={(e) => {
                                    const copy = [...project.products];
                                    copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                    updateProducts(copy);
                                  }}
                                  className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                />
                                <span>%</span>
                              </div>
                            </td>
                            <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                              {formatCurrency(yr1Rev, c)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => {
                                  updateProducts(project.products.filter((_, i) => i !== idx));
                                }}
                                className="text-slate-400 hover:text-red-600 p-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DIRECT LABOR & PRODUCTION OVERHEAD */}
            {activeTab === 'directCosts' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Direct Labor Headcount & Compensation
                      </h3>
                      <p className="text-xs text-slate-500">
                        Production or service staff directly involved in delivering the goods/services.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        updateDirectLabor([
                          ...project.directLabor,
                          {
                            id: `dl-${Date.now()}`,
                            role: 'Technician / Crew',
                            headcount: 1,
                            monthlyWage: 18000,
                            monthsPerYear: 13,
                          },
                        ])
                      }
                      className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Staff Role
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Position / Role</th>
                          <th className="p-3 text-right">Headcount</th>
                          <th className="p-3 text-right">Monthly Basic Wage ({c})</th>
                          <th className="p-3 text-right">Months / Year</th>
                          <th className="p-3 text-right">Total Annual Cost (Yr 1)</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {project.directLabor.map((lab, idx) => {
                          const annual = lab.monthlyWage * lab.monthsPerYear * lab.headcount;
                          return (
                            <tr key={lab.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={lab.role}
                                  onChange={(e) => {
                                    const copy = [...project.directLabor];
                                    copy[idx].role = e.target.value;
                                    updateDirectLabor(copy);
                                  }}
                                  className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  value={lab.headcount}
                                  onChange={(e) => {
                                    const copy = [...project.directLabor];
                                    copy[idx].headcount = parseInt(e.target.value) || 1;
                                    updateDirectLabor(copy);
                                  }}
                                  className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  value={lab.monthlyWage}
                                  onChange={(e) => {
                                    const copy = [...project.directLabor];
                                    copy[idx].monthlyWage = parseFloat(e.target.value) || 0;
                                    updateDirectLabor(copy);
                                  }}
                                  className="w-24 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  min="12"
                                  max="14"
                                  value={lab.monthsPerYear}
                                  onChange={(e) => {
                                    const copy = [...project.directLabor];
                                    copy[idx].monthsPerYear = parseInt(e.target.value) || 12;
                                    updateDirectLabor(copy);
                                  }}
                                  className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                                />
                              </td>
                              <td className="p-2.5 text-right font-financial font-bold text-slate-900">
                                {formatCurrency(annual, c)}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => {
                                    updateDirectLabor(project.directLabor.filter((_, i) => i !== idx));
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-1 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Factory Overhead */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Factory / Production Overhead (FOH)
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Indirect production materials, factory utilities, equipment repair & maintenance.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">
                        Year 1 Annual FOH ({c})
                      </label>
                      <input
                        type="number"
                        value={project.factoryOverheadAnnual}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadAnnual: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-financial font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">
                        Annual FOH Growth Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={project.factoryOverheadGrowthRate}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            factoryOverheadGrowthRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-financial font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: OPERATING EXPENSES (SG&A) */}
            {activeTab === 'opex' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Selling, General & Administrative (SG&A) Expenses
                    </h3>
                    <p className="text-xs text-slate-500">
                      Management salaries, store/office rental, utilities, marketing campaigns, and licenses.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateOpex([
                        ...project.operatingExpenses,
                        {
                          id: `opex-${Date.now()}`,
                          category: 'Administrative',
                          name: 'New Operating Expense',
                          annualAmountYear1: 36000,
                          annualGrowthRate: 5,
                        },
                      ])
                    }
                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add OPEX Item
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Expense Name</th>
                        <th className="p-3 text-right">Year 1 Annual ({c})</th>
                        <th className="p-3 text-right">Annual Growth %</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.operatingExpenses.map((opex, idx) => (
                        <tr key={opex.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5">
                            <select
                              value={opex.category}
                              onChange={(e) => {
                                const copy = [...project.operatingExpenses];
                                copy[idx].category = e.target.value as any;
                                updateOpex(copy);
                              }}
                              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium text-slate-700"
                            >
                              <option value="Administrative">Administrative</option>
                              <option value="Selling & Marketing">Selling & Marketing</option>
                              <option value="Utilities & Rent">Utilities & Rent</option>
                              <option value="Other OPEX">Other OPEX</option>
                            </select>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={opex.name}
                              onChange={(e) => {
                                const copy = [...project.operatingExpenses];
                                copy[idx].name = e.target.value;
                                updateOpex(copy);
                              }}
                              className="w-full font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <input
                              type="number"
                              value={opex.annualAmountYear1}
                              onChange={(e) => {
                                const copy = [...project.operatingExpenses];
                                copy[idx].annualAmountYear1 = parseFloat(e.target.value) || 0;
                                updateOpex(copy);
                              }}
                              className="w-28 font-financial font-semibold text-right border border-slate-200 rounded px-1.5 py-0.5"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.5"
                                value={opex.annualGrowthRate}
                                onChange={(e) => {
                                  const copy = [...project.operatingExpenses];
                                  copy[idx].annualGrowthRate = parseFloat(e.target.value) || 0;
                                  updateOpex(copy);
                                }}
                                className="w-16 font-financial text-right border border-slate-200 rounded px-1.5 py-0.5"
                              />
                              <span>%</span>
                            </div>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                updateOpex(project.operatingExpenses.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: WORKING CAPITAL POLICY */}
            {activeTab === 'workingCapital' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Working Capital Policies & Cash Management
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Determines Accounts Receivable, Target Inventory, and Accounts Payable on the Balance Sheet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Accounts Receivable Policy
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Percentage of annual sales uncollected at year-end (credit sales).
                    </p>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.accountsReceivablePercentOfSales}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              accountsReceivablePercentOfSales: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-financial font-semibold"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of Net Sales</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Ending Inventory Policy
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Safety stock buffer maintained as a percentage of annual COGS.
                    </p>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.inventoryPercentOfCOGS}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              inventoryPercentOfCOGS: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-financial font-semibold"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of COGS</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Accounts Payable Policy
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Credit from raw material and direct inventory suppliers at year-end.
                    </p>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={project.workingCapital.accountsPayablePercentOfPurchases}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            workingCapital: {
                              ...project.workingCapital,
                              accountsPayablePercentOfPurchases: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-financial font-semibold"
                      />
                      <span className="text-xs font-semibold text-slate-700">% of Direct Materials</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
