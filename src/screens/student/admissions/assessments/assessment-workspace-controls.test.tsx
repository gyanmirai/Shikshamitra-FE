import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AssessmentWorkspaceControls } from './assessment-workspace-controls';

vi.mock('../admission-academic-filters', () => ({
  AdmissionAcademicFilters: ({ filterAction }: any) => <div>{filterAction}</div>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label }: any) => <select aria-label={label} />,
}));
vi.mock('../admission-query-error', () => ({ AdmissionQueryError: () => <div>Query failed</div> }));

it('shows exactly four progress choices using server counts and resets paging when changing status', () => {
  const update = vi.fn();
  const data: any = {
    state: { status: 'pending', sessionId: '' },
    academic: {},
    applicants: {
      currentData: { statusCounts: { all: 30, pending: 20, complete: 6, ongoing: 4 } },
    },
    sessions: {},
    sessionChoices: [],
    selectedSession: {},
    updateWorkbench: update,
    setScope: vi.fn(),
  };
  render(<AssessmentWorkspaceControls data={data} />);
  const group = screen.getByRole('group', { name: 'Assessment status filter' });
  expect([...group.querySelectorAll('button')].map((button) => button.textContent)).toEqual([
    'All30',
    'Pending20',
    'Complete6',
    'Ongoing4',
  ]);
  expect(screen.getByRole('button', { name: 'Pending 20' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Complete 6' }));
  expect(update).toHaveBeenCalledWith({
    assessmentStatus: 'complete',
    assessmentQueue: undefined,
    assessmentPage: 0,
  });
  expect(
    screen.queryByRole('button', { name: /More Filters|View All Insights/ })
  ).not.toBeInTheDocument();
});
