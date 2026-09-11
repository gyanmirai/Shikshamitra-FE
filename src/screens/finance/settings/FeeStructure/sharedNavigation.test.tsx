import React from 'react';
import { Tab } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({ confirmPopup: { isChanges: true } }),
  useDispatch: () => dispatch,
}));
const theme = createTheme(defaultSettings);
const wrap = (ui: React.ReactNode) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
beforeEach(() => {
  dispatch.mockClear();
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true)
  );
});

describe('Fee Structure local navigation preserves the parent form', () => {
  it('switches shared form tabs without a leave prompt or clearing dirty state', () => {
    const change = vi.fn();
    wrap(
      <CustomTabs value="heads" onChange={change} guardUnsavedChanges={false}>
        <Tab value="heads" label="Heads" />
        <Tab value="policies" label="Policies" />
      </CustomTabs>
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Policies' }));
    expect(change).toHaveBeenCalledTimes(1);
    expect(window.confirm).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
  it('keeps the existing default tab guard for other screens', () => {
    wrap(
      <CustomTabs value="heads">
        <Tab value="heads" label="Heads" />
        <Tab value="policies" label="Policies" />
      </CustomTabs>
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Policies' }));
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalled();
  });
  it('closes a nested schedule dialog without clearing unsaved structure changes', () => {
    const close = vi.fn();
    wrap(
      <CustomDialog
        open
        title="Schedule"
        handleClose={close}
        hasForm={false}
        guardUnsavedChanges={false}
      >
        Schedule content
      </CustomDialog>
    );
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(window.confirm).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
