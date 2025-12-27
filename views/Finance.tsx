
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Download, Upload, ShieldCheck, PieChart, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
// Import UserProfile to satisfy the currentUser prop type
import { Transaction, CompanySettings, DEFAULT_BRAND_INFO, Product, UserProfile } from '../types.ts';

// Add currentUser prop to Finance to ensure it can fulfill Transaction requirements
const Finance: React.FC<{ currentUser: UserProfile | null }> = ({ currentUser }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'STATS' | 'TRANS' | 'BACKUP'>('STATS');

  useEffect(() => {
    setTransactions(JSON.parse(localStorage.getItem('eyn_transactions') || '[]'));
    setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
  }, []);

  // Calcul du Chiffre d'Affaires (Total des ventes)
  const caTotal = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  
  // Calcul des Sorties (Dépenses opérationnelles)
  const expenses = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);

  // Calcul du Coût d'achat total des marchandises vendues (COGS)
  // Pour une analyse simplifiée, on estime le coût à 70% du CA si on n'a pas les données exactes par item
  const estimatedCostOfGoods = caTotal * 0.7; 
  
  const netProfit = caTotal - estimatedCostOfGoods - expenses;

  const exportData = () => {
    const data = {
      products: localStorage.getItem('eyn_products'),
      transactions: localStorage.getItem('eyn_transactions'),
      clients: localStorage.getItem('eyn_clients'),
      brand: localStorage.getItem('eyn_brand_info')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EYN_PRO_DATA_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
        <button onClick={() => setActiveSubTab('STATS')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'STATS' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Analyses</button>
        <button onClick={() => setActiveSubTab('TRANS')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'TRANS' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Mouvements</button>
        <button onClick={() => setActiveSubTab('BACKUP')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'BACKUP' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Sauvegarde</button>
      </div>

      {activeSubTab === 'STATS' && (
        <div className="space-y-4 page-enter">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><PieChart className="w-32 h-32" /></div>
            <p className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-1">Profit Net Estimé</p>
            <h2 className="text-4xl font-black">{netProfit.toLocaleString()} <span className="text-sm">FG</span></h2>
            <div className="flex gap-4 mt-6">
              <div className="flex-1 bg-white/5 p-3 rounded-2xl">
                <p className="text-[8px] font-black text-white/40 uppercase">CA Brut</p>
                <p className="text-sm font-black text-green-400">{caTotal.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white/5 p-3 rounded-2xl">
                <p className="text-[8px] font-black text-white/40 uppercase">Dépenses</p>
                <p className="text-sm font-black text-red-400">{expenses.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <ArrowUpRight className="text-green-500 mb-2" />
                <p className="text-[8px] font-black uppercase text-slate-400">Tendance</p>
                <p className="text-lg font-black text-slate-900">+12%</p>
             </div>
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <Briefcase className="text-blue-500 mb-2" />
                <p className="text-[8px] font-black uppercase text-slate-400">Ventes du jour</p>
                <p className="text-lg font-black text-slate-900">
                  {transactions.filter(t => t.date.split('T')[0] === new Date().toISOString().split('T')[0] && t.type === 'IN').length}
                </p>
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'TRANS' && (
        <div className="space-y-4 page-enter">
           <button onClick={() => {
             const amount = prompt("Montant de la dépense ?");
             if(!amount) return;
             const desc = prompt("Motif ?");
             // Fix: Include required userId property in the Transaction object
             const nt: Transaction = { 
               id: Date.now().toString(), 
               date: new Date().toISOString(), 
               userId: currentUser?.id || 'unknown',
               type: 'OUT', 
               amount: parseFloat(amount), 
               method: 'CASH_GNF', 
               description: desc || 'Dépense Diverse', 
               category: 'Dépense' 
             };
             const ut = [nt, ...transactions];
             setTransactions(ut);
             localStorage.setItem('eyn_transactions', JSON.stringify(ut));
           }} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl">
             <TrendingDown className="w-5 h-5 text-red-500" /> Ajouter une dépense
           </button>

           <div className="space-y-2">
             {transactions.map(t => (
               <div key={t.id} className="bg-white p-4 rounded-3xl border border-slate-50 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(t.date).toLocaleDateString()}</p>
                    <p className="text-xs font-black text-slate-900">{t.description}</p>
                    <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded-md uppercase text-slate-500">{t.method}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString()} FG
                    </p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeSubTab === 'BACKUP' && (
        <div className="space-y-4 page-enter">
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl space-y-6">
            <h3 className="font-black text-yellow-500 text-sm uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck /> Centre de Données
            </h3>
            <p className="text-[10px] text-white/50 leading-relaxed uppercase font-black">Pensez à exporter régulièrement pour ne jamais perdre vos stocks et comptes.</p>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={exportData} className="w-full bg-white/10 p-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest">
                <Download className="w-5 h-5 text-yellow-500" /> Exporter en JSON
              </button>
              <label className="w-full bg-white/5 border border-dashed border-white/20 p-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                <Upload className="w-5 h-5 text-slate-400" /> Importer un backup
                <input type="file" className="hidden" onChange={(e) => {
                   const file = e.target.files?.[0];
                   if(!file) return;
                   const reader = new FileReader();
                   reader.onload = (ev) => {
                     try {
                        const d = JSON.parse(ev.target?.result as string);
                        if(d.products) localStorage.setItem('eyn_products', d.products);
                        if(d.transactions) localStorage.setItem('eyn_transactions', d.transactions);
                        alert("✅ Restauration terminée !");
                        window.location.reload();
                     } catch(err) { alert("Format invalide"); }
                   };
                   reader.readAsText(file);
                }} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
