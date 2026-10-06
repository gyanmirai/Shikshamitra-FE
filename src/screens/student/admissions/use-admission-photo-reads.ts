import { useState, useCallback } from 'react';

/** Keep a pending file read inside the same interaction lock as saving the form. */
export function useAdmissionPhotoReads() {
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const onPhotoReading = useCallback((field: string, reading: boolean) => {
    setPending((current) => {
      const next = new Set(current);
      if (reading) next.add(field);
      else next.delete(field);
      return next;
    });
  }, []);
  return { readingPhoto: pending.size > 0, onPhotoReading };
}
