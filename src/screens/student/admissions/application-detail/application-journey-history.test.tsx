import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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
  expect(screen.getByText(/Handled by: Asha Sharma/)).toBeInTheDocument();
});
it('keeps pending history distinct from an empty history', () => {
  state.loading = true;
  render(<ApplicationJourneyHistory applicantId="applicant-1" />);
  expect(screen.getByLabelText('Loading journey activity')).toBeInTheDocument();
  expect(screen.queryByText('No activity recorded')).not.toBeInTheDocument();
});
it('lets staff retry a failed history read without showing stale staff actions', () => {
  state.error = true;
  render(<ApplicationJourneyHistory applicantId="applicant-1" />);
  expect(screen.queryByText(/Handled by: Asha Sharma/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(state.refetch).toHaveBeenCalledOnce();
});
