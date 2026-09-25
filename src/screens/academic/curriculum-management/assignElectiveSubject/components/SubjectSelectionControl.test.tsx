import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import SubjectSelectionControl from './SubjectSelectionControl';

const subjects = [
  { subjectId: 'computer-science', subjectName: 'Computer Science' },
  { subjectId: 'philosophy', subjectName: 'Philosophy' },
];

const renderControl = (onToggle = vi.fn(), disabled = false) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <SubjectSelectionControl
        subjects={subjects}
        selectedSubjectId="computer-science"
        onToggle={onToggle}
        disabled={disabled}
        ariaLabelPrefix="Mira Chauhan"
      />
    </ThemeProvider>
  );

describe('SubjectSelectionControl', () => {
  it('makes the available choices and current selection explicit', () => {
    const onToggle = vi.fn();
    renderControl(onToggle);

    const selected = screen.getByRole('button', {
      name: 'Unassign Computer Science from Mira Chauhan',
    });
    const unselected = screen.getByRole('button', {
      name: 'Assign Philosophy to Mira Chauhan',
    });

    expect(selected).toHaveAttribute('aria-pressed', 'true');
    expect(unselected).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Choose one subject')).toBeVisible();
    expect(screen.getByText('Selected')).toBeVisible();
    expect(screen.getByText('Choose')).toBeVisible();

    fireEvent.click(selected);
    fireEvent.click(unselected);

    expect(onToggle).toHaveBeenNthCalledWith(1, 'computer-science');
    expect(onToggle).toHaveBeenNthCalledWith(2, 'philosophy');
  });

  it('prevents changes while assignments are locked', () => {
    const onToggle = vi.fn();
    renderControl(onToggle, true);

    const selected = screen.getByRole('button', {
      name: 'Unassign Computer Science from Mira Chauhan',
    });

    fireEvent.click(selected);

    expect(screen.queryByText('Assignment locked')).toBeNull();
    expect(selected).toBeDisabled();
    expect(onToggle).not.toHaveBeenCalled();
  });
});
