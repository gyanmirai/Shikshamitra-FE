import debounce from 'lodash/debounce';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import type { FetchOptionsResponse } from './types';

interface UsePaginatedSearchParams<T> {
  fetchOptions: (query: string, page: number) => Promise<FetchOptionsResponse<T>>;
  minChars?: number;
  debounceMs?: number;
}

type SearchRequest = { query: string; page: number; append: boolean; generation: number };

export function usePaginatedSearch<T>({
  fetchOptions,
  minChars = 2,
  debounceMs = 400,
}: UsePaginatedSearchParams<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchOptionsRef = useRef(fetchOptions);
  const queryRef = useRef('');
  const generationRef = useRef(0);
  const requestSequenceRef = useRef(0);
  const activeRequestRef = useRef<number | null>(null);
  const loadedQueryRef = useRef<string | null>(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const failedRequestRef = useRef<SearchRequest | null>(null);

  useEffect(() => {
    fetchOptionsRef.current = fetchOptions;
  }, [fetchOptions]);

  const loadOptions = useCallback(
    async (request: SearchRequest) => {
      const { query, page: pageNum, append, generation } = request;
      if (generation !== generationRef.current || query !== queryRef.current) return;
      if (query.length > 0 && query.length < minChars) return;
      if (append && (activeRequestRef.current !== null || loadedQueryRef.current !== query)) return;

      requestSequenceRef.current += 1;
      const requestId = requestSequenceRef.current;
      activeRequestRef.current = requestId;
      failedRequestRef.current = null;
      setLoading(true);
      setError(null);
      const isCurrent = () =>
        generationRef.current === generation && activeRequestRef.current === requestId;

      try {
        const response = await fetchOptionsRef.current(query, pageNum);
        if (!isCurrent()) return;
        setOptions((previous) => (append ? [...previous, ...response.data] : response.data));
        setHasMore(response.hasMore);
        pageRef.current = pageNum;
        hasMoreRef.current = response.hasMore;
        loadedQueryRef.current = query;
      } catch {
        if (!isCurrent()) return;
        failedRequestRef.current = request;
        setError('Failed to load results');
      } finally {
        if (isCurrent()) {
          activeRequestRef.current = null;
          setLoading(false);
        }
      }
    },
    [minChars]
  );

  const debouncedLoadOptions = useMemo(
    () =>
      debounce((request: SearchRequest) => {
          loadOptions(request);
      }, debounceMs),
    [loadOptions, debounceMs]
  );

  useEffect(() => () => debouncedLoadOptions.cancel(), [debouncedLoadOptions]);

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);
      // Invalidate responses immediately, including during the debounce delay or a short query.
      generationRef.current += 1;
      const generation = generationRef.current;
      queryRef.current = newInputValue;
      activeRequestRef.current = null;
      loadedQueryRef.current = null;
      failedRequestRef.current = null;
      debouncedLoadOptions.cancel();
      setOptions([]);
      pageRef.current = 1;
      hasMoreRef.current = false;
      setHasMore(false);
      setError(null);
      const request = { query: newInputValue, page: 1, append: false, generation };
      if (!newInputValue) {
        loadOptions(request);
      } else if (newInputValue.length >= minChars) {
        setLoading(true);
        debouncedLoadOptions(request);
      } else {
        setLoading(false);
      }
    },
    [debouncedLoadOptions, loadOptions, minChars]
  );

  const loadMore = useCallback(() => {
    if (hasMoreRef.current && activeRequestRef.current === null) {
      loadOptions({
        query: queryRef.current,
        page: pageRef.current + 1,
        append: true,
        generation: generationRef.current,
      });
    }
  }, [loadOptions]);

  const retry = useCallback(() => {
    if (activeRequestRef.current === null && failedRequestRef.current) {
      loadOptions(failedRequestRef.current);
    }
  }, [loadOptions]);

  useEffect(() => {
    loadOptions({ query: '', page: 1, append: false, generation: generationRef.current });
    return () => {
      generationRef.current += 1;
      activeRequestRef.current = null;
      debouncedLoadOptions.cancel();
    };
    // Initial loading belongs to the mounted picker, not to callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { options, loading, inputValue, handleInputChange, loadMore, hasMore, error, retry };
}
