import type { AssessmentSession } from 'src/redux/student/admissions/admission-assessment-types';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AssessmentSchedulingGuidance } from './assessment-scheduling-guidance';
import {
  getAssessmentSchedulingUrl,
  getAvailableAssessmentSessions,
} from './assessment-session-availability';

const mocks = vi.hoisted(() => ({ query: vi.fn(), refetch: vi.fn(), push: vi.fn() }));
vi.mock('src/redux/student/admissions/admission-assessment-sessions-api', () => ({
  useGetAssessmentSessionsQuery: mocks.query,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('board=board-1&medium=medium-1&class=class-1'),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const session = {
  id: 'session',
  name: 'Morning slot',
  capacity: 10,
  bookedCount: 2,
  startsAt: '2099-10-09T09:00:00Z',
  isCancelled: false,
} as AssessmentSession;
const query = (currentData: AssessmentSession[] | undefined = [], extra = {}) => ({
  currentData,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: mocks.refetch,
  ...extra,
});
const renderGuidance = (
  extra: Partial<React.ComponentProps<typeof AssessmentSchedulingGuidance>> = {}
) =>
  render(
    <AssessmentSchedulingGuidance
      admissionOfferingId="offering"
      workflowStageDefinitionId="stage"
      canView
      canManageSessions
      disabled={false}
      {...extra}
    />
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.mockReturnValue(query());
});

it('shows default create-slot guidance with a scoped redirect before an exam booking exists', () => {
  const redirect = vi.fn();
  renderGuidance({ onOpenAssessments: redirect });
  expect(screen.getByRole('alert')).toHaveTextContent('No assessment slot has been created');
  fireEvent.click(screen.getByRole('button', { name: 'Go to Assessments' }));
  const url = new URL(redirect.mock.calls[0][0], 'http://localhost');
  expect(url.pathname).toBe('/student/admissions/assessments');
  expect(url.searchParams.get('assessmentScope')).toBe('offering:stage');
  expect(url.searchParams.get('assessmentTab')).toBe('sessions');
  expect(url.searchParams.get('board')).toBe('board-1');
  expect(url.searchParams.get('medium')).toBe('medium-1');
  expect(mocks.push).not.toHaveBeenCalled();
});

it('asks staff to book an existing slot rather than create another slot', () => {
  mocks.query.mockReturnValue(query([session]));
  renderGuidance();
  expect(screen.getByRole('alert')).toHaveTextContent('Book an available slot');
  expect(screen.queryByRole('button', { name: 'Go to Assessments' })).not.toBeInTheDocument();
});

it('explains unavailable slots and requests administrator help without session management access', () => {
  mocks.query.mockReturnValue(query([{ ...session, bookedCount: 10 }]));
  renderGuidance({ canManageSessions: false });
  expect(screen.getByRole('alert')).toHaveTextContent('No assessment slots are available');
  expect(screen.getByRole('alert')).toHaveTextContent('Ask an admissions administrator');
});

it('keeps guidance loading and errors distinct from an empty slot list', () => {
  mocks.query.mockReturnValue(query(undefined, { isLoading: true }));
  const { unmount } = renderGuidance();
  expect(screen.getByLabelText('Checking assessment slots')).toBeInTheDocument();
  expect(screen.queryByText(/No assessment slot/)).not.toBeInTheDocument();
  unmount();
  mocks.query.mockReturnValue(query(undefined, { isError: true }));
  renderGuidance();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: 'Go to Assessments' })).not.toBeInTheDocument();
});

it('excludes cancelled, full and past slots with the same availability rule as booking', () => {
  expect(
    getAvailableAssessmentSessions([
      session,
      { ...session, id: 'cancelled', isCancelled: true },
      { ...session, id: 'full', bookedCount: 10 },
      { ...session, id: 'past', startsAt: '2000-01-01T09:00:00Z' },
    ])
  ).toEqual([session]);
});

it('retains academic scope from the Pipeline return path', () => {
  const url = getAssessmentSchedulingUrl(
    { admissionOfferingId: 'offering', workflowStageDefinitionId: 'stage' },
    new URLSearchParams({
      returnTo: '/student/admissions/pipeline?board=board&medium=medium&class=class',
    })
  );
  expect(new URL(url, 'http://localhost').searchParams.get('class')).toBe('class');
});

it('skips protected slot data and the redirect without assessment View permission', () => {
  renderGuidance({ canView: false });
  expect(mocks.query).toHaveBeenCalledWith(
    { admissionOfferingId: 'offering', workflowStageDefinitionId: 'stage' },
    { skip: true }
  );
  expect(screen.queryByRole('button', { name: 'Go to Assessments' })).not.toBeInTheDocument();
});
