import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import StudentDirectoryFilterFields from './student-directory-filter-fields';

vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, disabled, multiple }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      multiple={multiple}
      onChange={() => undefined}
    >
      <option value="">Choose</option>
      {options.map((option: any) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  ),
}));

const options = {
  academicYears: [],
  boards: [{ id: 'board', name: 'CBSE' }],
  mediums: [{ id: 'medium', name: 'English', parentId: 'board' }],
  standards: [{ id: 'class', name: 'Class 1', parentId: 'medium' }],
  divisions: [{ id: 'division', name: 'A', parentId: 'class' }],
};
const values = { board: '', medium: '', class: '', division: '' };

it('preserves all-scope filtering for existing shared-component callers', () => {
  render(
    <StudentDirectoryFilterFields
      values={values}
      options={options}
      isLoading={false}
      onChange={vi.fn()}
    />
  );
  expect(screen.getAllByRole('option', { name: /^All / })).toHaveLength(4);
  expect(screen.getByLabelText('Medium')).toBeEnabled();
});

it('keeps the strict attendance controls single-select when parents are chosen', () => {
  render(
    <StudentDirectoryFilterFields
      allowAllScope={false}
      values={{ board: 'board', medium: 'medium', class: 'class', division: 'division' }}
      options={options}
      isLoading={false}
      onChange={vi.fn()}
    />
  );
  expect(screen.queryAllByRole('option', { name: /^All / })).toHaveLength(0);
  ['Board', 'Medium', 'Class', 'Division'].forEach((label) => {
    expect(screen.getByLabelText(label)).toBeEnabled();
    expect(screen.getByLabelText(label)).not.toHaveAttribute('multiple');
  });
});
