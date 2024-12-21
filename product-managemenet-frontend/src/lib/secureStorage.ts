import CryptoJS from "crypto-js";
 
const CRYPTO_KEY = "your-secure-encryption-key";
 
export const secureStorage = {
  getItem: (name: string): string | null => {
    const data = localStorage.getItem(name);
    if (!data) return null;
    try {
      const decrypted = CryptoJS.AES.decrypt(data, CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    const encrypted = CryptoJS.AES.encrypt(value, CRYPTO_KEY).toString();
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};