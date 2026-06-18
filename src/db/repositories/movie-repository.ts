import { DBAdapter } from '../adapter/db-adapter';
import { Movie, MovieCast } from '../../modules/movies/types/movie-types';

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
          imagePath, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          movie.id,
          movie.title,
          movie.year,
          movie.genre ?? null,
          movie.director ?? null,
          movie.synopsis ?? null,
          movie.imagePath ?? null,
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

  // ─── READ ALL ─────────────────────────────────────────────
  async findAll(): Promise<Movie[]> {
    console.log('💾 MovieRepo.findAll');
    const result = await this.adapter.execute(
      `SELECT * FROM Movie ORDER BY year DESC, title ASC;`,
    );

    console.log('💾 MovieRepo.findAll rows:', result.rows?.length);

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    const movies: Movie[] = await Promise.all(
      result.rows.map(async row => {
        const cast = await this.findCast(row.id);
        return this.mapRowToMovie(row, cast);
      }),
    );

    return movies;
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
    return this.mapRowToMovie(result.rows[0], cast);
  }

  // ─── UPDATE ───────────────────────────────────────────────
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

      // Replace cast
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
    });
  }

  // ─── DELETE ───────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    await this.adapter.execute(`DELETE FROM Movie WHERE id = ?;`, [id]);
  }

  // ─── SEARCH ───────────────────────────────────────────────
  async search(query: string): Promise<Movie[]> {
    const like = `%${query}%`;
    const result = await this.adapter.execute(
      `SELECT * FROM Movie
       WHERE title LIKE ?
          OR director LIKE ?
          OR genre LIKE ?
          OR synopsis LIKE ?
       ORDER BY year DESC, title ASC;`,
      [like, like, like, like],
    );

    const movies: Movie[] = await Promise.all(
      result.rows.map(async row => {
        const cast = await this.findCast(row.id);
        return this.mapRowToMovie(row, cast);
      }),
    );

    return movies;
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────
  private async findCast(movieId: string): Promise<MovieCast[]> {
    const result = await this.adapter.execute(
      `SELECT sm.id, sm.personId, sm.role, p.stageName
       FROM StarMovie sm
       LEFT JOIN Person p ON p.id = sm.personId
       WHERE sm.movieId = ?;`,
      [movieId],
    );
    return result.rows.map(row => ({
      id: row.id,
      personId: row.personId,
      stageName: row.stageName ?? 'Unknown',
      role: row.role ?? undefined,
    }));
  }

  private mapRowToMovie(row: any, cast: MovieCast[]): Movie {
    return {
      id: row.id,
      title: row.title,
      year: row.year,
      genre: row.genre ?? undefined,
      director: row.director ?? undefined,
      synopsis: row.synopsis ?? undefined,
      imagePath: row.imagePath ?? undefined,
      cast,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
