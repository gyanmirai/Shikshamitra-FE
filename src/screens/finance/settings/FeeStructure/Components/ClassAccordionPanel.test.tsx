import React from 'react';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import ClassAccordionPanel from './ClassAccordionPanel';

const state = vi.hoisted(() => ({ records: [] as any[] }));
vi.mock('../hooks/useClassWiseFeeStructureHooks', () => ({
  useFetchStandardFeeStructures: () => ({
    data: state.records,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => true }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('./FeeStructureWorkspaceCard', () => ({
  default: function Editor({
    initialData,
    onDirtyChange,
    onBusyChange,
    onNameChange,
    onSaved,
  }: any) {
    const [name, setName] = React.useState(initialData.name || '');
    const fieldId = React.useId();
    const [step, setStep] = React.useState(0);
    return (
      <div>
        <label htmlFor={fieldId}>
          Draft name
          <input
            id={fieldId}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              onDirtyChange(true);
              onNameChange(event.target.value);
            }}
          />
        </label>
        <button type="button" onClick={() => onBusyChange(true)}>
          Begin Save
        </button>
        <button
          type="button"
          onClick={() => {
            onSaved({
              ...initialData,
              _id: initialData._id ?? 'new-id',
              name,
              record: { id: initialData._id ?? 'new-id', name, concurrencyStamp: `saved-${name}` },
            });
            setStep(1);
          }}
        >
          Save & Next
        </button>
        <span>Step {step}</span>
        <span>Received {initialData.name}</span>
      </div>
    );
  },
}));

afterEach(cleanup);
const ui = (canAdd = true) => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <ClassAccordionPanel classId="class" feeStructureMetaDataId="metadata" canAdd={canAdd} />
  </ThemeProvider>
);
function setup(canAdd = true) {
  state.records = [
    { id: 'general', name: 'General fees', status: 1, feeHeads: [], concurrencyStamp: 'a1' },
    { id: 'activity', name: 'Activity fees', status: 0, feeHeads: [], concurrencyStamp: 'b1' },
  ];
  return render(ui(canAdd));
}

it('keeps edits and updates the structure list name when switching between structures', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Annual school fees' },
  });
  expect(screen.getByRole('button', { name: /Annual school fees/ })).toHaveAttribute(
    'aria-current',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: /Activity fees/ }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Activity fees');
  fireEvent.click(screen.getByRole('button', { name: /Annual school fees/ }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Annual school fees');
  expect(screen.queryByRole('combobox', { name: 'Fee structure' })).toBeNull();
});

it('selects a new local draft and preserves its name after visiting a saved structure', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Add Structure' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Bus fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: /General fees/ }));
  fireEvent.click(screen.getByRole('button', { name: /Bus fees/ }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Bus fees');
});

it('locks structure navigation and creation while a save is running', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Begin Save' }));
  expect(screen.getByRole('button', { name: /Activity fees/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByRole('button', { name: 'Add Structure' })).toBeDisabled();
});

it('does not offer structure creation without its permission', () => {
  setup(false);
  expect(screen.queryByRole('button', { name: 'Add Structure' })).toBeNull();
});

it('keeps a new editor mounted and selected after saving and list refetch', () => {
  const view = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Add Structure' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'New fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(screen.getByText('Step 1')).toBeVisible();
  state.records = [
    ...state.records,
    { id: 'new-id', name: 'New fees', status: 1, concurrencyStamp: 'saved-New fees' },
  ];
  view.rerender(ui());
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('New fees');
  expect(screen.getByText('Step 1')).toBeVisible();
  expect(
    screen.getByRole('list', { name: 'Fee structures' }).querySelectorAll('[role="button"]')
  ).toHaveLength(3);
});

it('does not revert the latest save while the list still contains an older response', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'First save' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(screen.getByText('Received First save')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Second save' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(screen.getByText('Received Second save')).toBeVisible();
});
