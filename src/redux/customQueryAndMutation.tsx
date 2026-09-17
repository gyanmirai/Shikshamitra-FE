import { useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

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

export const shouldShowQueryMutationError = (isError: boolean, popupErrorEnabled: boolean) =>
  isError && popupErrorEnabled;

function useQueryAndMutation<T>({
  type = 'query',
  currentQueryAndMutation,
  params,
  options = {},
  popupConfig,
}: IQueryAndMutation<T>) {
  popupConfig = {
    error: true,
    errorMessage: 'Something went wrong',
    success: false,
    successMessage: 'Fetch Success',
    ...popupConfig,
  };
  const resp = currentQueryAndMutation(params, {
    refetchOnMountOrArgChange: true, // Refetch on every component mount
    // Focus can change during ordinary workflows such as using DevTools, opening a file
    // picker, or switching applications. Refreshing every mounted query here caused a
    // page-wide request burst. Screens that need live focus refresh can still opt in.
    refetchOnFocus: false,
    refetchOnReconnect: true, // Refetch when internet connection is restored
    ...options,
  });
  const { isSuccess, isError, error } = type === 'query' ? resp : resp[1];

  useEffect(() => {
    if (shouldShowQueryMutationError(isError, Boolean(popupConfig.error))) {
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({ message: parsed.detail || popupConfig.errorMessage });
    }
  }, [error, isError, popupConfig.error, popupConfig.errorMessage]);
  useEffect(() => {
    if (isSuccess && popupConfig.success) {
      shikshaMitraToast.success({ message: popupConfig.successMessage });
    }
  }, [isSuccess, popupConfig.success, popupConfig.successMessage]);

  return resp;
}
export default useQueryAndMutation;
