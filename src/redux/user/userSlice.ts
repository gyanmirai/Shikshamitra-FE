import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  username: string | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  username: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = true;
      state.username = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.username = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
