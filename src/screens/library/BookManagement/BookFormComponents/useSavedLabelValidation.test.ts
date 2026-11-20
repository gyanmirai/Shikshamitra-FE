import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { savedLabelValidationKey } from './saved-label-model';
import { useSavedLabelValidation } from './useSavedLabelValidation';

const first = {
  copyId: 'copy-1',
  copyNumber: 1,
  accessionNumber: 'ગુજરાતી-૧',
  barcodeValue: 'saved-scan-1',
  sectionName: 'Fiction',
  shelfName: 'Shelf 1',
};
const second = {
  ...first,
  copyId: 'copy-2',
  copyNumber: 2,
  accessionNumber: 'ગુજરાતી-૨',
  barcodeValue: 'saved-scan-2',
};
it('waits for every current saved barcode to validate before enabling Print', () => {
  const { result } = renderHook(() => useSavedLabelValidation([first, second]));
  expect(result.current.canPrint).toBe(false);
  act(() => result.current.onValidityChange(savedLabelValidationKey(first), true));
  expect(result.current.canPrint).toBe(false);
  act(() => result.current.onValidityChange(savedLabelValidationKey(second), true));
  expect(result.current.canPrint).toBe(true);
});
it('does not let a removed invalid copy block the remaining saved labels', () => {
  const { result, rerender } = renderHook(({ labels }) => useSavedLabelValidation(labels), {
    initialProps: { labels: [first, second] },
  });
  act(() => {
    result.current.onValidityChange(savedLabelValidationKey(first), false);
    result.current.onValidityChange(savedLabelValidationKey(second), true);
  });
  expect(result.current.canPrint).toBe(false);
  rerender({ labels: [second] });
  expect(result.current.canPrint).toBe(true);
});
it('requires validation again when the server changes the scan value for the same copy', () => {
  const { result, rerender } = renderHook(({ labels }) => useSavedLabelValidation(labels), {
    initialProps: { labels: [first] },
  });
  act(() => result.current.onValidityChange(savedLabelValidationKey(first), true));
  expect(result.current.canPrint).toBe(true);
  rerender({ labels: [{ ...first, barcodeValue: 'new-server-scan-value' }] });
  expect(result.current.canPrint).toBe(false);
});
