import { IDataStorageService } from './IDataStorageService';
import { DemoStorageService } from './DemoStorageService';
import { FirebaseStorageService } from './FirebaseStorageService';
import { isFirebaseConfigured } from '../firebase/client';

let storageServiceInstance: IDataStorageService | null = null;

export function getStorageService(): IDataStorageService {
  if (!storageServiceInstance) {
    if (isFirebaseConfigured()) {
      storageServiceInstance = new FirebaseStorageService();
    } else {
      storageServiceInstance = new DemoStorageService();
    }
  }
  return storageServiceInstance;
}

export * from './IDataStorageService';
export * from './DemoStorageService';
export * from './FirebaseStorageService';
export * from './mediaDB';
