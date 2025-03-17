import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

import { isTokenExpired } from 'src/utils/client';
import { oidcService } from 'src/utils/oidcClient';

import store from 'src/redux/store';
import { setUser, clearUser } from 'src/redux/auth/authSlice';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

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
      console.log('Cookies in Document:', document.cookie);
      if (typeof window !== 'undefined') {
        const reduxStore = store.getState();
        const { currentYear, currentBoard, currentMedium } = reduxStore.globalState;

        Cookies.set('AcademicYearId', currentYear?.id, {
          expires: 7,
          path: '/',
          secure: false,
          domain: 'localhost',
          sameSite: 'None', // <-- UNCOMMENT THIS LINE, set sameSite to 'Lax'
          // hostOnly: false,
        });
        Cookies.set('EducationBoardId', currentBoard?.id, {
          expires: 7,
          path: '/',
          secure: false,
          domain: 'localhost',
          sameSite: 'None', // <-- UNCOMMENT THIS LINE, set sameSite to 'Lax'
          // hostOnly: false,
        });
        Cookies.set('EducationMediumId', currentMedium?.id, {
          expires: 7,
          path: '/',
          secure: false,
          domain: 'localhost',
          sameSite: 'None', // <-- UNCOMMENT THIS LINE, set sameSite to 'Lax'
          // hostOnly: false,
        });

        const token = store.getState().auth.user?.access_token;

        if (token) {
          if (isTokenExpired(token)) {
            // If the token is expired, handle refresh token logic
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const refreshedUser = await oidcService.renewToken();
                store.dispatch(setUser(JSON.parse(JSON.stringify(refreshedUser))));

                if (refreshedUser?.access_token) {
                  // Notify all waiting requests that the new token is available
                  refreshSubscribers.forEach((callback) => callback(refreshedUser?.access_token));
                  refreshSubscribers = []; // Clear the queue after processing

                  config.headers = config.headers || {};
                  config.headers.Authorization = `Bearer ${refreshedUser?.access_token}`;
                  config.headers['X-Custom-Header'] = document.cookie;
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
                  config.headers['X-Custom-Header'] = document.cookie;
                  resolve();
                });
              });
            }
          } else {
            // Token is valid, attach to the request
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['X-Custom-Header'] = document.cookie;
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
