import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { getDBAdapter } from '../db/db-provider';
import { StarVaultExport } from './ExportService';

export interface ImportResult {
  stars: number;
  movies: number;
  links: number;
}

export const ImportService = {
  // ─── Step 1: Let user pick a JSON file ───────────────────
  async pickFile(): Promise<string> {
    const [file] = await pick({
      type: [types.json, 'application/json', 'text/plain'],
      mode: 'import',
    });

    // Copy to app cache so we can read it reliably on both platforms
    const [local] = await keepLocalCopy({
      files: [{ uri: file.uri, fileName: file.name ?? 'import.json' }],
      destination: 'cachesDirectory',
    });

    return local.localUri;
  },

  // ─── Step 2: Read and validate the JSON ──────────────────
  async readAndValidate(localUri: string): Promise<StarVaultExport> {
    const response = await fetch(localUri);
    const text = await response.text();
    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('File is not valid JSON.');
    }

    if (parsed?.version !== 1) {
      throw new Error('Unrecognised file format. Expected a StarVault export.');
    }

    const required = ['Person', 'CustomAttribute', 'StarImage', 'Movie', 'StarMovie', 'MovieImage'];
    for (const table of required) {
      if (!Array.isArray(parsed?.tables?.[table])) {
        throw new Error(`Invalid export: missing table "${table}".`);
      }
    }

    return parsed as StarVaultExport;
  },

  // ─── Step 3: Import into DB using INSERT OR REPLACE ──────
  // Insert order respects FK dependencies:
  // Person → CustomAttribute → StarImage → Movie → StarMovie → MovieImage
  async importAll(data: StarVaultExport): Promise<ImportResult> {
    const adapter = getDBAdapter();
    const { tables } = data;

    // Person
    for (const row of tables.Person) {
      await adapter.execute(
        `INSERT OR REPLACE INTO Person
          (id, userId, stageName, originalName, countryOfOrigin,
           birthday, height, weight, officialWebsite, bio,
           imagePath, createdAt, updatedAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);`,
        [
          row.id, row.userId ?? null, row.stageName, row.originalName ?? null,
          row.countryOfOrigin ?? null, row.birthday ?? null, row.height ?? null,
          row.weight ?? null, row.officialWebsite ?? null, row.bio ?? null,
          row.imagePath ?? null, row.createdAt, row.updatedAt,
        ],
      );
    }

    // CustomAttribute
    for (const row of tables.CustomAttribute) {
      await adapter.execute(
        `INSERT OR REPLACE INTO CustomAttribute (id, personId, key, value)
         VALUES (?,?,?,?);`,
        [row.id, row.personId, row.key, row.value],
      );
    }

    // StarImage
    for (const row of tables.StarImage) {
      await adapter.execute(
        `INSERT OR REPLACE INTO StarImage (id, personId, filePath, type, createdAt)
         VALUES (?,?,?,?,?);`,
        [row.id, row.personId, row.filePath, row.type, row.createdAt],
      );
    }

    // Movie
    for (const row of tables.Movie) {
      await adapter.execute(
        `INSERT OR REPLACE INTO Movie
          (id, title, year, genre, director, synopsis, imagePath, createdAt, updatedAt)
         VALUES (?,?,?,?,?,?,?,?,?);`,
        [
          row.id, row.title, row.year, row.genre ?? null,
          row.director ?? null, row.synopsis ?? null,
          row.imagePath ?? null, row.createdAt, row.updatedAt,
        ],
      );
    }

    // StarMovie
    for (const row of tables.StarMovie) {
      await adapter.execute(
        `INSERT OR REPLACE INTO StarMovie (id, personId, movieId, role)
         VALUES (?,?,?,?);`,
        [row.id, row.personId, row.movieId, row.role ?? null],
      );
    }

    // MovieImage
    for (const row of tables.MovieImage) {
      await adapter.execute(
        `INSERT OR REPLACE INTO MovieImage (id, movieId, filePath, type, createdAt)
         VALUES (?,?,?,?,?);`,
        [row.id, row.movieId, row.filePath, row.type, row.createdAt],
      );
    }

    return {
      stars: tables.Person.length,
      movies: tables.Movie.length,
      links: tables.StarMovie.length,
    };
  },
};
