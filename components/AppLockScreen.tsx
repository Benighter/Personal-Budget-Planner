import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BiometricService } from '../services/biometricService';
import { Capacitor } from '@capacitor/core';
import { SecuritySettings } from '../types';
import { PinSecurityService } from '../services/pinSecurityService';
import { AppStateStorage } from '../services/appStateStorage';

interface AppLockScreenProps {
  securitySettings: SecuritySettings;
  userId: string;
  onUnlocked: () => void;
}

const MAX_ATTEMPTS = 3;
const TIMEOUTS = [10, 30, 3600];

interface LockoutState {
  failedBatches: number;
  attemptsInBatch: number;
  lockedUntil: number | null;
  resetDate: string;
}

function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

function fresh(): LockoutState {
  return { failedBatches: 0, attemptsInBatch: 0, lockedUntil: null, resetDate: todayStr() };
}

function normalizeState(state: LockoutState | null): LockoutState {
  if (!state || state.resetDate !== todayStr()) {
    return fresh();
  }

  return state;
}

function getStorageKey(userId: string) {
  return `btp_lockout_state_${userId}`;
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

const AppLockScreen: React.FC<AppLockScreenProps> = ({ securitySettings, userId, onUnlocked }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [lockout, setLockout] = useState<LockoutState>(fresh);
  const [countdown, setCountdown] = useState<number>(0);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pinLength = securitySettings.pinLength ?? 4;
  const authMethod = securitySettings.authMethod;

  const unlock = useCallback(() => {
    setIsUnlocking(true);
    setTimeout(() => onUnlocked(), 380);
  }, [onUnlocked]);

  const triggerBiometric = useCallback(async () => {
    const result = await BiometricService.authenticate('Unlock Budget Tracker Pro');
    if (result.success) {
      unlock();
    } else {
      setError('Fingerprint not recognised. Enter your PIN.');
      setTimeout(() => setError(''), 3500);
    }
  }, [unlock]);

  useEffect(() => {
    let cancelled = false;

    const loadLockoutState = async () => {
      const storedState = await AppStateStorage.getJson<LockoutState>(getStorageKey(userId));
      if (!cancelled) {
        setLockout(normalizeState(storedState));
        setIsStateLoaded(true);
      }
    };

    void loadLockoutState();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!isStateLoaded) {
      return;
    }

    void AppStateStorage.setJson(getStorageKey(userId), lockout);
  }, [userId, lockout, isStateLoaded]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (lockout.lockedUntil) {
      const tick = () => {
        const remaining = lockout.lockedUntil - Date.now();
        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          setCountdown(0);
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

  useEffect(() => {
    const init = async () => {
      if (!isStateLoaded) return;
      if (!Capacitor.isNativePlatform()) return;
      if (authMethod === 'pin') return;
      if (lockout.lockedUntil && lockout.lockedUntil > Date.now()) return;
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available);
      if (available) {
        await triggerBiometric();
      }
    };
    void init();
  }, [authMethod, isStateLoaded, lockout.lockedUntil, triggerBiometric]);

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const recordWrongAttempt = useCallback(() => {
    setLockout(prev => {
      const newAttempts = prev.attemptsInBatch + 1;

      if (newAttempts < MAX_ATTEMPTS) {
        return { ...prev, attemptsInBatch: newAttempts };
      }

      const newBatches = prev.failedBatches + 1;
      const timeoutSec = TIMEOUTS[Math.min(newBatches - 1, TIMEOUTS.length - 1)];

      return {
        ...prev,
        failedBatches: newBatches,
        attemptsInBatch: 0,
        lockedUntil: Date.now() + timeoutSec * 1000,
      };
    });
  }, []);

  const verifyPin = useCallback(async (enteredPin: string) => {
    const isValid = await PinSecurityService.verifyPin(enteredPin, userId, securitySettings);

    if (isValid) {
      setLockout(fresh());
      await AppStateStorage.remove(getStorageKey(userId));
      unlock();
    } else {
      shake();
      setPin('');
      recordWrongAttempt();
    }
  }, [recordWrongAttempt, securitySettings, unlock, userId]);

  const handleDigit = (digit: string) => {
    if (lockout.lockedUntil) return;
    if (pin.length >= pinLength) return;
    const next = pin + digit;
    setPin(next);
    setError('');
    if (next.length === pinLength) {
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
  const lockStage = lockout.failedBatches;
  const lockColor = lockStage >= 3 ? 'text-red-400' : lockStage === 2 ? 'text-orange-400' : 'text-amber-400';
  const lockBg = lockStage >= 3 ? 'border-red-500/40 bg-red-950/40' : lockStage === 2 ? 'border-orange-500/40 bg-orange-950/40' : 'border-amber-500/40 bg-amber-950/40';
  const lockMessage = lockStage >= 3
    ? 'Too many failed attempts.\nTry again in 1 hour.'
    : lockStage === 2
      ? 'Too many failed attempts.\n30 second cooldown.'
      : 'Too many failed attempts.\n10 second cooldown.';

  if (!isStateLoaded) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center text-slate-300">
        Securing your session...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        animation: isUnlocking ? 'unlockExit 0.38s cubic-bezier(0.4, 0, 0.2, 1) forwards' : undefined,
      }}>

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
            {Array.from({ length: pinLength }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < pin.length ? 'bg-sky-400 border-sky-400 scale-110' : 'bg-transparent border-slate-500'
              }`} />
            ))}
          </div>

          {/* Attempt counter / error */}
          <div className="h-5 mb-6">
            {error ? (
              <p className="text-red-400 text-sm text-center">{error}</p>
            ) : lockout.attemptsInBatch > 0 ? (
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
        @keyframes unlockExit {
          0%   { opacity: 1; transform: scale(1);    filter: brightness(1); }
          40%  { opacity: 1; transform: scale(1.04); filter: brightness(1.6); }
          100% { opacity: 0; transform: scale(1.12); filter: brightness(2); }
        }
      `}</style>
    </div>
  );
};

export default AppLockScreen;

