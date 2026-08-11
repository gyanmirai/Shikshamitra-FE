import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ApplicantExamSummary } from './applicant-exam-summary';

const { refetch } = vi.hoisted(() => ({ refetch: vi.fn() }));

vi.mock('src/redux/student/admissions-crm/communication-exams-events-api', () => ({
  useGetAdmissionCrmEntranceExamByLeadQuery: () => ({
    data: undefined,
    isLoading: false,
    refetch,
  }),
  useDecideAdmissionCrmEligibilityMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('react-redux', () => ({
  useSelector: () => [],
}));

describe('Applicant exam summary', () => {
  it('schedules an unscheduled exam without leaving the applicant workspace', () => {
    const onScheduleExam = vi.fn();

    render(
      <ApplicantExamSummary
        leadId="lead-1"
        academicYearId="year-1"
        onScheduleExam={onScheduleExam}
      />
    );

    expect(screen.getByText('Entrance exam is not scheduled')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Schedule Entrance Exam' }));
    expect(onScheduleExam).toHaveBeenCalledOnce();
    expect(screen.queryByRole('link', { name: 'Open Assessments' })).not.toBeInTheDocument();
  });
});
