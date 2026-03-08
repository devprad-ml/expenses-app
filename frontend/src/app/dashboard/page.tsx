'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { expenses, auth } from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import SpendingChart from '@/components/SpendingChart';
import { 
  Filter, DollarSign, Calendar, 
  Tag, LogOut, Sparkles, Loader2, Settings, X, ChevronDown, User, Trash2
} from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  // Data State
  const [expenseList, setExpenseList] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // UI State
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'scan'>('text');
  const [isScanning, setIsScanning] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    category: ''
  });

  // Protect Route & Load Data
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated, filters]);

  const loadData = async () => {
    try {
      // 1. Load User Profile (for Budget Limit & Name)
      const userRes = await auth.getMe();
      setUserProfile(userRes.data);
      setNewBudget(userRes.data.monthly_budget_limit?.toString() || '');

      // 2. Load Expenses
      const params: any = {};
      if (filters.month) params.month = filters.month;
      if (filters.category) params.category = filters.category;
      
      const res = await expenses.getAll(params);
      setExpenseList(res.data);
      
      // Calculate stats
      const total = res.data.reduce((acc: number, curr: any) => acc + curr.amount, 0);
      setStats({ total, count: res.data.length });
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const handleAIParse = async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    try {
      const res = await expenses.parse(aiInput);
      setParsedResult(res.data);
    } catch (err) {
      alert("AI Parsing failed. Try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const confirmExpense = async () => {
    if (!parsedResult) return;
    try {
      await expenses.create(parsedResult);
      setParsedResult(null);
      setAiInput('');
      loadData(); 
    } catch (err) {
      alert("Failed to save expense.");
    }
  };

  const saveBudget = async () => {
    try {
      await auth.updateMe({ monthly_budget_limit: parseFloat(newBudget) });
      setShowBudgetModal(false);
      loadData();
    } catch (err) {
      alert("Failed to update budget.");
    }
  };

  if (!isAuthenticated) return null;

  // Calculate Progress Bar
  const budgetLimit = userProfile?.monthly_budget_limit || 0;
  const progressPercent = budgetLimit > 0 ? Math.min((stats.total / budgetLimit) * 100, 100) : 0;
  const isOverBudget = budgetLimit > 0 && stats.total > budgetLimit;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-emerald-400">
            <DollarSign className="bg-emerald-500/20 p-1 rounded-lg" size={32} />
            AI Finance
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-3 text-sm font-medium text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800/50 outline-none">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                 <User size={18} />
              </div>
              {/* Full Name Display */}
              <span>{userProfile?.full_name || 'User'}</span>
              <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
              <div className="p-1">
                <div className="px-4 py-2 border-b border-slate-800 mb-1 sm:hidden">
                   <p className="text-xs text-slate-500">Signed in as</p>
                   <p className="font-medium text-white truncate">{userProfile?.full_name || 'User'}</p>
                </div>
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} /> Change Budget
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-12 gap-8">
        
        {/* Left Col */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stats Card with Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Total This Month</h3>
              {budgetLimit > 0 && (
                <span className={`text-xs px-2 py-1 rounded font-medium ${isOverBudget ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                   {isOverBudget ? 'Over Budget' : 'On Track'}
                </span>
              )}
            </div>
            
            <p className="text-4xl font-bold text-white mb-4">${stats.total.toFixed(2)}</p>
            
            {/* Progress Bar Section */}
            {budgetLimit > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>${budgetLimit.toFixed(0)} Limit</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs text-right text-slate-500">
                   {((stats.total / budgetLimit) * 100).toFixed(0)}% Used
                </div>
              </div>
            ) : (
               <button 
                onClick={() => setShowBudgetModal(true)}
                className="text-xs text-emerald-400 hover:underline"
               >
                 + Set a Monthly Budget
               </button>
            )}
          </div>

          <SpendingChart expenses={expenseList} />
          
          {/* AI Input Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} />
              Add Expense
            </h2>

            {/* Mode Toggle */}
            <div className="flex bg-slate-950 rounded-xl p-1 mb-4">
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${inputMode === 'text' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ✏️ Type
              </button>
              <button
                onClick={() => setInputMode('scan')}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${inputMode === 'scan' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                📷 Scan Receipt
              </button>
            </div>

            {inputMode === 'text' ? (
              <div className="space-y-4">
                <textarea
                  placeholder="e.g. 'Dinner at Mario's for $45' or 'Paid $1200 for Rent'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-32 text-sm"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <button
                  onClick={handleAIParse}
                  disabled={isParsing || !aiInput}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isParsing ? <Loader2 className="animate-spin" /> : "Magic Parse"}
                </button>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsScanning(true);
                    try {
                      const res = await expenses.scanReceipt(file);
                      setParsedResult(res.data);
                    } catch {
                      alert("Receipt scan failed. Try again.");
                    } finally {
                      setIsScanning(false);
                      e.target.value = '';
                    }
                  }}
                />
                {isScanning ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-400">
                    <Loader2 className="animate-spin" size={32} />
                    <span className="text-sm">Analyzing receipt...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">🧾</span>
                    <span className="font-medium text-sm">Tap to upload or take photo</span>
                    <span className="text-xs text-slate-600">JPG, PNG, HEIC supported</span>
                  </div>
                )}
              </label>
            )}

            {/* AI Review UI */}
            {parsedResult && (
              <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Review</span>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 capitalize">{parsedResult.category}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <p className="font-medium text-lg">{parsedResult.description}</p>
                  <p className="font-bold text-xl text-emerald-400">${parsedResult.amount}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setParsedResult(null)}
                    className="flex-1 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmExpense}
                    className="flex-1 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter size={18} />
              <span className="font-medium">Filters</span>
            </div>
            
            <div className="flex gap-4">
              <select 
                className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                value={filters.month}
                onChange={(e) => setFilters({...filters, month: Number(e.target.value)})}
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select 
                className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                <option value="food">Food</option>
                <option value="rent">Rent</option>
                <option value="transport">Transport</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {expenseList.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No expenses found for this period.</p>
              </div>
            ) : (
              expenseList.map((expense) => (
                <div key={expense.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-lg
                      ${expense.category === 'food' ? 'bg-orange-500/10 text-orange-500' : 
                        expense.category === 'rent' ? 'bg-blue-500/10 text-blue-500' :
                        expense.category === 'transport' ? 'bg-purple-500/10 text-purple-500' :
                        expense.category === 'entertainment' ? 'bg-pink-500/10 text-pink-500' :
                        expense.category === 'utilities' ? 'bg-yellow-500/10 text-yellow-500' :
                        expense.category === 'health' ? 'bg-red-500/10 text-red-500' :
                        'bg-slate-800 text-slate-400'}
                    `}>
                      {expense.category === 'food' ? '🍔' : 
                       expense.category === 'rent' ? '🏠' : 
                       expense.category === 'transport' ? '🚗' : 
                       expense.category === 'entertainment' ? '🎬' : 
                       expense.category === 'utilities' ? '⚡' : 
                       expense.category === 'health' ? '🏥' : '🏷️'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{expense.description}</h4>
                      <div className="flex gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <Tag size={12} />
                          {expense.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-emerald-400">
                      -${expense.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await expenses.delete(expense.id);
                          loadData();
                        } catch {
                          alert("Failed to delete expense.");
                        }
                      }}
                      className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowBudgetModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="text-emerald-400" size={20} />
              Monthly Budget
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Set your monthly limit ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <button
                onClick={saveBudget}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}