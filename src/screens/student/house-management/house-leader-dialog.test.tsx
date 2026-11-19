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
  houseLeader: { ...student, studentName: 'Mira', enrollmentId: 'e2', houseName: 'Falcon' },
  concurrencyStamp: 'v1',
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
function mount(houseId?: string) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <Provider store={configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <HouseLeaderDialog
          academicMediumId="m1"
          houseId={houseId}
          record={division}
          onSave={onSave}
          onClose={onClose}
        />
      </ThemeProvider>
    </Provider>
  );
  return { onSave, onClose };
}

function chooseDivisionRole() {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Role' }));
  fireEvent.click(screen.getByRole('option', { name: 'Division leader' }));
}

it('loads division students independently of houses and confirms leader removal', async () => {
  const { onSave, onClose } = mount();
  chooseDivisionRole();
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
    expect(onSave).toHaveBeenCalledWith('division', {
      id: 'd1',
      academicMediumId: 'm1',
      enrollmentId: null,
      concurrencyStamp: 'v1',
    })
  );
  expect(onClose).toHaveBeenCalledOnce();
});

it('loads House leader candidates in the division and uses its independent incumbent', async () => {
  const { onSave } = mount('h1');
  expect(picker).toHaveBeenLastCalledWith(
    expect.objectContaining({
      input: { academicMediumId: 'm1', divisionId: 'd1', assignedOnly: true, houseId: 'h1' },
      value: division.houseLeader,
    })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Vacant' }));
  chooseDivisionRole();
  expect(await screen.findByText('Discard Unsaved Changes?')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('combobox', { name: 'Role' })).toHaveTextContent('House leader');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(/Mira will no longer be the house leader/)).toBeVisible();
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledExactlyOnceWith('house', {
      id: 'd1',
      academicMediumId: 'm1',
      enrollmentId: null,
      concurrencyStamp: 'v1',
    })
  );
});
