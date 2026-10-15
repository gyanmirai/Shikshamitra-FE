import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { it, expect, describe } from 'vitest';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { assessmentScopeLabel } from './assessment-utils';
import { getAssessmentPermissions } from './use-assessment-permissions';
import {
  getAssessmentRowActions,
  readAssessmentWorkbench,
  getPrimaryAssessmentAction,
} from './assessment-workbench-model';

const row: AssessmentRosterItem = {
  applicationId: 'app',
  applicationNumber: 'ADM1',
  applicantId: 'applicant',
  applicantName: 'Test student',
  stageInstanceId: 'stage',
  stageName: 'Assessment',
  applicationStatus: 1,
  stageStatus: 1,
  isActive: true,
  queue: 'toBook',
  assessment: assessmentResponse,
};
const all = {
  view: true,
  manageSessions: true,
  book: true,
  attendance: true,
  results: true,
  review: true,
  waive: true,
};

describe('assessment next action follows the operational queue', () => {
  const correctable = {
    ...row,
    assessment: {
      ...row.assessment,
      canComplete: false,
      canBook: false,
      canRecordAttendance: true,
      canRecordResult: true,
      canRetake: false,
    },
  };
  it('prioritizes results after attendance while retaining attendance correction as an allowed action', () => {
    const resultRow = { ...correctable, queue: 'result' as const };
    expect(getPrimaryAssessmentAction(resultRow, all, false)).toBe('result');
    expect(getAssessmentRowActions(resultRow, all)).toContain('attendance');
  });
  it('prioritizes attendance in the scheduled attendance queue', () => {
    expect(getPrimaryAssessmentAction({ ...correctable, queue: 'attendance' }, all, false)).toBe(
      'attendance'
    );
  });
  it('does not promote denied result actions and respects historical guards', () => {
    expect(
      getPrimaryAssessmentAction(
        { ...correctable, queue: 'result' },
        { ...all, results: false },
        false
      )
    ).toBe('attendance');
    expect(
      getPrimaryAssessmentAction({ ...correctable, queue: 'result', isActive: false }, all, true)
    ).toBeUndefined();
  });
  it('keeps Continue primary when current completion and the canonical advance capability permit it', () => {
    expect(
      getPrimaryAssessmentAction(
        {
          ...correctable,
          queue: 'ready',
          assessment: { ...correctable.assessment, canComplete: true },
        },
        all,
        true
      )
    ).toBe('continue');
  });
});

describe('assessment workbench URL and action safety', () => {
  it('distinguishes pinned workflows using names without repeating identical offering codes', () => {
    expect(
      assessmentScopeLabel({
        offeringName: 'Grade 1',
        offeringCode: 'AD1',
        stageName: 'Entrance',
        workflowName: 'Junior admission',
        workflowVersion: 2,
      })
    ).toBe('Grade 1 (AD1) · Entrance · Junior admission v2');
    expect(
      assessmentScopeLabel({
        offeringName: 'AD1',
        offeringCode: 'AD1',
        stageName: 'Entrance',
        workflowVersion: 1,
      })
    ).toBe('AD1 · Entrance · Workflow v1');
  });
  it('rejects unsupported queues, sorting and unbounded page sizes', () => {
    expect(
      readAssessmentWorkbench(
        new URLSearchParams(
          'assessmentQueue=other&assessmentPage=-1&assessmentSize=999999&assessmentSort=sql&assessmentDirection=other'
        )
      )
    ).toMatchObject({
      queue: 'all',
      page: 0,
      size: 25,
      sort: 'enteredAt',
      direction: 'desc',
      tab: 'sessions',
    });
  });
  it('restores valid shareable filters and pagination', () => {
    expect(
      readAssessmentWorkbench(
        new URLSearchParams(
          'assessmentTab=applicants&assessmentQueue=result&assessmentSession=s1&assessmentPage=2&assessmentSize=100&assessmentSort=applicantName&assessmentDirection=asc&assessmentSearch=Sam'
        )
      )
    ).toMatchObject({
      tab: 'applicants',
      queue: 'result',
      sessionId: 's1',
      page: 2,
      size: 100,
      search: 'Sam',
      sort: 'applicantName',
      direction: 'asc',
    });
  });
  it('intersects capabilities and grants rather than trusting queue labels', () => {
    expect(getAssessmentRowActions(row, all)).toEqual(['book']);
    expect(getAssessmentRowActions(row, getAssessmentPermissions([]))).toEqual([]);
    expect(getAssessmentRowActions({ ...row, queue: 'result' }, all)).toEqual(['book']);
  });
  it('never offers mutations for historical or disabled stages', () => {
    expect(getAssessmentRowActions({ ...row, isActive: false }, all)).toEqual([]);
    expect(
      getAssessmentRowActions({ ...row, assessment: { ...assessmentResponse, policy: null } }, all)
    ).toEqual([]);
  });
});

it('rejects the retired review queue URL and never exposes result review actions', () => {
  expect(readAssessmentWorkbench(new URLSearchParams('assessmentQueue=review')).queue).toBe('all');
  expect(
    getAssessmentRowActions(
      { ...row, assessment: { ...row.assessment, canBook: false, canReview: true } },
      all
    )
  ).not.toContain('review');
});
