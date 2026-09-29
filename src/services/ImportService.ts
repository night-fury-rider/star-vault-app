import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { unzip } from 'react-native-zip-archive';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getDBAdapter } from '../db/db-provider';
import { StarVaultExport } from './ExportService';
import {
  copyMovieGalleryImage,
  copyMovieProfile,
  copyStarGalleryImage,
  copyStarProfile,
} from './MediaStorageService';
import { Space } from '../modules/stars/types/star-types';

export interface ImportResult {
  stars: number;
  movies: number;
  links: number;
}

export interface MediaImportResult {
  imported: number;
  skipped: number;
}

// ─── Sanitize helper — must match ExportService.sanitizeName ──
const sanitizeName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80) || 'unknown';

const getCacheDir = (): string => ReactNativeBlobUtil.fs.dirs.CacheDir;

// ─── pickZipFile ──────────────────────────────────────────────
// Lets user pick a ZIP file and copies it to app cache.
const pickZipFile = async (): Promise<string> => {
  const [file] = await pick({
    type: [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
    ],
    mode: 'import',
  });

  const [local] = await keepLocalCopy({
    files: [{ uri: file.uri, fileName: file.name ?? 'import.zip' }],
    destination: 'cachesDirectory',
  });

  return local.localUri;
};

// ─── readAndValidate ──────────────────────────────────────────
const readAndValidate = async (localUri: string): Promise<StarVaultExport> => {
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

  const required = [
    'Person',
    'CustomAttribute',
    'StarImage',
    'Movie',
    'StarMovie',
    'MovieImage',
  ];
  for (const table of required) {
    if (!Array.isArray(parsed?.tables?.[table])) {
      throw new Error(`Invalid export: missing table "${table}".`);
    }
  }

  return parsed as StarVaultExport;
};

