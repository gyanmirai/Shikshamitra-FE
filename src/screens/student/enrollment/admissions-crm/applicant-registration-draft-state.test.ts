import { it, expect, describe } from 'vitest';

import {
  hasApplicantRegistrationDraft,
  type ApplicantRegistrationDraftState,
} from './applicant-registration-draft-state';

const cleanDraft = (): ApplicantRegistrationDraftState => ({
  issueFormOpen: false,
  registrationTemplateId: '',
  seriesId: '',
  checklistTemplateId: '',
  reason: '',
  correctionFields: '',
  newExpiry: '2026-08-07',
  initialNewExpiry: '2026-08-07',
  reissueDays: 14,
  initialReissueDays: 14,
  paymentReference: '',
  overrideReadiness: false,
  documentReasonByKey: {},
  documentFileByKey: {},
  documentValidUntilByKey: {},
});

describe('applicant registration draft state', () => {
  it('keeps an untouched registration workspace clean', () => {
    expect(hasApplicantRegistrationDraft(cleanDraft())).toBe(false);
  });

  it.each([
    ['open issue form', { issueFormOpen: true }],
    ['registration template', { registrationTemplateId: 'template-id' }],
    ['number series', { seriesId: 'series-id' }],
    ['checklist template', { checklistTemplateId: 'checklist-id' }],
    ['shared reason', { reason: 'Needs review' }],
    ['correction fields', { correctionFields: 'lastName' }],
    ['new expiry', { newExpiry: '2026-08-08' }],
    ['reissue validity', { reissueDays: 30 }],
    ['payment reference', { paymentReference: 'PAY-42' }],
    ['readiness override', { overrideReadiness: true }],
    ['document decision', { documentReasonByKey: { birthCertificate: 'Unreadable' } }],
    ['selected file', { documentFileByKey: { birthCertificate: { name: 'proof.pdf' } } }],
    ['document validity', { documentValidUntilByKey: { residenceProof: '2027-01-01' } }],
  ] satisfies Array<[string, Partial<ApplicantRegistrationDraftState>]>)(
    'marks %s as unsaved',
    (_, change) => {
      expect(hasApplicantRegistrationDraft({ ...cleanDraft(), ...change })).toBe(true);
    }
  );

  it('ignores whitespace-only text drafts', () => {
    expect(
      hasApplicantRegistrationDraft({
        ...cleanDraft(),
        reason: '  ',
        correctionFields: '\t',
        paymentReference: '\n',
        documentReasonByKey: { birthCertificate: ' ' },
        documentValidUntilByKey: { residenceProof: '' },
      })
    ).toBe(false);
  });
});
