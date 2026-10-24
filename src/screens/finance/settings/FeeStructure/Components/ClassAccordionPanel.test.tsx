import React from 'react';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';

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
vi.mock('./CopyFeeStructureDialog', () => ({ default: () => null }));
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

it('exposes a long structure name in the navigation and its keyboard tooltip', async () => {
  setup();
  const name = '8th Fee Structure GSEB with additional annual transport and activity fees';
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: name },
  });
  const structure = screen.getByRole('button', { name: new RegExp(name) });
  expect(structure).toHaveAttribute('aria-current', 'true');
  expect(within(structure).getByText(name)).toBeVisible();
  // Happy DOM does not implement the browser's keyboard :focus-visible state.
  const matches = structure.matches.bind(structure);
  vi.spyOn(structure, 'matches').mockImplementation(
    (selector) => selector === ':focus-visible' || matches(selector)
  );
  fireEvent.focus(structure);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(name);
});

it('shows an unsaved dot on the changed structure across navigation and clears it after saving', () => {
  setup();
  const navigation = within(screen.getByRole('list', { name: 'Fee structures' }));
  expect(navigation.queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Updated general fees' },
  });
  expect(
    within(navigation.getByRole('button', { name: /Updated general fees/ })).getByRole('img', {
      name: 'Unsaved changes',
    })
  ).toBeVisible();
  expect(navigation.queryByText('Unsaved changes')).toBeNull();
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  expect(navigation.getByRole('img', { name: 'Unsaved changes' })).toBeVisible();
  fireEvent.click(navigation.getByRole('button', { name: /Updated general fees/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(navigation.queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
});

it('filters structures without losing edits and clears the filter when adding a new structure', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Updated general fees' },
  });
  const search = screen.getByRole('textbox', { name: 'Search structures' });
  fireEvent.change(search, { target: { value: 'ACTIVITY' } });
  const navigation = within(screen.getByRole('list', { name: 'Fee structures' }));
  expect(navigation.queryByRole('button', { name: /Updated general fees/ })).toBeNull();
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  fireEvent.change(search, { target: { value: '' } });
  fireEvent.click(navigation.getByRole('button', { name: /Updated general fees/ }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Updated general fees');
  fireEvent.change(search, { target: { value: 'no matching structure' } });
  expect(screen.getByText('No structures match your search.')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Add Structure' }));
  expect(search).toHaveValue('');
  const newStructure = navigation.getByRole('button', { name: /New fee structure/ });
  expect(newStructure).toHaveAttribute('aria-current', 'true');
  expect(within(newStructure).getByRole('img', { name: 'Unsaved changes' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(within(newStructure).queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
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
