import type { ComponentProps } from 'react';

import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { fireEvent, render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import StudentSetupAssignmentToolbar from './student-setup-assignment-toolbar';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

const props = (): ComponentProps<typeof StudentSetupAssignmentToolbar> => ({
  view: 'division',
  title: 'Division',
  scope: 'pending',
  pendingCount: 3,
  busy: false,
  automaticCount: 2,
  manualCount: 2,
  manualEditing: false,
  changedCount: 0,
  needsReason: false,
  reason: '',
  onScopeChange: vi.fn(),
  onAuto: vi.fn(),
  onManual: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
  onReasonChange: vi.fn(),
  onReasonBlur: vi.fn(),
  onClearSelection: vi.fn(),
});
const show = (input = props()) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentSetupAssignmentToolbar {...input} />
    </ThemeProvider>
  );

it('shows a concise selection count and clears only the selection', () => {
  const input = { ...props(), selectedCount: 2 };
  show(input);
  expect(screen.getByRole('status')).toHaveTextContent('2 selected');
  fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
  expect(input.onClearSelection).toHaveBeenCalledOnce();
  expect(input.onScopeChange).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Auto' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
  expect(input.onAuto).toHaveBeenCalledOnce();
});

it.each(['gr-number', 'roll-number'] as const)(
  'does not add checkbox selection UI to %s',
  (view) => {
    show({ ...props(), view, selectedCount: 2 });
    expect(screen.queryByText('2 selected')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
  }
);

it('replaces Auto and Manual with Save and Cancel during inline editing', () => {
  const input = { ...props(), manualEditing: true, changedCount: 2 };
  show(input);
  expect(screen.queryByRole('button', { name: 'Auto' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Manual' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save (2)' }));
  expect(input.onSave).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel Editing' }));
  expect(input.onCancel).toHaveBeenCalledOnce();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

it('retains the required correction reason and visible validation', () => {
  const input = {
    ...props(),
    manualEditing: true,
    needsReason: true,
    reasonError: 'Enter a reason.',
  };
  show(input);
  const field = screen.getByRole('textbox', { name: /Reason for changing existing numbers/ });
  expect(field).toBeRequired();
  expect(screen.getByText('Enter a reason.')).toBeInTheDocument();
  fireEvent.change(field, { target: { value: 'Corrected register' } });
  fireEvent.blur(field);
  expect(input.onReasonChange).toHaveBeenCalledWith('Corrected register');
  expect(input.onReasonBlur).toHaveBeenCalledOnce();
});

it('does not show a false zero count during initial loading', () => {
  show({ ...props(), pendingCount: 0, pendingLoading: true, unavailable: true });
  expect(screen.getByLabelText('Loading pending count')).toBeInTheDocument();
  expect(screen.queryByText('0 pending')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Manual' })).toBeDisabled();
});

it('keeps a missing Auto prerequisite visible without generic helper paragraphs', () => {
  show({ ...props(), automaticCount: 0, automaticDisabledReason: 'Select one class for Auto.' });
  expect(screen.getByRole('status')).toHaveTextContent('Select one class for Auto.');
  expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Manual' })).toBeEnabled();
});

it('locks selection, scope and editing actions while saving', () => {
  show({ ...props(), manualEditing: true, busy: true, selectedCount: 2, changedCount: 2 });
  ['All Students', 'Clear selection', 'Save (2)', 'Cancel Editing'].forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeDisabled();
  });
});

it('does not clear the selected targets while a Manual draft is open', () => {
  show({ ...props(), manualEditing: true, selectedCount: 2 });
  expect(screen.getByRole('button', { name: 'Clear selection' })).toBeDisabled();
});

it('omits an unavailable pending count instead of showing a false zero', () => {
  show({ ...props(), pendingCount: undefined });
  expect(screen.queryByText(/\d+ pending/)).not.toBeInTheDocument();
});
