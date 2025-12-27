
import React, { useState, useEffect } from 'react';
import { Calculator, Package, ShoppingCart, Settings, RefreshCw, User as UserIcon } from 'lucide-react';
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
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eyn_brand_info');
    if (saved) setBrand(JSON.parse(saved));

    const observer = new MutationObserver(() => {
      const hasOverlay = !!document.querySelector('.fixed.inset-0.z-\\[600\\]') || 
                         !!document.querySelector('.fixed.inset-0.z-\\[200\\]') || 
                         !!document.querySelector('.fixed.inset-0.z-\\[400\\]') ||
                         !!document.querySelector('.fixed.inset-0.z-\\[700\\]');
      setIsOverlayActive(hasOverlay);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const syncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
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
      
      {/* En-tête Compacté */}
      <header className="bg-slate-900 text-white px-4 py-3 flex-shrink-0 flex justify-between items-center z-[100] border-b border-white/5 sticky top-0 safe-top">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 p-1.5 rounded-lg">
             <div className="w-3 h-3 bg-slate-900 rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white italic leading-none">EYN<span className="text-yellow-500">PRO</span></h1>
            <p className="text-[7px] uppercase font-bold text-white/40 tracking-widest mt-0.5">{title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={syncData}
             className={`p-2 rounded-full ${isSyncing ? 'text-yellow-500 animate-spin' : 'text-white/30'}`}
           >
             <RefreshCw className="w-3.5 h-3.5" />
           </button>
           <div className="flex items-center gap-1.5 bg-white/5 pl-2 pr-3 py-1 rounded-full border border-white/10">
              <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center">
                <UserIcon className="w-2.5 h-2.5 text-yellow-500" />
              </div>
              <span className="text-[8px] font-black uppercase text-white/60">{currentUser?.name.split(' ')[0]}</span>
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-3 pb-36 hide-scrollbar relative z-10">
        {children}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t border-slate-200/50 flex justify-around items-center px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-15px_50px_rgba(15,23,42,0.15)] z-[100] rounded-t-[2.5rem] transition-transform duration-500 ${isOverlayActive ? 'translate-y-full' : 'translate-y-0'}`}>
        {allowedNavItems.map((item) => (
          <button 
            key={item.mode}
            onClick={() => onModeChange(item.mode)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeMode === item.mode ? 'scale-105 text-slate-900' : 'text-slate-400'}`}
          >
            <div className={`p-3.5 rounded-[1.2rem] transition-all duration-500 ${activeMode === item.mode ? 'bg-slate-900 text-yellow-500 shadow-xl shadow-slate-900/30 -translate-y-3' : 'bg-transparent'}`}>
              <item.icon className={`w-5 h-5`} />
            </div>
            {activeMode !== item.mode && <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
