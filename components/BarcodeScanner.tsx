
import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Zap, ZapOff, Barcode, Scan, CheckCircle2 } from 'lucide-react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  title?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, title = "Scanner" }) => {
  const [torchOn, setTorchOn] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScanTime = useRef<number>(0);
  const lastScanCode = useRef<string>("");
  
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.CODE_39, BarcodeFormat.CODE_128, BarcodeFormat.EAN_8, 
    BarcodeFormat.EAN_13, BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  
  const codeReader = useRef(new BrowserMultiFormatReader(hints));

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const devices = await codeReader.current.listVideoInputDevices();
        const backCamera = devices.find(d => /back|arrière|rear|0/.test(d.label.toLowerCase())) || devices[0];
        
        if (isMounted && videoRef.current) {
          await codeReader.current.decodeFromConstraints(
            { 
              video: { 
                deviceId: backCamera?.deviceId,
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              } 
            },
            videoRef.current,
            (result) => {
              if (result && isMounted) {
                const now = Date.now();
                const code = result.getText();

                // Anti-rebond : éviter de scanner le même code trop vite (1.5s de délai)
                if (code === lastScanCode.current && (now - lastScanTime.current) < 1500) {
                  return;
                }

                lastScanTime.current = now;
                lastScanCode.current = code;
                
                if (navigator.vibrate) navigator.vibrate(50);
                
                // Feedback visuel
                setLastScanned(code);
                setShowFeedback(true);
                setTimeout(() => setShowFeedback(false), 1200);

                onScan(code);
              }
            }
          );
        }
      } catch (e) {
        console.error("Scanner error:", e);
        setHasError(true);
      }
    }
    init();
    return () => { 
      isMounted = false; 
      codeReader.current.reset(); 
    };
  }, [onScan]);

  const toggleTorch = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      const track = stream?.getVideoTracks()[0];
      const capabilities = track?.getCapabilities() as any;
      if (track && capabilities?.torch) {
        await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
        setTorchOn(!torchOn);
      } else {
        alert("Flash non supporté");
      }
    } catch (e) { console.error(e); }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      const result = await codeReader.current.decodeFromImageUrl(url);
      if (result) onScan(result.getText());
    } catch (err) { alert("Aucun code détecté"); }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col animate-fade overflow-hidden">
      <button onClick={onClose} className="absolute top-12 left-6 z-[1001] p-3 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95">
        <X className="w-6 h-6" />
      </button>

      {showFeedback && (
        <div className="absolute top-14 left-0 right-0 z-[1002] flex justify-center animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Code détecté : {lastScanned}</span>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-white/40 space-y-4">
            <Scan className="w-16 h-16 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">Accès caméra requis</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-white rounded-tl-[2rem]"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-white rounded-tr-[2rem]"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-white rounded-bl-[2rem]"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-white rounded-br-[2rem]"></div>
                <div className="absolute w-full h-[1px] bg-white/20 shadow-[0_0_10px_white] animate-scan-line"></div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center px-8">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center gap-8 p-4 px-8 shadow-2xl">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-white/80 active:scale-90 transition-transform">
            <ImageIcon className="w-7 h-7" />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileScan} />
          </button>
          <div className="w-[1px] h-6 bg-white/10"></div>
          <div className="p-3 text-white"><Barcode className="w-8 h-8" /></div>
          <div className="w-[1px] h-6 bg-white/10"></div>
          <button onClick={toggleTorch} className={`p-3 active:scale-90 transition-transform ${torchOn ? 'text-yellow-400' : 'text-white/80'}`}>
            {torchOn ? <Zap className="w-7 h-7 fill-current" /> : <ZapOff className="w-7 h-7" />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan-line { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan-line { animation: scan-line 3s infinite linear; }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
