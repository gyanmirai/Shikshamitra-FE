import { createSlice } from '@reduxjs/toolkit';

const globalStateSlice = createSlice({
  name: 'globalState',
  initialState: { currentYear: {}, currentBoard: {},currentMedium:{} },
  reducers: {
    setCurrentYear: (state, action) => {
      state.currentYear = action.payload;
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    setCurrentMedium: (state, action) => {
      state.currentMedium = action.payload;
    }
  },
});

export const { setCurrentBoard, setCurrentYear,setCurrentMedium } = globalStateSlice.actions;
export default globalStateSlice.reducer;
