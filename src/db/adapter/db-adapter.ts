export interface DBResult {
  rows: any[];
  rowsAffected: number;
  insertId?: number;
}

export interface DBAdapter {
  execute(query: string, params?: any[]): Promise<DBResult>;
  transaction(fn: (adapter: DBAdapter) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}
