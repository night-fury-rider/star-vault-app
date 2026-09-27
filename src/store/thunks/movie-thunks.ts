import { createAsyncThunk } from '@reduxjs/toolkit';
import { MovieService } from '../../modules/movies/services/MovieService';
import { Movie } from '../../modules/movies/types/movie-types';
import { Space } from '../../modules/stars/types/star-types';
import LoggerService from '../../services/LoggerService';

export const fetchAllMovies = createAsyncThunk(
  'movies/fetchAll',
  async (space: Space, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: fetchAllMovies start:', space);
      const movies = await MovieService.getAllMovies(space);
      LoggerService.log('🎬 Thunk: fetchAllMovies result:', movies.length);
      return movies;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: fetchAllMovies error:', e);
      return rejectWithValue(e?.message ?? 'Failed to fetch movies');
    }
  },
);

export const createMovie = createAsyncThunk(
  'movies/create',
  async (movie: Movie, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: createMovie start:', movie.title);
      await MovieService.createMovie(movie);
      LoggerService.log('🎬 Thunk: createMovie done');
      return movie;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: createMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to create movie');
    }
  },
);

export const updateMovie = createAsyncThunk(
  'movies/update',
  async (movie: Movie, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: updateMovie start:', movie.id);
      await MovieService.updateMovie(movie);
      LoggerService.log('🎬 Thunk: updateMovie done');
      return movie;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: updateMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to update movie');
    }
  },
);

export const deleteMovie = createAsyncThunk(
  'movies/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: deleteMovie start:', id);
      await MovieService.deleteMovie(id);
      LoggerService.log('🎬 Thunk: deleteMovie done');
      return id;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: deleteMovie error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete movie');
    }
  },
);
