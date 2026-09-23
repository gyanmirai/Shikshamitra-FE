import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import LessonDiaryDetailsDrawer from './LessonDiaryDetailsDrawer';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const plan = {
  id: 'plan-one',
  subjectName: 'Hindi',
  chapterName: 'Vyanjan Varnamala Practice',
  planStatus: 'Approved',
  status: 'Approved',
  plannedDate: '2026-09-23',
  period: 'Period 6',
  plannedTime: '03:30 PM - 04:30 PM',
  className: 'LKG',
  divisionName: 'A',
  teacherName: 'Jeet Ram',
  topic: 'Vyanjan practice',
  learningObjective: 'Recognize common consonants',
  teachingMethod: 'ExplanationBoardWork',
  resourcesRequired: 'Board and worksheets',
  plannedCompletionPercentage: 60,
} as unknown as LessonPlanRow;

const diary = {
  diaryStatus: 'Submitted',
  actualDate: '2026-09-23',
  classConducted: true,
  actualTopicCovered: 'Vyanjan practice',
  classUnderstandingLevel: 'High',
  studentEngagementLevel: 'Medium',
  actualCompletionPercentage: 55,
} as unknown as TeacherDiaryRow;

describe('LessonDiaryDetailsDrawer presentation', () => {
  it('uses semantic statuses and structured detail cards', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LessonDiaryDetailsDrawer open plan={plan} diary={diary} onClose={vi.fn()} />
      </ThemeProvider>
    );

    expect(screen.getByRole('heading', { name: 'Lesson & Diary Details' })).toBeVisible();
    expect(screen.getByText('Approved')).toBeVisible();
    expect(screen.getByText('Submitted')).toBeVisible();
    expect(screen.queryByText('Plan: Approved')).not.toBeInTheDocument();
    expect(screen.queryByText('Diary: Submitted')).not.toBeInTheDocument();
    expect(screen.getByText('Plan Details')).toBeVisible();
    expect(screen.getByText('Schedule, curriculum and preparation information')).toBeVisible();
    expect(screen.getByText('Core Execution Details')).toBeVisible();
    expect(screen.getByText('What was delivered in the classroom')).toBeVisible();
    expect(screen.getByText('Classroom Metrics & Engagement')).toBeVisible();
    expect(screen.getByRole('group', { name: 'Date' })).toHaveTextContent('23-09-2026');
    expect(screen.getByRole('group', { name: 'Teacher' })).toHaveTextContent('Jeet Ram');
    expect(screen.getByRole('group', { name: 'Planned Completion' })).toHaveTextContent('60%');
    expect(screen.getByRole('button', { name: 'Close lesson and diary details' })).toBeVisible();
  });
});
