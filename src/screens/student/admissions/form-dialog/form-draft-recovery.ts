import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

const DRAFT_SCHEMA_VERSION = 1;
const DRAFT_PREFIX = 'admission-form-builder-draft';

type SavedAdmissionFormDraft = {
  schemaVersion: number;
  savedAt: string;
  values: CreateUpdateAdmissionForm;
};

export function useAdmissionFormDraftOwner() {
  return useSelector((state: RootState) => {
    const user = state.auth.user as {
      sub?: string;
      organizationName?: string;
      tenantId?: string;
    } | null;
    return [user?.organizationName ?? user?.tenantId ?? 'tenant', user?.sub ?? 'user'].join(':');
  });
}

export function getAdmissionFormDraftStorageKey(owner: string, formId?: string | null) {
  return `${DRAFT_PREFIX}:${encodeURIComponent(owner)}:${formId ?? 'new'}`;
}

export function readAdmissionFormDraft(storageKey: string): SavedAdmissionFormDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<SavedAdmissionFormDraft>;
    if (
      parsed.schemaVersion !== DRAFT_SCHEMA_VERSION ||
      typeof parsed.savedAt !== 'string' ||
      !parsed.values ||
      typeof parsed.values !== 'object' ||
      !Array.isArray(parsed.values.sections)
    ) {
      window.localStorage.removeItem(storageKey);
      return null;
    }
    return parsed as SavedAdmissionFormDraft;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function clearAdmissionFormDraft(owner: string, formId?: string | null) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getAdmissionFormDraftStorageKey(owner, formId));
}

export function useAdmissionFormDraftRecovery(
  formik: FormikProps<CreateUpdateAdmissionForm>,
  owner: string,
  formId?: string | null
) {
  const storageKey = getAdmissionFormDraftStorageKey(owner, formId);
  const [candidate, setCandidate] = useState<SavedAdmissionFormDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = readAdmissionFormDraft(storageKey);
    setCandidate(saved);
    setSavedAt(saved?.savedAt ?? null);
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || candidate || !formik.dirty) return undefined;
    const timer = window.setTimeout(() => {
      const nextSavedAt = new Date().toISOString();
      const draft: SavedAdmissionFormDraft = {
        schemaVersion: DRAFT_SCHEMA_VERSION,
        savedAt: nextSavedAt,
        values: formik.values,
      };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
        setSavedAt(nextSavedAt);
      } catch {
        // Saving to the browser is a convenience; the explicit server save remains authoritative.
      }
    }, 750);
    return () => window.clearTimeout(timer);
  }, [candidate, formik.dirty, formik.values, hydrated, storageKey]);

  const restore = async () => {
    if (!candidate) return;
    await formik.setValues(candidate.values);
    formik.setTouched({});
    setCandidate(null);
    setSavedAt(candidate.savedAt);
  };

  const discard = () => {
    window.localStorage.removeItem(storageKey);
    setCandidate(null);
    setSavedAt(null);
  };

  return { candidate, savedAt, restore, discard };
}
