import type { AssessmentSession } from 'src/redux/student/admissions/admission-assessment-types';

import { vi, it, expect } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';

import { AssessmentSessionDetailsDrawer } from './assessment-session-details-drawer';

const mocks = vi.hoisted(() => ({
  detail: undefined as AssessmentSession | undefined,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/admissions/admission-assessment-planning-api', () => ({
  useGetAssessmentSessionByIdQuery: () => ({
    currentData: mocks.detail,
    isError: mocks.isError,
    refetch: mocks.refetch,
  }),
}));

const session: AssessmentSession = {
  id: 'session-1',
  admissionOfferingId: 'offering',
  workflowStageDefinitionId: 'stage',
  name: 'QA Exam',
  startsAt: '2026-11-10T09:00:00Z',
  endsAt: '2026-11-10T10:00:00Z',
  location: 'Exam room',
  capacity: 20,
  bookedCount: 5,
  isCancelled: false,
  concurrencyStamp: 'version-1',
  sessionType: 'exam',
  scopeDetails: [
    {
      className: 'Class 1',
      admissionOfferingId: 'offering',
      offeringName: 'Primary',
      workflowStageDefinitionId: 'stage',
      stageName: 'Entrance exam',
      workflowDefinitionId: 'workflow',
      workflowVersion: 1,
      schedulingEnabled: true,
    },
  ],
};

const renderDrawer = (onClose = vi.fn()) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <AssessmentSessionDetailsDrawer session={session} onClose={onClose} />
    </ThemeProvider>
  );

it('shows the selected session details in a read-only drawer', () => {
  mocks.detail = session;
  mocks.isError = false;
  const onClose = vi.fn();
  renderDrawer(onClose);
  expect(screen.getByRole('dialog', { name: 'Session Details' })).toBeVisible();
  expect(screen.getByText('QA Exam')).toBeVisible();
  expect(screen.getByText('Class 1')).toBeVisible();
  expect(screen.getByText('Primary · Entrance exam')).toBeVisible();
  expect(screen.getByText('Exam room')).toBeVisible();
  expect(screen.getByText('5 / 20')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close session details' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('shows a retry when current session details cannot be loaded', () => {
  mocks.detail = undefined;
  mocks.isError = true;
  mocks.refetch.mockClear();
  renderDrawer();
  expect(screen.getByText('Unable to load session details.')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
});
