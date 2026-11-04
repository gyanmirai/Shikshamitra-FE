import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

import { ApplicationJourneyHistory } from './application-journey-history';

const state = vi.hoisted(() => ({
  loading: false,
  error: false,
  refetch: vi.fn(),
  query: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/admissions/admission-applicants-api', () => ({
  admissionApplicantsApi: {
    useGetAdmissionJourneyActivitiesQuery: (id: string) => {
      state.query(id);
      return {
        isLoading: state.loading,
        isError: state.error,
        refetch: state.refetch,
        currentData: [
          {
            id: 'event-1',
            activityType: 'InquiryCreated',
            description: 'Inquiry captured',
            occurredAt: '2026-10-22T09:00:00Z',
            actorName: 'Asha Sharma',
          },
        ],
      };
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  state.loading = false;
  state.error = false;
});
it('shows history for the actual applicant with the recorded staff name', () => {
  render(<ApplicationJourneyHistory applicantId="applicant-1" />);
  expect(state.query).toHaveBeenCalledWith('applicant-1');
  expect(screen.getByText(/Handled By: Asha Sharma/)).toBeInTheDocument();
});
it('keeps pending history distinct from an empty history', () => {
  state.loading = true;
  render(<ApplicationJourneyHistory applicantId="applicant-1" />);
  expect(screen.getByLabelText('Loading Journey Activity')).toBeInTheDocument();
  expect(screen.queryByText('No Activity Recorded')).not.toBeInTheDocument();
});
it('announces a failed history read and restores current history after recovery', async () => {
  state.error = true;
  const view = render(<ApplicationJourneyHistory applicantId="applicant-1" />);
  expect(screen.queryByText(/Handled By: Asha Sharma/)).not.toBeInTheDocument();
  await expectStudentErrorToast('Journey activity could not be loaded.');
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  expect(state.refetch).not.toHaveBeenCalled();
  state.error = false;
  view.rerender(<ApplicationJourneyHistory applicantId="applicant-1" />);
  expect(screen.getByText(/Handled By: Asha Sharma/)).toBeInTheDocument();
});
