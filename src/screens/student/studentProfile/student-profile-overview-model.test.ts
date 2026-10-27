import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { it, expect, describe } from 'vitest';

import { profileOverviewContacts } from './student-profile-overview-model';
import {
  contactDraft,
  contactPayload,
  mainContactRelationship,
} from './student-parents-contact-model';

const family = {
  fatherDetails: {
    fullName: 'Father',
    email: 'father@example.test',
    contactNo: '+919000000001',
    occupation: 'Teacher',
  },
  motherDetails: { fullName: 'Mother', email: 'mother@example.test', contactNo: '+919000000002' },
  guardianDetails: { fullName: 'Aunt', email: 'aunt@example.test', contactNo: '+919000000003' },
  guardianRelationship: 'Aunt',
  mainContactRelationship: 'guardian',
  siblingStudentIds: ['sibling-1'],
  isSingleParent: false,
};
const details = (data: Record<string, unknown>): StudentRecordDetails => ({
  studentId: 'student-1',
  recordsAccess: 'Full',
  customDetailsMasked: false,
  customDetailsEditable: false,
  registrationSources: [],
  structuredSections: [{ section: 'family', hasData: true, isMasked: false, canEdit: true, data }],
});

describe('parents and main school contact', () => {
  it('shows the explicitly selected guardian with its own mailbox even when both parents exist', () => {
    expect(profileOverviewContacts(details(family))).toEqual(
      expect.arrayContaining([
        { label: 'Main contact', value: 'Aunt' },
        { label: 'Relationship', value: 'Aunt' },
        { label: 'Phone', value: '+919000000003' },
        { label: 'Email', value: 'aunt@example.test' },
        { label: 'Father', value: 'Father' },
        { label: 'Mother', value: 'Mother' },
      ])
    );
  });
  it('defaults to the only saved parent and requires a choice when both parents exist', () => {
    expect(
      mainContactRelationship({
        fatherDetails: family.fatherDetails,
        guardianDetails: family.guardianDetails,
      })
    ).toBe('father');
    expect(
      mainContactRelationship({
        fatherDetails: family.fatherDetails,
        motherDetails: family.motherDetails,
      })
    ).toBe('');
  });
  it('recognizes contact-only parent profiles and never uses the student mailbox', () => {
    const result = profileOverviewContacts(
      details({ fatherDetails: { email: 'father@example.test' } })
    );
    expect(result).toContainEqual({ label: 'Email', value: 'father@example.test' });
    expect(result).toContainEqual({ label: 'Main contact', value: undefined });
  });
  it('keeps a saved contact selection explicit rather than silently switching a missing adult', () => {
    expect(
      mainContactRelationship({
        fatherDetails: family.fatherDetails,
        mainContactRelationship: 'mother',
      })
    ).toBe('');
  });
  it('preserves full source profiles, sibling links and every unrelated snapshot field', () => {
    const draft = contactDraft(family);
    draft.father.fullName = 'Corrected father';
    draft.mainContactRelationship = 'father';
    expect(contactPayload(family, draft)).toEqual({
      ...family,
      fatherDetails: { ...family.fatherDetails, fullName: 'Corrected father' },
      mainContactRelationship: 'father',
    });
  });
  it('adds a guardian without copying another persons email or replacing the parents', () => {
    const source = { fatherDetails: family.fatherDetails, siblingStudentIds: ['sibling-1'] };
    const draft = contactDraft(source);
    draft.guardian = {
      enabled: true,
      fullName: 'Grandparent',
      email: '',
      contactNo: '+919000000004',
    };
    draft.guardianRelationship = 'Grandmother';
    draft.mainContactRelationship = 'guardian';
    expect(contactPayload(source, draft)).toEqual({
      ...source,
      mainContactRelationship: 'guardian',
      guardianRelationship: 'Grandmother',
      guardianDetails: { fullName: 'Grandparent', email: null, contactNo: '+919000000004' },
    });
  });
  it('sends an explicit empty relationship when staff clear a saved guardian relationship', () => {
    const draft = contactDraft(family);
    draft.guardianRelationship = '   ';
    expect(contactPayload(family, draft)).toEqual({ ...family, guardianRelationship: '' });
  });
  it.each([null, undefined, ''])(
    'preserves an untouched legacy guardian relationship %s',
    (relationship) => {
      const source = { ...family, guardianRelationship: relationship };
      expect(contactPayload(source, contactDraft(source))).toEqual(source);
    }
  );
  it.each(['Summary', 'Full'] as const)(
    'does not disclose masked family data with %s access',
    (access) => {
      const restricted = details(family);
      restricted.recordsAccess = access;
      restricted.structuredSections[0].isMasked = true;
      expect(
        profileOverviewContacts(restricted)
          .slice(0, 7)
          .every((field) => field.value === 'Restricted')
      ).toBe(true);
    }
  );
});
