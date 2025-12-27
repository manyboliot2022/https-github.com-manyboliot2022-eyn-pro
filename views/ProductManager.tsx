
import React, { useState, useEffect } from 'react';
import { Search, Plus, ScanLine, Box, Info, ImagePlus, ChevronRight, CheckCircle2, Trash2, Import } from 'lucide-react';
import { Product, PRE_DETECTED_PRODUCTS } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
  }, []);

  const importProduct = (p: {name: string, category: string}) => {
    const newProd: Product = {
      id: Date.now().toString() + Math.random(),
      name: p.name,
      category: p.category,
      barcode: '',
      costPrice: 0,
      realCost: 0,
      sellPrice: 0,
      stock: 0
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem('eyn_products', JSON.stringify(updated));
  };

  const deleteProduct = (id: string) => {
    if(confirm("Supprimer ce produit ?")) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('eyn_products', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {isScanning && <BarcodeScanner onScan={(code) => { alert("Code: "+code); setIsScanning(false); }} onClose={() => setIsScanning(false)} />}
      
      {/* Statistiques Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111827] p-6 rounded-[2.5rem] text-white space-y-1">
           <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Total Stock</p>
           <h3 className="text-xl font-black text-yellow-400">{products.reduce((s,p) => s + p.stock, 0)} <span className="text-[10px]">UNITÉS</span></h3>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-1 shadow-sm">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Valeur Stock</p>
           <h3 className="text-xl font-black text-slate-800">{products.reduce((s,p) => s + (p.sellPrice * p.stock), 0).toLocaleString()} <span className="text-[10px]">FG</span></h3>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Rechercher..." className="w-full bg-white rounded-2xl pl-12 pr-6 py-5 text-sm font-black shadow-sm border border-slate-50 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowImport(true)} className="bg-yellow-400 text-[#111827] p-5 rounded-2xl shadow-lg active:scale-90 transition-all"><Import className="w-6 h-6"/></button>
      </div>

      {/* Liste Produits */}
      <div className="space-y-3">
        {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
          <div key={p.id} className="bg-white p-4 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 shadow-sm animate-fade">
             <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 flex-shrink-0">
                <Box className="w-6 h-6 opacity-30" />
             </div>
             <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black uppercase text-slate-800 truncate leading-none mb-1">{p.name}</h4>
                <div className="flex gap-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                  <span className={`text-[8px] font-black uppercase ${p.stock <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>• Stock: {p.stock}</span>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[11px] font-black text-slate-900">{p.sellPrice.toLocaleString()} FG</p>
                <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-100 active:text-red-500"><Trash2 className="w-4 h-4"/></button>
             </div>
          </div>
        ))}
      </div>

      {/* Modal Importation */}
      {showImport && (
        <div className="fixed inset-0 z-[600] bg-slate-900/95 backdrop-blur-xl flex flex-col p-6 safe-top animate-fade">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-black text-yellow-400 uppercase tracking-[0.3em]">Bibliothèque EYN PRO</h3>
             <button onClick={() => setShowImport(false)} className="bg-white/10 text-white p-3 rounded-2xl"><Plus className="rotate-45 w-6 h-6"/></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pb-10">
             {PRE_DETECTED_PRODUCTS.map(p => (
               <div key={p.name} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">{p.name}</h4>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-1">{p.category}</p>
                  </div>
                  <button onClick={() => { importProduct(p); alert(p.name + " ajouté !"); }} className="bg-yellow-400 text-[#111827] p-3 rounded-xl active:scale-90 transition-all"><Plus className="w-5 h-5"/></button>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* FAB Batch Scan */}
      <button onClick={() => setIsScanning(true)} className="fixed bottom-28 right-6 w-16 h-16 bg-[#111827] text-yellow-400 rounded-full shadow-2xl flex items-center justify-center border-4 border-white active:scale-90 transition-all z-50">
        <ScanLine className="w-8 h-8" />
      </button>
    </div>
  );
};

export default ProductManager;
