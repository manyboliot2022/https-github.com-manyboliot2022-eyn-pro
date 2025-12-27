
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck, Save, Calculator, ArrowRight, PackageCheck, History, UserPlus, ScanLine, Barcode } from 'lucide-react';
import { PurchaseOrder, OrderItem, Supplier, Product } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

const CostCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'PENDING' | 'HISTORY'>('NEW');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [gpTotal, setGpTotal] = useState<number>(0);
  const [chargesTotal, setChargesTotal] = useState<number>(0);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setSuppliers(JSON.parse(localStorage.getItem('eyn_suppliers') || '[]'));
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', reference: '', buyPrice: 0, quantity: 1 }]);
  };

  const handleScan = (code: string) => {
    const products: Product[] = JSON.parse(localStorage.getItem('eyn_products') || '[]');
    const existingProduct = products.find(p => p.barcode === code);

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => 
        (i.barcode === code) || 
        (existingProduct && i.reference === existingProduct.reference)
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        const newItem: OrderItem = existingProduct ? {
          id: Date.now().toString(),
          name: existingProduct.name,
          reference: existingProduct.reference,
          barcode: existingProduct.barcode,
          buyPrice: existingProduct.costPrice,
          quantity: 1
        } : {
          id: Date.now().toString(),
          name: '',
          reference: '',
          barcode: code,
          buyPrice: 0,
          quantity: 1
        };
        return [...prevItems, newItem];
      }
    });
    // On ne ferme plus isScanning ici pour permettre le scan continu
  };

  const saveOrder = (status: PurchaseOrder['status'] = 'DRAFT') => {
    if (!selectedSupplier) return alert("Sélectionnez un fournisseur");
    const orders: PurchaseOrder[] = JSON.parse(localStorage.getItem('eyn_purchase_orders') || '[]');
    const newOrder: PurchaseOrder = {
      id: `BC-${Date.now()}`,
      date: new Date().toISOString(),
      supplierId: selectedSupplier,
      status,
      items,
      gpTotal,
      chargesTotal
    };
    localStorage.setItem('eyn_purchase_orders', JSON.stringify([newOrder, ...orders]));
    alert(status === 'ORDERED' ? "🚀 Commande envoyée !" : "💾 Brouillon enregistré");
    setItems([]); setGpTotal(0); setChargesTotal(0); setSelectedSupplier('');
  };

  const transformToStock = (order: PurchaseOrder) => {
    const products: Product[] = JSON.parse(localStorage.getItem('eyn_products') || '[]');
    const totalArticles = order.items.reduce((s, i) => s + i.quantity, 0);
    const overheadPerUnit = totalArticles > 0 ? (order.gpTotal + order.chargesTotal) / totalArticles : 0;

    const updatedProducts = [...products];
    order.items.forEach(item => {
      const idx = updatedProducts.findIndex(p => 
        (item.barcode && p.barcode === item.barcode) ||
        (item.reference && p.reference.toLowerCase() === item.reference.toLowerCase()) || 
        p.name.toLowerCase() === item.name.toLowerCase()
      );
      
      if (idx !== -1) {
        updatedProducts[idx].stock += item.quantity;
        updatedProducts[idx].costPrice = item.buyPrice;
        updatedProducts[idx].realCost = item.buyPrice + overheadPerUnit;
        if (item.barcode && !updatedProducts[idx].barcode) {
          updatedProducts[idx].barcode = item.barcode;
        }
      } else {
        updatedProducts.push({
          id: Date.now().toString() + Math.random(),
          reference: item.reference || ('REF-' + Math.random().toString(36).substring(7).toUpperCase()),
          name: item.name || 'Produit sans nom',
          description: 'Créé via réception BC ' + order.id,
          category: 'Arrivage',
          barcode: item.barcode || '',
          costPrice: item.buyPrice,
          realCost: item.buyPrice + overheadPerUnit,
          sellPrice: (item.buyPrice + overheadPerUnit) * 1.35,
          stock: item.quantity
        });
      }
    });

    localStorage.setItem('eyn_products', JSON.stringify(updatedProducts));
    const orders: PurchaseOrder[] = JSON.parse(localStorage.getItem('eyn_purchase_orders') || '[]');
    localStorage.setItem('eyn_purchase_orders', JSON.stringify(orders.map(o => o.id === order.id ? {...o, status: 'RECEIVED'} : o)));
    alert("✅ Arrivage réceptionné et stock mis à jour !");
    setActiveTab('HISTORY');
  };

  return (
    <div className="space-y-6 pb-28">
      {isScanning && <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} title="SCANNER L'ARRIVAGE" />}

      <div className="flex bg-slate-200/50 p-1.5 rounded-[2.5rem] gap-1">
        <button onClick={() => setActiveTab('NEW')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-3xl transition-all ${activeTab === 'NEW' ? 'bg-[#111827] text-yellow-400 shadow-xl' : 'text-slate-400'}`}>Nouveau BC</button>
        <button onClick={() => setActiveTab('PENDING')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-3xl transition-all ${activeTab === 'PENDING' ? 'bg-[#111827] text-yellow-400 shadow-xl' : 'text-slate-400'}`}>En cours</button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-3xl transition-all ${activeTab === 'HISTORY' ? 'bg-[#111827] text-yellow-400 shadow-xl' : 'text-slate-400'}`}>Archives</button>
      </div>

      {activeTab === 'NEW' && (
        <div className="space-y-4 animate-fade">
          <div className="bg-[#111827] p-8 rounded-[3.5rem] text-white shadow-2xl space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">En-tête Commande</h3>
                <Truck className="w-5 h-5 text-white/20"/>
             </div>
             <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-black outline-none focus:border-yellow-400" value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                <option value="">Sélectionner Fournisseur...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Frais GP Colis</label>
                  <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs font-black outline-none focus:border-yellow-400" value={gpTotal || ''} onChange={e => setGpTotal(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Autres Charges</label>
                  <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs font-black outline-none focus:border-yellow-400" value={chargesTotal || ''} onChange={e => setChargesTotal(parseFloat(e.target.value))} />
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center px-4 pt-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Articles du Bon ({items.length})</h4>
            <div className="flex gap-2">
              <button onClick={() => setIsScanning(true)} className="bg-yellow-400 text-[#111827] p-3 rounded-2xl shadow-lg active:scale-90 transition-transform flex items-center gap-2">
                <ScanLine className="w-5 h-5"/>
                <span className="text-[8px] font-black uppercase">Scanner en continu</span>
              </button>
              <button onClick={addItem} className="bg-slate-900 text-yellow-400 p-3 rounded-2xl shadow-lg active:scale-90 transition-transform"><Plus className="w-5 h-5"/></button>
            </div>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-[3rem] border border-slate-50 space-y-4 shadow-sm relative group">
                <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="absolute top-4 right-6 text-red-100 group-hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="RÉFÉRENCE (CODE)" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black uppercase outline-none" value={item.reference} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, reference: e.target.value} : i))} />
                  <input type="text" placeholder="DÉSIGNATION" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black uppercase outline-none" value={item.name} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, name: e.target.value} : i))} />
                </div>
                {item.barcode && (
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Barcode className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.barcode}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-[7px] font-black text-slate-300 uppercase ml-2">Prix d'achat unitaire</span>
                    <input type="number" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-black outline-none" value={item.buyPrice || ''} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, buyPrice: parseFloat(e.target.value)} : i))} />
                  </div>
                  <div className="w-24 space-y-1">
                    <span className="text-[7px] font-black text-slate-300 uppercase ml-2">Quantité</span>
                    <input type="number" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-black outline-none" value={item.quantity || ''} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, quantity: parseInt(e.target.value)} : i))} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="flex gap-3 pt-4">
              <button onClick={() => saveOrder('DRAFT')} className="flex-1 bg-white border border-slate-100 text-slate-400 py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-sm">Brouillon</button>
              <button onClick={() => saveOrder('ORDERED')} className="flex-[2] bg-yellow-400 text-[#111827] py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-[0.98] transition-all">Valider la Commande</button>
            </div>
          )}
        </div>
      )}

      {(activeTab === 'PENDING' || activeTab === 'HISTORY') && (
        <div className="space-y-4 animate-fade">
          {(JSON.parse(localStorage.getItem('eyn_purchase_orders') || '[]') as PurchaseOrder[])
            .filter(o => activeTab === 'PENDING' ? o.status !== 'RECEIVED' : o.status === 'RECEIVED')
            .map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[3.5rem] border border-slate-50 space-y-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-tighter">{order.id}</h5>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest ${order.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-yellow-50 text-yellow-600'}`}>{order.status}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.items.length} ARTICLES</span>
                  <span className="text-xs font-black text-slate-900">{order.items.reduce((s,i) => s + (i.buyPrice*i.quantity), 0).toLocaleString()} FG</span>
                </div>
                {order.status !== 'RECEIVED' && (
                  <button onClick={() => transformToStock(order)} className="w-full bg-[#111827] text-yellow-400 py-5 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                    <PackageCheck className="w-5 h-5"/> RÉCEPTIONNER & INTÉGRER AU STOCK
                  </button>
                )}
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CostCalculator;
