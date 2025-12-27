
import React, { useState, useEffect } from 'react';
import { 
  Tags, ShieldCheck, Building, Trash2, PieChart, Users2, Briefcase, Plus, X, 
  Download, ChevronRight, LogOut, ToggleLeft, ToggleRight, LayoutGrid, Layers, Trash
} from 'lucide-react';
import { CompanySettings, DEFAULT_BRAND_INFO, Product, Transaction, Client, Supplier, Family, UserProfile } from '../types.ts';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<'DASHBOARD' | 'USERS' | 'FAMILIES' | 'PARTNERS' | 'BRAND' | 'SYSTEM' | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [brand, setBrand] = useState<CompanySettings>(DEFAULT_BRAND_INFO);
  const [newFamily, setNewFamily] = useState('');

  useEffect(() => {
    setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
    const savedBrand = localStorage.getItem('eyn_brand_info');
    if (savedBrand) setBrand(JSON.parse(savedBrand));
  }, [activeMenu]);

  const addFamily = () => {
    if(!newFamily) return;
    const nl = [...families, { id: Date.now().toString(), name: newFamily }];
    setFamilies(nl);
    localStorage.setItem('eyn_families', JSON.stringify(nl));
    setNewFamily('');
  };

  const deleteFamily = (id: string) => {
    if(confirm("Supprimer cette famille ?")) {
      const nl = families.filter(f => f.id !== id);
      setFamilies(nl);
      localStorage.setItem('eyn_families', JSON.stringify(nl));
    }
  };

  if (activeMenu === 'FAMILIES') return (
    <div className="space-y-6 animate-in slide-in-from-right">
       <button onClick={() => setActiveMenu(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4"><ChevronRight className="rotate-180 w-5 h-5"/> Retour Admin</button>
       <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
          <h3 className="text-sm font-black uppercase tracking-widest text-yellow-500">Gestion des Familles</h3>
          <p className="text-[10px] uppercase font-bold opacity-30 mt-1">Classification du catalogue</p>
       </div>
       <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex gap-2">
          <input type="text" placeholder="Nouvelle famille..." className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold" value={newFamily} onChange={e => setNewFamily(e.target.value)} />
          <button onClick={addFamily} className="bg-slate-900 text-yellow-500 p-4 rounded-2xl"><Plus className="w-5 h-5"/></button>
       </div>
       <div className="grid grid-cols-1 gap-2">
         {families.map(f => (
           <div key={f.id} className="bg-white p-5 rounded-[2rem] border border-slate-50 flex justify-between items-center shadow-sm">
             <div className="flex items-center gap-3">
               <div className="bg-yellow-50 text-yellow-600 p-3 rounded-xl"><Layers className="w-4 h-4"/></div>
               <span className="text-xs font-black uppercase text-slate-800">{f.name}</span>
             </div>
             <button onClick={() => deleteFamily(f.id)} className="p-3 text-red-300 active:text-red-500"><Trash className="w-5 h-5"/></button>
           </div>
         ))}
       </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest mb-1 italic">EYN<span className="text-white">PRO</span> Admin</h2>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pilotage Global du Système</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'FAMILIES', title: 'Familles Produits', icon: LayoutGrid, color: 'bg-emerald-500', desc: 'Catégories beauté' },
          { id: 'USERS', title: 'Comptes Équipe', icon: Users2, color: 'bg-blue-500', desc: 'Vendeurs et autorisations' },
          { id: 'PARTNERS', title: 'Partenaires', icon: Briefcase, color: 'bg-purple-500', desc: 'Fournisseurs & Clients' },
          { id: 'BRAND', title: 'Identité Boutique', icon: Building, color: 'bg-pink-500', desc: 'WhatsApp & Slogan' },
          { id: 'SYSTEM', title: 'Sauvegarde Cloud', icon: ShieldCheck, color: 'bg-slate-800', desc: 'Exportation des données' }
        ].map(card => (
          <button key={card.id} onClick={() => setActiveMenu(card.id as any)} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 active:scale-95 transition-all text-left shadow-sm">
            <div className={`${card.color} p-4 rounded-2xl text-white shadow-xl shadow-slate-900/10`}><card.icon className="w-5 h-5" /></div>
            <div className="flex-1"><h4 className="text-[10px] font-black uppercase text-slate-900 mb-0.5">{card.title}</h4><p className="text-[8px] font-medium text-slate-400 uppercase">{card.desc}</p></div>
            <ChevronRight className="w-4 h-4 text-slate-200" />
          </button>
        ))}
      </div>

      <button onClick={onLogout} className="w-full mt-6 bg-red-50 text-red-500 py-5 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-100"><LogOut className="w-4 h-4" /> Déconnexion</button>
    </div>
  );
};

export default Settings;
