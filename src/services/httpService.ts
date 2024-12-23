import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { isTokenExpired } from 'src/utils/client';

import store from 'src/redux/store';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json;charset=utf8 ',
      accept: '*/*',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const reduxStore = store.getState();
        const { currentYear, currentBoard, currentMedium } = reduxStore.globalState;
        const cookieHeader = `currentYear=${currentYear?.id};currentBoard=${currentBoard.id};currentMedium=${currentMedium.id}`;
        document.cookie = cookieHeader;
        // Add values to cookie

        const token = localStorage.getItem('access_token');
        if (token) {
          if (isTokenExpired(token)) {
            // If the token is expired, handle refresh token logic
            if (!isRefreshing) {
              isRefreshing = true;
              const refreshToken = localStorage.getItem('refresh_token');
              try {
                const newTokenSet = await axios.post(`/auth/refresh-token`, {
                  token: refreshToken,
                });

                if (newTokenSet?.data) {
                  localStorage.setItem('access_token', newTokenSet.data.access_token);
                  localStorage.setItem('refresh_token', newTokenSet.data.refresh_token);

                  // Notify all waiting requests that the new token is available
                  refreshSubscribers.forEach((callback) => callback(newTokenSet.data.access_token));
                  refreshSubscribers = []; // Clear the queue after processing

                  config.headers = config.headers || {};
                  config.headers.Authorization = `Bearer ${newTokenSet.data.access_token}`;
                  config.headers.Cookie = cookieHeader;
                } else {
                  handleLogout();
                }
              } catch (error) {
                console.log(error, '=========error========');
                handleLogout();
              } finally {
                isRefreshing = false;
              }
            } else {
              // Wait for the refresh to complete and retry the original request
              await new Promise<void>((resolve) => {
                refreshSubscribers.push((tokens: string) => {
                  config.headers = config.headers || {};
                  config.headers.Authorization = `Bearer ${tokens}`;
                  config.headers.Cookie = document.cookie;
                  resolve();
                });
              });
            }
          } else {
            // Token is valid, attach to the request
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            config.headers.Cookie = document.cookie;
          }
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
  // Handle logout functionality (clear cookies, session storage, etc.)
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  sessionStorage.clear();
  window.location.href = '/auth/login';
}

export default createAxiosInstance;

export const apiClient = createAxiosInstance(process.env.NEXT_PUBLIC_API_URL || '');
