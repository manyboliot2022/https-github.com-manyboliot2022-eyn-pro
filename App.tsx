
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import CostCalculator from './views/CostCalculator.tsx';
import ProductManager from './views/ProductManager.tsx';
import POS from './views/POS.tsx';
import Settings from './views/Settings.tsx';
import { AppMode, AuthState, UserProfile } from './types.ts';
import { LogIn, Lock, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.CALCULATOR);
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });

  useEffect(() => {
    // Vérifier session existante
    const savedSession = sessionStorage.getItem('eyn_session');
    if (savedSession) {
      setAuth({ user: JSON.parse(savedSession), isAuthenticated: true });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users: UserProfile[] = JSON.parse(localStorage.getItem('eyn_users') || '[]');
    
    // Compte Admin par défaut si aucun utilisateur n'existe
    if (users.length === 0 && loginForm.name === 'admin' && loginForm.password === '1234') {
      const adminUser: UserProfile = { id: 'admin', name: 'ADMIN CENTRAL', role: 'ADMIN', isActive: true };
      setAuth({ user: adminUser, isAuthenticated: true });
      sessionStorage.setItem('eyn_session', JSON.stringify(adminUser));
      return;
    }

    const foundUser = users.find(u => u.name.toLowerCase() === loginForm.name.toLowerCase() && u.password === loginForm.password);
    
    if (foundUser) {
      if (!foundUser.isActive) {
        alert("Ce compte est désactivé. Contactez l'administrateur.");
        return;
      }
      setAuth({ user: foundUser, isAuthenticated: true });
      sessionStorage.setItem('eyn_session', JSON.stringify(foundUser));
    } else {
      alert("Identifiants incorrects");
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    sessionStorage.removeItem('eyn_session');
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-yellow-500 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-yellow-500/20 rotate-12">
               <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">EYN<span className="text-yellow-500">PRO</span></h1>
            <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em]">Accès Sécurisé Client/Serveur</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text" 
                placeholder="Identifiant" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:ring-2 ring-yellow-500 outline-none transition-all"
                value={loginForm.name}
                onChange={e => setLoginForm({...loginForm, name: e.target.value})}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:ring-2 ring-yellow-500 outline-none transition-all"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-yellow-500 text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
              Se Connecter <LogIn className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-[10px] text-white/20 font-medium uppercase tracking-widest">Fonctionnement Online & Offline</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.CALCULATOR: return <CostCalculator currentUser={auth.user} />;
      case AppMode.MANAGER: return <ProductManager currentUser={auth.user} />;
      case AppMode.POS: return <POS currentUser={auth.user} />;
      case AppMode.ADMIN: 
        if (auth.user?.role !== 'ADMIN') {
          setActiveMode(AppMode.POS);
          return <POS currentUser={auth.user} />;
        }
        return <Settings onLogout={handleLogout} />;
      default: return <CostCalculator currentUser={auth.user} />;
    }
  };

  const getTitle = () => {
    switch (activeMode) {
      case AppMode.CALCULATOR: return "Arrivage";
      case AppMode.MANAGER: return "Stock";
      case AppMode.POS: return "Vente";
      case AppMode.ADMIN: return "Admin";
    }
  };

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode} title={getTitle()} currentUser={auth.user}>
      {renderContent()}
    </Layout>
  );
};

export default App;
