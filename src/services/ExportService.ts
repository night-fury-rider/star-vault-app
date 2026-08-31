import { Share } from 'react-native';
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

export const ExportService = {
  // ─── Export — always scoped to the private space ─────────
  // Cross-space linking is prevented at the picker level, so a Person's
  // StarMovie/StarImage rows always belong to the same space as the
  // Person/Movie itself. We scope by joining back to Person/Movie ids.
  async exportAll(space: Space): Promise<void> {
    const adapter = getDBAdapter();

    const [personResult, movieResult] = await Promise.all([
      adapter.execute('SELECT * FROM Person WHERE space = ?;', [space]),
      adapter.execute('SELECT * FROM Movie WHERE space = ?;', [space]),
    ]);

    const [
      customAttrResult,
      starImageResult,
      starMovieResult,
      movieImageResult,
    ] = await Promise.all([
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
  },

  // ─── Summary — always scoped to the private space ────────
  async getSummary(space: Space): Promise<{
    stars: number;
    movies: number;
    links: number;
  }> {
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
  },

  // ─── Delete — scoped to the given space only ─────────────
  // Schema is preserved. Rows belonging to the other space are untouched.
  async deleteAll(space: Space): Promise<void> {
    const adapter = getDBAdapter();
    // Order matters — child tables first to avoid FK constraint errors
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
  },
};
