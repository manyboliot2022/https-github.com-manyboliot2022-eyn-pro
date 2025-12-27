
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, History, ArrowRight, Package, CheckCircle, Info, Sparkles, BarChart2 } from 'lucide-react';
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
    if (items.length === 0) return alert("Ajoutez au moins un article");
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
          category: 'Cosmétique',
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
    alert("✅ Stocks et coûts synchronisés !");
    setActiveTab('HISTORY');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-24">
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
        {[
          { id: 'NEW', label: 'Arrivage', icon: Package },
          { id: 'ANALYSIS', label: 'Analyse', icon: BarChart2 },
          { id: 'HISTORY', label: 'Historique', icon: History }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'NEW' && (
        <div className="space-y-4 page-enter">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Sparkles className="w-20 h-20" /></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-[8px] font-black uppercase text-yellow-500 tracking-widest mb-1">Résumé Commande</p>
                <p className="text-2xl font-black">{(totalBuyPrice + gpTotal).toLocaleString()} FG</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase opacity-40 mb-1">Articles</p>
                <p className="text-xl font-black">{totalArticles}</p>
              </div>
            </div>
          </div>

          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Liste des articles</h3>
              <button onClick={addItem} className="bg-yellow-500 text-slate-900 p-3 rounded-2xl active:scale-90 transition-all shadow-lg"><Plus className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              {items.length === 0 && (
                <div className="py-12 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase">Prêt pour l'arrivage</p>
                </div>
              )}
              {items.map((item) => (
                <div key={item.id} className="p-5 bg-slate-50 rounded-3xl relative border border-slate-100 animate-in slide-in-from-right">
                  <button onClick={() => deleteItem(item.id)} className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-md border border-slate-100"><Trash2 className="w-4 h-4" /></button>
                  <input type="text" placeholder="Nom du produit..." className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-black mb-4 focus:border-yellow-500 outline-none" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-2xl">
                      <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">Prix Unitaire</label>
                      <input type="number" className="w-full text-xs font-black text-slate-900" value={item.buyPrice || ''} onChange={(e) => updateItem(item.id, 'buyPrice', parseFloat(e.target.value))} />
                    </div>
                    <div className="bg-white p-3 rounded-2xl">
                      <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">Quantité</label>
                      <input type="number" className="w-full text-xs font-black text-slate-900" value={item.quantity || ''} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest px-2">Frais Logistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">GP / Expédition</label>
                <input type="number" className="w-full bg-transparent text-sm font-black text-slate-900" value={gpTotal} onChange={(e) => setGpTotal(parseFloat(e.target.value))} />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Charges Locales</label>
                <input type="number" className="w-full bg-transparent text-sm font-black text-slate-900" value={monthlyCharges} onChange={(e) => setMonthlyCharges(parseFloat(e.target.value))} />
              </div>
            </div>
          </section>

          <button onClick={saveToCatalog} className="w-full bg-slate-900 text-yellow-500 font-black py-6 rounded-3xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-[11px]">
            <CheckCircle className="w-6 h-6" /> Valider l'Arrivage Stock
          </button>
        </div>
      )}

      {activeTab === 'ANALYSIS' && (
        <div className="space-y-4 page-enter">
          {items.length === 0 ? (
            <div className="py-32 text-center opacity-20">
              <TrendingUp className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Ajoutez des produits pour analyser</p>
            </div>
          ) : (
            items.map(item => {
              const unitCost = item.buyPrice + gpPerArticle + chargePerArticle;
              return (
                <div key={item.id} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-900 p-6 text-white">
                    <h4 className="font-black text-xs uppercase opacity-40 mb-1 tracking-widest">{item.name || 'Produit'}</h4>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-black text-yellow-500">{unitCost.toLocaleString()} <span className="text-[10px] opacity-50">FG/unité</span></p>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase">Coût de revient</span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                     {[
                       { m: 0.3, l: 'Marge Standard', c: 'bg-green-500' },
                       { m: 0.5, l: 'Marge Premium', c: 'bg-blue-500' },
                       { m: 1.0, l: 'Marge Maximale', c: 'bg-purple-500' }
                     ].map(opt => (
                       <div key={opt.m} className="space-y-2">
                         <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                           <span>{opt.l} (+{opt.m*100}%)</span>
                           <span className="text-slate-900">{Math.round(unitCost * (1 + opt.m)).toLocaleString()} FG</span>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full ${opt.c}`} style={{ width: `${(opt.m / 1) * 100}%` }}></div>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-3 page-enter">
          {history.length === 0 ? (
            <div className="py-32 text-center opacity-20"><History className="w-16 h-16 mx-auto mb-2" /><p className="text-xs font-black uppercase">Historique vide</p></div>
          ) : (
            history.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{new Date(order.date).toLocaleDateString()}</p>
                  <p className="text-sm font-black text-slate-900">{order.items.length} références reçues</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-600">+{order.totalCost.toLocaleString()} FG</p>
                  <p className="text-[7px] font-black uppercase opacity-40">Stock ajouté</p>
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
