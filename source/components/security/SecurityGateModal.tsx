import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useTeamStore, TeamMember } from "../../store/useTeamStore";

interface SecurityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: TeamMember) => void;
  requiredPermission: string;
}

const SecurityGateModal = ({
  isOpen,
  onClose,
  onSuccess,
  requiredPermission,
}: SecurityGateModalProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { verifyPin } = useTeamStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(false);
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = verifyPin(pin);

    if (user) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess(user);
      }, 500);
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1000);
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                {success ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : error ? (
                  <AlertCircle className="w-8 h-8 text-red-500" />
                ) : (
                  <Lock className="w-8 h-8 text-primary" />
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">
                Acesso Restrito
              </h2>
              <p className="text-sm text-zinc-400 mb-6">
                Esta ação requer autorização.
                <br />
                <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded mt-1 inline-block text-zinc-500">
                  {requiredPermission}
                </span>
              </p>

              {/* PIN Display */}
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      i < pin.length
                        ? success
                          ? "bg-green-500 scale-110"
                          : error
                            ? "bg-red-500 scale-110"
                            : "bg-primary scale-110"
                        : "bg-zinc-800 border border-zinc-700"
                    }`}
                  />
                ))}
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num.toString())}
                    className="h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xl font-bold text-white transition-colors active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => onClose()}
                  className="h-14 rounded-xl bg-zinc-800/50 hover:bg-red-900/20 text-sm font-medium text-red-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleNumberClick("0")}
                  className="h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xl font-bold text-white transition-colors active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors flex items-center justify-center active:scale-95"
                >
                  ←
                </button>
              </div>

              {/* Hidden Input for Keyboard Support */}
              <form onSubmit={handlePinSubmit}>
                <input
                  ref={inputRef}
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val) && val.length <= 4) setPin(val);
                  }}
                  className="opacity-0 absolute inset-0 pointer-events-none"
                />
                <button type="submit" className="hidden" />
              </form>

              {pin.length === 4 && !success && !error && (
                <button
                  onClick={handlePinSubmit}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Confirmar
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SecurityGateModal;
