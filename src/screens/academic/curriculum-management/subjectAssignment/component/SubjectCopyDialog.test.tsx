import type { Standards } from 'src/types/school';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { screen, render, within, waitFor, fireEvent } from '@testing-library/react';

import SubjectCopyDialog from './SubjectCopyDialog';

const sourceClass = { id: 'source-10', name: 'Class 10' } as Standards;
const nativeConfirm = window.confirm;

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/iconify/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('./subject-copy-dialog/useEligibleCopyClasses', () => ({
  useEligibleCopyClasses: () => ({
    eligibleClasses: [sourceClass],
    isFilteringClasses: false,
    filterError: false,
    retry: vi.fn(),
  }),
}));
vi.mock('./subject-copy-dialog/useCopySubjects', () => ({
  useCopySubjects: () => ({
    selectedSubjectIds: [],
    selectedSubjectsList: [],
    resetSelection: vi.fn(),
  }),
}));

function renderCopy(isLoading = false) {
  const onClose = vi.fn();
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  const store = configureStore({ reducer: { confirmPopup: confirmPopupReducer } });
  function Harness() {
    const [open, setOpen] = useState(true);
    return (
      <SubjectCopyDialog
        open={open}
        isLoading={isLoading}
        allClass={[sourceClass]}
        sourceClassId="destination-6"
        sourceClassName="Class 6"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        onConfirm={onConfirm}
      />
    );
  }
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Harness />
      </ThemeProvider>
    </Provider>
  );
  return { onClose, onConfirm, store };
}

async function selectSource() {
  const input = screen.getByRole('combobox', { name: /Source class/ });
  fireEvent.change(input, { target: { value: 'Class 10' } });
  fireEvent.click(await screen.findByRole('option', { name: 'Class 10' }));
  expect(input).toHaveValue('Class 10');
}

beforeEach(() => {
  window.confirm = vi.fn(() => false);
});
afterEach(() => {
  window.confirm = nativeConfirm;
  vi.restoreAllMocks();
});

describe('Copy subject allocations dialog', () => {
  it('uses shared sections with help and a semantically required source field', () => {
    const { store } = renderCopy();
    ['Source and Destination', 'Choose Subjects', 'Copy Settings'].forEach((title) => {
      expect(screen.getByRole('heading', { name: title }).closest('section')).not.toBeNull();
      expect(screen.getByRole('button', { name: `${title} information` })).toBeVisible();
    });
    expect(screen.getByRole('combobox', { name: /Source class/ })).toBeRequired();
    expect(store.getState().confirmPopup.isChanges).toBe(false);
  });

  it('closes a clean dialog once without a native prompt', async () => {
    const { onClose } = renderCopy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(window.confirm).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it.each(['Cancel', 'close', 'Escape'])(
    'keeps dirty values when %s opens the single discard decision',
    async (action) => {
      const { onClose } = renderCopy();
      await selectSource();
      if (action === 'Escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      else fireEvent.click(screen.getByRole('button', { name: action }));
      const decision = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
      expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(2);
      fireEvent.click(within(decision).getByRole('button', { name: 'Keep editing' }));
      expect(screen.getByRole('combobox', { name: /Source class/ })).toHaveValue('Class 10');
      expect(onClose).not.toHaveBeenCalled();
      expect(window.confirm).not.toHaveBeenCalled();
    }
  );

  it('discards once through the same close request and clears the copy dirty bridge', async () => {
    const { onClose, store } = renderCopy();
    await selectSource();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const decision = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
    fireEvent.click(within(decision).getByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(store.getState().confirmPopup.isChanges).toBe(false);
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('retains review details, choices and the existing draft allocation payload', async () => {
    const { onConfirm } = renderCopy();
    await selectSource();
    fireEvent.click(screen.getByRole('switch', { name: 'Documents and links' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Teacher assignments' }));
    fireEvent.click(screen.getByRole('radio', { name: /Replace destination settings/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Review copy' }));
    const review = await screen.findByRole('dialog', { name: 'Review Copy' });
    expect(within(review).getByRole('heading', { name: 'Copy Summary' })).toBeVisible();
    expect(within(review).getByRole('button', { name: 'Copy Summary information' })).toBeVisible();
    expect(within(review).getByText('Class 10')).toBeVisible();
    expect(within(review).getByText('Class 6')).toBeVisible();
    expect(within(review).getByText('Teachers')).toBeVisible();
    expect(within(review).getByText('Replace settings')).toBeVisible();
    fireEvent.click(within(review).getByRole('button', { name: 'Copy allocations' }));
    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledExactlyOnceWith({
        sourceClassId: 'source-10',
        targetClassId: 'destination-6',
        subjectIds: null,
        includeTeachers: true,
        includeDocuments: false,
        conflictStrategy: 'OVERWRITE',
        targetStatus: 0,
      })
    );
  });

  it('locks Cancel and shell close while the copy is busy', () => {
    const { onClose } = renderCopy(true);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
