import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'hayaah_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

interface MediaRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: string;
  metadata?: {
    isAI?: boolean;
    isSample?: boolean;
    altAr?: string;
    altEn?: string;
  };
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveMediaBlob(
  file: File | Blob,
  fileName: string,
  metadata?: { isAI?: boolean; isSample?: boolean; altAr?: string; altEn?: string }
): Promise<{ id: string; url: string }> {
  const db = await getDB();
  const id = 'media_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  
  const record: MediaRecord = {
    id,
    name: fileName,
    mimeType: file.type || 'image/jpeg',
    size: file.size,
    blob: file,
    createdAt: new Date().toISOString(),
    metadata,
  };

  await db.put(STORE_NAME, record);
  const url = URL.createObjectURL(file);
  return { id, url };
}

export async function getMediaBlobUrl(id: string): Promise<string | null> {
  const db = await getDB();
  const record = (await db.get(STORE_NAME, id)) as MediaRecord | undefined;
  if (!record || !record.blob) return null;
  return URL.createObjectURL(record.blob);
}

export async function getAllMedia(): Promise<{ id: string; url: string; name: string; size: number; date: string }[]> {
  const db = await getDB();
  const records = (await db.getAll(STORE_NAME)) as MediaRecord[];
  return records.map((r) => ({
    id: r.id,
    url: URL.createObjectURL(r.blob),
    name: r.name,
    size: r.size,
    date: r.createdAt,
  }));
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllMedia(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
