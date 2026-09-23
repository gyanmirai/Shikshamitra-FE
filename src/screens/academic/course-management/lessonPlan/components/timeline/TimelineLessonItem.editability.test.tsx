import dayjs from 'dayjs';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { TimelineLessonItem } from './TimelineLessonItem';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const renderPlan = (status: 'Approved' | 'Rejected') => {
  const onAddLesson = vi.fn();
  const onEditLesson = vi.fn();

  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <TimelineLessonItem
        slot={{
          timetableSlotId: 'slot-5',
          periodName: 'Period 5',
          startTime: '09:00 AM',
          endTime: '09:30 AM',
          standardId: 'standard-12',
          standardName: 'Class 12',
          divisionId: 'division-a',
          divisionName: 'A',
          subjectId: 'maths',
          subjectName: 'Mathematics',
          lessonPlan: {
            id: 'plan-4',
            status,
            topic: 'Fractions',
            chapterName: 'Numbers',
          },
        }}
        selectedDate={dayjs('2030-09-16')}
        onAddLesson={onAddLesson}
        onEditLesson={onEditLesson}
        onViewDetails={vi.fn()}
        onSubmitDiary={vi.fn()}
        onSubmitPlan={vi.fn()}
      />
    </ThemeProvider>
  );

  return { onAddLesson, onEditLesson };
};

describe('TimelineLessonItem editability', () => {
  it('does not expose Edit for an approved plan', () => {
    const { onEditLesson } = renderPlan('Approved');

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    expect(onEditLesson).not.toHaveBeenCalled();
  });

  it('replaces Edit with Create New Plan for a rejected plan', () => {
    const { onAddLesson, onEditLesson } = renderPlan('Rejected');

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create New Plan' }));
    expect(onEditLesson).not.toHaveBeenCalled();
    expect(onAddLesson).toHaveBeenCalledWith(
      dayjs('2030-09-16'),
      expect.objectContaining({
        timetableSlotId: 'slot-5',
        standardId: 'standard-12',
        divisionId: 'division-a',
        subjectId: 'maths',
      })
    );
  });
});
