import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Movie {
  id: string;
  title: string;
  year: number;
  createdAt: string;
}

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
  reducers: {
    setMovies(state, action: PayloadAction<Movie[]>) {
      state.list = action.payload;
    },
    addMovie(state, action: PayloadAction<Movie>) {
      state.list.unshift(action.payload);
    },
    updateMovie(state, action: PayloadAction<Movie>) {
      const index = state.list.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteMovie(state, action: PayloadAction<string>) {
      state.list = state.list.filter(m => m.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  setLoading,
  setError,
} = moviesSlice.actions;

export default moviesSlice.reducer;
