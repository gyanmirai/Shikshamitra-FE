import { useState, useEffect } from 'react';

// Keep controls responsive while router navigation catches up, and honor later URL navigation.
export function useUrlFilterValue(urlValue: string) {
  const [value, setValue] = useState(urlValue);
  useEffect(() => setValue(urlValue), [urlValue]);
  return [value, setValue] as const;
}
