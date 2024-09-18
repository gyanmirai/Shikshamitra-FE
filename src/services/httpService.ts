import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { isTokenExpired } from 'src/utils/client';

const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    // timeout: 10000,
    headers: {
      'Content-Type': 'application/json;charset=utf8 ',
      accept: 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Client-side specific logic
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          if (isTokenExpired(token)) {
            try {
              const refreshToken = localStorage.getItem('refresh_token');
              const newTokenSet = await axios.post(`/auth/refresh-token`, {
                token: refreshToken,
              });
              localStorage.setItem('access_token', newTokenSet.data.access_token);
              localStorage.setItem('refresh_token', newTokenSet.data.refresh_token);
              config.headers = config.headers || {};
              config.headers.Authorization = `Bearer ${newTokenSet.data.access_token}`;
            } catch (error) {
              // Clear cookies
              document.cookie.split(';').forEach((c) => {
                document.cookie = c
                  .replace(/^ +/, '')
                  .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
              });

              window.location.href = '/auth/login';
            }
          } else {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      }

      // // Server-side specific logic
      // if (typeof window === 'undefined') {
      //   const session = await getSession();
      //   config.headers = config.headers || {};
      //   config.headers.Authorization = `Bearer ${session.access_token}`;
      //   // Add any server-side specific headers or modifications here
      // }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response) {
        // Handle specific error status codes
        switch (error.response.status) {
          case 401:
            // Handle unauthorized access
            break;
          case 404:
            // Handle not found
            break;
          // Add more cases as needed
          default:
            // Handle any other error status codes
            break;
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createAxiosInstance(process.env.NEXT_PUBLIC_API_URL || '');

export const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method = 'get', data, params, headers, ...props }: any) => {
    try {
      const result = await apiClient({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
        redirect: 'follow',
        ...props,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as any;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
