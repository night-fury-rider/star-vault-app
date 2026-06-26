import { createSlice } from '@reduxjs/toolkit';
import { Movie } from '../../modules/movies/types/movie-types';
import { fetchStarMovies, addStarMovie, removeStarMovie } from '../thunks/star-movie-thunks';

interface StarMoviesState {
  moviesByStarId: Record<string, (Movie & { role?: string })[]>;
  loading: boolean;
  error: string | null;
}

const initialState: StarMoviesState = {
  moviesByStarId: {},
  loading: false,
  error: null,
};

const starMoviesSlice = createSlice({
  name: 'starMovies',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Fetch
    builder.addCase(fetchStarMovies.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStarMovies.fulfilled, (state, action) => {
      state.loading = false;
      state.moviesByStarId[action.payload.starId] = action.payload.movies;
    });
    builder.addCase(fetchStarMovies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add
    builder.addCase(addStarMovie.fulfilled, (state, action) => {
      const { starId, movie } = action.payload;
      const existing = state.moviesByStarId[starId] || [];
      // Avoid duplicates in Redux state
      if (!existing.find(m => m.id === movie.id)) {
        state.moviesByStarId[starId] = [...existing, movie].sort(
          (a, b) => b.year - a.year || a.title.localeCompare(b.title),
        );
      }
    });

    // Remove
    builder.addCase(removeStarMovie.fulfilled, (state, action) => {
      const { starId, movieId } = action.payload;
      const existing = state.moviesByStarId[starId] || [];
      state.moviesByStarId[starId] = existing.filter(m => m.id !== movieId);
    });
  },
});

export default starMoviesSlice.reducer;
