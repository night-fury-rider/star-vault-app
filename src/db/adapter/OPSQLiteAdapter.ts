import { open } from '@op-engineering/op-sqlite';
import { DBAdapter, DBResult } from './db-adapter';

let dbInstance: any = null;

const getDB = () => {
  if (!dbInstance) {
    console.log('🔧 Opening DB connection...');
    dbInstance = open({ name: 'starvault.db' });
    console.log('✅ DB connection opened');
  }
  return dbInstance;
};

export class OPSQLiteAdapter implements DBAdapter {
  async execute(query: string, params: any[] = []): Promise<DBResult> {
    try {
      const db = getDB();
      console.log('🗄 SQL:', query.trim().substring(0, 80));

      // op-sqlite v15 uses executeSync
      const result = db.executeSync(query, params);

      console.log('🔍 result type:', typeof result);

      // v15 returns an OPSQLite ResultSet object
      // rows are accessed via getAllArray() or getArray()
      let rows: any[] = [];

      if (typeof result?.getAllArray === 'function') {
        rows = result.getAllArray();
        console.log('✅ rows via getAllArray():', rows.length);
      } else if (typeof result?.getArray === 'function') {
        rows = result.getArray();
        console.log('✅ rows via getArray():', rows.length);
      } else if (Array.isArray(result?.rows)) {
        rows = result.rows;
        console.log('✅ rows via result.rows:', rows.length);
      } else if (Array.isArray(result?.rows?._array)) {
        rows = result.rows._array;
        console.log('✅ rows via _array:', rows.length);
      } else if (Array.isArray(result)) {
        rows = result;
        console.log('✅ result is array:', rows.length);
      }

      return {
        rows,
        rowsAffected: result?.rowsAffected ?? 0,
        insertId: result?.insertId,
      };
    } catch (e) {
      console.error('❌ SQL Error:', query, e);
      throw e;
    }
  }

  async transaction(fn: (adapter: DBAdapter) => Promise<void>): Promise<void> {
    const txAdapter: DBAdapter = {
      execute: async (query: string, params: any[] = []) => {
        return this.execute(query, params);
      },
      transaction: async innerFn => {
        await innerFn(txAdapter);
      },
      close: async () => {},
    };

    try {
      await fn(txAdapter);
      console.log('✅ Transaction fn completed');
    } catch (e) {
      console.error('❌ Transaction error:', e);
      throw e;
    }
  }

  async close(): Promise<void> {
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
      console.log('✅ DB closed');
    }
  }
}
