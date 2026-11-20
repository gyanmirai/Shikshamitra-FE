import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import LessonDiaryDetailsDrawer from './LessonDiaryDetailsDrawer';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const followUp = vi.hoisted(() => ({
  action: vi.fn(),
  recipients: vi.fn(),
  context: vi.fn(),
}));

vi.mock('src/redux/academic-notifications/manual-api', () => ({
  useDiaryFollowUpRecipientsQuery: followUp.recipients,
}));

vi.mock('src/components/academic-notification-action', () => ({
  AcademicNotificationAction: followUp.action,
  useAcademicNotificationActionContext: followUp.context,
}));

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

  it('previews the submitted diary for the exact staff member selected by the user', () => {
    const id = '129d243c-f785-4d08-b4e1-6d76b847dfd1';
    const context = {
      identity: { userCacheKey: 'operator', tenantCacheKey: 'school' },
      source: { sourceId: id, eventKey: 'Academic.Diary.FollowUpRequested', sourceType: 'Academic.Diary' },
    };
    const teacher = { kind: 'AssignedTeacher', userId: 'teacher', employeeId: 'employee' };
    const reviewer = { kind: 'ConfiguredReviewer', userId: 'reviewer', employeeId: 'reviewer-employee' };
    followUp.context.mockReturnValue(context);
    followUp.recipients.mockReturnValue({ currentData: [teacher, reviewer] });
    followUp.action.mockReturnValue(null);
    const { rerender } = render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LessonDiaryDetailsDrawer open plan={plan} diary={{ ...diary, id }} onClose={vi.fn()} />
      </ThemeProvider>
    );

    expect(followUp.context).toHaveBeenCalledWith(context.source.eventKey, id);
    expect(followUp.action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Notify teacher' }));
    expect(followUp.action.mock.lastCall?.[0]).toMatchObject({
      context, selectedRecipients: [teacher],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Notify reviewer' }));
    expect(followUp.action.mock.lastCall?.[0]).toMatchObject({
      context, selectedRecipients: [reviewer],
    });

    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LessonDiaryDetailsDrawer open plan={plan} diary={{ ...diary, id, diaryStatus: 'Draft' }} onClose={vi.fn()} />
      </ThemeProvider>
    );
    expect(screen.queryByRole('button', { name: 'Notify teacher' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Notify reviewer' })).not.toBeInTheDocument();
  });
});
