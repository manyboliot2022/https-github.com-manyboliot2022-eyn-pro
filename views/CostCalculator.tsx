
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, History, Package, CheckCircle, Truck, Globe, Calendar, CheckSquare, Square, X, ChevronRight, Share2, ClipboardCheck } from 'lucide-react';
// Import UserProfile to satisfy the currentUser prop type
import { Order, OrderItem, Product, Supplier, UserProfile } from '../types.ts';

// Add currentUser prop to CostCalculator to match App.tsx usage
const CostCalculator: React.FC<{ currentUser: UserProfile | null }> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'CMD' | 'RECEIVE' | 'HISTORY'>('CMD');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [gpTotal, setGpTotal] = useState<number>(0);
  const [monthlyCharges, setMonthlyCharges] = useState<number>(0);
  const [origin, setOrigin] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [history, setHistory] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  // Pour le pointage
  const [activeControlOrder, setActiveControlOrder] = useState<Order | null>(null);

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('eyn_order_history') || '[]'));
    setSuppliers(JSON.parse(localStorage.getItem('eyn_suppliers') || '[]'));
  }, []);

  const totalBuyPrice = items.reduce((sum, i) => sum + (i.buyPrice * i.quantity), 0);

  const addItem = () => {
    setItems([{ id: Math.random().toString(36).substr(2, 9), name: '', buyPrice: 0, quantity: 1, received: false }, ...items]);
  };

  const savePendingOrder = () => {
    if (items.length === 0 || !selectedSupplierId) return alert("Veuillez choisir un fournisseur et ajouter des articles.");
    
    // Fix: Include required userId property in the Order object
    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      userId: currentUser?.id || 'unknown',
      items: items.map(it => ({...it, received: false})),
      gpTotal,
      chargesTotal: monthlyCharges,
      totalArticles: items.reduce((s,i) => s + i.quantity, 0),
      totalCost: totalBuyPrice + gpTotal,
      supplierId: selectedSupplierId,
      origin,
      expectedDeliveryDate: deliveryDate,
      reference: orderRef,
      status: 'PENDING'
    };

    const newHistory = [newOrder, ...history];
    setHistory(newHistory);
    localStorage.setItem('eyn_order_history', JSON.stringify(newHistory));
    
    setItems([]); setOrigin(''); setDeliveryDate(''); setOrderRef('');
    alert("📦 Commande enregistrée en attente de livraison !");
    setActiveTab('RECEIVE');
  };

  const toggleCheck = (itemId: string) => {
    if (!activeControlOrder) return;
    const updated = {
      ...activeControlOrder,
      items: activeControlOrder.items.map(it => it.id === itemId ? { ...it, received: !it.received } : it)
    };
    setActiveControlOrder(updated);
  };

  const finalizeReception = () => {
    if (!activeControlOrder) return;
    
    const products: Product[] = JSON.parse(localStorage.getItem('eyn_products') || '[]');
    const receivedItems = activeControlOrder.items.filter(it => it.received);
    const missingItems = activeControlOrder.items.filter(it => !it.received);

    // Mettre à jour le catalogue avec les articles REÇUS uniquement
    receivedItems.forEach(it => {
      const existingIdx = products.findIndex(p => p.name.toLowerCase() === it.name.toLowerCase());
      if (existingIdx > -1) {
        products[existingIdx].stock += it.quantity;
      } else {
        products.push({
          id: Math.random().toString(36).substr(2,9),
          name: it.name,
          category: 'Cosmétique',
          barcode: '',
          costPrice: it.buyPrice,
          sellPrice: it.buyPrice * 1.3,
          stock: it.quantity,
          supplierId: activeControlOrder.supplierId
        });
      }
    });

    localStorage.setItem('eyn_products', JSON.stringify(products));

    // Marquer la commande comme validée dans l'historique
    const updatedHistory = history.map(h => 
      h.id === activeControlOrder.id ? { ...activeControlOrder, status: 'RECEIVED' as const } : h
    );
    setHistory(updatedHistory);
    localStorage.setItem('eyn_order_history', JSON.stringify(updatedHistory));

    // Rapport WhatsApp
    const supplier = suppliers.find(s => s.id === activeControlOrder.supplierId);
    let msg = `*EYN PRO - RAPPORT RÉCEPTION*\n`;
    msg += `Réf: ${activeControlOrder.reference || 'CMD'}\n`;
    msg += `--------------------------\n`;
    msg += `✅ REÇUS :\n`;
    receivedItems.forEach(it => msg += `- ${it.name} (x${it.quantity})\n`);
    if(missingItems.length > 0) {
      msg += `\n❌ NON LIVRÉS :\n`;
      missingItems.forEach(it => msg += `- ${it.name} (x${it.quantity})\n`);
    }
    msg += `--------------------------\n`;
    msg += `_Validé le ${new Date().toLocaleDateString()}_`;

    alert("✅ Stock mis à jour !");
    if (confirm("Voulez-vous envoyer le rapport de livraison au fournisseur via WhatsApp ?")) {
      window.open(`https://wa.me/${supplier?.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    setActiveControlOrder(null);
    setActiveTab('HISTORY');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('CMD')} className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'CMD' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-500 opacity-60'}`}>
          <Package className="w-3.5 h-3.5" /> Commande
        </button>
        <button onClick={() => setActiveTab('RECEIVE')} className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'RECEIVE' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-500 opacity-60'}`}>
          <ClipboardCheck className="w-3.5 h-3.5" /> Réception
        </button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'HISTORY' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-500 opacity-60'}`}>
          <History className="w-3.5 h-3.5" /> Historique
        </button>
      </div>

      {activeTab === 'CMD' && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-2"><Truck className="w-5 h-5 text-yellow-500" /> Détails Fournisseur</h3>
            <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)}>
              <option value="">Sélectionner Fournisseur...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
               <input type="text" placeholder="Pays/Ville" className="bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold" value={origin} onChange={e => setOrigin(e.target.value)} />
               <input type="date" className="bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </div>
            <input type="text" placeholder="Référence (ex: CMD001)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold" value={orderRef} onChange={e => setOrderRef(e.target.value)} />
          </div>

          <section className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-black uppercase text-slate-400">Articles attendus</h3>
              <button onClick={addItem} className="bg-slate-900 text-yellow-500 p-3.5 rounded-2xl active:scale-90 shadow-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {items.map(it => (
                <div key={it.id} className="p-4 bg-slate-50 rounded-2xl relative border border-slate-100">
                  <input type="text" placeholder="Article..." className="w-full bg-transparent border-b border-slate-200 py-2 text-xs font-black mb-3 focus:border-yellow-500 outline-none" value={it.name} onChange={e => setItems(items.map(x => x.id === it.id ? {...x, name: e.target.value} : x))} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="P. Achat" className="bg-white p-3 rounded-xl text-xs font-bold" value={it.buyPrice || ''} onChange={e => setItems(items.map(x => x.id === it.id ? {...x, buyPrice: parseFloat(e.target.value)} : x))} />
                    <input type="number" placeholder="Qté" className="bg-white p-3 rounded-xl text-xs font-bold" value={it.quantity || ''} onChange={e => setItems(items.map(x => x.id === it.id ? {...x, quantity: parseInt(e.target.value)} : x))} />
                  </div>
                  <button onClick={() => setItems(items.filter(x => x.id !== it.id))} className="absolute top-2 right-2 text-red-300"><X className="w-4 h-4" /></button>
                </div>
              ))}
              {items.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase text-slate-300 italic">Aucune commande en cours</p>}
            </div>
          </section>

          <button onClick={savePendingOrder} className="w-full bg-slate-900 text-yellow-500 py-6 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95">
            <Package className="w-5 h-5" /> Enregistrer la Commande
          </button>
        </div>
      )}

      {activeTab === 'RECEIVE' && !activeControlOrder && (
        <div className="space-y-4 animate-in fade-in duration-500">
           <div className="bg-yellow-50 p-6 rounded-[2.5rem] border border-yellow-100 text-center">
             <ClipboardCheck className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
             <p className="text-[10px] font-black uppercase text-yellow-700">Choisir une commande pour pointer la réception</p>
           </div>
           {history.filter(h => h.status === 'PENDING').map(order => (
             <button key={order.id} onClick={() => setActiveControlOrder(order)} className="w-full bg-white p-6 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm text-left active:scale-95 transition-all">
                <div className="flex-1 pr-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{order.reference || 'SANS RÉF'}</p>
                  <h4 className="text-sm font-black text-slate-900 leading-none mb-1">{suppliers.find(s => s.id === order.supplierId)?.name || 'Fournisseur inconnu'}</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{order.items.length} articles attendus • {order.origin}</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-2xl text-yellow-500"><ChevronRight className="w-5 h-5" /></div>
             </button>
           ))}
           {history.filter(h => h.status === 'PENDING').length === 0 && <p className="text-center py-20 text-xs font-bold text-slate-300 uppercase italic">Toutes les réceptions sont à jour</p>}
        </div>
      )}

      {activeTab === 'RECEIVE' && activeControlOrder && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
             <div className="flex justify-between items-center mb-6">
                <button onClick={() => setActiveControlOrder(null)} className="text-white/30"><ChevronRight className="rotate-180 w-7 h-7"/></button>
                <div className="text-right"><h3 className="text-lg font-black text-yellow-500 leading-none">Contrôle Livraison</h3><p className="text-[10px] uppercase font-bold text-white/30 mt-1">{activeControlOrder.reference}</p></div>
             </div>
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <Globe className="text-yellow-500 w-5 h-5"/>
                <div><p className="text-[8px] font-black uppercase text-white/30">Provenance</p><p className="text-xs font-bold">{activeControlOrder.origin || 'N/A'}</p></div>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] p-7 shadow-sm border border-slate-100 space-y-4">
             <div className="flex justify-between items-center border-b pb-4 mb-2">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pointer les articles reçus</h4>
               <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black">{activeControlOrder.items.filter(it => it.received).length} / {activeControlOrder.items.length}</span>
             </div>
             <div className="space-y-3">
               {activeControlOrder.items.map(it => (
                 <button key={it.id} onClick={() => toggleCheck(it.id)} className={`w-full p-5 rounded-[2rem] flex items-center justify-between border transition-all ${it.received ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                    <div className="text-left">
                      <p className={`text-[11px] font-black uppercase ${it.received ? 'text-emerald-900' : 'text-slate-500'}`}>{it.name}</p>
                      <p className="text-[8px] font-bold opacity-50">Qté attendue : {it.quantity}</p>
                    </div>
                    {it.received ? <CheckSquare className="text-emerald-600 w-7 h-7"/> : <Square className="text-slate-300 w-7 h-7"/>}
                 </button>
               ))}
             </div>
          </div>

          <button onClick={finalizeReception} className="w-full bg-emerald-600 text-white py-7 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-2xl active:scale-95">
            <CheckCircle className="w-6 h-6" /> Valider la Réception & Stock
          </button>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-4 animate-in fade-in">
          {history.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">{new Date(order.date).toLocaleDateString()} • {order.origin}</p>
                    <h4 className="text-sm font-black text-slate-900">{suppliers.find(s => s.id === order.supplierId)?.name || 'Fournisseur Inconnu'}</h4>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${order.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {order.status === 'RECEIVED' ? 'Livré' : 'En transit'}
                  </span>
               </div>
               <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {order.items.map(it => (
                    <span key={it.id} className={`shrink-0 px-3 py-1.5 rounded-full text-[8px] font-black uppercase border ${it.received ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-400 opacity-40'}`}>
                      {it.name} x{it.quantity}
                    </span>
                  ))}
               </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-center py-20 text-xs font-bold text-slate-300 uppercase italic">Aucun historique de commande</p>}
        </div>
      )}
    </div>
  );
};

export default CostCalculator;
