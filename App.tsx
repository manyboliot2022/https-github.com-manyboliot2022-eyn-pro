
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import CostCalculator from './views/CostCalculator.tsx';
import ProductManager from './views/ProductManager.tsx';
import POS from './views/POS.tsx';
import Settings from './views/Settings.tsx';
import { AppMode, AuthState, UserProfile, PRE_DETECTED_PRODUCTS, Product, Supplier, Client, INITIAL_FAMILIES } from './types.ts';
import { LogIn, Lock, User as UserIcon, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.CALCULATOR);
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const savedSession = sessionStorage.getItem('eyn_session');
    if (savedSession) {
      setAuth({ user: JSON.parse(savedSession), isAuthenticated: true });
    }

    const existingProducts = localStorage.getItem('eyn_products');
    const existingSuppliers = localStorage.getItem('eyn_suppliers');
    const existingClients = localStorage.getItem('eyn_clients');
    const existingFamilies = localStorage.getItem('eyn_families');

    if (!existingProducts || !existingSuppliers || !existingClients || !existingFamilies) {
      setIsInitializing(true);
      setTimeout(() => {
        if (!existingFamilies) {
          localStorage.setItem('eyn_families', JSON.stringify(INITIAL_FAMILIES));
        }

        if (!existingProducts || JSON.parse(existingProducts).length === 0) {
          const initialProducts: Product[] = PRE_DETECTED_PRODUCTS.map(p => ({
            id: Math.random().toString(36).substr(2, 9),
            name: p.name,
            category: p.category,
            barcode: '',
            costPrice: 0,
            sellPrice: 0,
            stock: 0
          }));
          localStorage.setItem('eyn_products', JSON.stringify(initialProducts));
        }

        if (!existingSuppliers || JSON.parse(existingSuppliers).length === 0) {
          const initialSuppliers: Supplier[] = [
            { id: 'sup1', name: 'Grossiste Alpha Cosmétic', phone: '224621000001', category: 'Importation' },
            { id: 'sup2', name: 'Sodifa Distribution', phone: '224621000002', category: 'Local' },
            { id: 'sup3', name: 'Transit Direct Dubréka', phone: '224621000003', category: 'Logistique' },
            { id: 'sup4', name: 'Beauté Tropicale SARL', phone: '224621000004', category: 'Soins' }
          ];
          localStorage.setItem('eyn_suppliers', JSON.stringify(initialSuppliers));
        }

        if (!existingClients || JSON.parse(existingClients).length === 0) {
          const initialClients: Client[] = [
            { id: 'cli1', name: 'Mme Diallo Safiatou', phone: '224664000101', address: 'Dixinn', balance: 0 },
            { id: 'cli2', name: 'Pharmacie Kaloum Centre', phone: '224664000102', address: 'Kaloum', balance: 0 },
            { id: 'cli3', name: 'Supermarché Horizon', phone: '224664000103', address: 'Ratoma', balance: 0 },
            { id: 'cli4', name: 'Salon Prestige Coiffure', phone: '224664000104', address: 'Matam', balance: 0 }
          ];
          localStorage.setItem('eyn_clients', JSON.stringify(initialClients));
        }
        setIsInitializing(false);
      }, 800);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users: UserProfile[] = JSON.parse(localStorage.getItem('eyn_users') || '[]');
    if (users.length === 0 && loginForm.name === 'admin' && loginForm.password === '1234') {
      const adminUser: UserProfile = { id: 'admin', name: 'ADMIN CENTRAL', role: 'ADMIN', isActive: true };
      setAuth({ user: adminUser, isAuthenticated: true });
      sessionStorage.setItem('eyn_session', JSON.stringify(adminUser));
      return;
    }
    const foundUser = users.find(u => u.name.toLowerCase() === loginForm.name.toLowerCase() && u.password === loginForm.password);
    if (foundUser) {
      if (!foundUser.isActive) return alert("Compte désactivé.");
      setAuth({ user: foundUser, isAuthenticated: true });
      sessionStorage.setItem('eyn_session', JSON.stringify(foundUser));
    } else alert("Identifiants incorrects");
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    sessionStorage.removeItem('eyn_session');
  };

  if (isInitializing) return (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse mx-auto" />
      <h2 className="text-white font-black uppercase text-sm">Initialisation Système EYN...</h2>
    </div>
  );

  if (!auth.isAuthenticated) return (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-yellow-500 rounded-[2.5rem] mx-auto flex items-center justify-center rotate-12 shadow-2xl">
            <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
          </div>
          <h1 className="text-4xl font-black text-white italic">EYN<span className="text-yellow-500">PRO</span></h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Identifiant" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} />
          <input type="password" placeholder="Mot de passe" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
          <button type="submit" className="w-full bg-yellow-500 text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">Se Connecter <LogIn className="inline-block w-5 h-5 ml-2" /></button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.CALCULATOR: return <CostCalculator currentUser={auth.user} />;
      case AppMode.MANAGER: return <ProductManager currentUser={auth.user} />;
      case AppMode.POS: return <POS currentUser={auth.user} />;
      case AppMode.ADMIN: return auth.user?.role === 'ADMIN' ? <Settings onLogout={handleLogout} /> : <POS currentUser={auth.user} />;
      default: return <CostCalculator currentUser={auth.user} />;
    }
  };

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode} title={activeMode} currentUser={auth.user}>
      {renderContent()}
    </Layout>
  );
};

export default App;
