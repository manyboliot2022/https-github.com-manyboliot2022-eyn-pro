
import React, { useState, useEffect } from 'react';
import { Search, Plus, Box, Trash2, Import, ScanLine, X, Barcode, Hash, DollarSign, Tag, AlignLeft, Info } from 'lucide-react';
import { Product, Family, PRE_DETECTED_LIBRARY } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [newProd, setNewProd] = useState<Partial<Product>>({
    reference: '', name: '', description: '', category: 'Général', barcode: '', costPrice: 0, sellPrice: 0, stock: 0
  });

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
    setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem('eyn_products', JSON.stringify(updated));
  };

  const handleManualAdd = () => {
    if (!newProd.name || !newProd.reference) return alert("Référence et Nom requis");
    const p: Product = {
      id: Date.now().toString(),
      reference: newProd.reference!.toUpperCase(),
      name: newProd.name!,
      description: newProd.description || '',
      category: newProd.category || 'Général',
      barcode: newProd.barcode || '',
      costPrice: newProd.costPrice || 0,
      realCost: newProd.costPrice || 0,
      sellPrice: newProd.sellPrice || 0,
      stock: newProd.stock || 0
    };
    saveProducts([p, ...products]);
    setShowAddModal(false);
    setNewProd({ reference: '', name: '', description: '', category: 'Général', barcode: '', costPrice: 0, sellPrice: 0, stock: 0 });
  };

  const updateProduct = () => {
    if (!selectedProduct) return;
    saveProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p));
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6 pb-28">
      {isScanning && (
        <BarcodeScanner 
          onScan={(code) => { 
            if(showAddModal) setNewProd({...newProd, barcode: code});
            else if(selectedProduct) setSelectedProduct({...selectedProduct, barcode: code});
            setIsScanning(false); 
          }} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111827] p-6 rounded-[2.5rem] text-white shadow-xl">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Valeur Inventaire</p>
          <h3 className="text-lg font-black text-yellow-400">
            {products.reduce((s, p) => s + (p.sellPrice * p.stock), 0).toLocaleString()} <span className="text-[8px]">FG</span>
          </h3>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Articles en Stock</p>
          <h3 className="text-lg font-black text-slate-800">
            {products.reduce((s, p) => s + p.stock, 0)} <span className="text-[8px]">UNITÉS</span>
          </h3>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Nom, Code ou Barre..." className="w-full bg-white rounded-3xl pl-12 pr-6 py-5 text-sm font-black shadow-sm outline-none border border-slate-50" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#111827] text-yellow-400 p-5 rounded-3xl active:scale-90 transition-transform shadow-lg"><Plus className="w-6 h-6"/></button>
      </div>

      <div className="space-y-3">
        {products.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) || 
          p.reference.toLowerCase().includes(search.toLowerCase()) ||
          p.barcode.includes(search)
        ).map(p => (
          <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white p-5 rounded-[2.5rem] border border-slate-50 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              <Box className="w-6 h-6 opacity-30"/>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black uppercase text-slate-800 truncate">{p.name}</h4>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">REF: {p.reference} • {p.category}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-900">{p.sellPrice.toLocaleString()} FG</p>
              <p className={`text-[7px] font-bold uppercase mt-1 px-2 py-0.5 rounded-full inline-block ${p.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>Stock: {p.stock}</p>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <Plus className="w-12 h-12 mx-auto mb-4"/>
            <p className="text-[10px] font-black uppercase tracking-widest">Cliquez sur + pour créer un article</p>
          </div>
        )}
      </div>

      {/* Modal Ajout Complet */}
      {showAddModal && (
        <div className="fixed inset-0 z-[600] bg-[#111827]/95 backdrop-blur-xl flex items-center justify-center p-6 safe-top">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] overflow-hidden flex flex-col animate-fade max-h-[92vh] shadow-2xl">
            <div className="p-8 pb-4 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400">Nouvel Article</h3>
                <p className="text-[7px] font-black uppercase tracking-widest text-slate-300 mt-1">Fiche produit complète</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2"><X className="w-6 h-6 text-slate-400"/></button>
            </div>
            <div className="p-8 pt-6 space-y-4 overflow-y-auto hide-scrollbar">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><Hash className="w-2.5 h-2.5"/> Code Interne</label>
                  <input type="text" placeholder="EX: VSL-01" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-yellow-400 border border-transparent" value={newProd.reference} onChange={e => setNewProd({...newProd, reference: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><Tag className="w-2.5 h-2.5"/> Famille</label>
                  <select className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black uppercase outline-none" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})}>
                    <option value="Général">Général</option>
                    {families.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[7px] font-black uppercase text-slate-400 ml-2">Désignation (Nom)</label>
                <input type="text" placeholder="NOM DU PRODUIT" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-yellow-400 border border-transparent" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[7px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><AlignLeft className="w-2.5 h-2.5"/> Description</label>
                <textarea placeholder="COMPOSITION, FORMAT, ETC..." rows={2} className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold uppercase outline-none resize-none" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[7px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><Barcode className="w-2.5 h-2.5"/> Code-barres (EAN)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="SCANNER OU SAISIR..." className="flex-1 bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none" value={newProd.barcode} onChange={e => setNewProd({...newProd, barcode: e.target.value})} />
                  <button onClick={() => setIsScanning(true)} className="bg-slate-900 text-yellow-400 p-4 rounded-2xl active:scale-90 transition-transform"><ScanLine className="w-5 h-5"/></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><DollarSign className="w-2.5 h-2.5"/> Prix Achat</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none" value={newProd.costPrice || ''} onChange={e => setNewProd({...newProd, costPrice: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><DollarSign className="w-2.5 h-2.5"/> Prix Vente</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none" value={newProd.sellPrice || ''} onChange={e => setNewProd({...newProd, sellPrice: parseFloat(e.target.value)})} />
                </div>
              </div>

              <button onClick={handleManualAdd} className="w-full bg-[#111827] text-yellow-400 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl mt-2 active:scale-95 transition-transform">
                ENREGISTRER L'ARTICLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edition */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[600] bg-[#111827]/95 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 space-y-6 animate-fade shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400">Modifier Article</h3>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">REF: {selectedProduct.reference}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)}><X className="w-6 h-6 text-slate-300"/></button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-400 ml-2">Désignation</label>
                  <input type="text" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black uppercase outline-none" value={selectedProduct.name} onChange={e => setSelectedProduct({...selectedProduct, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase text-slate-400 ml-2">Prix Vente (FG)</label>
                    <input type="number" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none" value={selectedProduct.sellPrice} onChange={e => setSelectedProduct({...selectedProduct, sellPrice: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase text-slate-400 ml-2">Stock Réel</label>
                    <input type="number" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-black outline-none" value={selectedProduct.stock} onChange={e => setSelectedProduct({...selectedProduct, stock: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => { saveProducts(products.filter(p => p.id !== selectedProduct.id)); setSelectedProduct(null); }} className="bg-red-50 text-red-500 p-5 rounded-3xl shadow-sm"><Trash2 className="w-6 h-6"/></button>
                <button onClick={updateProduct} className="flex-1 bg-slate-900 text-yellow-400 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl">Valider</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
