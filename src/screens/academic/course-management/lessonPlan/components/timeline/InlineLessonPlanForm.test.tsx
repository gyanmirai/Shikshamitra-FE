import dayjs from 'dayjs';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { InlineLessonPlanForm } from './InlineLessonPlanForm';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock(
  'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api',
  () => ({
    useGetChaptersByStandardQuery: () => ({
      data: [{ id: 'chapter-1', chapterName: 'Fractions' }],
      isLoading: false,
    }),
  })
);

vi.mock('../../hooks/use-lesson-plan-completion', () => ({
  useLessonPlanCompletion: (_open: boolean, _context: unknown, target: number) => ({
    minimum: 10,
    target: Math.max(10, target),
    ready: true,
    loading: false,
    error: '',
    retry: vi.fn(),
  }),
}));

const context = {
  academicYearId: 'year-1',
  teacherId: 'teacher-1',
  teacherName: 'Teacher One',
  timetableSlotId: 'slot-1',
  periodName: 'Period 1',
  standardId: 'standard-1',
  standardName: 'Grade 1',
  divisionId: 'division-a',
  divisionName: 'A',
  subjectId: 'subject-1',
  subjectName: 'Mathematics',
};

const renderForm = (onSave = vi.fn(), onCancel = vi.fn()) => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <InlineLessonPlanForm
        context={context}
        selectedDate={dayjs('2026-09-24')}
        lessonPlans={[]}
        onCancel={onCancel}
        onSave={onSave}
      />
    </ThemeProvider>
  );
  return { onSave, onCancel };
};

describe('InlineLessonPlanForm', () => {
  describe('when required fields are empty', () => {
    it('shows field-level validation and does not save', async () => {
      const { onSave } = renderForm();

      fireEvent.click(screen.getByRole('button', { name: 'Submit lesson plan' }));

      expect(await screen.findAllByText('Chapter is required.')).not.toHaveLength(0);
      expect(screen.getByText('Topic is required.')).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('when chapter and topic are valid', () => {
    it('submits this card for approval and closes the inline form', async () => {
      const { onSave, onCancel } = renderForm(vi.fn().mockResolvedValue(undefined));

      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Chapter *' }));
      fireEvent.click(await screen.findByRole('option', { name: 'Fractions' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Topic *' }), {
        target: { value: 'Addition of fractions' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Submit lesson plan' }));

      await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          chapterId: 'chapter-1',
          topic: 'Addition of fractions',
          timetableSlotId: 'slot-1',
          plannedCompletionPercentage: 10,
        }),
        true
      );
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('keeps the form open when submission fails', async () => {
      const { onSave, onCancel } = renderForm(vi.fn().mockRejectedValue(new Error('Submission failed')));

      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Chapter *' }));
      fireEvent.click(await screen.findByRole('option', { name: 'Fractions' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Topic *' }), {
        target: { value: 'Addition of fractions' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Submit lesson plan' }));

      await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.any(Object), true));
      expect(await screen.findByRole('alert')).toHaveTextContent('Submission failed');
      expect(onCancel).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox', { name: 'Topic *' })).toHaveValue('Addition of fractions');
    });
  });
});
