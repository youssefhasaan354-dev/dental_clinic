import { IDataStorageService } from './IDataStorageService';
import { DemoStorageService } from './DemoStorageService';
import { SupabaseStorageService } from './SupabaseStorageService';

let storageServiceInstance: IDataStorageService | null = null;

export function getStorageService(): IDataStorageService {
  if (!storageServiceInstance) {
    const isExplicitDemo = import.meta.env.VITE_DEMO_MODE === 'true';
    const hasSupabaseUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);

    if (!isExplicitDemo && hasSupabaseUrl) {
      storageServiceInstance = new SupabaseStorageService();
    } else {
      storageServiceInstance = new DemoStorageService();
    }
  }
  return storageServiceInstance;
}

export * from './IDataStorageService';
export * from './DemoStorageService';
export * from './SupabaseStorageService';
export * from './mediaDB';
