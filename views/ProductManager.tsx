
import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Camera, Sparkles, X, Save, CheckCircle2, ChevronRight, Barcode } from 'lucide-react';
// Import UserProfile to satisfy the currentUser prop type
import { Product, PRE_DETECTED_PRODUCTS, UserProfile } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

// Add currentUser prop to ProductManager to align with App.tsx usage
const ProductManager: React.FC<{ currentUser: UserProfile | null }> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'IMPORT'>('STOCK');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedForImport, setSelectedForImport] = useState<string[]>([]);

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
  }, []);

  const saveProducts = (newList: Product[]) => {
    setProducts(newList);
    localStorage.setItem('eyn_products', JSON.stringify(newList));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const newList = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    saveProducts(newList);
    setEditingProduct(null);
    alert("Produit mis à jour !");
  };

  const runImport = () => {
    const toImport = PRE_DETECTED_PRODUCTS.filter(p => selectedForImport.includes(p.name));
    const newList = [...products];
    toImport.forEach(p => {
      if (!products.find(ex => ex.name === p.name)) {
        newList.push({ 
          id: Math.random().toString(36).substr(2,9), 
          name: p.name, 
          category: p.category, 
          barcode: '', 
          costPrice: 0, 
          sellPrice: 0, 
          stock: 0 
        });
      }
    });
    saveProducts(newList);
    setSelectedForImport([]);
    alert(`${toImport.length} articles importés !`);
    setActiveTab('STOCK');
  };

  return (
    <div className="space-y-4 pb-20">
      {isScanning && <BarcodeScanner onScan={(code) => { alert("Scanné: " + code); setIsScanning(false); }} onClose={() => setIsScanning(false)} />}
      
      {editingProduct && (
        <div className="fixed inset-0 z-[500] bg-slate-900/90 backdrop-blur-md flex items-end justify-center p-4">
           <form onSubmit={handleEditSubmit} className="bg-white w-full max-w-md rounded-[3rem] p-8 space-y-5 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-900">Modifier l'Article</h3>
                <button type="button" onClick={() => setEditingProduct(null)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Désignation</label>
                  <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-3">P. Achat</label>
                    <input type="number" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={editingProduct.costPrice} onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-3">P. Vente</label>
                    <input type="number" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={editingProduct.sellPrice} onChange={e => setEditingProduct({...editingProduct, sellPrice: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Stock Actuel</label>
                    <input type="number" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Code Barres</label>
                    <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={editingProduct.barcode} onChange={e => setEditingProduct({...editingProduct, barcode: e.target.value})} />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-5 rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"><Save className="w-5 h-5"/> Enregistrer les changements</button>
           </form>
        </div>
      )}

      <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('STOCK')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'STOCK' ? 'bg-white shadow text-slate-900' : 'text-slate-500 opacity-60'}`}>Catalogue Stock</button>
        <button onClick={() => setActiveTab('IMPORT')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'IMPORT' ? 'bg-white shadow text-slate-900' : 'text-slate-500 opacity-60'}`}>Base Import</button>
      </div>

      {activeTab === 'STOCK' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Chercher un article..." className="w-full bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm border border-slate-100" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setIsScanning(true)} className="bg-slate-900 text-yellow-500 p-4 rounded-2xl shadow-lg active:scale-95 transition-all"><Barcode className="w-6 h-6"/></button>
          </div>
          <div className="space-y-2">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
                <div className="flex-1 pr-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-800 truncate mb-1">{p.name}</h4>
                  <div className="flex gap-2 text-[8px] font-bold text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full uppercase ${p.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-100'}`}>Stk: {p.stock}</span>
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">{p.sellPrice.toLocaleString()} FG</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setEditingProduct(p)} className="p-4 bg-slate-900 text-yellow-500 rounded-2xl shadow-lg active:scale-90 transition-all"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => { if(confirm("Supprimer ?")) saveProducts(products.filter(x => x.id !== p.id)) }} className="p-4 bg-red-50 text-red-400 rounded-2xl active:scale-90 transition-all"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'IMPORT' && (
        <div className="space-y-5 animate-in slide-up">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white text-center shadow-xl space-y-3 relative overflow-hidden">
              <Sparkles className="w-10 h-10 text-yellow-500 mx-auto animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-widest italic">Base EYN PRO</h3>
              <p className="text-[9px] text-white/40 leading-relaxed uppercase font-bold">Sélectionnez les articles de référence</p>
           </div>
           <div className="bg-white rounded-[3rem] p-5 max-h-[45vh] overflow-y-auto hide-scrollbar border border-slate-100 space-y-2 shadow-inner">
              {PRE_DETECTED_PRODUCTS.map(p => (
                <div key={p.name} onClick={() => setSelectedForImport(prev => prev.includes(p.name) ? prev.filter(n => n !== p.name) : [...prev, p.name])} className={`p-5 rounded-[2rem] flex justify-between items-center border transition-all ${selectedForImport.includes(p.name) ? 'bg-yellow-50 border-yellow-500 shadow-md' : 'bg-slate-50 border-transparent grayscale'}`}>
                  <div className="text-left"><p className={`text-[10px] font-black uppercase ${selectedForImport.includes(p.name) ? 'text-slate-900' : 'text-slate-400'}`}>{p.name}</p><p className="text-[7px] font-bold opacity-30 tracking-widest uppercase">{p.category}</p></div>
                  {selectedForImport.includes(p.name) && <CheckCircle2 className="w-6 h-6 text-yellow-600" />}
                </div>
              ))}
           </div>
           <button onClick={runImport} disabled={selectedForImport.length === 0} className="w-full bg-yellow-500 text-slate-900 py-6 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-2 shadow-2xl disabled:opacity-20 active:scale-95 transition-all">Importer ({selectedForImport.length}) au Catalogue</button>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
