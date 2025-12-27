
import React, { useState, useEffect } from 'react';
import { 
  Users, Tags, ShieldCheck, Plus, Trash2, Smartphone, Save, 
  User as UserIcon, Building, Tag, Copy, Globe, HelpCircle, Link as LinkIcon, AlertCircle, MousePointer2, PlusCircle
} from 'lucide-react';
import { 
  UserProfile, Family, CompanySettings, DEFAULT_BRAND_INFO 
} from '../types.ts';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'FAMILIES' | 'BRAND' | 'SHARE'>('SHARE');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [brand, setBrand] = useState<CompanySettings>(DEFAULT_BRAND_INFO);
  const [manualUrl, setManualUrl] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem('eyn_users') || '[]'));
    setFamilies(JSON.parse(localStorage.getItem('eyn_families') || '[]'));
    const savedBrand = localStorage.getItem('eyn_brand_info');
    if (savedBrand) setBrand(JSON.parse(savedBrand));
    
    setManualUrl(window.location.origin);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(manualUrl);
    alert("Lien copié !");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'SHARE', label: 'Mobile', icon: Smartphone },
          { id: 'USERS', label: 'Équipe', icon: Users },
          { id: 'FAMILIES', label: 'Familles', icon: Tags },
          { id: 'BRAND', label: 'Boutique', icon: ShieldCheck }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 min-w-[80px] py-3 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'SHARE' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white text-center shadow-2xl space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-black uppercase tracking-widest text-yellow-500">Lien Mobile</h3>
                <p className="text-[9px] text-white/50 font-medium uppercase tracking-tight">Configuration GitHub Codespaces</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <LinkIcon className="w-3 h-3 text-yellow-500" />
                  <p className="text-[8px] font-black uppercase text-yellow-500 tracking-widest text-left">URL de l'application :</p>
                </div>
                <input 
                  type="text" 
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Collez ici le lien public..."
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-xs font-mono text-white focus:ring-2 ring-yellow-500"
                />
              </div>

              <div className="bg-white p-4 rounded-[2.5rem] inline-block shadow-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(manualUrl)}`} 
                  alt="QR Code"
                  className="w-40 h-40"
                />
              </div>

              <div className="space-y-3">
                <button onClick={copyLink} className="w-full bg-yellow-500 text-slate-900 py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                  <Copy className="w-4 h-4" /> Copier le lien
                </button>
                <button onClick={() => setShowHelp(!showHelp)} className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                  <HelpCircle className="w-3 h-3" /> Aide : Liste "PORTS" vide ?
                </button>
              </div>

              {showHelp && (
                <div className="bg-white/5 p-6 rounded-3xl text-left border border-white/10 space-y-4 animate-in slide-in-from-top-4">
                   <div className="space-y-3">
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                       <PlusCircle className="w-3 h-3" /> Plan B : Liste Vide
                     </p>
                     <p className="text-[9px] text-white/60 leading-relaxed">Si aucun port n'est listé, cliquez sur le bouton bleu <span className="text-white font-bold">"Transférer un port"</span>, tapez <span className="bg-yellow-500 text-slate-900 px-1 rounded font-bold">5173</span> et validez avec Entrée.</p>
                   </div>
                   
                   <div className="space-y-3 border-t border-white/10 pt-4">
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Étape 2 : Visibility Public</p>
                     <div className="bg-slate-800 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                        <MousePointer2 className="w-4 h-4 text-yellow-500" />
                        <p className="text-[8px] text-white/80 font-medium">Faites un clic droit sur "Private" et changez-le en <span className="text-yellow-500 font-bold">"Public"</span>.</p>
                     </div>
                   </div>

                   <div className="space-y-3 border-t border-white/10 pt-4">
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Étape 3 : Copier l'URL</p>
                     <p className="text-[9px] text-white/60">Cliquez sur l'icône de globe (Forwarded Address) et collez l'adresse dans la case bleue ci-dessus.</p>
                   </div>
                </div>
              )}
           </div>

           <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
              <div className="bg-blue-500 p-2 rounded-xl text-white"><Globe className="w-5 h-5" /></div>
              <div className="text-left">
                <p className="text-[10px] font-black text-blue-800 uppercase mb-1">Installation Mobile</p>
                <p className="text-[10px] text-blue-600/80 font-medium leading-relaxed">
                  <span className="font-bold">iPhone :</span> Partager > "Sur l'écran d'accueil"<br/>
                  <span className="font-bold">Samsung :</span> 3 points > "Installer l'app"
                </p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'BRAND' && (
        <form onSubmit={(e) => {e.preventDefault(); localStorage.setItem('eyn_brand_info', JSON.stringify(brand)); alert("Sauvegardé !")}} className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <Building className="w-4 h-4 text-yellow-500" /> Profil Boutique
            </h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nom de l'Enseigne</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-yellow-500" value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">WhatsApp (Ex: 224625245350)</label>
              <input type="text" className="text-sm w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" value={brand.whatsapp} onChange={e => setBrand({...brand, whatsapp: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-yellow-500 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <Save className="w-5 h-5" /> Mettre à jour la Boutique
          </button>
        </form>
      )}

      {activeTab === 'USERS' && (
        <div className="py-20 text-center opacity-30 animate-pulse">
          <Users className="w-12 h-12 mx-auto mb-2" />
          <p className="text-xs font-black uppercase tracking-widest">Gestion d'équipe prochainement</p>
        </div>
      )}

      {activeTab === 'FAMILIES' && (
        <div className="py-20 text-center opacity-30 animate-pulse">
          <Tag className="w-12 h-12 mx-auto mb-2" />
          <p className="text-xs font-black uppercase tracking-widest">Gestion catégories prochainement</p>
        </div>
      )}
    </div>
  );
};

export default Settings;
