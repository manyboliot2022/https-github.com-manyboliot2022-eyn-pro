
import React, { useState, useEffect } from 'react';
import { Building, ChevronRight, LogOut, LayoutGrid, Briefcase, Plus, Trash2, Phone, UserPlus, X, Wallet, ShieldCheck, Tag } from 'lucide-react';
import { Supplier, Client, Family } from '../types.ts';
import Finance from './Finance.tsx';

interface SettingsProps { onLogout: () => void; }

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<'PARTNERS' | 'FINANCE' | 'FAMILIES' | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [partnerTab, setPartnerTab] = useState<'SUPPLIER' | 'CLIENT'>('SUPPLIER');
  const [form, setForm] = useState({ name: '', phone: '', detail: '' });

  useEffect(() => {
    setSuppliers(JSON.parse(localStorage.getItem('eyn_suppliers') || '[]'));
    setClients(JSON.parse(localStorage.getItem('eyn_clients') || '[]'));
    setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
  }, [activeMenu]);

  const addFamily = () => {
    if(!form.name) return;
    const updated = [...families, { id: Date.now().toString(), name: form.name }];
    setFamilies(updated);
    localStorage.setItem('eyn_families', JSON.stringify(updated));
    setForm({ name: '', phone: '', detail: '' });
  };

  const addPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const id = Date.now().toString();
    if (partnerTab === 'SUPPLIER') {
      const updated = [...suppliers, { id, name: form.name, phone: form.phone, category: form.detail || 'Général' }];
      setSuppliers(updated);
      localStorage.setItem('eyn_suppliers', JSON.stringify(updated));
    } else {
      const updated = [...clients, { id, name: form.name, phone: form.phone, address: form.detail, balance: 0 }];
      setClients(updated);
      localStorage.setItem('eyn_clients', JSON.stringify(updated));
    }
    setForm({ name: '', phone: '', detail: '' });
  };

  if (activeMenu === 'FAMILIES') return (
    <div className="space-y-6 animate-fade">
      <button onClick={() => setActiveMenu(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><ChevronRight className="rotate-180 w-5 h-5"/> Retour Admin</button>
      <div className="bg-[#111827] p-8 rounded-[3rem] text-white shadow-2xl space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">Familles d'Articles</h3>
        <div className="flex gap-2">
           <input type="text" placeholder="NOM FAMILLE..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
           <button onClick={addFamily} className="bg-yellow-400 text-[#111827] p-4 rounded-2xl"><Plus/></button>
        </div>
      </div>
      <div className="space-y-2">
        {families.map(f => (
          <div key={f.id} className="bg-white p-5 rounded-[2.5rem] flex justify-between items-center shadow-sm border border-slate-50">
            <span className="text-[10px] font-black uppercase text-slate-800">{f.name}</span>
            <button onClick={() => { const up = families.filter(x => x.id !== f.id); setFamilies(up); localStorage.setItem('eyn_families', JSON.stringify(up)); }} className="text-red-200"><Trash2 className="w-4 h-4"/></button>
          </div>
        ))}
      </div>
    </div>
  );

  if (activeMenu === 'FINANCE') return (
    <div className="space-y-6 animate-fade">
      <button onClick={() => setActiveMenu(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2"><ChevronRight className="rotate-180 w-5 h-5"/> Retour Admin</button>
      <Finance />
    </div>
  );

  if (activeMenu === 'PARTNERS') return (
    <div className="space-y-6 animate-fade">
      <button onClick={() => setActiveMenu(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2"><ChevronRight className="rotate-180 w-5 h-5"/> Retour Admin</button>
      
      <div className="bg-[#111827] p-8 rounded-[3rem] text-white shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">Gestion Partenaires</h3>
        <div className="flex bg-white/5 p-1 rounded-2xl gap-1 mt-6">
          <button onClick={() => setPartnerTab('SUPPLIER')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${partnerTab === 'SUPPLIER' ? 'bg-yellow-400 text-slate-900' : 'text-white/40'}`}>Fournisseurs</button>
          <button onClick={() => setPartnerTab('CLIENT')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${partnerTab === 'CLIENT' ? 'bg-yellow-400 text-slate-900' : 'text-white/40'}`}>Clients</button>
        </div>
      </div>

      <form onSubmit={addPartner} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-3">
        <input type="text" placeholder="NOM COMPLET" required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="TÉLÉPHONE" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <button type="submit" className="w-full bg-[#111827] text-yellow-400 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl">Ajouter {partnerTab === 'SUPPLIER' ? 'Fournisseur' : 'Client'}</button>
      </form>

      <div className="space-y-2">
        {(partnerTab === 'SUPPLIER' ? suppliers : clients).map(p => (
          <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-50 flex justify-between items-center shadow-sm">
            <div>
              <h4 className="text-[10px] font-black uppercase text-slate-800">{p.name}</h4>
              <p className="text-[8px] font-bold text-slate-400">{p.phone || 'Pas de numéro'}</p>
            </div>
            <button onClick={() => { const up = partnerTab === 'SUPPLIER' ? suppliers.filter(x => x.id !== p.id) : clients.filter(x => x.id !== p.id); if(partnerTab === 'SUPPLIER') { setSuppliers(up); localStorage.setItem('eyn_suppliers', JSON.stringify(up)); } else { setClients(up); localStorage.setItem('eyn_clients', JSON.stringify(up)); } }} className="p-3 text-red-100"><Trash2 className="w-5 h-5"/></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-28 animate-fade">
      <div className="bg-[#111827] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest italic">EYN<span className="text-white">PRO</span> Admin</h2>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Version v2.6.0 Premium</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'FAMILIES', title: 'Familles Articles', icon: Tag, color: 'bg-blue-500', desc: 'Gestion des catégories' },
          { id: 'FINANCE', title: 'Comptabilité', icon: Wallet, color: 'bg-emerald-500', desc: 'Profits & Rapports' },
          { id: 'PARTNERS', title: 'Partenaires', icon: Briefcase, color: 'bg-purple-500', desc: 'Clients & Fournisseurs' },
          { id: 'SYSTEM', title: 'Sauvegarde', icon: ShieldCheck, color: 'bg-slate-800', desc: 'Export & Import Cloud' }
        ].map(card => (
          <button key={card.id} onClick={() => setActiveMenu(card.id as any)} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 active:scale-95 transition-all text-left shadow-sm">
            <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg`}><card.icon className="w-5 h-5" /></div>
            <div className="flex-1"><h4 className="text-[10px] font-black uppercase text-slate-900">{card.title}</h4><p className="text-[8px] font-medium text-slate-400 uppercase">{card.desc}</p></div>
            <ChevronRight className="w-4 h-4 text-slate-200" />
          </button>
        ))}
      </div>

      <button onClick={onLogout} className="w-full mt-6 bg-red-50 text-red-500 py-6 rounded-[2.5rem] font-black uppercase text-[10px] flex items-center justify-center gap-2 border border-red-100 shadow-sm"><LogOut className="w-4 h-4" /> Déconnexion</button>
    </div>
  );
};

export default Settings;
