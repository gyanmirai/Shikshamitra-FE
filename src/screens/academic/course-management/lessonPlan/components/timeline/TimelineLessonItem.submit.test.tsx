import dayjs from 'dayjs';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { TimelineLessonItem } from './TimelineLessonItem';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('TimelineLessonItem resubmission', () => {
  it('blocks direct submission while requested changes remain unaddressed', () => {
    const onSubmitPlan = vi.fn();
    const theme = createTheme(defaultSettings);

    render(
      <ThemeProvider theme={theme}>
        <TimelineLessonItem
          slot={{
            timetableSlotId: 'slot-5',
            periodName: 'Period 5',
            startTime: '09:00 AM',
            endTime: '09:30 AM',
            standardName: 'Class 12',
            divisionName: 'A',
            subjectName: 'Core Mathematics',
            lessonPlan: {
              id: 'plan-4',
              status: 'NeedsChanges',
              topic: 'Topic on Tuesday',
              chapterName: 'Intro to Nums CORE',
              reviewRemarks: 'Do it some other way.',
              reviewedByName: 'Academic Admin',
            },
          }}
          selectedDate={dayjs('2026-09-16')}
          onAddLesson={vi.fn()}
          onEditLesson={vi.fn()}
          onViewDetails={vi.fn()}
          onSubmitDiary={vi.fn()}
          onSubmitPlan={onSubmitPlan}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Academic Admin requested:')).toBeInTheDocument();
    expect(screen.queryByText(/HOD requested/i)).not.toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
    fireEvent.click(submitButton);
    expect(onSubmitPlan).not.toHaveBeenCalled();
  });
});
