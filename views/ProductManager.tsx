
import React, { useState, useEffect, useRef } from 'react';
// Added ChevronRight to the imports below
import { Search, Edit2, Trash2, X, ScanLine, Layers, Info, Ruler, Plus, Image as ImageIcon, Camera, ImagePlus, TrendingUp, ChevronRight } from 'lucide-react';
import { Product, UserProfile, Family } from '../types.ts';
import BarcodeScanner from '../components/BarcodeScanner.tsx';

const ProductManager: React.FC<{ currentUser: UserProfile | null }> = ({ currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const emptyProduct: Product = {
    id: '',
    name: '',
    category: 'Cosmétique',
    barcode: '',
    costPrice: 0,
    sellPrice: 0,
    stock: 0,
    description: '',
    volume: '',
    imageUrl: '',
    familyId: ''
  };

  const [formState, setFormState] = useState<Product>(emptyProduct);
  const [marginInput, setMarginInput] = useState<number>(0);

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
    setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
  }, []);

  // Synchronise la marge visuelle quand le PA ou PV change
  useEffect(() => {
    if (formState.costPrice > 0) {
      const calculated = Math.round(((formState.sellPrice - formState.costPrice) / formState.costPrice) * 100);
      setMarginInput(calculated);
    }
  }, [formState.costPrice, formState.sellPrice]);

  const handlePriceChange = (field: 'cost' | 'sell' | 'margin', value: number) => {
    setFormState(prev => {
      const newState = { ...prev };
      if (field === 'cost') {
        newState.costPrice = value;
        // Optionnel: On peut choisir de garder la marge et ajuster le PV ici
      } else if (field === 'sell') {
        newState.sellPrice = value;
      } else if (field === 'margin') {
        newState.sellPrice = Math.round(newState.costPrice * (1 + (value / 100)));
      }
      return newState;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProducts = (newList: Product[]) => {
    setProducts(newList);
    localStorage.setItem('eyn_products', JSON.stringify(newList));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return alert("La désignation est obligatoire.");
    
    if (isCreating) {
      const productToAdd = { ...formState, id: Math.random().toString(36).substr(2, 9) };
      saveProducts([productToAdd, ...products]);
    } else {
      const newList = products.map(p => p.id === formState.id ? formState : p);
      saveProducts(newList);
    }
    
    setIsCreating(false);
    setEditingProduct(null);
    setFormState(emptyProduct);
  };

  const startEdit = (p: Product) => {
    setFormState(p);
    setEditingProduct(p);
    setIsCreating(false);
  };

  const openCreate = () => {
    setFormState(emptyProduct);
    setIsCreating(true);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-4 pb-24 relative min-h-[60vh]">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />

      {isScanning && (
        <BarcodeScanner 
          onScan={(code) => { setFormState(prev => ({...prev, barcode: code})); setIsScanning(false); }} 
          onClose={() => setIsScanning(false)} 
        />
      )}
      
      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 z-[600] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
           <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-[2.5rem] p-6 space-y-4 my-auto animate-in zoom-in-95 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                  {isCreating ? "NOUVEAU PRODUIT" : "FICHE PRODUIT"}
                </h3>
                <button type="button" onClick={() => { setIsCreating(false); setEditingProduct(null); }} className="p-2 bg-slate-100 rounded-full active:scale-90"><X className="w-4 h-4 text-slate-400" /></button>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[75vh] hide-scrollbar pr-1">
                
                {/* 1. CODE BARRES - PRIORITÉ HAUTE */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">CODE BARRES / CODE</label>
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 bg-slate-50 p-4 rounded-2xl text-sm font-bold border-2 border-slate-100 focus:border-slate-900 outline-none transition-all" 
                      value={formState.barcode} 
                      onChange={e => setFormState({...formState, barcode: e.target.value})} 
                      placeholder="Saisir ou scanner..."
                    />
                    <button type="button" onClick={() => setIsScanning(true)} className="bg-slate-900 text-yellow-500 px-5 rounded-2xl active:scale-90 shadow-lg"><ScanLine className="w-5 h-5"/></button>
                  </div>
                </div>

                {/* 2. DÉSIGNATION */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">DÉSIGNATION</label>
                  <input type="text" required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-2 border-slate-100 focus:border-slate-900 outline-none" 
                    value={formState.name} 
                    onChange={e => setFormState({...formState, name: e.target.value})} 
                    placeholder="Nom de l'article..."
                  />
                </div>

                {/* 3. FAMILLE & VOLUME */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">FAMILLE</label>
                    <select className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-2 border-slate-100 outline-none" 
                      value={formState.familyId} 
                      onChange={e => setFormState({...formState, familyId: e.target.value})}>
                      <option value="">Standard</option>
                      {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">VOLUME</label>
                    <input type="text" placeholder="200ml, 50g..." className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-2 border-slate-100 outline-none" 
                      value={formState.volume} 
                      onChange={e => setFormState({...formState, volume: e.target.value})} 
                    />
                  </div>
                </div>

                {/* 4. CHOIX IMAGE NATIVE (PHOTOS / CAMERA) */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">CHOIX DE L'IMAGE</label>
                  <div className="flex gap-3 h-20">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 active:bg-slate-100">
                      <ImagePlus className="w-5 h-5 text-blue-500" />
                      <span className="text-[8px] font-black uppercase text-slate-500">Photos</span>
                    </button>
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 active:bg-slate-100">
                      <Camera className="w-5 h-5 text-emerald-500" />
                      <span className="text-[8px] font-black uppercase text-slate-500">Caméra</span>
                    </button>
                    {formState.imageUrl && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-900 shadow-xl relative">
                        <img src={formState.imageUrl} className="w-full h-full object-cover" />
                        <button onClick={() => setFormState(prev => ({...prev, imageUrl: ''}))} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full"><X className="w-2 h-2"/></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. CALCULATEUR DE PRIX & MARGE AUTO */}
                <div className="bg-slate-900 p-5 rounded-[2rem] space-y-4 shadow-xl">
                   <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-white/40 ml-1 tracking-widest">P. ACHAT</label>
                        <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-yellow-500" 
                          value={formState.costPrice || ''} 
                          onChange={e => handlePriceChange('cost', parseFloat(e.target.value) || 0)} 
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-white/40 ml-1 tracking-widest">P. VENTE</label>
                        <input type="number" className="w-full bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl text-sm font-black text-yellow-500 outline-none focus:border-yellow-500" 
                          value={formState.sellPrice || ''} 
                          onChange={e => handlePriceChange('sell', parseFloat(e.target.value) || 0)} 
                          placeholder="0"
                        />
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-white/60">Marge (%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          className="w-16 bg-emerald-500/10 text-emerald-400 text-right p-2 rounded-xl font-black text-sm border-none outline-none"
                          value={marginInput}
                          onChange={e => handlePriceChange('margin', parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-[10px] font-black text-emerald-400">%</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">DESCRIPTION (Notes)</label>
                  <textarea rows={2} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-2 border-slate-100 outline-none resize-none" 
                    value={formState.description} 
                    onChange={e => setFormState({...formState, description: e.target.value})} 
                    placeholder="Détails supplémentaires..."></textarea>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-6 rounded-[2rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all">
                {isCreating ? "CRÉER L'ARTICLE" : "METTRE À JOUR"}
              </button>
           </form>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input type="text" placeholder="Chercher un article..." className="w-full bg-white rounded-2xl pl-12 pr-4 py-5 text-sm font-bold shadow-sm border-2 border-slate-100 outline-none focus:border-slate-400" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)).map(p => (
          <div key={p.id} className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-50 flex justify-between items-center shadow-sm active:scale-[0.98] transition-all" onClick={() => startEdit(p)}>
            <div className="flex gap-3 flex-1 min-w-0 items-center">
              {p.imageUrl ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                  <img src={p.imageUrl} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">
                  <ImageIcon className="w-6 h-6 opacity-20" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-[11px] font-black uppercase text-slate-800 truncate leading-tight">{p.name}</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{families.find(f => f.id === p.familyId)?.name || 'Standard'} • {p.volume || 'S/V'}</p>
                <div className="flex gap-1.5 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${p.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>Stock: {p.stock}</span>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[7px] font-black uppercase">{p.sellPrice.toLocaleString()} FG</span>
                </div>
              </div>
            </div>
            <button className="p-4 text-slate-200">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <button onClick={openCreate} className="fixed bottom-24 right-6 w-16 h-16 bg-yellow-500 text-slate-900 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-50 border-4 border-white">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default ProductManager;
