import type { ComponentProps } from 'react';

import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import StudentSetupAssignmentToolbar from './student-setup-assignment-toolbar';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const theme = createTheme(defaultSettings);
const props = (): ComponentProps<typeof StudentSetupAssignmentToolbar> => ({
  view: 'gr-number',
  title: 'GR Number',
  pendingCount: 2,
  busy: false,
  automaticCount: 2,
  manualCount: 3,
  manualEditing: false,
  changedCount: 0,
  onAuto: vi.fn(),
  onManual: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
  needsReason: false,
  reason: '',
  onReasonChange: vi.fn(),
  onReasonBlur: vi.fn(),
});

const toolbarElement = (input: ComponentProps<typeof StudentSetupAssignmentToolbar>) => (
  <ThemeProvider theme={theme}>
    <StudentSetupAssignmentToolbar {...input} />
  </ThemeProvider>
);

describe('Student Setup assignment toolbar', () => {
  it('blocks writes when unavailable while keeping Cancel editing enabled', () => {
    const input = { ...props(), unavailable: true };
    const { rerender } = render(toolbarElement(input));
    expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Manual' })).toBeDisabled();
    rerender(toolbarElement({ ...input, manualEditing: true, changedCount: 1 }));
    expect(screen.getByRole('button', { name: 'Save (1)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel Editing' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Editing' }));
    expect(input.onCancel).toHaveBeenCalledOnce();
    expect(input.onSave).not.toHaveBeenCalled();
  });

  it.each(['division', 'gr-number', 'roll-number', 'credentials'] as const)(
    'omits the removed scope toggle for %s',
    async (view) => {
      const input = { ...props(), view };
      render(toolbarElement(input));
      expect(screen.queryByRole('combobox', { name: 'Students' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'All Students' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remaining Students' })).not.toBeInTheDocument();
    }
  );

  it('omits the removed student-scope filter from Fees', () => {
    render(toolbarElement({ ...props(), view: 'fees' }));
    expect(screen.queryByRole('button', { name: 'All Students' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remaining Students' })).not.toBeInTheDocument();
    expect(screen.getByText('2 pending')).toBeVisible();
  });

  it('keeps the heading, pending count and all controls in the same scrollable region', () => {
    render(toolbarElement({ ...props(), locks: <button type="button">Lock</button> }));
    const region = screen.getByRole('region', { name: 'GR Number controls' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toContainElement(screen.getByText('GR Number'));
    expect(region).toContainElement(screen.getByText('2 pending'));
    ['Auto', 'Manual', 'Lock'].forEach((name) => {
      expect(region).toContainElement(screen.getByRole('button', { name }));
    });
  });

  it('offers Auto and Manual and disables each when no students are eligible', () => {
    const input = props();
    const { rerender } = render(toolbarElement(input));
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
    expect(input.onAuto).toHaveBeenCalledOnce();
    expect(input.onManual).toHaveBeenCalledOnce();
    rerender(toolbarElement({ ...input, automaticCount: 0, manualCount: 0 }));
    expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Manual' })).toBeDisabled();
  });

  it('replaces Auto and Manual with save and cancel for inline editing', () => {
    const input = { ...props(), manualEditing: true, changedCount: 1 };
    const { rerender } = render(toolbarElement(input));
    expect(screen.queryByRole('button', { name: 'Auto' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manual' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save (1)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Editing' }));
    expect(input.onSave).toHaveBeenCalledOnce();
    expect(input.onCancel).toHaveBeenCalledOnce();
    rerender(toolbarElement({ ...input, changedCount: 0 }));
    expect(screen.getByRole('button', { name: 'Save (0)' })).toBeDisabled();
  });

  it('retains the required audit reason and validation for changing existing numbers', () => {
    const input = {
      ...props(),
      manualEditing: true,
      needsReason: true,
      reasonError: 'A reason is required.',
    };
    render(toolbarElement(input));
    const reason = screen.getByRole('textbox', { name: /Reason for changing existing numbers/ });
    expect(reason).toBeRequired();
    expect(reason).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('A reason is required.')).toBeInTheDocument();
    fireEvent.change(reason, { target: { value: 'Correct a transcription error.' } });
    fireEvent.blur(reason);
    expect(input.onReasonChange).toHaveBeenCalledWith('Correct a transcription error.');
    expect(input.onReasonBlur).toHaveBeenCalledOnce();
  });

  it('disables actions and the reason while an assignment is saving', () => {
    const input = { ...props(), busy: true };
    const { rerender } = render(toolbarElement(input));
    expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Manual' })).toBeDisabled();
    rerender(toolbarElement({ ...input, manualEditing: true, changedCount: 1, needsReason: true }));
    expect(screen.getByRole('button', { name: 'Save (1)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel Editing' })).toBeDisabled();
    expect(
      screen.getByRole('textbox', { name: /Reason for changing existing numbers/ })
    ).toBeDisabled();
  });

  it.each(['fees', 'credentials'] as const)(
    'keeps %s scoped without number-assignment actions',
    (view) => {
      render(toolbarElement({ ...props(), view }));
      expect(screen.queryByRole('button', { name: 'Auto' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Manual' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Save/ })).not.toBeInTheDocument();
    }
  );
});
