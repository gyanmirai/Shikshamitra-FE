import { vi, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import HouseAssignmentDrawer from './house-assignment-drawer';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./house-pickers', () => ({ HousePicker: () => null }));
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
