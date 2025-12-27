import React from 'react';
import { Calculator, Package, ShoppingCart, Settings, User } from 'lucide-react';
import { AppMode, UserProfile } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  title: string;
  currentUser: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, onModeChange }) => {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Header Noir Style Photo */}
      <header className="bg-[#111827] text-white px-6 safe-top h-24 flex items-center justify-between rounded-b-[2.5rem] shadow-2xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
            <span className="text-[#111827] font-black text-xl">E</span>
          </div>
          <div>
            <h1 className="text-lg font-black italic tracking-tighter uppercase leading-none">EYN<span className="text-yellow-400">PRO</span></h1>
            <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">{activeMode === 'CALCULATOR' ? 'VENTE' : activeMode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 pl-1.5 pr-3 py-1.5 rounded-full border border-white/10 shadow-inner">
          <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <span className="text-[9px] font-black uppercase text-white tracking-widest">ADMIN</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-40 hide-scrollbar animate-fade">
        {children}
      </main>

      {/* Nav Bar Blanche avec bouton central Noir/Jaune surélevé */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-50 flex justify-around items-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.06)] z-[100]">
        {[
          { mode: AppMode.CALCULATOR, label: 'ARRIVAGE', icon: Calculator },
          { mode: AppMode.MANAGER, label: 'STOCK', icon: Package },
          { mode: AppMode.POS, label: 'VENTE', icon: ShoppingCart },
          { mode: AppMode.ADMIN, label: 'ADMIN', icon: Settings },
        ].map((item) => (
          <button 
            key={item.mode} 
            onClick={() => onModeChange(item.mode)} 
            className="flex flex-col items-center gap-1.5 relative min-w-[65px]"
          >
            <div className={`transition-all duration-500 ${activeMode === item.mode ? 'bg-[#111827] text-yellow-400 w-16 h-16 rounded-full shadow-2xl shadow-slate-900/30 -translate-y-9 flex items-center justify-center scale-110 border-[6px] border-[#f8fafc]' : 'text-slate-200 py-2'}`}>
              <item.icon className={activeMode === item.mode ? "w-7 h-7" : "w-5 h-5"} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${activeMode === item.mode ? 'text-[#111827] absolute -bottom-1 opacity-100' : 'text-slate-300 opacity-40'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;