import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { vi, it, expect, describe } from 'vitest';

import { inquiryWorkState } from './admission-inquiry-work-state';
import {
  getAdmissionInquiryActions,
  buildAdmissionInquiryColumns,
} from './admission-inquiry-columns';

const columnOptions = {
  canManage: true,
  canAssign: true,
  canCommunicate: true,
  isMarkingContacted: false,
  counsellorNames: {},
  counsellorOptions: [],
  offeringOptions: [],
  onOpenApplicant360: vi.fn(),
  onManage: vi.fn(),
  onAssign: vi.fn(),
  onCommunicate: vi.fn(),
  onMarkContacted: vi.fn(),
};

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

describe('admission inquiry columns', () => {
  it('keeps identity left, operations right, and moves next action into Actions', () => {
    const columns = buildAdmissionInquiryColumns(columnOptions);

    expect(columns.map((column) => column.id)).not.toContain('work');
    expect(columns.map((column) => column.id)).not.toContain('lastActivityAt');
    expect(columns.find((column) => column.id === 'inquiryNumber')).toMatchObject({
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
    });
    expect(columns.find((column) => column.id === 'applicantName')).toMatchObject({
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
    });
    expect(columns.slice(-2).map((column) => column.id)).toEqual(['status', 'actions']);
    expect(columns.slice(-2).every((column) => column.stickyPosition === 'right')).toBe(true);
    expect(columns.find((column) => column.id === 'status')?.stickyOnMobile).toBe(false);
    expect(columns.find((column) => column.id === 'actions')?.stickyOnMobile).not.toBe(false);
    expect(columns.find((column) => column.id === 'actions')).toMatchObject({
      width: 152,
      maxWidth: 152,
    });
  });

  it('supplies every permitted action in the existing order', () => {
    const actions = getAdmissionInquiryActions(
      inquiry({ applicantId: 'applicant-1', admissionOfferingId: 'offering-1', status: 0 }),
      columnOptions
    );

    expect(actions.map((action) => action.id)).toEqual([
      'applicant360',
      'manage',
      'assign',
      'communicate',
      'markContacted',
    ]);
  });

  it('omits unavailable assignment and contact actions', () => {
    const actions = getAdmissionInquiryActions(inquiry({ applicantId: 'applicant-1', status: 2 }), {
      ...columnOptions,
      canAssign: false,
    });

    expect(actions.map((action) => action.id)).toEqual(['applicant360', 'manage', 'communicate']);
  });
});
