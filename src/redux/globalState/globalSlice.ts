import { createSlice } from '@reduxjs/toolkit';

const globalStateSlice = createSlice({
  name: 'globalState',
  initialState: { currentYear: {}, currentBoard: {} },
  reducers: {
    setCurrentYear: (state, action) => {
      state.currentYear = action.payload;
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
  },
});

export const { setCurrentBoard, setCurrentYear } = globalStateSlice.actions;
export default globalStateSlice.reducer;
