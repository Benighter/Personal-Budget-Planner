import { SecuritySettings } from '../types';

const CURRENT_PIN_VERSION = 'pbkdf2-sha256-v1';
const DEFAULT_PIN_LENGTH = 6;
const DEFAULT_ITERATIONS = 210000;
const DERIVED_KEY_LENGTH = 256;
const SALT_BYTES = 16;

type StoredPinFields = Pick<SecuritySettings, 'pinHash' | 'pinSalt' | 'pinIterations' | 'pinVersion' | 'pinLength'>;

export class PinSecurityService {
  static readonly defaultPinLength = DEFAULT_PIN_LENGTH;

  static async createStoredPin(pin: string, userId: string): Promise<Required<StoredPinFields>> {
    this.assertCryptoAvailable();

    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const pinSalt = this.arrayBufferToBase64(salt.buffer);
    const pinHash = await this.derivePinHash(pin, userId, pinSalt, DEFAULT_ITERATIONS);

    return {
      pinHash,
      pinSalt,
      pinIterations: DEFAULT_ITERATIONS,
      pinVersion: CURRENT_PIN_VERSION,
      pinLength: pin.length,
    };
  }

  static async verifyPin(pin: string, userId: string, securitySettings: SecuritySettings): Promise<boolean> {
    if (!securitySettings.pinHash) {
      return false;
    }

    this.assertCryptoAvailable();

    if (
      securitySettings.pinVersion === CURRENT_PIN_VERSION &&
      securitySettings.pinSalt &&
      securitySettings.pinIterations
    ) {
      const derivedHash = await this.derivePinHash(
        pin,
        userId,
        securitySettings.pinSalt,
        securitySettings.pinIterations,
      );

      return derivedHash === securitySettings.pinHash;
    }

    const legacyHash = await this.createLegacyHash(pin, userId);
    return legacyHash === securitySettings.pinHash;
  }

  private static async derivePinHash(
    pin: string,
    userId: string,
    pinSalt: string,
    iterations: number,
  ): Promise<string> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(`${userId}:${pin}`),
      'PBKDF2',
      false,
      ['deriveBits'],
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: this.base64ToArrayBuffer(pinSalt),
        iterations,
      },
      keyMaterial,
      DERIVED_KEY_LENGTH,
    );

    return this.arrayBufferToHex(derivedBits);
  }

  private static async createLegacyHash(pin: string, userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToHex(hashBuffer);
  }

  private static arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  }

  private static assertCryptoAvailable(): void {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      throw new Error('Secure cryptography is not available on this device.');
    }
  }
}