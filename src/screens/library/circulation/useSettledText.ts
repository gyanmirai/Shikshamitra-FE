import { useState, useEffect } from 'react';

export function useSettledText(value: string) {
  const [settled, setSettled] = useState(value.trim());
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [value]);
  return settled;
}
