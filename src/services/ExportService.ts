import { Share } from 'react-native';
import { zip } from 'react-native-zip-archive';
import RNShare from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getDBAdapter } from '../db/db-provider';
import { Space } from '../modules/stars/types/star-types';

export interface StarVaultExport {
  version: 1;
  exportedAt: string;
  space: Space;
  tables: {
    Person: any[];
    CustomAttribute: any[];
    StarImage: any[];
    Movie: any[];
    StarMovie: any[];
    MovieImage: any[];
  };
}

// Export/Import are private-mode-only features (gated in the UI), so they
// always operate on the 'private' space. Delete All remains available in
// both modes and stays space-parameterized.
const EXPORT_IMPORT_SPACE: Space = 'private';

// ─── Path helpers ─────────────────────────────────────────────

// react-native-zip-archive expects raw fs paths — strip file:// prefix
const toFsPath = (uri: string): string =>
  uri.startsWith('file://') ? uri.slice(7) : uri;

const getCacheDir = (): string => ReactNativeBlobUtil.fs.dirs.CacheDir;

const getZipPath = (): string => {
  const date = new Date().toISOString().slice(0, 10);
  return `${getCacheDir()}/starvault-media-${date}.zip`;
};

// ─── Naming helpers ───────────────────────────────────────────

// Sanitize a name segment — same rules as MediaStorageService
const sanitizeName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80) || 'unknown';

// Zero-padded counter e.g. 1 → '01', 10 → '10'
const pad = (n: number): string => String(n).padStart(2, '0');

// ─── Media collection ─────────────────────────────────────────

interface StarMediaRow {
  starId: string;
  stageName: string;
  profilePath: string | null;
  galleryPaths: string[];
}

interface MovieMediaRow {
  movieId: string;
  title: string;
  year: number;
  profilePath: string | null;
  galleryPaths: string[];
}

// Collects all private-space media grouped by star and movie.
// Returns structured data ready for named ZIP entries.
const collectStructuredMedia = async (): Promise<{
  stars: StarMediaRow[];
  movies: MovieMediaRow[];
}> => {
  const adapter = getDBAdapter();

  const [personResult, movieResult, starImageResult, movieImageResult] =
    await Promise.all([
      adapter.execute(
        `SELECT id, stageName, imagePath FROM Person
         WHERE space = ? AND imagePath IS NOT NULL;`,
        [EXPORT_IMPORT_SPACE],
      ),
      adapter.execute(
        `SELECT id, title, year, imagePath FROM Movie
         WHERE space = ? AND imagePath IS NOT NULL;`,
        [EXPORT_IMPORT_SPACE],
      ),
      adapter.execute(
        `SELECT si.personId, si.filePath FROM StarImage si
         INNER JOIN Person p ON p.id = si.personId
         WHERE p.space = ?
         ORDER BY si.createdAt ASC;`,
        [EXPORT_IMPORT_SPACE],
      ),
      adapter.execute(
        `SELECT mi.movieId, mi.filePath FROM MovieImage mi
         INNER JOIN Movie m ON m.id = mi.movieId
         WHERE m.space = ?
         ORDER BY mi.createdAt ASC;`,
        [EXPORT_IMPORT_SPACE],
      ),
    ]);

  // Group gallery paths by starId
  const starGalleryMap: Record<string, string[]> = {};
  for (const row of starImageResult.rows) {
    if (!starGalleryMap[row.personId]) starGalleryMap[row.personId] = [];
    if (row.filePath) starGalleryMap[row.personId].push(row.filePath);
  }

  // Group gallery paths by movieId
  const movieGalleryMap: Record<string, string[]> = {};
  for (const row of movieImageResult.rows) {
    if (!movieGalleryMap[row.movieId]) movieGalleryMap[row.movieId] = [];
    if (row.filePath) movieGalleryMap[row.movieId].push(row.filePath);
  }

  const stars: StarMediaRow[] = personResult.rows.map((r: any) => ({
    starId: r.id,
    stageName: r.stageName,
    profilePath: r.imagePath ?? null,
    galleryPaths: starGalleryMap[r.id] ?? [],
  }));

  const movies: MovieMediaRow[] = movieResult.rows.map((r: any) => ({
    movieId: r.id,
    title: r.title,
    year: r.year,
    profilePath: r.imagePath ?? null,
    galleryPaths: movieGalleryMap[r.id] ?? [],
  }));

  return { stars, movies };
};

