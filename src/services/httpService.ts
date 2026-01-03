import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';
import { toast } from 'sonner';
import store from 'src/redux/store';
import { getSession } from 'next-auth/react';
import { clearUser } from 'src/redux/auth/authSlice';

const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json;charset=utf8',
      accept: '*/*',
    },
    withCredentials: true, // Ensure credentials (cookies) are sent with the request
  });
  instance.defaults.withCredentials = true;

  // Request interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const session: any = await getSession();
        const token = session?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Handle unauthorized access here, if needed
            toast.error('Unauthorized access');
            handleLogout();
            break;
          case 404:
            // Handle not found
            break;
          default:
            break;
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

function handleLogout() {
  store.dispatch(clearUser());
  window.location.href = '/login';
}

export default createAxiosInstance;

// createAxiosInstance(process.env.NEXT_PUBLIC_API_URL || '');
