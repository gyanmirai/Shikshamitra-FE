'use client';

import { useSession } from 'next-auth/react';
import { memo, useRef, useEffect } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider, useDispatch, useSelector } from 'react-redux';

import store, { persistor } from './store';
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

  useEffect(() => {
    const sessionUserId = sessionData?.profile?.sub || null;

    if (sessionUserId && loadedUserId.current !== sessionUserId) {
      const loadEmployeeProfile = shouldLoadEmployeeProfile(sessionData);

      if (loadedUserId.current || !loadEmployeeProfile) {
        dispatch(clearUser());
      }
      dispatch(loadUser(sessionData) as any);
      if (loadEmployeeProfile) {
        dispatch(getEmployee(sessionData) as any);
      }
      loadedUserId.current = sessionUserId;
      return;
    }

    if (status === 'unauthenticated') {
      dispatch(clearUser());
      if (currentYear?.id) {
        dispatch(setCurrentYear({}));
        dispatch(setCurrentBoard({}));
        dispatch(setCurrentMedium({}));
      }
      loadedUserId.current = null;
    }
  }, [dispatch, sessionData, status, currentYear?.id]);

  return null;
});
