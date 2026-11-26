import type {
  House,
  HouseStudent,
} from 'src/redux/student/house-management/house-management-types';

import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import HouseRowLeaderDialog from './house-row-leader-dialog';

const student: HouseStudent & { houseId: string } = {
  enrollmentId: 'e1',
  studentId: 's1',
  studentName: 'Riya Shah',
  standardId: 'c1',
  standardName: 'Class 6',
  houseId: 'h1',
  houseName: 'Falcon',
  isHouseLeader: false,
  isDivisionLeader: true,
  concurrencyStamp: 'enrollment-version',
};
const house: House = {
  id: 'h1',
  name: 'Falcon',
  color: '#123456',
  memberCount: 20,
  houseLeaderCount: 1,
  leader: { ...student, enrollmentId: 'e2', studentName: 'Mira Shah' },
  concurrencyStamp: 'house-version',
  canManage: true,
};
const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock('src/redux/student/house-management/house-management-api', () => ({
  useGetManagedHousesQuery: lookup,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

beforeEach(() => {
  lookup.mockReset();
});

function mount({
  reviewed = house,
  selected = student,
}: {
  reviewed?: House;
  selected?: typeof student;
} = {}) {
  lookup.mockReturnValue({
    currentData: { items: [reviewed], totalCount: 1, canManage: reviewed.canManage },
  });
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <HouseRowLeaderDialog
        academicMediumId="m1"
        student={selected}
        onSave={onSave}
        onClose={onClose}
      />
    </ThemeProvider>
  );
  return { onSave, onClose };
}

it('reviews the exact house and incumbent, then replaces the leader using the house stamp', async () => {
  const { onSave, onClose } = mount();
  expect(lookup).toHaveBeenCalledWith(
    { academicMediumId: 'm1', houseId: 'h1', maxResultCount: 1 },
    { refetchOnMountOrArgChange: true }
  );
  const dialog = screen.getByRole('dialog', { name: 'Replace House Leader?' });
  expect(dialog).toHaveTextContent('Current leader: Mira Shah');
  expect(dialog).toHaveTextContent('New leader: Riya Shah');
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Replace leader' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledExactlyOnceWith({
      id: 'h1',
      academicMediumId: 'm1',
      enrollmentId: 'e1',
      concurrencyStamp: 'house-version',
    })
  );
  expect(onClose).toHaveBeenCalledOnce();
});

it('will not remove a different current leader if the student list is stale', () => {
  const { onSave } = mount({ selected: { ...student, isHouseLeader: true } });
  expect(screen.getByText(/The appointment has changed/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Remove leader' })).toBeDisabled();
  expect(onSave).not.toHaveBeenCalled();
});

it('allows removal for the current leader with medium-wide authority', async () => {
  const leader = { ...student, isHouseLeader: true };
  const { onSave } = mount({ reviewed: { ...house, leader }, selected: leader });
  fireEvent.click(screen.getByRole('button', { name: 'Remove leader' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledExactlyOnceWith({
      id: 'h1',
      academicMediumId: 'm1',
      enrollmentId: null,
      concurrencyStamp: 'house-version',
    })
  );
});

it('keeps the appointment blocked when the house does not grant medium-wide management', () => {
  const { onSave } = mount({ reviewed: { ...house, canManage: false } });
  expect(screen.getByText(/Full medium scope is required/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Replace leader' })).toBeDisabled();
  expect(onSave).not.toHaveBeenCalled();
});
