import type { HouseAssignmentPreview } from 'src/redux/student/house-management/house-management-types';

import { vi, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import HouseAssignmentDrawer from './house-assignment-drawer';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./house-pickers', () => ({ HousePicker: () => null }));
const previewResult: HouseAssignmentPreview = {
  previewToken: 'read-token',
  students: [],
  clearedHouseLeaders: [],
  targetHouseId: null,
  targetHouseName: null,
};

it.each(['Cancel', 'X', 'Escape'])(
  'allows %s during a pending preview and ignores its late result',
  async (method) => {
    let finishPreview: (value: HouseAssignmentPreview) => void = () => {};
    const onPreview = vi.fn(
      () =>
        new Promise<HouseAssignmentPreview>((resolve) => {
          finishPreview = resolve;
        })
    );
    const onClose = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <HouseAssignmentDrawer
          academicMediumId="m1"
          enrollmentIds={['e1']}
          initialMode="remove"
          onClose={onClose}
          onPreview={onPreview}
          onCommit={vi.fn()}
        />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Close Change House Membership' })).toBeEnabled();
    if (method === 'Escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    else
      fireEvent.click(
        screen.getByRole('button', {
          name: method === 'X' ? 'Close Change House Membership' : method,
        })
      );
    expect(onClose).toHaveBeenCalledOnce();
    await act(async () => finishPreview(previewResult));
    expect(screen.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
  }
);

it('keeps an edited membership draft after cancelling a pending read and discards only explicitly', async () => {
  let finishPreview: (value: HouseAssignmentPreview) => void = () => {};
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <HouseAssignmentDrawer
        academicMediumId="m1"
        enrollmentIds={['e1']}
        onClose={onClose}
        onPreview={() =>
          new Promise<HouseAssignmentPreview>((resolve) => {
            finishPreview = resolve;
          })
        }
        onCommit={vi.fn()}
      />
    </ThemeProvider>
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Change' }));
  fireEvent.click(screen.getByRole('option', { name: 'Remove from house' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('combobox', { name: 'Change' })).toHaveTextContent('Remove from house');
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(onClose).toHaveBeenCalledOnce();
  await act(async () => finishPreview(previewResult));
  expect(screen.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
});

it('does not replace a newer preview token with a discarded read result', async () => {
  let finishOld: (value: HouseAssignmentPreview) => void = () => {};
  const onPreview = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<HouseAssignmentPreview>((resolve) => {
          finishOld = resolve;
        })
    )
    .mockResolvedValueOnce({ ...previewResult, previewToken: 'new-token' });
  const onCommit = vi.fn().mockResolvedValue(undefined);
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <HouseAssignmentDrawer
        academicMediumId="m1"
        enrollmentIds={['e1']}
        initialMode="remove"
        onClose={vi.fn()}
        onPreview={onPreview}
        onCommit={onCommit}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
  await screen.findByRole('button', { name: 'Confirm change' });
  await act(async () => finishOld({ ...previewResult, previewToken: 'old-token' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
  await waitFor(() =>
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ previewToken: 'new-token' }))
  );
});

it('keeps dismissal and duplicate submission locked while confirming a membership write', async () => {
  let finishWrite: () => void = () => {};
  const onClose = vi.fn();
  const onCommit = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finishWrite = resolve;
      })
  );
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <HouseAssignmentDrawer
        academicMediumId="m1"
        enrollmentIds={['e1']}
        initialMode="remove"
        onClose={onClose}
        onPreview={vi.fn().mockResolvedValue(previewResult)}
        onCommit={onCommit}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm change' }));
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Close Change House Membership' })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
  expect(onClose).not.toHaveBeenCalled();
  expect(onCommit).toHaveBeenCalledOnce();
  await act(async () => finishWrite());
  expect(onClose).toHaveBeenCalledOnce();
});
it('requires a preview and names cleared house leadership before confirming removal', async () => {
  const student = {
    enrollmentId: 'e1',
    studentId: 's1',
    studentName: 'Riya Shah',
    standardId: 'c1',
    standardName: 'Class 6',
    houseName: 'Falcon',
    isHouseLeader: true,
    isDivisionLeader: true,
    concurrencyStamp: 'v1',
  };
  const onPreview = vi.fn().mockResolvedValue({
    previewToken: 'token',
    students: [student],
    clearedHouseLeaders: [student],
    targetHouseName: null,
  });
  const onCommit = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <HouseAssignmentDrawer
        academicMediumId="m1"
        enrollmentIds={['e1']}
        initialMode="remove"
        onClose={onClose}
        onPreview={onPreview}
        onCommit={onCommit}
      />
    </ThemeProvider>
  );
  expect(screen.queryByRole('button', { name: 'Confirm change' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
  expect(await screen.findByText(/Riya Shah will no longer lead Falcon/)).toBeVisible();
  expect(screen.getByText(/Division leadership stays unchanged/)).toBeVisible();
  expect(onCommit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
  await waitFor(() =>
    expect(onCommit).toHaveBeenCalledWith({
      academicMediumId: 'm1',
      houseId: null,
      enrollmentIds: ['e1'],
      previewToken: 'token',
    })
  );
  expect(onClose).toHaveBeenCalledOnce();
});
