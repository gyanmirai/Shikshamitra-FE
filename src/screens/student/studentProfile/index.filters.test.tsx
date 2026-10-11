import { vi, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { StudentProfile } from './index';

const state = vi.hoisted(() => {
  const path = (suffix: string) => ({
    id: `medium-${suffix}`,
    name: `Medium ${suffix}`,
    educationMediumStages: [
      {
        id: `organization-${suffix}`,
        name: `Organization ${suffix}`,
        standards: [
          {
            id: `class-${suffix}`,
            name: `Class ${suffix}`,
            divisions: [{ id: `division-${suffix}`, name: `Division ${suffix}` }],
          },
        ],
      },
    ],
  });
  const mediumA = path('a');
  return {
    queries: [] as string[],
    globalState: {
      currentYear: {
        id: 'year',
        boards: [
          { id: 'board-one', name: 'Board One', educationMediums: [mediumA, path('b')] },
          { id: 'board-two', name: 'Board Two', educationMediums: [path('c')] },
        ],
      },
      currentBoard: { id: 'board-one' },
      currentMedium: mediumA,
    },
  };
});

vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: state.globalState }),
}));
vi.mock('src/redux/student', () => ({
  useGetStudentsByDivisionQuery: (divisionId: string, options: { skip: boolean }) => {
    if (!options.skip) state.queries.push(divisionId);
    return { data: { items: [] }, isLoading: false, isFetching: false };
  },
}));
vi.mock('src/hooks/use-search-param', () => ({
  useCustomSearchParams: () => ({ getAllParams: () => ({}), setParam: vi.fn() }),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    onChange,
    disabled,
    labelKey = 'label',
    valueKey = 'value',
  }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option[valueKey]} value={option[valueKey]}>
          {option[labelKey]}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => <div>Student table</div> }));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/three-dots-actions', () => ({ default: () => null }));
vi.mock(
  'src/screens/finance/FeeStructureAssign/Components/StudentFeeStructureAssignmentForm',
  () => ({ default: () => null })
);
vi.mock('./finance', () => ({ default: () => null }));
vi.mock('./libraray', () => ({ default: () => null }));
vi.mock('./academic', () => ({ default: () => null }));
vi.mock('./document', () => ({ default: () => null }));
vi.mock('./attendance', () => ({ default: () => null }));
vi.mock('./communication', () => ({ default: () => null }));
vi.mock('./StudentCalendar', () => ({ default: () => null }));
vi.mock('./studentDashboard', () => ({ default: () => null }));
vi.mock('./transport', () => ({ default: () => null }));
vi.mock('./information', () => ({ StudentInformation: () => null }));
vi.mock('./change-status-form', () => ({ default: () => null }));
vi.mock('./student-profile-view', () => ({ StudentProfileView: () => null }));
vi.mock('./student-profile-data-boundary', () => ({ StudentProfileDataBoundary: () => null }));

it('filters Student List from board through division before querying students', async () => {
  render(<StudentProfile />);

  expect(screen.getByRole('heading', { name: 'Student List' })).toBeVisible();
  expect(
    screen.getAllByRole('combobox').map((select) => select.getAttribute('aria-label'))
  ).toEqual(['Board', 'Medium', 'Organization', 'Class', 'Division']);
  await waitFor(() => expect(state.queries).toContain('division-a'));

  fireEvent.change(screen.getByRole('combobox', { name: 'Medium' }), {
    target: { value: 'medium-b' },
  });
  await waitFor(() => {
    expect(screen.getByRole('combobox', { name: 'Organization' })).toHaveValue('organization-b');
    expect(state.queries).toContain('division-b');
  });

  fireEvent.change(screen.getByRole('combobox', { name: 'Board' }), {
    target: { value: 'board-two' },
  });
  await waitFor(() => {
    expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveValue('medium-c');
    expect(screen.getByRole('combobox', { name: 'Organization' })).toHaveValue('organization-c');
    expect(state.queries).toContain('division-c');
  });
});
