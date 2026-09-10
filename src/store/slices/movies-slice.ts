import { createSlice } from '@reduxjs/toolkit';
import { Movie } from '../../modules/movies/types/movie-types';
import {
  fetchAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../thunks/movie-thunks';

interface MoviesState {
  list: Movie[];
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  list: [],
  loading: false,
  error: null,
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Fetch all
    builder.addCase(fetchAllMovies.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllMovies.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(fetchAllMovies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createMovie.fulfilled, (state, action) => {
      state.list = [...state.list, action.payload].sort(
        (a, b) => b.year - a.year,
      );
    });

    // Update
    builder.addCase(updateMovie.fulfilled, (state, action) => {
      const index = state.list.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
        state.list = [...state.list].sort((a, b) => b.year - a.year);
      }
    });

    // Delete
    builder.addCase(deleteMovie.fulfilled, (state, action) => {
      state.list = state.list.filter(m => m.id !== action.payload);
    });
  },
});

export default moviesSlice.reducer;
