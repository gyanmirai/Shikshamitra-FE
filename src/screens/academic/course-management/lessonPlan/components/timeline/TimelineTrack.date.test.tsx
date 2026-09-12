import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { loadIcons, _api as iconifyApi } from '@iconify/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { TimelineTrack } from './TimelineTrack';
import { reconcileTimelineSlots } from '../../reconcileTimelineSlots';

describe('daily timeline date navigation', () => {
  it('exposes a future plan and Record Diary only on its planned date', async () => {
    iconifyApi.setFetch((...args) => fetch(...args));
    mswServer.use(
      http.get('https://api.iconify.design/:collection', ({ request, params }) =>
        HttpResponse.json({
          prefix: String(params.collection).replace('.json', ''),
          icons: {},
          not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
        })
      )
    );
    // Finish icon requests before mounting so teardown cannot abort a queued
    // CDN request after the date-navigation assertions complete.
    await new Promise<void>((resolve) => {
      loadIcons(
        [
          'mdi:plus',
          'solar:eye-bold',
          'solar:pen-bold',
          'solar:book-bookmark-bold',
          'solar:notebook-bookmark-bold',
          'solar:stars-minimalistic-bold',
        ],
        (_loaded, _missing, pending) => {
          if (pending.length === 0) resolve();
        }
      );
    });
    const futurePlan = {
      id: 'future-plan',
      teacherId: 'teacher-1',
      plannedDate: dayjs('2026-09-09').toISOString(),
      topic: 'Topic two',
      chapterName: 'Core Maths ONE',
      plannedCompletionPercentage: 40,
      status: 'Approved',
    };
    // Retain an intentionally stale API attachment to verify that navigation
    // cannot expose its diary action on either neighboring day.
    const slots = [
      {
        timetableSlotId: 'slot-4',
        subjectName: 'Core Mathematics',
        standardName: 'Class 12',
        divisionName: 'B',
        periodName: 'Period 4',
        startTime: '08:30 AM',
        endTime: '09:00 AM',
        lessonPlan: futurePlan,
      },
      { timetableSlotId: 'slot-5', subjectName: 'English', lessonPlan: null },
    ];
    const onSubmitDiary = vi.fn();
    const onViewDetails = vi.fn();
    const theme = createTheme(defaultSettings);
    const timeline = (date: string) => (
      <ThemeProvider theme={theme}>
        <TimelineTrack
          slots={reconcileTimelineSlots(slots, [], date, 'teacher-1')}
          selectedDate={dayjs(date)}
          onAddLesson={vi.fn()}
          onEditLesson={vi.fn()}
          onViewDetails={onViewDetails}
          onSubmitDiary={onSubmitDiary}
          onSubmitPlan={vi.fn()}
        />
      </ThemeProvider>
    );
    const { rerender, unmount } = render(timeline('2026-09-08'));
    expect(screen.queryByText('Topic two')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Record Diary' })).not.toBeInTheDocument();
    expect(screen.getByText('No lesson plan assigned to this slot')).toBeInTheDocument();

    rerender(timeline('2026-09-09'));
    expect(screen.getByText('Topic two')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(onViewDetails).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        period: 'Period 4',
        plannedTime: '08:30 AM - 09:00 AM',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Record Diary' }));
    expect(onSubmitDiary).toHaveBeenCalledExactlyOnceWith(expect.objectContaining(futurePlan));

    ['2026-09-08', '2026-09-10'].forEach((date) => {
      rerender(timeline(date));
      expect(screen.queryByText('Topic two')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Record Diary' })).not.toBeInTheDocument();
    });
    unmount();
  });
});
