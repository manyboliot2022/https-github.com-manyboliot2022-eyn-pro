
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Calculator, Package, ShoppingCart, Zap, Smartphone, Share, MoreVertical, PlusSquare, LayoutTemplate } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Bienvenue sur EYN PRO",
      icon: <div className="bg-yellow-100 p-6 rounded-full animate-bounce"><LayoutTemplate className="w-12 h-12 text-yellow-600" /></div>,
      description: "Votre système complet pour gérer votre boutique de cosmétiques sur iPhone et Samsung.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="bg-slate-900 text-white p-2 rounded-xl"><Calculator className="w-5 h-5" /></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Étape 1</p>
              <p className="text-sm font-bold text-slate-800">Calculez vos coûts</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="bg-slate-900 text-white p-2 rounded-xl"><Package className="w-5 h-5" /></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Étape 2</p>
              <p className="text-sm font-bold text-slate-800">Gérez votre stock</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="bg-slate-900 text-white p-2 rounded-xl"><ShoppingCart className="w-5 h-5" /></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Étape 3</p>
              <p className="text-sm font-bold text-slate-800">Vendez et facturez</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Installer sur iPhone",
      icon: <div className="bg-slate-900 p-6 rounded-full shadow-2xl"><Smartphone className="w-12 h-12 text-blue-400 animate-pulse" /></div>,
      description: "Pour l'utiliser comme une vraie App sur votre iPhone :",
      content: (
        <div className="bg-slate-50 p-6 rounded-[2rem] space-y-5 border border-slate-100">
           <div className="flex items-center gap-4">
             <div className="bg-blue-500 text-white p-2 rounded-lg"><Share className="w-5 h-5" /></div>
             <p className="text-xs font-bold text-slate-700 text-left">1. Appuyez sur le bouton <span className="text-blue-500 font-black">Partager</span> en bas de Safari.</p>
           </div>
           <div className="flex items-center gap-4">
             <div className="bg-slate-200 text-slate-700 p-2 rounded-lg"><PlusSquare className="w-5 h-5" /></div>
             <p className="text-xs font-bold text-slate-700 text-left">2. Faites défiler et appuyez sur <span className="font-black italic">"Sur l'écran d'accueil"</span>.</p>
           </div>
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest text-center mt-2 underline">Recommandé pour Safari</p>
        </div>
      )
    },
    {
      title: "Installer sur Samsung",
      icon: <div className="bg-slate-900 p-6 rounded-full shadow-2xl"><Smartphone className="w-12 h-12 text-yellow-500 animate-pulse" /></div>,
      description: "Pour l'utiliser comme une vraie App sur Samsung/Android :",
      content: (
        <div className="bg-slate-50 p-6 rounded-[2rem] space-y-5 border border-slate-100">
           <div className="flex items-center gap-4">
             <div className="bg-slate-700 text-white p-2 rounded-lg"><MoreVertical className="w-5 h-5" /></div>
             <p className="text-xs font-bold text-slate-700 text-left">1. Appuyez sur les <span className="font-black">3 points</span> en haut à droite (Chrome).</p>
           </div>
           <div className="flex items-center gap-4">
             <div className="bg-yellow-500 text-slate-900 p-2 rounded-lg"><Smartphone className="w-5 h-5" /></div>
             <p className="text-xs font-bold text-slate-700 text-left">2. Appuyez sur <span className="font-black italic">"Installer l'application"</span>.</p>
           </div>
           <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest text-center mt-2 underline">Recommandé pour Chrome</p>
        </div>
      )
    },
    {
      title: "C'est prêt !",
      icon: <div className="bg-green-500 p-6 rounded-full shadow-2xl"><Zap className="w-12 h-12 text-white animate-pulse" /></div>,
      description: "L'icône EYN PRO apparaîtra sur votre écran d'accueil.",
      content: (
        <div className="text-center space-y-4">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">
            Accès instantané & Plein écran
          </div>
          <div className="p-4 bg-slate-900 rounded-[2rem] text-white">
            <p className="text-[10px] font-black uppercase opacity-40 mb-2">Note de sécurité</p>
            <p className="text-xs font-medium leading-relaxed">Pensez à faire un "Export" dans l'onglet Finance régulièrement pour ne jamais perdre vos données !</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="p-8 flex-1 flex flex-col items-center text-center">
          <div className="mb-6">{steps[step].icon}</div>
          <h2 className="text-xl font-black text-slate-900 mb-3 leading-tight">{steps[step].title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">{steps[step].description}</p>
          
          <div className="w-full flex-1 flex flex-col justify-center">
            {steps[step].content}
          </div>
        </div>

        <div className="p-8 pt-0 flex flex-col gap-3">
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`}></div>
            ))}
          </div>
          
          <div className="flex gap-2">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-slate-100 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => step === steps.length - 1 ? onClose() : setStep(step + 1)}
              className="flex-[2] bg-yellow-500 text-slate-900 font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {step === steps.length - 1 ? 'Terminer' : 'Suivant'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
