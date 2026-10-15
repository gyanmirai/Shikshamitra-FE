import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import LeaveRequestsPage from './index';

const state = vi.hoisted(() => ({
  params: new URLSearchParams(),
  update: vi.fn(),
}));

vi.mock('../setting/attendance-context', () => ({
  useAttendanceContext: () => ({
    params: state.params,
    update: state.update,
    currentYear: {
      id: 'year',
      boards: [
        {
          id: 'board',
          name: 'CBSE',
          educationMediums: [
            {
              id: 'medium',
              name: 'English',
              educationMediumStages: [
                {
                  id: 'organization',
                  name: 'Primary',
                  standards: [
                    {
                      id: 'class',
                      name: 'Class 1',
                      divisions: [{ id: 'division', name: 'A' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  }),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled }: any) => (
    <div>
      {label}
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option: any) => (
          <option key={option.value ?? option.id} value={option.value ?? option.id}>
            {option.label ?? option.name}
          </option>
        ))}
      </select>
    </div>
  ),
}));
vi.mock('./leave-requests', () => ({
  default: ({ scope }: any) => <pre data-testid="leave-scope">{JSON.stringify(scope)}</pre>,
}));

describe('leave requests page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.params = new URLSearchParams();
  });

  it('keeps a dashboard pending queue across all boards and mediums', () => {
    state.params = new URLSearchParams(
      'dashboard=pending&year=year-2&class=other-class&division=other-division'
    );
    render(<LeaveRequestsPage />);
    expect(JSON.parse(screen.getByTestId('leave-scope').textContent ?? '{}')).toEqual({
      academicYearId: 'year-2',
      standardId: 'other-class',
      divisionId: 'other-division',
    });
  });

  it('shows only leave requests with board, medium, organization, class, and division filters', () => {
    state.params = new URLSearchParams('organization=organization&class=class&division=division');
    render(<LeaveRequestsPage />);
    expect(screen.getByRole('heading', { name: 'Leave Requests' })).toBeVisible();
    expect(screen.queryByText('Attendance corrections')).not.toBeInTheDocument();
    ['Board', 'Medium', 'Organization', 'Class', 'Division'].forEach((label) => {
      expect(screen.getByRole('combobox', { name: label })).toBeVisible();
    });
    expect(JSON.parse(screen.getByTestId('leave-scope').textContent ?? '')).toEqual({
      academicYearId: 'year',
      educationMediumId: 'medium',
      organizationId: 'organization',
      standardId: 'class',
      divisionId: 'division',
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Organization' }), {
      target: { value: 'All Organizations' },
    });
    expect(state.update).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: undefined,
        class: undefined,
        division: undefined,
        leavePage: undefined,
      })
    );
  });

  it('shows All labels for unset filters and clears their scope on selection', () => {
    render(<LeaveRequestsPage />);
    expect(screen.getByRole('combobox', { name: 'Organization' })).toHaveValue('All Organizations');
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('All Classes');
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('All Divisions');
    expect(JSON.parse(screen.getByTestId('leave-scope').textContent ?? '')).toEqual({
      academicYearId: 'year',
      educationMediumId: 'medium',
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), {
      target: { value: 'All Classes' },
    });
    expect(state.update).toHaveBeenCalledWith(
      expect.objectContaining({ class: undefined, division: undefined })
    );
  });
});
