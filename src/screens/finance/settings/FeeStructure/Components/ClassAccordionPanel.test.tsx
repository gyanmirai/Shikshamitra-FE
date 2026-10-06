import React, { useState } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ClassAccordionPanel from './ClassAccordionPanel';

const state = vi.hoisted(() => ({ records: [] as any[] }));
vi.mock('../hooks/useClassWiseFeeStructureHooks', () => ({
  useFetchStandardFeeStructures: () => ({
    data: state.records,
    isLoading: false,
    isFetching: false,
    isError: false,
  }),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, value, onChange }: any) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('./FeeStructureWorkspaceCard', () => ({
  default: function MockEditor({ initialData, onSaved, structureSelector }: any) {
    const [name, setName] = useState(initialData.name);
    const [step, setStep] = useState(0);
    return (
      <div>
        {structureSelector}
        <input
          aria-label="Structure name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <span>Step {step}</span>
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
          Save & next
        </button>
        <span>Received {initialData.name}</span>
      </div>
    );
  },
}));
const theme = createTheme(defaultSettings);
beforeEach(() => {
  state.records = [
    { id: 'a', name: 'First', status: 1, concurrencyStamp: 'a1' },
    { id: 'b', name: 'Second', status: 1, concurrencyStamp: 'b1' },
  ];
});
const ui = (register?: (fn: () => void) => void) => (
  <ThemeProvider theme={theme}>
    <ClassAccordionPanel
      classId="class"
      feeStructureMetaDataId="metadata"
      onRegisterAddNew={register}
    />
  </ThemeProvider>
);

it('preserves an edited structure when switching away and back', () => {
  render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: 'Structure name' }), {
    target: { value: 'Edited first' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: 'Fee structure' }), {
    target: { value: 'b' },
  });
  expect(screen.getByRole('textbox', { name: 'Structure name' })).toHaveValue('Second');
  fireEvent.change(screen.getByRole('combobox', { name: 'Fee structure' }), {
    target: { value: 'a' },
  });
  expect(screen.getByRole('textbox', { name: 'Structure name' })).toHaveValue('Edited first');
});

it('keeps a new editor mounted and selected after saving, including after the list refetches', () => {
  let add = () => {};
  const view = render(
    ui((fn) => {
      add = fn;
    })
  );
  // Invoke the same registered action the workspace header uses.
  fireEvent.click(Object.assign(document.createElement('button'), { onclick: add }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Structure name' }), {
    target: { value: 'New fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & next' }));
  expect(screen.getByText('Step 1')).toBeVisible();
  state.records = [
    ...state.records,
    { id: 'new-id', name: 'New fees', status: 1, concurrencyStamp: 'saved-New fees' },
  ];
  view.rerender(ui());
  expect(screen.getByRole('textbox', { name: 'Structure name' })).toHaveValue('New fees');
  expect(screen.getByText('Step 1')).toBeVisible();
  expect(screen.getAllByRole('option')).toHaveLength(3);
});

it('does not revert the latest save while the list still contains an older response', () => {
  render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: 'Structure name' }), {
    target: { value: 'First save' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & next' }));
  expect(screen.getByText('Received First save')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Structure name' }), {
    target: { value: 'Second save' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & next' }));
  expect(screen.getByText('Received Second save')).toBeVisible();
});
