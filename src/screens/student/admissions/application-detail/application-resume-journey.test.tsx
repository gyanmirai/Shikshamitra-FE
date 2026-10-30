import { vi, it, expect } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders as render } from 'src/test/test-utils';

import { ApplicationResumeJourney } from './application-resume-journey';

const mock = vi.hoisted(() => ({
  resume: vi.fn(),
  refetch: vi.fn(),
  preview: {
    canResume: true,
    closureHistoryId: 'closure-1',
    concurrencyStamp: 'stamp-1',
    targetStageId: 'documents',
    targetStageName: 'Document verification',
    targetWorkspace: 'Pipeline',
    blockers: [] as string[],
    warnings: [],
  },
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useGetAdmissionJourneyResumePreviewQuery: () => ({
    data: mock.preview,
    isFetching: false,
    isError: false,
    refetch: mock.refetch,
  }),
  useResumeAdmissionApplicationJourneyMutation: () => [mock.resume, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('replays the immutable command after a lost response even if an eligibility refresh finds the committed application active', async () => {
  mock.resume
    .mockReturnValueOnce({
      unwrap: async () => {
        throw Object.assign(new Error('Response lost'), { status: 'FETCH_ERROR' });
      },
    })
    .mockReturnValueOnce({
      unwrap: async () => ({ id: 'application-1', applicationNumber: 'APP-35' }),
    });
  const props = {
    id: 'application-1',
    applicationNumber: 'APP-35',
    applicantName: 'QA Resume',
    onClose: vi.fn(),
    onResumed: vi.fn(),
    onBusyChange: vi.fn(),
  };
  const view = render(<ApplicationResumeJourney {...props} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Reason' }), {
    target: { value: 'Parent returned' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Resume admission' }));
  await waitFor(() => expect(mock.resume).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Resume admission' })).toBeEnabled()
  );
  mock.preview = {
    ...mock.preview,
    canResume: false,
    blockers: ['Only an admission ended before finalization can be resumed here.'],
  };
  view.rerender(<ApplicationResumeJourney {...props} />);
  expect(screen.getByRole('button', { name: 'Resume admission' })).toBeEnabled();
  expect(screen.getByRole('textbox', { name: 'Reason' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Resume admission' }));
  await waitFor(() => expect(props.onResumed).toHaveBeenCalledOnce());
  expect(mock.resume.mock.calls[1][0]).toEqual(mock.resume.mock.calls[0][0]);
  expect(mock.refetch).not.toHaveBeenCalled();
});
