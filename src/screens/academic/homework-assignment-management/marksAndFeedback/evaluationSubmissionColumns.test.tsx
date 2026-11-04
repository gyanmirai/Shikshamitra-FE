import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, cleanup } from '@testing-library/react';
import { matchesTableRowFilters } from 'src/components/customizabaleTable/hooks/table-row-filter';

import EvaluationFeedbackCell from './evaluationFeedbackCell';
import { getEvaluationSummary } from './evaluationWorkspaceUi';
import { getEvaluationSubmissionColumns } from './evaluationSubmissionColumns';

const options = { assignment: true, canAdd: true, onView: vi.fn(), onEdit: vi.fn() };
const columns = getEvaluationSubmissionColumns(options);
const row = {
  studentName: 'Student One',
  grNumber: '00123',
  status: 0,
  submissionStatusLabel: 'Not Submitted',
  evaluationStatus: 'Draft',
  marks: null,
};

describe('Evaluation submission controls', () => {
  it('keeps the average unavailable until at least one actual mark is recorded', () => {
    expect(getEvaluationSummary([{ marks: null }, { marks: '' }, {}]).averageMarks).toBeNull();
    expect(getEvaluationSummary([{}]).totalMarks).toBeNull();
  });

  it('includes an actual zero score while excluding missing marks from the average', () => {
    expect(getEvaluationSummary([{ marks: 0 }, { marks: 10 }, { marks: null }]).averageMarks).toBe(
      5
    );
  });
  it('filters the displayed submission status using the numeric domain status', () => {
    const filters = [
      { column: 'submissionStatusLabel', type: 'equals', value: 0, valueType: 'enum' },
    ];
    expect(matchesTableRowFilters(row, filters, columns)).toBe(true);
    expect(matchesTableRowFilters({ ...row, status: 1 }, filters, columns)).toBe(false);
  });

  it('filters the same evaluation status that is shown when feedback has been recorded', () => {
    const filters = [
      { column: 'evaluationStatus', type: 'equals', value: 'Reviewed', valueType: 'enum' },
    ];
    expect(matchesTableRowFilters({ ...row, feedback: 'Good work' }, filters, columns)).toBe(true);
    expect(
      matchesTableRowFilters({ ...row, evaluationStatus: 'Not Started' }, filters, columns)
    ).toBe(false);
  });

  it('finds a student by GR number while preserving leading zeros', () => {
    expect(
      matchesTableRowFilters(
        row,
        [{ column: 'studentName', type: 'contains', value: '00123', valueType: 'string' }],
        columns
      )
    ).toBe(true);
  });

  it('opens feedback with the keyboard for the intended student', async () => {
    const onEdit = vi.fn();
    render(
      <EvaluationFeedbackCell
        row={row}
        canAdd
        taskSubmissionType={2}
        onView={vi.fn()}
        onEdit={onEdit}
      />
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add feedback for Student One' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledWith(row);
    cleanup();
  });

  it('keeps unsubmitted online work unavailable for evaluation', () => {
    render(
      <EvaluationFeedbackCell
        row={row}
        canAdd
        taskSubmissionType={0}
        onView={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('No submission')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    cleanup();
  });
});