// Builds the flat list of { sourcePath, destName } pairs.
// destName is the relative path inside the ZIP folder structure.
const buildZipEntries = (
  stars: StarMediaRow[],
  movies: MovieMediaRow[],
): { sourcePath: string; destName: string }[] => {
  const entries: { sourcePath: string; destName: string }[] = [];

  for (const star of stars) {
    const name = sanitizeName(star.stageName);
    const folder = `stars/${name}`;

    if (star.profilePath) {
      const ext = star.profilePath.split('.').pop() ?? 'jpg';
      entries.push({
        sourcePath: toFsPath(star.profilePath),
        destName: `${folder}/${name}_profile.${ext}`,
      });
    }

    star.galleryPaths.forEach((p, i) => {
      const ext = p.split('.').pop() ?? 'jpg';
      entries.push({
        sourcePath: toFsPath(p),
        destName: `${folder}/${name}_gallery_${pad(i + 1)}.${ext}`,
      });
    });
  }

  for (const movie of movies) {
    const name = sanitizeName(movie.title);
    const folder = `movies/${name}_${movie.year}`;

    if (movie.profilePath) {
      const ext = movie.profilePath.split('.').pop() ?? 'jpg';
      entries.push({
        sourcePath: toFsPath(movie.profilePath),
        destName: `${folder}/${name}_${movie.year}_profile.${ext}`,
      });
    }

    movie.galleryPaths.forEach((p, i) => {
      const ext = p.split('.').pop() ?? 'jpg';
      entries.push({
        sourcePath: toFsPath(p),
        destName: `${folder}/${name}_${movie.year}_gallery_${pad(
          i + 1,
        )}.${ext}`,
      });
    });
  }

  return entries;
};

// ─── deleteAll ────────────────────────────────────────────────
// Scoped to the given space only. Schema is preserved.
// Rows belonging to the other space are untouched.
// Order matters — child tables first to avoid FK constraint errors.
const deleteAll = async (space: Space): Promise<void> => {
  const adapter = getDBAdapter();
  await adapter.execute(
    `DELETE FROM StarMovie
     WHERE personId IN (SELECT id FROM Person WHERE space = ?);`,
    [space],
  );
  await adapter.execute(
    `DELETE FROM MovieImage
     WHERE movieId IN (SELECT id FROM Movie WHERE space = ?);`,
    [space],
  );
  await adapter.execute(
    `DELETE FROM StarImage
     WHERE personId IN (SELECT id FROM Person WHERE space = ?);`,
    [space],
  );
  await adapter.execute(
    `DELETE FROM CustomAttribute
     WHERE personId IN (SELECT id FROM Person WHERE space = ?);`,
    [space],
  );
  await adapter.execute('DELETE FROM Movie WHERE space = ?;', [space]);
  await adapter.execute('DELETE FROM Person WHERE space = ?;', [space]);
};

