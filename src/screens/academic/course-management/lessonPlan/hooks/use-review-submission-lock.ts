import { useRef, useState } from 'react';

export function useReviewSubmissionLock() {
  const lockRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);

  const runLocked = async <T>(action: () => Promise<T>): Promise<T | null> => {
    if (lockRef.current) return null;

    lockRef.current = true;
    setIsLocked(true);
    try {
      return await action();
    } finally {
      lockRef.current = false;
      setIsLocked(false);
    }
  };

  return { isLocked, runLocked };
}
