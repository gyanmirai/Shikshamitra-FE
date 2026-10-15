'use client';

import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signOut, useSession } from 'next-auth/react';

import { api } from '../service';
import { clearCachedAuthSession } from '../session-cache';
import { openLibraryApi } from '../library/LibraryDataSearch';
import { loadUser, clearUser, getEmployee } from './authSlice';
import { setCurrentYear, setCurrentBoard, setCurrentMedium } from '../globalState/globalSlice';

import type { AppDispatch } from '../store';

type ApplicationSession = {
  profile?: { sub?: string; tenantid?: string; role?: unknown };
  accessToken?: string;
  error?: string;
};
const shouldLoadEmployee = (roles: unknown) => {
  const values = Array.isArray(roles) ? roles : [roles];
  return !values.some(
    (role) => typeof role === 'string' && ['admin', 'super-admin'].includes(role.toLowerCase())
  );
};

export default function LoadSession() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status } = useSession();
  const session = data as ApplicationSession | null;
  const loadedIdentity = useRef<string | null>(null);
  const invalidatedToken = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.profile?.sub;
    const accessToken = session?.accessToken;
    const identity = userId ? `${userId}:${session?.profile?.tenantid ?? 'host'}` : null;
    const usable = status === 'authenticated' && Boolean(userId && accessToken) && !session?.error;
    const clear = () => {
      clearCachedAuthSession();
      dispatch(clearUser());
      dispatch(setCurrentYear({}));
      dispatch(setCurrentBoard({}));
      dispatch(setCurrentMedium({}));
      dispatch(api.util.resetApiState());
      dispatch(openLibraryApi.util.resetApiState());
      loadedIdentity.current = null;
    };
    const expire = () => {
      const key = accessToken || 'missing-access-token';
      if (invalidatedToken.current === key) return;
      invalidatedToken.current = key;
      clearCachedAuthSession();
      signOut({ callbackUrl: '/login' });
    };
    if (usable && identity && loadedIdentity.current !== identity) {
      clear();
      loadedIdentity.current = identity;
      const request = dispatch(loadUser(session));
      request
        .unwrap()
        .then(async (result) => {
          if (loadedIdentity.current !== identity) return;
          invalidatedToken.current = null;
          if (
            result.sessionContext.accountMode === 'tenant' &&
            shouldLoadEmployee(session?.profile?.role)
          ) {
            try {
              await dispatch(getEmployee(session)).unwrap();
            } catch (failure) {
              if (loadedIdentity.current !== identity) return;
              if (
                typeof failure === 'object' &&
                failure !== null &&
                'status' in failure &&
                failure.status === 401
              ) {
                clear();
                expire();
              }
            }
          }
        })
        .catch(() => {
          if (loadedIdentity.current === identity) {
            clear();
            expire();
          }
        });
    } else if (status === 'unauthenticated' || (status === 'authenticated' && !usable)) {
      clear();
      if (status === 'authenticated') expire();
      else invalidatedToken.current = null;
    }
  }, [dispatch, session, status]);
  return null;
}
