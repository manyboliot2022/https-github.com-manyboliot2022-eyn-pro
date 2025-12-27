
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Barcode, ArrowRight, X, Minus, Plus, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Product, Transaction, UserProfile } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

interface CartItem extends Product {
  quantity: number;
}

const POS: React.FC<{ currentUser: UserProfile | null }> = ({ currentUser }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eyn_products');
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const findAndAdd = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return;

    const p = products.find(prod => 
      (prod.barcode && prod.barcode === q) || 
      prod.reference.toLowerCase() === q ||
      prod.name.toLowerCase().includes(q)
    );

    if (p) {
      setCart(prevCart => {
        const existing = prevCart.find(item => item.id === p.id);
        if (existing) {
          return prevCart.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
          return [...prevCart, { ...p, quantity: 1 }];
        }
      });
      setSearch('');
    } else if (query.length > 2 && !isScanning) {
      alert("Article non identifié : " + query);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const total = cart.reduce((s, i) => s + (i.sellPrice * i.quantity), 0);
  const changeDue = parseFloat(cashReceived) > total ? parseFloat(cashReceived) - total : 0;

  const handleConfirm = () => {
    if (cart.length === 0) return;
    const trans: Transaction[] = JSON.parse(localStorage.getItem('eyn_transactions') || '[]');
    const newTrans: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      userId: currentUser?.id || 'admin',
      type: 'IN',
      amount: total,
      method: 'CASH',
      description: 'Vente Boutique',
      category: 'Vente',
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.sellPrice }))
    };
    
    const currentProducts = JSON.parse(localStorage.getItem('eyn_products') || '[]');
    const updatedProducts = currentProducts.map((p: Product) => {
      const cartItem = cart.find(ci => ci.id === p.id);
      return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.quantity) } : p;
    });
    localStorage.setItem('eyn_products', JSON.stringify(updatedProducts));
    localStorage.setItem('eyn_transactions', JSON.stringify([newTrans, ...trans]));
    setIsSuccess(true);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {isScanning && <BarcodeScanner onScan={findAndAdd} onClose={() => setIsScanning(false)} />}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full bg-white rounded-3xl pl-12 pr-6 py-5 text-sm font-black shadow-sm outline-none border border-slate-50 focus:border-slate-200" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && findAndAdd(search)}
          />
        </div>
        <button onClick={() => setIsScanning(true)} className="bg-[#111827] text-yellow-400 p-5 rounded-3xl shadow-xl active:scale-90 transition-transform flex items-center gap-2">
          <Barcode className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase hidden sm:inline">Scanner</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 text-center">
            <ShoppingBag className="w-20 h-20 mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px]">En attente d'articles</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[2.5rem] flex items-center gap-4 shadow-sm animate-fade border border-slate-50">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-slate-800 truncate">{item.name}</p>
                <p className="text-[10px] text-slate-900 font-black mt-1">{(item.sellPrice * item.quantity).toLocaleString()} FG</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl">
                <button onClick={() => updateQty(item.id, -1)} className="p-2 bg-white rounded-xl shadow-sm active:scale-90 transition-all"><Minus className="w-3 h-3 text-slate-400"/></button>
                <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1)} className="p-2 bg-white rounded-xl shadow-sm active:scale-90 transition-all"><Plus className="w-3 h-3 text-slate-900"/></button>
              </div>
              <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="p-2 text-red-100"><X className="w-5 h-5"/></button>
            </div>
          ))
        )}
      </div>

      <div className="bg-[#111827] p-8 rounded-[3rem] shadow-2xl space-y-6">
        <div className="flex justify-between items-center text-white/40 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-4">
          <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> {cart.length} ARTICLES</span>
          <span className="text-white text-base tracking-tighter">{total.toLocaleString()} FG</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
             <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Reçu Cash ?</label>
             <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-black outline-none focus:border-yellow-400/50" value={cashReceived} onChange={e => setCashReceived(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">À Rendre :</label>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center justify-center">
              <p className="text-sm font-black text-yellow-400">{changeDue.toLocaleString()} FG</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleConfirm}
          disabled={cart.length === 0} 
          className="w-full bg-yellow-400 text-[#111827] py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.1em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-20 shadow-xl"
        >
          CONFIRMER LA VENTE <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {isSuccess && (
        <div className="fixed inset-0 z-[500] bg-[#111827]/98 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-[4rem] p-10 text-center space-y-8 animate-fade shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#111827] uppercase tracking-tighter italic">SUCCÈS</h2>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Transaction enregistrée et stock mis à jour.</p>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-[#25D366] text-white py-5 rounded-3xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-lg">
                <MessageCircle className="w-5 h-5" /> WhatsApp Reçu
              </button>
              <button onClick={() => {setCart([]); setIsSuccess(false); setCashReceived(''); window.location.reload(); }} className="w-full bg-[#111827] text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                NOUVELLE VENTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
