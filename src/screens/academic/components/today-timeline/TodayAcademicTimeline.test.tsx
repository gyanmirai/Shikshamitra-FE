import { render } from '@testing-library/react';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { useGetLessonPlanTimelineQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import { TodayAcademicTimeline } from './TodayAcademicTimeline';

vi.mock('src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api', () => ({
  useGetLessonPlanTimelineQuery: vi.fn(() => ({
    data: { slots: [] },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

it('keeps the timeline query key stable across rerenders and clock updates', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-28T12:00:00+05:30'));

  const theme = createTheme(defaultSettings);
  const { rerender } = render(<TodayAcademicTimeline />, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
  });
  const firstArg = vi.mocked(useGetLessonPlanTimelineQuery).mock.calls[0][0];
  const firstDate = typeof firstArg === 'object' ? firstArg.date : undefined;
  expect(firstDate).toBeDefined();

  vi.setSystemTime(new Date('2026-09-28T12:00:05+05:30'));
  rerender(<TodayAcademicTimeline contextLabel="Class 10" />);

  const dates = vi
    .mocked(useGetLessonPlanTimelineQuery)
    .mock.calls.map(([params]) => (typeof params === 'object' ? params.date : undefined));
  expect(dates).toEqual([firstDate, firstDate]);
});
