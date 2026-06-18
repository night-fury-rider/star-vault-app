import { createSlice } from '@reduxjs/toolkit';
import { GalleryMedia } from '../../navigation/navigation-types';
import {
  fetchMovieGallery,
  addMovieMedia,
  deleteMovieMedia,
  deleteMovieMediaBatch,
} from '../thunks/movie-gallery-thunks';

interface MovieGalleryState {
  mediaByMovieId: Record<string, GalleryMedia[]>;
  loading: boolean;
  error: string | null;
}

const initialState: MovieGalleryState = {
  mediaByMovieId: {},
  loading: false,
  error: null,
};

const movieGallerySlice = createSlice({
  name: 'movieGallery',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Fetch
    builder.addCase(fetchMovieGallery.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMovieGallery.fulfilled, (state, action) => {
      state.loading = false;
      state.mediaByMovieId[action.payload.movieId] = action.payload.media;
    });
    builder.addCase(fetchMovieGallery.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add
    builder.addCase(addMovieMedia.fulfilled, (state, action) => {
      const { movieId, media } = action.payload;
      const existing = state.mediaByMovieId[movieId] || [];
      state.mediaByMovieId[movieId] = [media, ...existing];
    });

    // Delete one
    builder.addCase(deleteMovieMedia.fulfilled, (state, action) => {
      const { movieId, mediaId } = action.payload;
      const existing = state.mediaByMovieId[movieId] || [];
      state.mediaByMovieId[movieId] = existing.filter(m => m.id !== mediaId);
    });

    // Delete batch
    builder.addCase(deleteMovieMediaBatch.fulfilled, (state, action) => {
      const { movieId, mediaIds } = action.payload;
      const ids = new Set(mediaIds);
      const existing = state.mediaByMovieId[movieId] || [];
      state.mediaByMovieId[movieId] = existing.filter(m => !ids.has(m.id));
    });
  },
});

export default movieGallerySlice.reducer;
