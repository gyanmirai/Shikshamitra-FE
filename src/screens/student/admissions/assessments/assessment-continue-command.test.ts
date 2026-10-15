import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type { AdmissionApplicationWorkflow } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect, describe } from 'vitest';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { continueAssessment } from './assessment-continue-command';

import type {
  AssessmentContinueRetry,
  AssessmentContinueServices,
} from './assessment-continue-command';

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
  queue: 'ready',
  assessment: { ...assessmentResponse, canComplete: true, concurrencyStamp: 'stale-roster-stamp' },
};
const freshWorkflow = (): AdmissionApplicationWorkflow => ({
  workflowDefinitionId: 'workflow',
  status: 0,
  startedAt: '2026-10-14T04:30:00Z',
  currentStageInstanceId: 'stage',
  availableTransitions: [],
  history: [],
  stages: [
    {
      id: 'stage',
      definitionStageId: 'definition',
      code: 'ENTRANCE',
      name: 'Assessment',
      stageType: 2,
      displayOrder: 1,
      status: 1,
      allowManualSkip: false,
      assessmentEnabled: true,
    },
  ],
});
const createServices = () => ({
  application: vi
    .fn<AssessmentContinueServices['application']>()
    .mockResolvedValue({ status: 1, concurrencyStamp: 'fresh-application-stamp' }),
  workflow: vi.fn<AssessmentContinueServices['workflow']>().mockResolvedValue(freshWorkflow()),
  assessment: vi.fn<AssessmentContinueServices['assessment']>().mockResolvedValue({
    ...assessmentResponse,
    canComplete: true,
    blockers: [],
    concurrencyStamp: 'fresh-assessment-stamp',
  }),
  advance: vi.fn<AssessmentContinueServices['advance']>().mockResolvedValue({}),
});

