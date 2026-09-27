import { createAsyncThunk } from '@reduxjs/toolkit';
import { StarService } from '../../modules/stars/services/StarService';
import { GalleryMedia } from '../../navigation/navigation-types';
import LoggerService from '../../services/LoggerService';

export const fetchGallery = createAsyncThunk(
  'gallery/fetch',
  async (starId: string, { rejectWithValue }) => {
    try {
      LoggerService.log('🎬 Thunk: fetchGallery for star:', starId);
      const media = await StarService.getGallery(starId);
      LoggerService.log('🎬 Thunk: fetchGallery result:', media.length);
      return { starId, media };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: fetchGallery error:', e);
      return rejectWithValue(e?.message ?? 'Failed to fetch gallery');
    }
  },
);

export const addMedia = createAsyncThunk(
  'gallery/add',
  async (
    { starId, media }: { starId: string; media: GalleryMedia },
    { rejectWithValue },
  ) => {
    try {
      LoggerService.log('🎬 Thunk: addMedia', media.type, 'for star:', starId);
      await StarService.addMedia(starId, media);
      LoggerService.log('🎬 Thunk: addMedia done');
      return { starId, media };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: addMedia error:', e);
      return rejectWithValue(e?.message ?? 'Failed to add media');
    }
  },
);

export const deleteMedia = createAsyncThunk(
  'gallery/delete',
  async (
    { starId, mediaId }: { starId: string; mediaId: string },
    { rejectWithValue },
  ) => {
    try {
      LoggerService.log('🎬 Thunk: deleteMedia:', mediaId);
      await StarService.deleteMedia(mediaId);
      LoggerService.log('🎬 Thunk: deleteMedia done');
      return { starId, mediaId };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: deleteMedia error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete media');
    }
  },
);

export const deleteMediaBatch = createAsyncThunk(
  'gallery/deleteBatch',
  async (
    { starId, mediaIds }: { starId: string; mediaIds: string[] },
    { rejectWithValue },
  ) => {
    try {
      LoggerService.log('🎬 Thunk: deleteMediaBatch:', mediaIds.length);
      await StarService.deleteMediaBatch(mediaIds);
      LoggerService.log('🎬 Thunk: deleteMediaBatch done');
      return { starId, mediaIds };
    } catch (e: any) {
      LoggerService.error('❌ Thunk: deleteMediaBatch error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete media');
    }
  },
);
