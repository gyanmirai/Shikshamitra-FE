import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, within, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ElectiveAssignmentActions from './ElectiveAssignmentActions';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const renderActions = (overrides = {}) => {
  const callbacks = {
    onViewInsights: vi.fn(),
    onDiscard: vi.fn(),
    onSaveDraft: vi.fn(),
    onReviewLock: vi.fn(),
  };

  const view = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ElectiveAssignmentActions
        isLocked={false}
        hasUnsavedChanges={false}
        isSaving={false}
        canLock={false}
        lockTooltip="Assign every student before locking."
        {...callbacks}
        {...overrides}
      />
    </ThemeProvider>
  );

  return { ...view, ...callbacks };
};

describe('ElectiveAssignmentActions', () => {
  it('shows the workflow actions without a status label', () => {
    const { getByRole, queryByText, onViewInsights } = renderActions();
    const actionGroup = getByRole('group', { name: 'Elective assignment actions' });
    const buttons = within(actionGroup).getAllByRole('button');

    expect(queryByText('Ready to Lock')).toBeNull();
    expect(queryByText('Draft')).toBeNull();
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'View full insights',
      'Discard',
      'Save Draft',
      'Review & Lock',
    ]);
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
    expect(buttons[3]).toBeDisabled();

    fireEvent.click(buttons[0]);
    expect(onViewInsights).toHaveBeenCalledOnce();
  });

  it('shows only the relevant actions for a locked workflow', () => {
    const { getByRole, queryByText } = renderActions({
      isLocked: true,
    });
    const actionGroup = getByRole('group', { name: 'Elective assignment actions' });

    expect(queryByText('Draft')).toBeNull();
    expect(within(actionGroup).getByRole('button', { name: 'View full insights' })).toBeEnabled();
    expect(within(actionGroup).getByRole('button', { name: 'Locked' })).toBeDisabled();
    expect(within(actionGroup).queryByRole('button', { name: 'Discard' })).toBeNull();
    expect(within(actionGroup).queryByRole('button', { name: 'Save Draft' })).toBeNull();
  });
});
