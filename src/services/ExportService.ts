import { Share } from 'react-native';
import { getDBAdapter } from '../db/db-provider';

// ─── Export shape ─────────────────────────────────────────────
// Every table is exported as a flat array of row objects.
// On import, these arrays are inserted back in dependency order.
export interface StarVaultExport {
  version: 1;
  exportedAt: string;
  tables: {
    Person: any[];
    CustomAttribute: any[];
    StarImage: any[];
    Movie: any[];
    StarMovie: any[];
    MovieImage: any[];
  };
}

export const ExportService = {
  async exportAll(): Promise<void> {
    const adapter = getDBAdapter();

    const [
      personResult,
      customAttrResult,
      starImageResult,
      movieResult,
      starMovieResult,
      movieImageResult,
    ] = await Promise.all([
      adapter.execute('SELECT * FROM Person;'),
      adapter.execute('SELECT * FROM CustomAttribute;'),
      adapter.execute('SELECT * FROM StarImage;'),
      adapter.execute('SELECT * FROM Movie;'),
      adapter.execute('SELECT * FROM StarMovie;'),
      adapter.execute('SELECT * FROM MovieImage;'),
    ]);

    const payload: StarVaultExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
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
    const filename = `starvault-export-${new Date().toISOString().slice(0, 10)}.json`;

    await Share.share(
      {
        title: filename,
        message: json,
      },
      {
        dialogTitle: 'Export StarVault Data',
      },
    );
  },

  // ─── Summary for the user before exporting ───────────────
  async getSummary(): Promise<{ stars: number; movies: number; links: number }> {
    const adapter = getDBAdapter();
    const [stars, movies, links] = await Promise.all([
      adapter.execute('SELECT COUNT(*) as count FROM Person;'),
      adapter.execute('SELECT COUNT(*) as count FROM Movie;'),
      adapter.execute('SELECT COUNT(*) as count FROM StarMovie;'),
    ]);
    return {
      stars: stars.rows[0]?.count ?? 0,
      movies: movies.rows[0]?.count ?? 0,
      links: links.rows[0]?.count ?? 0,
    };
  },
};
