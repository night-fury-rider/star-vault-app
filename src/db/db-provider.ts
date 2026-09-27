import LoggerService from '../services/LoggerService';
import { DBAdapter } from './adapter/db-adapter';
import { OPSQLiteAdapter } from './adapter/OPSQLiteAdapter';

const DB_NAME = 'starvault.db';
let adapterInstance: DBAdapter | null = null;

export const getDBAdapter = (): DBAdapter => {
  if (!adapterInstance) {
    LoggerService.error('❌ DB not initialized! adapterInstance is null');
    throw new Error('DB not initialized. Call initDBAdapter() first.');
  }
  LoggerService.log('✅ getDBAdapter called — instance exists');
  return adapterInstance;
};

export const initDBAdapter = (): DBAdapter => {
  if (!adapterInstance) {
    LoggerService.log('🔧 Initializing DB adapter...');
    adapterInstance = new OPSQLiteAdapter(DB_NAME);
    LoggerService.log('✅ DB adapter initialized');
  }
  return adapterInstance;
};

export const closeDBAdapter = async (): Promise<void> => {
  if (adapterInstance) {
    await adapterInstance.close();
    adapterInstance = null;
  }
};
