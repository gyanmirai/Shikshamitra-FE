import { createSlice } from '@reduxjs/toolkit';

const confirmPopup = createSlice({
  name: 'confirmPopup',
  initialState: { isChanges: false, currentRoute: '', nextRoute: '', dialog: false },
  reducers: {
    setIsChanges: (state, action) => {
      state.isChanges = action.payload;
    },
    setCurrentRoute: (state, action) => {
      state.currentRoute = action.payload;
    },
    setNextRoute: (state, action) => {
      state.nextRoute = action.payload;
    },
    setDialog: (state, action) => {
      state.dialog = action.payload;
    },
  },
});

export const { setIsChanges, setCurrentRoute, setNextRoute, setDialog } = confirmPopup.actions;
export default confirmPopup.reducer;
