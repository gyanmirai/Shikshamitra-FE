import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import authReducer, { setUser, loadUser } from 'src/redux/auth/authSlice';

import { useAcademicReportDownload } from './useAcademicReportDownload';

export function mountReportDownload() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  store.dispatch(setUser({ sub: 'user-1' }));
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const hook = renderHook(useAcademicReportDownload, { wrapper });
  const cleanup = () => { hook.unmount(); store.dispatch(api.util.resetApiState()); };
  const switchAccount = (kind: 'user' | 'tenant') => {
    if (kind === 'user') store.dispatch(setUser({ sub: 'user-2' }));
    else {
      store.dispatch(loadUser.pending('tenant-switch', {}));
      store.dispatch(loadUser.fulfilled({
        user: { sub: 'user-1' }, mainModuleVisibility: [], permissionData: [],
        sessionContext: { accountMode: 'tenant', tenantId: 'tenant-2', canViewTenants: false,
          canCreateTenants: false, canUpdateTenants: false, canManageTenantStatus: false },
      }, 'tenant-switch', {}));
    }
  };
  return { hook, store, cleanup, switchAccount };
}

export function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}
