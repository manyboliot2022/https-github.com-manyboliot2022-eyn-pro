
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import CostCalculator from './views/CostCalculator.tsx';
import ProductManager from './views/ProductManager.tsx';
import POS from './views/POS.tsx';
import Settings from './views/Settings.tsx';
import { AppMode, AuthState, UserProfile } from './types.ts';

const APP_VERSION = "v2.5.0";

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.POS);
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });

  useEffect(() => {
    const session = sessionStorage.getItem('eyn_session');
    if (session) setAuth({ user: JSON.parse(session), isAuthenticated: true });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name.toLowerCase() === 'admin' && loginForm.password === '1234') {
      const admin: UserProfile = { id: 'admin', name: 'ADMIN', role: 'ADMIN', isActive: true };
      setAuth({ user: admin, isAuthenticated: true });
      sessionStorage.setItem('eyn_session', JSON.stringify(admin));
    } else {
      alert("Identifiants incorrects (admin / 1234)");
    }
  };

  if (!auth.isAuthenticated) return (
    <div className="h-full bg-[#111827] flex flex-col items-center justify-center p-8 overflow-hidden select-none">
      <div className="w-full max-w-xs space-y-12 animate-fade">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-yellow-400/20 rotate-12">
               <span className="text-[#111827] font-black text-6xl -rotate-12">E</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">EYN<span className="text-yellow-400">PRO</span></h1>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Professional Beauty ERP</p>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="UTILISATEUR" className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-white font-black placeholder:text-white/10 outline-none focus:border-yellow-400 transition-all uppercase" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} />
          <input type="password" placeholder="CODE SECRET" className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-white font-black placeholder:text-white/10 outline-none focus:border-yellow-400 transition-all" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
          <button type="submit" className="w-full bg-yellow-400 text-[#111827] py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs active:scale-95 transition-all shadow-2xl shadow-yellow-400/20">
            DÉVERROUILLER SYSTÈME
          </button>
        </form>

        <footer className="text-center pt-10">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 leading-relaxed mb-4">
             © 2026 KIIRA TECHNOLOGIES<br/>MANY B. MORIBA
           </p>
           <div className="flex justify-center gap-2">
              <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black text-white/30 tracking-widest uppercase border border-white/5">{APP_VERSION}</span>
              <span className="px-4 py-1.5 bg-yellow-400/5 rounded-full text-[9px] font-black text-yellow-400/40 tracking-widest uppercase border border-yellow-400/5">STABLE</span>
           </div>
        </footer>
      </div>
    </div>
  );

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode} title={activeMode} currentUser={auth.user}>
      {activeMode === AppMode.CALCULATOR && <CostCalculator />}
      {activeMode === AppMode.MANAGER && <ProductManager />}
      {activeMode === AppMode.POS && <POS currentUser={auth.user} />}
      {activeMode === AppMode.ADMIN && <Settings onLogout={() => { sessionStorage.removeItem('eyn_session'); setAuth({user:null, isAuthenticated:false}); }} />}
    </Layout>
  );
};

export default App;
