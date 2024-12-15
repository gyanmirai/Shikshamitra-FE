import { apiClient } from './httpService';

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
      console.log(err, '=====error========');
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
