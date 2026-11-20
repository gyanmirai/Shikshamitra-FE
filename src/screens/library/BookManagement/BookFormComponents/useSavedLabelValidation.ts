import { useState } from 'react';

import { savedLabelValidationKey } from './saved-label-model';

import type { SavedLabel } from './saved-label-model';

export function useSavedLabelValidation(labels: SavedLabel[]) {
  const [validity, setValidity] = useState<Record<string, boolean>>({});
  const onValidityChange = (key: string, valid: boolean) =>
    setValidity((current) => (current[key] === valid ? current : { ...current, [key]: valid }));
  const current = labels.map((label) => validity[savedLabelValidationKey(label)]);
  const isPreparing = current.some((valid) => valid === undefined);
  const invalidCount = current.filter((valid) => valid === false).length;
  return {
    onValidityChange,
    isPreparing,
    invalidCount,
    canPrint: labels.length > 0 && !isPreparing && invalidCount === 0,
  };
}
