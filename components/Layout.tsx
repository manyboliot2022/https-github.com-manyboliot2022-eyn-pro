
import React, { useState, useEffect } from 'react';
import { Calculator, Package, ShoppingCart, User, BarChart3, Smartphone, Settings } from 'lucide-react';
import { AppMode, DEFAULT_BRAND_INFO, CompanySettings } from '../types.ts';
import ManualModal from './ManualModal.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, onModeChange, title }) => {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [brand, setBrand] = useState<CompanySettings>(DEFAULT_BRAND_INFO);

  useEffect(() => {
    const saved = localStorage.getItem('eyn_brand_info');
    if (saved) setBrand(JSON.parse(saved));
    
    const hasVisited = localStorage.getItem('eyn_has_visited');
    if (!hasVisited) {
      setIsManualOpen(true);
      localStorage.setItem('eyn_has_visited', 'true');
    }
  }, []);

  const navItems = [
    { mode: AppMode.CALCULATOR, label: 'Coût', icon: Calculator },
    { mode: AppMode.MANAGER, label: 'Gestion', icon: Package },
    { mode: AppMode.POS, label: 'Vente', icon: ShoppingCart },
    { mode: AppMode.FINANCE, label: 'Compta', icon: BarChart3 },
    { mode: AppMode.SETTINGS, label: 'Admin', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
      
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
        <div className="text-center flex flex-col items-center">
          <img 
            src={brand.logoUrl} 
            alt="Watermark" 
            className="w-[80vw] max-w-md grayscale"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <h2 className="text-4xl font-black mt-4 uppercase tracking-[0.3em]">{brand.name}</h2>
        </div>
      </div>

      <header className="bg-slate-900 text-white px-4 py-3 shadow-lg flex-shrink-0 flex justify-between items-center border-b-2 border-yellow-500 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
             <div className="w-5 h-5 bg-yellow-500 rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white italic">EYN<span className="text-yellow-500">PRO</span></h1>
            <p className="text-[9px] uppercase font-black opacity-40 tracking-widest">{title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsManualOpen(true)} 
            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-full text-yellow-500 active:scale-90 transition-transform"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-nowrap">Install</span>
          </button>
          <div className="bg-slate-800 p-2 rounded-full border border-slate-700">
            <User className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 hide-scrollbar relative z-10">
        {children}
        
        <footer className="mt-12 mb-4 text-center opacity-40">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Copyright 2026 - Tous droits réservés Kiira Technologies
          </p>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center px-2 py-3 safe-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 rounded-t-[2.5rem]">
        {navItems.map((item) => (
          <button 
            key={item.mode}
            onClick={() => onModeChange(item.mode)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeMode === item.mode ? 'scale-110 text-slate-900' : 'text-slate-400 opacity-60'}`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeMode === item.mode ? 'bg-yellow-500 text-slate-900 shadow-xl shadow-yellow-500/40 rotate-[-5deg]' : 'bg-transparent'}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
