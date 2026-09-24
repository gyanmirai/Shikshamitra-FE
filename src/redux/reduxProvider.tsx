'use client';

import { memo, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider, useDispatch, useSelector } from 'react-redux';

import store, { persistor } from './store';
import { clearCachedAuthSession } from './session-cache';
import { loadUser, clearUser, getEmployee } from './auth/authSlice';
import { setCurrentYear, setCurrentBoard, setCurrentMedium } from './globalState/globalSlice';

import type { RootState } from './store';

const getSessionRoles = (sessionData: any): string[] => {
  const roleClaim = sessionData?.profile?.role;

  if (Array.isArray(roleClaim)) {
    return roleClaim;
  }

  return typeof roleClaim === 'string' ? [roleClaim] : [];
};

const shouldLoadEmployeeProfile = (sessionData: any): boolean => {
  const roles = getSessionRoles(sessionData).map((role) => role.toLowerCase());

  return !roles.some((role) => role === 'admin' || role === 'super-admin');
};

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const { target } = e;
      if (
        target.tagName === 'INPUT' &&
        target.type === 'number' &&
        ['e', 'E', '+', '-'].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LoadUser />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;

const LoadUser = memo(() => {
  const dispatch = useDispatch();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const session: any = useSession();
  const { data: sessionData, status } = session;

  const loadedUserId = useRef<string | null>(null);
  const invalidatedAccessToken = useRef<string | null>(null);

  useEffect(() => {
    const sessionUserId = sessionData?.profile?.sub || null;
    const accessToken = sessionData?.accessToken;
    const hasUsableSession =
      status === 'authenticated' &&
      Boolean(sessionUserId) &&
      typeof accessToken === 'string' &&
      Boolean(accessToken) &&
      !sessionData?.error;

    const clearApplicationSession = () => {
      dispatch(clearUser());
      if (currentYear?.id) {
        dispatch(setCurrentYear({}));
        dispatch(setCurrentBoard({}));
        dispatch(setCurrentMedium({}));
      }
      loadedUserId.current = null;
    };

    const signOutInvalidSession = () => {
      const invalidSessionKey = accessToken || 'missing-access-token';
      if (invalidatedAccessToken.current === invalidSessionKey) return;

      invalidatedAccessToken.current = invalidSessionKey;
      clearCachedAuthSession();
      signOut({ callbackUrl: '/login' });
    };

    if (hasUsableSession && sessionUserId && loadedUserId.current !== sessionUserId) {
      const loadEmployeeProfile = shouldLoadEmployeeProfile(sessionData);

      if (loadedUserId.current || !loadEmployeeProfile) {
        dispatch(clearUser());
      }
      loadedUserId.current = sessionUserId;

      const loadUserRequest = dispatch(loadUser(sessionData) as any) as any;
      loadUserRequest
        .unwrap()
        .then(() => {
          invalidatedAccessToken.current = null;
          if (loadEmployeeProfile) {
            const employeeRequest = dispatch(getEmployee(sessionData) as any) as any;
            employeeRequest.unwrap().catch((failure: any) => {
              if (failure?.status === 401) {
                clearApplicationSession();
                signOutInvalidSession();
              }
            });
          }
        })
        .catch(() => {
          clearApplicationSession();
          signOutInvalidSession();
        });
      return;
    }

    if (status === 'unauthenticated' || (status === 'authenticated' && !hasUsableSession)) {
      clearApplicationSession();

      if (status === 'authenticated') {
        signOutInvalidSession();
      } else {
        invalidatedAccessToken.current = null;
      }
    }
  }, [dispatch, sessionData, status, currentYear?.id]);

  return null;
});
