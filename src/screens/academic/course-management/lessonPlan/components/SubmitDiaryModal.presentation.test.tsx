import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import globalStateReducer from 'src/redux/globalState/globalSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import SubmitDiaryModal from './SubmitDiaryModal';

import type { LessonPlanRow } from '../lessonPlanData';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const plan: LessonPlanRow = {
  id: 'lesson-one',
  academicYear: '2026-2027',
  teacherId: 'teacher-one',
  teacherName: 'Teacher One',
  classId: 'lkg',
  className: 'LKG',
  divisionId: 'division-a',
  divisionName: 'A',
  subjectId: 'hindi',
  subjectName: 'Hindi',
  chapterId: 'chapter-one',
  chapterName: 'Swar Varnamala Recognition',
  plannedDate: '2026-09-23',
  periodId: 'period-six',
  period: 'Period 6',
  plannedTime: '03:30 PM',
  topic: 'Recognise Hindi vowels',
  learningObjective: 'Recognise and name vowels',
  teachingMethod: 'ExplanationBoardWork',
  plannedCompletionPercentage: 100,
  resourcesRequired: '',
  planStatus: 'Approved',
  diaryStatus: 'NotSubmitted',
  approvalStatus: 'Approved',
  actualCompletionPercentage: 0,
  existingChapterProgress: 0,
  source: 'Manual',
  isAiGenerated: false,
  executionStatus: 'Planned',
  status: 'Approved',
  reviewStatus: 'Approved',
};

function renderModal() {
  const store = configureStore({
    reducer: {
      globalState: globalStateReducer,
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SubmitDiaryModal open plan={plan} onClose={vi.fn()} onSave={vi.fn()} />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

describe('SubmitDiaryModal presentation', () => {
  it('shows neutral lesson context and only the final submit action', () => {
    renderModal();

    const context = screen.getByLabelText('Lesson information');
    expect(within(context).getByText('LKG-A')).toBeVisible();
    expect(within(context).getByText('Hindi')).toBeVisible();
    expect(within(context).getByText('Swar Varnamala Recognition')).toBeVisible();
    expect(within(context).getByText('Recognise Hindi vowels')).toBeVisible();
    expect(within(context).getByText('100%')).toBeVisible();

    expect(screen.queryByText('Needs Revision')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Draft' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  it('exposes the diary steps as accessible tabs', () => {
    renderModal();

    expect(screen.getByRole('tab', { name: /Teaching/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: /Reflection/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('tab', { name: /Evidence/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });
});
