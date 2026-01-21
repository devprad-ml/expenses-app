'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/api/api';
import { LayoutDashboard, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        const response = await auth.login(formData.email, formData.password);
        login(response.data.access_token);
        router.push('/dashboard');
      } else {
        // Register Logic
        await auth.register(formData.email, formData.password, formData.fullName);
        // Auto-login after register
        const response = await auth.login(formData.email, formData.password);
        login(response.data.access_token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="text-emerald-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Expense Tracker</h1>
          <p className="text-slate-400 text-sm">
            {isLogin ? "Welcome back! Login to continue." : "Create an account to get started."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 text-sm hover:text-emerald-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </main>
  );
}