import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, History, ArrowRight, Calculator as CalcIcon, ShoppingCart, DollarSign, Package, CheckCircle, Info } from 'lucide-react';
import { Order, OrderItem, Product } from '../types.ts';

const CostCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'ANALYSIS' | 'HISTORY'>('NEW');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [gpTotal, setGpTotal] = useState<number>(50000);
  const [monthlyCharges, setMonthlyCharges] = useState<number>(200000);
  const [estimatedMonthlyVolume, setEstimatedMonthlyVolume] = useState<number>(1000);
  const [history, setHistory] = useState<Order[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('eyn_order_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const totalBuyPrice = items.reduce((sum, i) => sum + (i.buyPrice * i.quantity), 0);
  const totalArticles = items.reduce((sum, i) => sum + i.quantity, 0);
  
  const gpPerArticle = totalArticles > 0 ? gpTotal / totalArticles : 0;
  const chargePerArticle = estimatedMonthlyVolume > 0 ? monthlyCharges / estimatedMonthlyVolume : 0;

  const addItem = () => {
    setItems([{ id: Math.random().toString(36).substr(2, 9), name: '', buyPrice: 0, quantity: 1 }, ...items]);
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const deleteItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const saveToCatalog = () => {
    if (items.length === 0) {
      alert("Ajoutez au moins un article");
      return;
    }
    
    const products: Product[] = JSON.parse(localStorage.getItem('eyn_products') || '[]');

    items.forEach(item => {
      const costBasis = item.buyPrice + gpPerArticle + chargePerArticle;
      const existing = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
      
      if (existing) {
        existing.costPrice = costBasis;
        existing.sellPrice = Math.round(costBasis * 1.3);
        existing.stock += item.quantity;
      } else {
        products.push({
          id: Math.random().toString(36).substr(2, 9),
          name: item.name || 'Nouveau Produit',
          category: 'A classer',
          barcode: '',
          costPrice: costBasis,
          sellPrice: Math.round(costBasis * 1.3),
          stock: item.quantity
        });
      }
    });

    localStorage.setItem('eyn_products', JSON.stringify(products));

    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...items],
      gpTotal,
      chargesTotal: monthlyCharges,
      totalArticles,
      totalCost: totalBuyPrice + gpTotal
    };
    const newHistory = [newOrder, ...history];
    setHistory(newHistory);
    localStorage.setItem('eyn_order_history', JSON.stringify(newHistory));

    setItems([]);
    alert("✅ Approvisionnement réussi ! Les coûts et stocks sont à jour.");
    setActiveTab('HISTORY');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 page-enter">
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('NEW')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'NEW' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📋 Commande</button>
        <button onClick={() => setActiveTab('ANALYSIS')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'ANALYSIS' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📊 Analyse</button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'HISTORY' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📜 Historique</button>
      </div>

      {activeTab === 'NEW' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 flex justify-between items-center shadow-xl">
            <div className="text-center">
              <p className="text-[8px] font-black uppercase opacity-40 mb-1">Articles</p>
              <p className="text-xl font-black text-yellow-500">{totalArticles}</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase opacity-40 mb-1">Coût Total</p>
              <p className="text-xl font-black">{(totalBuyPrice + gpTotal).toLocaleString()} FG</p>
            </div>
          </div>

          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                📦 Articles du Colis
              </h3>
              <button onClick={addItem} className="bg-slate-900 text-white p-3 rounded-2xl active:scale-90 transition-transform"><Plus className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar">
              {items.length === 0 && (
                <div className="py-12 text-center text-slate-300">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase">Liste vide</p>
                </div>
              )}
              {items.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl relative border border-slate-100 animate-in slide-in-from-top-2">
                  <button onClick={() => deleteItem(item.id)} className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-lg border-2 border-slate-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  <input type="text" placeholder="Ex: Vaseline Intensive" className="w-full bg-transparent border-b-2 border-slate-100 py-2 text-sm font-black mb-4 focus:border-yellow-500 focus:outline-none transition-colors" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Prix Unitaire</label>
                      <input type="number" className="w-full text-xs font-black text-slate-900" value={item.buyPrice || ''} onChange={(e) => updateItem(item.id, 'buyPrice', parseFloat(e.target.value))} />
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Quantité</label>
                      <input type="number" className="w-full text-xs font-black text-slate-900" value={item.quantity || ''} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-5">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 px-2">
              🚚 Frais Additionnels
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">GP Colis (Expédition)</label>
                <input type="number" className="w-full bg-transparent text-sm font-black text-slate-900" value={gpTotal} onChange={(e) => setGpTotal(parseFloat(e.target.value))} />
                <div className="mt-2 text-[8px] font-black bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-md inline-block">+{gpPerArticle.toFixed(0)} FG / art</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Charges Locales</label>
                <input type="number" className="w-full bg-transparent text-sm font-black text-slate-900" value={monthlyCharges} onChange={(e) => setMonthlyCharges(parseFloat(e.target.value))} />
                <div className="mt-2 text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md inline-block">+{chargePerArticle.toFixed(0)} FG / art</div>
              </div>
            </div>
          </section>

          <button onClick={saveToCatalog} className="w-full bg-yellow-500 text-slate-900 font-black py-6 rounded-3xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[11px] mb-24">
            <ArrowRight className="w-6 h-6" /> Mettre à jour le Stock & Coûts
          </button>
        </div>
      )}

      {activeTab === 'ANALYSIS' && (
        <div className="space-y-4 pb-24 page-enter">
          {items.length === 0 && (
            <div className="py-32 text-center opacity-20">
              <TrendingUp className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Aucune donnée à analyser</p>
            </div>
          )}
          {items.map(item => {
            const unitCost = item.buyPrice + gpPerArticle + chargePerArticle;
            return (
              <div key={item.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                   <div className="min-w-0 pr-4">
                     <h4 className="font-black text-sm uppercase truncate mb-1">{item.name || 'Produit'}</h4>
                     <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest italic">Analyse du profit unitaire</p>
                   </div>
                   <div className="text-right shrink-0">
                     <p className="text-[8px] text-yellow-500 font-black uppercase mb-1">Coût de Revient</p>
                     <p className="text-xl font-black">{unitCost.toLocaleString()} FG</p>
                   </div>
                </div>
                
                <div className="p-6 space-y-3 bg-slate-50/50">
                   {[
                     { m: 0, l: 'Prix Coûtant', c: 'border-red-500/20 text-red-600 bg-red-50', note: '⚠️ PERTE : Pas de gain' },
                     { m: 0.2, l: 'Petit Profit', c: 'border-slate-200 text-slate-600 bg-white', note: '⚠️ FAIBLE : Risque élevé' },
                     { m: 0.3, l: 'Marge Recommandée', c: 'border-green-500 text-green-700 bg-green-50', note: '✅ BON : Profit équilibré' },
                     { m: 0.5, l: 'Marge Confort', c: 'border-blue-500 text-blue-700 bg-blue-50', note: '✨ TOP : Très rentable' },
                     { m: 1.0, l: 'Double Profit', c: 'border-purple-500 text-purple-700 bg-purple-50', note: '🔥 MAX : Excellent gain' }
                   ].map(opt => (
                     <div key={opt.m} className={`flex justify-between items-center p-4 rounded-2xl border-2 shadow-sm transition-all ${opt.c}`}>
                       <div className="min-w-0 pr-3">
                         <span className="text-[10px] font-black uppercase tracking-tight">{opt.l} ({opt.m * 100}%)</span>
                         <p className="text-[7px] font-black uppercase mt-1 opacity-70">{opt.note}</p>
                       </div>
                       <div className="text-right shrink-0">
                         <p className="text-lg font-black tracking-tight">{Math.round(unitCost * (1 + opt.m)).toLocaleString()} FG</p>
                         <p className="text-[8px] font-bold opacity-60">+ {Math.round(unitCost * opt.m).toLocaleString()} profit / art</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-3 pb-24 page-enter">
          {history.length === 0 ? (
            <div className="py-32 text-center opacity-20"><History className="w-16 h-16 mx-auto mb-2" /><p className="text-xs font-black uppercase">Aucun historique</p></div>
          ) : (
            history.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{new Date(order.date).toLocaleDateString()}</p>
                    <p className="text-xs font-black text-slate-900">{order.items.length} références d'articles</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">Réceptionné</div>
                </div>
                <div className="space-y-2">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span className="truncate mr-4">{it.name} x{it.quantity}</span>
                      <span className="shrink-0">{(it.buyPrice * it.quantity).toLocaleString()} FG</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-slate-900 font-black">
                   <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Total Colis + GP</span>
                   <span className="text-lg">{order.totalCost.toLocaleString()} FG</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CostCalculator;