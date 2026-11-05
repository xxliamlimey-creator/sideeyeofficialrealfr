/**
 * Client-side Storage and Asset Processing Helper
 * 
 * Solves Firestore 1MB document limit by:
 * 1. Storing uploaded binary files (EXEs, APKs, ZIPs) in IndexedDB and saving a lightweight reference in Firestore.
 * 2. Compressing uploaded screenshot images client-side before storing.
 */

const DB_NAME = 'SideEye_Storage_DB';
const STORE_NAME = 'binary_files';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a binary file blob in IndexedDB and returns a reference key URI.
 */
export async function storeBinaryFile(key: string, file: Blob): Promise<string> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(file, key);
    req.onsuccess = () => resolve(`idb://${key}`);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves a binary file blob from IndexedDB given a reference key or URI.
 */
export async function getBinaryFile(keyOrUri: string): Promise<Blob | null> {
  const key = keyOrUri.startsWith('idb://') ? keyOrUri.replace('idb://', '') : keyOrUri;
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Compresses an image file (e.g. screenshots, icons) client-side to ensure it never exceeds Firestore limits.
 */
export function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 720,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Sanitizes any raw string or URL into a safe, valid Firestore document slug ID.
 * Examples:
 * - "https://mystery-dice.wasmer.app/" -> "mystery-dice-wasmer-app"
 * - "Mystery Dice: Relic Edition" -> "mystery-dice-relic-edition"
 * - "///bad/slug///" -> "bad-slug"
 */
export function sanitizeSlug(input: string): string {
  if (!input) return `app-${Date.now()}`;
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '') // strip protocol
    .replace(/[/?#:\\&=+~.]+/g, '-') // convert slashes, queries, periods to dash
    .replace(/[^a-z0-9_-]/g, '-') // remove invalid characters
    .replace(/-+/g, '-') // collapse multiple dashes
    .replace(/^-+|-+$/g, '') // trim dashes from ends
    || `app-${Date.now()}`;
}
