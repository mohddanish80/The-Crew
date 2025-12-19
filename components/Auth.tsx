import React, { useState } from 'react';
import { Wrench, Mail, Lock, User, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import { login, register } from '../services/firebase';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

       <div className="max-w-md w-full bg-[#161B2C]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in">
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20 mb-4">
                <Wrench className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">The Crew</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">
              {isLogin ? 'Welcome back! Login to manage your business.' : 'Get started with your automated AI receptionist.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start space-x-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center space-x-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 text-orange-400 font-bold hover:text-orange-300 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
       </div>
    </div>
  );
};

export default Auth;