import { createAsyncThunk } from '@reduxjs/toolkit';
import { MovieService } from '../../modules/movies/services/MovieService';
import { GalleryMedia } from '../../navigation/navigation-types';
import LoggerService from '../../services/LoggerService';

export const fetchMovieGallery = createAsyncThunk(
  'movieGallery/fetch',
  async (movieId: string, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: fetchMovieGallery for movie:', movieId);
      const media = await MovieService.getGallery(movieId);
      LoggerService.log('🎬 Thunk: fetchMovieGallery result:', media.length);
      return { movieId, media };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: fetchMovieGallery error:', e);
      return rejectWithValue(e?.message ?? 'Failed to fetch gallery');
    }
  },
);

export const addMovieMedia = createAsyncThunk(
  'movieGallery/add',
  async (
    { movieId, media }: { movieId: string; media: GalleryMedia },
    { rejectWithValue },
  ) => {
    try {
      LoggerService.log(
        '🎬 Thunk: addMovieMedia',
        media.type,
        'for movie:',
        movieId,
      );
      await MovieService.addMedia(movieId, media);
      LoggerService.log('🎬 Thunk: addMovieMedia done');
      return { movieId, media };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: addMovieMedia error:', e);
      return rejectWithValue(e?.message ?? 'Failed to add media');
    }
  },
);

export const deleteMovieMedia = createAsyncThunk(
  'movieGallery/delete',
  async (
    { movieId, mediaId }: { movieId: string; mediaId: string },
    { rejectWithValue },
  ) => {
    try {
      LoggerService.log('🎬 Thunk: deleteMovieMedia:', mediaId);
      await MovieService.deleteMedia(mediaId);
      LoggerService.log('🎬 Thunk: deleteMovieMedia done');
      return { movieId, mediaId };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: deleteMovieMedia error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete media');
    }
  },
);

export const deleteMovieMediaBatch = createAsyncThunk(
  'movieGallery/deleteBatch',
  async (
    { movieId, mediaIds }: { movieId: string; mediaIds: string[] },
    { rejectWithValue },
  ) => {
    try {
      LoggerService.log('🎬 Thunk: deleteMovieMediaBatch:', mediaIds.length);
      await MovieService.deleteMediaBatch(mediaIds);
      LoggerService.log('🎬 Thunk: deleteMovieMediaBatch done');
      return { movieId, mediaIds };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: deleteMovieMediaBatch error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete media');
    }
  },
);
