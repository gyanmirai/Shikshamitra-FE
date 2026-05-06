import debounce from 'lodash/debounce';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import type { FetchOptionsResponse } from './types';

interface UsePaginatedSearchParams<T> {
  fetchOptions: (query: string, page: number) => Promise<FetchOptionsResponse<T>>;
  minChars?: number;
  debounceMs?: number;
}

export function usePaginatedSearch<T>({
  fetchOptions,
  minChars = 2,
  debounceMs = 400,
}: UsePaginatedSearchParams<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep track of the latest query to avoid race conditions
  const latestQueryRef = useRef('');

  const loadOptions = useCallback(
    async (query: string, pageNum: number, append: boolean) => {
      // Don't search if query is too short
      if (query.length < minChars && query.length > 0) {
        return;
      }

      setLoading(true);
      setError(null);
      latestQueryRef.current = query;

      try {
        const response = await fetchOptions(query, pageNum);

        // Check if this validation is still relevant (avoid race condition)
        if (latestQueryRef.current !== query) return;

        if (append) {
          setOptions((prev) => [...prev, ...response.data]);
        } else {
          setOptions(response.data);
        }

        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (err) {
        if (latestQueryRef.current !== query) return;
        console.error('Failed to fetch options:', err);
        setError('Failed to load results');
      } finally {
        if (latestQueryRef.current === query) {
          setLoading(false);
        }
      }
    },
    [fetchOptions, minChars]
  );

  const debouncedLoadOptions = useMemo(
    () => debounce((query: string) => loadOptions(query, 1, false), debounceMs),
    [loadOptions, debounceMs]
  );
  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);

      // If cleared, reset
      if (!newInputValue) {
        debouncedLoadOptions.cancel();
        loadOptions('', 1, false); // Load default options if desired, or clear
        return;
      }

      debouncedLoadOptions(newInputValue);
    },
    [debouncedLoadOptions, loadOptions]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadOptions(inputValue, page + 1, true);
    }
  }, [loading, hasMore, inputValue, page, loadOptions]);

  // Initial load
  useEffect(() => {
    loadOptions('', 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    options,
    loading,
    inputValue,
    handleInputChange,
    loadMore,
    hasMore,
    error,
  };
}
