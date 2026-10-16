// src/redux/services/api.ts

import type { FetchArgs } from '@reduxjs/toolkit/query/react';

import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { tagTypes } from './tagTypes';
import { normalizePermissionResponse } from './normalize-permission-response';
import {
  getCachedAuthSession,
  clearCachedAuthSession,
  isAuthSessionCacheCurrent,
  getAuthSessionCacheRevision,
} from './session-cache';

// 🔹 Base query (like axios base config)
// Note: Content-Type is NOT set globally — it's set per-request in baseQueryWithAuth
// so that FormData requests (file uploads) can have Content-Type auto-set by the browser
// (with the correct multipart boundary), while JSON requests get application/json.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  credentials: 'include', //  send cookies
});

// 🔹 Custom baseQuery (like interceptors)
const baseQueryWithAuth: typeof rawBaseQuery = async (args, api, extraOptions) => {
  try {
    const sessionRevision = getAuthSessionCacheRevision();
    let sessionAccessToken: string | undefined;
    //  Request interceptor logic
    const headers: any = {
      accept: '*/*',
      ...((args as FetchArgs)?.headers || {}),
    };

    if (typeof window !== 'undefined') {
      const session: any = await getCachedAuthSession();
      const token = session?.accessToken;

      // An account change can invalidate an in-flight session lookup. Do not
      // continue that request anonymously or attach the replacement account.
      if (!isAuthSessionCacheCurrent(sessionRevision, token)) {
        return {
          error: {
            status: 'CUSTOM_ERROR',
            error: 'The authentication session changed. Please retry the request.',
          },
        };
      }
      sessionAccessToken = token;

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    //  Detect non-JSON bodies (file uploads or form-encoded data)
    // For FormData: browser auto-sets multipart/form-data with correct boundary
    // For URLSearchParams: browser auto-sets application/x-www-form-urlencoded
    // For everything else: set application/json so RTK Query serializes the body.
    const argBody =
      typeof args !== 'string' ? ((args as any).body ?? (args as any).data) : undefined;
    const isNonJsonBody = argBody instanceof FormData || argBody instanceof URLSearchParams;

    // Only set Content-Type: application/json if there is a body and it's not FormData/URLSearchParams
    // This avoids CORS preflight issues on GET requests (which have no body)
    if (argBody && !isNonJsonBody) {
      headers['Content-Type'] = 'application/json';
    }

    //  Call API
    const result = await rawBaseQuery(
      {
        ...(typeof args === 'string' ? { url: args } : args),
        headers: {
          ...(typeof args !== 'string' ? args.headers : {}),
          ...headers,
        },
        ...((args as any)?.data ? { body: (args as any)?.data } : {}),
      },
      api,
      extraOptions
    );

    //  Response interceptor logic
    if (result.error) {
      const { status } = result.error;
      const data = result.error.data as { errorCode?: string } | undefined;
      const isCurrentSession =
        typeof window === 'undefined' ||
        isAuthSessionCacheCurrent(sessionRevision, sessionAccessToken);
      if (isCurrentSession && status === 403 && data?.errorCode === 'TENANT_INACTIVE') {
        clearCachedAuthSession();
        api.dispatch({ type: 'auth/clearUser' });
        api.dispatch({ type: 'globalState/setCurrentYear', payload: {} });
        api.dispatch({ type: 'globalState/setCurrentBoard', payload: {} });
        api.dispatch({ type: 'globalState/setCurrentMedium', payload: {} });
        toast.error('This school is inactive. Contact the platform administrator.');
        await signOut({ callbackUrl: '/login?reason=tenant-inactive' });
      }

      if (isCurrentSession && status === 401) {
        clearCachedAuthSession();
        toast.error('Unauthorized access');
        await signOut({ callbackUrl: '/login' });
      }

      result.error = await normalizePermissionResponse(result.error, api.endpoint);
    }

    return result;
  } catch (error) {
    return {
      error: {
        status: 'FETCH_ERROR',
        error: 'Something went wrong',
      },
    };
  }
};

// 🔹 Create API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes,
  endpoints: () => ({}), // endpoints injected later
});