describe('guarded assessment continuation', () => {
  it('refreshes evidence after a definitive concurrency rejection while retaining the command key', async () => {
    const services = createServices();
    const retry: AssessmentContinueRetry = {};
    services.advance.mockRejectedValueOnce({ status: 409 }).mockResolvedValueOnce({});
    await expect(continueAssessment(row, services, 'same-key', retry)).rejects.toEqual({
      status: 409,
    });
    expect(retry.command).toBeUndefined();
    services.application.mockResolvedValue({ status: 1, concurrencyStamp: 'refreshed-stamp' });
    await expect(continueAssessment(row, services, 'same-key', retry)).resolves.toEqual({});
    expect(services.advance).toHaveBeenNthCalledWith(2, {
      id: 'app',
      expectedCurrentStageInstanceId: 'stage',
      concurrencyStamp: 'refreshed-stamp',
      idempotencyKey: 'same-key',
    });
    expect(services.workflow).toHaveBeenCalledTimes(2);
  });

  it('replays the exact sent command after a lost response even after the stage has moved', async () => {
    const services = createServices();
    const retry: AssessmentContinueRetry = {};
    services.advance.mockRejectedValueOnce(new Error('Response lost')).mockResolvedValueOnce({});
    await expect(continueAssessment(row, services, 'same-key', retry)).rejects.toThrow(
      'Response lost'
    );
    services.workflow.mockResolvedValue({
      ...freshWorkflow(),
      currentStageInstanceId: 'next-stage',
    });
    services.application.mockResolvedValue({ status: 1, concurrencyStamp: 'later-stamp' });
    await expect(continueAssessment(row, services, 'same-key', retry)).resolves.toEqual({});
    expect(services.advance).toHaveBeenNthCalledWith(2, services.advance.mock.calls[0][0]);
    expect(services.application).toHaveBeenCalledTimes(1);
    expect(services.workflow).toHaveBeenCalledTimes(1);
  });

  it('does not cache a command before fresh validation succeeds', async () => {
    const services = createServices();
    const retry: AssessmentContinueRetry = {};
    services.workflow.mockResolvedValue({
      ...freshWorkflow(),
      currentStageInstanceId: 'other-stage',
    });
    await expect(continueAssessment(row, services, 'same-key', retry)).rejects.toThrow(
      'The admission step changed'
    );
    expect(retry.command).toBeUndefined();
    expect(services.advance).not.toHaveBeenCalled();
  });

  it('refreshes all three sources and sends the fresh application stamp with exact stage and idempotency key', async () => {
    const services = createServices();
    await continueAssessment(row, services, 'retry-safe-item-key');
    expect(services.application).toHaveBeenCalledExactlyOnceWith('app');
    expect(services.workflow).toHaveBeenCalledExactlyOnceWith('app');
    expect(services.assessment).toHaveBeenCalledExactlyOnceWith('app', 'stage');
    expect(services.advance).toHaveBeenCalledExactlyOnceWith({
      id: 'app',
      expectedCurrentStageInstanceId: 'stage',
      concurrencyStamp: 'fresh-application-stamp',
      idempotencyKey: 'retry-safe-item-key',
    });
  });

  it.each(['other-stage', null] as const)(
    'refuses a moved or finished current stage: %s',
    async (currentStageInstanceId) => {
      const services = createServices();
      services.workflow.mockResolvedValue({ ...freshWorkflow(), currentStageInstanceId });
      await expect(continueAssessment(row, services, 'key')).rejects.toThrow(
        'The admission step changed. Refresh the roster and review the current application.'
      );
      expect(services.advance).not.toHaveBeenCalled();
    }
  );

  it('propagates current server blockers despite the previously ready roster', async () => {
    const services = createServices();
    services.assessment.mockResolvedValue({
      ...assessmentResponse,
      canComplete: false,
      blockers: ['Record attendance.', 'Result is pending.'],
    });
    await expect(continueAssessment(row, services, 'key')).rejects.toThrow(
      'Record attendance. Result is pending.'
    );
    expect(services.advance).not.toHaveBeenCalled();
  });

  it('supplies actionable fallback feedback when current evidence is blocked without a message', async () => {
    const services = createServices();
    services.assessment.mockResolvedValue({
      ...assessmentResponse,
      canComplete: false,
      blockers: [],
    });
    await expect(continueAssessment(row, services, 'key')).rejects.toThrow(
      'Complete the pending assessment actions before continuing.'
    );
    expect(services.advance).not.toHaveBeenCalled();
  });

  it('refuses a missing assessment stage even if an old readiness response says complete', async () => {
    const services = createServices();
    services.workflow.mockResolvedValue({ ...freshWorkflow(), stages: [] });
    await expect(continueAssessment(row, services, 'key')).rejects.toThrow(
      'Complete the pending assessment actions before continuing.'
    );
    expect(services.advance).not.toHaveBeenCalled();
  });

  it.each([2, 9, 10] as const)(
    'uses current application status to stop closed or withdrawn admissions: %s',
    async (status) => {
      const services = createServices();
      services.application.mockResolvedValue({ status, concurrencyStamp: 'fresh-closed-stamp' });
      await expect(continueAssessment(row, services, 'key')).rejects.toThrow(
        'Complete the pending assessment actions before continuing.'
      );
      expect(services.advance).not.toHaveBeenCalled();
    }
  );

  it.each(['application', 'workflow', 'assessment'] as const)(
    'fails closed when fresh %s lookup fails',
    async (source) => {
      const services = createServices();
      services[source].mockRejectedValue(new Error('Unable to refresh current evidence'));
      await expect(continueAssessment(row, services, 'key')).rejects.toThrow(
        'Unable to refresh current evidence'
      );
      expect(services.advance).not.toHaveBeenCalled();
    }
  );

  it('preserves command concurrency errors so the caller can retain the failed item for retry', async () => {
    const services = createServices();
    const failure = {
      status: 409,
      data: { detail: 'The admission changed. Refresh before continuing.' },
    };
    services.advance.mockRejectedValue(failure);
    await expect(continueAssessment(row, services, 'same-key')).rejects.toBe(failure);
    expect(services.advance).toHaveBeenCalledOnce();
  });

  it('does not send an unguarded advance when the refreshed application version is missing', async () => {
    const services = createServices();
    services.application.mockResolvedValue({ status: 1, concurrencyStamp: '' });
    await expect(continueAssessment(row, services, 'key')).rejects.toThrow(
      'The application version is unavailable. Refresh before continuing.'
    );
    expect(services.advance).not.toHaveBeenCalled();
  });
});
