import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  userInfo: Record<string, any> | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  userInfo: null,
};

export const getUser = createAsyncThunk('user/getUser', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/getToken`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const sessionData = await sessionRes.json();
    return {
      ...data,
      ...sessionData.userInfo,
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.userInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoggedIn = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.userInfo = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isLoggedIn = false;
        state.userInfo = null;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
