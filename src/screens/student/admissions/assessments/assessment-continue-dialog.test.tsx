import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { AssessmentContinueDialog } from './assessment-continue-dialog';

vi.mock('@mui/icons-material', async () => ({
  Close: (await import('@mui/icons-material/Close')).default,
}));

const mocks = vi.hoisted(() => ({
  getApplication: vi.fn(),
  getWorkflow: vi.fn(),
  getAssessment: vi.fn(),
  advance: vi.fn(),
  success: vi.fn(),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useLazyGetAdmissionApplicationQuery: () => [mocks.getApplication],
  admissionApplicationsApi: {
    useLazyGetAdmissionApplicationWorkflowQuery: () => [mocks.getWorkflow],
  },
  useAdvanceAdmissionApplicationWorkflowMutation: () => [mocks.advance],
}));
vi.mock('src/redux/student/admissions/admission-assessments-api', () => ({
  admissionAssessmentsApi: { useLazyGetApplicationAssessmentQuery: () => [mocks.getAssessment] },
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: mocks.success,
  },
}));
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
  assessment: { ...assessmentResponse, canComplete: true },
};
const resolved = (data: unknown) => ({ unwrap: () => Promise.resolve(data) });
const renderDialog = (close = vi.fn()) =>
  render(
    <Provider store={configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } })}>
      <AssessmentContinueDialog row={row} onClose={close} />
    </Provider>
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getApplication.mockReturnValue(resolved({ concurrencyStamp: 'fresh-stamp', status: 1 }));
  mocks.getWorkflow.mockReturnValue(
    resolved({ currentStageInstanceId: 'stage', stages: [{ id: 'stage', stageType: 2 }] })
  );
  mocks.getAssessment.mockReturnValue(resolved({ ...assessmentResponse, canComplete: true }));
  mocks.advance.mockReturnValue(resolved({}));
});
it('refreshes evidence and uses current application stamp before advancing', async () => {
  const close = vi.fn();
  renderDialog(close);
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/ }));
  expect(mocks.advance).toHaveBeenCalledWith({
    id: 'app',
    expectedCurrentStageInstanceId: 'stage',
    concurrencyStamp: 'fresh-stamp',
    idempotencyKey: expect.any(String),
  });
  expect(close).toHaveBeenCalledOnce();
});
it('does not advance a changed step or close the error dialog', async () => {
  mocks.getWorkflow.mockReturnValue(
    resolved({ currentStageInstanceId: 'other-stage', stages: [] })
  );
  const close = vi.fn();
  renderDialog(close);
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/ }));
  expect(await screen.findByText(/The admission step changed/)).toBeInTheDocument();
  expect(mocks.advance).not.toHaveBeenCalled();
  expect(close).not.toHaveBeenCalled();
});
it('retains the exact command and key when retrying a lost response', async () => {
  const close = vi.fn();
  mocks.advance.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Response lost')) });
  renderDialog(close);
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/ }));
  expect(await screen.findByText('Response lost')).toBeInTheDocument();
  const sent = mocks.advance.mock.calls[0][0];
  mocks.getWorkflow.mockReturnValue(resolved({ currentStageInstanceId: 'next-stage', stages: [] }));
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/ }));
  expect(mocks.advance).toHaveBeenNthCalledWith(2, sent);
  expect(mocks.getWorkflow).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledOnce();
});
it('refuses newly blocked evidence even if the row was previously ready', async () => {
  mocks.getAssessment.mockReturnValue(
    resolved({ ...assessmentResponse, canComplete: false, blockers: ['Review is pending'] })
  );
  renderDialog();
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/ }));
  expect(await screen.findByText('Review is pending')).toBeInTheDocument();
  expect(mocks.advance).not.toHaveBeenCalled();
});
