import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { financePermissions } from 'src/constants/finance-menu';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import FeeStructureWorkspaceDialog from './FeeStructureWorkspaceDialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('./ClassAccordionPanel', () => ({
  default: function ClassPanel({ classId, onDirtyChange, onBusyChange }: any) {
    return (
      <div>
        <div>Selected class: {classId}</div>
        <button type="button" onClick={() => onDirtyChange(true)}>
          Change draft
        </button>
        <button type="button" onClick={() => onBusyChange(true)}>
          Begin save
        </button>
        <button type="button" onClick={() => onBusyChange(false)}>
          Finish save
        </button>
      </div>
    );
  },
}));

const metadata = {
  id: 'metadata',
  name: 'Main fees',
  academicYearName: '2026–27',
  boardName: 'CBSE',
  mediumName: 'English',
  feeStructureClasses: {},
  classes: [
    { id: 'class-5', name: 'Class 5' },
    { id: 'class-6', name: 'Class 6' },
  ],
};
function setup() {
  const onClose = vi.fn();
  const store = configureStore({
    reducer: {
      confirmPopup: confirmPopupReducer,
      auth: (
        state = {
          permissions: [
            { name: financePermissions.fees.settings.feeStructureActions.create, isGranted: true },
          ],
        }
      ) => state,
    },
  });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FeeStructureWorkspaceDialog editData={metadata} onClose={onClose} />
      </ThemeProvider>
    </Provider>
  );
  return { onClose };
}
afterEach(cleanup);

it('opens the shared full-screen dialog with horizontal class tabs', () => {
  setup();
  expect(screen.getByText('Main fees · 2026–27 · Board: CBSE · Medium: English')).toBeTruthy();
  expect(screen.getByRole('dialog', { name: /Manage Fee Structure/ })).toHaveClass(
    'MuiDialog-paperFullScreen'
  );
  const classes = screen.getByRole('tablist', { name: 'Classes' });
  expect(classes).not.toHaveAttribute('aria-orientation', 'vertical');
  expect(within(classes).getByRole('tab', { name: 'Class 5' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  fireEvent.click(within(classes).getByRole('tab', { name: 'Class 6' }));
  expect(screen.getByText('Selected class: class-6')).toBeTruthy();
});

it('preserves the current class when a dirty switch is cancelled and guards dialog dismissal', async () => {
  const { onClose } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Change draft' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Class 6' }));
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Unsaved Changes' })).getByRole('button', {
      name: 'Cancel',
    })
  );
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: 'Class 5' })).toHaveAttribute('aria-selected', 'true')
  );
  fireEvent.click(screen.getByRole('button', { name: 'close' }));
  const confirm = screen.getByRole('dialog', { name: 'Discard unsaved changes?' });
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(within(confirm).getByRole('button', { name: 'Discard & Leave' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('blocks class switching and closing during a save then restores them', () => {
  const { onClose } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Begin save' }));
  expect(screen.getByRole('tab', { name: 'Class 6' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'close' }));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Finish save' }));
  fireEvent.click(screen.getByRole('button', { name: 'close' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
