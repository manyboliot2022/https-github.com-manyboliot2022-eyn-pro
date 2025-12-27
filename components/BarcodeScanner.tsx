import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Camera, RefreshCw } from 'lucide-react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  title?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, title = "SCANNER UN CODE" }) => {
  const [manualCode, setManualCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128, 
    BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  
  const codeReader = useRef(new BrowserMultiFormatReader(hints));

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const devices = await codeReader.current.listVideoInputDevices();
        const back = devices.find(d => /back|arrière|0/.test(d.label.toLowerCase())) || devices[devices.length - 1] || devices[0];
        
        if (isMounted && videoRef.current) {
          codeReader.current.decodeFromConstraints(
            { video: { deviceId: back.deviceId, facingMode: 'environment', width: { ideal: 1280 } } },
            videoRef.current,
            (result) => {
              if (result && isMounted) {
                if (navigator.vibrate) navigator.vibrate(100);
                onScan(result.getText());
                codeReader.current.reset();
              }
            }
          );
        }
      } catch (e) {
        setHasError(true);
      }
    }
    init();
    return () => { isMounted = false; codeReader.current.reset(); };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col animate-fade overflow-hidden">
      <div className="p-6 flex justify-between items-center text-white z-20 safe-top">
        <button onClick={onClose} className="p-2"><X className="w-6 h-6"/></button>
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">{title}</h2>
        <button onClick={() => window.location.reload()} className="p-2 opacity-20"><RefreshCw className="w-4 h-4"/></button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {hasError ? (
          <div className="text-center p-10 space-y-4">
             <Camera className="w-12 h-12 text-white/10 mx-auto" />
             <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Caméra inaccessible</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
            <div className="relative w-72 h-48 border-2 border-yellow-400 rounded-[2.5rem] overflow-hidden shadow-[0_0_0_2000px_rgba(0,0,0,0.4)]">
              <div className="absolute w-full h-0.5 bg-yellow-400 shadow-[0_0_15px_#facc15] animate-[scanLaser_2.5s_infinite_linear]"></div>
            </div>
            <p className="absolute bottom-24 text-white font-black text-[9px] uppercase tracking-[0.4em] opacity-60">Alignez le code dans le cadre</p>
          </>
        )}
      </div>

      <div className="p-8 pb-12 bg-[#1a1f2e] rounded-t-[3.5rem] safe-bottom shadow-[0_-30px_60px_rgba(0,0,0,0.8)] border-t border-white/5">
        <form onSubmit={e => { e.preventDefault(); onScan(manualCode); }} className="flex gap-3">
          <input type="text" className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm font-bold placeholder:text-white/20 outline-none" placeholder="Code manuel..." value={manualCode} onChange={e => setManualCode(e.target.value)} />
          <button type="submit" className="bg-yellow-400 text-[#111827] w-14 h-14 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><ArrowRight className="w-6 h-6"/></button>
        </form>
      </div>
      <style>{`@keyframes scanLaser { 0% { transform: translateY(-120px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(120px); opacity: 0; } }`}</style>
    </div>
  );
};

export default BarcodeScanner;