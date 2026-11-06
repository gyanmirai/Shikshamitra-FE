import type { ReactNode } from 'react';
import type { AlertProps } from '@mui/material';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import RecordPhotoPreview from './record-photo-preview';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  createObjectURL: vi.fn(),
  revokeObjectURL: vi.fn(),
  error: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string | number) => AlertProps }) =>
      'photo-error'
  ),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.error, dismiss: vi.fn() },
}));
vi.mock('src/redux/student/records/student-record-changes-api', () => ({
  useGetStudentRecordPhotoPreviewQuery: mocks.query,
}));

const studentId = 'a0000000-0000-4000-8000-000000000001';
const uri = `/api/students/records/changes/students/${studentId}/photo-drafts/b0000000-0000-4000-8000-000000000001`;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.mockReturnValue({ isFetching: false, isError: false });
  mocks.createObjectURL.mockReturnValue('blob:protected-student-photo');
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: mocks.createObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: mocks.revokeObjectURL,
  });
});

it('rejects a photo URI for another student before requesting its protected bytes', () => {
  render(<RecordPhotoPreview studentId="a0000000-0000-4000-8000-000000000002" uri={uri} />);
  expect(mocks.query).toHaveBeenCalledWith(expect.anything(), { skip: true });
  expect(screen.getByText('preview is unavailable', { exact: false })).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

it('renders authenticated bytes through a temporary local URI and releases it on close', async () => {
  const blob = new Blob(['photo'], { type: 'image/png' });
  mocks.query.mockReturnValue({ currentData: blob, isFetching: false, isError: false });
  const { unmount } = render(<RecordPhotoPreview studentId={studentId} uri={uri} />);
  await waitFor(() =>
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:protected-student-photo')
  );
  expect(mocks.createObjectURL).toHaveBeenCalledWith(blob);
  unmount();
  expect(mocks.revokeObjectURL).toHaveBeenCalledWith('blob:protected-student-photo');
});

it('hides a previously cached photo when the protected read is denied and retries from the delivered toast', async () => {
  const retry = vi.fn();
  mocks.query.mockReturnValue({
    currentData: new Blob(['photo']),
    isFetching: false,
    isError: true,
    refetch: retry,
  });
  render(<RecordPhotoPreview studentId={studentId} uri={uri} />);
  await waitFor(() =>
    expect(mocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'The proposed photo could not be opened with your current access.',
      })
    )
  );
  expect(screen.queryByText('current access', { exact: false })).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(mocks.createObjectURL).not.toHaveBeenCalled();
  const recovery = render(
    <>{mocks.error.mock.calls.at(-1)?.[0].alertProps('photo-error').action}</>
  );
  fireEvent.click(within(recovery.container).getByRole('button', { name: 'Retry photo' }));
  expect(retry).toHaveBeenCalledOnce();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
