import { hostTenantPermissions } from 'src/constants/host-tenant-menu';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { isHostSessionContext } from '../host-tenants/session-context';

import type { HostSessionContext } from '../host-tenants/types';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  permissionsInitialized: boolean;
  employee: any;
  permissions: { name: string; isGranted: boolean }[];
  mainModuleVisibility: boolean[];
  sessionContext: HostSessionContext | null;
  currentRequestId: string | null;
  initializationError: string | null;
  initializationVersion: number;
  employeeRequestId: string | null;
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

async function readFailureCode(response: Response): Promise<string | undefined> {
  try {
    const failure = await response.json();
    return typeof failure?.errorCode === 'string' ? failure.errorCode : undefined;
  } catch {
    return undefined;
  }
}

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (userSession: any, { rejectWithValue, signal }) => {
    try {
      const userId = userSession?.profile?.sub;
      const accessToken = userSession?.accessToken;

      if (!userId || !accessToken || userSession?.error) {
        return rejectWithValue({ status: 401, message: 'The authentication session is invalid.' });
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
      const contextResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/host/session-context`,
        { headers, signal }
      );

      if (!contextResponse.ok) {
        return rejectWithValue({
          status: contextResponse.status,
          errorCode: await readFailureCode(contextResponse),
          message: 'Unable to verify the account context.',
        });
      }
      const sessionContext: unknown = await contextResponse.json();
      if (!isHostSessionContext(sessionContext))
        return rejectWithValue({ status: 'INVALID_RESPONSE', message: 'Invalid account context.' });

      if (sessionContext.accountMode === 'host') {
        const permissionData = [
          { name: hostTenantPermissions.view, isGranted: sessionContext.canViewTenants },
          { name: hostTenantPermissions.create, isGranted: sessionContext.canCreateTenants },
          { name: hostTenantPermissions.update, isGranted: sessionContext.canUpdateTenants },
          {
            name: hostTenantPermissions.manageStatus,
            isGranted: sessionContext.canManageTenantStatus,
          },
        ];
        return {
          user: userSession.profile,
          mainModuleVisibility: buildModuleVisibility(permissionData),
          permissionData,
          sessionContext,
        };
      }

      const permissionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/permission-management/permissions?providerName=U&providerKey=${encodeURIComponent(userId)}`,
        { method: 'GET', headers, signal }
      );

      if (!permissionResponse.ok) {
        return rejectWithValue({
          status: permissionResponse.status,
          errorCode: await readFailureCode(permissionResponse),
          message: 'Unable to initialize user permissions.',
        });
      }

      const jsonData = await permissionResponse.json();
      const permissionData = extractGrantedPermissions(jsonData?.groups || []);

      return {
        user: userSession.profile,
        mainModuleVisibility: buildModuleVisibility(permissionData),
        permissionData,
        sessionContext,
      };
    } catch (error) {
      return rejectWithValue({ status: 'FETCH_ERROR', message: String(error) });
    }
  }
);

export const getEmployee = createAsyncThunk(
  'auth/getEmployee',
  async (userData: any, { rejectWithValue, signal }) => {
    try {
      if (!userData?.accessToken || userData?.error) {
        return rejectWithValue({ status: 401, message: 'The authentication session is invalid.' });
      }

      const employeeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/employees/me`, {
        method: 'GET',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.accessToken}`,
        },
      });
      if (employeeRes.status === 401) {
        return rejectWithValue({ status: 401, message: 'The authentication session has expired.' });
      }
      if (
        employeeRes.status === 403 &&
        (await readFailureCode(employeeRes)) === 'TENANT_INACTIVE'
      ) {
        return rejectWithValue({ status: 403, errorCode: 'TENANT_INACTIVE' });
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
  sessionContext: null,
  currentRequestId: null,
  initializationError: null,
  initializationVersion: 0,
  employeeRequestId: null,
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
      state.sessionContext = null;
      state.currentRequestId = null;
      state.employeeRequestId = null;
      state.initializationError = null;
    },
    retrySessionInitialization: (state) => {
      state.initializationError = null;
      state.initializationVersion += 1;
      state.permissionsInitialized = false;
      state.loading = true;
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
      .addCase(loadUser.pending, (state, action) => {
        state.loading = true;
        state.initializationError = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.mainModuleVisibility = action.payload.mainModuleVisibility;
        state.permissions = action.payload.permissionData;
        state.loading = false;
        state.permissionsInitialized = true;
        state.sessionContext = action.payload.sessionContext;
        state.initializationError = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        state.user = null;
        state.isAuthenticated = false;
        state.employee = null;
        state.permissions = [];
        state.mainModuleVisibility = [];
        state.loading = false;
        state.permissionsInitialized = !action.meta.aborted;
        state.sessionContext = null;
        const failure = action.payload as { status?: number; errorCode?: string } | undefined;
        state.initializationError =
          action.meta.aborted ||
          failure?.status === 401 ||
          (failure?.status === 403 && failure?.errorCode === 'TENANT_INACTIVE')
            ? null
            : 'We could not verify your account access. Please try again.';
      })
      .addCase(getEmployee.pending, (state, action) => {
        state.employeeRequestId = action.meta.requestId;
      })
      .addCase(getEmployee.fulfilled, (state, action) => {
        if (state.employeeRequestId !== action.meta.requestId) return;
        state.employeeRequestId = null;
        if (action.meta.arg?.profile?.sub !== state.user?.sub) return;
        if (action.meta.arg?.profile?.tenantid !== state.user?.tenantid) return;
        state.employee = action.payload;
        // state.loading = false;
      })
      .addCase(getEmployee.rejected, (state, action) => {
        if (state.employeeRequestId !== action.meta.requestId) return;
        state.employeeRequestId = null;
        if (action.meta.arg?.profile?.sub !== state.user?.sub) return;
        if (action.meta.arg?.profile?.tenantid !== state.user?.tenantid) return;
        state.employee = null;
        // state.error = action.payload;
        // state.loading = false;
      });
  },
});

export const {
  setUser,
  clearUser,
  setMainModuleVisibility,
  setPermissions,
  retrySessionInitialization,
} = authSlice.actions;
export default authSlice.reducer;
