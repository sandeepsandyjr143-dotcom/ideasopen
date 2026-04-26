import { useState, useEffect, useCallback } from 'react';
import { X, Play, Clock, CheckCircle } from 'lucide-react';

export default function AdGate({ isOpen, onClose, onUnlock, ideaTitle }) {
  const [countdown, setCountdown] = useState(30);
  const [canSkip, setCanSkip] = useState(false);
  const [adStarted, setAdStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) { setCountdown(30); setCanSkip(false); setAdStarted(false); }
  }, [isOpen]);

  useEffect(() => {
    if (!adStarted || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) { setCanSkip(true); clearInterval(t); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [adStarted]);

  const handleUnlock = useCallback(() => {
    if (canSkip) { onUnlock(); onClose(); }
  }, [canSkip, onUnlock, onClose]);

  if (!isOpen) return null;

  const progress = ((30 - countdown) / 30) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-r ${adStarted && canSkip ? 'from-green-500 to-green-600' : 'from-primary to-[#C04400]'} p-4 flex items-center justify-between transition-colors duration-500`}>
          <h3 className="font-poppins font-semibold text-white text-sm line-clamp-1 flex-1 mr-3">
            {canSkip ? '🎉 Ready to Unlock!' : `Unlocking: ${ideaTitle}`}
          </h3>
          {canSkip && (
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white transition-colors flex-shrink-0">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {!adStarted ? (
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Play size={28} className="text-primary ml-1" />
              </div>
              <h4 className="font-poppins font-semibold text-secondary text-base sm:text-lg mb-2">
                Watch Ad to Unlock
              </h4>
              <p className="text-gray-500 text-sm mb-5">
                Support us by watching a short ad to access this content for free!
              </p>
              <button
                onClick={() => setAdStarted(true)}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all min-h-[48px] text-sm sm:text-base"
              >
                ▶ Start Watching
              </button>
            </div>
          ) : (
            <div className="text-center">
              {/* Ad container */}
              <div className="relative w-full aspect-video bg-gray-900 rounded-xl mb-4 overflow-hidden">
                <div id="hilltopads-container" className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 mx-auto mb-3 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-sm opacity-70">Ad Loading...</p>
                  </div>
                </div>
                {/* Progress bar */}
                {!canSkip && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-white transition-all duration-1000 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {canSkip ? (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="font-semibold text-green-600">Ad Complete! Ready to unlock.</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock size={18} className="text-primary" />
                  <span className="font-mono font-bold text-xl text-secondary">
                    {countdown.toString().padStart(2, '0')}s remaining
                  </span>
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={!canSkip}
                className={`w-full py-3.5 font-semibold rounded-xl transition-all min-h-[48px] text-sm sm:text-base ${
                  canSkip
                    ? 'bg-green-500 text-white hover:bg-green-600 active:scale-[0.97] shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canSkip ? '🔓 Unlock Now!' : `Wait ${countdown}s...`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
