import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  permissionsInitialized: boolean;
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

const mainModulePermissionOrder = [
  'ShikshaMitra.Module.Dashboard',
  'ShikshaMitra.Module.Students',
  'ShikshaMitra.Module.Academics',
  'ShikshaMitra.Module.ClassManagement',
  'ShikshaMitra.Module.HR',
  'ShikshaMitra.Module.Finance',
  'ShikshaMitra.Module.Communication',
  'ShikshaMitra.Module.Calendar',
  'ShikshaMitra.Module.Library',
  'ShikshaMitra.Module.Transport',
  'ShikshaMitra.Module.ResourceManagement',
  'ShikshaMitra.Module.Hostel',
  'ShikshaMitra.Module.Security',
  'ShikshaMitra.Module.SecurityGuard',
  'ShikshaMitra.Module.InstituteSetup',
];

const buildModuleVisibility = (permissions: { name: string; isGranted: boolean }[]) =>
  mainModulePermissionOrder.map((permissionName) =>
    permissions.some(
      (permission) =>
        permission.isGranted &&
        (permission.name === permissionName || permission.name === `${permissionName}.View`)
    )
  );

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (userSession: any, { rejectWithValue }) => {
    try {
      const userId = userSession?.profile?.sub;
      const accessToken = userSession?.accessToken;

      if (!userId || !accessToken || userSession?.error) {
        return rejectWithValue({ status: 401, message: 'The authentication session is invalid.' });
      }

      const permissionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/permission-management/permissions?providerName=U&providerKey=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!permissionResponse.ok) {
        return rejectWithValue({
          status: permissionResponse.status,
          message: 'Unable to initialize user permissions.',
        });
      }

      const jsonData = await permissionResponse.json();
      const permissionData = extractGrantedPermissions(jsonData?.groups || []);

      return {
        user: userSession.profile,
        mainModuleVisibility: buildModuleVisibility(permissionData),
        permissionData,
      };
    } catch (error) {
      return rejectWithValue({ status: 'FETCH_ERROR', message: String(error) });
    }
  }
);

export const getEmployee = createAsyncThunk(
  'auth/getEmployee',
  async (userData: any, { rejectWithValue }) => {
    try {
      if (!userData?.accessToken || userData?.error) {
        return rejectWithValue({ status: 401, message: 'The authentication session is invalid.' });
      }

      const employeeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/employees/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.accessToken}`,
        },
      });
      if (employeeRes.status === 401) {
        return rejectWithValue({ status: 401, message: 'The authentication session has expired.' });
      }
      if (!employeeRes.ok) {
        return null;
      }
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
  permissionsInitialized: false,
  employee: null,
  permissions: [],
  mainModuleVisibility: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.employee = null;
      state.permissions = [];
      state.mainModuleVisibility = [];
      state.permissionsInitialized = false;
    },
    setMainModuleVisibility: (state, action: PayloadAction<boolean[]>) => {
      state.mainModuleVisibility = action.payload;
    },
    setPermissions: (state, action: PayloadAction<{ name: string; isGranted: boolean }[]>) => {
      state.permissions = action.payload;
      state.permissionsInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.mainModuleVisibility = action.payload.mainModuleVisibility;
        state.permissions = action.payload.permissionData;
        state.loading = false;
        state.permissionsInitialized = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.employee = null;
        state.permissions = [];
        state.mainModuleVisibility = [];
        state.loading = false;
        state.permissionsInitialized = true;
      })
      .addCase(getEmployee.pending, (state) => {
        // state.loading = true;
      })
      .addCase(getEmployee.fulfilled, (state, action) => {
        state.employee = action.payload;
        // state.loading = false;
      })
      .addCase(getEmployee.rejected, (state) => {
        state.employee = null;
        // state.error = action.payload;
        // state.loading = false;
      });
  },
});

export const { setUser, clearUser, setMainModuleVisibility, setPermissions } = authSlice.actions;
export default authSlice.reducer;
