import { createAsyncThunk } from '@reduxjs/toolkit';
import { StarService } from '../../modules/stars/services/StarService';
import { Star, Space } from '../../modules/stars/types/star-types';
import LoggerService from '../../services/LoggerService';

export const fetchAllStars = createAsyncThunk(
  'stars/fetchAll',
  async (space: Space, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: fetchAllStars start:', space);
      const stars = await StarService.getAllStars(space);
      LoggerService.log('🎬 Thunk: fetchAllStars result:', stars.length);
      return stars;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: fetchAllStars error:', e);
      return rejectWithValue(e?.message ?? 'Failed to fetch stars');
    }
  },
);

export const createStar = createAsyncThunk(
  'stars/create',
  async (star: Star, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: createStar start:', star.stageName);
      await StarService.createStar(star);
      LoggerService.log('🎬 Thunk: createStar SQLite write done');
      return star;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: createStar error:', e);
      LoggerService.error('❌ Thunk: createStar error message:', e?.message);
      LoggerService.error('❌ Thunk: createStar error stack:', e?.stack);
      return rejectWithValue(e?.message ?? 'Failed to create star');
    }
  },
);

export const updateStar = createAsyncThunk(
  'stars/update',
  async (star: Star, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: updateStar start:', star.id);
      await StarService.updateStar(star);
      LoggerService.log('🎬 Thunk: updateStar done');
      return star;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: updateStar error:', e);
      return rejectWithValue(e?.message ?? 'Failed to update star');
    }
  },
);

export const deleteStar = createAsyncThunk(
  'stars/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: deleteStar start:', id);
      await StarService.deleteStar(id);
      LoggerService.log('🎬 Thunk: deleteStar done');
      return id;
    } catch (e: any) {
      LoggerService.error('❌ Thunk: deleteStar error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete star');
    }
  },
);
