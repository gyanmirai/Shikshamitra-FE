import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export type useSearchParamReturnType = [Record<string, string>, (obj: Record<string, any>) => void];

export const useSearchParam = (
  defaultValues: Record<string, string> = {}
): useSearchParamReturnType => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const values: Record<string, string> = Object.fromEntries(searchParams.entries());
  const [state, setState] = useState<Record<string, string>>({ ...defaultValues, ...values });
  const setParam = useCallback(
    (obj: Record<string, any> | ((params: Record<string, any>) => Record<string, any>)): void => {
      if (typeof obj === 'function') {
        setState((prevState) => ({
          ...prevState,
          ...obj(prevState),
        }));
      } else {
        setState((pre) => ({ ...pre, ...obj }));
      }
    },
    []
  );

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(state).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    const newPath = `${pathName}?${newSearchParams.toString()}`;
    router.push(newPath);
  }, [pathName, router, searchParams, state]);

  return [state, setParam];
};

// Helper: Parse search params into an object
function parseSearchParams<T>(params: URLSearchParams): T {
  const obj = {} as Record<string, string>;
  Array.from(params.entries()).forEach(([key, value]) => {
    obj[key] = value;
  });
  return obj as T;
}

// Helper: Update search params with new values
function updateSearchParams<T>(params: URLSearchParams, newValues: Partial<T> | T) {
  Object.entries(newValues as any).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });
}

export const useNewSearchParam = <T>(
  defaultValues: T = {} as T
): [T, (obj: T | Partial<T> | ((params: T) => T)) => void, (key: string) => void, () => void] => {
  const originalSearchParams = useSearchParams(); // ReadonlyURLSearchParams
  const pathName = usePathname();
  const router = useRouter();

  // Keep values in ref
  const paramsValues = useRef<T>({
    ...defaultValues,
    ...parseSearchParams<T>(new URLSearchParams(originalSearchParams.toString())),
  });

  // Convert ReadonlyURLSearchParams -> URLSearchParams
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(originalSearchParams.toString());
    updateSearchParams(params, paramsValues.current);
    return params;
  }, [originalSearchParams]);

  const allSearchParams = useMemo(() => parseSearchParams<T>(searchParams), [searchParams]);

  const setSearchParams = useCallback(
    (obj: T | Partial<T> | ((params: T) => T)) => {
      const newParams =
        typeof obj === 'function' ? (obj as (params: T) => T)(allSearchParams) : obj;

      const updatedParams = new URLSearchParams(searchParams.toString());
      updateSearchParams(updatedParams, newParams);

      router.push(`${pathName}?${updatedParams.toString()}`);
    },
    [allSearchParams, searchParams, router, pathName]
  );

  const removeSearchParams = useCallback(() => {
    router.push(pathName);
  }, [router, pathName]);

  const removeSearchParamsByKey = useCallback(
    (key: string) => {
      const updatedParams = new URLSearchParams(searchParams.toString());
      updatedParams.delete(key);

      router.push(`${pathName}?${updatedParams.toString()}`);
    },
    [searchParams, router, pathName]
  );

  return [allSearchParams, setSearchParams, removeSearchParamsByKey, removeSearchParams];
};

// export const useSearchParam = <T>(defaultValues: T = {} as T) => {
//   const nextJsParams = useSearchParams();
//   const router = useRouter();

//   const exitingParams = useMemo(() => new URLSearchParams(nextJsParams.toString()), [nextJsParams]);

//

//   useMemo(() => {
//     updateSearchParams(exitingParams, {
//       ...defaultValues,
//       // ...parseSearchParams<T>(exitingParams),
//     });
//   }, [defaultValues, exitingParams]);

//
//   const getAllParams: () => T = useCallback(
//     () => parseSearchParams(exitingParams),
//     [exitingParams]
//   );

//   const setSearchParams = useCallback(
//     (obj: T | Partial<T> | ((params: T) => T)) => {
//       const newParams = typeof obj === 'function' ? (obj as (params: T) => T)(getAllParams()) : obj;
//       updateSearchParams(exitingParams, newParams);

//       router.push(`${window.location.pathname}?${exitingParams.toString()}`);
//     },
//     [exitingParams, getAllParams, router]
//   );

//   const removeSearchParamsByKey = useCallback(
//     (key: string) => {
//       exitingParams.delete(key);
//
//       router.push(`${window.location.pathname}?${exitingParams.toString()}`);
//     },
//     [exitingParams, router]
//   );

//   return [getAllParams(), setSearchParams, removeSearchParamsByKey] as const;
// };

type ParamsObject = Record<string, string>;

export const useCustomSearchParams = (initialValues?: ParamsObject) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Stabilize initialValues so the effect only runs once on mount
  const initialValuesRef = useRef(initialValues);

  // Apply initial values on first render if keys are missing
  useEffect(() => {
    if (!initialValuesRef.current) return;

    const current = new URLSearchParams(searchParams.toString());
    let hasChanged = false;

    Object.entries(initialValuesRef.current).forEach(([key, value]) => {
      if (!current.has(key)) {
        current.set(key, value);
        hasChanged = true;
      }
    });

    if (hasChanged) {
      router.replace(`?${current.toString()}`); // Replace to avoid new history entry
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount — initialValuesRef is stable

  const getParam = useCallback(
    (key: string): string | null =>
      searchParams.get(key) ?? initialValuesRef.current?.[key] ?? null,
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string): void => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const setMultipleParams = useCallback(
    (newParams: ParamsObject): void => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        params.set(key, value);
      });
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const deleteParam = useCallback(
    (key: string): void => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const getAllParams = useCallback(
    (): ParamsObject => ({
      ...initialValuesRef.current,
      ...Object.fromEntries(searchParams.entries()),
    }),
    [searchParams]
  );

  return {
    getParam,
    setParam,
    deleteParam,
    getAllParams,
    setMultipleParams,
  };
};
