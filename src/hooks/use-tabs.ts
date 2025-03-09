import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseTabsReturn = {
  value: string | number;
  setValue: React.Dispatch<React.SetStateAction<string | number>>;
  onChange: (event: React.SyntheticEvent, newValue: string | number) => void;
};

export function useTabs(defaultValue: string | number): UseTabsReturn {
  const [value, setValue] = useState(defaultValue);
  console.log('value---', value);

  const onChange = useCallback((event: React.SyntheticEvent, newValue: string | number) => {
    setValue(newValue);
  }, []);

  const memoizedValue = useMemo(() => ({ value, setValue, onChange }), [onChange, value]);
  console.log('memoizedValue---', memoizedValue);

  return memoizedValue;
}