const importBackup = async (): Promise<ImportResult & MediaImportResult> => {
  let tempDir: string | null = null;
  let zipLocalUri: string | null = null;

  try {
    // ─── Step 1 — Pick ZIP ────────────────────────────────
    zipLocalUri = await pickZipFile();
    const zipFsPath = zipLocalUri.startsWith('file://')
      ? zipLocalUri.slice(7)
      : zipLocalUri;

    // ─── Step 2 — Extract ─────────────────────────────────
    const date = new Date().toISOString().slice(0, 10);
    tempDir = `${getCacheDir()}/starvault-import-${date}`;
    await unzip(zipFsPath, tempDir);

    // ─── Step 3 — Validate and import data.json ───────────
    const jsonPath = `${tempDir}/data.json`;
    const jsonExists = await ReactNativeBlobUtil.fs.exists(jsonPath);
    if (!jsonExists) {
      throw new Error('Invalid backup — data.json not found in ZIP.');
    }

    const data = await readAndValidate(`file://${jsonPath}`);
    const dataResult = await importDataFromJSON(data, 'private');

    // ─── Step 4 — Import media ────────────────────────────
    let imported = 0;
    let skipped = 0;

    const adapter = getDBAdapter();

    // Stars
    const starsDir = `${tempDir}/stars`;
    const starsDirExists = await ReactNativeBlobUtil.fs.exists(starsDir);

    if (starsDirExists) {
      const starFolders = await ReactNativeBlobUtil.fs.ls(starsDir);

      for (const folderName of starFolders) {
        const starsResult = await adapter.execute(
          `SELECT id, stageName FROM Person WHERE space = 'private';`,
        );

        const matchedStar = starsResult.rows.find(
          (r: any) => sanitizeName(r.stageName) === folderName,
        );

        if (!matchedStar) {
          skipped++;
          continue;
        }

        const starId = matchedStar.id;
        const folderPath = `${starsDir}/${folderName}`;
        const files = await ReactNativeBlobUtil.fs.ls(folderPath);

        for (const fileName of files) {
          const filePath = `${folderPath}/${fileName}`;
          const isProfile = fileName.includes('_profile.');
          const isGallery = fileName.includes('_gallery_');

          try {
            if (isProfile) {
              const internalPath = await copyStarProfile(
                `file://${filePath}`,
                starId,
              );
              const stableUri = internalPath.startsWith('file://')
                ? internalPath
                : `file://${internalPath}`;
              await adapter.execute(
                `UPDATE Person SET imagePath = ? WHERE id = ?;`,
                [stableUri, starId],
              );
              imported++;
            } else if (isGallery) {
              const internalPath = await copyStarGalleryImage(
                `file://${filePath}`,
                starId,
              );
              const stableUri = internalPath.startsWith('file://')
                ? internalPath
                : `file://${internalPath}`;
              const mediaId = `import_${starId}_${fileName}`.replace(
                /[^a-z0-9_]/gi,
                '_',
              );
              await adapter.execute(
                `INSERT OR REPLACE INTO StarImage (id, personId, filePath, type, createdAt) VALUES (?, ?, ?, 'image', ?);`,
                [mediaId, starId, stableUri, new Date().toISOString()],
              );
              imported++;
            } else {
              skipped++;
            }
          } catch {
            skipped++;
          }
        }
      }
    }

    // Movies
    const moviesDir = `${tempDir}/movies`;
    const moviesDirExists = await ReactNativeBlobUtil.fs.exists(moviesDir);

    if (moviesDirExists) {
      const movieFolders = await ReactNativeBlobUtil.fs.ls(moviesDir);

      for (const folderName of movieFolders) {
        const yearMatch = folderName.match(/_(\d{4})$/);
        if (!yearMatch) {
          skipped++;
          continue;
        }

        const year = parseInt(yearMatch[1], 10);
        const titlePart = folderName.slice(0, folderName.lastIndexOf('_'));

        const moviesResult = await adapter.execute(
          `SELECT id, title, year FROM Movie WHERE space = 'private' AND year = ?;`,
          [year],
        );

        const matchedMovie = moviesResult.rows.find(
          (r: any) => sanitizeName(r.title) === titlePart,
        );

        if (!matchedMovie) {
          skipped++;
          continue;
        }

        const movieId = matchedMovie.id;
        const folderPath = `${moviesDir}/${folderName}`;
        const files = await ReactNativeBlobUtil.fs.ls(folderPath);

        for (const fileName of files) {
          const filePath = `${folderPath}/${fileName}`;
          const isProfile = fileName.includes('_profile.');
          const isGallery = fileName.includes('_gallery_');

          try {
            if (isProfile) {
              const internalPath = await copyMovieProfile(
                `file://${filePath}`,
                movieId,
              );
              const stableUri = internalPath.startsWith('file://')
                ? internalPath
                : `file://${internalPath}`;
              await adapter.execute(
                `UPDATE Movie SET imagePath = ? WHERE id = ?;`,
                [stableUri, movieId],
              );
              imported++;
            } else if (isGallery) {
              const internalPath = await copyMovieGalleryImage(
                `file://${filePath}`,
                movieId,
              );
              const stableUri = internalPath.startsWith('file://')
                ? internalPath
                : `file://${internalPath}`;
              const mediaId = `import_${movieId}_${fileName}`.replace(
                /[^a-z0-9_]/gi,
                '_',
              );
              await adapter.execute(
                `INSERT OR REPLACE INTO MovieImage (id, movieId, filePath, type, createdAt) VALUES (?, ?, ?, 'image', ?);`,
                [mediaId, movieId, stableUri, new Date().toISOString()],
              );
              imported++;
            } else {
              skipped++;
            }
          } catch {
            skipped++;
          }
        }
      }
    }

    return { ...dataResult, imported, skipped };
  } finally {
    if (tempDir) {
      try {
        await ReactNativeBlobUtil.fs.unlink(tempDir);
      } catch {
        /* ignore */
      }
    }
  }
};

// ─── importDataFromJSON ────────────────────────────────────────────────
// Import is private-mode-only. Rows always stamped with 'private' space.
// Insert order respects FK dependencies:
// Person → CustomAttribute → StarImage → Movie → StarMovie → MovieImage
const importDataFromJSON = async (
  data: StarVaultExport,
  _space: Space,
): Promise<ImportResult> => {
  const targetSpace: Space = 'private';
  const adapter = getDBAdapter();
  const { tables } = data;

  // Person
  for (const row of tables.Person) {
    await adapter.execute(
      `INSERT OR REPLACE INTO Person
        (id, userId, stageName, originalName, countryOfOrigin,
         birthday, height, weight, officialWebsite, bio,
         imagePath, space, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
      [
        row.id,
        row.userId ?? null,
        row.stageName,
        row.originalName ?? null,
        row.countryOfOrigin ?? null,
        row.birthday ?? null,
        row.height ?? null,
        row.weight ?? null,
        row.officialWebsite ?? null,
        row.bio ?? null,
        row.imagePath ?? null,
        targetSpace,
        row.createdAt,
        row.updatedAt,
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
        (id, title, year, genre, director, synopsis, imagePath, space, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?);`,
      [
        row.id,
        row.title,
        row.year,
        row.genre ?? null,
        row.director ?? null,
        row.synopsis ?? null,
        row.imagePath ?? null,
        targetSpace,
        row.createdAt,
        row.updatedAt,
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
};

export { importDataFromJSON, importBackup, pickZipFile, readAndValidate };

export type { MediaImportResult };
