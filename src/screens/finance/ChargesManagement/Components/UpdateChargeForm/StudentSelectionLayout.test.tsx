import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { StudentSelectionLayout } from './StudentSelectionLayout';

const students = [{ id: 'one', label: 'Aarav Shah', grNumber: '101', divisionName: 'A' }];

describe('charge student selection controls', () => {
  it('keeps search and names readable while only selection is disabled', () => {
    const onSelectionChange = vi.fn();
    const onSearchChange = vi.fn();
    const { container } = render(
      <StudentSelectionLayout
        students={students}
        selectedStudentIds={['one']}
        onSelectionChange={onSelectionChange}
        onSearchChange={onSearchChange}
        disabled
      />
    );

    expect(screen.getByRole('textbox', { name: 'Search students' })).toBeEnabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Aarav' } });
    expect(onSearchChange).toHaveBeenCalledWith('Aarav');
    expect(screen.getByRole('checkbox', { name: /Aarav Shah/ })).toBeDisabled();
    expect(screen.getByText('Aarav Shah')).toBeVisible();
    expect(container.querySelector('.MuiListItemButton-root.Mui-disabled')).toBeNull();
    fireEvent.click(screen.getByText('Aarav Shah'));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('selects students through their label and exposes named checkboxes', () => {
    const onSelectionChange = vi.fn();
    render(
      <StudentSelectionLayout
        students={students}
        selectedStudentIds={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(screen.getByText('Aarav Shah'));
    expect(onSelectionChange).toHaveBeenCalledWith(['one']);
    expect(screen.getByRole('checkbox', { name: /Aarav Shah/ })).toBeEnabled();
  });
});
