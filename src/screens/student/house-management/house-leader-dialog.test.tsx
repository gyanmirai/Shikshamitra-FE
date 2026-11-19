import { Provider } from 'react-redux';
import { vi, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import HouseLeaderDialog from './house-leader-dialog';

const student = {
  enrollmentId: 'e1',
  studentId: 's1',
  studentName: 'Riya',
  standardId: 'c1',
  standardName: '6',
  isHouseLeader: false,
  isDivisionLeader: true,
  concurrencyStamp: 'v1',
};
const division = {
  id: 'd1',
  name: 'A',
  standardId: 'c1',
  standardName: '6',
  studentCount: 20,
  leader: student,
  concurrencyStamp: 'v1',
  canManage: true,
};
const house = {
  id: 'h1',
  name: 'Falcon',
  color: '#123456',
  memberCount: 20,
  houseLeaderCount: 1,
  leader: { ...student, studentName: 'Mira', enrollmentId: 'e2', houseName: 'Falcon' },
  concurrencyStamp: 'h1-v1',
  canManage: true,
};
const picker = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./house-pickers', () => ({
  LeaderStudentPicker: (props: { onChange: (value: null) => void }) => {
    picker(props);
    const { onChange } = props;
    return (
      <button type="button" onClick={() => onChange(null)}>
        Vacant
      </button>
    );
  },
}));
function mount(role: 'house' | 'division') {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <Provider store={configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <HouseLeaderDialog
          academicMediumId="m1"
          role={role}
          record={role === 'house' ? house : division}
          onSave={onSave}
          onClose={onClose}
        />
      </ThemeProvider>
    </Provider>
  );
  return { onSave, onClose };
}

it('loads division students independently of houses and confirms leader removal', async () => {
  const { onSave, onClose } = mount('division');
  expect(picker).toHaveBeenLastCalledWith(
    expect.objectContaining({
      input: { academicMediumId: 'm1', divisionId: 'd1' },
      value: student,
    })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Vacant' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Remove Division Leader?')).toBeVisible();
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith({
      id: 'd1',
      academicMediumId: 'm1',
      enrollmentId: null,
      concurrencyStamp: 'v1',
    })
  );
  expect(onClose).toHaveBeenCalledOnce();
});

it('loads House leader candidates across divisions and uses the house incumbent', async () => {
  const { onSave } = mount('house');
  expect(picker).toHaveBeenLastCalledWith(
    expect.objectContaining({
      input: { academicMediumId: 'm1', houseId: 'h1' },
      value: house.leader,
    })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Vacant' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByText('Discard Unsaved Changes?')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('dialog', { name: 'Manage House Leader' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(/Mira will no longer be the house leader/)).toBeVisible();
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledExactlyOnceWith({
      id: 'h1',
      academicMediumId: 'm1',
      enrollmentId: null,
      concurrencyStamp: 'h1-v1',
    })
  );
});
