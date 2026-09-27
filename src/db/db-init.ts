import LoggerService from '../services/LoggerService';
import { DBAdapter } from './adapter/db-adapter';

export const ensureSpaceColumn = async (
  adapter: DBAdapter,
  table: 'Person' | 'Movie',
): Promise<void> => {
  const info = await adapter.execute(`PRAGMA table_info(${table});`);
  const hasSpace = info.rows.some((r: any) => r.name === 'space');
  if (!hasSpace) {
    LoggerService.log(`🏗 Adding space column to ${table}...`);
    await adapter.execute(
      `ALTER TABLE ${table} ADD COLUMN space TEXT NOT NULL DEFAULT 'private';`,
    );
  }
};

export const createTables = async (adapter: DBAdapter): Promise<void> => {
  try {
    LoggerService.log('🏗 Creating tables...');

    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS Person (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT,
        stageName TEXT NOT NULL,
        originalName TEXT,
        countryOfOrigin TEXT,
        birthday TEXT,
        height TEXT,
        weight TEXT,
        officialWebsite TEXT,
        bio TEXT,
        imagePath TEXT,
        space TEXT NOT NULL DEFAULT 'private',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS CustomAttribute (
        id TEXT PRIMARY KEY NOT NULL,
        personId TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (personId) REFERENCES Person(id) ON DELETE CASCADE
      );
    `);

    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS StarImage (
        id TEXT PRIMARY KEY NOT NULL,
        personId TEXT NOT NULL,
        filePath TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'image',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (personId) REFERENCES Person(id) ON DELETE CASCADE
      );
    `);

    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS Movie (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        genre TEXT,
        director TEXT,
        synopsis TEXT,
        imagePath TEXT,
        space TEXT NOT NULL DEFAULT 'private',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Additive migrations for Movie — ALTER TABLE is a no-op if the column
    // already exists is not supported by SQLite, so we check PRAGMA first.
    const movieInfo = await adapter.execute(`PRAGMA table_info(Movie);`);
    const movieCols = movieInfo.rows.map((r: any) => r.name as string);

    const movieMigrations: { col: string; ddl: string }[] = [
      { col: 'genre', ddl: 'ALTER TABLE Movie ADD COLUMN genre TEXT;' },
      { col: 'director', ddl: 'ALTER TABLE Movie ADD COLUMN director TEXT;' },
      { col: 'synopsis', ddl: 'ALTER TABLE Movie ADD COLUMN synopsis TEXT;' },
      { col: 'imagePath', ddl: 'ALTER TABLE Movie ADD COLUMN imagePath TEXT;' },
      {
        col: 'space',
        ddl: "ALTER TABLE Movie ADD COLUMN space TEXT NOT NULL DEFAULT 'private';",
      },
      {
        col: 'updatedAt',
        ddl: "ALTER TABLE Movie ADD COLUMN updatedAt TEXT NOT NULL DEFAULT '';",
      },
    ];

    for (const m of movieMigrations) {
      if (!movieCols.includes(m.col)) {
        LoggerService.log(`🔧 Movie migration: adding column "${m.col}"`);
        await adapter.execute(m.ddl);
      }
    }

    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS MovieCustomAttribute (
        id TEXT PRIMARY KEY NOT NULL,
        movieId TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE
      );
    `);

    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS StarMovie (
        id TEXT PRIMARY KEY NOT NULL,
        personId TEXT NOT NULL,
        movieId TEXT NOT NULL,
        role TEXT,
        FOREIGN KEY (personId) REFERENCES Person(id) ON DELETE CASCADE,
        FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE
      );
    `);

    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS MovieImage (
        id TEXT PRIMARY KEY NOT NULL,
        movieId TEXT NOT NULL,
        filePath TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'image',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE
      );
    `);

    // Additive migration for devices that already have Person/Movie tables
    // without the space column.
    await ensureSpaceColumn(adapter, 'Person');
    await ensureSpaceColumn(adapter, 'Movie');

    LoggerService.log('✅ All tables created');
    const tables = await adapter.execute(
      `SELECT name FROM sqlite_master WHERE type='table';`,
    );
    LoggerService.log('📋 Tables in DB:', JSON.stringify(tables.rows));
  } catch (e) {
    LoggerService.error('❌ Failed to create tables:', e);
    throw e;
  }
};
