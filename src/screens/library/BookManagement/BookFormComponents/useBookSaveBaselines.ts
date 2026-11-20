import { useRef } from 'react';

import { copiesFingerprint, generalFingerprint } from './book-save-fingerprints';

import type { BookFormValues } from '../Components/type';

export function useBookSaveBaselines(values: BookFormValues) {
  const saved = useRef<{ general: string; copies: string } | null>(null);
  // Capture once: typing metadata must not serialize every persisted copy on each render.
  if (saved.current === null)
    saved.current = {
      general: generalFingerprint(values),
      copies: copiesFingerprint(values),
    };
  return saved.current;
}
