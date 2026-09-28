import { it, expect, describe } from 'vitest';

import { profileSectionPayload } from './profile-section-payload';

describe('student profile section payloads', () => {
  it('keeps governed placement out of general profile saves', () => {
    const result = profileSectionPayload(
      0,
      {
        formNo: 'QA-1', firstName: 'Om', middleName: '', lastName: 'TestGen10',
        primaryContactNumber: '9999999999', city: { name: 'Pune' },
        state: { name: 'Maharashtra', isoCode: 'MH' },
        country: { name: 'India', isoCode: 'IN' },
      },
      { standardId: 'original-standard', divisionId: 'original-division',
        previousSchool: 'Existing school', lastClassPassed: 'UKG' }
    );

    expect(result).toMatchObject({
      firstName: 'Om', formNumber: 'QA-1', city: 'Pune',
      previousSchool: 'Existing school', lastClassPassed: 'UKG',
    });
    expect(result.standardId).toBeUndefined();
    expect(result.divisionId).toBeUndefined();
    expect(result.castCategory).toBe(0);
  });

  it('preserves hidden previous-school fields while saving the visible reason', () => {
    const result = profileSectionPayload(5, { reasonForLeaving: 'QA verification' },
      { academicYear: '2024-25', remarks: 'Existing note' });
    expect(result.academicYear).toBe('2024-25');
    expect(result.remarks).toBe('Existing note');
    expect(result.reasonForLeaving).toBe('QA verification');
  });

  it('maps parent local and office addresses separately', () => {
    const result = profileSectionPayload(1, {
      fatherName: 'QA Parent', fatherAddress1: 'Home 1', fatherOfficeAddress1: 'Office 2',
      fatherLocalCity: { name: 'Pune' }, fatherOfficeCity: { name: 'Mumbai' },
      siblingStudents: [{ id: 'sibling-id', label: 'Sibling' }],
    });
    expect(result.fatherDetails.localAddress).toMatchObject({ address1: 'Home 1', city: 'Pune' });
    expect(result.fatherDetails.officeAddress).toMatchObject({ address1: 'Office 2', city: 'Mumbai' });
    expect(result.siblingStudentIds).toEqual(['sibling-id']);
  });

  it('uses null for cleared medical measurements', () => {
    const result = profileSectionPayload(4, { weight: '', height: '125', pulseRate: '80' });
    expect(result.weightKg).toBeNull();
    expect(result.heightCm).toBe(125);
    expect(result.pulseRate).toBe(80);
  });
});
