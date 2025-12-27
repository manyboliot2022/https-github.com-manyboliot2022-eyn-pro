
import React, { useState, useEffect } from 'react';
import { Barcode, Search, ShoppingBag, Receipt, ArrowRight, X, Share2, MessageCircle, MapPin, CreditCard, CheckCircle2, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import { Product, Client, PaymentMethod, Transaction, DEFAULT_BRAND_INFO, CompanySettings, RefundRequest } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

interface CartItem extends Product {
  quantity: number;
}

const POS: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_GNF');
  const [search, setSearch] = useState('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isReturnMode, setIsReturnMode] = useState(false);
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

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));
  const total = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);

  const confirmTransaction = () => {
    if (isReturnMode) {
      // MODE RETOUR : On crée une demande en attente
      const refunds: RefundRequest[] = JSON.parse(localStorage.getItem('eyn_refund_requests') || '[]');
      const client = clients.find(c => c.id === selectedClientId);
      
      const newRequest: RefundRequest = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        clientId: selectedClientId,
        clientName: client?.name || "Client Occasionnel",
        amount: total,
        items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })),
        status: 'PENDING'
      };

      localStorage.setItem('eyn_refund_requests', JSON.stringify([newRequest, ...refunds]));
      alert("⏳ Demande de retour envoyée en attente de validation par le gérant.");
      setCart([]);
      setIsReturnMode(false);
      return;
    }

    // MODE VENTE : Immédiat
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
      return p;
    });
    localStorage.setItem('eyn_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    const transactions: Transaction[] = JSON.parse(localStorage.getItem('eyn_transactions') || '[]');
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: 'IN',
      amount: total,
      method: paymentMethod,
      description: `Vente de ${cart.length} articles`,
      category: 'Vente',
      clientId: selectedClientId
    };
    localStorage.setItem('eyn_transactions', JSON.stringify([newTransaction, ...transactions]));

    setIsReceiptOpen(true);
  };

  const handleShare = (type: 'WHATSAPP' | 'SMS') => {
    const client = clients.find(c => c.id === selectedClientId);
    let text = `✨ ${brand.name.toUpperCase()} ✨\n`;
    text += `${isReturnMode ? '🔄 DEMANDE DE RETOUR' : '🧾 FACTURE'} DU ${new Date().toLocaleDateString()}\n`;
    text += `--------------------------\n`;
    cart.forEach(i => text += `- ${i.name} x${i.quantity} : ${(i.sellPrice * i.quantity).toLocaleString()} FG\n`);
    text += `--------------------------\n`;
    text += `TOTAL : ${total.toLocaleString()} FG\n\n`;
    text += isReturnMode ? `Demande en attente de validation.` : `Merci de votre confiance !`;

    const encodedText = encodeURIComponent(text);
    if (type === 'WHATSAPP') {
      window.open(`https://wa.me/${client?.phone || brand.whatsapp}?text=${encodedText}`);
    }
  };

  return (
    <div className={`h-full flex flex-col space-y-4 animate-in fade-in duration-500 ${isReturnMode ? 'bg-orange-50/50' : ''}`}>
      {isScanning && (
        <BarcodeScanner 
          onScan={findAndAdd} 
          onClose={() => setIsScanning(false)} 
          title={isReturnMode ? "Scanner pour Retour" : "Scanner pour Vendre"} 
        />
      )}

      <div className="flex justify-between items-center">
         <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isReturnMode ? 'text-orange-600' : 'text-slate-400'}`}>
           {isReturnMode ? '🛠️ Mode Retour (En Attente)' : '🛍️ Mode Vente Directe'}
         </h2>
         <button 
           onClick={() => {
             setIsReturnMode(!isReturnMode);
             setCart([]);
           }}
           className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isReturnMode ? 'bg-slate-900 text-white shadow-lg' : 'bg-orange-100 text-orange-600 border border-orange-200'}`}
         >
           <RotateCcw className={`w-3 h-3 ${isReturnMode ? 'animate-spin' : ''}`} /> 
           {isReturnMode ? 'Quitter Retour' : 'Retour Article'}
         </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select 
          className="bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-yellow-500 shadow-sm outline-none"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">👤 Client Occasionnel</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select 
          className={`border-none rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg outline-none transition-colors ${isReturnMode ? 'bg-orange-600 text-white' : 'bg-slate-900 text-yellow-500'}`}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        >
          <option value="CASH_GNF">💸 Cash GNF</option>
          <option value="OM">🟠 Orange Money</option>
          <option value="MTN">🟡 Moov/MTN</option>
        </select>
      </div>

      {isReturnMode && (
        <div className="bg-orange-500 text-white p-4 rounded-2xl flex items-center gap-3">
           <Clock className="w-5 h-5 shrink-0" />
           <p className="text-[10px] font-black uppercase tracking-tight leading-tight">Cette opération doit être validée dans l'onglet Finance par le gérant.</p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={isReturnMode ? "Chercher produit à retourner..." : "Chercher produit..."} 
            className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold shadow-sm focus:border-yellow-500 transition-all outline-none" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && findAndAdd(search)}
          />
        </div>
        <button 
          onClick={() => setIsScanning(true)} 
          className={`p-4 rounded-2xl shadow-xl active:scale-95 transition-all ${isReturnMode ? 'bg-orange-600 text-white' : 'bg-slate-900 text-yellow-500'}`}
        >
          <Barcode className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
            {isReturnMode ? <RotateCcw className="w-16 h-16 mb-4" /> : <ShoppingBag className="w-16 h-16 mb-4" />}
            <p className="font-black uppercase tracking-widest text-xs">{isReturnMode ? 'Préparer le Retour' : 'Panier vide'}</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-50 flex items-center gap-4 shadow-sm animate-in slide-in-from-right duration-300">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${isReturnMode ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>{item.quantity}</div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800 line-clamp-1">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-bold">{(item.sellPrice * item.quantity).toLocaleString()} FG</p>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-2 active:bg-red-50 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className={`${isReturnMode ? 'bg-orange-600' : 'bg-slate-900'} p-6 rounded-[3rem] shadow-2xl space-y-4 transition-colors`}>
        <div className="flex justify-between items-end border-b border-white/10 pb-4">
          <span className="text-xs font-black uppercase text-white/50 tracking-widest">{isReturnMode ? 'Remboursement Prévu' : 'Total Net'}</span>
          <span className={`text-3xl font-black ${isReturnMode ? 'text-white' : 'text-yellow-500'}`}>{total.toLocaleString()} FG</span>
        </div>
        <button 
          onClick={confirmTransaction}
          disabled={cart.length === 0}
          className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg disabled:opacity-50 ${isReturnMode ? 'bg-white text-orange-600' : 'bg-yellow-500 text-slate-900'}`}
        >
          {isReturnMode ? 'Soumettre au Gérant' : 'Confirmer la Vente'} <ArrowRight className="w-6 h-6" />
        </button>
      </div>
      
      {isReceiptOpen && !isReturnMode && (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center space-y-6 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-green-100 text-green-600`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vente enregistrée</p>
              <h2 className="text-3xl font-black mt-1 text-slate-900">{total.toLocaleString()} FG</h2>
            </div>
            <div className="flex flex-col gap-2">
               <button onClick={() => handleShare('WHATSAPP')} className="bg-green-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                 <MessageCircle className="w-5 h-5" /> Partager Reçu WhatsApp
               </button>
               <button onClick={() => {setCart([]); setIsReceiptOpen(false);}} className="bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">
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
