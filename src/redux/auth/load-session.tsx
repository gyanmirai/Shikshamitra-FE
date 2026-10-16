'use client';

import { useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { useSelectedLayoutSegments } from 'next/navigation';

import { api } from '../service';
import { clearCachedAuthSession } from '../session-cache';
import { openLibraryApi } from '../library/LibraryDataSearch';
import { loadUser, clearUser, getEmployee } from './authSlice';
import { setCurrentYear, setCurrentBoard, setCurrentMedium } from '../globalState/globalSlice';

import type { RootState, AppDispatch } from '../store';

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
  const sessionRef = useRef(session);
  const isPublicRoute = useSelectedLayoutSegments().includes('(public-route)');
  const initializationVersion = useSelector((state: RootState) => state.auth.initializationVersion);
  const loadedIdentity = useRef<string | null>(null);
  const loadedVersion = useRef<number | null>(null);
  const invalidatedToken = useRef<string | null>(null);
  const previousToken = useRef<string | undefined>(undefined);
  const userId = session?.profile?.sub;
  const tenantId = session?.profile?.tenantid;
  const accessToken = session?.accessToken;
  const sessionError = session?.error;
  const needsEmployee = shouldLoadEmployee(session?.profile?.role);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const currentSession = sessionRef.current;
    const identity = userId ? `${userId}:${tenantId ?? 'host'}` : null;
    const usable = status === 'authenticated' && Boolean(userId && accessToken) && !sessionError;
    let active = true;
    let contextRequest: ReturnType<ReturnType<typeof loadUser>> | undefined;
    let employeeRequest: ReturnType<ReturnType<typeof getEmployee>> | undefined;
    // A late response from a previous token/identity/route must not invalidate this session.
    const isCurrent = () =>
      active &&
      sessionRef.current?.accessToken === accessToken &&
      sessionRef.current?.profile?.sub === userId &&
      sessionRef.current?.profile?.tenantid === tenantId;
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
    const expire = (inactiveTenant = false) => {
      const key = accessToken || 'missing-access-token';
      if (invalidatedToken.current === key) return;
      invalidatedToken.current = key;
      clearCachedAuthSession();
      signOut({ callbackUrl: inactiveTenant ? '/login?reason=tenant-inactive' : '/login' });
    };
    const handleFailure = (failure: unknown) => {
      if (!isCurrent() || typeof failure !== 'object' || failure === null) return;
      const { status: failureStatus, errorCode } = failure as {
        status?: number;
        errorCode?: string;
      };
      const inactiveTenant = failureStatus === 403 && errorCode === 'TENANT_INACTIVE';
      if (failureStatus === 401 || inactiveTenant) {
        clear();
        expire(inactiveTenant);
      }
      // Other bootstrap failures stay fail-closed in Redux, with an explicit retry in route guards.
    };
    const loadEmployee = () => {
      if (!tenantId || !needsEmployee) return;
      employeeRequest = dispatch(getEmployee(currentSession));
      employeeRequest.unwrap().catch(handleFailure);
    };

    if (previousToken.current !== accessToken) {
      clearCachedAuthSession();
      previousToken.current = accessToken;
    }
    if (status === 'unauthenticated' || (status === 'authenticated' && !usable)) {
      clear();
      if (status === 'authenticated' && !isPublicRoute) expire();
      else invalidatedToken.current = null;
    } else if (usable && identity && !isPublicRoute) {
      if (loadedIdentity.current !== identity || loadedVersion.current !== initializationVersion) {
        clear();
        contextRequest = dispatch(loadUser(currentSession));
        contextRequest
          .unwrap()
          .then((result) => {
            if (!isCurrent()) return;
            loadedIdentity.current = identity;
            loadedVersion.current = initializationVersion;
            invalidatedToken.current = null;
            if (result.sessionContext.accountMode === 'tenant') loadEmployee();
          })
          .catch(handleFailure);
      } else {
        loadEmployee();
      }
    }
    return () => {
      active = false;
      contextRequest?.abort();
      employeeRequest?.abort();
    };
  }, [
    dispatch,
    status,
    userId,
    tenantId,
    accessToken,
    sessionError,
    needsEmployee,
    isPublicRoute,
    initializationVersion,
  ]);
  return null;
}
