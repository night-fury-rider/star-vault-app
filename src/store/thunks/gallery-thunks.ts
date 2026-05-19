import { createAsyncThunk } from '@reduxjs/toolkit';
import { StarService } from '../../modules/stars/services/StarService';
import { GalleryMedia } from '../../navigation/navigation-types';

export const fetchGallery = createAsyncThunk(
  'gallery/fetch',
  async (starId: string, { rejectWithValue }) => {
    try {
      console.log('🎬 Thunk: fetchGallery for star:', starId);
      const media = await StarService.getGallery(starId);
      console.log('🎬 Thunk: fetchGallery result:', media.length);
      return { starId, media };
    } catch (e: any) {
      console.error('❌ Thunk: fetchGallery error:', e);
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
      console.log('🎬 Thunk: addMedia', media.type, 'for star:', starId);
      await StarService.addMedia(starId, media);
      console.log('🎬 Thunk: addMedia done');
      return { starId, media };
    } catch (e: any) {
      console.error('❌ Thunk: addMedia error:', e);
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
      console.log('🎬 Thunk: deleteMedia:', mediaId);
      await StarService.deleteMedia(mediaId);
      console.log('🎬 Thunk: deleteMedia done');
      return { starId, mediaId };
    } catch (e: any) {
      console.error('❌ Thunk: deleteMedia error:', e);
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
      console.log('🎬 Thunk: deleteMediaBatch:', mediaIds.length);
      await StarService.deleteMediaBatch(mediaIds);
      console.log('🎬 Thunk: deleteMediaBatch done');
      return { starId, mediaIds };
    } catch (e: any) {
      console.error('❌ Thunk: deleteMediaBatch error:', e);
      return rejectWithValue(e?.message ?? 'Failed to delete media');
    }
  },
);
