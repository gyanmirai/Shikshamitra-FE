import { vi, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AssessmentPanelActions } from './assessment-panel-actions';

vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => ({
    view: true,
    manageSessions: true,
    book: true,
    attendance: true,
    results: true,
    review: true,
    waive: true,
  }),
}));

it('completes the assessment without forwarding the click event as workflow data', async () => {
  const onComplete = vi.fn();

  render(
    <AssessmentPanelActions
      assessment={{
        ...assessmentResponse,
        policy: DEFAULT_ASSESSMENT_POLICY,
        canComplete: true,
        canBook: false,
        canRecordAttendance: false,
        canRecordResult: false,
        canReview: false,
        canRetake: false,
        canCancel: false,
        canWaive: false,
      }}
      disabled={false}
      canAdvance
      onAction={vi.fn()}
      onComplete={onComplete}
    />
  );

  await userEvent.click(screen.getByRole('button', { name: 'Complete assessment step' }));

  expect(onComplete).toHaveBeenCalledWith();
});
