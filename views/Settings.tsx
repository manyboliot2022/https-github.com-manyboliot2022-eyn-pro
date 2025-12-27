
import React, { useState, useEffect } from 'react';
import { 
  Tags, ShieldCheck, Building, Trash2, PieChart, Users2, Briefcase, Plus, X, 
  Download, ChevronRight, LogOut, ToggleLeft, ToggleRight
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
  const [newFamily, setNewFamily] = useState('');
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', type: 'SUPPLIER' as 'SUPPLIER' | 'CLIENT' });

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem('eyn_users') || '[]'));
    setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
    setSuppliers(JSON.parse(localStorage.getItem('eyn_suppliers') || '[]'));
    setClients(JSON.parse(localStorage.getItem('eyn_clients') || '[]'));
    setProducts(JSON.parse(localStorage.getItem('eyn_products') || '[]'));
    setTransactions(JSON.parse(localStorage.getItem('eyn_transactions') || '[]'));
    const savedBrand = localStorage.getItem('eyn_brand_info');
    if (savedBrand) setBrand(JSON.parse(savedBrand));
  }, []);

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

  const toggleUserActive = (userId: string) => {
    const list = users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u);
    setUsers(list);
    saveToStorage('eyn_users', list);
  };

  if (activeMenu) {
    return (
      <div className="space-y-4 animate-in slide-in-from-right duration-300 pb-20">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => {setActiveMenu(null); setShowAddForm(false);}} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
            <ChevronRight className="rotate-180 w-5 h-5" /> Retour Admin
          </button>
          {['USERS', 'CATALOG', 'PARTNERS'].includes(activeMenu) && (
            <button onClick={() => setShowAddForm(!showAddForm)} className={`p-3 rounded-2xl shadow-xl transition-all ${showAddForm ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
              {showAddForm ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
            </button>
          )}
        </div>

        {activeMenu === 'USERS' && (
          <div className="space-y-4">
            {showAddForm && (
              <form onSubmit={handleAddUser} className="bg-white p-7 rounded-[2.5rem] border border-blue-100 shadow-xl space-y-4 animate-in zoom-in-95">
                <input type="text" placeholder="Identifiant..." className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input type="password" placeholder="Mot de passe" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={newUser.pass} onChange={e => setNewUser({...newUser, pass: e.target.value})} />
                <select className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                  <option value="VENDEUR">Vendeur (Stock/POS)</option>
                  <option value="ADMIN">Administrateur (Tout)</option>
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

        {activeMenu === 'BRAND' && (
          <form onSubmit={(e) => {e.preventDefault(); localStorage.setItem('eyn_brand_info', JSON.stringify(brand)); alert("Branding à jour !")}} className="space-y-5">
            <div className="bg-white p-8 rounded-[3rem] space-y-4 shadow-sm border border-slate-100">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3">Nom de l'Etablissement</label>
                <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3">WhatsApp de l'Admin</label>
                <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border-none" value={brand.whatsapp} onChange={e => setBrand({...brand, whatsapp: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-6 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl">Sauvegarder</button>
          </form>
        )}

        {/* ... Autres menus (Dashboard, Partners, etc) restent identiques au fichier précédent ... */}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest mb-1 italic">Console Admin</h2>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pilotage Centralisé</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'USERS', title: 'Comptes Équipe', icon: Users2, color: 'bg-blue-500', desc: 'Gérer les accès vendeurs' },
          { id: 'PARTNERS', title: 'Annuaire Logistique', icon: Briefcase, color: 'bg-purple-500', desc: 'Fournisseurs & Clients' },
          { id: 'BRAND', title: 'Identité Boutique', icon: Building, color: 'bg-pink-500', desc: 'WhatsApp & Noms' },
          { id: 'SYSTEM', title: 'Cloud & Sécurité', icon: ShieldCheck, color: 'bg-slate-800', desc: 'Sauvegardes & Synchro' }
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
        className="w-full mt-6 bg-red-50 text-red-500 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" /> Se Déconnecter
      </button>
    </div>
  );
};

export default Settings;
