'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { expenses } from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Filter, DollarSign, Calendar, Loader2,
  Tag, ArrowRight, Trash2, LogOut, Sparkles 
} from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  // Data State
  const [expenseList, setExpenseList] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  
  // AI Parsing State
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  // Filters State
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    category: ''
  });

  // Protect Route
  useEffect(() => {
    if (!isAuthenticated) router.push('/');
    loadExpenses();
  }, [isAuthenticated, filters]);

  const loadExpenses = async () => {
    try {
      const params: any = {};
      if (filters.month) params.month = filters.month;
      if (filters.category) params.category = filters.category;
      
      const res = await expenses.getAll(params);
      setExpenseList(res.data);
      
      // Calculate stats
      const total = res.data.reduce((acc: number, curr: any) => acc + curr.amount, 0);
      setStats({ total, count: res.data.length });
    } catch (err) {
      console.error("Failed to load expenses", err);
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
      loadExpenses(); // Refresh list
    } catch (err) {
      alert("Failed to save expense.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-emerald-400">
            <DollarSign className="bg-emerald-500/20 p-1 rounded-lg" size={32} />
            AI Finance
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-12 gap-8">
        
        {/* Left Col: Input & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Input Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} />
              Add Expense
            </h2>
            <div className="space-y-4">
              <textarea
                placeholder="e.g. 'Dinner at Mario's for $45' or 'Paid $1200 for Rent'"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-32"
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

            {/* AI Review UI */}
            {parsedResult && (
              <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Review</span>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">{parsedResult.category}</span>
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
                    Confirm Check
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total This Month</h3>
            <p className="text-4xl font-bold text-white">${stats.total.toFixed(2)}</p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm text-slate-500">
              <span>Transactions</span>
              <span>{stats.count}</span>
            </div>
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
                        'bg-slate-800 text-slate-400'}
                    `}>
                      {expense.category === 'food' ? '🍔' : 
                       expense.category === 'rent' ? '🏠' : 
                       expense.category === 'transport' ? '🚗' : '🏷️'}
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
                  <div className="font-bold text-emerald-400">
                    -${expense.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}