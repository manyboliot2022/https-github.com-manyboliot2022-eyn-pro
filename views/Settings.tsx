
import React, { useState, useEffect } from 'react';
import { Building, ChevronRight, LogOut, LayoutGrid, Briefcase, Plus, Trash2, Phone, UserPlus, X, Wallet, ShieldCheck, Tag, AlertTriangle } from 'lucide-react';
import { Supplier, Client, Family } from '../types.ts';
import Finance from './Finance.tsx';

interface SettingsProps { onLogout: () => void; }

type DeleteTarget = { id: string, name: string, type: 'SUPPLIER' | 'CLIENT' | 'FAMILY' } | null;

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<'PARTNERS' | 'FINANCE' | 'FAMILIES' | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [partnerTab, setPartnerTab] = useState<'SUPPLIER' | 'CLIENT'>('SUPPLIER');
  const [form, setForm] = useState({ name: '', phone: '', detail: '' });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

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

  const executeDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'FAMILY') {
      const up = families.filter(x => x.id !== deleteTarget.id);
      setFamilies(up);
      localStorage.setItem('eyn_families', JSON.stringify(up));
    } else if (deleteTarget.type === 'SUPPLIER') {
      const up = suppliers.filter(x => x.id !== deleteTarget.id);
      setSuppliers(up);
      localStorage.setItem('eyn_suppliers', JSON.stringify(up));
    } else if (deleteTarget.type === 'CLIENT') {
      const up = clients.filter(x => x.id !== deleteTarget.id);
      setClients(up);
      localStorage.setItem('eyn_clients', JSON.stringify(up));
    }

    setDeleteTarget(null);
  };

  const confirmDelete = (id: string, name: string, type: 'SUPPLIER' | 'CLIENT' | 'FAMILY') => {
    if (navigator.vibrate) navigator.vibrate(10);
    setDeleteTarget({ id, name, type });
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
            <button onClick={() => confirmDelete(f.id, f.name, 'FAMILY')} className="p-3 text-red-100 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4"/>
            </button>
          </div>
        ))}
      </div>
      {deleteTarget && <DeleteConfirmationModal target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={executeDelete} />}
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
            <button onClick={() => confirmDelete(p.id, p.name, partnerTab)} className="p-3 text-red-100 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5"/>
            </button>
          </div>
        ))}
      </div>
      {deleteTarget && <DeleteConfirmationModal target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={executeDelete} />}
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

interface DeleteModalProps {
  target: NonNullable<DeleteTarget>;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ target, onCancel, onConfirm }) => {
  const labels = {
    'SUPPLIER': 'le fournisseur',
    'CLIENT': 'le client',
    'FAMILY': 'la famille'
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#111827]/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade">
      <div className="bg-white w-full max-w-xs rounded-[3.5rem] p-10 text-center space-y-8 shadow-2xl scale-in-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#111827] uppercase tracking-tighter italic">CONFIRMATION</h2>
          <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest leading-relaxed px-2">
            Êtes-vous sûr de vouloir supprimer {labels[target.type]} : 
            <br/>
            <span className="text-[#111827] text-[11px] mt-2 block font-black">"{target.name}" ?</span>
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <button onClick={onConfirm} className="w-full bg-red-500 text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">
            OUI, SUPPRIMER
          </button>
          <button onClick={onCancel} className="w-full bg-slate-100 text-slate-500 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
            ANNULER
          </button>
        </div>
      </div>
      <style>{`
        .scale-in-center {
          animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
