import { createAsyncThunk } from '@reduxjs/toolkit';
import { MovieService } from '../../modules/movies/services/MovieService';
import { Movie } from '../../modules/movies/types/movie-types';

export const fetchAllMovies = createAsyncThunk(
  'movies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: fetchAllMovies start');
      const movies = await MovieService.getAllMovies();
      console.log('🎬 Thunk: fetchAllMovies result:', movies.length);
      return movies;
    } catch (e: any) {
      console.error('❌ Thunk: fetchAllMovies error:', e);
      return rejectWithValue(e?.message ?? 'Failed to fetch movies');
    }
  },
);

export const createMovie = createAsyncThunk(
  'movies/create',
  async (movie: Movie, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: createMovie start:', movie.title);
      await MovieService.createMovie(movie);
      console.log('🎬 Thunk: createMovie done');
      return movie;
    } catch (e: any) {
      console.error('❌ Thunk: createMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to create movie');
    }
  },
);

export const updateMovie = createAsyncThunk(
  'movies/update',
  async (movie: Movie, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: updateMovie start:', movie.id);
      await MovieService.updateMovie(movie);
      console.log('🎬 Thunk: updateMovie done');
      return movie;
    } catch (e: any) {
      console.error('❌ Thunk: updateMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to update movie');
    }
  },
);

export const deleteMovie = createAsyncThunk(
  'movies/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: deleteMovie start:', id);
      await MovieService.deleteMovie(id);
      console.log('🎬 Thunk: deleteMovie done');
      return id;
    } catch (e: any) {
      console.error('❌ Thunk: deleteMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete movie');
    }
  },
);
