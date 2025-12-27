
import React, { useState, useEffect } from 'react';
import { 
  Users, Tags, Briefcase, ShieldCheck, Plus, Trash2, 
  ChevronRight, X, UserPlus, Lock, Smartphone, Download, 
  Upload, Save, User as UserIcon, Building, Phone, Mail, 
  MapPin, Tag, Briefcase as SupplierIcon, UserCheck
} from 'lucide-react';
import { 
  UserProfile, Family, Client, Supplier, CompanySettings, DEFAULT_BRAND_INFO 
} from '../types.ts';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'FAMILIES' | 'PARTNERS' | 'BRAND'>('USERS');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [brand, setBrand] = useState<CompanySettings>(DEFAULT_BRAND_INFO);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem('eyn_users') || '[]'));
    setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
    setClients(JSON.parse(localStorage.getItem('eyn_clients') || '[]'));
    setSuppliers(JSON.parse(localStorage.getItem('eyn_suppliers') || '[]'));
    const savedBrand = localStorage.getItem('eyn_brand_info');
    if (savedBrand) setBrand(JSON.parse(savedBrand));
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addUser = () => {
    const name = prompt("Nom de l'utilisateur ?");
    if (!name) return;
    const pass = prompt("Mot de passe ?");
    const role = confirm("Est-ce un Administrateur ? (OK = Admin, Annuler = Vendeur)") ? 'ADMIN' : 'VENDEUR';
    const newUsers: UserProfile[] = [...users, { id: Date.now().toString(), name, password: pass, role }];
    setUsers(newUsers);
    saveToStorage('eyn_users', newUsers);
  };

  const addFamily = () => {
    const name = prompt("Nom de la famille ? (ex: Crèmes, Sérums)");
    if (!name) return;
    const newFamilies: Family[] = [...families, { id: Date.now().toString(), name }];
    setFamilies(newFamilies);
    saveToStorage('eyn_families', newFamilies);
  };

  const addPartner = (type: 'CLIENT' | 'SUPPLIER') => {
    const name = prompt(`Nom du ${type === 'CLIENT' ? 'Client' : 'Fournisseur'} ?`);
    if (!name) return;
    const phone = prompt("Téléphone ?");
    if (type === 'CLIENT') {
      const newClients: Client[] = [...clients, { id: Date.now().toString(), name, phone: phone || '', address: '', balance: 0 }];
      setClients(newClients);
      saveToStorage('eyn_clients', newClients);
    } else {
      const newSuppliers: Supplier[] = [...suppliers, { id: Date.now().toString(), name, phone: phone || '', address: '', email: '' }];
      setSuppliers(newSuppliers);
      saveToStorage('eyn_suppliers', newSuppliers);
    }
  };

  const updateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    saveToStorage('eyn_brand_info', brand);
    alert("✅ Paramètres de la boutique mis à jour !");
    window.location.reload();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'USERS', label: 'Utilisateurs', icon: Users },
          { id: 'FAMILIES', label: 'Familles', icon: Tags },
          { id: 'PARTNERS', label: 'Partenaires', icon: Briefcase },
          { id: 'BRAND', label: 'Boutique', icon: ShieldCheck }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 min-w-[90px] py-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            <tab.icon className="w-3 h-3" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <button onClick={addUser} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <UserPlus className="w-4 h-4" /> Nouvel Utilisateur
          </button>
          <div className="space-y-2">
            {users.length === 0 ? (
               <div className="p-10 text-center opacity-30 italic text-xs">Aucun utilisateur configuré</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><UserIcon className="w-5 h-5" /></div>
                    <div>
                      <p className="font-black text-sm text-slate-900">{u.name}</p>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> {u.role === 'ADMIN' ? 'Admin' : 'Vendeur'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { if(confirm("Supprimer ?")) { const up = users.filter(x => x.id !== u.id); setUsers(up); saveToStorage('eyn_users', up); }}} className="text-red-200 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'FAMILIES' && (
        <div className="space-y-4">
          <button onClick={addFamily} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Ajouter une Famille
          </button>
          <div className="grid grid-cols-2 gap-3">
            {families.map(f => (
              <div key={f.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center relative group">
                <div className="bg-slate-50 p-3 rounded-2xl mb-2"><Tag className="w-5 h-5 text-slate-400" /></div>
                <p className="font-black text-[10px] uppercase text-slate-700 tracking-wider">{f.name}</p>
                <button onClick={() => { if(confirm("Supprimer ?")) { const up = families.filter(x => x.id !== f.id); setFamilies(up); saveToStorage('eyn_families', up); }}} className="absolute top-2 right-2 text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'PARTNERS' && (
        <div className="space-y-6">
          <section>
            <div className="flex justify-between items-center mb-3 px-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                <SupplierIcon className="w-4 h-4" /> Fournisseurs
              </h4>
              <button onClick={() => addPartner('SUPPLIER')} className="bg-slate-900 text-white p-2 rounded-lg active:scale-90"><Plus className="w-3 h-3" /></button>
            </div>
            <div className="space-y-2">
              {suppliers.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex justify-between items-center">
                  <div><p className="font-black text-sm text-slate-900">{s.name}</p><p className="text-[9px] font-bold text-slate-400">{s.phone || 'Pas de numéro'}</p></div>
                  <button onClick={() => { if(confirm("Supprimer ?")) { const up = suppliers.filter(x => x.id !== s.id); setSuppliers(up); saveToStorage('eyn_suppliers', up); }}} className="text-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-3 px-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Clients Fidèles
              </h4>
              <button onClick={() => addPartner('CLIENT')} className="bg-slate-900 text-white p-2 rounded-lg active:scale-90"><Plus className="w-3 h-3" /></button>
            </div>
            <div className="space-y-2">
              {clients.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex justify-between items-center">
                  <div><p className="font-black text-sm text-slate-900">{c.name}</p><p className="text-[9px] font-bold text-slate-400">{c.phone || 'Pas de numéro'}</p></div>
                  <button onClick={() => { if(confirm("Supprimer ?")) { const up = clients.filter(x => x.id !== c.id); setClients(up); saveToStorage('eyn_clients', up); }}} className="text-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'BRAND' && (
        <form onSubmit={updateBrand} className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-yellow-500" /> Profil Boutique
            </h3>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nom de l'Enseigne</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-yellow-500" value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Slogan / Tagline</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-yellow-500" value={brand.tagline} onChange={e => setBrand({...brand, tagline: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">WhatsApp (Ex: 224625245350)</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="text" className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-4 text-sm font-bold" value={brand.whatsapp} onChange={e => setBrand({...brand, whatsapp: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Lien Google Maps / Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                <input type="text" className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-4 text-[10px] font-bold" value={brand.mapAddress} onChange={e => setBrand({...brand, mapAddress: e.target.value})} />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <Save className="w-5 h-5" /> Mettre à jour la Marque
          </button>
        </form>
      )}
    </div>
  );
};

export default Settings;
