// This file is inteneded to contain data storage related services.
// Use wrapper for every method in such a way that if in future we need to change the storage vendor, changes should happpen in this file only.

import { createMMKV } from 'react-native-mmkv';
import LoggerService from './LoggerService';

type StorageType = 'string' | 'number' | 'boolean' | 'json';

const StorageService = (() => {
  let storage: any = null;
  const init = () => {
    if (storage === null) {
      storage = createMMKV();
    }
  };

  const get = (storeKey: string, storedValueType: StorageType = 'string') => {
    if (storage === null) {
      return '';
    }
    if (!storage.contains(storeKey)) {
      return undefined;
    }

    switch (storedValueType) {
      case 'number':
        return storage.getNumber(storeKey);
      case 'boolean':
        return storage.getBoolean(storeKey);
      case 'string':
        return storage.getString(storeKey);
      default:
        let result;
        try {
          result = JSON.parse(storage.getString(storeKey) || null);
        } catch (err) {
          LoggerService.error('JSON Parse failure' + err);
          return null;
        }
        return result;
    }
  };

  const set = (storeKey: string, valueToBeStored: any) => {
    if (storage === null) {
      init();
    }
    if (Array.isArray(valueToBeStored)) {
      storage.set(storeKey, JSON.stringify(valueToBeStored));
    } else {
      storage.set(storeKey, valueToBeStored);
    }
  };

  const deleteStorage = (storeKey: string) => {
    if (storage === null) {
      return;
    }
    storage.remove(storeKey);
  };

  const clearAll = () => {
    if (storage === null) {
      return;
    }
    storage.clearAll();
  };

  return {
    init,
    get,
    set,
    delete: deleteStorage,
    clearAll,
  };
})();

export default StorageService;
