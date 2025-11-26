import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from 'oidc-client-ts';
import { oidcService } from 'src/utils/oidcClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  employee: any;
}

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const user = await oidcService.getUser();

      if (user) {
        const userPlanObject = JSON.parse(JSON.stringify(user));
        await dispatch(getEmployee(userPlanObject)).unwrap();
        return userPlanObject;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const user = await oidcService.renewToken();
      return JSON.parse(JSON.stringify(user));
    } catch (error) {
      console.error('Refresh token failed:', error);
      return rejectWithValue(error);
    }
  }
);

export const getEmployee = createAsyncThunk(
  'auth/getEmployee',
  async (userData: any, { rejectWithValue }) => {
    try {
      const employeeRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/app/employee/employee-by-user-id/${userData.profile.sub}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData?.access_token}`,
          },
        }
      );
      const employeeData = await employeeRes.json();
      return employeeData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  employee: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        // state.error = action.payload;
        state.loading = false;
      })
      .addCase(refreshToken.pending, (state) => {
        // state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload;
        // state.loading = false;
      })
      .addCase(refreshToken.rejected, (state) => {
        // state.error = action.payload;
        // state.loading = false;
      })
      .addCase(getEmployee.pending, (state) => {
        // state.loading = true;
      })
      .addCase(getEmployee.fulfilled, (state, action) => {
        state.employee = action.payload;
        // state.loading = false;
      })
      .addCase(getEmployee.rejected, (state) => {
        // state.error = action.payload;
        // state.loading = false;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
