
import React, { useState, useEffect } from 'react';
import { Search, Package, Barcode, Trash2, Edit2, Smartphone, Plus, Camera, Sparkles, X, Save, CheckCircle2 } from 'lucide-react';
import { Product, PRE_DETECTED_PRODUCTS } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'IMPORT' | 'BATCH'>('STOCK');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [batchList, setBatchList] = useState<{prod: Product, q: number}[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedForImport, setSelectedForImport] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('eyn_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    saveProducts(updated);
    setEditingProduct(null);
  };

  const toggleImportSelection = (name: string) => {
    setSelectedForImport(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const runImport = () => {
    const toImport = PRE_DETECTED_PRODUCTS.filter(p => selectedForImport.includes(p.name));
    const updated = [...products];
    let added = 0;
    toImport.forEach(p => {
      if (!products.find(existing => existing.name === p.name)) {
        updated.push({
          id: Math.random().toString(36).substr(2,9), 
          name: p.name,
          category: p.category, 
          barcode: '', 
          costPrice: 0, 
          sellPrice: 0, 
          stock: 0
        });
        added++;
      }
    });
    saveProducts(updated);
    alert(`✅ ${added} produits importés !`);
    setActiveTab('STOCK');
    setSelectedForImport([]);
  };

  const totalStockValue = products.reduce((s, p) => s + (p.costPrice * p.stock), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      {isScanning && <BarcodeScanner onScan={(code) => {
        const p = products.find(prod => prod.barcode === code);
        if(p) {
           const existing = batchList.find(b => b.prod.id === p.id);
           if (existing) setBatchList(batchList.map(b => b.prod.id === p.id ? { ...b, q: b.q + 1 } : b));
           else setBatchList([...batchList, { prod: p, q: 1 }]);
        } else {
          alert("Produit non trouvé : " + code);
        }
      }} onClose={() => setIsScanning(false)} title="Batch Scanner" />}

      {/* Modal Edition */}
      {editingProduct && (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
           <form onSubmit={handleEditSubmit} className="bg-white w-full max-w-md rounded-[3rem] p-8 space-y-5 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Éditer Produit</h3>
                <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-300"><X /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Nom du produit</label>
                  <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Code-Barres</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={editingProduct.barcode} onChange={e => setEditingProduct({...editingProduct, barcode: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Stock Actuel</label>
                    <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Prix Achat</label>
                    <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={editingProduct.costPrice} onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Prix Vente</label>
                    <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-green-600" value={editingProduct.sellPrice} onChange={e => setEditingProduct({...editingProduct, sellPrice: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-xl">
                <Save className="w-5 h-5" /> Enregistrer les modifications
              </button>
           </form>
        </div>
      )}

      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('STOCK')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'STOCK' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📦 Catalogue</button>
        <button onClick={() => setActiveTab('IMPORT')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'IMPORT' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📥 Import</button>
        <button onClick={() => setActiveTab('BATCH')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'BATCH' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>⚡ Batch</button>
      </div>

      {activeTab === 'STOCK' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 p-4 rounded-3xl text-white">
              <p className="text-[7px] font-black uppercase opacity-40">Total Produits</p>
              <p className="text-xl font-black">{products.length}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[7px] font-black uppercase text-slate-400">Valeur Stock</p>
              <p className="text-lg font-black text-green-600">{totalStockValue.toLocaleString()} FG</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm focus:ring-2 ring-yellow-500 transition-all" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm active:scale-[0.98] transition-all">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-sm font-black text-slate-800 truncate mb-1">{p.name}</h4>
                  <div className="flex gap-2">
                    <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase">Code: {p.barcode || '---'}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>Stock: {p.stock}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingProduct(p)} className="p-3 bg-slate-900 text-yellow-500 rounded-2xl shadow-md"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'IMPORT' && (
        <div className="space-y-4 page-enter">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white text-center shadow-2xl space-y-4">
              <Sparkles className="w-10 h-10 text-yellow-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-black uppercase tracking-widest italic">Bibliothèque EYN</h3>
              <p className="text-[10px] text-white/50 leading-relaxed">Sélectionnez les produits que vous vendez pour les ajouter instantanément à votre catalogue.</p>
           </div>
           
           <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 space-y-2 max-h-[50vh] overflow-y-auto hide-scrollbar">
              {PRE_DETECTED_PRODUCTS.map(p => (
                <div 
                  key={p.name} 
                  onClick={() => toggleImportSelection(p.name)}
                  className={`p-4 rounded-2xl flex justify-between items-center border transition-all ${selectedForImport.includes(p.name) ? 'bg-yellow-50 border-yellow-500 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'}`}
                >
                  <div className="text-left">
                    <p className={`text-xs font-black uppercase tracking-tight ${selectedForImport.includes(p.name) ? 'text-slate-900' : ''}`}>{p.name}</p>
                    <p className="text-[8px] font-bold opacity-40">{p.category}</p>
                  </div>
                  {selectedForImport.includes(p.name) && <CheckCircle2 className="w-5 h-5 text-yellow-600" />}
                </div>
              ))}
           </div>

           <button 
             onClick={runImport}
             disabled={selectedForImport.length === 0}
             className="w-full bg-yellow-500 text-slate-900 py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-30"
           >
             Importer ({selectedForImport.length}) produits
           </button>
        </div>
      )}

      {activeTab === 'BATCH' && (
        <div className="space-y-4 page-enter">
          <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl">
             <h3 className="font-black text-sm uppercase mb-2">Scanner en Rafale</h3>
             <p className="text-[10px] opacity-80 leading-relaxed font-medium">Ouvrez le scanner et passez tous vos nouveaux produits devant. L'app s'occupe de compter !</p>
          </div>
          <button onClick={() => setIsScanning(true)} className="w-full bg-slate-900 text-yellow-500 py-6 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl">
            <Camera className="w-6 h-6" /> Lancer le Scanner
          </button>
          
          {batchList.length > 0 && (
            <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase text-slate-400">À ajouter au stock :</h3>
                <button onClick={() => setBatchList([])} className="text-red-500 text-[10px] font-black uppercase">Tout vider</button>
              </div>
              <div className="space-y-2">
                {batchList.map(b => (
                  <div key={b.prod.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                    <span className="text-xs font-black text-slate-700 truncate">{b.prod.name}</span>
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-[10px]">x{b.q}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                const updated = products.map(p => {
                  const b = batchList.find(item => item.prod.id === p.id);
                  if(b) return {...p, stock: p.stock + b.q};
                  return p;
                });
                saveProducts(updated);
                setBatchList([]);
                alert("Stock mis à jour !");
              }} className="w-full bg-green-500 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg">
                Valider l'entrée en Stock
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManager;
