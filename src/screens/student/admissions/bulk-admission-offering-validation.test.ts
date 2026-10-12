import type { BulkAdmissionOfferingResult } from 'src/redux/student/admissions/admission-offerings-api';

import { it, expect, describe } from 'vitest';

import { getBulkOfferingFieldIssues } from './bulk-admission-offering-validation';

const item = {
  standardId: 'class-1',
  code: 'ADM-CLASS-1',
  isValid: false,
  canSaveInactive: false,
  canActivate: false,
  errors: [],
};
const result = (items: BulkAdmissionOfferingResult['items']): BulkAdmissionOfferingResult => ({
  items,
  isPreview: true,
  canCommit: false,
  createdCount: 0,
});
const names = { 'class-1': 'Class 1', 'class-2': 'Class 2' };

describe('Bulk offering field feedback', () => {
  it('shows an RTE routing error under Admission type without a Starts with control', () => {
    expect(
      getBulkOfferingFieldIssues(
        result([
          {
            ...item,
            errors: [
              {
                code: 'RteRequiresDirectRegistration',
                message: 'RTE must start with registration.',
              },
            ],
          },
        ]),
        names
      )
    ).toEqual({
      track: { message: 'RTE must start with registration.', blocking: true },
    });
  });

  it('maps shared configuration once and attaches duplicates to the Class field with class names', () => {
    const errors = [
      { code: 'InquiryFormMissing', message: 'Published Inquiry Form is required.' },
      { code: 'Duplicate', message: 'An offering already exists.' },
    ];
    expect(
      getBulkOfferingFieldIssues(
        result([
          { ...item, errors: [...errors, errors[1]] },
          { ...item, standardId: 'class-2', errors },
        ]),
        names
      )
    ).toEqual({
      inquiryFormDefinitionId: { message: errors[0].message, blocking: false },
      standardIds: { message: 'Class 1, Class 2: An offering already exists.', blocking: true },
    });
  });

  it('identifies the affected class for a partial configuration failure', () => {
    const issues = getBulkOfferingFieldIssues(
      result([
        {
          ...item,
          errors: [
            {
              code: 'CounsellorAssignmentProfileInvalid',
              message: 'Counsellor cannot access this class.',
            },
          ],
        },
        { ...item, standardId: 'class-2', canSaveInactive: true },
      ]),
      names
    );
    expect(issues.inquiryIntakeProfileId).toEqual({
      message: 'Class 1: Counsellor cannot access this class.',
      blocking: true,
    });
  });

  it('keeps activation-only checks non-blocking when the server permits inactive creation', () => {
    expect(
      getBulkOfferingFieldIssues(
        result([
          {
            ...item,
            canSaveInactive: true,
            errors: [
              {
                code: 'CounsellorAssignmentProfileInvalid',
                message: 'Choose an active counsellor before activation.',
              },
            ],
          },
        ]),
        names
      ).inquiryIntakeProfileId?.blocking
    ).toBe(false);
  });

  it('maps published forms and workflow-owned registration errors to the controlling fields', () => {
    const issues = getBulkOfferingFieldIssues(
      result([
        {
          ...item,
          errors: [
            {
              code: 'ApplicationFormNotPublished',
              message: 'Choose a published registration form in the workflow.',
            },
            { code: 'InquiryFormPurposeMismatch', message: 'Use an Inquiry form.' },
            { code: 'DateRangeInvalid', message: 'Dates must be within the cycle.' },
          ],
        },
      ]),
      names
    );
    expect(issues.workflowDefinitionId?.message).toContain('registration form');
    expect(issues.inquiryFormDefinitionId?.message).toBe('Use an Inquiry form.');
    expect(issues.admissionCycle?.message).toBe('Dates must be within the cycle.');
    expect(issues.closeDate).toBeUndefined();
  });

  it('does not invent a field for unknown server rules or empty previews', () => {
    expect(
      getBulkOfferingFieldIssues(
        result([{ ...item, errors: [{ code: 'NewRule', message: 'New rule.' }] }]),
        names
      )
    ).toEqual({});
    expect(getBulkOfferingFieldIssues(null, names)).toEqual({});
  });
});
