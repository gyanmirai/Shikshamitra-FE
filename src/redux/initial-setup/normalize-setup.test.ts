import { it, expect, describe } from 'vitest';

import { normalizeSetupDraft, normalizeSetupInput, normalizeInitialSetup } from './normalize-setup';

import type { SetupDraft, InitialSetup } from './types';

const draft: SetupDraft = {
  profile: {
    instituteName: 'Test School',
    email: 'office@example.test',
    contactNumber: '9876543210',
    address1: 'Test Road',
    address2: '',
    address3: '',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    postalCode: '395001',
  },
  yearName: '2026-2027',
  startDate: '2026-04-01T00:00:00Z',
  endDate: '2027-03-31T00:00:00Z',
  boardType: 0,
  customBoardName: '',
  medium: 'English',
  stage: 'Primary',
  className: 'Class 1',
  ageLowerLimit: 6,
  divisionName: 'A',
  strength: 30,
};

describe('initial setup draft boundary', () => {
  it('drops a legacy room from loaded and reloaded snapshots without marking the draft dirty', () => {
    const legacy = { ...draft, roomNumber: 'Legacy room' };
    const snapshot: InitialSetup = {
      isCompleted: false,
      canManageSetup: true,
      currentStep: 3,
      furthestStep: 3,
      schoolCode: 'SCHOOL_01',
      concurrencyStamp: 'saved-stamp',
      academicYearId: null,
      divisionId: null,
      completedAt: null,
      createdUsers: [],
      draft: legacy,
    };
    const response = normalizeInitialSetup(snapshot);
    expect(response.draft).not.toHaveProperty('roomNumber');
    expect(response.draft.className).toBe('Class 1');
    expect(JSON.stringify(normalizeSetupDraft(response.draft))).toBe(
      JSON.stringify(response.draft)
    );
  });

  it('never sends a legacy room through autosave or academic structure submission', () => {
    const result = normalizeSetupInput({
      draft: { ...draft, roomNumber: 'Legacy room' },
      currentStep: 3,
      concurrencyStamp: 'saved-stamp',
    });
    expect(result.draft).not.toHaveProperty('roomNumber');
    expect(result).toMatchObject({ currentStep: 3, concurrencyStamp: 'saved-stamp' });
    expect(normalizeSetupInput({ userName: 'teacher' })).toEqual({ userName: 'teacher' });
  });

  it('defaults older snapshots that have no custom board name to a stable empty value', () => {
    const legacy = { ...draft };
    Reflect.deleteProperty(legacy, 'customBoardName');
    expect(normalizeSetupDraft(legacy).customBoardName).toBe('');
  });
});
