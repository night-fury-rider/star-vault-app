import { configureStore } from '@reduxjs/toolkit';
import starsReducer from './slices/stars-slice';
import moviesReducer from './slices/movies-slice';
import galleryReducer from './slices/gallery-slice';
import accessReducer from './slices/access-slice';

export const store = configureStore({
  reducer: {
    stars: starsReducer,
    movies: moviesReducer,
    gallery: galleryReducer,
    access: accessReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
