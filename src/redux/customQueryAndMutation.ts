import { toast } from 'sonner';
import { useEffect } from 'react';

interface IQueryAndMutation<T> {
  type: 'query' | 'mutation';
  currentQueryAndMutation: (
    params?: any,
    option?: any
  ) => T extends (...args: any[]) => any ? ReturnType<T> : any;

  params?: any;
  options?: any;
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
  popupConfig = {
    error: true,
    errorMessage: 'Something went wrong',
    success: false,
    successMessage: 'Fetch Success',
  },
}: IQueryAndMutation<T>) {
  const resp = currentQueryAndMutation(params, options);
  const { isSuccess, isError, error } = type === 'query' ? resp : resp[1];
  useEffect(() => {
    if (isError && popupConfig.error) {
      toast.error(error?.data?.message || popupConfig.errorMessage);
    }
    if (isSuccess && popupConfig.success) {
      toast.success(popupConfig.successMessage);
    }
  }, [
    error,
    isError,
    isSuccess,
    popupConfig.error,
    popupConfig.errorMessage,
    popupConfig.success,
    popupConfig.successMessage,
  ]);

  return resp;
}
export default useQueryAndMutation;
