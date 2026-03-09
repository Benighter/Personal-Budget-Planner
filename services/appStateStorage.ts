import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export class AppStateStorage {
  static async getJson<T>(key: string): Promise<T | null> {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) as T : null;
    }

    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  }

  static async setJson<T>(key: string, value: T): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value: serializedValue });
      return;
    }

    sessionStorage.setItem(key, serializedValue);
  }

  static async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
      return;
    }

    sessionStorage.removeItem(key);
  }
}