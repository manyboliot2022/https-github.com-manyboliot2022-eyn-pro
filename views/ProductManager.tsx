
import React, { useState, useEffect } from 'react';
import { Search, Package, Barcode, Trash2, Edit2, Smartphone, Plus, Camera, AlertCircle } from 'lucide-react';
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
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const saveProducts = (newList: Product[]) => {
    setProducts(newList);
    localStorage.setItem('eyn_products', JSON.stringify(newList));
  };

  const deleteProduct = (id: string) => {
    if (confirm("Supprimer définitivement ce produit ?")) {
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

  // Stats
  const totalItems = products.length;
  const noBarcode = products.filter(p => !p.barcode).length;
  const totalStockValue = products.reduce((s, p) => s + (p.costPrice * p.stock), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {isScanning && <BarcodeScanner onScan={onBatchScan} onClose={() => setIsScanning(false)} title="Batch Scanner" />}

      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('STOCK')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'STOCK' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📦 Stock</button>
        <button onClick={() => setActiveTab('IMPORT')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'IMPORT' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📥 Import</button>
        <button onClick={() => setActiveTab('BATCH')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'BATCH' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>⚡ Batch</button>
      </div>

      {activeTab === 'STOCK' && (
        <>
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
              <p className="text-[7px] font-black uppercase text-slate-400">Valeur Stock</p>
              <p className="text-[10px] font-black text-green-600">{totalStockValue.toLocaleString()} FG</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input type="text" placeholder="Chercher produit..." className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="space-y-2 pb-10">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-50 flex justify-between items-center shadow-sm group">
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-900">{p.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded-full text-slate-400 uppercase flex items-center gap-1">
                      <Barcode className="w-2.5 h-2.5" /> {p.barcode || '---'}
                    </span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Stock: {p.stock}</span>
                    <span className="text-[8px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full uppercase">{p.sellPrice.toLocaleString()} FG</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'BATCH' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
              Le Batch Scanner permet de scanner plusieurs produits à la suite pour augmenter leur stock rapidement.
            </p>
          </div>
          <button onClick={() => setIsScanning(true)} className="w-full bg-slate-900 text-yellow-500 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <Camera className="w-5 h-5" /> Lancer Scanner en Continu
          </button>
          
          {batchList.length > 0 && (
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Articles détectés</h3>
              <div className="space-y-2">
                {batchList.map(b => (
                  <div key={b.prod.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs font-black text-slate-700">{b.prod.name}</span>
                    <span className="bg-yellow-500 text-slate-900 px-3 py-1 rounded-lg font-black text-[10px]">x{b.q}</span>
                  </div>
                ))}
              </div>
              <button onClick={saveBatch} className="w-full bg-yellow-500 text-slate-900 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg">
                Valider l'entrée en Stock
              </button>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'IMPORT' && (
        <div className="space-y-6 text-center py-10">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
              <Package className="w-16 h-16 text-yellow-500 mx-auto mb-6 animate-bounce" />
              <h3 className="text-xl font-black mb-2 uppercase tracking-widest">40+ Produits Détectés</h3>
              <p className="text-xs text-white/50 mb-8 leading-relaxed px-4">Importez instantanément notre catalogue de base (Nivea, Vaseline, Cerave, etc.)</p>
              <button onClick={() => {
                const updated = [...products];
                PRE_DETECTED_PRODUCTS.forEach(p => {
                  if (!products.find(existing => existing.name === p.name)) {
                    updated.push({
                      id: Math.random().toString(36).substr(2,9), 
                      ...p, 
                      barcode: '', 
                      costPrice:0, 
                      sellPrice:0, 
                      stock:0
                    });
                  }
                });
                saveProducts(updated);
                alert("Catalogue importé avec succès !");
                setActiveTab('STOCK');
              }} className="w-full bg-yellow-500 text-slate-900 font-black py-5 rounded-3xl uppercase tracking-widest text-[10px] shadow-xl">
                 Importer le Catalogue
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
