import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ClassDivisionFilter from './class-division-filter';

const mocks = vi.hoisted(() => ({ scope: {} as any }));
vi.mock('src/hooks/use-student-academic-scope', () => ({
  useStudentAcademicScope: () => mocks.scope,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));

describe('dashboard Institute Setup academic filters', () => {
  beforeEach(() => {
    mocks.scope = {
      currentYear: { id: 'year-1' },
      currentMedium: {
        id: 'medium-1',
        educationMediumStages: [
          {
            standards: [
              { id: 'prep', name: 'Preparatory', divisions: [{ id: 'lotus', name: 'Lotus' }] },
              { id: 'oak', name: 'Oak', divisions: [{ id: 'rose', name: 'Rose' }] },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    };
  });

  it('shows configured names and clears division when the class changes', () => {
    render(<ClassDivisionFilter />);
    expect(screen.getByRole('option', { name: 'Preparatory' })).toHaveValue('prep');
    expect(screen.queryByRole('option', { name: 'Class 10' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'prep' } });
    fireEvent.change(screen.getByLabelText('Division'), { target: { value: 'lotus' } });
    fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'oak' } });
    expect(screen.getByLabelText('Division')).toHaveValue('');
    expect(screen.queryByRole('option', { name: 'Lotus' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Rose' })).toHaveValue('rose');
  });

  it('clears academic selections when the year changes and blocks failed scope reads', () => {
    const view = render(<ClassDivisionFilter />);
    fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'prep' } });
    mocks.scope = { ...mocks.scope, currentYear: { id: 'year-2' } };
    view.rerender(<ClassDivisionFilter />);
    expect(screen.getByLabelText('Class')).toHaveValue('');
    mocks.scope = { ...mocks.scope, isError: true };
    view.rerender(<ClassDivisionFilter />);
    expect(screen.getByLabelText('Class')).toBeDisabled();
    expect(screen.getByLabelText('Division')).toBeDisabled();
  });
});
