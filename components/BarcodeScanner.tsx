
import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  title?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, title = "Scanner un code" }) => {
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error("Caméra non accessible", e);
        alert("Erreur d'accès à la caméra. Vérifiez les permissions.");
      }
    }
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      onScan(manualCode);
      setManualCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
      <div className="p-6 flex justify-between items-center text-white z-10">
        <button onClick={onClose} className="bg-white/10 p-2 rounded-full active:scale-90 transition-transform">
          <X className="w-6 h-6"/>
        </button>
        <h2 className="text-xs font-black uppercase tracking-widest">{title}</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
        />
        <div className="relative w-64 h-48 border-2 border-yellow-500 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)]">
          <div className="absolute w-full h-0.5 bg-yellow-500 top-1/2 left-0 shadow-[0_0_15px_#eab308] animate-[scanLine_2s_infinite_ease-in-out]"></div>
        </div>
        <p className="absolute bottom-10 text-white/50 text-[10px] font-black uppercase tracking-widest animate-pulse">
          Visez le code-barres
        </p>
      </div>

      <div className="p-8 bg-slate-900 rounded-t-[3rem] safe-bottom shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            autoFocus 
            className="flex-1 bg-white/10 border-none rounded-2xl p-4 text-white text-sm font-bold placeholder:text-white/20 focus:ring-2 ring-yellow-500 transition-all" 
            placeholder="Code manuel..." 
            value={manualCode} 
            onChange={e => setManualCode(e.target.value)} 
          />
          <button type="submit" className="bg-yellow-500 text-slate-900 p-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            <ArrowRight className="w-6 h-6"/>
          </button>
        </form>
      </div>
      
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
