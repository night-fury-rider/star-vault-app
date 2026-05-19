import { DBAdapter } from './adapter/db-adapter';

export const createTables = async (adapter: DBAdapter): Promise<void> => {
  try {
    console.log('🏗 Creating tables...');

    // await adapter.execute('PRAGMA foreign_keys = ON;');

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
        createdAt TEXT NOT NULL
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

    console.log('✅ All tables created');
    // Verify tables exist
    const tables = await adapter.execute(
      `SELECT name FROM sqlite_master WHERE type='table';`,
    );
    console.log('📋 Tables in DB:', JSON.stringify(tables.rows));
  } catch (e) {
    console.error('❌ Failed to create tables:', e);
    throw e;
  }
};
