import { useRef, useState } from 'react';

export function useCommandAttempt<T extends object>() {
  const saved = useRef(new Map<string, T & { idempotencyKey: string }>());
  const [uncertain, setUncertain] = useState<ReadonlySet<string>>(new Set());
  const [conflict, setConflict] = useState(false);
  return {
    conflict,
    retry: (fingerprint: string) =>
      uncertain.has(fingerprint) ? saved.current.get(fingerprint) : undefined,
    prepare: (fingerprint: string, body: T) => {
      const existing = saved.current.get(fingerprint);
      if (existing) return existing;
      const next = { ...body, idempotencyKey: crypto.randomUUID() };
      saved.current.set(fingerprint, next);
      return next;
    },
    failed: (fingerprint: string, cause: unknown) => {
      const status =
        cause && typeof cause === 'object' && 'status' in cause ? cause.status : undefined;
      const ambiguous = typeof status !== 'number' || status >= 500;
      setUncertain((current) => {
        const next = new Set(current);
        if (ambiguous) next.add(fingerprint);
        else next.delete(fingerprint);
        return next;
      });
      setConflict(status === 409);
      if (!ambiguous) saved.current.delete(fingerprint);
    },
    reviewed: () => {
      setConflict(false);
    },
  };
}
