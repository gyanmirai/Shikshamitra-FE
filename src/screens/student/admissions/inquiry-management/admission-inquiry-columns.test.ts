import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { it, expect, describe } from 'vitest';

import { inquiryWorkState } from './admission-inquiry-work-state';

function inquiry(overrides: Partial<AdmissionInquiry> = {}): AdmissionInquiry {
  return {
    id: 'inquiry-1',
    concurrencyStamp: 'stamp-1',
    inquiryNumber: 'INQ-1',
    admissionCycleId: 'cycle-1',
    admissionCycleName: '2026-27',
    applicantName: 'Riya Shah',
    normalizedPhone: '9876543210',
    preferredLanguageCode: 'en',
    source: 0,
    status: 0,
    creationTime: '2026-09-16T09:00:00Z',
    managed: true,
    needsFirstContact: false,
    needsQualification: false,
    openFollowUpCount: 0,
    isFirstContactOverdue: false,
    isQualificationOverdue: false,
    hasOverdueFollowUp: false,
    isOverdue: false,
    ...overrides,
  };
}

describe('inquiryWorkState', () => {
  it('prioritizes overdue follow-up work', () => {
    expect(
      inquiryWorkState(
        inquiry({
          hasOverdueFollowUp: true,
          isFirstContactOverdue: true,
          openFollowUpCount: 1,
          nextFollowUpAt: '2026-09-15T10:00:00Z',
        })
      ).label
    ).toBe('Follow-up overdue');
  });

  it('shows first-contact work even when no SLA deadline is configured', () => {
    expect(inquiryWorkState(inquiry({ needsFirstContact: true })).label).toBe(
      'Awaiting first contact'
    );
  });

  it('does not show qualification work after an outcome is recorded', () => {
    expect(
      inquiryWorkState(
        inquiry({
          qualificationDueAt: '2026-09-16T10:00:00Z',
          qualificationOutcome: 1,
        })
      ).label
    ).toBe('Managed inquiry');
  });
});
