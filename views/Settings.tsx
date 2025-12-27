
import React, { useState, useEffect } from 'react';
import { 
  Tags, ShieldCheck, Building, Trash2, PieChart, Users2, Briefcase, Plus, X, 
  Download, ChevronRight, LogOut, ToggleLeft, ToggleRight, UserPlus, Phone, MapPin,
  UserPlus2, PlusCircle
} from 'lucide-react';
import { 
  CompanySettings, DEFAULT_BRAND_INFO, Product, Transaction, Client, 
  Supplier, Family, UserProfile 
} from '../types.ts';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<'DASHBOARD' | 'USERS' | 'CATALOG' | 'PARTNERS' | 'BRAND' | 'SYSTEM' | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [brand, setBrand] = useState<CompanySettings>(DEFAULT_BRAND_INFO);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Form States
  const [newUser, setNewUser] = useState({ name: '', pass: '', role: 'VENDEUR' as 'ADMIN' | 'VENDEUR' });
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', type: 'SUPPLIER' as 'SUPPLIER' | 'CLIENT' });

  useEffect(() => {
    const loadData = () => {
      setUsers(JSON.parse(localStorage.getItem('eyn_users') || '[]'));
      setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
      setSuppliers(JSON.parse(localStorage.getItem('eyn_suppliers') || '[]'));
      setClients(JSON.parse(localStorage.getItem('eyn_clients') || '[]'));
      setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
      setTransactions(JSON.parse(localStorage.getItem('eyn_transactions') || '[]'));
      const savedBrand = localStorage.getItem('eyn_brand_info');
      if (savedBrand) setBrand(JSON.parse(savedBrand));
    };
    loadData();
  }, [activeMenu]);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name) return;
    const list = [...users, { id: Date.now().toString(), name: newUser.name, password: newUser.pass, role: newUser.role, isActive: true }];
    setUsers(list);
    saveToStorage('eyn_users', list);
    setNewUser({ name: '', pass: '', role: 'VENDEUR' });
    setShowAddForm(false);
  };

  // Add missing toggleUserActive function
  const toggleUserActive = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    setUsers(updated);
    saveToStorage('eyn_users', updated);
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name) {
      alert("Le nom est obligatoire");
      return;
    }
    const id = Date.now().toString();
    if (newPartner.type === 'SUPPLIER') {
      const list = [...suppliers, { id, name: newPartner.name, phone: newPartner.phone, category: 'Général' }];
      setSuppliers(list);
      saveToStorage('eyn_suppliers', list);
    } else {
      const list = [...clients, { id, name: newPartner.name, phone: newPartner.phone, address: '', balance: 0 }];
      setClients(list);
      saveToStorage('eyn_clients', list);
    }
    setNewPartner({ name: '', phone: '', type: 'SUPPLIER' });
    setShowAddForm(false);
    alert("✅ Partenaire enregistré avec succès !");
  };

  if (activeMenu) {
    return (
      <div className="space-y-4 animate-in slide-in-from-right duration-300 pb-20">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => {setActiveMenu(null); setShowAddForm(false);}} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
            <ChevronRight className="rotate-180 w-5 h-5" /> Retour Admin
          </button>
          {['USERS', 'PARTNERS'].includes(activeMenu) && (
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className={`p-4 rounded-2xl shadow-2xl transition-all flex items-center gap-2 ${showAddForm ? 'bg-red-500 text-white' : 'bg-slate-900 text-yellow-500'}`}
            >
              {showAddForm ? <X className="w-5 h-5"/> : <><Plus className="w-5 h-5"/><span className="text-[10px] font-black uppercase tracking-widest">Nouveau</span></>}
            </button>
          )}
        </div>

        {activeMenu === 'DASHBOARD' && (
          <div className="space-y-5 animate-in fade-in">
             <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><PieChart className="w-32 h-32" /></div>
               <p className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-1">Valeur de Stock (Prix Achat)</p>
               <h2 className="text-4xl font-black">{products.reduce((s,p) => s + (p.costPrice * p.stock), 0).toLocaleString()} <span className="text-sm">FG</span></h2>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100">
                   <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Articles</p>
                   <p className="text-2xl font-black">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100">
                   <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Transactions</p>
                   <p className="text-2xl font-black">{transactions.length}</p>
                </div>
             </div>
          </div>
        )}

        {activeMenu === 'USERS' && (
          <div className="space-y-4">
            {showAddForm && (
              <form onSubmit={handleAddUser} className="bg-white p-7 rounded-[2.5rem] border border-blue-100 shadow-xl space-y-4 animate-in zoom-in-95">
                <h3 className="text-xs font-black uppercase text-blue-600 mb-2">Nouveau Collaborateur</h3>
                <input type="text" placeholder="Identifiant..." className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input type="password" placeholder="Mot de passe" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={newUser.pass} onChange={e => setNewUser({...newUser, pass: e.target.value})} />
                <select className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                  <option value="VENDEUR">Vendeur (Limité)</option>
                  <option value="ADMIN">Administrateur (Total)</option>
                </select>
                <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black uppercase text-[10px]">Créer le compte</button>
              </form>
            )}
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className={`bg-white p-5 rounded-[2rem] border flex justify-between items-center ${!u.isActive ? 'opacity-50 grayscale' : 'border-slate-50 shadow-sm'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${u.role === 'ADMIN' ? 'bg-yellow-500 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                      {u.name[0]}
                    </div>
                    <div><p className="text-xs font-black">{u.name}</p><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleUserActive(u.id)} className={`p-2 transition-colors ${u.isActive ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {u.isActive ? <ToggleRight className="w-8 h-8"/> : <ToggleLeft className="w-8 h-8"/>}
                    </button>
                    <button onClick={() => {if(confirm("Supprimer ?")) {const nl = users.filter(x => x.id !== u.id); setUsers(nl); saveToStorage('eyn_users', nl);}}} className="text-red-200 p-2"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'PARTNERS' && (
          <div className="space-y-4">
            {showAddForm ? (
              <form onSubmit={handleAddPartner} className="bg-white p-7 rounded-[3rem] border-2 border-slate-900 shadow-2xl space-y-4 animate-in slide-in-from-top duration-300">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button type="button" onClick={() => setNewPartner({...newPartner, type: 'SUPPLIER'})} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${newPartner.type === 'SUPPLIER' ? 'bg-slate-900 text-yellow-500 shadow-lg' : 'text-slate-400'}`}>Fournisseur</button>
                  <button type="button" onClick={() => setNewPartner({...newPartner, type: 'CLIENT'})} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${newPartner.type === 'CLIENT' ? 'bg-slate-900 text-yellow-500 shadow-lg' : 'text-slate-400'}`}>Client</button>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Nom complet</label>
                  <input type="text" placeholder="Ex: Boutique Alpha..." className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Numéro WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input type="text" placeholder="224..." className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border-none" value={newPartner.phone} onChange={e => setNewPartner({...newPartner, phone: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-6 rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all mt-4">
                  Valider l'enregistrement <PlusCircle className="w-5 h-5"/>
                </button>
              </form>
            ) : (
              <button onClick={() => setShowAddForm(true)} className="w-full bg-slate-100 border-2 border-dashed border-slate-300 p-8 rounded-[3rem] flex flex-col items-center justify-center gap-2 text-slate-400 active:bg-slate-200 transition-all">
                <PlusCircle className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase tracking-widest">Ajouter un nouveau partenaire</span>
              </button>
            )}
            
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center mx-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fournisseurs ({suppliers.length})</h4>
                </div>
                {suppliers.length === 0 ? (
                  <p className="text-center py-6 text-[9px] font-bold text-slate-300 uppercase italic">Aucun fournisseur enregistré</p>
                ) : (
                  suppliers.map(s => (
                    <div key={s.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center animate-in fade-in">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner"><Briefcase className="w-5 h-5"/></div>
                          <div><p className="text-xs font-black text-slate-900">{s.name}</p><p className="text-[10px] font-bold text-slate-400">{s.phone}</p></div>
                      </div>
                      <button onClick={() => {if(confirm("Supprimer ce fournisseur ?")) {const nl = suppliers.filter(x => x.id !== s.id); setSuppliers(nl); saveToStorage('eyn_suppliers', nl);}}} className="p-3 bg-red-50 rounded-xl"><Trash2 className="w-4 h-4 text-red-300"/></button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center mx-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Clients ({clients.length})</h4>
                </div>
                {clients.length === 0 ? (
                  <p className="text-center py-6 text-[9px] font-bold text-slate-300 uppercase italic">Aucun client enregistré</p>
                ) : (
                  clients.map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center animate-in fade-in">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><UserPlus2 className="w-5 h-5"/></div>
                          <div><p className="text-xs font-black text-slate-900">{c.name}</p><p className="text-[10px] font-bold text-slate-400">{c.phone}</p></div>
                      </div>
                      <button onClick={() => {if(confirm("Supprimer ce client ?")) {const nl = clients.filter(x => x.id !== c.id); setClients(nl); saveToStorage('eyn_clients', nl);}}} className="p-3 bg-red-50 rounded-xl"><Trash2 className="w-4 h-4 text-red-300"/></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'BRAND' && (
          <form onSubmit={(e) => {e.preventDefault(); localStorage.setItem('eyn_brand_info', JSON.stringify(brand)); alert("Branding à jour !")}} className="space-y-5 animate-in slide-up">
            <div className="bg-white p-8 rounded-[3rem] space-y-4 shadow-sm border border-slate-100">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Nom de l'Etablissement</label>
                <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Slogan / Tagline</label>
                <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={brand.tagline} onChange={e => setBrand({...brand, tagline: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3">WhatsApp de l'Admin</label>
                <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={brand.whatsapp} onChange={e => setBrand({...brand, whatsapp: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-6 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl">Mettre à jour l'Identité</button>
          </form>
        )}

        {activeMenu === 'SYSTEM' && (
          <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white space-y-6 shadow-2xl">
            <h3 className="font-black text-yellow-500 text-sm uppercase tracking-widest flex items-center gap-2"><ShieldCheck/> Système & Backup</h3>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold">L'application fonctionne en local et se synchronise dès qu'une connexion est disponible.</p>
            <button onClick={() => {
              const data = { products, transactions, clients, suppliers, brand, families, users };
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
              a.download = `EYN_PRO_SAVE_${new Date().toISOString().split('T')[0]}.json`; 
              a.click();
            }} className="w-full bg-white/10 p-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"><Download className="w-5 h-5 text-yellow-500" /> Télécharger Sauvegarde complète</button>
            <button onClick={() => {if(confirm("Action irréversible : Purger toute la mémoire locale ?")) {localStorage.clear(); window.location.reload();}}} className="w-full bg-red-500/10 text-red-500 p-5 rounded-2xl text-[10px] font-black uppercase border border-red-500/20"><Trash2 className="w-5 h-5" /> Réinitialiser l'application</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest mb-1 italic">EYN<span className="text-white">PRO</span> Admin</h2>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pilotage Global du Système</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'DASHBOARD', title: 'Stats & Valeur', icon: PieChart, color: 'bg-emerald-500', desc: 'Valeur stock et performance' },
          { id: 'USERS', title: 'Comptes Équipe', icon: Users2, color: 'bg-blue-500', desc: 'Vendeurs et autorisations' },
          { id: 'PARTNERS', title: 'Partenaires', icon: Briefcase, color: 'bg-purple-500', desc: 'Fournisseurs & Clients' },
          { id: 'BRAND', title: 'Identité Boutique', icon: Building, color: 'bg-pink-500', desc: 'Noms, Slangs & WhatsApp' },
          { id: 'SYSTEM', title: 'Sauvegarde Cloud', icon: ShieldCheck, color: 'bg-slate-800', desc: 'Purger ou Sauvegarder' }
        ].map(card => (
          <button key={card.id} onClick={() => setActiveMenu(card.id as any)} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 active:scale-95 transition-all text-left shadow-sm">
            <div className={`${card.color} p-4 rounded-2xl text-white shadow-xl shadow-slate-900/10`}><card.icon className="w-5 h-5" /></div>
            <div className="flex-1"><h4 className="text-[10px] font-black uppercase text-slate-900 mb-0.5">{card.title}</h4><p className="text-[8px] font-medium text-slate-400 uppercase">{card.desc}</p></div>
            <ChevronRight className="w-4 h-4 text-slate-200" />
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="w-full mt-6 bg-red-50 text-red-500 py-5 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-100"
      >
        <LogOut className="w-4 h-4" /> Fermer la session Admin
      </button>
    </div>
  );
};

export default Settings;
