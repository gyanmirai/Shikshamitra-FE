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
it('loads division students independently of houses and confirms leader removal', async () => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <Provider store={configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <HouseLeaderDialog
          kind="division"
          academicMediumId="m1"
          record={{
            id: 'd1',
            name: 'A',
            standardId: 'c1',
            standardName: '6',
            studentCount: 20,
            leader: student,
            concurrencyStamp: 'v1',
            canManage: true,
          }}
          onSave={onSave}
          onClose={onClose}
        />
      </ThemeProvider>
    </Provider>
  );
  expect(picker.mock.calls[0][0].input).toEqual({ academicMediumId: 'm1', divisionId: 'd1' });
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
