import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BiometricService } from '../services/biometricService';
import { Capacitor } from '@capacitor/core';

interface AppLockScreenProps {
  pinHash: string;
  userId: string;
  authMethod: 'pin' | 'biometric' | 'both';
  onUnlocked: () => void;
}

const DOT_COUNT = 4;
const STORAGE_KEY = 'btp_lockout_state';
const MAX_ATTEMPTS = 3;

// Timeout durations per failed batch (in seconds)
const TIMEOUTS = [10, 30, 3600]; // batch 1 → 10s, batch 2 → 30s, batch 3+ → 1 hour

interface LockoutState {
  failedBatches: number;   // how many 3-attempt batches have failed: 0, 1, 2, 3+
  attemptsInBatch: number; // wrong attempts in the current batch: 0–2
  lockedUntil: number | null; // epoch ms when the current timeout expires
  resetDate: string;       // 'YYYY-MM-DD' — resets everything at midnight each day
}

function todayStr() {
  return new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
}

function loadState(): LockoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s: LockoutState = JSON.parse(raw);
      // Midnight reset: if stored date is before today, start fresh
      if (s.resetDate !== todayStr()) {
        return fresh();
      }
      return s;
    }
  } catch {}
  return fresh();
}

function fresh(): LockoutState {
  return { failedBatches: 0, attemptsInBatch: 0, lockedUntil: null, resetDate: todayStr() };
}

function saveState(s: LockoutState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  if (totalSec >= 3600) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}`;
}

const AppLockScreen: React.FC<AppLockScreenProps> = ({ pinHash, userId, authMethod, onUnlocked }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [lockout, setLockout] = useState<LockoutState>(() => loadState());
  const [countdown, setCountdown] = useState<number>(0); // ms remaining
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep lockout in sync with localStorage whenever it changes
  useEffect(() => {
    saveState(lockout);
  }, [lockout]);

  // Countdown timer when locked
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (lockout.lockedUntil) {
      const tick = () => {
        const remaining = lockout.lockedUntil! - Date.now();
        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          setCountdown(0);
          // Unlock the timeout — allow next batch of attempts
          setLockout(prev => ({ ...prev, lockedUntil: null, attemptsInBatch: 0 }));
        } else {
          setCountdown(remaining);
        }
      };
      tick();
      timerRef.current = setInterval(tick, 250);
    } else {
      setCountdown(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockout.lockedUntil]);

  // Biometric init — skip entirely if currently locked out
  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) return;
      if (authMethod === 'pin') return;
      // Don't trigger biometric during an active lockout
      const state = loadState();
      if (state.lockedUntil && state.lockedUntil > Date.now()) return;
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available);
      if (available) triggerBiometric();
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

  const recordWrongAttempt = useCallback(() => {
    setLockout(prev => {
      const newAttempts = prev.attemptsInBatch + 1;

      if (newAttempts < MAX_ATTEMPTS) {
        // Still within this batch — just increment
        return { ...prev, attemptsInBatch: newAttempts };
      }

      // This batch is exhausted
      const newBatches = prev.failedBatches + 1;
      const timeoutSec = TIMEOUTS[Math.min(newBatches - 1, TIMEOUTS.length - 1)];
      const lockedUntil = Date.now() + timeoutSec * 1000;

      return {
        ...prev,
        failedBatches: newBatches,
        attemptsInBatch: 0,
        lockedUntil,
      };
    });
  }, []);

  const verifyPin = useCallback(async (enteredPin: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(enteredPin + userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (hash === pinHash) {
      // Correct — clear lockout state and unlock
      saveState(fresh());
      onUnlocked();
    } else {
      shake();
      setPin('');
      recordWrongAttempt();
    }
  }, [pinHash, userId, onUnlocked, recordWrongAttempt]);

  const handleDigit = (digit: string) => {
    if (lockout.lockedUntil) return; // blocked during timeout
    if (pin.length >= DOT_COUNT) return;
    const next = pin + digit;
    setPin(next);
    setError('');
    if (next.length === DOT_COUNT) {
      setTimeout(() => verifyPin(next), 80);
    }
  };

  const handleDelete = () => {
    if (lockout.lockedUntil) return;
    setPin(p => p.slice(0, -1));
    setError('');
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  const isLocked = !!lockout.lockedUntil && countdown > 0;
  const remainingAttempts = MAX_ATTEMPTS - lockout.attemptsInBatch;

  // Determine lockout stage for color/messaging
  const lockStage = lockout.failedBatches; // 1 = 10s, 2 = 30s, 3+ = 1h
  const lockColor = lockStage >= 3 ? 'text-red-400' : lockStage === 2 ? 'text-orange-400' : 'text-amber-400';
  const lockBg = lockStage >= 3 ? 'border-red-500/40 bg-red-950/40' : lockStage === 2 ? 'border-orange-500/40 bg-orange-950/40' : 'border-amber-500/40 bg-amber-950/40';
  const lockMessage = lockStage >= 3
    ? 'Too many failed attempts.\nTry again in 1 hour.'
    : lockStage === 2
      ? 'Too many failed attempts.\n30 second cooldown.'
      : 'Too many failed attempts.\n10 second cooldown.';

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${isLocked ? 'bg-red-500/20' : 'bg-sky-500/20'}`}>
        <svg className={`w-8 h-8 transition-colors duration-500 ${isLocked ? 'text-red-400' : 'text-sky-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">Budget Tracker Pro</h2>

      {isLocked ? (
        /* ── Lockout screen ── */
        <div className={`mt-4 mx-6 rounded-2xl border p-6 text-center ${lockBg}`} style={{ minWidth: 260 }}>
          <p className={`text-sm font-medium mb-5 whitespace-pre-line ${lockColor}`}>{lockMessage}</p>

          {/* Big countdown */}
          <p className={`text-6xl font-bold tabular-nums tracking-tight ${lockColor}`}>
            {formatCountdown(countdown)}
          </p>
          <p className="text-slate-500 text-xs mt-3">
            {lockStage >= 3 ? 'Resets at midnight' : 'Keypad will unlock automatically'}
          </p>
        </div>
      ) : (
        /* ── Normal PIN entry ── */
        <>
          <p className="text-slate-400 text-sm mb-8">
            {authMethod !== 'pin' && biometricAvailable ? 'Use fingerprint or enter PIN' : 'Enter your PIN'}
          </p>

          {/* PIN dots */}
          <div className="flex gap-4 mb-3"
            style={{ animation: shaking ? 'shake 0.4s ease-in-out' : undefined }}>
            {Array.from({ length: DOT_COUNT }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < pin.length ? 'bg-sky-400 border-sky-400 scale-110' : 'bg-transparent border-slate-500'
              }`} />
            ))}
          </div>

          {/* Attempt counter / error */}
          <div className="h-5 mb-6">
            {lockout.attemptsInBatch > 0 ? (
              <p className="text-amber-400 text-sm text-center">
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </p>
            ) : null}
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
        </>
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

