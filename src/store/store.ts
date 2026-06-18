import { configureStore } from '@reduxjs/toolkit';
import starsReducer from './slices/stars-slice';
import moviesReducer from './slices/movies-slice';
import galleryReducer from './slices/gallery-slice';
import accessReducer from './slices/access-slice';
import movieGalleryReducer from './slices/movie-gallery-slice';

export const store = configureStore({
  reducer: {
    stars: starsReducer,
    movies: moviesReducer,
    gallery: galleryReducer,
    access: accessReducer,
    movieGallery: movieGalleryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
