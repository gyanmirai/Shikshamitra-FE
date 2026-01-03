import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { User } from 'oidc-client-ts';
import { oidcService } from 'src/utils/oidcClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  employee: any;
  permissions: { name: string; isGranted: boolean }[];
  mainModuleVisibility: boolean[];
}
export function extractGrantedPermissions(groups: any): { name: string; isGranted: boolean }[] {
  if (!Array.isArray(groups)) return [];

  return groups.flatMap((group: any) =>
    group.permissions.map((permission: any) => ({
      name: permission.name,
      isGranted: permission.isGranted,
    }))
  );
}
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (userSession: any, { dispatch, rejectWithValue }) => {
    try {
      if (userSession?.profile?.sub) {
        const mainModuleVisibility = userSession?.profile?.module_mask || '';
        const mainModuleVisibilityArray: boolean[] = mainModuleVisibility
          .split('')
          .map((item: string) => (item === '1' ? true : false));
        const fetchPermssion = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/permission-management/permissions?providerName=U&providerKey=${userSession.profile.sub}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userSession.accessToken}`,
            },
          }
        );
        const jsonData = await fetchPermssion?.json();

        const permissionData = extractGrantedPermissions(jsonData?.groups || []);
        return {
          mainModuleVisibility: mainModuleVisibilityArray,
          permissionData,
        };
      }
      return { user: null, mainModuleVisibility: [], permissionData: [] };
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
  permissions: [],
  mainModuleVisibility: [],
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
    setMainModuleVisibility: (state, action: PayloadAction<boolean[]>) => {
      state.mainModuleVisibility = action.payload;
    },
    setPermissions: (state, action: PayloadAction<{ name: string; isGranted: boolean }[]>) => {
      state.permissions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = !!action.payload;
        state.mainModuleVisibility = action.payload.mainModuleVisibility;
        state.permissions = action.payload.permissionData;
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

export const { setUser, clearUser, setMainModuleVisibility, setPermissions } = authSlice.actions;
export default authSlice.reducer;
