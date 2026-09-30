import type { ReactNode } from 'react';
import type { RubricEvaluationPanelRef } from 'src/screens/academic/homework-assignment-management/marksAndFeedback/rubricEvaluationPanel';

import { createRef } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AssignmentRubricEvaluationContent from './assignmentRubricEvaluationContent';

import type { TStudentGrade } from '../../homeworkCreation/type';

vi.mock(
  'src/screens/academic/homework-assignment-management/marksAndFeedback/rubricEvaluationPanel',
  () => ({
    default: ({
      studentRow,
      compactLayout,
    }: {
      studentRow: TStudentGrade;
      compactLayout: boolean;
    }) => (
      <div>
        Rubric for {studentRow.studentName}; compact: {String(compactLayout)}
      </div>
    ),
  })
);
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/iconify', () => ({
  Iconify: () => <span />,
}));

const student = {
  id: 'submission-1',
  studentId: 'student-1',
  studentName: 'Shanaya Dharmil Dharmil',
  rollNumber: '1',
  grNumber: '10028',
  status: '1',
} as TStudentGrade & { grNumber: string };

const props = {
  student,
  standardId: 'standard-1',
  subjectId: 'subject-1',
  assignmentId: 'assignment-1',
  assignmentTitle: 'First Chapter Assignment',
  submissionType: 2,
  feedback: '',
  onFeedbackChange: vi.fn(),
  rubricRef: createRef<RubricEvaluationPanelRef>(),
  isEditMode: true,
  isSaving: false,
  hasPrevious: false,
  hasNext: true,
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe('AssignmentRubricEvaluationContent', () => {
  it('shows student identity and sequential controls in the rubric dialog', () => {
    render(<AssignmentRubricEvaluationContent {...props} />);

    expect(screen.getByText('Assignment')).toBeInTheDocument();
    expect(screen.getByText('First Chapter Assignment')).toBeInTheDocument();
    expect(screen.getByText('In-Person')).toBeInTheDocument();
    expect(screen.getByText(/compact: true/)).toBeInTheDocument();
    expect(screen.getByText('Teacher Feedback & Remarks')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Feedback (optional)' })).toBeInTheDocument();
    expect(screen.getByText(student.studentName)).toBeInTheDocument();
    expect(screen.getByText(/Roll No: 1.*GR No: 10028/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Submit & Next' }));
    expect(props.onSubmit).toHaveBeenCalledWith(true);
  });

  it('uses the expanded rubric layout for a read-only view', () => {
    render(
      <AssignmentRubricEvaluationContent
        {...props}
        feedback="Helpful feedback"
        isEditMode={false}
      />
    );
    expect(screen.getByText(/compact: false/)).toBeInTheDocument();
    expect(screen.getByText('Helpful feedback')).toBeInTheDocument();
  });

  it('updates the teacher feedback field without submitting', () => {
    const onFeedbackChange = vi.fn();
    render(<AssignmentRubricEvaluationContent {...props} onFeedbackChange={onFeedbackChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Feedback (optional)' }), {
      target: { value: 'Please revise the first answer.' },
    });
    expect(onFeedbackChange).toHaveBeenCalledWith('Please revise the first answer.');
  });

  it('disables Submit & Next for the last student', () => {
    render(<AssignmentRubricEvaluationContent {...props} hasNext={false} />);
    expect(screen.getByRole('button', { name: 'Submit & Next' })).toBeDisabled();
  });
});
