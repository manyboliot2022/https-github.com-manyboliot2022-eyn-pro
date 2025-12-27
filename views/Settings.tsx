import React, { useState, useEffect } from 'react';
import { Building, ChevronRight, LogOut, LayoutGrid, Users2, Briefcase, ShieldCheck, Plus, Trash2, Phone, UserPlus, X } from 'lucide-react';
import { CompanySettings, DEFAULT_BRAND_INFO, Supplier, Client, Family } from '../types.ts';

interface SettingsProps { onLogout: () => void; }

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<'FAMILIES' | 'PARTNERS' | 'BRAND' | 'SYSTEM' | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [partnerTab, setPartnerTab] = useState<'SUPPLIER' | 'CLIENT'>('SUPPLIER');
  const [form, setForm] = useState({ name: '', phone: '', detail: '' });

  useEffect(() => {
    setSuppliers(JSON.parse(localStorage.getItem('eyn_suppliers') || '[]'));
    setClients(JSON.parse(localStorage.getItem('eyn_clients') || '[]'));
  }, [activeMenu]);

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

  const removePartner = (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    if (partnerTab === 'SUPPLIER') {
      const updated = suppliers.filter(s => s.id !== id);
      setSuppliers(updated);
      localStorage.setItem('eyn_suppliers', JSON.stringify(updated));
    } else {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      localStorage.setItem('eyn_clients', JSON.stringify(updated));
    }
  };

  if (activeMenu === 'PARTNERS') return (
    <div className="space-y-6 animate-fade">
      <button onClick={() => setActiveMenu(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><ChevronRight className="rotate-180 w-5 h-5"/> Retour</button>
      
      <div className="bg-[#111827] p-8 rounded-[3rem] text-white">
        <h3 className="text-sm font-black uppercase tracking-widest text-yellow-400">Partenaires</h3>
        <div className="flex bg-white/5 p-1 rounded-2xl gap-1 mt-6">
          <button onClick={() => setPartnerTab('SUPPLIER')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${partnerTab === 'SUPPLIER' ? 'bg-yellow-400 text-slate-900' : 'text-white/40'}`}>Fournisseurs</button>
          <button onClick={() => setPartnerTab('CLIENT')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${partnerTab === 'CLIENT' ? 'bg-yellow-400 text-slate-900' : 'text-white/40'}`}>Clients</button>
        </div>
      </div>

      <form onSubmit={addPartner} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-3">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <UserPlus className="w-4 h-4 text-slate-400"/>
          <input type="text" placeholder="Nom complet..." required className="flex-1 bg-transparent text-xs font-bold outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <Phone className="w-4 h-4 text-slate-400"/>
          <input type="tel" placeholder="Téléphone..." className="flex-1 bg-transparent text-xs font-bold outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-[#111827] text-yellow-400 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Ajouter {partnerTab === 'SUPPLIER' ? 'Fournisseur' : 'Client'}</button>
      </form>

      <div className="space-y-2">
        {(partnerTab === 'SUPPLIER' ? suppliers : clients).map(p => (
          <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex justify-between items-center animate-fade">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-slate-300"><Briefcase className="w-5 h-5"/></div>
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none">{p.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 mt-1">{p.phone || 'Aucun mobile'}</p>
              </div>
            </div>
            <button onClick={() => removePartner(p.id)} className="p-3 text-red-100 active:text-red-500"><Trash2 className="w-5 h-5"/></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-[#111827] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest italic">EYN<span className="text-white">PRO</span> Admin</h2>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Version v2.3.0</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'PARTNERS', title: 'Partenaires', icon: Briefcase, color: 'bg-purple-500', desc: 'Clients & Fournisseurs' },
          { id: 'FAMILIES', title: 'Familles', icon: LayoutGrid, color: 'bg-emerald-500', desc: 'Gestion catégories' },
          { id: 'BRAND', title: 'Boutique', icon: Building, color: 'bg-pink-500', desc: 'Identité & WhatsApp' },
          { id: 'SYSTEM', title: 'Système', icon: ShieldCheck, color: 'bg-slate-800', desc: 'Cloud Backup' }
        ].map(card => (
          <button key={card.id} onClick={() => setActiveMenu(card.id as any)} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 active:scale-95 transition-all text-left shadow-sm">
            <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg`}><card.icon className="w-5 h-5" /></div>
            <div className="flex-1"><h4 className="text-[10px] font-black uppercase text-slate-900">{card.title}</h4><p className="text-[8px] font-medium text-slate-400 uppercase">{card.desc}</p></div>
            <ChevronRight className="w-4 h-4 text-slate-200" />
          </button>
        ))}
      </div>

      <button onClick={onLogout} className="w-full mt-6 bg-red-50 text-red-500 py-5 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-100 shadow-sm"><LogOut className="w-4 h-4" /> Déconnexion</button>
    </div>
  );
};

export default Settings;