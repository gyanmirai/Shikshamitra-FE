import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export const useSearchParam = (
  defaultValues: Record<string, string> = {}
): [Record<string, string>, (obj: Record<string, string>) => void] => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const values: Record<string, string> = Object.fromEntries(searchParams.entries());
  const [state, setState] = useState<Record<string, string>>({ ...defaultValues, ...values });
  const setParam = useCallback(
    (
      obj: Record<string, string> | ((params: Record<string, string>) => Record<string, string>)
    ): void => {
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
