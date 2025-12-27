
import React, { useState, useEffect } from 'react';
import { Calculator, Package, ShoppingCart, Settings, Bell, RefreshCw, User as UserIcon } from 'lucide-react';
import { AppMode, DEFAULT_BRAND_INFO, CompanySettings, UserProfile } from '../types.ts';
import ManualModal from './ManualModal.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  title: string;
  currentUser: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, onModeChange, title, currentUser }) => {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [brand, setBrand] = useState<CompanySettings>(DEFAULT_BRAND_INFO);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eyn_brand_info');
    if (saved) setBrand(JSON.parse(saved));
  }, []);

  const syncData = () => {
    setIsSyncing(true);
    // Simulation d'appel API vers le serveur
    setTimeout(() => {
      setIsSyncing(false);
      alert("✅ Synchronisation serveur terminée !");
    }, 1500);
  };

  const navItems = [
    { mode: AppMode.CALCULATOR, label: 'Arrivage', icon: Calculator, roles: ['ADMIN', 'VENDEUR'] },
    { mode: AppMode.MANAGER, label: 'Stock', icon: Package, roles: ['ADMIN', 'VENDEUR'] },
    { mode: AppMode.POS, label: 'Vente', icon: ShoppingCart, roles: ['ADMIN', 'VENDEUR'] },
    { mode: AppMode.ADMIN, label: 'Admin', icon: Settings, roles: ['ADMIN'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(currentUser?.role || ''));

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
      
      <div className="pt-[env(safe-area-inset-top)] bg-slate-900"></div>

      <header className="bg-slate-900/90 backdrop-blur-xl text-white px-5 py-4 shadow-2xl flex-shrink-0 flex justify-between items-center z-[100] rounded-b-[2rem] border-b border-white/5 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-2 rounded-xl">
             <div className="w-4 h-4 bg-slate-900 rounded-md"></div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white italic leading-none">EYN<span className="text-yellow-500">PRO</span></h1>
            <p className="text-[8px] uppercase font-bold text-white/40 tracking-widest mt-1">{title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={syncData}
             className={`p-2.5 rounded-full transition-all ${isSyncing ? 'bg-yellow-500 text-slate-900 animate-spin' : 'bg-white/5 text-white/40'}`}
           >
             <RefreshCw className="w-4 h-4" />
           </button>
           <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
           <div className="flex items-center gap-2 bg-white/5 p-1 pr-3 rounded-full border border-white/10">
              <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-yellow-500" />
              </div>
              <span className="text-[9px] font-black uppercase text-white/80">{currentUser?.name.split(' ')[0]}</span>
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-40 hide-scrollbar relative z-10">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t border-slate-200/50 flex justify-around items-center px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-15px_50px_rgba(15,23,42,0.15)] z-[100] rounded-t-[2.5rem]">
        {allowedNavItems.map((item) => (
          <button 
            key={item.mode}
            onClick={() => onModeChange(item.mode)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeMode === item.mode ? 'scale-110 text-slate-900' : 'text-slate-400'}`}
          >
            <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${activeMode === item.mode ? 'bg-slate-900 text-yellow-500 shadow-2xl shadow-slate-900/40 -translate-y-4' : 'bg-transparent'}`}>
              <item.icon className={`w-5 h-5 ${activeMode === item.mode ? 'scale-110' : ''}`} />
            </div>
            {activeMode !== item.mode && <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
