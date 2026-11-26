import React from 'react';
import { createPortal } from 'react-dom';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';

import ClassAccordionPanel from './ClassAccordionPanel';

const state = vi.hoisted(() => ({
  records: [] as any[],
  loading: false,
  revision: null as any,
  showActions: false,
}));
vi.mock('../hooks/useClassWiseFeeStructureHooks', () => ({
  useFetchStandardFeeStructures: () => ({
    data: state.records,
    isLoading: state.loading,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock('src/redux/finance/feeStructureWorkspace', () => ({
  useGetStructureDetailQuery: () => ({}),
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
    onRevisionReady,
    actionsContainer,
    onDeleted,
  }: any) {
    const [name, setName] = React.useState(initialData.name || '');
    const fieldId = React.useId();
    const [step, setStep] = React.useState(0);
    return (
      <div>
        {state.showActions &&
          actionsContainer &&
          createPortal(
            <button type="button" onClick={onDeleted} aria-label={`Delete ${initialData.name}`}>
              Delete
            </button>,
            actionsContainer
          )}
        {initialData.status === 0 && (
          <button type="button" onClick={() => onRevisionReady?.(state.revision)}>
            Open revision response
          </button>
        )}
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
              record: {
                id: initialData._id ?? 'new-id',
                name,
                feeHeads: [],
                concurrencyStamp: `saved-${name}`,
              },
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

afterEach(() => {
  state.loading = false;
  state.showActions = false;
  cleanup();
});
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

it('selects a structure by its status and sequence badge', () => {
  setup();
  fireEvent.click(screen.getByText('Published'));
  expect(screen.getByRole('button', { name: 'Activity fees' })).toHaveAttribute(
    'aria-current',
    'true'
  );
  fireEvent.click(within(screen.getByRole('button', { name: 'General fees' })).getByText('1'));
  expect(screen.getByRole('button', { name: 'General fees' })).toHaveAttribute(
    'aria-current',
    'true'
  );
});

it('guards status selection when dirty and prevents it while busy', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Unsaved fees' },
  });
  fireEvent.click(screen.getByText('Published'));
  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Begin Save' }));
  fireEvent.click(screen.getByText('Published'));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Unsaved fees');
});

it('keeps independent row deletion separate from selecting another structure', () => {
  state.showActions = true;
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'General fees' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Unsaved fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Delete Activity fees' }));
  expect(screen.queryByRole('button', { name: 'Activity fees' })).toBeNull();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Unsaved fees');
});

it('selects structures with Enter and Space through the row button', () => {
  setup();
  const activity = screen.getByRole('button', { name: 'Activity fees' });
  activity.focus();
  fireEvent.keyDown(activity, { key: 'Enter' });
  expect(activity).toHaveAttribute('aria-current', 'true');
  const general = screen.getByRole('button', { name: 'General fees' });
  general.focus();
  fireEvent.keyUp(general, { key: ' ' });
  expect(general).toHaveAttribute('aria-current', 'true');
});

it('opens the returned revision before a list refresh and keeps one editor after refetch', () => {
  const view = setup();
  state.revision = {
    ...state.records[1],
    id: 'revision',
    status: 1,
    revisionNumber: 2,
    previousRevisionId: 'activity',
    concurrencyStamp: 'revision-stamp',
  };
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search structures' }), {
    target: { value: 'no match' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  const navigation = within(screen.getByRole('list', { name: 'Fee structures' }));
  expect(screen.getByRole('textbox', { name: 'Search structures' })).toHaveValue('');
  expect(navigation.getAllByRole('button')).toHaveLength(3);
  expect(navigation.getAllByRole('button', { name: 'Activity fees' })).toHaveLength(2);
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Revised fees in progress' },
  });
  state.records = [...state.records, state.revision];
  view.rerender(ui());
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue(
    'Revised fees in progress'
  );
  expect(navigation.getAllByRole('button')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Activity fees');
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue(
    'Revised fees in progress'
  );
  expect(navigation.getAllByRole('button')).toHaveLength(3);
});

it('opens an existing revision without replacing its visited editor or saved input', () => {
  const view = setup();
  state.revision = {
    ...state.records[1],
    id: 'revision',
    name: 'Existing revision',
    status: 1,
    revisionNumber: 3,
    previousRevisionId: 'activity',
    concurrencyStamp: 'revision-stamp',
  };
  state.records = [...state.records, state.revision];
  view.rerender(ui());
  fireEvent.click(screen.getByRole('button', { name: 'Existing revision' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Saved revision changes' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Saved revision changes');
  expect(
    within(screen.getByRole('list', { name: 'Fee structures' })).getAllByRole('button')
  ).toHaveLength(3);
});

it('uses the returned full revision when the class list only has its summary', () => {
  const view = setup();
  state.revision = {
    ...state.records[1],
    id: 'revision',
    name: 'Existing revision',
    status: 1,
    revisionNumber: 3,
    previousRevisionId: 'activity',
    concurrencyStamp: 'revision-stamp',
  };
  const { feeHeads, ...summary } = state.revision;
  state.records = [...state.records, summary];
  view.rerender(ui());
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Existing revision');
  expect(
    within(screen.getByRole('list', { name: 'Fee structures' })).getAllByRole('button')
  ).toHaveLength(3);
});

it('reopens the renamed saved revision after requesting it again from its published parent', () => {
  const view = setup();
  state.revision = {
    ...state.records[1],
    id: 'revision',
    status: 1,
    revisionNumber: 3,
    previousRevisionId: 'activity',
    concurrencyStamp: 'revision-stamp',
  };
  const navigation = within(screen.getByRole('list', { name: 'Fee structures' }));
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Renamed saved revision' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  state.revision = {
    ...state.revision,
    name: 'Renamed saved revision',
    concurrencyStamp: 'saved-Renamed saved revision',
  };
  state.records = [...state.records, state.revision];
  view.rerender(ui());
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Renamed saved revision');
  expect(navigation.getByRole('button', { name: 'Renamed saved revision' })).toHaveAttribute(
    'aria-current',
    'true'
  );
  expect(navigation.getAllByRole('button')).toHaveLength(3);
});

it('selects another new revision while retaining the earlier renamed and saved draft', () => {
  setup();
  state.revision = {
    ...state.records[1],
    id: 'revision-one',
    status: 1,
    revisionNumber: 3,
    previousRevisionId: 'activity',
    concurrencyStamp: 'revision-one-stamp',
  };
  const navigation = within(screen.getByRole('list', { name: 'Fee structures' }));
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'First saved revision' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  state.revision = { ...state.revision, id: 'revision-two', revisionNumber: 4 };
  fireEvent.click(screen.getByRole('button', { name: 'Open revision response' }));
  expect(navigation.getAllByRole('button')).toHaveLength(4);
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Activity fees');
  fireEvent.click(navigation.getByRole('button', { name: 'First saved revision' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('First saved revision');
});

it('shows the sidebar skeleton while the first class request is pending', () => {
  state.records = [];
  state.loading = true;
  render(ui());
  expect(
    within(screen.getByRole('complementary')).getByLabelText('Loading fee structures')
  ).toBeVisible();
  expect(screen.queryByText('No fee structures')).toBeNull();
});

it('asks before switching a dirty structure and keeps all input when continuing to edit', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Unsaved fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  const confirmation = screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' });
  expect(within(confirmation).getByText(/Unsaved fees/)).toBeVisible();
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Unsaved fees');
  expect(screen.getByRole('button', { name: 'Unsaved fees' })).toHaveAttribute(
    'aria-current',
    'true'
  );
});

it('discards only unsaved edits before switching and restores the last saved values on return', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Saved fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Discard these edits' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Activity fees');
  expect(screen.queryByRole('button', { name: 'Discard these edits' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Saved fees' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Saved fees');
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('does not prompt for clean, saved or currently selected structures', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Activity fees updated' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees updated' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'General fees' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('removes an unsaved new structure only after confirming discard', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Structure' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Never saved' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'General fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.queryByRole('button', { name: 'Never saved' })).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('General fees');
});

it('also guards structure creation so a dirty editor cannot be bypassed', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Unsaved fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Structure' }));
  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('');
  expect(screen.getByRole('button', { name: 'General fees' })).toBeVisible();
});

it('restores the saved editor when discarding to open Copy Structure', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Unsaved fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Copy Structure' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('General fees');
  expect(screen.queryByRole('button', { name: 'Unsaved fees' })).toBeNull();
});

it('dismisses only the switch confirmation on Escape and preserves edits', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Unsaved fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Activity fees' }));
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' }), {
    key: 'Escape',
  });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Unsaved fees');
});

it('shows status for an unopened structure and numbers the filtered list', () => {
  setup();
  expect(screen.getByText('Published')).toBeVisible();
  expect(screen.getByText('Draft')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search structures' }), {
    target: { value: 'Activity' },
  });
  expect(within(screen.getByRole('list', { name: 'Fee structures' })).getByText('1')).toBeVisible();
});

it('keeps edits and updates the list name when cancelling a structure switch', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Annual school fees' },
  });
  expect(screen.getByRole('button', { name: /Annual school fees/ })).toHaveAttribute(
    'aria-current',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: /Activity fees/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Annual school fees');
  expect(screen.queryByRole('combobox', { name: 'Fee structure' })).toBeNull();
});

it('keeps structure names accessible without duplicate hover labels or orange dots', async () => {
  setup();
  const name = '8th Fee Structure GSEB with additional annual transport and activity fees';
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: name },
  });
  const structure = screen.getByRole('button', { name });
  expect(structure).toHaveAttribute('aria-current', 'true');
  expect(within(structure).getByText(name)).toBeVisible();
  expect(within(structure).queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
  fireEvent.mouseOver(structure);
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('preserves changed structure navigation and save state without an extra dot', () => {
  setup();
  const navigation = within(screen.getByRole('list', { name: 'Fee structures' }));
  expect(navigation.queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Updated general fees' },
  });
  expect(navigation.getByRole('button', { name: 'Updated general fees' })).toBeVisible();
  expect(navigation.queryByText('Unsaved changes')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  fireEvent.click(navigation.getByRole('button', { name: 'Activity fees' }));
  expect(navigation.queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
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
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.change(search, { target: { value: '' } });
  fireEvent.click(navigation.getByRole('button', { name: /Updated general fees/ }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Updated general fees');
  fireEvent.change(search, { target: { value: 'no matching structure' } });
  expect(screen.getByText('No structures match your search.')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Structure' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(search).toHaveValue('');
  const newStructure = navigation.getByRole('button', { name: /New fee structure/ });
  expect(newStructure).toHaveAttribute('aria-current', 'true');
  expect(within(newStructure).queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(within(newStructure).queryByRole('img', { name: 'Unsaved changes' })).toBeNull();
});

it('selects a new local draft and preserves its saved name after visiting another structure', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Structure' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Bus fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
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
  expect(screen.getByRole('button', { name: 'Structure' })).toBeDisabled();
});

it('does not offer structure creation without its permission', () => {
  setup(false);
  expect(screen.queryByRole('button', { name: 'Structure' })).toBeNull();
});

it('keeps a new editor mounted and selected after saving and list refetch', () => {
  const view = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Structure' }));
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

it('mounts only activated editors for fifty saved structures and preserves visited drafts', () => {
  state.records = Array.from({ length: 50 }, (_, index) => ({
    id: `record-${index}`,
    name: `Fees ${index}`,
    status: 1,
    feeHeads: [],
    concurrencyStamp: 'v1',
  }));
  render(ui());
  expect(screen.getAllByLabelText('Draft name')).toHaveLength(1);
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), {
    target: { value: 'Draft preserved' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fees 49' }));
  expect(screen.getAllByLabelText('Draft name')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Draft preserved' }));
  expect(screen.getByRole('textbox', { name: 'Draft name' })).toHaveValue('Draft preserved');
});
