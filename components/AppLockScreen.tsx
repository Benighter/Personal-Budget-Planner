import React, { useState, useEffect, useCallback } from 'react';
import { BiometricService } from '../services/biometricService';
import { Capacitor } from '@capacitor/core';

interface AppLockScreenProps {
  pinHash: string;
  userId: string;
  authMethod: 'pin' | 'biometric' | 'both';
  onUnlocked: () => void;
}

const DOT_COUNT = 4;

const AppLockScreen: React.FC<AppLockScreenProps> = ({ pinHash, userId, authMethod, onUnlocked }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Check biometric availability and auto-trigger on mount
  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) return;
      if (authMethod === 'pin') return;
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available);
      if (available) {
        triggerBiometric();
      }
    };
    init();
  }, []);

  const triggerBiometric = useCallback(async () => {
    const result = await BiometricService.authenticate('Unlock Budget Tracker Pro');
    if (result.success) {
      onUnlocked();
    } else {
      setError('Biometric failed. Enter your PIN.');
    }
  }, [onUnlocked]);

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const verifyPin = useCallback(async (enteredPin: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(enteredPin + userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (hash === pinHash) {
      onUnlocked();
    } else {
      setError('Wrong PIN');
      shake();
      setPin('');
    }
  }, [pinHash, userId, onUnlocked]);

  const handleDigit = (digit: string) => {
    if (pin.length >= DOT_COUNT) return;
    const next = pin + digit;
    setPin(next);
    setError('');
    if (next.length === DOT_COUNT) {
      setTimeout(() => verifyPin(next), 80);
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError('');
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">Budget Tracker Pro</h2>
      <p className="text-slate-400 text-sm mb-8">
        {authMethod === 'biometric' && biometricAvailable ? 'Use fingerprint or enter PIN' : 'Enter your PIN'}
      </p>

      {/* PIN dots */}
      <div className={`flex gap-4 mb-3 ${shaking ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}
        style={{ animation: shaking ? 'shake 0.4s ease-in-out' : undefined }}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
            i < pin.length
              ? 'bg-sky-400 border-sky-400 scale-110'
              : 'bg-transparent border-slate-500'
          }`} />
        ))}
      </div>

      {/* Error */}
      <div className="h-5 mb-6">
        {error ? <p className="text-red-400 text-sm text-center">{error}</p> : null}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {digits.map((d, i) => {
          if (d === '') return <div key={i} />;

          if (d === 'del') {
            return (
              <button key={i} onPointerDown={handleDelete}
                className="h-16 rounded-2xl flex items-center justify-center text-slate-300 active:bg-slate-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              </button>
            );
          }

          return (
            <button key={i} onPointerDown={() => handleDigit(d)}
              className="h-16 rounded-2xl bg-slate-800 text-white text-2xl font-light active:bg-slate-600 active:scale-95 transition-all select-none">
              {d}
            </button>
          );
        })}
      </div>

      {/* Biometric button */}
      {biometricAvailable && authMethod !== 'pin' && (
        <button onPointerDown={triggerBiometric}
          className="mt-8 flex items-center gap-2 text-sky-400 active:text-sky-300 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v1m-4-1V9a4 4 0 018 0v3m-8 0H7a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-1m-6 0h6" />
          </svg>
          <span className="text-sm font-medium">Use Fingerprint</span>
        </button>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default AppLockScreen;
