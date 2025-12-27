import React, { useState, useEffect } from 'react';
import { Search, Package, Barcode, Trash2, Edit2, Smartphone, Plus, Camera, AlertCircle, Sparkles } from 'lucide-react';
import { Product, PRE_DETECTED_PRODUCTS } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'IMPORT' | 'BATCH'>('STOCK');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [batchList, setBatchList] = useState<{prod: Product, q: number}[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('eyn_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      // Si pas de produits, on affiche l'onglet Import par défaut
      setActiveTab('IMPORT');
    }
  }, []);

  const saveProducts = (newList: Product[]) => {
    setProducts(newList);
    localStorage.setItem('eyn_products', JSON.stringify(newList));
  };

  const deleteProduct = (id: string) => {
    if (confirm("Supprimer ce produit du catalogue ?")) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const onBatchScan = (code: string) => {
    const prod = products.find(p => p.barcode === code);
    if (prod) {
      const existing = batchList.find(b => b.prod.id === prod.id);
      if (existing) {
        setBatchList(batchList.map(b => b.prod.id === prod.id ? { ...b, q: b.q + 1 } : b));
      } else {
        setBatchList([...batchList, { prod, q: 1 }]);
      }
    } else {
      alert("Produit inconnu dans le catalogue : " + code);
    }
  };

  const saveBatch = () => {
    const updated = products.map(p => {
      const batchItem = batchList.find(b => b.prod.id === p.id);
      if (batchItem) return { ...p, stock: p.stock + batchItem.q };
      return p;
    });
    saveProducts(updated);
    setBatchList([]);
    alert("✅ Stocks mis à jour !");
  };

  const importDetected = () => {
    const updated = [...products];
    let addedCount = 0;
    PRE_DETECTED_PRODUCTS.forEach(p => {
      if (!products.find(existing => existing.name === p.name)) {
        updated.push({
          id: Math.random().toString(36).substr(2,9), 
          ...p, 
          barcode: '', 
          costPrice: 0, 
          sellPrice: 0, 
          stock: 0
        });
        addedCount++;
      }
    });
    saveProducts(updated);
    alert(`✅ ${addedCount} produits ajoutés au catalogue !`);
    setActiveTab('STOCK');
  };

  const totalItems = products.length;
  const noBarcode = products.filter(p => !p.barcode).length;
  const totalStockValue = products.reduce((s, p) => s + (p.costPrice * p.stock), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 page-enter">
      {isScanning && <BarcodeScanner onScan={onBatchScan} onClose={() => setIsScanning(false)} title="Batch Scanner" />}

      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('STOCK')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'STOCK' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📦 Stock</button>
        <button onClick={() => setActiveTab('IMPORT')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'IMPORT' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📥 Import</button>
        <button onClick={() => setActiveTab('BATCH')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'BATCH' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>⚡ Batch</button>
      </div>

      {activeTab === 'STOCK' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-[7px] font-black uppercase text-slate-400">Total</p>
              <p className="text-sm font-black text-slate-900">{totalItems}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-[7px] font-black uppercase text-slate-400">Sans Code</p>
              <p className="text-sm font-black text-red-500">{noBarcode}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-[7px] font-black uppercase text-slate-400">Valeur</p>
              <p className="text-[9px] font-black text-green-600 truncate px-1">{totalStockValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Chercher dans le catalogue..." 
              className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm focus:border-yellow-500 transition-all" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div className="space-y-2 pb-24">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <Package className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs font-black uppercase">Aucun produit</p>
              </div>
            ) : (
              products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-black text-slate-800 truncate">{p.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 uppercase flex items-center gap-1">
                        <Barcode className="w-2.5 h-2.5" /> {p.barcode || '---'}
                      </span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>Stock: {p.stock}</span>
                      <span className="text-[8px] font-black bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full uppercase">{p.sellPrice.toLocaleString()} FG</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => deleteProduct(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-transform">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'BATCH' && (
        <div className="space-y-4 page-enter">
          <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black text-sm uppercase mb-2">Scanner de Stock Express</h3>
              <p className="text-[10px] opacity-80 leading-relaxed font-medium">Idéal pour l'arrivée de colis. Scannez en continu, l'app ajoute 1 au stock à chaque bip.</p>
            </div>
            <Smartphone className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
          </div>

          <button onClick={() => setIsScanning(true)} className="w-full bg-slate-900 text-yellow-500 py-6 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <Camera className="w-6 h-6" /> Lancer le Scanner en Continu
          </button>
          
          {batchList.length > 0 && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Articles scannés</h3>
                <button onClick={() => setBatchList([])} className="text-red-500 text-[10px] font-black uppercase">Vider</button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
                {batchList.map(b => (
                  <div key={b.prod.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs font-black text-slate-700 truncate mr-2">{b.prod.name}</span>
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-[10px] shrink-0">x{b.q}</span>
                  </div>
                ))}
              </div>
              <button onClick={saveBatch} className="w-full bg-green-500 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">
                Valider l'entrée en Stock
              </button>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'IMPORT' && (
        <div className="space-y-6 text-center py-6 page-enter">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-yellow-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-black mb-3 uppercase tracking-widest italic">Catalogue Prêt !</h3>
                <p className="text-xs text-white/50 mb-8 leading-relaxed px-4">Nous avons pré-enregistré 40+ produits cosmétiques populaires (Nivea, Vaseline, Cerave) pour vous faire gagner du temps.</p>
                <button onClick={importDetected} className="w-full bg-yellow-500 text-slate-900 font-black py-5 rounded-3xl uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all">
                   Importer le Catalogue (40+)
                </button>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Package className="w-40 h-40" />
              </div>
           </div>
           
           <div className="p-4 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Ou créer manuellement</p>
              <button onClick={() => {
                const name = prompt("Nom du produit ?");
                if(name) {
                  saveProducts([...products, {
                    id: Math.random().toString(36).substr(2,9),
                    name,
                    category: 'Divers',
                    barcode: '',
                    costPrice: 0,
                    sellPrice: 0,
                    stock: 0
                  }]);
                  setActiveTab('STOCK');
                }
              }} className="w-full bg-white text-slate-900 border-2 border-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                + Ajouter 1 seul produit
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;