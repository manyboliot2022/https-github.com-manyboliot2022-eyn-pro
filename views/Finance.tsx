
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Bell, DollarSign, Download, Upload, Smartphone, Save, ShieldCheck, Settings, MapPin, Phone, MessageSquare, Share, MoreVertical, PlusSquare, RotateCcw, Check, X as Close, AlertCircle } from 'lucide-react';
import { Transaction, CompanySettings, DEFAULT_BRAND_INFO, RefundRequest, Product } from '../types.ts';

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'STATS' | 'REFUNDS' | 'BRAND' | 'SETTINGS'>('STATS');
  const [brandInfo, setBrandInfo] = useState<CompanySettings>(DEFAULT_BRAND_INFO);

  useEffect(() => {
    setTransactions(JSON.parse(localStorage.getItem('eyn_transactions') || '[]'));
    setRefundRequests(JSON.parse(localStorage.getItem('eyn_refund_requests') || '[]'));
    const savedBrand = localStorage.getItem('eyn_brand_info');
    if (savedBrand) setBrandInfo(JSON.parse(savedBrand));
  }, []);

  const saveBrandInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('eyn_brand_info', JSON.stringify(brandInfo));
    alert("✅ Paramètres de l'entreprise enregistrés !");
    window.location.reload(); 
  };

  const caTotal = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const outTotal = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
  const profit = caTotal - outTotal;

  const validateRefund = (req: RefundRequest) => {
    if (!confirm(`Valider le remboursement de ${req.amount.toLocaleString()} FG pour ${req.clientName} ?`)) return;

    // 1. Déduire du CA
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: 'OUT',
      amount: req.amount,
      method: 'CASH_GNF',
      description: `Remboursement validé : ${req.clientName}`,
      category: 'Retour'
    };
    const updatedTrans = [newTransaction, ...transactions];
    setTransactions(updatedTrans);
    localStorage.setItem('eyn_transactions', JSON.stringify(updatedTrans));

    // 2. Réintégrer le stock
    const products: Product[] = JSON.parse(localStorage.getItem('eyn_products') || '[]');
    const updatedProducts = products.map(p => {
      const returnedItem = req.items.find(item => item.id === p.id);
      if (returnedItem) return { ...p, stock: p.stock + returnedItem.quantity };
      return p;
    });
    localStorage.setItem('eyn_products', JSON.stringify(updatedProducts));

    // 3. Nettoyer la table d'attente
    const updatedRequests = refundRequests.filter(r => r.id !== req.id);
    setRefundRequests(updatedRequests);
    localStorage.setItem('eyn_refund_requests', JSON.stringify(updatedRequests));

    alert("✅ Remboursement validé et stock réintégré !");
  };

  const rejectRefund = (id: string) => {
    if (!confirm("Rejeter cette demande de retour ?")) return;
    const updatedRequests = refundRequests.filter(r => r.id !== id);
    setRefundRequests(updatedRequests);
    localStorage.setItem('eyn_refund_requests', JSON.stringify(updatedRequests));
  };

  const exportData = () => {
    const data = {
      products: localStorage.getItem('eyn_products'),
      transactions: localStorage.getItem('eyn_transactions'),
      clients: localStorage.getItem('eyn_clients'),
      suppliers: localStorage.getItem('eyn_suppliers'),
      history: localStorage.getItem('eyn_order_history'),
      refunds: localStorage.getItem('eyn_refund_requests'),
      brand: localStorage.getItem('eyn_brand_info'),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EYN_PRO_SAVE_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products) localStorage.setItem('eyn_products', data.products);
        if (data.transactions) localStorage.setItem('eyn_transactions', data.transactions);
        if (data.clients) localStorage.setItem('eyn_clients', data.clients);
        if (data.refunds) localStorage.setItem('eyn_refund_requests', data.refunds);
        if (data.brand) localStorage.setItem('eyn_brand_info', data.brand);
        alert("✅ Données restaurées avec succès !");
        window.location.reload();
      } catch (err) {
        alert("❌ Fichier invalide.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveSubTab('STATS')} className={`flex-1 min-w-[90px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'STATS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Dashboard</button>
        <button onClick={() => setActiveSubTab('REFUNDS')} className={`flex-1 min-w-[90px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'REFUNDS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>⌛ Retours ({refundRequests.length})</button>
        <button onClick={() => setActiveSubTab('BRAND')} className={`flex-1 min-w-[90px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'BRAND' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Entreprise</button>
        <button onClick={() => setActiveSubTab('SETTINGS')} className={`flex-1 min-w-[90px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'SETTINGS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Backup</button>
      </div>

      {activeSubTab === 'STATS' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-5 rounded-[2rem] shadow-xl border border-white/5">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
              <p className="text-xl font-black text-yellow-500">{caTotal.toLocaleString()} FG</p>
              <div className="flex items-center gap-1 mt-2 text-green-400 text-[8px] font-black uppercase">
                 <TrendingUp className="w-3 h-3" /> CA Brut Reçu
              </div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profit Net Est.</p>
              <p className="text-xl font-black text-slate-900">{profit.toLocaleString()} FG</p>
              <p className="text-[8px] font-bold text-slate-300 uppercase mt-2">Sorties déduites</p>
            </div>
          </div>

          <div className="bg-yellow-500 p-6 rounded-[2.5rem] shadow-2xl">
             <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">Mouvements de Caisse</h3>
             <div className="grid grid-cols-2 gap-3 relative z-10">
               <button onClick={() => {
                 const desc = prompt("Nature de la dépense ?");
                 const amount = parseFloat(prompt("Montant ?") || "0");
                 if(desc && amount) {
                   const nt: Transaction = { id: Date.now().toString(), date: new Date().toISOString(), type: 'OUT', amount, method: 'CASH_GNF', description: desc, category: 'Dépense' };
                   const ut = [nt, ...transactions];
                   setTransactions(ut);
                   localStorage.setItem('eyn_transactions', JSON.stringify(ut));
                 }
               }} className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                 <TrendingDown className="w-4 h-4 text-red-500" /> Sortie Directe
               </button>
               <button className="bg-white text-slate-900 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                 <DollarSign className="w-4 h-4 text-green-600" /> Versement
               </button>
             </div>
          </div>
        </>
      )}

      {activeSubTab === 'REFUNDS' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
              Les demandes ci-dessous sont en attente. Une fois validées, l'argent sera déduit du CA et le stock sera automatiquement mis à jour.
            </p>
          </div>

          {refundRequests.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <RotateCcw className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Aucun retour en attente</p>
            </div>
          ) : (
            refundRequests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-orange-50 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase text-orange-600 tracking-widest mb-1">Client: {req.clientName}</p>
                    <p className="text-xl font-black text-slate-900">{req.amount.toLocaleString()} FG</p>
                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{new Date(req.date).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => rejectRefund(req.id)} className="bg-slate-100 text-slate-400 p-3 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Close className="w-5 h-5" />
                    </button>
                    <button onClick={() => validateRefund(req)} className="bg-green-500 text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform">
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {req.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                      <span>{it.name}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-900">x{it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === 'BRAND' && (
        <form onSubmit={saveBrandInfo} className="space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-4 h-4 text-yellow-500" /> Profil Entreprise
            </h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nom de l'entreprise</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-yellow-500" value={brandInfo.name} onChange={e => setBrandInfo({...brandInfo, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Slogan (Tagline)</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-yellow-500" value={brandInfo.tagline} onChange={e => setBrandInfo({...brandInfo, tagline: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Tél Guinée</label>
                <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-[11px] font-bold" value={brandInfo.phoneGn} onChange={e => setBrandInfo({...brandInfo, phoneGn: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">WhatsApp</label>
                <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-[11px] font-bold" value={brandInfo.whatsapp} onChange={e => setBrandInfo({...brandInfo, whatsapp: e.target.value})} />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Enregistrer les infos
          </button>
        </form>
      )}

      {activeSubTab === 'SETTINGS' && (
        <div className="space-y-4">
          <section className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="font-black text-yellow-500 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Sécurité & Backup
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={exportData} className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
                <Download className="w-4 h-4 text-yellow-500" /> Exporter Sauvegarde
              </button>
              <label className="w-full bg-white/5 border border-dashed border-white/20 hover:bg-white/10 text-white/60 py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-slate-400" /> Restaurer Fichier
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Finance;
