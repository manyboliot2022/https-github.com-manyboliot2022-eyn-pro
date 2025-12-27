
import React, { useState, useEffect } from 'react';
import { Barcode, Search, ShoppingBag, Receipt, ArrowRight, X, MessageCircle, CheckCircle2, RotateCcw, Minus, Plus } from 'lucide-react';
// Import UserProfile to satisfy the currentUser prop type
import { Product, Client, PaymentMethod, Transaction, DEFAULT_BRAND_INFO, CompanySettings, UserProfile } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

interface CartItem extends Product {
  quantity: number;
}

// Add currentUser prop to POS to match App.tsx usage
const POS: React.FC<{ currentUser: UserProfile | null }> = ({ currentUser }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_GNF');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [brand, setBrand] = useState<CompanySettings>(DEFAULT_BRAND_INFO);

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
    setClients(JSON.parse(localStorage.getItem('eyn_clients') || '[]'));
    const savedBrand = localStorage.getItem('eyn_brand_info');
    if (savedBrand) setBrand(JSON.parse(savedBrand));
  }, []);

  const findAndAdd = (codeOrName: string) => {
    const prod = products.find(p => 
      (p.barcode && p.barcode === codeOrName) || 
      p.name.toLowerCase().includes(codeOrName.toLowerCase())
    );

    if (prod) {
      if (prod.stock <= 0) {
        alert("⚠️ Stock insuffisant !");
        return;
      }
      const existing = cart.find(i => i.id === prod.id);
      if (existing) {
        setCart(cart.map(i => i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setCart([...cart, { ...prod, quantity: 1 }]);
      }
      setSearch('');
      setIsScanning(false);
    } else if (isScanning) {
      alert("Produit inconnu : " + codeOrName);
      setIsScanning(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQ = Math.max(1, i.quantity + delta);
        const prod = products.find(p => p.id === id);
        if (prod && newQ > prod.stock) {
          alert("⚠️ Stock max atteint");
          return i;
        }
        return { ...i, quantity: newQ };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));
  const total = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
  const changeDue = parseFloat(cashReceived) > total ? parseFloat(cashReceived) - total : 0;

  const confirmTransaction = () => {
    if (cart.length === 0) return;

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
      return p;
    });
    localStorage.setItem('eyn_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    const transactions: Transaction[] = JSON.parse(localStorage.getItem('eyn_transactions') || '[]');
    // Fix: Include required userId property in the Transaction object
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      userId: currentUser?.id || 'unknown',
      type: 'IN',
      amount: total,
      method: paymentMethod,
      description: `Vente POS`,
      category: 'Vente',
      clientId: selectedClientId,
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.sellPrice }))
    };
    localStorage.setItem('eyn_transactions', JSON.stringify([newTransaction, ...transactions]));

    setIsReceiptOpen(true);
  };

  const shareReceipt = () => {
    const client = clients.find(c => c.id === selectedClientId);
    let text = `*${brand.name.toUpperCase()}*\n`;
    text += `_Reçu de vente n°${Date.now()}_\n`;
    text += `--------------------------\n`;
    cart.forEach(i => text += `• ${i.name} x${i.quantity} : ${(i.sellPrice * i.quantity).toLocaleString()} FG\n`);
    text += `--------------------------\n`;
    text += `*TOTAL : ${total.toLocaleString()} FG*\n`;
    text += `Mode : ${paymentMethod}\n`;
    text += `Merci pour votre achat ! ✨\n`;
    text += `_${brand.tagline}_`;

    const url = `https://wa.me/${client?.phone || brand.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 pb-20">
      {isScanning && <BarcodeScanner onScan={findAndAdd} onClose={() => setIsScanning(false)} title="Scanner un article" />}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Nom ou code..." 
            className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold shadow-sm focus:border-yellow-500 outline-none" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && findAndAdd(search)}
          />
        </div>
        <button onClick={() => setIsScanning(true)} className="bg-slate-900 text-yellow-500 p-4 rounded-2xl shadow-xl"><Barcode className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
            <ShoppingBag className="w-16 h-16 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">Prêt pour encaisser</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-50 flex items-center gap-4 shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800 line-clamp-1">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-bold">{(item.sellPrice * item.quantity).toLocaleString()} FG</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-white rounded-lg shadow-sm"><Minus className="w-3 h-3" /></button>
                <span className="text-xs font-black px-2">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 bg-white rounded-lg shadow-sm"><Plus className="w-3 h-3" /></button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-2"><X className="w-4 h-4" /></button>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-900 p-6 rounded-[3rem] shadow-2xl space-y-4">
        <div className="flex justify-between items-center text-white/50 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
          <span>{cart.length} Articles</span>
          <span>{total.toLocaleString()} FG</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="number" 
            placeholder="Reçu Cash ?" 
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-black placeholder:text-white/20"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
          />
          <div className="flex flex-col justify-center px-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[7px] font-black uppercase text-white/40">À Rendre :</p>
            <p className="text-[10px] font-black text-yellow-500">{changeDue.toLocaleString()} FG</p>
          </div>
        </div>

        <button 
          onClick={confirmTransaction}
          disabled={cart.length === 0}
          className="w-full bg-yellow-500 text-slate-900 py-5 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-30"
        >
          Confirmer & Facturer <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {isReceiptOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Vente Terminée</h2>
              <p className="text-xs font-bold text-slate-400 mt-2">Total : {total.toLocaleString()} FG</p>
            </div>
            <div className="space-y-3">
              <button onClick={shareReceipt} className="w-full bg-green-500 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest">
                <MessageCircle className="w-5 h-5" /> Partager via WhatsApp
              </button>
              <button onClick={() => {setCart([]); setIsReceiptOpen(false); setCashReceived('');}} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                Nouvelle Vente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
