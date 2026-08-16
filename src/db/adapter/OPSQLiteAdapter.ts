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

// op-sqlite v15: getAllArray() returns each row as a positional any[].
// getColumnNames() returns the matching column name for each index.
// Zip them to produce named objects that repositories can access by field name.
const toNamedRows = (result: any, query: string): any[] => {
  if (typeof result?.getAllArray === 'function') {
    const rawRows: any[][] = result.getAllArray();
    if (!rawRows || rawRows.length === 0) return [];

    // Primary strategy: getColumnNames()
    if (typeof result?.getColumnNames === 'function') {
      const columns: string[] = result.getColumnNames();
      if (columns.length > 0) {
        return rawRows.map(row =>
          columns.reduce<Record<string, any>>((obj, col, i) => {
            obj[col] = row[i];
            return obj;
          }, {}),
        );
      }
    }

    // Fallback: parse column names from SELECT clause
    // Handles "sm.personId", "p.stageName", "col AS alias"
    const selectMatch = query.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
    if (selectMatch) {
      const colExprs = selectMatch[1].split(',').map(c => {
        const trimmed = c.trim();
        if (trimmed === '*' || trimmed.endsWith('.*')) return null;
        const aliasMatch = trimmed.match(/\bAS\s+(\w+)$/i);
        if (aliasMatch) return aliasMatch[1];
        const dotMatch = trimmed.match(/\.(\w+)$/);
        if (dotMatch) return dotMatch[1];
        return trimmed;
      });
      if (
        colExprs.every(c => c !== null) &&
        colExprs.length === rawRows[0]?.length
      ) {
        return rawRows.map(row =>
          (colExprs as string[]).reduce<Record<string, any>>((obj, col, i) => {
            obj[col] = row[i];
            return obj;
          }, {}),
        );
      }
    }

    return rawRows;
  }

  if (typeof result?.getArray === 'function') return result.getArray() ?? [];
  if (Array.isArray(result?.rows?._array)) return result.rows._array;
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result)) return result;
  return [];
};

export class OPSQLiteAdapter implements DBAdapter {
  async execute(query: string, params: any[] = []): Promise<DBResult> {
    try {
      const db = getDB();
      console.log('🗄 SQL:', query.trim().substring(0, 80));

      const result = db.executeSync(query, params);
      const rows = toNamedRows(result, query);

      console.log('✅ rows:', rows.length);

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
