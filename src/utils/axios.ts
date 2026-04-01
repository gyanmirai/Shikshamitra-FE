import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const baseURL = CONFIG.site.serverUrl;

type FetchConfig = Omit<RequestInit, 'method'> & { params?: Record<string, string> };

async function request(method: string, url: string, config?: FetchConfig) {
  const { params, ...init } = config ?? {};
  const fullUrl = params ? `${baseURL}${url}?${new URLSearchParams(params)}` : `${baseURL}${url}`;

  const response = await fetch(fullUrl, { ...init, method });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      // ignore parse errors
    }
    return Promise.reject(errorData || 'Something went wrong!');
  }

  const data = await response.json();
  return { data };
}

const fetchInstance = {
  get: (url: string, config?: FetchConfig) => request('GET', url, config),
  post: (url: string, body?: any, config?: FetchConfig) =>
    request('POST', url, {
      ...config,
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: (url: string, body?: any, config?: FetchConfig) =>
    request('PUT', url, {
      ...config,
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: (url: string, body?: any, config?: FetchConfig) =>
    request('PATCH', url, {
      ...config,
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: (url: string, config?: FetchConfig) => request('DELETE', url, config),
};

export default fetchInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, FetchConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await fetchInstance.get(url, config);

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
