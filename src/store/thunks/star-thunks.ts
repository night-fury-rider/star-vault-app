import { createAsyncThunk } from '@reduxjs/toolkit';
import { StarService } from '../../modules/stars/services/StarService';
import { Star, Space } from '../../modules/stars/types/star-types';

export const fetchAllStars = createAsyncThunk(
  'stars/fetchAll',
  async (space: Space, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: fetchAllStars start:', space);
      const stars = await StarService.getAllStars(space);
      console.log('🎬 Thunk: fetchAllStars result:', stars.length);
      return stars;
    } catch (e: any) {
      console.error('❌ Thunk: fetchAllStars error:', e);
      return rejectWithValue(e?.message ?? 'Failed to fetch stars');
    }
  },
);

export const createStar = createAsyncThunk(
  'stars/create',
  async (star: Star, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: createStar start:', star.stageName);
      await StarService.createStar(star);
      console.log('🎬 Thunk: createStar SQLite write done');
      return star;
    } catch (e: any) {
      console.error('❌ Thunk: createStar error:', e);
      console.error('❌ Thunk: createStar error message:', e?.message);
      console.error('❌ Thunk: createStar error stack:', e?.stack);
      return rejectWithValue(e?.message ?? 'Failed to create star');
    }
  },
);

export const updateStar = createAsyncThunk(
  'stars/update',
  async (star: Star, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: updateStar start:', star.id);
      await StarService.updateStar(star);
      console.log('🎬 Thunk: updateStar done');
      return star;
    } catch (e: any) {
      console.error('❌ Thunk: updateStar error:', e);
      return rejectWithValue(e?.message ?? 'Failed to update star');
    }
  },
);

export const deleteStar = createAsyncThunk(
  'stars/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: deleteStar start:', id);
      await StarService.deleteStar(id);
      console.log('🎬 Thunk: deleteStar done');
      return id;
    } catch (e: any) {
      console.error('❌ Thunk: deleteStar error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete star');
    }
  },
);
