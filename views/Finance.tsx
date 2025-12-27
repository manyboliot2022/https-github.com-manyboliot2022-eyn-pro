
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, Download, Upload, PieChart, Briefcase, Trash2 } from 'lucide-react';
import { Transaction } from '../types.ts';

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'STATS' | 'BACKUP'>('STATS');

  useEffect(() => {
    setTransactions(JSON.parse(localStorage.getItem('eyn_transactions') || '[]'));
  }, []);

  const totalIn = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
  const profit = totalIn - totalOut;

  const exportData = () => {
    const data = {
      products: localStorage.getItem('eyn_products'),
      transactions: localStorage.getItem('eyn_transactions'),
      orders: localStorage.getItem('eyn_orders'),
      clients: localStorage.getItem('eyn_clients'),
      suppliers: localStorage.getItem('eyn_suppliers')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EYN_PRO_DATA_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('STATS')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${activeTab === 'STATS' ? 'bg-[#111827] text-yellow-400' : 'text-slate-400'}`}>Analyses</button>
        <button onClick={() => setActiveTab('BACKUP')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${activeTab === 'BACKUP' ? 'bg-[#111827] text-yellow-400' : 'text-slate-400'}`}>Sauvegarde</button>
      </div>

      {activeTab === 'STATS' && (
        <div className="space-y-6 animate-fade">
          <div className="bg-[#111827] p-10 rounded-[4rem] text-center text-white space-y-4 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><PieChart className="w-32 h-32"/></div>
             <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em]">Balance Profit Net</p>
             <h2 className="text-4xl font-black text-yellow-400">{profit.toLocaleString()} <span className="text-sm">FG</span></h2>
             <div className="flex gap-4 pt-4">
                <div className="flex-1 bg-white/5 p-4 rounded-3xl">
                   <p className="text-[8px] font-black text-white/20 uppercase">Ventes (IN)</p>
                   <p className="text-xs font-black text-green-400">+{totalIn.toLocaleString()}</p>
                </div>
                <div className="flex-1 bg-white/5 p-4 rounded-3xl">
                   <p className="text-[8px] font-black text-white/20 uppercase">Dépenses (OUT)</p>
                   <p className="text-xs font-black text-red-400">-{totalOut.toLocaleString()}</p>
                </div>
             </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Mouvements Récents</h4>
            {transactions.slice(0, 10).map(t => (
              <div key={t.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-50 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${t.type === 'IN' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                    {t.type === 'IN' ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-slate-800">{t.description}</h5>
                    <p className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`text-sm font-black ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'BACKUP' && (
        <div className="space-y-6 animate-fade">
          <div className="bg-[#111827] p-10 rounded-[4rem] text-white space-y-8 shadow-2xl">
             <div className="flex items-center gap-4">
                <div className="bg-yellow-400 text-[#111827] p-4 rounded-3xl"><ShieldCheck className="w-8 h-8"/></div>
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest">SÉCURITÉ CLOUD</h3>
                   <p className="text-[9px] font-bold text-white/40 uppercase mt-1">Données chiffrées & Stockage local</p>
                </div>
             </div>
             
             <div className="space-y-3 pt-4">
                <button onClick={exportData} className="w-full bg-white/10 p-6 rounded-3xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                   <Download className="w-5 h-5 text-yellow-400"/> Exporter Tout (JSON)
                </button>
                <label className="w-full bg-white/5 border border-white/10 border-dashed p-6 rounded-3xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all">
                   <Upload className="w-5 h-5 text-slate-400"/> Restaurer un backup
                   <input type="file" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                         try {
                            const d = JSON.parse(ev.target?.result as string);
                            if(d.products) localStorage.setItem('eyn_products', d.products);
                            if(d.transactions) localStorage.setItem('eyn_transactions', d.transactions);
                            if(d.orders) localStorage.setItem('eyn_orders', d.orders);
                            alert("✅ Restauration complète réussie !");
                            window.location.reload();
                         } catch(err) { alert("Format de fichier invalide"); }
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
