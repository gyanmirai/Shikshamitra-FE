import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { vi, it, assert, expect, describe } from 'vitest';

import { inquiryWorkState } from './admission-inquiry-work-state';
import {
  getAdmissionInquiryActions,
  buildAdmissionInquiryColumns,
} from './admission-inquiry-columns';

const columnOptions = {
  canManage: true,
  canMove: true,
  isMoving: false,
  counsellorNames: {},
  counsellorOptions: [],
  offeringOptions: [],
  onManage: vi.fn(),
  onFollowUp: vi.fn(),
  onMove: vi.fn(),
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
  it('shows progress only on the moving inquiry and blocks competing actions', () => {
    const options = { ...columnOptions, isMoving: true, movingInquiryId: 'inquiry-1' };
    const moving = getAdmissionInquiryActions(inquiry(), options);
    expect(moving.find((action) => action.id === 'move')).toMatchObject({
      loading: true,
      disabled: true,
      tooltip: 'Moving inquiry…',
    });
    expect(moving.every((action) => action.disabled)).toBe(true);
    expect(
      getAdmissionInquiryActions(inquiry({ id: 'inquiry-2' }), options).find(
        (action) => action.id === 'move'
      )
    ).toMatchObject({ loading: false, disabled: true });
  });
  it('shows the selected class name without offering or cycle details', () => {
    const column = buildAdmissionInquiryColumns(columnOptions).find(
      (item) => item.id === 'standardName'
    )!;
    const row = inquiry({
      standardName: '1',
      admissionOfferingCode: 'ADM-CLASS-1',
      admissionCycleName: 'General Admission Cycle',
    });
    expect(column.render?.(row.admissionOfferingId, row)).toBe('1');
    expect(column.render?.(undefined, inquiry({ standardName: 'LKG' }))).toBe('LKG');
    expect(column.render?.(undefined, inquiry())).toBe('—');
  });

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
    expect(columns.find((column) => column.id === 'status')?.stickyOnMobile).not.toBe(false);
    expect(columns.find((column) => column.id === 'actions')?.stickyOnMobile).not.toBe(false);
    expect(columns.find((column) => column.id === 'actions')).toMatchObject({
      width: 152,
      maxWidth: 152,
    });
  });

  it('separates edit and follow-up with a disabled handoff for Pending', () => {
    const actions = getAdmissionInquiryActions(
      inquiry({ applicantId: 'applicant-1', admissionOfferingId: 'offering-1' }),
      columnOptions
    );
    expect(actions.map((action) => action.id)).toEqual(['edit', 'follow-up', 'move']);
    assert.exists(actions[0].onClick, 'Edit must have a click handler.');
    assert.exists(actions[1].onClick, 'Follow-up must have a click handler.');
    actions[0].onClick();
    actions[1].onClick();
    expect(columnOptions.onManage).toHaveBeenCalled();
    expect(columnOptions.onFollowUp).toHaveBeenCalled();
    expect(actions[2]).toMatchObject({
      disabled: true,
      tooltip: expect.stringContaining('Interested'),
    });
  });
  it('allows Interested handoff only with applicant and offering and prevents repeats', () => {
    const row = inquiry({
      applicantId: 'applicant-1',
      admissionOfferingId: 'offering-1',
      status: 2,
    });
    expect(getAdmissionInquiryActions(row, columnOptions)[2].disabled).toBe(false);
    expect(
      getAdmissionInquiryActions(
        { ...row, applicationId: 'app-1', isTransferred: true },
        columnOptions
      )[2].disabled
    ).toBe(true);
    expect(getAdmissionInquiryActions({ ...row, status: 6 }, columnOptions)[2].disabled).toBe(true);
  });
  it('omits mutation actions without permissions and opens application from Pipeline', () => {
    expect(
      getAdmissionInquiryActions(inquiry(), { ...columnOptions, canManage: false, canMove: false })
    ).toEqual([]);
    const row = inquiry({ applicationId: 'app-1', isTransferred: true });
    const actions = getAdmissionInquiryActions(row, { ...columnOptions, pipeline: true });
    expect(actions.map((action) => action.id)).toEqual(['application']);
    assert.exists(actions[0].onClick, 'Application must have a click handler.');
    actions[0].onClick();
    expect(columnOptions.onManage).toHaveBeenCalledWith(row);
  });
});

it('keeps full handling history available to viewers without exposing edit or assignment', () => {
  const onHistory = vi.fn();
  const row = inquiry();
  const actions = getAdmissionInquiryActions(row, {
    ...columnOptions,
    canManage: false,
    canMove: false,
    onHistory,
  });
  expect(actions.map((action) => action.id)).toEqual(['history']);
  actions[0].onClick?.();
  expect(onHistory).toHaveBeenCalledWith(row);
  expect(
    buildAdmissionInquiryColumns(columnOptions).some(
      (column) => column.id === 'assignedCounsellorId'
    )
  ).toBe(false);
});
