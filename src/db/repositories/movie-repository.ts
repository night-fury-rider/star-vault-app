import { DBAdapter } from '../adapter/db-adapter';
import {
  Movie,
  MovieCast,
  MovieCustomAttribute,
} from '../../modules/movies/types/movie-types';
import { Space } from '../../modules/stars/types/star-types';

export class MovieRepository {
  private adapter: DBAdapter;

  constructor(adapter: DBAdapter) {
    this.adapter = adapter;
  }

  // ─── CREATE ───────────────────────────────────────────────
  async insert(movie: Movie): Promise<void> {
    await this.adapter.transaction(async tx => {
      await tx.execute(
        `INSERT INTO Movie (
          id, title, year, genre, director, synopsis,
          imagePath, space, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          movie.id,
          movie.title,
          movie.year,
          movie.genre ?? null,
          movie.director ?? null,
          movie.synopsis ?? null,
          movie.imagePath ?? null,
          movie.space,
          movie.createdAt,
          movie.updatedAt,
        ],
      );

      if (movie.cast && movie.cast.length > 0) {
        for (const member of movie.cast) {
          await tx.execute(
            `INSERT INTO StarMovie (id, personId, movieId, role)
             VALUES (?, ?, ?, ?);`,
            [member.id, member.personId, movie.id, member.role ?? null],
          );
        }
      }
    });
  }

  // ─── READ ALL (scoped to a space) ──────────────────────────
  async findAll(space: Space): Promise<Movie[]> {
    const result = await this.adapter.execute(
      `SELECT * FROM Movie WHERE space = ? ORDER BY year DESC, title ASC;`,
      [space],
    );

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    const movieIds = result.rows.map((r: any) => r.id as string);
    const placeholders = movieIds.map(() => '?').join(', ');

    // Bulk-load cast for all movies in one query
    const castResult = await this.adapter.execute(
      `SELECT sm.id, sm.personId, sm.movieId, sm.role, p.stageName, p.imagePath
       FROM StarMovie sm
       LEFT JOIN Person p ON p.id = sm.personId
       WHERE sm.movieId IN (${placeholders});`,
      movieIds,
    );

    // Bulk-load custom attributes for all movies in one query
    const attrResult = await this.adapter.execute(
      `SELECT * FROM MovieCustomAttribute WHERE movieId IN (${placeholders});`,
      movieIds,
    );

    // Group cast by movieId
    const castByMovieId: Record<string, MovieCast[]> = {};
    for (const row of castResult.rows) {
      if (!castByMovieId[row.movieId]) {
        castByMovieId[row.movieId] = [];
      }
      castByMovieId[row.movieId].push({
        id: row.id,
        personId: row.personId,
        imagePath: row.imagePath ?? undefined,
        stageName: row.stageName ?? 'Unknown',
        role: row.role ?? undefined,
      });
    }

    // Group attributes by movieId
    const attrByMovieId: Record<string, MovieCustomAttribute[]> = {};
    for (const row of attrResult.rows) {
      if (!attrByMovieId[row.movieId]) {
        attrByMovieId[row.movieId] = [];
      }
      attrByMovieId[row.movieId].push({
        id: row.id,
        key: row.key,
        value: row.value,
      });
    }

    return result.rows.map(row =>
      this.mapRowToMovie(
        row,
        castByMovieId[row.id] ?? [],
        attrByMovieId[row.id] ?? [],
      ),
    );
  }

  // ─── READ ONE ─────────────────────────────────────────────
  async findById(id: string): Promise<Movie | null> {
    const result = await this.adapter.execute(
      `SELECT * FROM Movie WHERE id = ?;`,
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const cast = await this.findCast(id);
    const customAttributes = await this.findCustomAttributes(id);
    return this.mapRowToMovie(result.rows[0], cast, customAttributes);
  }

  // ─── UPDATE (space is immutable — not part of SET) ─────────
  async update(movie: Movie): Promise<void> {
    await this.adapter.transaction(async tx => {
      await tx.execute(
        `UPDATE Movie SET
          title = ?,
          year = ?,
          genre = ?,
          director = ?,
          synopsis = ?,
          imagePath = ?,
          updatedAt = ?
        WHERE id = ?;`,
        [
          movie.title,
          movie.year,
          movie.genre ?? null,
          movie.director ?? null,
          movie.synopsis ?? null,
          movie.imagePath ?? null,
          movie.updatedAt,
          movie.id,
        ],
      );

      await tx.execute(`DELETE FROM StarMovie WHERE movieId = ?;`, [movie.id]);

      if (movie.cast && movie.cast.length > 0) {
        for (const member of movie.cast) {
          await tx.execute(
            `INSERT INTO StarMovie (id, personId, movieId, role)
             VALUES (?, ?, ?, ?);`,
            [member.id, member.personId, movie.id, member.role ?? null],
          );
        }
      }

      await tx.execute(`DELETE FROM MovieCustomAttribute WHERE movieId = ?;`, [
        movie.id,
      ]);

      if (movie.customAttributes && movie.customAttributes.length > 0) {
        for (const attr of movie.customAttributes) {
          await tx.execute(
            `INSERT INTO MovieCustomAttribute (id, movieId, key, value)
             VALUES (?, ?, ?, ?);`,
            [attr.id, movie.id, attr.key, attr.value],
          );
        }
      }
    });
  }

  // ─── DELETE ───────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    await this.adapter.execute(`DELETE FROM Movie WHERE id = ?;`, [id]);
  }

  // ─── SEARCH (scoped to a space) ────────────────────────────
  async search(query: string, space: Space): Promise<Movie[]> {
    const like = `%${query}%`;
    const result = await this.adapter.execute(
      `SELECT * FROM Movie
       WHERE space = ?
         AND (title LIKE ? OR director LIKE ? OR genre LIKE ? OR synopsis LIKE ?)
       ORDER BY year DESC, title ASC;`,
      [space, like, like, like, like],
    );

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    const movieIds = result.rows.map((r: any) => r.id as string);
    const placeholders = movieIds.map(() => '?').join(', ');

    const castResult = await this.adapter.execute(
      `SELECT sm.id, sm.personId, sm.movieId, sm.role, p.stageName, p.imagePath
       FROM StarMovie sm
       LEFT JOIN Person p ON p.id = sm.personId
       WHERE sm.movieId IN (${placeholders});`,
      movieIds,
    );

    const attrResult = await this.adapter.execute(
      `SELECT * FROM MovieCustomAttribute WHERE movieId IN (${placeholders});`,
      movieIds,
    );

    const castByMovieId: Record<string, MovieCast[]> = {};
    for (const row of castResult.rows) {
      if (!castByMovieId[row.movieId]) castByMovieId[row.movieId] = [];
      castByMovieId[row.movieId].push({
        id: row.id,
        personId: row.personId,
        imagePath: row.imagePath ?? undefined,
        stageName: row.stageName ?? 'Unknown',
        role: row.role ?? undefined,
      });
    }

    const attrByMovieId: Record<string, MovieCustomAttribute[]> = {};
    for (const row of attrResult.rows) {
      if (!attrByMovieId[row.movieId]) attrByMovieId[row.movieId] = [];
      attrByMovieId[row.movieId].push({
        id: row.id,
        key: row.key,
        value: row.value,
      });
    }

    return result.rows.map(row =>
      this.mapRowToMovie(
        row,
        castByMovieId[row.id] ?? [],
        attrByMovieId[row.id] ?? [],
      ),
    );
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────
  private async findCustomAttributes(
    movieId: string,
  ): Promise<MovieCustomAttribute[]> {
    const result = await this.adapter.execute(
      `SELECT * FROM MovieCustomAttribute WHERE movieId = ?;`,
      [movieId],
    );
    return result.rows.map(row => ({
      id: row.id,
      key: row.key,
      value: row.value,
    }));
  }

  private async findCast(movieId: string): Promise<MovieCast[]> {
    const result = await this.adapter.execute(
      `SELECT sm.id, sm.personId, sm.role, p.stageName, p.imagePath
        FROM StarMovie sm
        LEFT JOIN Person p ON p.id = sm.personId
        WHERE sm.movieId = ?;`,
      [movieId],
    );
    return result.rows.map(row => ({
      id: row.id,
      personId: row.personId,
      imagePath: row.imagePath ?? undefined,
      stageName: row.stageName ?? 'Unknown',
      role: row.role ?? undefined,
    }));
  }

  private mapRowToMovie(
    row: any,
    cast: MovieCast[],
    customAttributes: MovieCustomAttribute[] = [],
  ): Movie {
    return {
      id: row.id,
      title: row.title,
      year: row.year,
      genre: row.genre ?? undefined,
      director: row.director ?? undefined,
      synopsis: row.synopsis ?? undefined,
      imagePath: row.imagePath ?? undefined,
      cast,
      customAttributes,
      space: (row.space ?? 'private') as Space,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
