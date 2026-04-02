// src/redux/services/api.ts

import type { FetchArgs } from '@reduxjs/toolkit/query/react';

import { toast } from 'sonner';
import { signOut, getSession } from 'next-auth/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { tagTypes } from './tagTypes';

// 🔹 Base query (like axios base config)
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  credentials: 'include', // ✅ send cookies
});

// 🔹 Custom baseQuery (like interceptors)
const baseQueryWithAuth: typeof rawBaseQuery = async (args, api, extraOptions) => {
  try {
    console.log('API Request:', args); // ✅ Log request details
    // ✅ Request interceptor logic
    const headers: any = {
      'Content-Type': 'application/json',
      accept: '*/*',
      ...((args as FetchArgs)?.headers || {}),
    };

    if (typeof window !== 'undefined') {
      const session: any = await getSession();
      const token = session?.accessToken;

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    // ✅ Call API
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

    // ✅ Response interceptor logic
    if (result.error) {
      const { status } = result.error;

      if (status === 401) {
        toast.error('Unauthorized access');
        await signOut({ callbackUrl: '/login' });
      }
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
