import { toast } from 'sonner';
import { useMemo, useEffect } from 'react';

interface IQueryAndMutation<T> {
  type: 'query' | 'mutation';
  currentQueryAndMutation: (
    params?: any,
    option?: any
  ) => T extends (...args: any[]) => any ? ReturnType<T> : any;

  params?: any;
  options?: any;
  isThrowError?: boolean;
  popupConfig?: {
    error?: boolean;
    errorMessage?: string;
    successMessage?: string;
    success?: boolean;
  };
}
function useQueryAndMutation<T>({
  type = 'query',
  currentQueryAndMutation,
  params,
  options = {},
  popupConfig,
  isThrowError = false,
}: IQueryAndMutation<T>) {
  popupConfig = {
    error: true,
    errorMessage: 'Something went wrong',
    success: false,
    successMessage: 'Fetch Success',
    ...popupConfig,
  };
  const resp = currentQueryAndMutation(params, options);
  const { isSuccess, isError, error } = type === 'query' ? resp : resp[1];

  useEffect(() => {
    if (isError && popupConfig.error) {
      toast.error(error?.data?.error?.message || popupConfig.errorMessage);
    }
  }, [error, isError, popupConfig.error, popupConfig.errorMessage]);
  useEffect(() => {
    if (isSuccess && popupConfig.success) {
      toast.success(popupConfig.successMessage);
    }
  }, [isSuccess, popupConfig.success, popupConfig.successMessage]);

  const response = useMemo(() => {
    if (isThrowError && error) {
      const rtkError = new Error(error?.data?.error?.message);
      // @ts-ignore
      rtkError.data = error;
      throw rtkError;
    }
    return resp;
  }, [error, isThrowError, resp]);
  return response;
}
export default useQueryAndMutation;
