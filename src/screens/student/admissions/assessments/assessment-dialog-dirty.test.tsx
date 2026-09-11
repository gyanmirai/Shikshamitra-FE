import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import CustomDialog from 'src/components/customDialog';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, cleanup } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopup, { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AssessmentActionDialog } from './assessment-action-dialog';
import { AssessmentSessionDialog } from './assessment-session-dialog';

vi.mock('@mui/icons-material', async () => ({ Close: (await import('@mui/icons-material/Close')).default }));
['mdi:close', 'mdi:content-save-outline'].forEach((name) => {
  addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});
type Kind = 'session' | 'action' | 'legacy';
const stores: ReturnType<typeof makeStore>[] = [];
const makeStore = () => configureStore({
  reducer: { confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware),
});

function Harness({ kind, onClosed }: { kind: Kind; onClosed: () => void }) {
  const [open, setOpen] = useState(true);
  const close = () => { setOpen(false); onClosed(); };
  if (!open) return null;
  if (kind === 'legacy') return <CustomDialog open title="Legacy dialog" handleClose={close}><p>Existing form</p></CustomDialog>;
  if (kind === 'session') return <AssessmentSessionDialog
    scope={{ admissionOfferingId: 'offering-1', offeringName: 'Grade 6', workflowStageDefinitionId: 'stage-1',
      stageName: 'Entrance assessment', workflowDefinitionId: 'workflow-1', workflowVersion: 1, schedulingEnabled: true }}
    onSave={async () => undefined} onClose={close} />;
  return <AssessmentActionDialog action="result" admissionOfferingId="offering-1" workflowStageDefinitionId="stage-1"
    assessment={{ ...assessmentResponse, policy: DEFAULT_ASSESSMENT_POLICY }} onClose={close} />;
}

function setup(kind: Kind) {
  const store = makeStore();
  stores.push(store);
  store.dispatch(setIsChanges(true));
  const closed = vi.fn();
  render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}>
    <LocalizationProvider dateAdapter={AdapterDayjs}><Harness kind={kind} onClosed={closed} /></LocalizationProvider>
  </ThemeProvider></Provider>);
  return { store, closed };
}

afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Keep keyboard and dialog lifecycle checks bounded without timing out mid-interaction.
describe('assessment dialog dirty-state interactions', { timeout: 15000 }, () => {
it.each(['session', 'action'] as const)('closing a clean %s dialog preserves the parent page guard', async (kind) => {
  const confirm = vi.fn().mockReturnValue(true);
  vi.stubGlobal('confirm', confirm);
  const { store, closed } = setup(kind);
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'close' }));
  expect(confirm).not.toHaveBeenCalled();
  expect(closed).toHaveBeenCalledOnce();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});

it.each(['session', 'action'] as const)('local %s edits require confirmation without clearing the parent guard', async (kind) => {
  const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
  vi.stubGlobal('confirm', confirm);
  const { store, closed } = setup(kind);
  await userEvent.type(screen.getByRole('textbox', { name: kind === 'session' ? /Session name/ : 'Notes / reason' }), 'Keep these notes');
  await userEvent.click(screen.getByRole('button', { name: 'close' }));
  expect(closed).not.toHaveBeenCalled();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'close' }));
  expect(closed).toHaveBeenCalledOnce();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});

it('preserves the existing legacy dialog confirmation and global clear', async () => {
  const confirm = vi.fn().mockReturnValue(true);
  vi.stubGlobal('confirm', confirm);
  const { store, closed } = setup('legacy');
  await userEvent.click(screen.getByRole('button', { name: 'close' }));
  expect(confirm).toHaveBeenCalledWith('Are you sure you want to leave this page?');
  expect(closed).toHaveBeenCalledOnce();
  expect(store.getState().confirmPopup.isChanges).toBe(false);
});

it('guards browser refresh only while the locally edited dialog is open', async () => {
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  const { store } = setup('action');
  await userEvent.type(screen.getByRole('textbox', { name: 'Notes / reason' }), 'Unsubmitted result');
  const pending = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(pending);
  expect(pending.defaultPrevented).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  const closed = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(closed);
  expect(closed.defaultPrevented).toBe(false);
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});
});
