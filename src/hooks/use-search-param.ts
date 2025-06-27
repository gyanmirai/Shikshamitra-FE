import type { ReadonlyURLSearchParams } from 'next/navigation';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { isJSONStringified } from 'src/utils/is-json-string';

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

function isFunction<T>(
  value: T | Partial<T> | ((params: T) => T) | (T & Function)
): value is (params: T) => T {
  return typeof value === 'function';
}

// Utility function to parse URLSearchParams into an object
const parseSearchParams = <T>(params: URLSearchParams): T => {
  const parsedParams: Record<string, any> = {};
  params.forEach((value, key) => {
    try {
      parsedParams[key] =
        value === 'true' || value === 'false'
          ? value === 'true'
          : isJSONStringified(value)
            ? JSON.parse(value)
            : value;
    } catch {
      parsedParams[key] = value; // Fallback to original value if JSON parsing fails
    }
  });
  return parsedParams as T;
};

const updateSearchParams = <T>(params: URLSearchParams, updates: T | Partial<T>) => {
  Object.entries(updates as Object).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    } else {
      params.delete(key);
    }
  });
};

export const useNewSearchParam = <T>(
  defaultValues: T = {} as T
): [T, (obj: T | Partial<T> | ((params: T) => T)) => void, (key: string) => void, () => void] => {
  const originalSearchParams = useSearchParams();

  const pathName = usePathname();
  const router = useRouter();
  const paramsValues = useRef<T>({
    ...defaultValues,
    ...parseSearchParams(new URLSearchParams(originalSearchParams.toString())),
  });

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

      // paramsValues.current = parseSearchParams<T>(updatedParams);

      router.push(`${pathName}?${updatedParams.toString()}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSearchParams, searchParams]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const removeSearchParams = useCallback(() => router.push(pathName), []);

  const removeSearchParamsByKey = useCallback(
    (key: string) => {
      searchParams.delete(key);
      delete (allSearchParams as Record<string, string>)[key];
      router.push(`${pathName}?${searchParams.toString()}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );
  return [allSearchParams, setSearchParams, removeSearchParamsByKey, removeSearchParams];
};

export const convertNextJsParamsToObject = (param: ReadonlyURLSearchParams) => {
  const params = new URLSearchParams(param.toString());
  const parsedParams: Record<string, any> = {};
  if (params.size > 0) {
    params.entries().forEach(([key, value]) => {
      if (value === 'true' || value === 'false') {
        parsedParams[key] = value === 'true';
      } else if (isJSONStringified(value)) {
        parsedParams[key] = JSON.parse(value);
      } else {
        parsedParams[key] = value;
      }
    });
  }

  return parsedParams;
};

// export const useSearchParam = <T>(defaultValues: T = {} as T) => {
//   const nextJsParams = useSearchParams();
//   const router = useRouter();

//   const exitingParams = useMemo(() => new URLSearchParams(nextJsParams.toString()), [nextJsParams]);

//   console.log(exitingParams, 'exitingParams');

//   useMemo(() => {
//     updateSearchParams(exitingParams, {
//       ...defaultValues,
//       // ...parseSearchParams<T>(exitingParams),
//     });
//   }, [defaultValues, exitingParams]);

//   console.log('🚀 ~ file: use-search-param.ts:170 ~ exitingParams:', exitingParams.toString());
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
//       console.log(key, 'removeSearchParamsByKey=======', exitingParams.toString());
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

  // Apply initial values on first render if keys are missing
  useEffect(() => {
    if (!initialValues) return;

    const current = new URLSearchParams(searchParams.toString());
    let hasChanged = false;

    Object.entries(initialValues).forEach(([key, value]) => {
      if (!current.has(key)) {
        current.set(key, value);
        hasChanged = true;
      }
    });

    if (hasChanged) {
      router.replace(`?${current.toString()}`); // Replace to avoid new history entry
    }
  }, [initialValues, searchParams, router]);

  const getParam = (key: string): string | null => searchParams.get(key);

  const setParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  const deleteParam = (key: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const getAllParams = (): ParamsObject => Object.fromEntries(searchParams.entries());

  return {
    getParam,
    setParam,
    deleteParam,
    getAllParams,
  };
};
