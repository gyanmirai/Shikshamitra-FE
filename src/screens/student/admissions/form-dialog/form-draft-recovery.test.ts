import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe, beforeEach } from 'vitest';

import {
  readAdmissionFormDraft,
  clearAdmissionFormDraft,
  getAdmissionFormDraftStorageKey,
} from './form-draft-recovery';

describe('admission form draft recovery', () => {
  beforeEach(() => window.localStorage.clear());

  it('scopes drafts by tenant, user, and form', () => {
    expect(getAdmissionFormDraftStorageKey('school-a:user-1', 'form-1')).not.toBe(
      getAdmissionFormDraftStorageKey('school-b:user-1', 'form-1')
    );
    expect(getAdmissionFormDraftStorageKey('school-a:user-1')).toContain(':new');
  });

  it('reads a structurally valid current draft', () => {
    const key = getAdmissionFormDraftStorageKey('school-a:user-1', 'form-1');
    const values = { name: 'Recovered', sections: [] } as unknown as CreateUpdateAdmissionForm;
    window.localStorage.setItem(
      key,
      JSON.stringify({ schemaVersion: 1, savedAt: '2026-09-16T10:00:00.000Z', values })
    );

    expect(readAdmissionFormDraft(key)?.values.name).toBe('Recovered');
  });

  it('removes incompatible drafts instead of restoring unsafe data', () => {
    const key = getAdmissionFormDraftStorageKey('school-a:user-1', 'form-1');
    window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 0, values: {} }));

    expect(readAdmissionFormDraft(key)).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it('clears a draft after an explicit server save', () => {
    const key = getAdmissionFormDraftStorageKey('school-a:user-1', 'form-1');
    window.localStorage.setItem(key, 'saved');
    clearAdmissionFormDraft('school-a:user-1', 'form-1');
    expect(window.localStorage.getItem(key)).toBeNull();
  });
});
