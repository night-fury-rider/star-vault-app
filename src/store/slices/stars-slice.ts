import { createSlice } from '@reduxjs/toolkit';
import { Star } from '../../modules/stars/types/star-types';
import {
  fetchAllStars,
  createStar,
  updateStar,
  deleteStar,
} from '../thunks/star-thunks';

interface StarsState {
  list: Star[];
  loading: boolean;
  error: string | null;
}

const initialState: StarsState = {
  list: [],
  loading: false,
  error: null,
};

const starsSlice = createSlice({
  name: 'stars',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Fetch all
    builder.addCase(fetchAllStars.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllStars.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(fetchAllStars.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createStar.fulfilled, (state, action) => {
      state.list.unshift(action.payload);
    });

    // Update
    builder.addCase(updateStar.fulfilled, (state, action) => {
      const index = state.list.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });

    // Delete
    builder.addCase(deleteStar.fulfilled, (state, action) => {
      state.list = state.list.filter(s => s.id !== action.payload);
    });
  },
});

export default starsSlice.reducer;
