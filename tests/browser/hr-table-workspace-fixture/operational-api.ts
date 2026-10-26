import { useState, useEffect } from 'react';

export function useSyntheticRead(path: string, body: unknown, skip = false) {
  const key = JSON.stringify(body);
  const [refresh, setRefresh] = useState(0);
  const [state, setState] = useState<{ key: string; data?: any; error?: unknown }>({ key: '' });
  useEffect(() => {
    if (skip) return undefined;
    const controller = new AbortController();
    setState({ key: '' });
    fetch(`/synthetic-hr/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: key,
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw Object.assign(new Error(data.detail || 'Synthetic table query failed.'), {
            status: response.status,
            data,
          });
        if (!controller.signal.aborted) setState({ key, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ key, error });
      });
    return () => controller.abort();
  }, [key, path, refresh, skip]);
  return {
    data: state.key === key ? state.data : undefined,
    currentData: state.key === key ? state.data : undefined,
    isFetching: !skip && state.key !== key,
    isLoading: !skip && state.key !== key,
    isError: state.key === key && Boolean(state.error),
    error: state.key === key ? state.error : undefined,
    refetch: () => setRefresh((value) => value + 1),
  };
}
export const useHrOperationalTableQuery = (body: unknown, options: { skip?: boolean }) =>
  useSyntheticRead('table-query', body, options.skip);
