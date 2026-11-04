import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AssignGrade from './assignMarksForm';

import type { IAssignGradeProps } from '../../homeworkCreation/type';
import type { AssignmentFeedbackFormProps } from './hooks/useAssignmentFeedbackForm';

const { updateFeedback } = vi.hoisted(() => ({ updateFeedback: vi.fn() }));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [updateFeedback, { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const baseProps: IAssignGradeProps = {
  isEdit: false,
  assignmentId: 'assignment-1',
  data: {
    id: 'submission-1',
    studentId: 'student-1',
    homeworkId: '',
    studentName: 'Student with a long name',
    rollNumber: '1',
    assignments: '',
    subject: '',
    marks: 0,
    totalMarks: 100,
    feedback: '',
    weightedAverage: '',
    status: '1',
    submissionDate: null,
    submissionType: '2',
  },
  onClose: vi.fn(),
  onNext: vi.fn(),
  onPrevious: vi.fn(),
  hasNext: true,
  hasPrevious: true,
};

function renderForm(props: AssignmentFeedbackFormProps = baseProps) {
  const store = configureStore({
    reducer: {
      globalState: () => ({ currentMedium: { id: 'medium-1' } }),
      confirmPopup: () => ({ isChanges: false }),
    },
  });
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Provider store={store}>
        <AssignGrade {...props} />
      </Provider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  updateFeedback.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

describe('assignment feedback dialog', () => {
  it('provides named section help and honest physical-submission context', () => {
    renderForm();
    [
      'Student Details',
      'Student Submission',
      'Student Submission Attachments',
      'Evaluation & Marks',
      'Feedback',
    ].forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `${title} information` })).toBeInTheDocument();
    });
    expect(screen.getByText('Submission is handled in person.')).toBeInTheDocument();
    expect(screen.queryByText('Evaluated physically in classroom.')).not.toBeInTheDocument();
    expect(screen.getByText('0 / 100')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('keeps attachment expansion and read-only navigation usable without writes', () => {
    renderForm();
    const collapse = screen.getByRole('button', {
      name: 'Collapse Student Submission Attachments',
    });
    fireEvent.click(collapse);
    expect(
      screen.getByRole('button', { name: 'Expand Student Submission Attachments' })
    ).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(baseProps.onNext).toHaveBeenCalledOnce();
    expect(baseProps.onPrevious).toHaveBeenCalledOnce();
    expect(baseProps.onClose).toHaveBeenCalledWith(null, false);
    expect(updateFeedback).not.toHaveBeenCalled();
  });

  it('labels editable feedback and preserves the save payload while locking conflicting actions', async () => {
    let finishSave!: () => void;
    updateFeedback.mockReturnValue({
      unwrap: () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    });
    const onBusyChange = vi.fn();
    const { container } = renderForm({ ...baseProps, isEdit: true, onBusyChange });
    const feedback = screen.getByRole('textbox', { name: 'Feedback' });
    fireEvent.change(feedback, { target: { value: 'Review question 2.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(updateFeedback).toHaveBeenCalledOnce());
    ['Previous', 'Next', 'Cancel', 'Quick templates'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    });
    expect(feedback).toBeDisabled();
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
    fireEvent.submit(container.querySelector('form')!);
    expect(updateFeedback).toHaveBeenCalledOnce();
    expect(updateFeedback).toHaveBeenCalledWith({
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      academicMediumId: 'medium-1',
      body: { marks: 0, totalMarks: 100, feedback: 'Review question 2.', status: 4 },
    });
    finishSave();
    await waitFor(() => expect(baseProps.onClose).toHaveBeenCalledWith(null, true));
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
    expect(updateFeedback).toHaveBeenCalledOnce();
  });

  it('distinguishes unrecorded marks from a recorded zero', () => {
    renderForm({ ...baseProps, data: { ...baseProps.data!, marks: null as unknown as number } });
    expect(screen.getByText('Not recorded / 100')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('uses quick templates and saves feedback-only tasks without marks', async () => {
    renderForm({ ...baseProps, isEdit: true, requiresMarks: false });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quick templates' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Well done! Keep up the great work.' }));
    expect(screen.getByRole('textbox', { name: 'Feedback' })).toHaveValue(
      'Well done! Keep up the great work.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit & next' }));
    await waitFor(() => expect(baseProps.onNext).toHaveBeenCalledOnce());
    expect(updateFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          marks: null,
          totalMarks: null,
          feedback: 'Well done! Keep up the great work.',
          status: 4,
        },
      })
    );
    expect(baseProps.onClose).not.toHaveBeenCalled();
  });

  it('retains the draft and unlocks controls after a failed save', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    updateFeedback.mockReturnValue({ unwrap: () => Promise.reject(new Error('Unavailable')) });
    try {
      renderForm({ ...baseProps, isEdit: true });
      fireEvent.change(screen.getByRole('textbox', { name: 'Feedback' }), {
        target: { value: 'Keep this draft.' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(consoleError).toHaveBeenCalled());
      expect(screen.getByRole('textbox', { name: 'Feedback' })).toHaveValue('Keep this draft.');
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
      expect(baseProps.onClose).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('submits without advancing when Enter is pressed in obtained marks', async () => {
    const user = userEvent.setup();
    renderForm({ ...baseProps, isEdit: true });
    const marks = screen.getByRole('spinbutton', { name: 'Obtained marks' });
    await user.click(marks);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(baseProps.onClose).toHaveBeenCalledWith(null, true));
    expect(updateFeedback).toHaveBeenCalledOnce();
    expect(baseProps.onNext).not.toHaveBeenCalled();
  });
});
