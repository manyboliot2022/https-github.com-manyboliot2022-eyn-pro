
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck, TrendingUp, ChevronRight, Calculator, Info, Save } from 'lucide-react';
import { OrderItem, Order } from '../types.ts';

const CostCalculator: React.FC = () => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [gpTotal, setGpTotal] = useState<number>(0);
  const [chargesTotal, setChargesTotal] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'CMD' | 'STATS' | 'HISTORY'>('CMD');

  // Calculs auto
  const totalArticles = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalProducts = items.reduce((sum, i) => sum + (i.buyPrice * i.quantity), 0);
  
  const gpPerUnit = totalArticles > 0 ? gpTotal / totalArticles : 0;
  const chargePerUnit = totalArticles > 0 ? chargesTotal / totalArticles : 0;
  
  const finalCost = subtotalProducts + gpTotal + chargesTotal;

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: '',
      buyPrice: 0,
      quantity: 1
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const saveOrder = () => {
    if (items.length === 0) return alert("Ajoutez des articles !");
    const history = JSON.parse(localStorage.getItem('eyn_orders_history') || '[]');
    const newOrder: Order = {
      id: `CMD-${Date.now()}`,
      date: new Date().toISOString(),
      items,
      gpTotal,
      chargesTotal,
      totalArticles,
      totalCost: finalCost
    };
    localStorage.setItem('eyn_orders_history', JSON.stringify([newOrder, ...history]));
    alert("📦 Commande sauvegardée dans l'historique !");
    setItems([]); setGpTotal(0); setChargesTotal(0);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Navigation Interne */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-3xl gap-1">
        <button onClick={() => setActiveTab('CMD')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'CMD' ? 'bg-[#111827] text-yellow-400 shadow-xl' : 'text-slate-400'}`}>Calcul</button>
        <button onClick={() => setActiveTab('STATS')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'STATS' ? 'bg-[#111827] text-yellow-400 shadow-xl' : 'text-slate-400'}`}>Marges</button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'HISTORY' ? 'bg-[#111827] text-yellow-400 shadow-xl' : 'text-slate-400'}`}>Historique</button>
      </div>

      {activeTab === 'CMD' && (
        <div className="space-y-6 animate-fade">
          {/* Section Frais Fixes */}
          <div className="bg-[#111827] p-8 rounded-[3rem] text-white shadow-2xl space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 flex items-center gap-3">
              <Truck className="w-5 h-5"/> FRAIS LOGISTIQUES
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">GP Total (Colis)</label>
                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-yellow-400" placeholder="0" value={gpTotal || ''} onChange={e => setGpTotal(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">Charges Fixes</label>
                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-yellow-400" placeholder="0" value={chargesTotal || ''} onChange={e => setChargesTotal(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
               <p className="text-[8px] font-black text-white/40 uppercase">Incidence / Article :</p>
               <p className="text-xs font-black text-yellow-400">+ {(gpPerUnit + chargePerUnit).toLocaleString()} FG</p>
            </div>
          </div>

          {/* Liste Articles */}
          <div className="bg-white rounded-[3rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center mb-2 px-2">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Articles Arrivage ({items.length})</h3>
               <button onClick={addItem} className="bg-[#111827] text-yellow-400 p-3 rounded-xl active:scale-90 transition-all"><Plus className="w-5 h-5"/></button>
            </div>
            
            {items.map(item => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-3xl space-y-3 relative group">
                <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                <input type="text" placeholder="Nom du produit..." className="w-full bg-transparent border-b border-slate-200 p-2 text-xs font-black uppercase outline-none focus:border-yellow-500" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                <div className="flex gap-3">
                   <div className="flex-1 space-y-1">
                      <span className="text-[7px] font-black text-slate-300 uppercase ml-1">P. Achat Unit.</span>
                      <input type="number" className="w-full bg-white rounded-xl p-3 text-xs font-black outline-none border border-slate-100" value={item.buyPrice || ''} onChange={e => updateItem(item.id, 'buyPrice', parseFloat(e.target.value) || 0)} />
                   </div>
                   <div className="w-24 space-y-1">
                      <span className="text-[7px] font-black text-slate-300 uppercase ml-1">Quantité</span>
                      <input type="number" className="w-full bg-white rounded-xl p-3 text-xs font-black outline-none border border-slate-100" value={item.quantity || ''} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                   </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={saveOrder} className="w-full bg-yellow-400 text-[#111827] py-6 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
            <Save className="w-5 h-5"/> SAUVEGARDER L'ARRIVAGE
          </button>
        </div>
      )}

      {activeTab === 'STATS' && (
        <div className="space-y-6 animate-fade">
           <div className="bg-[#111827] p-10 rounded-[4rem] text-center text-white space-y-2">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em]">Coût de revient moyen</p>
              <h2 className="text-4xl font-black text-yellow-400">
                {totalArticles > 0 ? (finalCost / totalArticles).toLocaleString() : 0} <span className="text-sm">FG</span>
              </h2>
           </div>

           <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Simulateur de Marges</p>
              {[
                { label: 'Prix Coûtant', margin: 0, color: 'text-slate-400' },
                { label: 'Marge Prudente', margin: 20, color: 'text-blue-500' },
                { label: 'Recommandé', margin: 35, color: 'text-yellow-500' },
                { label: 'Profit Confortable', margin: 50, color: 'text-emerald-500' },
                { label: 'Double Gain', margin: 100, color: 'text-purple-500' }
              ].map(m => {
                const avgCost = totalArticles > 0 ? finalCost / totalArticles : 0;
                const sellPrice = avgCost * (1 + m.margin / 100);
                return (
                  <div key={m.label} className="bg-white p-6 rounded-[2.5rem] flex justify-between items-center shadow-sm border border-slate-50">
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-slate-800">{m.label}</h4>
                      <p className={`text-[9px] font-black uppercase ${m.color}`}>+{m.margin}% de profit</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900">{Math.round(sellPrice).toLocaleString()} FG</p>
                       <p className="text-[8px] font-bold text-slate-300 uppercase">Profit: {Math.round(sellPrice - avgCost).toLocaleString()} FG</p>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}
    </div>
  );
};

export default CostCalculator;