// ─── exportAll ────────────────────────────────────────────────
// Always scoped to the private space.
// Cross-space linking is prevented at the picker level, so a Person's
// StarMovie/StarImage rows always belong to the same space as the
// Person/Movie itself. We scope by joining back to Person/Movie ids.
const exportAll = async (): Promise<void> => {
  const space = EXPORT_IMPORT_SPACE;
  const adapter = getDBAdapter();

  const [personResult, movieResult] = await Promise.all([
    adapter.execute('SELECT * FROM Person WHERE space = ?;', [space]),
    adapter.execute('SELECT * FROM Movie WHERE space = ?;', [space]),
  ]);

  const [customAttrResult, starImageResult, starMovieResult, movieImageResult] =
    await Promise.all([
      adapter.execute(
        `SELECT ca.* FROM CustomAttribute ca
         INNER JOIN Person p ON p.id = ca.personId
         WHERE p.space = ?;`,
        [space],
      ),
      adapter.execute(
        `SELECT si.* FROM StarImage si
         INNER JOIN Person p ON p.id = si.personId
         WHERE p.space = ?;`,
        [space],
      ),
      adapter.execute(
        `SELECT sm.* FROM StarMovie sm
         INNER JOIN Person p ON p.id = sm.personId
         WHERE p.space = ?;`,
        [space],
      ),
      adapter.execute(
        `SELECT mi.* FROM MovieImage mi
         INNER JOIN Movie m ON m.id = mi.movieId
         WHERE m.space = ?;`,
        [space],
      ),
    ]);

  const payload: StarVaultExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    space,
    tables: {
      Person: personResult.rows,
      CustomAttribute: customAttrResult.rows,
      StarImage: starImageResult.rows,
      Movie: movieResult.rows,
      StarMovie: starMovieResult.rows,
      MovieImage: movieImageResult.rows,
    },
  };

  const json = JSON.stringify(payload, null, 2);
  const filename = `starvault-export-${space}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  await Share.share(
    { title: filename, message: json },
    { dialogTitle: `Export StarVault Data (${space})` },
  );
};

// ─── exportMedia ──────────────────────────────────────────────
// Zips all private-space images with structured naming and shares ZIP.
// Skips files that no longer exist on disk (stale DB paths from before
// Step 1 migration). Throws 'NO_MEDIA' if nothing is exportable.
// On Android uses actionViewIntent (FileProvider/content:// URI) to
// avoid the file:// sharing restriction introduced in Android 7+.
const exportMedia = async (): Promise<void> => {
  const { stars, movies } = await collectStructuredMedia();
  const entries = buildZipEntries(stars, movies);

  if (entries.length === 0) {
    throw new Error('NO_MEDIA');
  }

  const date = new Date().toISOString().slice(0, 10);
  const tempDir = `${getCacheDir()}/starvault-media-${date}`;
  const zipPath = getZipPath();

  try {
    // Build temp folder structure with correct named files.
    // Skip any source file that no longer exists on disk — handles stale
    // DB paths (e.g. old rn_image_picker_lib_temp_xxx paths from before
    // the copy-on-pick migration).
    let copiedCount = 0;

    for (const entry of entries) {
      const sourceExists = await ReactNativeBlobUtil.fs.exists(
        entry.sourcePath,
      );
      if (!sourceExists) {
        continue;
      }

      const destPath = `${tempDir}/${entry.destName}`;
      const destFolder = destPath.substring(0, destPath.lastIndexOf('/'));

      const folderExists = await ReactNativeBlobUtil.fs.exists(destFolder);
      if (!folderExists) {
        await ReactNativeBlobUtil.fs.mkdir(destFolder);
      }

      await ReactNativeBlobUtil.fs.cp(entry.sourcePath, destPath);
      copiedCount++;
    }

    // All files were stale — nothing to export
    if (copiedCount === 0) {
      throw new Error('NO_MEDIA');
    }

    // Zip the entire temp folder
    await zip(tempDir, zipPath);

    await RNShare.open({
      url: `file://${zipPath}`,
      type: 'application/zip',
      filename: `starvault-media-${date}`,
      failOnCancel: false,
    });
  } finally {
    // Best-effort cleanup of temp folder and ZIP
    try {
      await ReactNativeBlobUtil.fs.unlink(tempDir);
    } catch {
      /* ignore */
    }
  }
};

// ─── getMediaCount ────────────────────────────────────────────
// Returns count of exportable images — only files that actually exist
// on disk. Used for the summary Alert before export.
const getMediaCount = async (): Promise<number> => {
  const { stars, movies } = await collectStructuredMedia();
  const entries = buildZipEntries(stars, movies);

  let count = 0;
  for (const entry of entries) {
    const exists = await ReactNativeBlobUtil.fs.exists(entry.sourcePath);
    if (exists) count++;
  }
  return count;
};

// ─── getSummary ───────────────────────────────────────────────
// Always scoped to the private space.
const getSummary = async (): Promise<{
  stars: number;
  movies: number;
  links: number;
}> => {
  const space = EXPORT_IMPORT_SPACE;
  const adapter = getDBAdapter();
  const [stars, movies, links] = await Promise.all([
    adapter.execute('SELECT COUNT(*) as count FROM Person WHERE space = ?;', [
      space,
    ]),
    adapter.execute('SELECT COUNT(*) as count FROM Movie WHERE space = ?;', [
      space,
    ]),
    adapter.execute(
      `SELECT COUNT(*) as count FROM StarMovie sm
       INNER JOIN Person p ON p.id = sm.personId
       WHERE p.space = ?;`,
      [space],
    ),
  ]);
  return {
    stars: stars.rows[0]?.count ?? 0,
    movies: movies.rows[0]?.count ?? 0,
    links: links.rows[0]?.count ?? 0,
  };
};

export { deleteAll, exportAll, exportMedia, getMediaCount, getSummary };

export type { StarVaultExport };
