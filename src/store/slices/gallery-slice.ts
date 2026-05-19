import { createSlice } from '@reduxjs/toolkit';
import { GalleryMedia } from '../../navigation/navigation-types';
import {
  fetchGallery,
  addMedia,
  deleteMedia,
  deleteMediaBatch,
} from '../thunks/gallery-thunks';

interface GalleryState {
  mediaByStarId: Record<string, GalleryMedia[]>;
  loading: boolean;
  error: string | null;
}

const initialState: GalleryState = {
  mediaByStarId: {},
  loading: false,
  error: null,
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Fetch
    builder.addCase(fetchGallery.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGallery.fulfilled, (state, action) => {
      state.loading = false;
      state.mediaByStarId[action.payload.starId] = action.payload.media;
    });
    builder.addCase(fetchGallery.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add
    builder.addCase(addMedia.fulfilled, (state, action) => {
      const { starId, media } = action.payload;
      const existing = state.mediaByStarId[starId] || [];
      state.mediaByStarId[starId] = [media, ...existing];
    });

    // Delete one
    builder.addCase(deleteMedia.fulfilled, (state, action) => {
      const { starId, mediaId } = action.payload;
      const existing = state.mediaByStarId[starId] || [];
      state.mediaByStarId[starId] = existing.filter(m => m.id !== mediaId);
    });

    // Delete batch
    builder.addCase(deleteMediaBatch.fulfilled, (state, action) => {
      const { starId, mediaIds } = action.payload;
      const ids = new Set(mediaIds);
      const existing = state.mediaByStarId[starId] || [];
      state.mediaByStarId[starId] = existing.filter(m => !ids.has(m.id));
    });
  },
});

export default gallerySlice.reducer;
