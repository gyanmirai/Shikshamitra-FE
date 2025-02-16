import createAxiosInstance from './httpService';

export const axiosBaseQuery =
  ({ baseUrl }: any) =>
  async ({ url, method = 'get', data, params, headers, ...props }: any) => {
    try {
      const result = await createAxiosInstance(process.env.NEXT_PUBLIC_API_URL as string)({
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
