import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import RefundGeneralInfoCard from './RefundGeneralInfoCard';

const mocks = vi.hoisted(() => ({
  set: vi.fn(),
  classes: [{ id: 'class', name: 'UKG', divisions: [{ id: 'division', name: 'A' }] }],
  year: {
    id: 'year',
    boards: [{ id: 'board', name: 'CBSE', educationMediums: [{ id: 'medium', name: 'English' }] }],
  },
  load: vi.fn(),
}));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: mocks.year }) }));
vi.mock('src/redux/student', () => ({ useGetStudentsByScopeQuery: () => ({ currentData: [] }) }));
vi.mock('src/redux/class/classApi', () => ({ useLazyGetClassByMediumQuery: vi.fn() }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [mocks.load, { data: mocks.classes }],
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, value, disabled }: any) => (
    <select aria-label={label} value={value} disabled={disabled} onChange={() => {}}>
      {options.map((option: any) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  ),
}));

it('disables all five student identity controls while displaying the saved student', () => {
  const formik = {
    values: {
      boardId: 'board',
      mediumId: 'medium',
      standardId: 'class',
      divisionId: 'division',
      studentId: 'student',
      studentName: 'Saved Student',
    },
    touched: {},
    errors: {},
    setFieldValue: mocks.set,
    setFieldTouched: vi.fn(),
  };
  render(<RefundGeneralInfoCard disabled formik={formik as any} />);
  const controls = screen.getAllByRole('combobox');
  expect(controls).toHaveLength(5);
  controls.forEach((control) => expect(control).toBeDisabled());
  expect(screen.getByRole('combobox', { name: 'Student *' })).toHaveValue('Saved Student');
  expect(mocks.set).not.toHaveBeenCalled();
});
