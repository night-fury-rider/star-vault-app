import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDBAdapter } from '../../db/db-provider';
import { Movie } from '../../modules/movies/types/movie-types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Fetch all movies linked to a star ───────────────────────
export const fetchStarMovies = createAsyncThunk(
  'starMovies/fetch',
  async (starId: string, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: fetchStarMovies for star:', starId);
      const adapter = getDBAdapter();
      const result = await adapter.execute(
        `SELECT m.*, sm.role
         FROM Movie m
         INNER JOIN StarMovie sm ON sm.movieId = m.id
         WHERE sm.personId = ?
         ORDER BY m.year DESC, m.title ASC;`,
        [starId],
      );
      const movies: (Movie & { role?: string })[] = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        year: row.year,
        genre: row.genre ?? undefined,
        director: row.director ?? undefined,
        synopsis: row.synopsis ?? undefined,
        imagePath: row.imagePath ?? undefined,
        cast: [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        role: row.role ?? undefined,
      }));
      console.log('🎬 Thunk: fetchStarMovies result:', movies.length);
      return { starId, movies };
    } catch (e: any) {
      console.error('❌ Thunk: fetchStarMovies error:', e);
      return rejectWithValue(e?.message ?? 'Failed to fetch star movies');
    }
  },
);

// ─── Link a movie to a star ───────────────────────────────────
export const addStarMovie = createAsyncThunk(
  'starMovies/add',
  async (
    { starId, movie, role }: { starId: string; movie: Movie; role?: string },
    { rejectWithValue },
  ) => {
    try {
      console.log('🎬 Thunk: addStarMovie', movie.id, 'for star:', starId);
      const adapter = getDBAdapter();
      // Check if link already exists
      const existing = await adapter.execute(
        `SELECT id FROM StarMovie WHERE personId = ? AND movieId = ?;`,
        [starId, movie.id],
      );
      if (existing.rows.length === 0) {
        await adapter.execute(
          `INSERT INTO StarMovie (id, personId, movieId, role) VALUES (?, ?, ?, ?);`,
          [uuidv4(), starId, movie.id, role ?? null],
        );
      }
      console.log('🎬 Thunk: addStarMovie done');
      return { starId, movie: { ...movie, role } };
    } catch (e: any) {
      console.error('❌ Thunk: addStarMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to add movie to star');
    }
  },
);

// ─── Unlink a movie from a star ───────────────────────────────
export const removeStarMovie = createAsyncThunk(
  'starMovies/remove',
  async (
    { starId, movieId }: { starId: string; movieId: string },
    { rejectWithValue },
  ) => {
    try {
      console.log('🎬 Thunk: removeStarMovie', movieId, 'from star:', starId);
      const adapter = getDBAdapter();
      await adapter.execute(
        `DELETE FROM StarMovie WHERE personId = ? AND movieId = ?;`,
        [starId, movieId],
      );
      console.log('🎬 Thunk: removeStarMovie done');
      return { starId, movieId };
    } catch (e: any) {
      console.error('❌ Thunk: removeStarMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to remove movie from star');
    }
  },
);
