import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccessState {
  isUnlocked: boolean;
}

const initialState: AccessState = {
  isUnlocked: false,
};

const accessSlice = createSlice({
  name: 'access',
  initialState,
  reducers: {
    setUnlocked(state, action: PayloadAction<boolean>) {
      state.isUnlocked = action.payload;
    },
  },
});

export const { setUnlocked } = accessSlice.actions;
export default accessSlice.reducer;
